const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const app = require('../../index');

chai.use(chaiHttp);

// Replace these with your actual login credentials
const emailAdress = 'rsdf.vandam@server.nl';
const password = 'secret';

let authToken;

before(async () => {
  const res = await chai.request(app)
    .post('/api/login')
    .send({
      emailAdress: 'rsdf.vandam@server.nl',
      password: 'secret'
    });

  authToken = res.body.data.token;


});

after(() => {
    process.env.TEST_MODE = false;
  });

const customRequest = (app, method, url, authToken) => {
    return chai.request(app)[method](url).set('Authorization', `Bearer ${authToken}`).set('x-is-test', 'true');
};

describe('User Registration API', () => {

    // TC-201-1
    it('Verplicht veld ontbreekt', (done) => {
      chai.request(app)
        .post('/api/user')
        .send({})
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.deep.equal({
            code: 400,
            message: 'Required field is missing',
            data: {}
          });
          done();
        });
    });
  
    // TC-201-2
    it('Niet-valide emailadres', (done) => {
      const newUser = {
        emailAdress: 'invalid_email',
        password: 'password'
      };
  
      chai.request(app)
        .post('/api/user')
        .send(newUser)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.deep.equal({
            code: 400,
            message: 'Invalid email address',
            data: {}
          });
          done();
        });
    });
  
    // TC-201-3
    it('Niet-valide wachtwoord', (done) => {
      const newUser = {
        emailAdress: 'rsdf.vandam@server.nl',
        password: 'sho'
      };
  
      chai.request(app)
        .post('/api/user')
        .send(newUser)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.deep.equal({
            code: 400,
            message: 'Invalid password',
            data: {}
          });
          done();
        });
    });
  
    // TC-201-4
    it('Gebruiker bestaat al', (done) => {
      const newUser = {
        emailAdress: 'rsdf.vandam@server.nl',
        password: 'password',
        firstName: 'John',
        lastName: 'Doe',
        street: 'Example Street',
        city: 'Example City'
      };
  
      chai.request(app)
        .post('/api/user')
        .send(newUser)
        .end((err, res) => {
          expect(res).to.have.status(403);
          expect(res.body.message).to.equal('User already exists');
          done();
        });
    });
  
    // TC-201-5
// TC-201-5
  // TC-201-5
//   it('User successfully registered and deleted', async () => {
//     const newUser = {
//       emailAdress: 'rsddsdf.vweacvdscdqqdweedewedddsndam@server.nl',
//       password: 'password',
//       firstName: 'John',
//       lastName: 'Doe',
//       street: 'Example Street',
//       city: 'Example City'
//     };
  
//     const registerRes = await chai.request(app)
//       .post('/api/user/')
//       .send(newUser);
  
//     console.log(registerRes.body);
//     expect(registerRes).to.have.status(201);
//     expect(registerRes.body.message).to.include('User successfully registered');
//     expect(registerRes.body.data).to.be.an('object');
//     expect(registerRes.body.data).to.have.all.keys('id', 'email');
  
//     const createdUserId = registerRes.body.data.id;
  
//     // Delete the created user immediately
//     const deleteRes = await customRequest(app, 'delete', `/api/user/${createdUserId}`, authToken);
  
//     console.log(deleteRes.body);
//     expect(deleteRes).to.have.status(200);
//     expect(deleteRes.body.message).to.equal('User deleted');
//     expect(deleteRes.body.data).to.deep.equal({ id: createdUserId });
//   });
  });

  describe('User Overview API - UC-202', () => {

    // TC-202-1
    it('Toon alle gebruikers (minimaal 2)', (done) => {
      chai.request(app)
      
        .get('/api/user')
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.message).to.include('User getAll endpoint');
          expect(res.body.data).to.be.an('array');
          expect(res.body.data.length).to.be.at.least(2);
          done();
        });
    });
  
    // TC-202-2
    it('Toon gebruikers met zoekterm op niet-bestaande velden', (done) => {
      chai.request(app)
        .get('/api/user?nonexistent_field=search_term')
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.message).to.include('User getAll endpoint');
          expect(res.body.data).to.be.an('array');
          done();
        });
    });
  
    // TC-202-3
    it('Toon gebruikers met gebruik van de zoekterm op het veld ‘isActive’=false', (done) => {
      chai.request(app)
        .get('/api/user?isActive=false')
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.message).to.include('User getAll endpoint');
          expect(res.body.data).to.be.an('array');
          res.body.data.forEach(user => {
            expect(user.isActive).to.be.false;
          });
          done();
        });
    });
  
    // TC-202-4
    it('Toon gebruikers met gebruik van de zoekterm op het veld ‘isActive’=true', (done) => {
      chai.request(app)
        .get('/api/user?isActive=true')
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.message).to.include('User getAll endpoint');
          expect(res.body.data).to.be.an('array');
          res.body.data.forEach(user => {
            expect(user.isActive).to.be.true;
          });
          done();
        });
    });
  
    // TC-202-5
    it('Toon gebruikers met zoektermen op bestaande velden (max op 2 velden filteren)', (done) => {
      chai.request(app)
        .get('/api/user?firstName=search_term1&lastName=search_term2')
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.message).to.include('User getAll endpoint');
          expect(res.body.data).to.be.an('array');
          done();
        });
    });
  
  });

