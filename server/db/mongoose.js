var mongoose = require('mongoose');

// Mongoose uses callbacks by default. Set mongoose to Promise.
mongoose.Promise = global.Promise;

// Connect to the database through mongoose.
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/TodoApp');

module.exports = {
  mongoose: mongoose
};
