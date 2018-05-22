// Require - 3rd Party
var express = require('express');
var bodyParser = require('body-parser');

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
  })
})

// tell web app to start listening on the given port.
app.listen(3000, () => {
  console.log('Started on port 3000');
});

module.exports = {app};
