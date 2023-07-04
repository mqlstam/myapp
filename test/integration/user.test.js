const assert = require('assert');
const { createUser, getAllUsers, getUserProfile, getUserById, updateUser, deleteUser } = require('../../src/controllers/user.controller.js');
const bcrypt = require('bcryptjs');
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');

describe('User Registration API', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('TC-201-1: Verplicht veld ontbreekt', async () => {
    const req = httpMocks.createRequest({ body: {} });
    const res = httpMocks.createResponse();
    const next = sinon.stub();

    await createUser(req, res, next);

    assert.strictEqual(res.statusCode, 400);
    assert.deepStrictEqual(res._getData(), {
      code: 400,
      message: 'Required field is missing',
      data: {}
    });
  });

  it('TC-201-2: Niet-valide emailadres', async () => {
    const req = httpMocks.createRequest({
      body: {
        emailAdress: 'invalid-email',
        password: 'password'
      }
    });
    const res = httpMocks.createResponse();
    const next = sinon.stub();

    await createUser(req, res, next);

    assert.strictEqual(res.statusCode, 400);
    assert.deepStrictEqual(res._getData(), {
      code: 400,
      message: 'Invalid email address',
      data: {}
    });
  });

  it('TC-201-3: Niet-valide wachtwoord', async () => {
    const req = httpMocks.createRequest({
      body: {
        emailAdress: 'test@example.com',
        password: 'abc'
      }
    });
    const res = httpMocks.createResponse();
    const next = sinon.stub();

    await createUser(req, res, next);

    assert.strictEqual(res.statusCode, 400);
    assert.deepStrictEqual(res._getData(), {
      code: 400,
      message: 'Invalid password',
      data: {}
    });
  });

  it('TC-201-4: Gebruiker bestaat al', async () => {
    const req = httpMocks.createRequest({
      body: {
        emailAdress: 'test@example.com',
        password: 'password'
      }
    });
    const res = httpMocks.createResponse();
    const next = sinon.stub();

    const mockConnection = {
      query: sinon.stub().resolves([[{ emailAdress: 'test@example.com' }]]),
      release: sinon.stub()
    };
    const mockPool = {
      getConnection: sinon.stub().resolves(mockConnection)
    };

    await createUser(req, res, next);

    assert.strictEqual(res.statusCode, 403);
    assert.deepStrictEqual(res._getData(), {
      code: 403,
      message: 'User already exists',
      data: {}
    });
  });

  it('TC-201-5: Gebruiker succesvol geregistreerd', async () => {
    const req = httpMocks.createRequest({
      body: {
        emailAdress: 'newuser@example.com',
        password: 'password',
        firstName: 'John',
        lastName: 'Doe',
        street: 'Example Street',
        city: 'Example City'
      }
    });
    const res = httpMocks.createResponse();
    const next = sinon.stub();

    const mockConnection = {
      query: sinon.stub().onFirstCall().resolves([[]]).onSecondCall().resolves([{ insertId: 1 }]),
      release: sinon.stub()
    };
    const mockPool = {
      getConnection: sinon.stub().resolves(mockConnection)
    };

    sinon.stub(bcrypt, 'hash').resolves('hashed-password');

    await createUser(req, res, next);

    assert.strictEqual(res.statusCode, 200);
    const responseData = res._getData();
    assert.strictEqual(responseData.code, 200);
    assert.strictEqual(responseData.message, 'User successfully registered');
    assert.strictEqual(responseData.data.id, 1);
    assert.strictEqual(responseData.data.email, 'newuser@example.com');
  });
});

