import express from 'express';
import pg from 'pg';
import fetch from 'node-fetch';
import cors from 'cors';
import _ from 'lodash'; /*необходимая для merge библиотека*/
import fs from 'fs';
import momentZone from 'moment-timezone';


const app = express();

const options = {
  origin: [
    'http://localhost:3000',
  ],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  preflightContinue: false,
  optionsSuccessStatus: 200,
  allowedHeaders: ['Content-Type', 'origin', 'Authorization', 'Accept'],
  credentials: true,
};

const client = new pg.Client({
    user: 'postgres',
    host: '172.16.117.193',
    database: 'Wether_test',
    password: '1234',
    port: 5432,
});

client.connect();

app.use(cors(options));

const { PORT = 3002 } = process.env;

const cordHibin = {
  lat: 67.670036,
  lon: 33.687525,
};


const osinovaiRosFirsPointOpenweter = "https://api.openweathermap.org/data/2.5/weather?lat=67.670036&lon=33.687525&lang=fr&units=metric&appid=c48b10ff7d42501ae1d7246b3fbed3e1";


app.use(express.json());

function fetchDataOpenweathermap(link){
  fetch(link)
    .then(res => res.json())
    .then(json => {
        let currentTime = momentZone().tz("Europe/Moscow").format();
        console.log(json);

        const query = `
          INSERT INTO in_openweatherdata (temperature, windspeed, winddegree, windgust, pressure, humidity, lon, lat, time)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) returning *
        `;
        client.query(query, [json.main.temp, json.wind.speed, json.wind.deg, json.wind.gust, json.main.pressure, json.main.humidity, cordHibin.lon, cordHibin.lat, currentTime], (err, res) => {
          if (err) {
            console.error(err);
            return;
          }
          console.log('Data insert successful');
        });
      })
      .catch(err =>{
        console.log(err);
      })

}


function endFuction(linkOpen) {
  fetchDataOpenweathermap(linkOpen);
}


let timerId = setInterval(() => endFuction(osinovaiRosFirsPointOpenweter), 6000);


app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
