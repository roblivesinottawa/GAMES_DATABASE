const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')

const app = express()
const port = process.env.PORT || 4000;

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true}));

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "*Thisisinsane*86",
    database: "games_library"
});

app.get('/', (req, res) => res.send({ message: "Welcome to the Games App Database "}))

// create database
connection.connect(err => {
    err ? err : console.log('Connected to MySQL Server!')
    connection.query(
        `CREATE DATABSE IF NOT EXISTS games_library`,
        (err, result) => err ? err : console.log(`DATABASE CREATED!`)
    )
})

connection.connect(err => {
    err ? err : console.log('Connected to MySQl Server!')
    let sql = `CREATE TABLE games_table (
                id INT NOT NULL AUTO_INCREMENT,
                name VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL,
                publisher VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL,
                PRIMARY KEY(id),
                created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                
            )`;
            connection.query(sql, (err, result) => err ? err : console.log(`TABLE CREATED!`))
})

// GET ALL BOOKS
app.get('/games', (req, res) => {
    connection.query(
        `SELECT * FROM games_table`, (err, results, fields) => {
            if(err) throw err;
            let message = ""
            if(results === undefined || results.length == 0){
                message = "Games table is empty!"
            } else message = "Successfully retrieved all books!"

            return res.send({ error: false, data: results, message: message })
        }
    )
})

// GET A GAME BY ID
app.get('/games/:id', (req, res) => {
    let id = req.params.id
    if(!id) return res.status(400).send({ error: true, message: "Please provide game id!"})
    connection.query(
        `SELECT * FROM games_table WHERE id=?`, 
        id, (err, results, fields) => {
            if(err) throw err;
            let message = ""
            if(results === undefined || results.length == 0){
                message = "Games table is empty!"
            } else message = "Successfully retrieved all books!"

            return res.send({ error: false, data: results, message: message })
        }
    )
})


// INSERT GAME API
app.post('/game', (req, res) => {
    let name = req.body.name
    let publisher = req.body.publisher

    if(!name || !publisher){
        return res.status(400).send({ error: true, messsage: 'Please provide game name and publisher.' }) 
    }

    connection.query(`INSERT INTO games_table (name, publisher) VALUES (?, ?)`, 
    [name, publisher], (err, result, fields) => {
            err ? err : res.send({ error: false, data: result, message: 'Game(s) successfully added! '})
        }
    )
});



// UPDATE GAME WITH ID
app.put('/game', (req, res) => {
    let id = req.params.id
    let name = req.params.name
    let publisher = req.params.publisher
    if(!id || !name || !publisher) return res.status(400).send({ error: true, message: "Please provide game id, name and publisher!"})
    
    connection.query(
        `UPDATE games_table SET name = ?, publisher = ? WHERE ID = ?`,
        [name, publisher, id],
        (err, results, fields) => {
            if(err) throw err;
            let message = ""
            if(result.changedRows === 0){
                message = "Game not found or data are same!"
            } else message = "Game succeessfully updated!"

            return res.send({ error: false, data: results, message: message })
        }
    )
})

// DELETE GAME WITH ID
app.delete('/game', (req, res) => {
    let id = req.params.id
    
    if(!id) return res.status(400).send({ error: true, message: "Please provide game id, name and publisher!"})
    
    connection.query(
        `DELETE FROM games_table WHERE id = ?`,
        [id], (err, result, fields) => {
            if(err) throw err;
            let message = ""
            if(result.affectedRows === 0){
                message = "Game not found!"
            } else message = "Game succeessfully deleted!"

            return res.send({ error: false, data: result, message: message })
        }
    )
})

app.listen(port, () => console.log(`Server listening at port ${port}`))

module.exports = app;