describe('User Overview API', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('TC-202-1: Toon alle gebruikers (minimaal 2)', async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    const next = sinon.stub();

    const mockUsers = [
      { id: 1, firstName: 'John', lastName: 'Doe', isActive: true, emailAdress: 'john@example.com' },
      { id: 2, firstName: 'Jane', lastName: 'Doe', isActive: true, emailAdress: 'jane@example.com' }
    ];

    const mockConnection = {
      query: sinon.stub().resolves([mockUsers]),
      release: sinon.stub()
    };
    const mockPool = {
      getConnection: sinon.stub().resolves(mockConnection)
    };

    await getAllUsers(req, res, next);

    assert.strictEqual(res.statusCode, 200);
    const responseData = res._getData();
    assert.strictEqual(responseData.code, 200);
    assert.strictEqual(responseData.message, 'User getAll endpoint');
    assert.deepStrictEqual(responseData.data, mockUsers);
  });

  it('TC-202-2: Toon gebruikers met zoekterm op niet-bestaande velden.', async () => {
    const req = httpMocks.createRequest({ query: { nonExistentField: 'value' } });
    const res = httpMocks.createResponse();
    const next = sinon.stub();

    const mockUsers = [
      { id: 1, firstName: 'John', lastName: 'Doe', isActive: true, emailAdress: 'john@example.com' },
      { id: 2, firstName: 'Jane', lastName: 'Doe', isActive: true, emailAdress: 'jane@example.com' }
    ];

    const mockConnection = {
      query: sinon.stub().resolves([mockUsers]),
      release: sinon.stub()
    };
    const mockPool = {
      getConnection: sinon.stub().resolves(mockConnection)
    };

    await getAllUsers(req, res, next);

    assert.strictEqual(res.statusCode, 200);
    const responseData = res._getData();
    assert.strictEqual(responseData.code, 200);
    assert.strictEqual(responseData.message, 'User getAll endpoint');
    assert.deepStrictEqual(responseData.data, mockUsers);
  });

  it('TC-202-3: Toon gebruikers met gebruik van de zoekterm op het veld ‘isActive’=false', async () => {
    const req = httpMocks.createRequest({ query: { isActive: false } });
    const res = httpMocks.createResponse();
    const next = sinon.stub();

    const mockUsers = [
      { id: 3, firstName: 'Inactive', lastName: 'User', isActive: false, emailAdress: 'inactive@example.com' }
    ];

    const mockConnection = {
      query: sinon.stub().resolves([mockUsers]),
      release: sinon.stub()
    };
    const mockPool = {
      getConnection: sinon.stub().resolves(mockConnection)
    };

    await getAllUsers(req, res, next);

    assert.strictEqual(res.statusCode, 200);
    const responseData = res._getData();
    assert.strictEqual(responseData.code, 200);
    assert.strictEqual(responseData.message, 'User getAll endpoint');
    assert.deepStrictEqual(responseData.data, mockUsers);
  });

  it('TC-202-4: Toon gebruikers met gebruik van de zoekterm op het veld ‘isActive’=true', async () => {
    const req = httpMocks.createRequest({ query: { isActive: true } });
    const res = httpMocks.createResponse();
    const next = sinon.stub();

    const mockUsers = [
      { id: 1, firstName: 'John', lastName: 'Doe', isActive: true, emailAdress: 'john@example.com' },
      { id: 2, firstName: 'Jane', lastName: 'Doe', isActive: true, emailAdress: 'jane@example.com' }
    ];

    const mockConnection = {
      query: sinon.stub().resolves([mockUsers]),
      release: sinon.stub()
    };
    const mockPool = {
      getConnection: sinon.stub().resolves(mockConnection)
    };

    await getAllUsers(req, res, next);

    assert.strictEqual(res.statusCode, 200);
    const responseData = res._getData();
    assert.strictEqual(responseData.code, 200);
    assert.strictEqual(responseData.message, 'User getAll endpoint');
    assert.deepStrictEqual(responseData.data, mockUsers);
  });

  it('TC-202-5: Toon gebruikers met zoektermen op bestaande velden (max op 2 velden filteren)', async () => {
    const req = httpMocks.createRequest({ query: { firstName: 'John', isActive: true } });
    const res = httpMocks.createResponse();
    const next = sinon.stub();

    const mockUsers = [
      { id: 1, firstName: 'John', lastName: 'Doe', isActive: true, emailAdress: 'john@example.com' }
    ];

    const mockConnection = {
      query: sinon.stub().resolves([mockUsers]),
      release: sinon.stub()
    };
    const mockPool = {
      getConnection: sinon.stub().resolves(mockConnection)
    };

    await getAllUsers(req, res, next);

    assert.strictEqual(res.statusCode, 200);
    const responseData = res._getData();
    assert.strictEqual(responseData.code, 200);
    assert.strictEqual(responseData.message, 'User getAll endpoint');
    assert.deepStrictEqual(responseData.data, mockUsers);
  });
});

describe('User Profile API', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('TC-203-1: Ongeldig token', async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    const next = sinon.stub();

    const expectedError = {
      code: 401,
      message: 'Invalid token'
    };

    next.callsFake((error) => {
      assert.deepStrictEqual(error, expectedError);
    });

    await getUserProfile(req, res, next);

    assert.strictEqual(res.statusCode, undefined);
    const responseData = res._getData();
    assert.strictEqual(responseData, '');
  });

  it('TC-203-2: Gebruiker is ingelogd met geldig token', async () => {
    const req = httpMocks.createRequest({ userId: 1 });
    const res = httpMocks.createResponse();
    const next = sinon.stub();

    const mockUser = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      isActive: true,
      emailAdress: 'john@example.com'
    };

    const mockMeals = [
      { id: 1, name: 'Meal 1', description: 'Delicious meal', userId: 1 },
      { id: 2, name: 'Meal 2', description: 'Tasty meal', userId: 1 }
    ];

    const mockConnection = {
      query: sinon.stub()
        .onFirstCall().resolves([[mockUser]])
        .onSecondCall().resolves([mockMeals]),
      release: sinon.stub()
    };
    const mockPool = {
      getConnection: sinon.stub().resolves(mockConnection)
    };

    await getUserProfile(req, res, next);

    assert.strictEqual(res.statusCode, 200);
    const responseData = res._getData();
    assert.strictEqual(responseData.code, 200);
    assert.strictEqual(responseData.message, 'Get User profile');
    assert.deepStrictEqual(responseData.data, { ...mockUser, meals: mockMeals });
  });
});

