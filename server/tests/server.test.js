const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../model/todo');

// Make up an array of dummy todos to fill database for /GET.
const todos = [{
  text: 'First test todo'
}, {
  text: 'Second test todo'
}];

// Add testing lifecycle method to prep db for test cases
beforeEach((done) => {
  // .remove clears the database
  Todo.remove({}).then(() => {
    // insertMany() inserts the todos created above
    return Todo.insertMany(todos);
  }).then(() => done())
});

// Create a describe block to group the tests together
describe('POST /todos', () => {
  // Test the successful POST to /todos.
  // in callback, we use "done" for async testing.
  it('should create a new todo', (done) => {
    var text = 'Test todo text';

    request(app)
      .post('/todos') // call post with text value
      .send({text})
      .expect(200)    // expcting a 200 respose
      .expect((res) => {        // customer expect which returns the response.
        expect(res.body.text).toBe(text);     // expect that the response body matches the text
      })
      .end((err, res) => {      // .end is the end of our request block. Still need to check that the db was updated
        // if error exists, return done with the error
        if(err) {
          return done(err);
        }

        // get todo with "text" from the database
        Todo.find({text}).then((todos) => {
          expect(todos.length).toBe(1);   // expect that only one entry was added
          expect(todos[0].text).toBe(text);   // expect that the entry's text is the correct text
          done();                         // call done
        }).catch((e) => done(e));         // catch any error. If so, return done with the error
      })
  }); // end of 'it should create a new todo'

  // test the unsuccessful POST to /todos.
  it('should not create todo with invalid body data', (done) => {
    request(app)
      .post('/todos')
      .send({})     // send an empty object which causes failure since todos requires text
      .expect(400)
      .end((err, res) => {
        // if error exists, return done with the error
        if(err) {     // .end is the end of our request block. Still need to check that the db was NOT updated
          return done(err);
        }

        // check that Todos has 2 entries which were added before the test ran (see beforeEach above).
        Todo.find().then((todos) => {
          expect(todos.length).toBe(2);
          done();
        }).catch((e) => done(e));
      })
  });
});

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  })
});
