const {ObjectId} = require('mongodb');
const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/model/todo');

var id = '5b038f292c0680542549a9bc';

// Use ObjectId.isValid to check if the passed in id is even an id type
if(!ObjectId.isValid(id)) {
  return console.log('id not valid');
}

// gets all todos since we do not pass any parameters
Todo.find();

// query for a specific object using id
Todo.find({
  _id: id     // Mongoose will automatically convert id variable into an ObjectId object
}).then((todos) => {    // parameter is the entries passed back by mongoose
  console.log('Todos', todos);
});

// returns first entry that matches your query
Todo.findOne({
  _id: id     // Mongoose will automatically convert id variable into an ObjectId object
}).then((todo) => {    // parameter is the entries passed back by mongoose
  if(!todo) {                         // if id doesn't exist, fail gracefully
    return console.log('id not found');
  }

  console.log('Todo', todo);
}).catch((e) => console.log(e));      // catch block used if id passed in is invalid;

// search by id
Todo.findById(id).then((todo) => {    // parameter is the entries passed back by mongoose
  if(!todo) {                         // if id doesn't exist, fail gracefully
    return console.log('id not found');
  }
  console.log('Todo by Id', todo);
}).catch((e) => console.log(e));      // catch block used if id passed in is invalid
