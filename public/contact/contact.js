const base_url = 'http://nodeexamproject-env.eba-tkgknw3b.us-east-1.elasticbeanstalk.com/'
// const base_url = 'http://localhost:8080'

function hideLocations()  {  

    const URL = window.location.href;
    // console.log(URL);
    if (URL.localeCompare(`${base_url}/`) !== 0){
        
        // console.log("checking url");
        document.getElementById("locations").style.visibility="hidden";  
    }
    // if (window.location.href)
    // document.getElementById("cont1").style.visibility="hidden";  
    // document.getElementById("cont2").style.visibility="hidden";   
 }

 function messageSent() {
     alert("Message was sent!");
 }