//   it('TC-202-1: Toon alle gebruikers (minimaal 2)', async () => {
//     const req = httpMocks.createRequest();
//     const res = httpMocks.createResponse();
//     const next = sinon.stub();

//     const mockUsers = [
//       { id: 1, firstName: 'John', lastName: 'Doe', isActive: true, emailAdress: 'john@example.com' },
//       { id: 2, firstName: 'Jane', lastName: 'Doe', isActive: true, emailAdress: 'jane@example.com' }
//     ];

//     const mockConnection = {
//       query: sinon.stub().resolves([mockUsers]),
//       release: sinon.stub()
//     };
//     const mockPool = {
//       getConnection: sinon.stub().resolves(mockConnection)
//     };

//     await getAllUsers(req, res, next);

//     assert.strictEqual(res.statusCode, 200);
//     const responseData = res._getData();
//     assert.strictEqual(responseData.code, 200);
//     assert.strictEqual(responseData.message, 'User getAll endpoint');
//     assert.deepStrictEqual(responseData.data, mockUsers);
//   });

//   it('TC-202-2: Toon gebruikers met zoekterm op niet-bestaande velden.', async () => {
//     const req = httpMocks.createRequest({ query: { nonExistentField: 'value' } });
//     const res = httpMocks.createResponse();
//     const next = sinon.stub();

//     const mockUsers = [
//       { id: 1, firstName: 'John', lastName: 'Doe', isActive: true, emailAdress: 'john@example.com' },
//       { id: 2, firstName: 'Jane', lastName: 'Doe', isActive: true, emailAdress: 'jane@example.com' }
//     ];

//     const mockConnection = {
//       query: sinon.stub().resolves([mockUsers]),
//       release: sinon.stub()
//     };
//     const mockPool = {
//       getConnection: sinon.stub().resolves(mockConnection)
//     };

//     await getAllUsers(req, res, next);

//     assert.strictEqual(res.statusCode, 200);
//     const responseData = res._getData();
//     assert.strictEqual(responseData.code, 200);
//     assert.strictEqual(responseData.message, 'User getAll endpoint');
//     assert.deepStrictEqual(responseData.data, mockUsers);
//   });

//   it('TC-202-3: Toon gebruikers met gebruik van de zoekterm op het veld ‘isActive’=false', async () => {
//     const req = httpMocks.createRequest({ query: { isActive: false } });
//     const res = httpMocks.createResponse();
//     const next = sinon.stub();

//     const mockUsers = [
//       { id: 3, firstName: 'Inactive', lastName: 'User', isActive: false, emailAdress: 'inactive@example.com' }
//     ];

//     const mockConnection = {
//       query: sinon.stub().resolves([mockUsers]),
//       release: sinon.stub()
//     };
//     const mockPool = {
//       getConnection: sinon.stub().resolves(mockConnection)
//     };

//     await getAllUsers(req, res, next);

//     assert.strictEqual(res.statusCode, 200);
//     const responseData = res._getData();
//     assert.strictEqual(responseData.code, 200);
//     assert.strictEqual(responseData.message, 'User getAll endpoint');
//     assert.deepStrictEqual(responseData.data, mockUsers);
//   });

//   it('TC-202-4: Toon gebruikers met gebruik van de zoekterm op het veld ‘isActive’=true', async () => {
//     const req = httpMocks.createRequest({ query: { isActive: true } });
//     const res = httpMocks.createResponse();
//     const next = sinon.stub();

//     const mockUsers = [
//       { id: 1, firstName: 'John', lastName: 'Doe', isActive: true, emailAdress: 'john@example.com' },
//       { id: 2, firstName: 'Jane', lastName: 'Doe', isActive: true, emailAdress: 'jane@example.com' }
//     ];

