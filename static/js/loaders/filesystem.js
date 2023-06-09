"use strict";

/**
*Modulo de filesystem. Carga automaticamente el fileSystem y contiene operaciones
*para manejo de archivos y carpetas dentro de este.
*/


window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
let fileSystem = {};

/**
*Error handler para los errores de acceso a archivos.
*TODO verdadero manejo de errores.
*/
function fsErrorHandler(e) {
  console.error('Error', e);
}

/**
* Metodo que crea una carpeta en el FolderEntry folder con el nombre name y tras crearla llama afterCreation pasandole el FolderEntry.
*/
fileSystem.createFolder = function(folder,name,afterCreation){
	console.log("Modulo Filesystem: createFolder");
	console.log(folder,name);
	folder.getDirectory(name,{exclusive:true,create:true},afterCreation,fsErrorHandler);
};
/**
* Metodo que cra un archivo en el FolderEntry folder con el nombre name y tras crearla llama afterCreation pasandole el FileEntry.
*/
fileSystem.createFile = function(folder,name,afterCreation){
	folder.getFile(name,{exclusive:true,create:true},afterCreation,fsErrorHandler);
};


/**
* Metodo que escribe en el FileEntry entregado. Entries tiene que ser transformable a blob o un arreglo de
* cosas transformable a blob. afterWrite se llama una vez finalizada la escritura y se le entrega el FileEntry escrito
*/
fileSystem.writeToFile = function(writableFileEntry,entries,afterWrite) {
	// Creo escritor y le paso una funcion sin nombre
	console.log("Atributo Filesystem: writeToFile");
    writableFileEntry.createWriter(function(writer) {
		writer.onerror = fsErrorHandler;
		// Tras realizar una operacion de escritura (borrar el archivo)
		// escribo lo que quiero
		writer.onwrite = function() {
			//una vez escribo llamo al afterWrite
			writer.onwrite = afterWrite;
			//Entries tiene que ser un arreglo, si no lo es lo convierto
			if(!Array.isArray(entries)) entries = [entries];
			//Escribo en el archivo las entries
			writer.write(new Blob(entries, {type: 'text/plain'}));
		};
		//Borro el archivo para sobreescribirlo
		writer.truncate(0);
    }, fsErrorHandler);
};

/**
* Metodo que accede un archivo en la FolderEntry folder con el nombre name.
* Luego llama afterCreation pasandole el FileEntry.
*/
fileSystem.getFile = function(folder,name,handler){
	console.log("pasando por getFile");
	folder.getFile(name,{exclusive:true},handler,fsErrorHandler);
};


/**
* Metodo que accede una carpeta en la FolderEntry folder con el nombre name.
* Luego llama afterCreation pasandole el FolderEntry.
*/
fileSystem.getFolder = function(folder,name,handler){
	console.log("atributo fileSystem: getFolder");
	console.log(folder,name)

	folder.getDirectory(name,{exclusive:true},handler,fsErrorHandler);
};

/**
* Metodo que elimina una carpeta o un archivo.
*/
fileSystem.remove = function(entry,onRemove){
	if(entry.isFile)
		entry.remove(onRemove,fsErrorHandler);
	else if(entry.isDirectory)
		entry.removeRecursively(onRemove,fsErrorHandler);
};


/**
* Metodo que revisa el espacio usado y total y llama afterCheck pasandole el objeto {used: , total: , free: }
*/
fileSystem.checkSpace = function(afterCheck){
	navigator.webkitPersistentStorage.queryUsageAndQuota((used,total) => 
		afterCheck({used: used,total: total,free:total-used}));
};


/**
* Metodo que llama filesHandler pasandole como argumento la lista de elementos contenidos en la carpeta representada por la FolderEntry folder.
*/
fileSystem.ls = function(folder,filesHandler){
	return folder.createReader().readEntries(filesHandler);
};



