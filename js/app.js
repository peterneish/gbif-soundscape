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
var taxon_template = Handlebars.compile($("#taxon-template").html());
var info_template  = Handlebars.compile($("#info-template").html());




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
	  addMenuItem(key);
	  
   }) 
   
   localityLayer.addTo(map);
   
   map.fitBounds(localityLayer.getBounds());
   

});

function addMenuItem(key){
		
		$("#area_choose")
	   .append('<option value='+key+'>' + localities[key].locality + '</option>')
	   .on('click', function(e){			
			//console.log(e);
			select(e.target.value);
		});
		
}

function select(key){
	locality = localities[key]; 
	map.fitBounds(locality.bounds);
	updateInfo(locality);
	updateSounds(locality);
}
  
function markerClick(m){
	console.log(localities[m.target.options.key].locality);
	if(m.hasOwnProperty('target') 
		&& m.target.hasOwnProperty('options') 
	    && m.target.options.hasOwnProperty('key')){
			select(m.target.options.key); 
	}			
}	

function updateInfo(l){
	var bird_number = l.birds.length;
	var frog_number = l.frogs.length;
	$('#info').html(
		"<h1>" + l.locality + "</h1>"
		+ '<p>Bird audio files: ' + bird_number + '</p>'
		+ '<p>Frog audio files: ' + frog_number + '</p>'
	);
	
	$('#info').html(info_template({title: l.locality, 
								   birdnum: bird_number,
								   frognum: frog_number,
								   allnum: bird_number + frog_number}));
}

function updateSounds(l){
	
	$("#sounds div.controls").find(".item").remove();
	
	
	$.each(l.birds, function (i, bird){
		$("#sounds div.controls").append(makeSoundControl("bird", bird));
	});

	$.each(l.frogs, function (i, frog){
		$("#sounds div.controls").append(makeSoundControl("frog", frog));
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
			if($(this).find('span').hasClass('glyphicon-play')){
				sounds[i].stop().play();
			}
			else{
				sounds[i].stop();
			}	
			
			$(this).find('span').toggleClass('glyphicon-pause glyphicon-play');
		 });
		 
	});
}

function toggleLoop(){
	$.each(sounds, function(i, s){
		if(s.loop){
			s.loop(false);
		}
		else{	s.loop(true);
		}		
	});
}

function makeSoundControl(tax, t){
	
	// make a new sound
	var sound = new Howl({
		urls: [t.audio],
		loop: true
	});
	
	soundID = sounds.push(sound) - 1; // save the actual index
		
	var context = {src: t.image, name: t.name, id: soundID, taxon: tax }; 
	
	return taxon_template(context);
}

function updateTaxa(t){
}

//sets the button state
$(".btn-group > .btn").click(function(){
    $(this).addClass("active").siblings().removeClass("active");
});
