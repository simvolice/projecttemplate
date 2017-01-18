const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');
const url = require('url');
const config = require('../utils/config');

const AuthService = require('../services/Auth');

const testEmail = /^(?=.{3,254}$)(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const testPass = /^(?=[\x20-\x7E]*?[\w])(?=[\x20-\x7E]*?[\W])(?![\x20-\x7E]*?[\s])[\x20-\x7E]{6,20}$/;

const sendHtmlEmail = require('../utils/sendHtmlEmail');
const uuidV4 = require('uuid/v4');



function fullUrl(req, pathname, token = uuidV4()) {
    return url.format({
        protocol: req.protocol,
        hostname: req.hostname,
        port: process.env.PORT,
        pathname: pathname,
        search: "token=" + token
    });
}



function checkRegisterData(req, res) {









    if (!testEmail.test(req.body.email)){


        return  res.json({"code": "emailWrongRegExp"});


    } else if (!testPass.test(req.body.pass)) {




        return  res.json({"code": "passWrongRegExp"});

    } else {




        const hash = bcrypt.hashSync(req.body.pass, 10);


        const objParams = {

            email: req.body.email,
            password: hash,
            url: fullUrl(req, "/verifemail"),
            subject: "Активация почтового ящика",
            from: "info@efflife.kz",
            pathToEmailTemplate: "activateEmail.html"


        };


        objParams.activateToken = url.parse(objParams.url, true, true).query.token;



        sendHtmlEmail.sendEmail(objParams);


        AuthService.registration(objParams).then(function (result) {


            res.json(result);

        }, function (err) {

            res.json(err);

        });











    }





}





//TODO При регистрации передадутся координаты, под них необходимо создать индекс типа "2Dsphere"
router.post('/register', function (req, res, next) {



  checkRegisterData(req, res);


});






router.post('/login', function (req, res, next) {








    if (!testEmail.test(req.body.email)){



        return  res.json({"code": "emailWrongRegExp"});


    } else if (!testPass.test(req.body.pass)) {


        return  res.json({"code": "passWrongRegExp"});

    } else {




        let objParams = {

          email: req.body.email

        };


        AuthService.login(objParams).then(function (result) {





            if (bcrypt.compareSync(req.body.pass, result.password)){




                res.json({"code": "ok", "token": jsonwebtoken.sign(result, config.SECRETJSONWEBTOKEN)});


            }else {


                res.json({"code": "passWrong"});


            }






        }, function (err) {


            res.json(err.stack);

        });

    }










});

router.get('/verifemail', function (req, res, next) {



    AuthService.verifEmail(req.query.token).then(function (result) {




        res.json({"code": result.lastErrorObject.updatedExisting});


    }, function (err) {


        res.json(err);

    });







});















router.post('/resetpass', function (req, res, next) {




    if (!testEmail.test(req.body.email)){


        return  res.json({"code": "emailWrongRegExp"});


    } else {



        AuthService.resetPassFindUser(req.body.email).then(function (result) {
            const objParams = {

                email: req.body.email,

                url : fullUrl(req, "/veriftoken", token = result.activateToken),
                subject: "Восстановление пароля",
                from: "info@efflife.kz",
                pathToEmailTemplate: "restorePass.html"


            };




            sendHtmlEmail.sendEmail(objParams);


            res.json({"code": "ok"})


        }, function (err) {

            res.json(err);


        });





    }









});





router.get('/veriftoken', function (req, res, next) {





    AuthService.verifToken(req.query.token).then(function (result) {

        res.json({"activateToken": result.activateToken});


    }, function (err) {

        res.json(err);


    })






});


router.post('/setnewpass', function(req, res, next){



    if (!testPass.test(req.body.pass)) {


        return  res.json({"code": "passWrongRegExp"});

    } else {


        let objParams = {

            token: req.body.token,
            pass: bcrypt.hashSync(req.body.pass, 10)

        };

        AuthService.setNewPassword(objParams).then(function (result) {

            res.json({"code": result.lastErrorObject.updatedExisting});


        }, function (err) {

            res.json(err);


        })


    }





});





















module.exports = router;
