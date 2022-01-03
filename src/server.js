const express = require('express');
const server = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

const assert = require('assert');
const path = require('path');
const dataBaseConfig = require('./Config/DataBaseConfig.js');

const pupRoutes = require('./routes/PublicUtilityPaymentsRoutes');
const authRoute = require('./routes/AuthRoutes');
const cookieParser = require('cookie-parser');

const port = 1337;
dotenv.config();

server.use(bodyParser.urlencoded({extended: true}));
server.use(bodyParser.json());
server.get('/tst', (req, res) => {
  res.json({'message': 'Hello Crud node express!'});
});

server.use(cookieParser());


server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'DELETE, GET, PATCH, PUT, POST, OPTIONS');
  
  
  server.options('*', (req, res) => {
    
    res.header('Content-Type', 'text/plain');
    res.send();
  });
  
  next();
});

server.get('/api', (req, res) => res.send('API в строю!'));
server.get('/api/user/login', (req, res) => {
  console.log('request', req, 'response', res);
});

//route middelware
server.use('/api/user', authRoute);
server.use('/public-utility-payments', pupRoutes);


mongoose.connect(
  process.env.DB_CONNECT,
  {useNewUrlParser: true}
).then(
  () => {
    console.log('*** Connected to Database!!! ***');
    server.listen(port, () => {
      console.log(`*** Server is listening ${port} port!!! ***`);
    });
  },
  (err) => {
    console.error('*** Could not connect to the database', err);
    process.exit();
  }
);
