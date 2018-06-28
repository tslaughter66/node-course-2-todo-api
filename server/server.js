// Set up the config file.
require('./config/config');

// Require - 3rd Party
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectId} = require('mongodb');

// Require - local
// Run from : C:/Program Files/MongoDb/Server/3.6/bin. mongod.exe --dbpath /Users/Tim/mongo-data
var {mongoose} = require('./db/mongoose.js');
var {Todo} = require('./model/todo');
var {User} = require('./model/user');
var {authenticate} = require('./middleware/authenticate');

// create the web application using express
var app = express();
// set up a PORT argument. If deployed, will use heroku port, otherwise, local.
const port = process.env.PORT;

// Configure Middleware
app.use(bodyParser.json());

// POST - Create a new Todo from request body text. Send back 200 and new doc.
// If error, send back 400 and error message.
app.post('/todos', authenticate, (req, res) => {
  var todo = new Todo({
    text: req.body.text,
    _creator: req.user._id    // user/token added to req by authenticate middleware.
  });
  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

// GET - return all todos.
app.get('/todos', authenticate, (req, res) => {
  // Get todos using the find() methods.
  // "then" promise requires two functions as arguments -> success case and failure case
  Todo.find({
    _creator: req.user._id    // Only fetch todos for the user.
    }).then((todos) => {
    // instead of just passing back "todos" as an array, pass back an object with the todos array on it.
    // this future-proofs the call so that we can add more return values later if we want.
    res.send({todos});
  }, (e) => {
    res.status(400).send(e);
  });
})

// GET - return a specific todo
// using ":id" creates an id varible in the request object based on the parameters passed in the url
app.get('/todos/:id', authenticate, (req,res) => {
  var id = req.params.id;         // get the id from the url request

  // validate Id using ObjectId.isValid. If not valid, return 404 and empty response.
  if( !ObjectId.isValid(id) ) {
    return res.status(404).send();
  }

  // use findOne to get the todo.
  Todo.findOne({
    _id: id,                  // Fetch todo by Id
    _creator: req.user._id    // Only fetch todos for the user.
  }).then((todo) => {
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

// DELETE = delete a specific todo.
app.delete('/todos/:id', authenticate, async (req,res) => {
  const id = req.params.id;         // get the id from the url request

  // validate Id using ObjectId.isValid. If not valid, return 404 and empty response.
  if( !ObjectId.isValid(id) ) {
    return res.status(404).send();
  }

  try {
    // Fetch todo by id and creator.
    const todo = await Todo.findOneAndRemove({_id: id, _creator: req.user._id});
    // if no todo found, throw an error.
    if(!todo) {
      return res.status(404).send();
    }
    // if the todo exists, send it back.
    res.send({todo});
  } catch (e) {
    // error with find. send back 400 and empty response
    res.status(400).send();
  }

  // // use findOneAndDelete to delete the todo.
  // Todo.findOneAndRemove({
  //   _id: id,                  // Fetch todo by Id
  //   _creator: req.user._id    // Only fetch todos for the user.
  // }).then((todo) => {
  //   // if no todo found - send back 404 with empty body
  //   if( !todo ) {
  //     return res.status(404).send();
  //   }
  //   // if the todo exists, send it back.
  //   res.send({todo});
  // }).catch((e) => {
  //   res.status(400).send();// error with find. send back 400 and empty response
  // });
});

// PATCH - update a todo.
app.patch('/todos/:id', authenticate, (req,res) => {
  var id = req.params.id;
  //use lodash module to get parameters from body. Only want user to be able to update some properties.
  var body = _.pick(req.body, ['text','completed']);

  // validate Id using ObjectId.isValid. If not valid, return 404 and empty response.
  if( !ObjectId.isValid(id) ) {
    return res.status(404).send();
  }

  // Check if the completed param is a boolean and if it is true.
  if(_.isBoolean(body.completed) && body.completed) {
    // If boolean and true, add the completedAt timestamp.
    body.completedAt = new Date().getTime();
  } else {
    // If it is not boolean or not true, set completed to false and clear completedAt
    body.completed = false;
    body.completedAt = null;
  }

  // Update the todo in the database.
  // Pass in the body object since it now contains all fields we want to pass in.
  // "new" param means mongoose will return the updated todo.
  Todo.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: body}, {new: true}).then((todo) => {
    // If todo doesn't exist, send 404
    if(!todo) {
      return res.status(404).send();
    }

    // Everything went as expected. Send todo back.
    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  });
});

// POST - create a new user.
app.post('/users', async (req,res) => {
  try {
    const body = _.pick(req.body, ['email', 'password']);
    const user = new User(body);

    await user.save();
    const token = await user.generateAuthToken(); // generate the authToken.
    res.header('x-auth', token).send(user);       // In the response header, send back the token
  } catch (e) {
    res.status(400).send(e);
  }
});

// GET - get a user based on a passed in authToken
app.get('/users/me', authenticate, (req,res) => {
  // Get the user off the request and send it back. user added to request by authenticate method.
  res.send(req.user);
});

// POST - log in a user. /users/login {email, password}
app.post('/users/login', async (req,res) => {
  try {
    // pick off email and possword
    const body = _.pick(req.body, ['email','password']);
    const user = await User.findByCredentials(body.email, body.password);
    const token = await user.generateAuthToken();
    res.header('x-auth', token).send(user);
  } catch (e) {
    // could not find or validate user.
    res.status(400).send();
  }
});

// DELETE - log out a user.
app.delete('/users/me/token', authenticate,  async (req,res) => {
  // Call removeToken on the user. User and Token added to response by authenticate middleware.
  try {
    await req.user.removeToken(req.token);
    res.status(200).send();     // if successful
  } catch (e) {
    res.status(400).send();     // if not successful
  }
});

// tell web app to start listening on the given port.
app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});

module.exports = {app};
