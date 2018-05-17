var mongoose = require('mongoose');

// create the User model that mongoose will use to insert.
var User = mongoose.model('User', {
  email: {
    type: String,
    required: true,
    trim: true,
    minLength: 1
  }
});

// use constructor to create instance
// var newUser = new User({email: 'test@test.com'});
//
// // save the user instance using mongoose.
// newUser.save()
//   .then((doc) => {
//     console.log('Saved User', newUser);
//   }, (err) => {
//     console.log('Could not save user.');
//   });

module.exports = {
  User: User
};
