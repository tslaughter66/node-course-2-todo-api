var mongoose = require('mongoose');

// create the Todo model that mongoose will use to insert.
// the return value is a constructor (see below)
var Todo = mongoose.model('Todo',{
  text: {
    type: String,
    required: true,
    minLength: 1,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Number,
    default: null
  },
  _creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

// call Todo constructor to create instance
// var newTodo = new Todo({
//   text: 'Cook dinner'
// });
//
// // call mongoose's save function.
// newTodo.save()
//   .then((doc) => {
//     console.log('Saved Todo', doc);
//   }, (e) =>{
//     console.log('Unable to save Todo.');
//   });

module.exports = {
  Todo: Todo
};
