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
	if(locality){
		map.fitBounds(locality.bounds);
		updateSounds(locality);
		updateInfo(locality);
	}
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
								   
	// bind events
	$(".btn .play").on('click', function(e){
		$(this).addClass("active").siblings().removeClass("active");
	});
	
	$("#playbirds").on('click', function(e){
		play("bird");		
	});
	
	$("#playfrogs").on('click', function(e){
		play("frog");		
	});
	
	$("#playall").on('click', function(e){
		play("item");		
	});
	
	$("#playrandom").on('click', function(e){
		pauseAll();
		$('audio').each(function(a){
			if(Math.random() < 0.5){
				this.play();
			}
			else{
				this.pause();
			}
			$(this).parents('.item').toggleClass("playing");
		});		
	});
	
	$("#playpause").on('click', function(){
		playPause();
	});	
	
	// and this is to handle manual changes to the native audio controls
	$('audio').on('click', function(){
		if(this.paused == false){
			$(this).parents('.item').addClass('paused');
			$(this).parents('.item').removeClass('playing');
		}
		else{
			$(this).parents('.item').addClass('playing');
			$(this).parents('.item').removeClass('paused');
		}
	});
}

function playOne(i){
	$(i).find('audio')[0].play();
	$(i).find('audio').removeClass('paused');
	$(i).find('audio').addClass('playing');
}

function pauseOne(i){
	$(i).find('audio')[0].pause();
	$(i).find('audio').removeClass('playing');
	$(i).find('audio').addClass('paused');
}

function pauseAll(){
	$('.item').each(function(){
		pauseOne(this);
	});		
}

function playPause(){
	$('.item').each(function(){
		if($(this).hasClass('playing')){
				pauseOne(this);
		}
		else if($(this).hasClass('paused')){
			playOne(this);
		}
	});
}

function play(what){
	
	pauseAll();
	
	$('.'+what + ' audio').each(function(){
			this.play();
			$(this).parents('div.item').toggleClass('playing');
			console.log(this);
			console.log($(this).parents('div.item'));
	});		
}

function updateSounds(l){
	
	$("#sounds div.controls").find(".item").remove();
	
	
	$.each(l.birds, function (i, bird){
		$("#sounds div.controls").append(makeSoundControl("bird", bird));
	});

	$.each(l.frogs, function (i, frog){
		$("#sounds div.controls").append(makeSoundControl("frog", frog));
	});
	
	//$('audio').mediaelementplayer({features: ['playpause', 'volume'], audioWidth: 175, loop: true});
	
	//$('.mejs-container').attr('style', 'height: 30px, width: 100%');

	// layout using isotope
	$('div.controls').imagesLoaded( function(){
		$('div.controls').isotope({
				itemSelector: '.item',
				layoutMode: 'masonry'				
		});
	});
}

function makeSoundControl(tax, t){
	
	var context = {image_src: t.image, name: t.name, vernacular: t.vernacularName, taxon: tax, audio_src: t.audio, audio_credit: "test", image_credit: "test"}; 
	
	return taxon_template(context);
}
