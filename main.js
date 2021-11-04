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

function errorCheck(err, res, response) {
    if(err) {
        console.log(err);
        response = {};
        response.status = 500;
        response.body = "Something went wrong!";
        response.error = err.code;
        response.message = err.sqlMessage;

        res.send(response);
    }
}

function createData(req, data, columns) {
    for (let j = 0; j < columns.length; j++) {
        data.push(req.body.columns[columns[j]]);
    }
}

// CREATE TABLE ?????????????????????????

// SELECT ALL ITEMS
app.get('/:table', (req, res, next) => {
    let sql = 'SELECT * FROM ' + req.params.table;
    let response = [];

    // make query
    pool.query(sql, (err, rows, fields) => {
        errorCheck(err, res, response);
        console.log(rows);
        for (let i in rows) {
            response.push(rows[i])
        }

        // send response
        res.send(response);
    })
})

// SELECT ONE ITEM
app.get('/:table/:id', (req, res, next) => {
    let sql = 'SELECT * FROM ' + req.params.table + ' WHERE id=?';
    let data = [req.params.id];
    let response = []

    // make query
    pool.query(sql, data, (err, rows, fields) => {
        errorCheck(err, res, response);
        for (let i in rows) {
            response.push(rows[i])
        }

        // send response
        res.send(response)
    })
})

// ADD ITEMS
app.post('/:table', function(req, res, next) {
    let sql = 'INSERT INTO ' + req.params.table + ' (';
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
    createData(req, data, columns)

    // make query
    pool.query(sql, data, function(err, result) {
        errorCheck(err, res, response);
        if (result) {
            response.status = 201;
            response.body = "INSERT was successful!";
            response.newID = result.insertId;

            // send response
            res.send(response);
        }
    })
})

// UPDATE ITEMS
app.put('/:table/:id', function(req, res, next) {
    let sql = 'UPDATE ' + req.params.table + ' SET ';
    let data = [];
    let id = req.params.id;
    let columns = Object.keys(req.body.columns);
    let response = {};

    // form query string
    for (let i in columns) {
        sql = sql.concat(columns[i], '=?, ');
    }

    sql = sql.slice(0, -2);
    sql = sql.concat(' WHERE id=?;');

    // create data
    createData(req, data, columns)
    data.push(id);

    // make query
    pool.query(sql, data, function(err, result) {
        errorCheck(err, res, response);
        if (result) {
            console.log(result);
            response.status = 201;
            response.body = "UPDATE was successful!";
            response.message = result.message;

            // send response
            res.send(response);
        }
    })
})

// DELETE ITEMS
app.delete('/:table/:id', (req, res, next) => {
    let sql = 'DELETE FROM ' + req.params.table + ' WHERE id=?';
    let data = [req.params.id];
    let response = {};

    pool.query(sql, data, (err, result) => {
        errorCheck(err, res, response);
        if (result) {
            response.status = 201;
            response.body = "DELETE was successful!";

            // send response
            res.send(response);
        }
    })
})

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