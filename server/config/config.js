// Sets up environment variables.
// Heroku will automatically set NODE_ENV = production.
// Test scripts will automatically set NODE_ENV = test. (see package.json)
// The below line will default the NODE_ENV to development if it is not set.
var env = process.env.NODE_ENV || 'development';
console.log('env *********', env);

if( env === 'development' ) {
  process.env.PORT = 3000;
  process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
} else if ( env === 'test' ) {
  process.env.PORT = 3000;
  process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
}
