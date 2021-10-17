const express = require('express');
const server = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

const assert = require('assert');
const path = require('path');
const dataBaseConfig = require('./Config/DataBaseConfig');

const pupRoutes = require('./routes/PublicUtilityPaymentsRoutes');
const authRoute = require('./routes/AuthRoutes');

const port = 1337;

dotenv.config();

//connect to db
mongoose.connect(
  process.env.DB_CONNECT, 
  {useNewUrlParser: true,
  useUnifiedTopology: true},
  () => console.log('*** Connected to db ***')
);

//middleware

server.use(express.json());

// // parse application/x-www-form-urlencoded
// server.use(bodyParser.urlencoded({ extended: false }))
// server.use(bodyParser.json()); // какой-то модуль для парсинга JSON в запросах
// // server.use(express.methodOverride()); // put and delete
// // server.use(server.router); // модуль для простого задания обработчиков путей
// server.use(express.static(path.join(__dirname, 'public'))); // запуск статического файлового сервера
// // который смотрит на папку public/ отдает index.html

// server.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
//   res.header('Access-Control-Allow-Methods', 'DELETE, GET, PATCH, PUT, POST, OPTIONS');
  
  
//   server.options('*', (req, res) => {
    
//     res.header('Content-Type', 'text/plain');
//     res.send();
//   });
  
//   next();
// });

// server.get('/api', (req, res) => res.send('API в строю!'));

// // Prints "MongoError: bad auth Authentication failed."
// mongoose.connect(dataBaseConfig.url, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   useFindAndModify: false,
//   serverSelectionTimeoutMS: 5000,
//   dbName: dataBaseConfig.dbName
// }).catch(err => console.log(err.reason));
// const dataBase = mongoose.connection;
// dataBase.on('error', (error) => console.log(error));
// dataBase.once('open', () => console.log('connected to database'));

//route middelware
server.use('/api/user', authRoute);
server.use('/public-utility-payments', pupRoutes);
server.listen(port, () => console.log('*** Server started ***', port));
server.emit('Lol kek chebyrek');
// server.get('/', (req, res) => res.send('API functioning'));