//     const mockConnection = {
//       query: sinon.stub().resolves([mockUsers]),
//       release: sinon.stub()
//     };
//     const mockPool = {
//       getConnection: sinon.stub().resolves(mockConnection)
//     };

//     await getAllUsers(req, res, next);

//     assert.strictEqual(res.statusCode, 200);
//     const responseData = res._getData();
//     assert.strictEqual(responseData.code, 200);
//     assert.strictEqual(responseData.message, 'User getAll endpoint');
//     assert.deepStrictEqual(responseData.data, mockUsers);
//   });

//   it('TC-202-5: Toon gebruikers met zoektermen op bestaande velden (max op 2 velden filteren)', async () => {
//     const req = httpMocks.createRequest({ query: { firstName: 'John', isActive: true } });
//     const res = httpMocks.createResponse();
//     const next = sinon.stub();

//     const mockUsers = [
//       { id: 1, firstName: 'John', lastName: 'Doe', isActive: true, emailAdress: 'john@example.com' }
//     ];

//     const mockConnection = {
//       query: sinon.stub().resolves([mockUsers]),
//       release: sinon.stub()
//     };
//     const mockPool = {
//       getConnection: sinon.stub().resolves(mockConnection)
//     };

//     await getAllUsers(req, res, next);

//     assert.strictEqual(res.statusCode, 200);
//     const responseData = res._getData();
//     assert.strictEqual(responseData.code, 200);
//     assert.strictEqual(responseData.message, 'User getAll endpoint');
//     assert.deepStrictEqual(responseData.data, mockUsers);
//   });
// });

// describe('User Profile API', () => {
//   afterEach(() => {
//     sinon.restore();
//   });

//   it('TC-203-1: Ongeldig token', async () => {
//     const req = httpMocks.createRequest();
//     const res = httpMocks.createResponse();
//     const next = sinon.stub();

//     const expectedError = {
//       code: 401,
//       message: 'Invalid token'
//     };

//     next.callsFake((error) => {
//       assert.deepStrictEqual(error, expectedError);
//     });

//     await getUserProfile(req, res, next);

//     assert.strictEqual(res.statusCode, undefined);
//     const responseData = res._getData();
//     assert.strictEqual(responseData, '');
//   });

//   it('TC-203-2: Gebruiker is ingelogd met geldig token', async () => {
//     const req = httpMocks.createRequest({ userId: 1 });
//     const res = httpMocks.createResponse();
//     const next = sinon.stub();

//     const mockUser = {
//       id: 1,
//       firstName: 'John',
//       lastName: 'Doe',
//       isActive: true,
//       emailAdress: 'john@example.com'
//     };

//     const mockMeals = [
//       { id: 1, name: 'Meal 1', description: 'Delicious meal', userId: 1 },
//       { id: 2, name: 'Meal 2', description: 'Tasty meal', userId: 1 }
//     ];

//     const mockConnection = {
//       query: sinon.stub()
//         .onFirstCall().resolves([[mockUser]])
//         .onSecondCall().resolves([mockMeals]),
//       release: sinon.stub()
//     };
//     const mockPool = {
//       getConnection: sinon.stub().resolves(mockConnection)
//     };

//     await getUserProfile(req, res, next);

//     assert.strictEqual(res.statusCode, 200);
//     const responseData = res._getData();
//     assert.strictEqual(responseData.code, 200);
//     assert.strictEqual(responseData.message, 'Get User profile');
//     assert.deepStrictEqual(responseData.data, { ...mockUser, meals: mockMeals });
//   });
// });

// describe('Get User by ID API', () => {
//   afterEach(() => {
//     sinon.restore();
//   });

//   it('TC-204-1: Ongeldig token', async () => {
//     const req = httpMocks.createRequest();
//     const res = httpMocks.createResponse();
//     const next = sinon.stub();

//     const expectedError = {
//       code: 401,
//       message: 'Invalid token'
//     };

//     next.callsFake((error) => {
//       assert.deepStrictEqual(error, expectedError);
//     });

//     await getUserById(req, res, next);

//     assert.strictEqual(res.statusCode, undefined);
//     const responseData = res._getData();
//     assert.strictEqual(responseData, '');
//   });

//   it('TC-204-2: Gebruiker-ID bestaat niet', async () => {
//     const req = httpMocks.createRequest({ params: { userId: 1 } });
//     const res = httpMocks.createResponse();
//     const next = sinon.stub();

