const base_url = 'http://nodeexamproject-env.eba-tkgknw3b.us-east-1.elasticbeanstalk.com'
// const base_url = 'http://localhost:8080'

// Variables to display the map and contents on it
let map;

let city;
let places = [];


// Variables for Chat part
let socket;

let chat_container;
let userName;
let inputField;
let messageForm;
let messageBox;

async function filter(place_id, param){
    //console.log(`Checking param ${param}, place_id ${place_id} at the beginning`);
    let element = document.getElementById(param);
    let state = element.checked; // if checkbox is ckecked then element.value = 'on'
    //console.log(`State of checkbox ${state}`);
    if (state === true){

        if (param.localeCompare('male') === 0 || param.localeCompare('female') === 0){
            //console.log(`Checking 'for' and param ${param}, place_id ${place_id}`);
            display_bikes(true, place_id, 'for', param);
        }else if(param.localeCompare('urban_bike') === 0 || param.localeCompare('road_bike') === 0 || param.localeCompare('mountain_bike') === 0) {
            display_bikes(true, place_id, 'type', param);
        }else if(param.localeCompare('small') === 0 || param.localeCompare('medium') === 0 || param.localeCompare('big') === 0) {
            display_bikes(true, place_id, 'size', param);
        }
    }else{
        display_filters(true, place_id);
    }
    // if (param.localeCompare('male') === 0){
    //     p
    // }
}

function title(city) {
    const title = document.getElementById("title");
    const city_title = city.charAt(0).toUpperCase() + city.slice(1) 
    title.innerText = `Available stores in ${city_title}`; 

}

function hideLocations()  {  

    const URL = window.location.href;
    //console.log(URL);
    if (URL.localeCompare(`${base_url}/`) !== 0){
        
        // console.log("checking url");
        document.getElementById("locations").style.visibility="hidden";  
    
    }
    // if (window.location.href)
    // document.getElementById("cont1").style.visibility="hidden";  
    // document.getElementById("cont2").style.visibility="hidden";   
}

async function getData(country, city) {
    
    // console.log(`Country => ${country} and city => ${city}`);
    let response = await fetch(`${base_url}/getData/${country}/${city}`);
    let data = await response.json()
    return data.data;
    

}


async function start(chosen_country, chosen_city){
    title(chosen_city);
    console.log(chosen_country, chosen_city);
    city = await getData(chosen_country, chosen_city);
    places = await city.places;
    display_places();
    initMap();
    document.getElementById("map").style.height = "350px";

}


async function display_places(place_id = null) {
    
    
    // console.log("places", places);
    // console.log(place_id)
    //Deleting existing data on the page before displaying the new data
    let places_div = document.getElementById("places");
    while (places_div.firstChild) {
        places_div.removeChild(places_div.firstChild);
    }

    let ul = document.createElement ('ul');

    ul.setAttribute('id', 'places_list');

    if (place_id === null){
            
        for (let i = 0; i < places.length; i++){
            let li = document.createElement('li');
            li.setAttribute('class', `place`);

            let place_name = document.createElement('h3');
            place_name.innerText = places[i].place_name;
            li.appendChild(place_name);
            let nr_bikes = document.createElement('span');
            nr_bikes.innerText = `Number of bikes: ${places[i].nr_bikes} \n`;
            li.appendChild(nr_bikes);
            let address = document.createElement('span');
            address.innerText = `Address: ${places[i].address} \n`;
            li.appendChild(address);
            let working_hours = document.createElement('span');
            working_hours.innerText = `Working Hours: ${places[i].working_hours} \n`;
            li.appendChild(working_hours);
            let description = document.createElement('span');
            description.innerText = `Description: ${places[i].description} \n`;
            li.appendChild(description);
            let owner_name = document.createElement('span');
            owner_name.innerText = `Owner's name: ${places[i].owner_name} \n`;
            li.appendChild(owner_name);
            let phone_nr = document.createElement('span');
            phone_nr.innerText = `Phone number: ${places[i].phone_nr}`;
            li.appendChild(phone_nr);
            ul.appendChild(li);
        } 
    }else{
        const place = places.filter(function(place_found) {
            if (place_found.place_id === place_id) {
                return true;
            }
        });
        let li = document.createElement('li');
        li.setAttribute('class', `place`);

        let place_name = document.createElement('h3');
            place_name.innerText = place[0].place_name;
            li.appendChild(place_name);
            let nr_bikes = document.createElement('span');
            nr_bikes.innerText = `Number of bikes: ${place[0].nr_bikes} \n`;
            li.appendChild(nr_bikes);
            let address = document.createElement('span');
            address.innerText = `Address: ${place[0].address} \n`;
            li.appendChild(address);
            let working_hours = document.createElement('span');
            working_hours.innerText = `Working Hours: ${place[0].working_hours} \n`;
            li.appendChild(working_hours);
            let description = document.createElement('span');
            description.innerText = `Description ${place[0].description} \n`;
            li.appendChild(description);
            let owner_name = document.createElement('span');
            owner_name.innerText = `Owner's name: ${place[0].owner_name} \n`;
            li.appendChild(owner_name);
            let phone_nr = document.createElement('span');
            phone_nr.innerText = `Phone number: ${place[0].phone_nr}`;
            li.appendChild(phone_nr);
            ul.appendChild(li);
    }
    places_div.appendChild(ul);

}

