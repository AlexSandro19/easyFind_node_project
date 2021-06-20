require("dotenv").config();

const express = require("express");
const app = express();
const nodemailer = require("nodemailer");
const firebase = require("firebase/app");
require("firebase/firestore");

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
const fs = require("fs");

const server = require("http").createServer(app);
const io = require("socket.io")(server);

let countries = [];

//Static files
app.use(express.static("public"));
const header = fs.readFileSync(__dirname + "/public/header/header.html", "utf-8");
const footer = fs.readFileSync(__dirname + "/public/footer/footer.html", "utf-8");
const main_page = fs.readFileSync(__dirname + "/public/main_page/main_page.html", "utf-8");
const contact = fs.readFileSync(__dirname + "/public/contact/contact.html", "utf-8");


//All the routes
app.get("/", (req, res) => {
    res.send(header + main_page + footer);
})

app.get("/contact", (req, res) => {
  res.send(header + contact + footer);
})


app.post("/contact", (req, res) => {
  // console.log(req.body);
  sendEmailTo(req.body).catch(console.error);;
  res.redirect("/");
});


app.get("/getData/:country/:city", (req, res) => {

  let requested_city = undefined; 
  countries.forEach( country => {
    let possible_cities = country.cities; 
    possible_cities.forEach( city => {
      if ((country.country_name === req.params.country) && city.city_name === req.params.city){
        requested_city = city;
      }
    })
  })

  res.send({ data: requested_city });
});

app.get("/chat/:place_id", (req, res) => {
  firestoreGetChat(req.params.place_id).then((chat) => {
    // console.log("Chat before sending :", chat);
    res.send(chat);
  }).catch(errorMessage => console.log(errorMessage));;
  
})


const PORT = process.env.PORT || 8080 

server.listen(PORT, (error) => {
  if (error) {
    console.log(error);
  }
  console.log("Server is running on ", PORT);
});


// Function to work with email
async function sendEmailTo(response){
  console.log(response);
  const user = process.env.EMAIL_USERNAME;
  const pass = process.env.EMAIL_PASSWORD;
  let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: user,
        pass: pass, 
      },
  });

  let contacter = await transporter.sendMail({
      from: user, // sender address
      to: response.email, // list of receivers
      subject: "Reply Message from 'EasyFind'", // Subject line
      text: "Thank you for showing interest for the 'EasyFind' Website. You will receive a reply from our administrator in a short time. \nHave a great day! \nSincerely, \nAlexandru", // plain text body
      html: "<p>Thank you for showing interest for the 'EasyFind' Website. You will receive a reply from our administrator in a short time.</p><p>Have a great day!</p><p>Sincerely,<br>Alexandru</p>" // html body
  });

  let you = await transporter.sendMail({
      from: user, // sender address
      to: user, // list of receivers
      subject: response.subject, // Subject line
      text: `Email from: ${response.email} \n${response.message}`, // plain text body
      html: `<p>Message: ${response.message}</p>`
  });

  console.log(contacter);
  console.log(you);

  console.log("Message sent: %s", contacter.messageId);
  console.log("Message sent: %s", you.messageId);
  //Example:  Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

}


//-----Firebase Related Start------------

// Firebase configuration
let firebaseConfig = require("./firebase_connection.js").firebaseConfig;

// Initialize Firebase & Firestore
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Get all data that is concerned about countries, cities, places, bikes
function firestoreGetData() {
  return new Promise((resolve, reject) => {

    // I access the "countries" collection I get each country 
    db.collection("countries").get().then((querySnapshot) => {
        // console.log("Countries collection");
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            // console.log("Country document", doc.id, " => ", doc.data());
            let country = {country_name: doc.id, ...doc.data()};
    
            // If the country has "cities" sub-collection, then I retrieve all cities for that particular country
            country.cities = [];
            db.collection(`countries/${country.country_name}/cities`).get().then((querySnapshot) => {
                // console.log("Cities collection");
                querySnapshot.forEach((doc) => {
    
                    // Now working with each city.
                    let city = {city_name: doc.id, ...doc.data()};
    
                    // If the city has a "places" sub-collection, then I retrieve all places for that particular city
                    city.places = [];
                    db.collection(`countries/${country.country_name}/cities/${city.city_name}/places`).get().then((querySnapshot) => {
                        // console.log("Places collection");
                        querySnapshot.forEach((doc) => {
                        let place = {place_id: doc.id, ...doc.data()};
                        place.bikes = [];
    
                        // If the place has a "bikes" sub-collection, then I retrieve all bikes for that particular place
                        db.collection(`countries/${country.country_name}/cities/${city.city_name}/places/${place.place_id}/bikes`).get().then((querySnapshot) => {
                            // console.log("Bikes collection");
                            querySnapshot.forEach((doc) => {
                            let bike = {bike_id: doc.id, ...doc.data()};
                            place.bikes.push(bike);
                            });
                        });
                        city.places.push(place);
                        });
                        country.cities.push(city);
                    });
                });
                countries.push(country);
                countries.forEach((country, index) => {
                  // console.log(country, "and index:", index);
                });
            });
        });
    });      
  });
}

// Get chat needed for particular place
function firestoreGetChat(place_id) {
  return new Promise((resolve, reject) => {
    db.collection("chat").doc(place_id).get().then((doc) => {
      if (doc.exists) {
          // console.log("Document data:", doc.data());
          resolve(doc.data());
      } else {
          // doc.data() will be undefined in this case
          // console.log("No such document!");
          reject("No such document!");
      }
  }).catch((error) => {
      console.log("Error getting document:", error);
  });

});
}


//Fetching all data from Firebase
firestoreGetData()
  .then(receivedData => {
    countries = receivedData;
    // console.log("Data from promise was assinged to countries");
    // console.log(countries);
  })
  .catch(message => console.log(message));


  //-----Firebase Related End------------


  
//-----Socket.io Related Start------------

io.on("connection", function (socket) {
  
  //console.log("Socket connection", socket.id);
  let place_id = socket.handshake.query['place_id'];

  firestoreGetChat(place_id).then((chat) => {
      //console.log("Sending chat => ", chat, "Length: ", chat.dialog.length);
        io.emit("chat message", chat);
  }).catch(errorMessage => console.log(errorMessage));

  socket.on("disconnect", () => {
    io.emit("user disconnected", socket.userId);
  });

  socket.on("chat message", function (data) {
    //console.log("Received message", data);

    db.collection("chat").doc(data.place_id).update({
      dialog:  firebase.firestore.FieldValue.arrayUnion({
        message: data.message,
        nick: data.nick,
        time: data.time
      })
    }).then(() => {
      //console.log("Document successfully written!");
  })
  .catch((error) => {
      console.error("Error writing document: ", error);
  });

  firestoreGetChat(data.place_id).then((chat) => {
    console.log("Sending chat after receiving it => ", chat, "Length: ", chat.dialog.length);
      io.emit("chat message", chat);
  }).catch(errorMessage => console.log(errorMessage));

});
});

//-----Socket.io Related End------------
