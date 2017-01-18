/**
 * Created by Nikita on 16.01.2017.
 */

var chai = require('chai');


var assert = chai.assert;
var expect = chai.expect;


var chaiHttp = require('chai-http');
chai.use(chaiHttp);


describe('Тестируем testapi', function() {

    it('Хотим увидеть свойство result', function(done) { // <= Pass in done callback
        chai.request('http://localhost:3000')
            .get('/testgeo')
            .end(function(err, res) {



                expect(res.body).to.have.property("result");





                done();                               // <= Call done to signal callback end
            });
    }) ;

});



