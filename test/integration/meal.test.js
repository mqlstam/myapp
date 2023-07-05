// meal.controller.test.js
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
        .post('/api/meal') 
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
        .post('/api/meal') // Replace this with your endpoint for adding a meal
        .send(newMeal)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(401);
          done();
        });
    });
  });

  describe('TC-301-3: Maaltijd succesvol toegevoegd', () => {
    it('should return 201 when a meal is successfully added', function(done) { // Change to regular function
  
      const newMeal = {
        "name": "Delicious Pasafeasta",
        "description": "A tasty pasta dish with tomato sauce and fresh basil",
        "location": "Amsterdam",
        "dateTime": "2023-08-01 12:00:00",
        "maxAmountOfParticipants": 10,
        "isActive": true,
        "isVega": true,
        "isVegan": false,
        "isToTakeHome": false,
        "price": 8.5,
        "imageUrl": "https://example.com/pasta.jpg",
        "allergenes": "Gluten"
      };

      chai.request(app)
        .post('/api/meal') // Replace this with your endpoint for adding a meal
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