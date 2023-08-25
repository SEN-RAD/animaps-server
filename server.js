const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const knex = require('knex');

const db = knex({
    client: 'pg',
    connection: {
        host: process.env.PGHOST,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
        port: process.env.PGPORT,
    }
});

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://sen-rad.github.io');
    next();
});

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
    db.select('*').from('markers').where('id', '=', id)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            console.error(err);
            res.status(400).send('Error retrieving data from database');
        });
});

app.get('/filtered-markers', (req, res) => {
    const searchAnimal = req.query.searchAnimal.toLowerCase();
    db.select('*')
        .from('markers')
        .then(data => {
            const filteredMarkers = data.filter(item =>
                item.animal.toLowerCase().includes(searchAnimal)
            );
            res.json(filteredMarkers);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Error retrieving and filtering data from the database' });
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
            res.status(200).json('Success! Your spot has been added to the Animap.');
        })
        .catch(err => {
            if (err.constraint === 'markers_coordinates_key') {
                res.status(400).json('Hmm... It seems like this location is already on the Animap.');
            } else {
                res.status(500).json(err, 'An error occurred while processing your request. Please, try again.');
            }
        });
});

app.listen(process.env.PORT || 3000, () => {
    console.log('Im listening');
});

