$(document).ready(function(){
<<<<<<< HEAD
  getData("data/sounds.json");
});

var localities = [];
var active_locality = {};

=======
  getData("data/macquarie.json");
});

var taxa = [];
>>>>>>> 5554a064e3d4584ab681447ef537640aff0b8f97

function getData(d){
    $.getJSON(d, function( data){
       
<<<<<<< HEAD
       $.each( data, function(key, val){
          localities.push(val);
          console.log(val);
       }) 
    });
    
    addControls();
    
}

addControls(){
    $.each(localities, funciton(l){
        $('nav').append(l.locality);
    })
}

=======
       taxa = [];
       $.each( data, function(key, val){
          processTaxa(val);
       }) 
    });
    
}

function processTaxa(taxa){
    // create a container
    var container = $('<div></div>').text(taxa.type).appendTo($('.sliders'));
    
    $.each(taxa.data, function(id, taxon){
        console.log(taxon);
        var img = $('<img>').attr('src', taxon.image).appendTo(container);
    });
    
}

function buildSlider(input, tax){
    
   var sliderDiv = document.createElement('div');
   $('sliders').append(input);

}
>>>>>>> 5554a064e3d4584ab681447ef537640aff0b8f97
