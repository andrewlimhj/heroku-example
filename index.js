import express from 'express';
import dotenv from 'dotenv';
import path from 'path';

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

app.listen(PORT);
