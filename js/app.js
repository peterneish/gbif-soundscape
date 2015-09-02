var app = {}; // set up namespace for our app

// set up variables
var filters = {};
var map;
var localityLayer = new L.featureGroup();
var sounds = [];
var $iso;
var limit = 4; // initial seed of playing critters
var max = 20;   // maximum a user can add to playing
var playing = false; // sate

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
app.Critter = Backbone.Model.extend({
    defaults: {
            "playing": false
    }
});
app.Critters = Backbone.Collection.extend({
	model: app.Critter,
    comparator: function( collection ){
        return (collection.get('name'));
    },
    getByRegion: function(name){
        var filtered = _.filter(this.models, function(item){
            return _.contains(item.get("region"), name);
        });
        return new app.Critters(filtered);
    },
    playRandom: function(num){
        // first reset the collection
        this.invoke('set', {"playing": false});
        // sets n random critters playing
        randomFrogs = _.sample(this.where({"type": "frog"}), num);
        randomBirds = _.sample(this.where({"type": "bird"}), num);
        //randomCritters = this.critters.sample(num);
        randomCritters = _.sample(randomFrogs.concat(randomBirds), num);
        $.each(randomCritters,function(i, model){
            model.attributes.playing = true;
        });

        this.set(randomCritters, {"remove": false});
    },
    playRandomBirds: function(num){
        this.invoke('set', {"playing": false});
        randomBirds = _.sample(this.where({"type": "bird"}), num);
        $.each(randomBirds,function(i, model){
            model.attributes.playing = true;
        });
        this.set(randomBirds, {"remove": false});

    },
    playRandomFrogs: function(num){
        this.invoke('set', {"playing": false});
        randomFrogs = _.sample(this.where({"type": "frog"}), num);
        $.each(randomFrogs,function(i, model){
            model.attributes.playing = true;
        });
        this.set(randomFrogs, {"remove": false});

    },
    playRandomSummer: function(num){
        this.invoke('set', {"playing": false});
        // a hack to to get the current locality
        var reg = $('#info h1').text();
        summerCritters = [];
        $.each(this.models, function(i, m){
            var pos = m.attributes.region.indexOf(reg);
            var season = m.attributes.season[pos];
            if(season.length == 0 || season == "summer"){
                summerCritters.push(m);
            }
        });
        summerCritters = _.sample(summerCritters, num);
        $.each(summerCritters, function(i, m){
            m.attributes.playing = true;
        })
        this.set(summerCritters, {'remove': false});
    },
    playRandomWinter: function(num){
        this.invoke('set', {"playing": false});
        // a hack to to get the current locality
        var reg = $('#info h1').text();
        winterCritters = [];
        $.each(this.models, function(i, m){
            var pos = m.attributes.region.indexOf(reg);
            var season = m.attributes.season[pos];
            if(season.length == 0 || season == "winter"){
                winterCritters.push(m);
            }
        });
        winterCritters = _.sample(winterCritters, num);
        $.each(winterCritters, function(i, m){
            m.attributes.playing = true;
        })
        this.set(winterCritters, {'remove': false});
    },
    numTotal: function(){
        return this.models.length;
    },
    numBirds: function(){
        return this.where({"type": "bird"}).length;
    },
    numFrogs: function(){
        return this.where({"type": "frog"}).length;
    },
    numPlaying: function(){
        return this.where({"playing": true}).length;
    }
});

//Details about the localities we can query
app.Locality = Backbone.Model.extend({
	idAttribute : 'name'
});

app.Localities = Backbone.Collection.extend({
	model: app.Locality
});

// holds all critters from all regions
app.critters = new app.Critters();

// holds the critters for a region
app.regionCritters = new app.Critters();

// the localities
app.localities = new app.Localities();


// a view for a single critter
app.CritterPlayingView = Backbone.View.extend({
	tagName: 'div',
    events: {
        "click button.remove": "remove"
    },
    remove: function(e){
        e.preventDefault();
        this.model.set({"playing": false});
        app.crittersView.render();
        app.waitingView.render();
        playVisible();
    },
	template: _.template($('#critterplaying-template').html()),
	render: function(){
		this.$el.html(this.template({critter: this.model}));
		return this;
	}
});

// a view for a single critter
app.CritterWaitingView = Backbone.View.extend({
    tagName: 'a',
    events: {
        "click a": "clicked"
    },
    clicked: function(e){
        e.preventDefault();

        if(app.regionCritters.numPlaying() < max){
            this.model.set({"playing" : true});
            app.regionCritters.trigger('reload');
            app.crittersView.render();
            app.waitingView.render();
            playVisible();
        }
        else{
            $('#toomany').show().delay(2000).fadeOut();
        }

    },
    template: _.template($('#critterwaiting-template').html()),
    render: function(){
        this.$el.html(this.template({critter: this.model}));
        return this;
    }
});



