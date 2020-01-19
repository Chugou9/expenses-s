const routes = require('./routes/PublicUtilityPaymentsRoutes');
const mongoose = require('mongoose');
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

// Prints "MongoError: bad auth Authentication failed."
mongoose.connect(dataBaseConfig.url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  dbName: dataBaseConfig.dbName
}).catch(err => console.log(err.reason));
const dataBase = mongoose.connection;
dataBase.on('error', (error) => console.log(error));
dataBase.once('open', () => console.log('connected to database'));

server.use('/public-utility-payments', routes);
server.listen(port, () => console.log('server started'));