// display_places();

async function display_filters(display = false, place_id = null, filter_key = '', filter_value = '') {
    
    let filters_div = document.getElementById("filters")
    
    let filter_options_div = document.createElement('div');
    filter_options_div.setAttribute('id', 'filter-options');
    while (filters_div.firstChild) {
        filters_div.removeChild(filters_div.firstChild);
    }
    if (display) {
        let message = document.createElement('h2');
        message.innerText = "You can filter the bikes on following (choose one at a time): ";
        filters_div.appendChild(message);
    
        let div_male = document.createElement('div');
        let input_male = document.createElement('input');
        input_male.setAttribute('type', 'checkbox');
        input_male.setAttribute('id', 'male');
        input_male.setAttribute('name', 'male');
        input_male.setAttribute('onclick', `filter('${place_id}', "male")`); 
        div_male.appendChild(input_male);   
        let label_male = document.createElement('label');  
        label_male.setAttribute('for', 'male');
        label_male.innerText = "Male";
        div_male.appendChild(label_male);
        filter_options_div.appendChild(div_male);
    
        let div_female = document.createElement('div');
        let input_female = document.createElement('input');
        input_female.setAttribute('type', 'checkbox');
        input_female.setAttribute('id', 'female');
        input_female.setAttribute('name', 'female');
        input_female.setAttribute('onclick', `filter('${place_id}', "female")`);
        div_female.appendChild(input_female);   
        let label_female = document.createElement('label');  
        label_female.setAttribute('for', 'female');
        label_female.innerText = "Female";
        div_female.appendChild(label_female);
        filter_options_div.appendChild(div_female);
    
        let div_urban_bike = document.createElement('div');
        let input_urban_bike = document.createElement('input');
        input_urban_bike.setAttribute('type', 'checkbox');
        input_urban_bike.setAttribute('id', 'urban_bike');
        input_urban_bike.setAttribute('name', 'urban_bike');
        input_urban_bike.setAttribute('onclick', `filter('${place_id}', "urban_bike")`);
        div_urban_bike.appendChild(input_urban_bike);   
        let label_urban_bike = document.createElement('label');  
        label_urban_bike.setAttribute('for', 'urban_bike');
        label_urban_bike.innerText = "Urban Bike";
        div_urban_bike.appendChild(label_urban_bike);
        filter_options_div.appendChild(div_urban_bike);
    
        let div_road_bike = document.createElement('div');
        let input_road_bike = document.createElement('input');
        input_road_bike.setAttribute('type', 'checkbox');
        input_road_bike.setAttribute('id', 'road_bike');
        input_road_bike.setAttribute('name', 'road_bike');
        input_road_bike.setAttribute('onclick', `filter('${place_id}', "road_bike")`);
        div_road_bike.appendChild(input_road_bike);   
        let label_road_bike = document.createElement('label');  
        label_road_bike.setAttribute('for', 'road_bike');
        label_road_bike.innerText = "Road Bike";
        div_road_bike.appendChild(label_road_bike);
        filter_options_div.appendChild(div_road_bike);
        
        let div_mountain_bike = document.createElement('div');
        let input_mountain_bike = document.createElement('input');
        input_mountain_bike.setAttribute('type', 'checkbox');
        input_mountain_bike.setAttribute('id', 'mountain_bike');
        input_mountain_bike.setAttribute('name', 'mountain_bike');
        input_mountain_bike.setAttribute('onclick', `filter('${place_id}', "mountain_bike")`);
        div_mountain_bike.appendChild(input_mountain_bike);   
        let label_mountain_bike = document.createElement('label');  
        label_mountain_bike.setAttribute('for', 'mountain_bike');
        label_mountain_bike.innerText = "Mountain Bike";
        div_mountain_bike.appendChild(label_mountain_bike);
        filter_options_div.appendChild(div_mountain_bike);
    
        let div_small = document.createElement('div');
        let input_small = document.createElement('input');
        input_small.setAttribute('type', 'checkbox');
        input_small.setAttribute('id', 'small');
        input_small.setAttribute('name', 'small');
        input_small.setAttribute('onclick', `filter('${place_id}', "small")`);
        div_small.appendChild(input_small);   
        let label_small = document.createElement('label');  
        label_small.setAttribute('for', 'small');
        label_small.innerText = "Small Size";
        div_small.appendChild(label_small);
        filter_options_div.appendChild(div_small);
    
        let div_medium_bike = document.createElement('div');
        let input_medium = document.createElement('input');
        input_medium.setAttribute('type', 'checkbox');
        input_medium.setAttribute('id', 'medium');
        input_medium.setAttribute('name', 'medium');
        input_medium.setAttribute('onclick', `filter('${place_id}', "medium")`);
        div_medium_bike.appendChild(input_medium);   
        let label_medium = document.createElement('label');  
        label_medium.setAttribute('for', 'medium');
        label_medium.innerText = "Medium Size";
        div_medium_bike.appendChild(label_medium);
        filter_options_div.appendChild(div_medium_bike);
        
        let div_big_bike = document.createElement('div');
        let input_big = document.createElement('input');
        input_big.setAttribute('type', 'checkbox');
        input_big.setAttribute('id', 'big');
        input_big.setAttribute('name', 'big');
        input_big.setAttribute('onclick', `filter('${place_id}', "big")`);
        div_big_bike.appendChild(input_big);   
        let label_big = document.createElement('label');  
        label_big.setAttribute('for', 'big');
        label_big.innerText = "Big Size";
        div_big_bike.appendChild(label_big);
        filter_options_div.appendChild(div_big_bike);
    
        filters_div.appendChild(filter_options_div);
        
    }
    display_bikes(display, place_id);
}

