const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../model/todo');
const {User} = require('./../../model/user');

// Make up an array of dummy users to fill database.
const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const users = [{
  // valid user with web token
  _id: userOneId,
  email: 'tim@example.com',
  password: 'userOnePass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneId, access: 'auth'}, process.env.JWT_SECRET).toString()
  }]
}, {
  // create invalid user.
  _id: userTwoId,
  email: 'audrey@example.com',
  password: 'userTwoPass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userTwoId, access: 'auth'}, process.env.JWT_SECRET).toString()
  }]
}];

// Make up an array of dummy todos to fill database.
const todos = [{
  _id: new ObjectID(),
  text: 'First test todo',
  _creator: userOneId
}, {
  _id: new ObjectID(),
  text: 'Second test todo',
  completed: true,
  completedAt: 333,
  _creator: userTwoId
}];

// create populateTodos method which is called by beforeEach
const populateTodos = (done) => {
  // .remove clears the database
  Todo.remove({}).then(() => {
    // insertMany() inserts the todos created above
    return Todo.insertMany(todos);
  }).then(() => done())
};

// create populateUsers method which is called by beforeEach
const populateUsers = (done) => {
  // .remove clears the database
  User.remove({}).then(() => {
    // Need to call User.save in order to hash the password using the UserSchema.pre call.
    var userOne = new User(users[0]).save();
    var userTwo = new User(users[1]).save();

    // We want to wait for userOne and userTwo to both save before doing any "then".
    // Promise.all waits for all promises in the array before exectuing the "then" methods.
    // return the result of Promise.all which is caught by the "then" a couple lines below.
    return Promise.all([userOne,userTwo]);
  }).then(() => done());
};

module.exports = {todos, populateTodos, users, populateUsers};
