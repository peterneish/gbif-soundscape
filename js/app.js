var localities = [];
var active_locality = {};
var map;

map = new L.Map('map');

// create the tile layer with correct attribution
var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
var osm = new L.TileLayer(osmUrl, {attribution: osmAttrib});		

// start the map in South-East England
// map.setView(new L.LatLng(0, 0),1);
map.fitWorld().zoomIn();
map.addLayer(osm);


$.getJSON('./data/sounds.json', function( data){
       
   $.each( data, function(key, val){
      localities.push(val);
      console.log(val);
   }) 
   addControls();
});
    
    

function addControls(){

    $.each(localities, function(i,l){
		console.log(l);
        $('#info').append('<p>'+l.locality+'</p>');
    });
}
