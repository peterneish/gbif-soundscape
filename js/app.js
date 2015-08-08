var app = {}; // set up namespace for our app

var localities = [];
var active_locality = {};
var map;
var localityLayer = new L.featureGroup();
var sounds = [];
var $iso;
var limit = 30;

map = new L.Map('map');

var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
var osm = new L.TileLayer(osmUrl, {attribution: osmAttrib});		

map.addLayer(osm);
map.setView([0,0],1);

// extend Marker so that we can track the locality id
customMarker = L.Marker.extend({
	options: { key: 0 }
});	

// set up the template for the soundControl
var taxon_template = Handlebars.compile($("#taxon-template").html());
var info_template  = Handlebars.compile($("#info-template").html());

// backbone model(s)
app.Critter = Backbone.Model.extend({});
app.Critters = Backbone.Collection.extend({
	model: app.Critter
});

app.Locality = Backbone.Model.extend({});
app.Localities = Backbone.Collection.extend({
	model: app.Locality
});

app.critters = new app.Critters();
app.localities = new app.Localities();



app.LMap = Backbone.View.extend({
	model: app.localities,
	initialize: function(){
		this.render();
	},
	render: function(){
		this.$el.html("hello there");
	}
});

app.lmap = new app.LMap({el: $('#mapb')});

// a single critter
app.CritterView = Backbone.View.extend({
	tagName: 'div',
	template: _.template($('#critter-template').html()),
	initialize:function(){
		this.wavesurfer = Object.create(WaveSurfer);

		this.wavesurfer.on('ready', function(){
			this.wavesurfer.play();
		});
    },
	loadWave: function(){
		console.log("critter"+this.model.cid);
		this.wavesurfer.init({
			container: document.querySelector("#critter"+this.model.cid),
			waveColor: 'violet',
			progressColor: 'purple'
		});
		this.wavesurfer.load(this.model.get("audio"));
	},
	render: function(){
		this.$el.html(this.template({critter: this.model}));
		return this;
	}
});

// a list of critters
app.CrittersView = Backbone.View.extend({
 el: '#critterlist',

    initialize:function(){
        //this.render();
        this.critters = app.critters;
    },
    render: function () {
		console.log("render called");
		console.log(this.critters);
		this.$el.html("");
		this.critters.each( function(crit){
			var critterView = new app.CritterView({model: crit});
			this.$el.append(critterView.render().el);
			critterView.loadWave();
		}, this);
		return this;
    },
    filterById: function(id){
		this.critters =  app.critters;
    	this.critters = new app.Critters(app.critters.where({"locality_id": id}));
		console.log(this.critters);
    }
});

app.crittersView = new app.CrittersView({critters: app.critters});

app.MenuView = Backbone.View.extend({
 el: '#cinfobox',
     
    initialize:function(){
        //this.render();
    },
    render: function () {
        var template = _.template($('#cinfobox-template').html());
        var html = template({critters: app.critters.models});
        this.$el.html(html);
    }	

});

// load sound locality sound files
$.getJSON('./data/sounds.json', function( data){
	
	// parsing from [ locality [birds], [frogs] ] to [localities] and [critters]
   $.each( data, function(key, val){
	   var loc = new app.Locality({"lat": val.lat, 
								   "lon": val.lon, 
								   "bounds": [[val.lat[0], val.lon[0]],[val.lat[1], val.lon[1]]],
								   "id":key, 
								   "name": val.locality});
	   app.localities.push(loc);
	   
	   // put make birds into critters
	   $.each(val.birds, function(bkey, bval){
		   var crit = new app.Critter(bval);
		   crit.set({"locality_id": key,
					 "locality"   : val.locality,
					 "type"       : "bird"});
		   app.critters.push(crit);			
	   }); 
	   // put make frogs into critters
	   $.each(val.frogs, function(bkey, bval){
		   var crit = new app.Critter(bval);
		   crit.set({"locality_id": key,
					 "locality"   : val.locality,
					 "type"       : "frog"});
		   app.critters.push(crit);			
	   }); 
   });
   
   //app.crittersView.render();

   app.localities.each(function(loc){

   	  var rectangle = new L.rectangle(loc.get('bounds'), {color: "#ff7800", weight: 1});
	  var centre = rectangle.getBounds().getCenter();

	  var marker = new customMarker(centre, {key: loc.get('id')})
			.bindPopup(loc.get('name'))
			.on('click', markerClick)
			.on('mouseover', function(e){ e.target.openPopup(); } )
			.on('mouseout', function(e) { e.target.closePopup(); })
			.addTo(map);
	  
	  localityLayer.addLayer(rectangle); 	  
	  addMenuItem(loc.get('id'));
   });

   map.fitBounds(localityLayer.getBounds());  
   localityLayer.addTo(map);
 
});

function addMenuItem(key){
		
		option = $('<li><a href="#">' + app.localities.get(key).get('name') + '</a></li>').on('click',  function(e){			
			select(key);
			e.preventDefault();
		});
		
		$('#area_choose').append(option);		
}

function select(key){

	// wipe current
	$('#controls').html('');
	$iso = $("#controls");
	$iso.isotope({ itemSelector: '.item'});
		
	locality = app.localities.get(key); 
	if(locality){
		$('#map').css('height', 250);

		updateSounds(locality);
		updateInfo(locality);
		map.fitBounds(locality.get("bounds"));
		
		// and play some sounds
		play('item');
			
	}
}
  
function markerClick(m){
	//console.log(m);
	if(m.hasOwnProperty('target') 
		&& m.target.hasOwnProperty('options') 
	    && m.target.options.hasOwnProperty('key')){
			//select(m.target.options.key);
			//app.critters = app.critters.where({"locality_id" : m.target.options.key});
			//console.log(app.critters);
			app.crittersView.filterById(m.target.options.key);
			app.crittersView.render();

	}			
}	

function updateInfo(l){

	var bird_number = l.birds.length;
	if(bird_number > limit){ bird_number = limit; }
	var frog_number = l.frogs.length;
	if(frog_number > limit){ frog_number = limit; }
	
	$('#info').empty();
	
	$('#info').html(info_template({title: l.locality, 
								   birdnum: bird_number,
								   frognum: frog_number,
								   allnum: bird_number + frog_number}));
								   
	// bind events
	$(".btn .play").on('click', function(e){
		$iso.isotope({filter: '.playing'});
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
	
		$iso.isotope({filter: '.playing' });

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
	
	$('.'+ what + ' audio').each(function(){
			this.play();
			$(this).parents('div.item').toggleClass('playing');
	});	
	
	$iso.isotope({filter: '.playing' });

}

function updateSounds(l){

	$.each(l.frogs, function (i, frog){
		if(i < limit){ 
			$("#controls").append(makeSoundControl("frog", frog));
		}
	});
	
	$.each(l.birds, function (i, bird){
		if(i < limit){
			$("#controls").append(makeSoundControl("bird", bird));
		}
	});

	// and propagate styling if user clicks directly on the control
	$('audio').on('click', function(){
		$(this).parents('.item').get(0).toggleClass('playing');
	});	
	
	$iso.isotope('reloadItems');

}

function makeSoundControl(tax, t){
	
	var context = {image_src: t.image, name: t.name, vernacular: t.vernacularName, taxon: tax, audio_src: t.audio, audio_credit: t.audio_reference, image_credit: t.image_reference}; 
	
	return taxon_template(context);
}
