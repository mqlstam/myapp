// process.env['DB_DATABASE'] = process.env.DB_DATABASE || 'shareameal-testdb';

// const chai = require('chai');
// const chaiHttp = require('chai-http');
// const server = require('../../index');
// const assert = require('assert');
// const dbconnection = require('../../src/util/mysql-db');
// const jwt = require('jsonwebtoken');
// const { jwtSecretKey, logger } = require('../../src/util/utils');
// require('tracer').setLevel('trace');

// const mysql = require('mysql2');
// const pool = require('../../src/util/mysql-db');

// chai.should();
// chai.use(chaiHttp);

// // Db queries
// const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;';
// const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;';
// const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;';
// const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;

// const INSERT_USER = 'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' + '(1, "first", "last", "name@server.nl", "secret", "street", "city");';
// const INSERT_MEALS = 'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' + "(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," + "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1);";

// pool.on('connection', function (connection) {
//   connection.query(CLEAR_DB, (err, result) => {
//     if (err) throw err;
//     console.log('Database cleared.');

//     connection.query(INSERT_USER, (err, result) => {
//       if (err) throw err;
//       console.log('Users inserted.');

//       connection.query(INSERT_MEALS, (err, result) => {
//         if (err) throw err;
//         console.log('Meals inserted.');
//         logger.info(`Connected to db '${connection.config.database}' on ${connection.config.host}`);
//       });
//     });
//   });
// });



// //   describe('UC-101 Login User', () => {
// //     let token;
// //     before((done) => {
// //         chai
// //             .request(server)
// //             .post('/api/login')
// //             .send({
// //                 "emailAdress": "newuser@ssexample.com",
// //                 "password": "newuserpassword"
// //             })
// //             .end((err, res) => {
// //                 if (err) {
// //                     console.error(err);
// //                     return done(err);
// //                 }
    
// //                 res.should.have.status(200);
// //                 res.body.should.be.an('object').that.has.all.keys('code', 'message', 'data');
// //                 res.body.data.should.be.an('object').that.has.all.keys('id', 'email', 'token');
    
// //                 // Save the token
// //                 token = res.body.data.token;
// //                 done();
// //             });
// //     });
    
    

// //     it('TC-101-1 Required field is missing', (done) => {
        
// //         chai
// //             .request(server)
// //             .post('/api/login')
// //             .send({
// //                 // Missing required field
// //             })
// //             .end((err, res) => {
// //                 assert.ifError(err);
// //                 res.should.have.status(400);
// //                 res.body.should.be.an('object').that.has.all.keys('code', 'message', 'data');
// //                 res.body.data.should.be.empty;
// //                 // User should not be logged in
// //                 done();
// //             });
// //     });

// //     it('TC-101-2 Invalid password', (done) => {
// //         chai
// //             .request(server)
// //             .post('/api/login')
// //             .set('Authorization', `Bearer ${token}`)
// //             .send({
// //                 email: 'user@server.nl',
// //                 password: 'wrongpassword'
// //             })
// //             .end((err, res) => {
// //                 assert.ifError(err);
// //                 res.should.have.status(400);
// //                 res.body.should.be.an('object').that.has.all.keys('code', 'message', 'data');
// //                 res.body.data.should.be.empty;
// //                 // User should not be logged in
// //                 done();
// //             });
// //     });
// //     it('TC-101-3 User does not exist', (done) => {
// //         chai
// //             .request(server)
// //             .post('/api/login')
// //             .send({
// //                 emailAdress: 'nonexistent@server.nl',
// //                 password: 'password'
// //             })
// //             .end((err, res) => {
// //                 assert.ifError(err);
// //                 res.should.have.status(404); //   404 status code
// //                 // User should not be logged in
// //                 done();
// //             });
// //     });
// //     it('TC-101-4 User successfully logged in', (done) => {
// //         chai
// //             .request(server)
// //             .post('/api/login')
// //             .send({
// //                 "emailAdress": "newuser@ssexample.com",
// //                 "password": "newuserpassword"
// //             }
// //             )
// //             .end((err, res) => {
// //                 assert.ifError(err);
// //                 res.should.have.status(200);
// //                 res.body.should.be.an('object').that.has.all.keys('code', 'message', 'data');
// //                 res.body.data.should.be.an('object').that.has.all.keys('id', 'email', 'token');
// //                 // User should be logged in
// //                 done();
// //             });
// //     });


