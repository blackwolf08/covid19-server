const axios = require("axios").default;
const firebase = require("firebase");
const geolib = require("geolib");

var express = require("express");
var cors = require("cors");
var app = express();

let PORT = process.env.PORT || 5000;

app.use(cors());
var firebaseConfig = {
  apiKey: "AIzaSyAJ8ovAPywQFoiiHaDl16-_1pEQgDgOTE8",
  authDomain: "covidtracker-a742b.firebaseapp.com",
  databaseURL: "https://covidtracker-a742b.firebaseio.com",
  projectId: "covidtracker-a742b",
  storageBucket: "covidtracker-a742b.appspot.com",
  messagingSenderId: "898486610796",
  appId: "1:898486610796:web:1977d0cfd795e9571be149",
  measurementId: "G-F88ESL18TZ",
};
firebase.initializeApp(firebaseConfig);

app.get("/", async function (req, res, next) {
  const uid = req.query.uid;
  let expoToken = "";
  let snapshotUsers = await firebase.database().ref(`users`).once("value");
  let snapshotUser = await firebase
    .database()
    .ref(`users/${uid}`)
    .once("value");
  snapshotUser = snapshotUser.val();
  snapshotUsers = snapshotUsers.val();
  for (oldUseruid in snapshotUsers) {
    if (snapshotUsers[oldUseruid].coords.latitude) {
      let dist = geolib.getDistance(
        snapshotUsers[oldUseruid].coords,
        snapshotUser.coords
      );
      console.log(snapshotUsers[oldUseruid].email);
      console.log(dist);
      if (dist <= 3000 && dist != 0) {
        sendNotification(snapshotUsers[oldUseruid].expoPushToken);
      }
    }
  }
  res.send("Done");
});

const sendNotification = async (expoToken) => {
  try {
    if (expoToken) {
      const message = [
        {
          to: expoToken,
          sound: "default",
          title: "Alert COVID-19 Patient Near You",
          body: "As per a recent survey a covid patient is found near you!",
          data: { data: "goes here" },
          _displayInForeground: true,
        },
      ];
      const response = await axios({
        url: "https://exp.host/--/api/v2/push/send",
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        data: JSON.stringify(message),
      });
      console.log(response.data);
    }
  } catch (e) {
    console.log(e);
  }
};

app.listen(PORT, function () {
  console.log("CORS-enabled web server listening on port 5000");
});