describe('Get User by ID API', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('TC-204-1: Ongeldig token', async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    const next = sinon.stub();

    const expectedError = {
      code: 401,
      message: 'Invalid token'
    };

    next.callsFake((error) => {
      assert.deepStrictEqual(error, expectedError);
    });

    await getUserById(req, res, next);

    assert.strictEqual(res.statusCode, undefined);
    const responseData = res._getData();
    assert.strictEqual(responseData, '');
  });

  it('TC-204-2: Gebruiker-ID bestaat niet', async () => {
    const req = httpMocks.createRequest({ params: { userId: 1 } });
    const res = httpMocks.createResponse();
    const next = sinon.stub();

    const mockConnection = {
      query: sinon.stub().resolves([[]]),
      release: sinon.stub()
    };
    const mockPool = {
      getConnection: sinon.stub().resolves(mockConnection)
    };

    await getUserById(req, res, next);

    assert.strictEqual(res.statusCode, 404);
    const responseData = res._getData();
    assert.deepStrictEqual(responseData, { error: 'User not found' });
  });

  it('TC-204-3: Gebruiker-ID bestaat', async () => {
    const req = httpMocks.createRequest({ params: { userId: 1 } });
    const res = httpMocks.createResponse();
    const next = sinon.stub();

    const mockUser = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      isActive: true,
      emailAdress: 'john@example.com'
    };

    const mockMeals = [
      { id: 1, name: 'Meal 1', description: 'Delicious meal', cook_id: 1, date: '2023-07-05' },
      { id: 2, name: 'Meal 2', description: 'Tasty meal', cook_id: 1, date: '2023-07-06' }
    ];

    const mockConnection = {
      query: sinon.stub()
        .onFirstCall().resolves([[mockUser]])
        .onSecondCall().resolves([mockMeals]),
      release: sinon.stub()
    };
    const mockPool = {
      getConnection: sinon.stub().resolves(mockConnection)
    };

    await getUserById(req, res, next);

    assert.strictEqual(res.statusCode, 200);
    const responseData = res._getData();
    assert.strictEqual(responseData.code, 200);
    assert.strictEqual(responseData.message, 'Get user by ID');
    assert.deepStrictEqual(responseData.data, { user: mockUser, meals: mockMeals });
  });
});
describe('Update User API', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('TC-205-1: Verplicht veld “emailAddress” ontbreekt', async () => {
    const req = httpMocks.createRequest({ params: { userId: 1 }, user: 1, body: {} });
    const res = httpMocks.createResponse();
    const next = sinon.stub();

    await updateUser(req, res, next);

    assert.strictEqual(res.statusCode, 400);
    const responseData = res._getData();
    assert.deepStrictEqual(responseData, { error: 'Email address is required' });
  });

  it('TC-205-2: De gebruiker is niet de eigenaar van de data', async () => {
    const req = httpMocks.createRequest({ params: { userId: 1 }, user: 2, body: { emailAdress: 'john@example.com' } });
    const res = httpMocks.createResponse();
    const next = sinon.stub();

    await updateUser(req, res, next);

    assert.strictEqual(res.statusCode, 403);
    const responseData = res._getData();
    assert.deepStrictEqual(responseData, { error: 'You can only update your own data' });
  });

  it('TC-205-3: Niet-valide telefoonnummer', async () => {
    const req = httpMocks.createRequest({
      params: { userId: 1 },
      user: 1,
      body: { emailAdress: 'john@example.com', phoneNumber: 'invalid-number' }
    });
    const res = httpMocks.createResponse();
    const next = sinon.stub();

    await updateUser(req, res, next);

    assert.strictEqual(res.statusCode, 400);
    const responseData = res._getData();
    assert.deepStrictEqual(responseData, { error: 'Invalid phone number format' });
  });

  it('TC-205-4: Gebruiker bestaat niet', async () => {
    const req = httpMocks.createRequest({ params: { userId: 1 }, user: 1, body: { emailAdress: 'john@example.com' } });
    const res = httpMocks.createResponse();
    const next = sinon.stub();

    const mockConnection = {
      query: sinon.stub().resolves([[]]),
      release: sinon.stub()
    };
    const mockPool = {
      getConnection: sinon.stub().resolves(mockConnection)
    };

    await updateUser(req, res, next);

    assert.strictEqual(res.statusCode, 404);
    const responseData = res._getData();
    assert.deepStrictEqual(responseData, { error: 'User not found' });
  });

  it('TC-205-5: Niet ingelogd', async () => {
    const req = httpMocks.createRequest({ params: { userId: 1 }, body: { emailAdress: 'john@example.com' } });
    const res = httpMocks.createResponse();
    const next = sinon.stub();

    const expectedError = {
      code: 401,
      message: 'Not authenticated'
    };

    next.callsFake((error) => {
      assert.deepStrictEqual(error, expectedError);
    });

    await updateUser(req, res, next);

    assert.strictEqual(res.statusCode, undefined);
    const responseData = res._getData();
    assert.strictEqual(responseData, '');
  });

  it('TC-205-6: Gebruiker succesvol gewijzigd', async () => {
    const req = httpMocks.createRequest({
      params: { userId: 1 },
      user: 1,
      body: {
        emailAdress: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
        isActive: true,
        roles: 'user',
        street: 'Main St',
        city: 'New York'
      }
    });
    const res = httpMocks.createResponse();
    const next = sinon.stub();

    const mockUser = {
      id: 1,
      emailAdress: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
      isActive: true,
      roles: 'user',
      street: 'Main St',
      city: 'New York'
    };

    const mockConnection = {
      query: sinon.stub()
        .onFirstCall().resolves([[mockUser]])
        .onSecondCall().resolves([[]])
        .onThirdCall().resolves([null]),
      release: sinon.stub()
    };
    const mockPool = {
      getConnection: sinon.stub().resolves(mockConnection)
    };

    await updateUser(req, res, next);

    assert.strictEqual(res.statusCode, 200);
    const responseData = res._getData();
    assert.deepStrictEqual(responseData, {
      code: 200,
      message: 'User data updated',
      data: mockUser
    });
  });
});

