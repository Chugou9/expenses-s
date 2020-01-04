const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URi
const uri = "mongodb+srv://chugou:ZrLBDwID9@expenses-qgtlm.gcp.mongodb.net/test?retryWrites=true&w=majority";

// Database Name
const dbName = 'expensesDB';
const collectionName = 'expensesCollection';

// Create a new MongoClient
const client = new MongoClient(uri, { useNewUrlParser: true });

// Use connect method to connect to the Server
// client.connect(function(err) {
//   assert.equal(null, err);
//   console.log("Connected successfully to server");

//   const db = client.db(dbName);

//   client.close();
// });


client.connect(err => {
    console.log('Successful connection to db');
  const collection = client.db(dbName).collection(collectionName);
  // perform actions on the collection object
  client.close();
});
