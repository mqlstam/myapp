const assert = require('assert');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const pool = require('../../src/util/mysql-db');
const { login } = require('../../src/controllers/authentication.controller.js');
const { jwtSecretKey } = require('../../src/util/utils');

describe('User Login API', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('TC-101-1: Verplicht veld ontbreekt', async () => {
    const req = httpMocks.createRequest({ body: {} });
    const res = httpMocks.createResponse();
    const next = sinon.stub();

    await login(req, res, next);

    assert.strictEqual(res.statusCode, 400);
    assert.deepStrictEqual(res._getData(), {
      code: 400,
      message: 'Required field is missing',
      data: {}
    });
  });

  it('TC-101-2: Niet-valide wachtwoord', async () => {
    const req = httpMocks.createRequest({
      body: {
        emailAdress: 'test@example.com',
        password: 'wrong-password'
      }
    });
    const res = httpMocks.createResponse();
    const next = sinon.stub();

    const user = {
      id: 1,
      emailAdress: 'test@example.com',
      password: 'hashed-password'
    };

    const mockConnection = {
      query: sinon.stub().resolves([[user]]),
      release: sinon.stub()
    };
    const mockPool = {
      getConnection: sinon.stub().resolves(mockConnection)
    };

    sinon.replace(pool, 'getConnection', mockPool.getConnection);
    sinon.stub(bcrypt, 'compare').resolves(false);

    await login(req, res, next);

    assert.strictEqual(res.statusCode, 400);
    assert.deepStrictEqual(res._getData(), { error: 'Invalid password' });
  });

  it('TC-101-3: Gebruiker bestaat niet', async () => {
    const req = httpMocks.createRequest({
      body: {
        emailAdress: 'notfound@example.com',
        password: 'password'
      }
    });
    const res = httpMocks.createResponse();
    const next = sinon.stub();

    const mockConnection = {
      query: sinon.stub().resolves([[]]),
      release: sinon.stub()
    };
    const mockPool = {
      getConnection: sinon.stub().resolves(mockConnection)
    };

    sinon.replace(pool, 'getConnection', mockPool.getConnection);

    await login(req, res, next);

    assert.strictEqual(res.statusCode, 404);
    assert.deepStrictEqual(res._getData(), { error: 'User not found' });
  });

  it('TC-101-4: Gebruiker succesvol ingelogd', async () => {
    const req = httpMocks.createRequest({
      body: {
        emailAdress: 'test@example.com',
        password: 'password'
      }
    });
    const res = httpMocks.createResponse();
    const next = sinon.stub();

    const user = {
      id: 1,
      emailAdress: 'test@example.com',
      password: 'hashed-password'
    };

    const mockConnection = {
      query: sinon.stub().resolves([[user]]),
      release: sinon.stub()
    };
    const mockPool = {
      getConnection: sinon.stub().resolves(mockConnection)
    };

    sinon.replace(pool, 'getConnection', mockPool.getConnection);
    sinon.stub(bcrypt, 'compare').resolves(true);

    await login(req, res, next);

    assert.strictEqual(res.statusCode, 200);
    const responseData = res._getData();
    assert.strictEqual(responseData.code, 200);
    assert.strictEqual(responseData.message, 'Login successful');
    assert.strictEqual(responseData.data.id, user.id);
    assert.strictEqual(responseData.data.email, user.emailAdress);

    // Check if the token is valid
    const decoded = jwt.verify(responseData.data.token, jwtSecretKey);
    assert.strictEqual(decoded.userId, user.id);
  });
});