describe('Delete User API', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('TC-206-1: Gebruiker bestaat niet', async () => {
    const req = httpMocks.createRequest({ params: { userId: 1 }, user: 1 });
    const res = httpMocks.createResponse();
    const next = sinon.stub();

    const mockConnection = {
      query: sinon.stub().resolves([[]]),
      release: sinon.stub()
    };
    const mockPool = {
      getConnection: sinon.stub().resolves(mockConnection)
    };

    await deleteUser(req, res, next);

    assert.strictEqual(res.statusCode, 404);
    const responseData = res._getData();
    assert.deepStrictEqual(responseData, { error: 'User not found' });
  });

  it('TC-206-2: Gebruiker is niet ingelogd', async () => {
    const req = httpMocks.createRequest({ params: { userId: 1 } });
    const res = httpMocks.createResponse();
    const next = sinon.stub();

    const expectedError = {
      code: 401,
      message: 'Not authenticated'
    };

    next.callsFake((error) => {
      assert.deepStrictEqual(error, expectedError);
    });

    await deleteUser(req, res, next);

    assert.strictEqual(res.statusCode, undefined);
    const responseData = res._getData();
    assert.strictEqual(responseData, '');
  });

  it('TC-206-3: De gebruiker is niet de eigenaar van de data', async () => {
    const req = httpMocks.createRequest({ params: { userId: 1 }, user: 2 });
    const res = httpMocks.createResponse();
    const next = sinon.stub();

    await deleteUser(req, res, next);

    assert.strictEqual(res.statusCode, 403);
    const responseData = res._getData();
    assert.deepStrictEqual(responseData, { error: 'You can only delete your own data' });
  });

  it('TC-206-4: Gebruiker succesvol verwijderd', async () => {
    const req = httpMocks.createRequest({ params: { userId: 1 }, user: 1 });
    const res = httpMocks.createResponse();
    const next = sinon.stub();

    const mockUser = {
      id: 1
    };

    const mockConnection = {
      query: sinon.stub()
        .onFirstCall().resolves([[mockUser]])
        .onSecondCall().resolves([null]),
      release: sinon.stub()
    };
    const mockPool = {
      getConnection: sinon.stub().resolves(mockConnection)
    };

    await deleteUser(req, res, next);

    assert.strictEqual(res.statusCode, 200);
    const responseData = res._getData();
    assert.deepStrictEqual(responseData, {
      code: 200,
      message: 'User deleted',
      data: mockUser
    });
  });
});