async function display_bikes(display = false, place_id = null, filter_key = '', filter_value = '') {
    //Deleting existing data on the page before displaying the new data
    let bikes_div = document.getElementById("bikes");
    while (bikes_div.firstChild) {
        bikes_div.removeChild(bikes_div.firstChild);
    }

    if (display){
        let ul = document.createElement ('ul');
        ul.setAttribute('id', 'bikes_list');
        let places_to_include;
        if (place_id === null){
            places_to_include = places;
        }else{
            places_to_include = places.filter(function(place_found) {
                if (place_found.place_id === place_id) {
                    return true;
                }
            });
        }
        for (let i = 0; i < places_to_include.length; i++){
            const bikes_list = places_to_include[i].bikes;
            if(bikes_list !== undefined){
                for (let j = 0; j < bikes_list.length; j++) {
                    let bike;
                    if (filter_key && filter_value){
                        if (bikes_list[j][`${filter_key}`].localeCompare(filter_value) === 0){
                            bike = bikes_list[j];
                        }else{
                            continue;
                        }
                    }else{
                        bike = bikes_list[j];
                    }
                    
                    // console.log("Show bikes: ", bike);
                    let li = document.createElement('li');
                    // li.setAttribute('id', `bike_type_${bike.type}`);
                    
                    
                    let bike_ul = document.createElement('ul');
                    
                    let bike_li = document.createElement('li');
                    bike_li.setAttribute("class", "bike");
                    let model = document.createElement('h3');
                    model.innerText = `${bike.model}`;
                    bike_li.appendChild(model);
                    let type = document.createElement('span');
                    let type_array = bike.type.split("_");
                    console.log(type_array);
                    let type_changed_str = type_array[0].charAt(0).toUpperCase() + type_array[0].slice(1) + " " + type_array[1].charAt(0).toUpperCase() + type_array[1].slice(1);
                    console.log(type_changed_str);
                    type.innerText = `Bike Type: ${type_changed_str}\n`;
                    bike_li.appendChild(type);
                    let for_year = document.createElement('span');
                    for_year.innerText = `Bike for: ${bike.for} \nYear: ${bike.year}\n`;
                    bike_li.appendChild(for_year);
                    let description = document.createElement('span');
                    description.innerText = `Description: ${bike.description} \n`;
                    bike_li.appendChild(description);
                    let size_speeds = document.createElement('span');
                    size_speeds.innerText = `Frame size: ${bike.size} \nSpeeds: ${bike.speeds}\n`;
                    bike_li.appendChild(size_speeds);
                    let prices = document.createElement('span');
                    prices.innerText = `Price per hour: ${bike.price.hour}dkk
                                        Price per 1 day: ${bike.price.day}dkk
                                        Price per 1 week : ${bike.price.week}dkk
                                        Price per 1 month: ${bike.price.month}dkk`;
                    bike_li.appendChild(prices);
                    let new_line = document.createElement('span');
                    new_line.innerText = `\n`;
                    bike_li.appendChild(new_line);

                    // let available = document.createElement('span');
                    // available.innerText = `Available: ${bike.available}\n`;
                    // bike_li.appendChild(available);


                    // console.log(bike.images);
                    const image_url = bike.images;
                    // console.log("Image URL", image_url);
                    let a = document.createElement('img');
                    a.setAttribute('src', `${image_url}`);
                    a.setAttribute('width', `250px`);
                    a.setAttribute('height', `200px`);
                    // size_speeds.innerText = `Frame size: ${bike.size} \tSpeeds: ${bikes_div.speeds}\n`;
                    bike_li.appendChild(a);
                        
                    bike_ul.appendChild(bike_li);
                    li.appendChild(bike_ul);
                    // console.log(li);
                    ul.appendChild(li);
                }
            }
        }   
        bikes_div.appendChild(ul);
    }

    if(place_id){
       display_chat(place_id); 
    }
    
}