// // });

// // describe('UC-201 Registreren als nieuwe user', () => {
// //     it('TC-201-1 Verplicht veld ontbreekt', (done) => {
// //       chai
// //         .request(server)
// //         .post('/api/user/')
// //         .send({
// //           // Missing required field(s)
// //         })
// //         .end((err, res) => {
// //           assert.ifError(err);
// //           res.should.have.status(400);
// //           res.body.should.be.an('object').that.has.all.keys('code', 'message', 'data');
// //           res.body.code.should.equal(400);
// //           res.body.message.should.be.a('string').that.contains('Required field is missing');
// //           res.body.data.should.be.an('object').that.is.empty;
// //           // User should not be registered
// //           done();
// //         });
// //     });
  
// //     it('TC-201-2 Niet-valide emailadres', (done) => {
// //       chai
// //         .request(server)
// //         .post('/api/user/')
// //         .send({
// //           emailAdress: 'invalidemail',
// //           password: 'password',
// //         })
// //         .end((err, res) => {
// //           assert.ifError(err);
// //           res.should.have.status(400);
// //           res.body.should.be.an('object').that.has.all.keys('code', 'message', 'data');
// //           res.body.code.should.equal(400);
// //           res.body.message.should.be.a('string').that.contains('Invalid email address');
// //           res.body.data.should.be.an('object').that.is.empty;
// //           // User should not be registered
// //           done();
// //         });
// //     });
  
// //     it('TC-201-3 Niet-valide wachtwoord', (done) => {
// //       chai
// //         .request(server)
// //         .post('/api/user/')
// //         .send({
// //           emailAdress: 'user@example.com',
// //           password: 'weak',
// //         })
// //         .end((err, res) => {
// //           assert.ifError(err);
// //           res.should.have.status(400);
// //           res.body.should.be.an('object').that.has.all.keys('code', 'message', 'data');
// //           res.body.code.should.equal(400);
// //           res.body.message.should.be.a('string').that.contains('Invalid password');
// //           res.body.data.should.be.an('object').that.is.empty;
// //           // User should not be registered
// //           done();
// //         });
// //     });
  
// //     it('TC-201-4 Gebruiker bestaat al', (done) => {
// //       // Perform any necessary setup here, e.g., adding an existing user to the database
// //       chai
// //         .request(server)
// //         .post('/api/user/')
// //         .send({
// //           emailAdress: 'h.tank@server.com',
// //           password: 'password',
// //         })
// //         .end((err, res) => {
// //           assert.ifError(err);
// //           res.should.have.status(403);
// //           res.body.should.be.an('object').that.has.all.keys('code', 'message', 'data');
// //           res.body.code.should.equal(403);
// //           res.body.message.should.be.a('string').that.contains('User already exists');
// //           res.body.data.should.be.an('object').that.is.empty;
// //           // User should not be registered
// //           done();
// //         });
// //     });
  
// //     it('TC-201-5 Gebruiker succesvol geregistreerd', (done) => {
// //       chai
// //         .request(server)
// //         .post('/api/user/')
// //         .send( {   "firstName": "John",
// //         "lastName": "Doe",
// //         "isActive": 1,
// //         "emailAdress": "j.dcwewoe@server.com",
// //         "password": "seewerwrewrcret",
// //         "phoneNumber": "06 12425475",
// //         "roles": "editor,guest",
// //         "street": "",
// //         "city": ""
// //         }
// //     )
// //         .end((err, res) => {
// //           assert.ifError(err);
// //           res.should.have.status(200);
// //           res.body.should.be.an('object').that.has.all.keys('code', 'message', 'data');
// //           res.body.code.should.equal(200);
// //           res.body.message.should.be.a('string').that.contains('User successfully registered');
// //           res.body.data.should.be.an('object').that.has.all.keys('id', 'email');
// //           // Additional assertions for the registered user's data
// //           // User should be registered
// //           done();
// //         });
// //     });
// //   });