//     const mockConnection = {
//       query: sinon.stub().resolves([[]]),
//       release: sinon.stub()
//     };
//     const mockPool = {
//       getConnection: sinon.stub().resolves(mockConnection)
//     };

//     await getUserById(req, res, next);

//     assert.strictEqual(res.statusCode, 404);
//     const responseData = res._getData();
//     assert.deepStrictEqual(responseData, { error: 'User not found' });
//   });

//   it('TC-204-3: Gebruiker-ID bestaat', async () => {
//     const req = httpMocks.createRequest({ params: { userId: 1 } });
//     const res = httpMocks.createResponse();
//     const next = sinon.stub();

//     const mockUser = {
//       id: 1,
//       firstName: 'John',
//       lastName: 'Doe',
//       isActive: true,
//       emailAdress: 'john@example.com'
//     };

//     const mockMeals = [
//       { id: 1, name: 'Meal 1', description: 'Delicious meal', cook_id: 1, date: '2023-07-05' },
//       { id: 2, name: 'Meal 2', description: 'Tasty meal', cook_id: 1, date: '2023-07-06' }
//     ];

//     const mockConnection = {
//       query: sinon.stub()
//         .onFirstCall().resolves([[mockUser]])
//         .onSecondCall().resolves([mockMeals]),
//       release: sinon.stub()
//     };
//     const mockPool = {
//       getConnection: sinon.stub().resolves(mockConnection)
//     };

//     await getUserById(req, res, next);

//     assert.strictEqual(res.statusCode, 200);
//     const responseData = res._getData();
//     assert.strictEqual(responseData.code, 200);
//     assert.strictEqual(responseData.message, 'Get user by ID');
//     assert.deepStrictEqual(responseData.data, { user: mockUser, meals: mockMeals });
//   });
// });
// describe('Update User API', () => {
//   afterEach(() => {
//     sinon.restore();
//   });

//   it('TC-205-1: Verplicht veld “emailAddress” ontbreekt', async () => {
//     const req = httpMocks.createRequest({ params: { userId: 1 }, user: 1, body: {} });
//     const res = httpMocks.createResponse();
//     const next = sinon.stub();

//     await updateUser(req, res, next);

//     assert.strictEqual(res.statusCode, 400);
//     const responseData = res._getData();
//     assert.deepStrictEqual(responseData, { error: 'Email address is required' });
//   });

//   it('TC-205-2: De gebruiker is niet de eigenaar van de data', async () => {
//     const req = httpMocks.createRequest({ params: { userId: 1 }, user: 2, body: { emailAdress: 'john@example.com' } });
//     const res = httpMocks.createResponse();
//     const next = sinon.stub();

//     await updateUser(req, res, next);

//     assert.strictEqual(res.statusCode, 403);
//     const responseData = res._getData();
//     assert.deepStrictEqual(responseData, { error: 'You can only update your own data' });
//   });

//   it('TC-205-3: Niet-valide telefoonnummer', async () => {
//     const req = httpMocks.createRequest({
//       params: { userId: 1 },
//       user: 1,
//       body: { emailAdress: 'john@example.com', phoneNumber: 'invalid-number' }
//     });
//     const res = httpMocks.createResponse();
//     const next = sinon.stub();

//     await updateUser(req, res, next);

//     assert.strictEqual(res.statusCode, 400);
//     const responseData = res._getData();
//     assert.deepStrictEqual(responseData, { error: 'Invalid phone number format' });
//   });

//   it('TC-205-4: Gebruiker bestaat niet', async () => {
//     const req = httpMocks.createRequest({ params: { userId: 1 }, user: 1, body: { emailAdress: 'john@example.com' } });
//     const res = httpMocks.createResponse();
//     const next = sinon.stub();

//     const mockConnection = {
//       query: sinon.stub().resolves([[]]),
//       release: sinon.stub()
//     };
//     const mockPool = {
//       getConnection: sinon.stub().resolves(mockConnection)
//     };

//     await updateUser(req, res, next);

//     assert.strictEqual(res.statusCode, 404);
//     const responseData = res._getData();
//     assert.deepStrictEqual(responseData, { error: 'User not found' });
//   });

//   it('TC-205-5: Niet ingelogd', async () => {
//     const req = httpMocks.createRequest({ params: { userId: 1 }, body: { emailAdress: 'john@example.com' } });
//     const res = httpMocks.createResponse();
//     const next = sinon.stub();

//     const expectedError = {
//       code: 401,
//       message: 'Not authenticated'
//     };

