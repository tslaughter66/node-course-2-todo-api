const {User} = require('./../model/user');

// Middleware method to authenticate the user token sent in by request.
var authenticate = (req,res,next) => {
  var token = req.header('x-auth'); // get the token off the request header.

  User.findByToken(token)
    .then((user) => {
      // If user not found. JWT was found but couldn't get document from database.
      if(!user) {
        // send Promise.reject(). Will go to "catch" block below.
        return Promise.reject();
      }

      // if user was returned, load values into the request so calling method can access them.
      req.user = user;
      req.token = token;
      next();
    }).catch((e) => {
      // catch block means request didn't send in a valid jwt.
      res.status(401).send();
    });
};

module.exports = {authenticate};
