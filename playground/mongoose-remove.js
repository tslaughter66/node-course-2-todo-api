const {ObjectId} = require('mongodb');
const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/model/todo');
const {User} = require('./../server/model/user');

// Todo.remove - Remove all records
// Todo.remove({}).then((result) =>{
//   console.log(result);
// });

// Todo.findOneAndRemove - remove a single record (first record found based on query).
Todo.findOneAndRemove({_id: '5b0968fea23d1c1c8eea65ad'}).then((todo) => {
  console.log(todo);
});

// Todo.findByIdAndRemove - remove the record based on Id.
Todo.findByIdAndRemove('5b0968fea23d1c1c8eea65ad').then((todo) => {
  console.log(todo);
});
