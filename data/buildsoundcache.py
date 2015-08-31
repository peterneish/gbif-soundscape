import json
import urllib
import time
import os.path

downloader = urllib.URLopener()

limit = 50000
num = 0

with open('locality_sounds.json') as jdata:
    d = json.load(jdata) 
    for i in d["taxa"]:
        print i['audio']
        if num > limit:
            break
        extension = os.path.splitext(i['audio'])[1]
        newfile = str(num)+extension
        downloader.retrieve(i['audio'], 'sounds/'+newfile)
        print newfile
        i['audio'] = newfile
        print i['audio']
        num += 1
        time.sleep(2)
    with open('locality_sounds_cached.json', 'w') as outfile:
        json.dump(d, outfile)

