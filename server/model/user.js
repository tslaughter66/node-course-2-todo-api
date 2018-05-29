const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

// Schema is how you want your mongodb document set up.
// Using schemas allows you to add instance methods to schemas
var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minLength: 1,
    unique: true,
    validate: {                       // used to validate the property (in this case, email)
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email.' // message takes the failure message if property isn't valid.
    }
  },
  password: {
    type: String,
    require: true,
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

// Override the toJSON method so that we only send back certain data. No reason to send back password or tokens.
UserSchema.methods.toJSON = function () {
  var user = this;  // get the this object.
  var userObject = user.toObject();

  return _.pick(userObject, ['_id','email']);
};

// Add a generateAuthToken method to the UserSchema.
// Use regular function since you need the "this" object.
UserSchema.methods.generateAuthToken = function () {
  var user = this;      // get the this object.
  var access = 'auth';  // name the token.
  //create the jwt sign. Pass in the data you want to encrypt and the SALT.
  var token = jwt.sign({_id: user._id.toHexString(), access},'abc123').toString();

  // add the access and token onto the actual user token array.
  user.tokens = user.tokens.concat([{access, token}]);

  // save the user document.
  return user.save().then(() => {
      return token;
  });
};

UserSchema.statics.findByToken = function (token) {
  var User = this;      // get the userSchema, not an individual user
  var decoded;

  try {
    // try to get the verified token.
    decoded = jwt.verify(token,'abc123');
  } catch (e) {
    // If verify fails, send a reject promise. Whatever method calls this method will go to the "catch" in their method.
    return Promise.reject();
  }

  // if the decoded was successful, call findOne.
  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,    // Query a sub-structure by wrapping in quotes.
    'tokens.access': 'auth'
  });
};

// create the User model that mongoose will use to insert.
var User = mongoose.model('User', UserSchema);

// Example object.
// {
//   email: 'example@example.com',
//   password: 'ExamplePass',      // Need to encrypt password
//   tokens: [{                    // Array of token objects
//     access: 'auth',             // Name of token
//     token: 'sdfsfsfsdfrfrervd', // example token, hashed value.
//   }]
// }

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
