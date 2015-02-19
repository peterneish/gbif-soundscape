var localities = [];
var active_locality = {};
var map;
var localityLayer = new L.featureGroup();
var sounds = [];


map = new L.Map('map');

var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
var osm = new L.TileLayer(osmUrl, {attribution: osmAttrib});		

map.setView([0,0],1);
map.addLayer(osm);

// extend Marker so that we can track the locality id
customMarker = L.Marker.extend({
	options: { key: 0 }
});	

// set up the template for the soundControl
var template = Handlebars.compile($("#taxon-template").html());



$.getJSON('./data/sounds.json', function( data){
       
   $.each( data, function(key, val){
      localities[key] = val;
	  //add to layer
	  var bounds = [[val.lat[0], val.lon[0]],[val.lat[1], val.lon[1]]];
	  localities[key].bounds = bounds;
	  
	  var rectangle = new L.rectangle(bounds, {color: "#ff7800", weight: 1});
	  var centre = rectangle.getBounds().getCenter();
	  
	  var marker = new customMarker(centre, {key: key})
			.bindPopup(val.locality)
			.on('click', markerClick)
			.addTo(map);
	  
	  localityLayer.addLayer(rectangle); 
   }) 
   
   localityLayer.addTo(map);
   
   map.fitBounds(localityLayer.getBounds());
   

});
  
function markerClick(m){
	//console.log(localities[m.target.options.key].locality);
	if(m.hasOwnProperty('target') 
		&& m.target.hasOwnProperty('options') 
	    && m.target.options.hasOwnProperty('key')){
			locality = localities[m.target.options.key]; 
			map.fitBounds(locality.bounds);
			updateInfo(locality);
			updateSounds(locality);
		}			
}	

function updateInfo(l){
	console.log(l);
	var bird_number = l.birds.length;
	var frog_number = l.frogs.length;
	$('#info').html(
		"<h1>" + l.locality + "</h1>"
		+ '<p>Bird audio files: ' + bird_number + '</p>'
		+ '<p>Frog audio files: ' + frog_number + '</p>'
	);
}

function updateSounds(l){
	
	$.each(l.birds, function (i, bird){
		$("#birds div.controls").append(makeSoundControl(bird));
	});

	$.each(l.frogs, function (i, frog){
		$("#frogs div.controls").append(makeSoundControl(frog));
	});

	// layout using isotope
	$('div.controls').imagesLoaded( function(){
		$('div.controls').isotope({
				itemSelector: '.item',
				layoutMode: 'masonry'				
		});
	});
	
	// now bind the sound events
	$.each(sounds, function(i, s){

		 $('button#'+ i ).on('click', function(){
			if($(this).find('span').hasClass('glyphicon-pause')){
				sounds[i].stop().play();
			}
			else{
				sounds[i].stop();
			}	
			
			$(this).find('span').toggleClass('glyphicon-pause glyphicon-play');
		 });
		 
	});
}

function makeSoundControl(t){
	
	// make a new sound
	var sound = new Howl({
		urls: [t.audio],
		loop: false
	});
	
	soundID = sounds.push(sound) - 1; // save the actual index
		
	var context = {src: t.image, name: t.name, id: soundID }; 
	
	return template(context);
}

function updateTaxa(t){
}
