$(document).ready(function(){
  getData("data/macquarie.json");
});

var taxa = [];

function getData(d){
    $.getJSON(d, function( data){
       
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