function mapTest() {
    // console.log("Testing map");
}

async function initMap() {
    // console.log("places from initMap", places);
    map = new google.maps.Map(document.getElementById("map"), {
        center: {
            lat : parseFloat( city.coords.latitude ),
            lng : parseFloat( city.coords.longitude )
        },
        zoom: 11,
    });

    let previousInfoWindow;
    function addMarker(props) {
        let marker = new google.maps.Marker({
            position: {
                lat : parseFloat( props.coords.latitude ),
                lng : parseFloat( props.coords.longitude )
            },
            map:map
        });

        if (props.content){
            let infoWindow = new google.maps.InfoWindow({
                content:props.content
            });

            marker.addListener('click', function(){
                //console.log("Previous before assign ", previousInfoWindow);
                if (previousInfoWindow ) { 
                    previousInfoWindow.close();
                }
                infoWindow.open(map, marker);
                previousInfoWindow = infoWindow;
                //console.log("Previous after assign ", previousInfoWindow);
                display_places(props.place_id);
                display_filters(true, props.place_id);
                while (messageBox.firstChild) {
                    messageBox.removeChild(messageBox.firstChild);
                }
                messageBox.innerHTML = "";
            });

            map.addListener('click', function(){
                //console.log("pressing on map");
                infoWindow.close();
                display_places();
                display_filters();
                while (chat_container.firstChild) {
                    chat_container.removeChild(chat_container.firstChild);
                }
                chat_container.innerHTML = "";
            });
        }

    }

    places.forEach(place => {
        //console.log(place);
    });
    for (let i = 0; i < places.length; i++) {
        const place = places[i];
        addMarker({
            coords:  place.coords,
            content: `<h3>${place.place_name}</h3>`,
            place_id: place.place_id
        });
    }
}


async function display_chat(place_id) {
    chat_container = document.getElementById("chat-container");
    
    let chat_display = `
    <div class="chat">
        <div class="inbox">

            <h2>Chat with the someone!</h2>

            <div class="inbox_messages">
                <div class="messages_history"></div>
                <div class="fallback"></div>
            </div>
        </div>

        <div class="message_form">
            <input type="text" class="message_form_input" placeholder="Type a message" />
            <button class="message_form_button" onclick="submit('${place_id}')">Enter</button>
        </div>
    </div>`
    
    chat_container.innerHTML = chat_display;
   
    inputField = await document.querySelector(".message_form_input");
    messageForm = await document.querySelector(".message_form");
    messageBox = await document.querySelector(".messages_history");
    
    socket =  io.connect(base_url,{ query: `place_id=${place_id}` });
    socket.on("chat message", function (data) {
        while (messageBox.firstChild) {
            messageBox.removeChild(messageBox.firstChild);
        }
        messageBox.innerHTML = "";
        let dialog = data.dialog;
        dialog.forEach((oneMessage) => {
            //console.log("Message => ", oneMessage);
            addNewMessage({ user: oneMessage.nick, message: oneMessage.message, time:oneMessage.time });
        })
        
    });
}



const getUserName = () => {
  
    userName = window.prompt("Write the name you have to be displayed in chat section", "");
    //console.log(userName);
};

const addNewMessage = ({ user, message, time }) => {
 
  
  const receivedMsg = `
    <div class="received_message">
      <div class="message_info">
        <span class="message_author">${user}</span>
        <span class="time_date">${time}</span>
      </div>
      <p>${message}</p>
    </div>`;

  const myMsg = `
    <div class="sent_message">
      <p>${message}</p>
      <div class="message_info">
        <span class="message_author">You</span>
        <span class="time_date">${time}</span>
      </div>
    </div>`;

   messageBox.innerHTML += user === userName ? myMsg : receivedMsg;
   //console.log(messageBox.innerHTML);
};


function submit(place_id){

    if (!inputField.value) {
      return;
    }
    let userNameNotEntered = 0;
    //console.log(userName);
    while (!userName && userNameNotEntered < 1 ){
          userNameNotEntered++;
       getUserName(); // get username before sending the message
       
    }
    if (userName){
        const time = new Date();
        const formattedTime = time.toLocaleString("en-US", { hour: "numeric", minute: "numeric" });
  
      socket.emit("chat message", {
          place_id: place_id,
          message: inputField.value,
          nick: userName,
          time: formattedTime
      });
    }
  
    inputField.value = "";

}    
    



    
