# GBIF Soundscape
soundscapes from GBIF

With the introduction of [sound, images and video](http://gbif.blogspot.com.au/2014/05/multimedia-in-gbif.html) into the GBIF portal and API, we are able to use this facility to reconstruct the "soundscapes" of particular regions by compiling the bird and frog sounds from those regions.

This round 2 entry builds upon our [previous entry](http://devpost.com/software/gbif-soundscape) by incorporating more data and an almost completely re-written user interface. Users can now build their own soundscapes by adding and removing taxa through the site. Users can also generate soundscapes based on location, type of organism (bird or frog) and season (winter or summer).

# Installation
All files are included in the bundle, so either download the [zip file](https://github.com/peterneish/gbif-soundscape/archive/master.zip), or run:

```
git clone https://github.com/peterneish/gbif-soundscape.git
```

to run a local webserver, you can do something like this:
```
python -m SimpleHTTPServer 8000
```
and then visit http:\\localhost:8000 in a web browser.
