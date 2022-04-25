import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import pg from 'pg';

const { Pool } = pg;

let pgConnectionConfigs;

// test to see if the env var is set. Then we know we are in Heroku
if (process.env.DATABASE_URL) {
  // pg will take in the entire value and use it to connect
  pgConnectionConfigs = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  };
} else {
  // this is the same value as before
  pgConnectionConfigs = {
    user: 'andrewlim',
    host: 'localhost',
    database: 'andrewlim',
    port: 5432,
  };
}
const pool = new Pool(pgConnectionConfigs);

const envFilePath = '.env';
dotenv.config({ path: path.normalize(envFilePath) });

const PORT = process.env.PORT;

// Initialise Express
const app = express();

app.set('view engine', 'ejs');

app.get('/bananas', (request, response) => {
  const responseText = `This is a random number: ${Math.random()}`;

  console.log('request came in', responseText);

  const data = { responseText };

  response.render('bananas', data);
});

app.get('/cats', (request, response) => {
  console.log('request came in');
  pool
    .query('SELECT * from cats')
    .then((result) => {
      console.log(result.rows[0].name);
      response.send(result.rows);
    })
    .catch((error) => {
      console.error('Error executing query', error.stack);
      response.status(503).send(result.rows);
    });
});

app.listen(PORT);