// a list of critters
app.CrittersPlayingView = Backbone.View.extend({
 el: '#critterlist',

    initialize:function(){
        this.critters = app.regionCritters;
        this.listenTo(app.regionCritters, 'reload', this.render);
    },
    render: function () {
        //console.log("critter render!");
		this.$el.html("");
        var numplaying = 0;
		app.regionCritters.each( function(crit){
            if(crit.get('playing')){
			     var critterView = new app.CritterPlayingView({model: crit});
			     this.$el.append(critterView.render().el);
                 numplaying++;
             }
		}, this);

        if(numplaying == 0){
            $('#noresults').show();
        }
        else{
            $('#noresults').hide();
        }

		return this;
    }
});

// critters that are in the waiting list ready to be added
app.CrittersWaitingView = Backbone.View.extend({
 el: '#waitinglist',

    initialize:function(){
        this.critters = app.regionCritters;
        this.listenTo(this.critters, 'change', this.render);
    },
    render: function () {
        this.$el.html("");
        app.regionCritters.each( function(crit){
            if(!crit.get('playing')){
                 var critterView = new app.CritterWaitingView({model: crit});
                 this.$el.append(critterView.render().el);
             }
        }, this);

        return this;
    }
});

app.crittersView = new app.CrittersPlayingView({critters: app.regionCritters});

app.waitingView = new app.CrittersWaitingView({critters: app.regionCritters});

app.InfoView = Backbone.View.extend({
    el: '#info',
    render: function (title) {
    	// get some numbers
        var total = app.regionCritters.numTotal();
        var numfrogs = app.regionCritters.numFrogs();
        var numbirds = app.regionCritters.numBirds();
        var template = _.template($('#cinfobox-template').html());

        var html = template({"title": title, "total": total, 
                             "numfrogs": numfrogs, "numbirds": numbirds});
        this.$el.html(html);
    }	

});

app.infoview = new app.InfoView();



// load sound locality sound files
$.getJSON('./data/locality_data_cached.json', function( data){
	
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
	$('#info').on('click', '#cplayrandom',function(){
		app.regionCritters.playRandom(limit);
        app.crittersView.render();
        app.waitingView.render();
        playVisible();
	});

    $('#info').on('click', '#playbirds',function(){
        app.regionCritters.playRandomBirds(limit);
        app.crittersView.render();
        app.waitingView.render();
        playVisible();
    });
    $('#info').on('click', '#playfrogs',function(){
        app.regionCritters.playRandomFrogs(limit);
        app.crittersView.render();
        app.waitingView.render();
        playVisible();
    });

    $('#info').on('click', '#playsummer',function(){
        app.regionCritters.playRandomSummer(limit);
        app.crittersView.render();
        app.waitingView.render();
        playVisible();
    });
    $('#info').on('click', '#playwinter',function(){
        app.regionCritters.playRandomWinter(limit);
        app.crittersView.render();
        app.waitingView.render();
        playVisible();
    });

    $('#info').on('click', '#clear',function(){
        app.regionCritters.playRandom(0);
        app.crittersView.render();
        app.waitingView.render();
        playVisible();
    });


	$('#critterlist').on('click', ".item", function(){
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


	$('#sscape').on('click', '#cplayall', function(){
		$('audio').trigger('play');
		$('.item').addClass('playing');
	});

	$('#sscape').on('click', '#cplaypause', function(){
		$('audio').trigger('pause');
		$('.item').removeClass('playing');
	});

    $('#info').on('click', '#cplaybirds', function(){
        $('.item.bird audio').trigger('play');
        $('.item.bird').addClass('playing');
        $('.item.frog.audio').trigger('pause');
        $('.item.frog').removeClass('playing');
    });

      $('#info').on('click', '#cplayfrogs', function(){
        $('.item.frog audio').trigger('play');
        $('.item.frog').addClass('playing');
        $('.item.bird.audio').trigger('pause');
        $('.item.bird').removeClass('playing');
    });  

}

function playVisible(){
	$('audio').trigger('play');
	$('.item').addClass('playing');
    $("button.cplaypause span").removeClass("glyphicon-pause")
                               .addClass("glyphicon-play");
}
function pauseVisible(){
	$('audio').trigger('pause');
	$('.item').removeClass('playing');
    $("button.cplaypause span").removeClass("glyphicon-play")
                               .addClass("glyphicon-pause");
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
    app.regionCritters = app.critters.getByRegion(name);
    app.regionCritters.playRandom(limit);
	app.crittersView.render();
    app.infoview.render(name);
    app.waitingView.render();
    $('#playme').show();
    $('#playbuttons').show();


    bounds = app.localities.get(name).get('bounds');
	map.fitBounds(bounds);
	playVisible();

}



