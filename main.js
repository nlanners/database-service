const express = require('express');

const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json({extended:false}));

app.set('port', 65534);

const pool = mysql.createPool({
    connectionLimit :   10,
    host            :   'classmysql.engr.oregonstate.edu',
    user            :   'cs361_lannersn',
    password        :   '4135',
    database        :   'cs361_lannersn'
});

// CREATE TABLE


// SELECT ITEMS


// ADD ITEMS


// UPDATE ITEMS


// DELETE ITEMS



// 404 ERROR
app.use(function(req, res){
    res.status(404);
    res.send('404 - request not found');
})

// 500 ERROR
app.use(function(req, res, next){
    console.error(req.stack);
    res.type('plain/text');
    res.status(500);
    res.send('500 - server error');
});

app.listen(app.get('port'), function(){
    console.log('Express started on flip3.engr.oregonstate.edu:' + app.get('port') + '; press Ctrl-C to terminate.');
})