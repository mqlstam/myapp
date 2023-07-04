// meal.controller.test.js
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const app = require('../../index');

chai.use(chaiHttp);

// Replace these with your actual login credentials
const emailAdress = 'test@example.com';
const password = 'testpassword';

let authToken;

before(async () => {
  const res = await chai.request(app)
    .post('/src/controllers/authentication.controller.js') // Replace this with your login endpoint
    .send({ emailAdress, password });

  authToken = res.body.data.token;
});

describe('UC-301: Toevoegen van maaltijd', () => {
  describe('TC-301-1: Verplicht veld ontbreekt', () => {
    it('should return 400 when a required field is missing', (done) => {
      const newMeal = {
        // name is missing
        description: 'Test meal description',
        dateTime: '2023-07-10T14:00:00',
        maxAmountOfParticipants: 10,
        price: 15.50,
        isActive: true,
        isVega: false,
        isVegan: false,
        isToTakeHome: false,
      };

      chai.request(app)
        .post('/src/controllers/meal.controller.js') 
        .set('Authorization', `Bearer ${authToken}`)
        .send(newMeal)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          done();
        });
    });
  });

  describe('TC-301-2: Niet ingelogd', () => {
    it('should return 401 when not logged in', (done) => {
      const newMeal = {
        name: 'Test meal',
        description: 'Test meal description',
        dateTime: '2023-07-10T14:00:00',
        maxAmountOfParticipants: 10,
        price: 15.50,
        isActive: true,
        isVega: false,
        isVegan: false,
        isToTakeHome: false,
      };

      chai.request(app)
        .post('/src/controllers/meal.controller.js') // Replace this with your endpoint for adding a meal
        .send(newMeal)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(401);
          done();
        });
    });
  });

  describe('TC-301-3: Maaltijd succesvol toegevoegd', () => {
    it('should return 201 when a meal is successfully added', (done) => {
      const newMeal = {
        name: 'Test meal',
        description: 'Test meal description',
        dateTime: '2023-07-10T14:00:00',
        maxAmountOfParticipants: 10,
        price: 15.50,
        isActive: true,
        isVega: false,
        isVegan: false,
        isToTakeHome: false,
      };

      chai.request(app)
        .post('/src/controllers/meal.controller.js') // Replace this with your endpoint for adding a meal
        .set('Authorization', `Bearer ${authToken}`)
        .send(newMeal)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(201);
          done();
        });
    });
  });
});