// const chai = require('chai');
// const chaiHttp = require('chai-http');
// const server = require('../../index');
// const assert = require('assert');
// const dbconnection = require('../../src/util/mysql-db');
// const jwt = require('jsonwebtoken');
// const { jwtSecretKey, logger } = require('../../src/util/utils');
// require('tracer').setLevel('trace');

// chai.should();
// chai.use(chaiHttp);

// describe('User API', () => {
//   const serverUrl = 'db-mysql-ams3-46626-do-user-8155278-0.b.db.ondigitalocean.com';
//   let token = '';
//   const userId = 3;
//   this.timeout(100000);

//   before(function (done) {
//     // Generate token for test user
//     token = jwt.sign({ id: userId }, jwtSecretKey, {
//       expiresIn: 86400 // 24 hours
//     });
//     done();
//   });

//   // TC-201-1
//   it('should not register a new user if a required field is missing', (done) => {
//     chai
//       .request(serverUrl)
//       .post('/api/user')
//       .send({
//         password: 'password',
//       })
//       .end((err, res) => {
//         res.should.have.status(400);
//         assert.equal(res.body.error, 'Email and password are required');
//         done();
//       });
//   });

//   // TC-201-2
//   it('should not register a new user if the email address is invalid', (done) => {
//     chai
//       .request(serverUrl)
//       .post('/api/user')
//       .send({
//         emailAdress: 'invalidEmail',
//         password: 'password',
//       })
//       .end((err, res) => {
//         res.should.have.status(400);
//         assert.equal(res.body.error, 'Invalid emailAdress format');
//         done();
//       });
//   });

//   // TC-201-3
//   it('should not register a new user if the password is invalid', (done) => {
//     chai
//       .request(serverUrl)
//       .post('/api/user')
//       .send({
//         emailAdress: 'test@example.com',
//         password: 'pass',
//       })
//       .end((err, res) => {
//         res.should.have.status(400);
//         assert.equal(res.body.error, 'Password must be at least 8 characters long');
//         done();
//       });
//   });

//   // TC-201-4
//   it('should not register a new user if the user already exists', (done) => {
//     chai
//       .request(serverUrl)
//       .post('/api/user')
//       .send({
//         emailAdress: 'h.huizinga@server.nl',
//         password: 'password',
//       })
//       .end((err, res) => {
//         res.should.have.status(409);
//         assert.equal(res.body.error, 'Email already exists');
//         done();
//       });
//   });

//   // TC-201-5
//   it('should register a new user if all fields are valid and user does not exist', (done) => {
//     chai
//       .request(serverUrl)
//       .post('/api/user')
//       .send({
//         emailAdress: 'test@example.com',
//         password: 'password123',
//         firstName: 'Test',
//         lastName: 'User',
//         street: 'Test Street',
//         city: 'Test City',
//       })
//       .end((err, res) => {
//         res.should.have.status(200);
//         assert.equal(res.body.message, 'Registered emailAdress test@example.com');
//         assert.equal(res.body.data.emailAdress, 'test@example.com');
//         assert.equal(res.body.data.firstName, 'Test');
//         assert.equal(res.body.data.lastName, 'User');
//         assert.equal(res.body.data.street, 'Test Street');
//         assert.equal(res.body.data.city, 'Test City');
//         done();
//       });
//   });
// });

       
