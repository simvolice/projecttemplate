
const express = require('express');
const router = express.Router();



router.get('/testgeo', function (req, res, next) {




   res.json({"code": "ok"});




});



module.exports = router;