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

function errorCheck(err, result, res, response) {
    if(err) {
        console.log(err);
        console.log(result);
        response.status = 500;
        response.body = "Something went wrong!";
        response.error = err.code;
        response.message = err.sqlMessage;

        res.send(response);
    }
}

// CREATE TABLE


// SELECT ITEMS


// ADD ITEMS
app.post('/', function(req, res, next) {
    let sql = 'INSERT INTO ' + req.body.table + ' (';
    let columns = Object.keys(req.body.columns);
    let data = [];
    let response = {};

    // form query string
    for (let i in columns) {
        sql = sql.concat(columns[i], ', ');
    }
    sql = sql.slice(0,-2);
    sql = sql.concat(') VALUES (')
    for (let h = 0; h < columns.length; h++) {
        sql = sql.concat('?,')
    }
    sql = sql.slice(0, -1);
    sql = sql.concat(');');

    // create data
    for (let j = 0; j < columns.length; j++) {
        data.push(req.body.columns[columns[j]]);
    }

    // make query
    pool.query(sql, data, function(err, result) {
        errorCheck(err, result, res, response);
        console.log(result);
        if (result) {
            response.status = 201;
            response.body = "INSERT was succesful!";
            response.newID = result.insertId;
            res.send(response);
        }
    })

})

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
    console.log('Express started on localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
})