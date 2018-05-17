// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if(err) {
    return console.log('Unable to connect to MongoDB server.');
  }
  console.log('Connected to MongoDB server.');

  db.collection('Todos')
    .findOneAndUpdate({
      _id: new ObjectID('5afce070769a8108addfcade')
    }, {
      $set: {
        completed: true
      }
    }, {
      returnOriginal: false
    })
    .then((result) => {
      console.log(JSON.stringify(result));
    });

  db.close();
});