// //   describe('UC-203 Opvragen van gebruikersprofiel', () => {
// //     //
// //     beforeEach((done) => {
// //       // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
// //       dbconnection.getConnection(function (err, connection) {
// //         if (err) {
// //           done(err);
// //           throw err; // no connection
// //         }
// //         // Use the connection
// //         connection.query(
// //           CLEAR_DB + INSERT_USER,
// //           function (error, results, fields) {
// //             if (error) {
// //               done(error);
// //               throw error; // not connected!
// //             }
// //             logger.trace('beforeEach done');
// //             // When done with the connection, release it.
// //             dbconnection.releaseConnection(connection);
// //             // Let op dat je done() pas aanroept als de query callback eindigt!
// //             done();
// //           }
// //         );
// //       });
// //     });

// //     it.skip('TC-203-1 Ongeldig token', (done) => {
// //       chai
// //         .request(server)
// //         .get('/api/user/profile')
// //         .set('Authorization', 'Bearer hier-staat-een-ongeldig-token')
// //         .end((err, res) => {
// //           assert.ifError(err);
// //           res.should.have.status(401);
// //           res.should.be.an('object');

// //           res.body.should.be
// //             .an('object')
// //             .that.has.all.keys('code', 'message', 'data');
// //           let { code, message, data } = res.body;
// //           code.should.be.an('number');
// //           message.should.be.a('string').equal('Not authorized');
// //           done();
// //         });
// //     });

// //     it.skip('TC-203-2 Gebruiker ingelogd met geldig token', (done) => {
// //       // Gebruiker met id = 1 is toegevoegd in de testdatabase. We zouden nu
// //       // in deze testcase succesvol het profiel van die gebruiker moeten vinden
// //       // als we een valide token meesturen.
// //       chai
// //         .request(server)
// //         .get('/api/user/profile')
// //         .set('Authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
// //         .end((err, res) => {
// //           assert.ifError(err);
// //           res.should.have.status(200);
// //           res.should.be.an('object');

// //           res.body.should.be
// //             .an('object')
// //             .that.has.all.keys('code', 'message', 'data');
// //           let { code, message, data } = res.body;
// //           code.should.be.an('number');
// //           message.should.be.a('string').that.contains('Get User profile');
// //           data.should.be.an('object');
// //           data.id.should.equal(1);
// //           data.firstName.should.equal('first');
// //           // Zelf de overige validaties aanvullen!
// //           done();
// //         });
// //     });
// //   });

// //   describe('UC-303 Lijst van maaltijden opvragen', () => {
// //     //
// //     beforeEach((done) => {
// //       logger.debug('beforeEach called');
// //       // maak de testdatabase opnieuw aan zodat we onze testen kunnen uitvoeren.
// //       dbconnection.getConnection(function (err, connection) {
// //         if (err) {
// //           done(err);
// //           throw err; // not connected!
// //         }
// //         connection.query(
// //           CLEAR_DB + INSERT_USER + INSERT_MEALS,
// //           function (error, results, fields) {
// //             // When done with the connection, release it.
// //             dbconnection.releaseConnection(connection);
// //             // Handle error after the release.
// //             if (err) {
// //               done(err);
// //               throw err;
// //             }
// //             // Let op dat je done() pas aanroept als de query callback eindigt!
// //             logger.debug('beforeEach done');
// //             done();
// //           }
// //         );
// //       });
// //     });

// //     it.skip('TC-303-1 Lijst van maaltijden wordt succesvol geretourneerd', (done) => {
// //       chai
// //         .request(server)
// //         .get('/api/meal')
// //         // wanneer je authenticatie gebruikt kun je hier een token meesturen
// //         // .set('Authorization', 'Bearer ' + jwt.sign({ id: 1 }, jwtSecretKey))
// //         .end((err, res) => {
// //           assert.ifError(err);

// //           res.should.have.status(200);
// //           res.should.be.an('object');

// //           res.body.should.be
// //             .an('object')
// //             .that.has.all.keys('message', 'data', 'code');

// //           const { code, data } = res.body;
// //           code.should.be.an('number');
// //           data.should.be.an('array').that.has.length(2);
// //           data[0].name.should.equal('Meal A');
// //           data[0].id.should.equal(1);
// //           done();
// //         });
// //     });
// //     // En hier komen meer testcases
// //   });
