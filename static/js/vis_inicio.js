
async function Inicio_app() {
    try {
      await Promise.all([
        loadHydrologies(),
        loadElectricData(),
        loadHydricData()
      ]);
  
      const response = await fetch(CONFIG.URL_VIEW_INICIO);
      if (response.ok) {
        loadAutoView(true, true);
      }
    } catch (error) {
      console.error(error);
    }
  }
  
  Inicio_app();