//     next.callsFake((error) => {
//       assert.deepStrictEqual(error, expectedError);
//     });

//     await updateUser(req, res, next);

//     assert.strictEqual(res.statusCode, undefined);
//     const responseData = res._getData();
//     assert.strictEqual(responseData, '');
//   });

//   it('TC-205-6: Gebruiker succesvol gewijzigd', async () => {
//     const req = httpMocks.createRequest({
//       params: { userId: 1 },
//       user: 1,
//       body: {
//         emailAdress: 'john@example.com',
//         firstName: 'John',
//         lastName: 'Doe',
//         phoneNumber: '1234567890',
//         isActive: true,
//         roles: 'user',
//         street: 'Main St',
//         city: 'New York'
//       }
//     });
//     const res = httpMocks.createResponse();
//     const next = sinon.stub();

//     const mockUser = {
//       id: 1,
//       emailAdress: 'john@example.com',
//       firstName: 'John',
//       lastName: 'Doe',
//       phoneNumber: '1234567890',
//       isActive: true,
//       roles: 'user',
//       street: 'Main St',
//       city: 'New York'
//     };

//     const mockConnection = {
//       query: sinon.stub()
//         .onFirstCall().resolves([[mockUser]])
//         .onSecondCall().resolves([[]])
//         .onThirdCall().resolves([null]),
//       release: sinon.stub()
//     };
//     const mockPool = {
//       getConnection: sinon.stub().resolves(mockConnection)
//     };

//     await updateUser(req, res, next);

//     assert.strictEqual(res.statusCode, 200);
//     const responseData = res._getData();
//     assert.deepStrictEqual(responseData, {
//       code: 200,
//       message: 'User data updated',
//       data: mockUser
//     });
//   });
// });

// describe('Delete User API', () => {
//   afterEach(() => {
//     sinon.restore();
//   });

//   it('TC-206-1: Gebruiker bestaat niet', async () => {
//     const req = httpMocks.createRequest({ params: { userId: 1 }, user: 1 });
//     const res = httpMocks.createResponse();
//     const next = sinon.stub();

//     const mockConnection = {
//       query: sinon.stub().resolves([[]]),
//       release: sinon.stub()
//     };
//     const mockPool = {
//       getConnection: sinon.stub().resolves(mockConnection)
//     };

//     await deleteUser(req, res, next);

//     assert.strictEqual(res.statusCode, 404);
//     const responseData = res._getData();
//     assert.deepStrictEqual(responseData, { error: 'User not found' });
//   });

//   it('TC-206-2: Gebruiker is niet ingelogd', async () => {
//     const req = httpMocks.createRequest({ params: { userId: 1 } });
//     const res = httpMocks.createResponse();
//     const next = sinon.stub();

//     const expectedError = {
//       code: 401,
//       message: 'Not authenticated'
//     };

//     next.callsFake((error) => {
//       assert.deepStrictEqual(error, expectedError);
//     });

//     await deleteUser(req, res, next);

//     assert.strictEqual(res.statusCode, undefined);
//     const responseData = res._getData();
//     assert.strictEqual(responseData, '');
//   });

//   it('TC-206-3: De gebruiker is niet de eigenaar van de data', async () => {
//     const req = httpMocks.createRequest({ params: { userId: 1 }, user: 2 });
//     const res = httpMocks.createResponse();
//     const next = sinon.stub();

//     await deleteUser(req, res, next);

//     assert.strictEqual(res.statusCode, 403);
//     const responseData = res._getData();
//     assert.deepStrictEqual(responseData, { error: 'You can only delete your own data' });
//   });

//   it('TC-206-4: Gebruiker succesvol verwijderd', async () => {
//     const req = httpMocks.createRequest({ params: { userId: 1 }, user: 1 });
//     const res = httpMocks.createResponse();
//     const next = sinon.stub();

//     const mockUser = {
//       id: 1
//     };

//     const mockConnection = {
//       query: sinon.stub()
//         .onFirstCall().resolves([[mockUser]])
//         .onSecondCall().resolves([null]),
//       release: sinon.stub()
//     };
//     const mockPool = {
//       getConnection: sinon.stub().resolves(mockConnection)
//     };

//     await deleteUser(req, res, next);

//     assert.strictEqual(res.statusCode, 200);
//     const responseData = res._getData();
//     assert.deepStrictEqual(responseData, {
//       code: 200,
//       message: 'User deleted',
//       data: mockUser
//     });
//   });
// });