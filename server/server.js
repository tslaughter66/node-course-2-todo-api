// Require - 3rd Party
var express = require('express');
var bodyParser = require('body-parser');

// Require - local
var {mongoose} = require('./db/mongoose.js');
var {Todo} = require('./model/todo');
var {User} = require('./model/user');

// create the web application using express
var app = express();

// Configure Middleware
app.use(bodyParser.json());

// Create a new Todo using POST
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

// tell web app to start listening on the given port.
app.listen(3000, () => {
  console.log('Started on port 3000');
});
