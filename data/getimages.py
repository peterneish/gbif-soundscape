import json
import urllib
import time
import os.path
import urlparse

downloader = urllib.URLopener()

limit = 5000
num = 0
start = 500
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
        
            if num >= start:
                 downloader.retrieve(i['image'], 'images/'+newfile)
            i['image'] = "cache/images/" + str(num)+extension
            i['audio'] = "cache/sounds/" + str(num)+audioextension
        except :
            print "*** Error "+str(num) + " imagefile: "  + str(i['image'])
            print "name: " + str(i['name'])
        num += 1
        #time.sleep(2)
    with open('locality_data_cached.json', 'w') as outfile:
        json.dump(d, outfile)

