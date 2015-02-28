var localities = [];
var active_locality = {};
var map;
var localityLayer = new L.featureGroup();
var sounds = [];
var $iso;
var limit = 20;



map = new L.Map('map');

var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
var osm = new L.TileLayer(osmUrl, {attribution: osmAttrib});		

map.addLayer(osm);
map.setView([0,0],1);
//map.addLayer(osm);

// extend Marker so that we can track the locality id
customMarker = L.Marker.extend({
	options: { key: 0 }
});	

// set up the template for the soundControl
var taxon_template = Handlebars.compile($("#taxon-template").html());
var info_template  = Handlebars.compile($("#info-template").html());

// load sound locality sound files
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
			.on('mouseover', function(e){ e.target.openPopup(); } )
			.on('mouseout', function(e) { e.target.closePopup(); })
			.addTo(map);
	  
	  localityLayer.addLayer(rectangle); 	  
	  addMenuItem(key);
	  
   }) 
   
   
   map.fitBounds(localityLayer.getBounds());

  
   localityLayer.addTo(map);
   

});

function addMenuItem(key){
		
		$("#area_choose")
	   .append('<option value='+key+'>' + localities[key].locality + '</option>')
	   .on('click', function(e){			

			select(e.target.value);
		});
		
}

function select(key){

	// wipe current
	$('#info').children().remove();;
	$('#sounds .controls').children().remove();
		
	locality = localities[key]; 
	if(locality){
		$('#map').css('height', 250);
		updateSounds(locality);
		updateInfo(locality);
		map.fitBounds(locality.bounds);
		
		// and play some sounds
		play('item');
	}
}
  
function markerClick(m){
	if(m.hasOwnProperty('target') 
		&& m.target.hasOwnProperty('options') 
	    && m.target.options.hasOwnProperty('key')){
			select(m.target.options.key); 
	}			
}	

function updateInfo(l){
	var bird_number = l.birds.length;
	var frog_number = l.frogs.length;
	
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
		$('.item').each(function(a){
			if(Math.random() < 0.5){
				$(this).find('audio')[0].play();
				$(this).addClass("playing");
			}
			else{
				$(this).find('audio')[0].pause();
				$(this).removeClass("playing");
			}
		});		
		$iso.isotope({ filter: '.playing' });
	});
	
	$("#playpause").on('click', function(){
		pauseAll();
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

}

function pauseOne(i){
	$(i).find('audio')[0].pause();
}

function pauseAll(){
	$('.item').each(function(){
		pauseOne(this);
		$(this).removeClass('playing');
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
	});	
	
	$iso.isotope({ filter: '.playing' });		
}

function updateSounds(l){
	
	// trash what's there
	$("#sounds div.controls").find(".item").remove();
	
	$.each(l.frogs, function (i, frog){
		if(i < limit){ 
			$("#sounds div.controls").append(makeSoundControl("frog", frog));
		}
	});
	
	$.each(l.birds, function (i, bird){
		if(i < limit){
			$("#sounds div.controls").append(makeSoundControl("bird", bird));
		}
	});


	$iso = $('div.controls').isotope({
			itemSelector: '.item'			
	});
	
	// and propate styling if user clicks directly on the control
	$('audio').on('click', function(){
		$(this).parents('.item').get(0).toggleClass('playing');
	});	

}

function makeSoundControl(tax, t){
	
	var context = {image_src: t.image, name: t.name, vernacular: t.vernacularName, taxon: tax, audio_src: t.audio, audio_credit: t.audio_reference, image_credit: t.image_reference}; 
	
	return taxon_template(context);
}
