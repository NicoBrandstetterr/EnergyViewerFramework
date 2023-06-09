import sys, json;

try:
    with open(sys.argv[1], 'r') as f:
        H = json.load(f)

    for available in (H['available']):
        print str(available[0]) + " ",
except Exception:
    print ""
