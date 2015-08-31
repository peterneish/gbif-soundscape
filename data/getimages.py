import json
import urllib
import time
import os.path
import urlparse

downloader = urllib.URLopener()

limit = 5000
num = 0

with open('locality_sounds.json') as jdata:
    d = json.load(jdata) 
    for i in d["taxa"]:
        #print i['image']
        if num > limit:
            break
        try:
            path = urlparse.urlparse(i['image']).path
            extension = os.path.splitext(path)[1]
            audioextension = os.path.splitext(i['audio'])[1]
            newfile = str(num)+extension
        
            downloader.retrieve(i['image'], 'images/'+newfile)
        except :
            print "*** Error "+str(num) + " imagefile: "  + i['image']
            print "name: " + i['name']
        i['image'] = str(num)+extension
        i['audio'] = str(num)+audioextension
        num += 1
        #time.sleep(2)
    with open('locality_data_cached.json', 'w') as outfile:
        json.dump(d, outfile)

