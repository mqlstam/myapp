// Import necessary modules and setup chai
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const should = chai.should();
chai.use(chaiHttp);

// Define a helper function to log in a user and return their token
async function loginUser(email, password) {
  const response = await chai
    .request(app)
    .post('/login')
    .send({ email, password });

  return response.body.token;
}

// Define the test suite for user management
describe('User Management', function () {
  // Store the generated token and userId for later use in test cases
  let token;
  let userId;

  // Define a hook to log in the admin user and generate a token
  before(async () => {
    token = await loginUser('admin@example.com', 'admin123');
  });

  // Define the test cases
  it('TC-201-5 User successfully registered', (done) => {
    chai
      .request(app)
      .post('/register')
      .send({ email: 'unique_test@example.com', password: 'password123' })
      .end((err, res) => {
        res.body.should.be.an('object');
        res.body.should.have.property('message');
        res.body.message.should.match(/Registered email .+ with id \d+/);
        userId = parseInt(res.body.message.match(/\d+/)[0], 10);
        done();
      });
  });

  it('TC-202-1 Show all users (minimum 2)', (done) => {
    chai
      .request(app)
      .post('/register')
      .send({ email: 'test2@example.com', password: 'password123' })
      .end((err, res) => {
        chai
          .request(app)
          .get('/api/users')
          .set('x-access-token', token)
          .end((err, res) => {
            res.body.should.be.an('array');
            res.body.length.should.be.at.least(2);
            done();
          });
      });
  });

  it('TC-203-2 User logged in with a valid token', async () => {
    token = await loginUser('test@example.com', 'password123');
    token.should.exist;
  });

  it('TC-204-3 User ID exists', (done) => {
    chai
      .request(app)
      .get(`/user/${userId}`)
      .end((err, res) => {
        res.body.should.be.an('object');
        res.body.should.have.property('id').to.be.equal(userId);
        done();
      });
  });

  it('TC-206-4 User successfully deleted', (done) => {
    // Log in the admin user and generate a token
    chai
      .request(app)
      .post('/login')
      .send({ email: 'admin@example.com', password: 'admin123' })
      .end((err, res) => {
        const adminToken = res.body.token;

        // Then delete the user
        chai
          .request(app)
          .delete(`/api/users/${userId}`)
          .set('x-access-token', adminToken)
          .end((err, res) => {
            res.status.should.be.equal(200);
            done();
          });
      });
  });
});
