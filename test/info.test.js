const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const should = chai.should();
chai.use(chaiHttp);

describe('Server-info', function () {
    it('TC-102- Server info', (done) => {
        chai
            .request(app)
            .get('/api/info') 
            .end((err, res) => { 
                res.body.should.be.an('object');
                res.body.should.have.property('status').to.be.equal(201);
                res.body.should.have.property('message');
                res.body.should.have.property('data');
                let {data, message } = res.body;
                data.should.be.an('object');
                data.should.have.property('studentName').to.be.equal('Miquel');
                data.should.have.property('studentNumber').to.be.equal('2159021');
                done();
            });
    });

});
