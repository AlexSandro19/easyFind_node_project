function hideLocations()  {  

    const URL = window.location.href;
    // console.log(URL);
    if (URL.localeCompare('http://localhost:8080/') !== 0){
        
        // console.log("checking url");
        document.getElementById("locations").style.visibility="hidden";  
    }
    // if (window.location.href)
    // document.getElementById("cont1").style.visibility="hidden";  
    // document.getElementById("cont2").style.visibility="hidden";   
 }