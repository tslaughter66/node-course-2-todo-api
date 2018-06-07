// Sets up environment variables.
// Heroku will automatically set NODE_ENV = production.
// Test scripts will automatically set NODE_ENV = test. (see package.json)
// The below line will default the NODE_ENV to development if it is not set.
var env = process.env.NODE_ENV || 'development';

if( env === 'development' || env === 'test' ) {
  // If we are in dev or test, get the environment variables from the json file.
  var config = require('./config.json');
  var envConfig = config[env];

  // Loop through the keys in the array and set the environment variables.
  Object.keys(envConfig).forEach((key) => {
    process.env[key] = envConfig[key];
  });
}
