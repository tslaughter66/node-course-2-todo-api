const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');

var data = {
  id: 10
};

var token = jwt.sign(data, '123abc');
console.log(token);

var decoded = jwt.verify(token, '123abc')
console.log(decoded);
// var message = 'I am user #3.';
// var hash = SHA256(message).toString();
//
// console.log(`message : ${message}`)
// console.log(`hash : ${hash}`)
//
// var data = {
//   id: 4
// };
// var token = {
//   data,
//   hash: SHA256(JSON.stringify(data) + 'somesecret').toString()
// };
//
// token.data = 5;
// token.hash = SHA256(JSON.stringify(token.data)).toString();
//
// var resultHash = SHA256(JSON.stringify(data) + 'somesecret').toString();
//
// if(resultHash === token.hash) {
//   console.log('Data not changed');
// } else {
//   console.log('Data changed. Do not use.');
// }
