const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../model/todo');
const {User} = require('./../model/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

// Add testing lifecycle method to prep db for test cases
beforeEach(populateUsers);
beforeEach(populateTodos);

// Create a describe block to group the tests together
describe('POST /todos', () => {
  // Test the successful POST to /todos.
  // in callback, we use "done" for async testing.
  it('should create a new todo', (done) => {
    var text = 'Test todo text';

    request(app)
      .post('/todos') // call post with text value
      .send({text})
      .set('x-auth', users[0].tokens[0].token)      // .set method sets values in the header.
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
      .set('x-auth', users[0].tokens[0].token)      // .set method sets values in the header.
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
      .set('x-auth', users[0].tokens[0].token)      // .set method sets values in the header.
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(1);     // Expect 1 todo associated with this user.
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return a todo doc',(done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)   // get the id from the created todos (see beforeEach above).
      .set('x-auth', users[0].tokens[0].token)      // .set method sets values in the header.
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('should not return a todo doc created by other user',(done) => {
    request(app)
      .get(`/todos/${todos[1]._id.toHexString()}`)   // Get seeded id for user[1]
      .set('x-auth', users[0].tokens[0].token)      // Send auth token for user[0].
      .expect(404)
      .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    var hexId = new ObjectID().toHexString(); // create a new OBjectID which means it won't be in the DB
    request(app)
      .get(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)      // .set method sets values in the header.
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object ids', (done) => {
    request(app)
      .get(`/todos/12345`)    // pass in random id number that doesn't have ObjectID structure
      .set('x-auth', users[0].tokens[0].token)      // .set method sets values in the header.
      .expect(404)
      .end(done);
  });
});

describe('DELETE /todos/:id',() => {
  it('should remove a todo.', (done) => {
    var hexId = todos[1]._id.toHexString();

    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)      // .set method sets values in the header.
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(hexId);
      })
      .end((err, res) => {
        if(err) {
          return done(err);
        }

        Todo.findById(hexId).then((todo) => {
          expect(todo).toBeFalsy();    // check that the todo no longer exists
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not remove a todo that does not belong to user.', (done) => {
    var hexId = todos[0]._id.toHexString();         // Attempt to delete todo belonging to user[0]

    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)      // Pass in token for user[1]
      .expect(404)
      .end((err, res) => {
        if(err) {
          return done(err);
        }

        Todo.findById(hexId).then((todo) => {
          expect(todo).toBeTruthy();    // check that the todo still exists since it shouldn't delete.
          done();
        }).catch((e) => done(e));
      });
  });

  it('should return 404 if todo not found.', (done) => {
      var hexId = new ObjectID().toHexString(); // create a new OBjectID which means it won't be in the DB
      request(app)
        .delete(`/todos/${hexId}`)
        .set('x-auth', users[1].tokens[0].token)      // .set method sets values in the header.
        .expect(404)
        .end(done);
  });

  it('should return 404 if ObjectId not valid.', (done) => {
    request(app)
      .get(`/todos/12345`)    // pass in random id number that doesn't have ObjectID structure
      .set('x-auth', users[1].tokens[0].token)      // .set method sets values in the header.
      .expect(404)
      .end(done);
  });
});

describe('PATCH /todos/:id', () => {
  it('should update the todo', (done) => {
    var hexId = todos[0]._id.toHexString();
    var updatedText = 'Updated text';

    request(app)
      .patch(`/todos/${hexId}`)
      .send({text: updatedText, completed: true})             // send the updated values
      .set('x-auth', users[0].tokens[0].token)                // .set method sets values in the header.
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(updatedText);              // Check that text was updated.
        expect(res.body.todo.completed).toBe(true);                // Check that completed was updated
        expect(typeof res.body.todo.completedAt).toBe('number');   // Check that completedAt is a number
      })
      .end(done);
  });

  it('should not update the todo that does not belong to user.', (done) => {
    var hexId = todos[0]._id.toHexString();                   // Attempt to update todo belonging to user[0]
    var updatedText = 'Updated text';

    request(app)
      .patch(`/todos/${hexId}`)
      .send({text: updatedText, completed: true})             // send the updated values
      .set('x-auth', users[1].tokens[0].token)                // send auth token belonging to user[1]
      .expect(404)
      .end(done);
  });

  it('should clear completedAt when todo is not completed', (done) => {
    var hexId = todos[1]._id.toHexString();
    var updatedText = 'Updated text for second test.';

    request(app)
      .patch(`/todos/${hexId}`)
      .send({text: updatedText, completed: false})             // send the updated values
      .set('x-auth', users[1].tokens[0].token)                // .set method sets values in the header.
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(updatedText);              // Check that text was updated.
        expect(res.body.todo.completed).toBe(false);               // Check that completed was updated.
        expect(res.body.todo.completedAt).toBeFalsy();    // Check that completedAt is a number
      })
      .end(done);
  });
});

describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth',users[0].tokens[0].token)               // .set method sets values in the header.
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());    // check that the _id of returned user is same as user array value.
        expect(res.body.email).toBe(users[0].email);        // ensure email is expected.
      })
      .end(done);
  });

  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});     // expect an empty object to return since we didn't pass in a jwt in the header.
      })
      .end(done);
  });
});

describe('POST /users', () => {
  it('should create a user', (done) => {
    var email = 'example@example.com';
    var password = '123mnb!';

    request(app)
      .post('/users')
      .send({email,password})     // send the user data to the request
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy();      // expect the jwt to be passed back.
        expect(res.body._id).toBeTruthy();               // expect an id to be passed back.
        expect(res.body.email).toBe(email);           // expect the email to be the same as the one passed in.
      }).end((err) => {
        if(err) {
          return done(err);
        }

        // get user from database by email
        User.findOne({email}).then((user) => {
          expect(user).toBeTruthy();                      // user should exist.
          expect(user.password).not.toBe(password);     // password should not be the same as the one above since we should hash it.
          done();
        }).catch((e) => done(e));
      });
  });

  it('should return validation errors if request invalid', (done) => {
    var invalidEmail = 'invalidEmail';
    var invalidPass = 'abc';

    request(app)
      .post('/users')
      .send({invalidEmail, invalidPass})
      .expect(400)
      .end(done);
  });

  it('should not create user if email in use', (done) => {
    var usedEmail = users[0].email;
    var password = 'Password123!';

    request(app)
      .post('/users')
      .send({usedEmail, password})
      .expect(400)
      .end(done);
  });
})

describe('POST /users/login', () => {
  it('should login user and return auth token.', (done) => {
    request(app)
      .post('/users/login')
      .send({
        // use user from the seed data
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy();
      })
      .end((err, res) => {
        if(err) {
          return done(err);
        }

        // Check that the user in database has updated token.
        User.findById(users[1]._id).then((user) => {
          expect(user.toObject().tokens[1]).toMatchObject({
            access: 'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch((e) => done(e));
      });
  });

  it('should reject invalid login.', (done) => {
    request(app)
      .post('/users/login')
      .send({
        // use user from the seed data
        email: users[1].email,
        password: 'INCORRECT_PASSWORD'      // Login should fail since we are using incorrect password.
      })
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeFalsy();
      })
      .end((err, res) => {
        if(err) {
          return done(err);
        }

        // Check that the user only has 1 token (seeded token). No new token created since login failed.
        User.findById(users[1]._id).then((user) => {
          expect(user.tokens.length).toBe(1);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('DELETE /users/me/token', () => {
  it('should remove auth token on log out.', (done) => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth',users[0].tokens[0].token)               // .set method sets values in the header.
      .expect(200)
      .end((err, res) => {
        if(err) {
          return done(err);
        }

        // Check that the user in the database has no token since we deleted it.
        User.findById(users[0]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((e) => done(e));
      });
  });
});
