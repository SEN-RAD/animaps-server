const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const knex = require('knex');

const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: 'test',
        database: 'animals'
    }
});

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    db.select('*').from('markers')
        .then(rows => {
            res.send(rows);
        })
        .catch(err => {
            console.error(err);
            res.status(400).send('Error retrieving data from database');
        });
});

app.get('/markers/:id', (req, res) => {
    const id = req.params.id;
    db.select('description').from('markers').where('id', '=', id)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            console.error(err);
            res.status(400).send('Error retrieving data from database');
        });
});

app.post('/contribute', (req, res) => {
    const { coordinates, animal, name, description } = req.body;
    db('markers')
        .returning('*')
        .insert({
            coordinates: coordinates,
            animal: animal,
            name: name,
            description: description,
            created_on: new Date
        })
        .then(marker => {
            res.json('Success! The location has been added to the animap.');
        })
        .catch(err => res.status(400).json(err, 'Error. Please, check your coordinates. This location is already on the animap'))
})

app.listen(3000, () => {
    console.log('Im listening');
});

/*

/ --> res = workin 
/contribute --> POST = marker coordinates + animal + infobox + pic / IT WORKS
/ --> GET = all markers + animal (to display on map) / IT WORKS
/:markerId --> GET = Description for InfoBox / IT WORKS
/:markerId/edit --> PUT = edit of InfoBox 


*/