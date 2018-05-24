var mongoose = require('mongoose');

// Mongoose uses callbacks by default. Set mongoose to Promise.
mongoose.Promise = global.Promise;
// Connect to the database through mongoose.
// const db = {
//   localhost: 'mongodb://localhost:27017/TodoApp',
//   mlab: 'mongodb://db_user:db_pass@ds016298.mlab.com:16298/todo-api-app'
// }

//mongoose.connect(process.env.PORT ? db.mlab : db.localhost);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/TodoApp');

module.exports = {
  mongoose: mongoose
};
