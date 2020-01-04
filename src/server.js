const routes = require('./routes');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const path = require('path');
const express = require('express');
const server = express();
const bodyParser = require('body-parser');
const dataBaseConfig = require('./Config/DataBaseConfig');

const port = 1337;

// parse application/x-www-form-urlencoded
server.use(bodyParser.urlencoded({ extended: false }))
server.use(bodyParser.json()); // какой-то модуль для парсинга JSON в запросах
// server.use(express.methodOverride()); // put and delete
// server.use(server.router); // модуль для простого задания обработчиков путей
server.use(express.static(path.join(__dirname, 'public'))); // запуск статического файлового сервера
// который смотрит на папку public/ отдает index.html

server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');

  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();

  server.options('*', (req, res) => {
    res.header('Access-Control-Allow-Methods', 'GET, PATCH, PUT, POST, DELETE, OPTIONS');
    res.send();
  })
});

server.get('/api', (req, res) => res.send('API в строю!'));

// Create a new MongoClient
const client = new MongoClient(dataBaseConfig.url, { useNewUrlParser: true });

// Use connect method to connect to the Server
// client.connect(function(err) {
//   assert.equal(null, err);
//   console.log("Connected successfully to server");

//   const db = client.db(dbName);

//   client.close();
// });


client.connect((err) => {
    if(err) return console.log(err);

    const {dbName, collectionName} = dataBaseConfig;

    console.log('Successful connection to db');
    const dataBase = client.db(dbName);
    const collection = client.db(dbName).collection(collectionName);

    routes(server, dataBase);
    server.listen(port, () => console.log('Express server listening on port' + port));

    // perform actions on the collection object
    client.close();
});
