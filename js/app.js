var app = {}; // set up namespace for our app

// set up variables
var filters = {};
var map;
var localityLayer = new L.featureGroup();
var sounds = [];
var $iso;
var limit = 3;

// map details
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

// backbone model(s)
// Critters holds all our organisms that we are displaying
app.Critter = Backbone.Model.extend({});
app.Critters = Backbone.Collection.extend({
	model: app.Critter
});

//Details about the localities we can query
app.Locality = Backbone.Model.extend({
	idAttribute : 'name'
});
app.Localities = Backbone.Collection.extend({
	model: app.Locality
});

app.critters = new app.Critters();
app.localities = new app.Localities();


// a view for a single critter
app.CritterView = Backbone.View.extend({
	tagName: 'div',
	template: _.template($('#critter-template').html()),
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
        this.title = "";
        this.allRegion = app.critters;
    },
    render: function () {
		this.$el.html("");
		this.critters.each( function(crit){
			var critterView = new app.CritterView({model: crit});
			this.$el.append(critterView.render().el);
		}, this);

		// and re-bind the buttons
		bindButtons();
		return this;
    },
    filterByRegion: function(name){
		var filtered = _.filter(app.critters.models, function(item){
			return _.contains(item.get("region"), name);
		});
		this.critters = new app.Critters(filtered);
		this.allRegion = new app.Critters(filtered);
    	return this;
		
    },
    filterRandom: function(num){
    	randomFrogs = _.sample(this.allRegion.where({"type": "frog"}), num);
    	randomBirds = _.sample(this.allRegion.where({"type": "bird"}), num);
    	//randomCritters = this.critters.sample(num);
    	randomCritters = _.sample(randomFrogs.concat(randomBirds), num);
    	this.critters = new app.Critters(randomCritters);
    	return this;
    },
    getInfo: function(){
    	return {"allnum" : 20, "frognum" : 3, "birdnum": 12};
    }
});

app.crittersView = new app.CrittersView({critters: app.critters});

app.MenuView = Backbone.View.extend({
 el: '#info',
     
    initialize:function(){
        //this.render();
    },
    render: function (name, info) {
    	// get some numbers
        var template = _.template($('#cinfobox-template').html());

        var html = template($.extend(info,{critters: app.critters.models, title: name}));
        this.$el.html(html);
        bindButtons();
    }	

});

app.menuview = new app.MenuView();



// load sound locality sound files
$.getJSON('./data/locality_sounds.json', function( data){
	
   $.each( data.localities, function(key, val){
   		loc = new app.Locality(val);
	   app.localities.push(loc);
	});
	   
   $.each(data.taxa, function(key, val){
	   var crit = new app.Critter(val);
	   app.critters.push(crit);			
   }); 
   
   app.localities.each(function(loc){

   	  var rectangle = new L.rectangle(loc.get('bounds'), {color: "#ff7800", weight: 1});
	  var centre = rectangle.getBounds().getCenter();

	  var marker = new customMarker(centre, {name: loc.get('name')})
			.bindPopup(loc.get('name'))
			.on('click', markerClick)
			.on('mouseover', function(e){ e.target.openPopup(); } )
			.on('mouseout', function(e) { e.target.closePopup(); })
			.addTo(map);
	  
	  localityLayer.addLayer(rectangle); 	  
	  addMenuItem(loc.get('name'));
   });

   map.fitBounds(localityLayer.getBounds());  
   localityLayer.addTo(map);
   bindButtons();
 
});

function bindButtons(){
	$('#cplayrandom').on('click', function(){
		app.crittersView.filterRandom(limit);
		app.crittersView.render();
		$('audio').trigger('play');
		$('.item').addClass('playing');
	});

	$('.item').on('click', function(){
		var $i = $(this);
		if($i.hasClass('playing')){
			$i.find('audio').trigger('pause');
			$i.removeClass('playing');
		}
		else{
			$i.find('audio').trigger('play');
			$i.addClass('playing');
		}
	});

	$('#cplayall').on('click', function(){
		$('audio').trigger('play');
		$('.item').addClass('playing');
	})

	$('#cplaypause').on('click', function(){
		$('audio').trigger('pause');
		$('.item').removeClass('playing');
	})
}

function playVisible(){
	$('audio').trigger('play');
	$('.item').addClass('playing');
}
function pauseVisible(){
	$('audio').trigger('pause');
	$('.item').removeClass('playing');
}





function addMenuItem(name){
		
		option = $('<li><a href="#">' + name + '</a></li>').on('click',  function(e){			
			select(name);
			e.preventDefault();
		});
		
		$('#area_choose').append(option);		
}
  
function markerClick(m){
	//console.log(m);
	if(m.hasOwnProperty('target') 
		&& m.target.hasOwnProperty('options') 
	    && m.target.options.hasOwnProperty('name')){

		select(m.target.options.name);
	}			
}	

function select(name){
	app.crittersView.filterByRegion(name).filterRandom(limit);
	app.crittersView.render();
    bounds = app.localities.get(name).get('bounds');
	map.fitBounds(bounds);
	updateInfoC(name);
	playVisible();
	
}

function updateInfoC(n){
	//$('#info').empty();
	app.menuview.render(n, app.crittersView.getInfo());

}


