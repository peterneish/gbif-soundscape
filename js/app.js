$(document).ready(function(){
  getData("data/macquarie.json");
});

var taxa = [];

function getData(d){
    $.getJSON(d, function( data){
       
       taxa = [];
       $.each( data, function(key, val){
           var input = $('<input>', {id: key, type: 'text'}).appendTo('.sliders');
           console.log(val);
           
           buildSlider(input, val);
       }) 
    });
    
}

function buildSlider(input, tax){
    
   var init = new Powerange(input);
    
    
}