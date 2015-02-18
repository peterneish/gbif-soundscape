var localities = [];
var active_locality = {};

    $.getJSON('./data/sounds.json', function( data){
       
       $.each( data, function(key, val){
          localities.push(val);
          console.log(val);
       }) 
       addControls();
    });
    
    

function addControls(){

    $.each(localities, function(i,l){
		console.log(l);
        $('#info').append('<p>'+l.locality+'</p>');
    });
}
