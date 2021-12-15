import express from 'express';
import pg from 'pg';
import fetch from 'node-fetch';
import cors from 'cors';
import _ from 'lodash'; /*необходимая для merge библиотека*/
import fs from 'fs';


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


const osinovaiRosFirsPointOpenweter = "https://api.openweathermap.org/data/2.5/weather?lat=67.670036&lon=33.687525&lang=fr&appid=6264921aac158477ee4f86c2486e4f38";


app.use(express.json());

function fetchDataOpenweathermap(link){
  fetch(link)
    .then(res => res.json())
    .then(json => {

        console.log(json);

        const query = `
          INSERT INTO in_openweather (temperature, windSpeed, windDegree, windGust, pressure, humidity, lon, lat)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8) returning *
        `;
        client.query(query, [json.main.temp, json.wind.speed, json.wind.deg, json.wind.gust, json.main.pressure, json.main.humidity, cordHibin.lon, cordHibin.lat], (err, res) => {
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


let timerId = setInterval(() => endFuction(osinovaiRosFirsPointOpenweter), 600000);


app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
