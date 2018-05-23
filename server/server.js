// Require - 3rd Party
var express = require('express');
var bodyParser = require('body-parser');
const {ObjectId} = require('mongodb');

// Require - local
// mongod.exe --dbpath /Users/Tim/mongo-data
var {mongoose} = require('./db/mongoose.js');
var {Todo} = require('./model/todo');
var {User} = require('./model/user');

// create the web application using express
var app = express();

// Configure Middleware
app.use(bodyParser.json());

// POST - Create a new Todo from request body text. Send back 200 and new doc.
// If error, send back 400 and error message.
app.post('/todos',(req, res) => {
  var todo = new Todo({
    text: req.body.text
  });
  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

// GET - return all todos.
app.get('/todos', (req, res) => {
  // Get todos using the find() methods.
  // "then" promise requires two functions as arguments -> success case and failure case
  Todo.find().then((todos) => {
    // instead of just passing back "todos" as an array, pass back an object with the todos array on it.
    // this future-proofs the call so that we can add more return values later if we want.
    res.send({todos});
  }, (e) => {
    res.status(400).send(e);
  });
})

// GET - return a specific todo
// using ":id" creates an id varible in the request object based on the parameters passed in the url
app.get('/todos/:id', (req,res) => {
  var id = req.params.id;         // get the id from the url request

  // validate Id using ObjectId.isValid. If not valid, return 404 and empty response.
  if( !ObjectId.isValid(id) ) {
    return res.status(404).send();
  }

  // use findById to get the todo.
  Todo.findById(id).then((todo) => {
    // if no todo found - send back 404 with empty body
    if( !todo ) {
      return res.status(404).send();
    }
    // if the todo exists, send it back.
    res.send({todo});
  }).catch((e) => {
    res.status(400).send();// error with find. send back 400 and empty response
  });
});

// tell web app to start listening on the given port.
app.listen(3000, () => {
  console.log('Started on port 3000');
});

module.exports = {app};