/**
* Metodo que lee el FileEntry entregado, lo convierte a string y llama a afterRead entregandole
* el resultado de la lectura como parametro
*/
fileSystem.readFromFile = function(readableFileEntry,afterRead) {
	console.log("pasando por readFromFile");
    readableFileEntry.file(function(file) {
      var reader = new FileReader();
      //Creo un reader y le digo que tras leer llame a afterRead con el contenido
      reader.onerror = fsErrorHandler;
      reader.onloadend = e => afterRead(e.target.result);
      //Leo el archivo
      reader.readAsText(file);
    });
};


/**
* Metodo llamado al inicializar el filesystem
*/
function onInitFs (fs) {
	console.log("pasando por onInitFs");
	//Guardo el filesystem y la carpeta root
	fileSystem.fs = fs;
	fileSystem.root = fs.root;
	//metodo oculto que crea una carpeta, creando todas las carpetas necesarias para llegar a ella
	let createFolderRecursively = function(folder,pathArray,folderHandler,index){
		// Si ya cree las carpetas necesarias retorno.
		if(index === pathArray.length){
			folderHandler(folder);
		} else {
			let name = pathArray[index];
			// Lambda que crea las siguientes carpetas dentro de una carpeta
			let lambda = (f) => createFolderRecursively(f,pathArray,folderHandler,index+1);
			// Si existe simplemente llamo al lambda
			folder.getDirectory(name,{exclusive:true},
				lambda,
				// Si no existe creo la carpeta y llamo al lambda
				(e) => folder.getDirectory(name,{exclusive:true,create:true},lambda,console.error)
			);
		}
	};

	fileSystem.createFolderWithPath = function(base_folder,path,folderHandler){
		// Creo una carpeta en el path especificado a partir de base_folder.
		// Se crean las carpetas necesarias para que exista. Ej:
		// Si trato de crear gatos/siameses y la carpeta gatos no existe entonces
		// creo la carpeta gatos y luego la carpeta siameses dentro de ella
		path = path.split("/");
		createFolderRecursively(base_folder,path,folderHandler,0);
	};

	fileSystem.ls(fileSystem.root,function(files) {
		// Busco la carpeta projects y la guardo en mi json de fileSystem
		for(let i=0; i<files.length; i++){
			let file=files[i];
			if(file.isDirectory && file.name === "projects"){
				fileSystem.projects = file;
				break;
			}
		}
		// Si no existia la creo
		if(typeof fileSystem.projects === 'undefined'){
			fileSystem.createFolder(fileSystem.root,"projects",function(dataFolder){
				fileSystem.projects = dataFolder;
				console.log("Carpeta /projects creada");
				onFSReady();
			});
		} else {
			onFSReady();
		}
	});
	
}

/**
* Reviso el espacio disponible. Si es 0 pido memoria, de lo contrario simplemente abro el fileSystem.
*/

const requestQuota = (bytes) => {
	return new Promise((resolve, reject) => {
	  navigator.webkitPersistentStorage.requestQuota(bytes, resolve, reject);
	});
  };
  
  const checkSpace = () => {
	return new Promise((resolve, reject) => {
	  navigator.webkitPersistentStorage.queryUsageAndQuota((usedBytes, grantedBytes) => {
		if (grantedBytes === 0) {
		  reject(new Error("No se pudo obtener el espacio de almacenamiento"));
		} else {
		  resolve({ used: usedBytes, total: grantedBytes });
		}
	  }, reject);
	});
  };
  
  checkSpace().then((result) => {
	let initfs = (bytes) =>
	  window.requestFileSystem(PERSISTENT, bytes, onInitFs, fsErrorHandler);
	if (result.total === 0) {
	  requestQuota(10 * 1024 * 1024 * 1024)
		.then((grantedBytes) => {
		  console.log(
			"Se acaba de crear un sistema de archivo de",
			grantedBytes / (1024 * 1024) / 1024.0,
			"GB"
		  );
		  initfs(grantedBytes);
		})
		.catch(fsErrorHandler);
	} else {
	  console.log(
		"Sistema de archivos ya existe con capacidad de",
		result.total / (1024 * 1024) / 1024.,
		"GB"
	  );
	  initfs(result.total + result.used);
	}
  }).catch(fsErrorHandler);
  


