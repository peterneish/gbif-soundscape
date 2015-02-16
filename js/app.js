$(document).ready(function(){
  getData("data/sounds.json");
});

var localities = [];
var active_locality = {};


function getData(d){
    $.getJSON(d, function( data){
       
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

