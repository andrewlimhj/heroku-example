import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import pg from 'pg';
import multer from 'multer';
import aws from 'aws-sdk';
import multerS3 from 'multer-s3';

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

const s3 = new aws.S3({
  accessKeyId: process.env.ACCESSKEYID,
  secretAccessKey: process.env.SECRETACCESSKEY,
});

const multerUpload = multer({
  storage: multerS3({
    s3,
    bucket: 'heroku-example-bucket',
    acl: 'public-read',
    metadata: (request, file, callback) => {
      callback(null, { fieldName: file.fieldname });
    },
    key: (request, file, callback) => {
      callback(null, Date.now().toString());
    },
  }),
});

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

app.get('/recipe', (req, res) => {
  const html = `<html>
<body>
<form action="/recipe" method="post" enctype="multipart/form-data">
  <label for="label">recipe label:</label><br />
  <input type="text" id="label" name="label" /><br />
  <label for="photo">recipe photo:</label><br />
  <input type="file" name="photo" />
  <input type="submit" value="Submit" />
</form>
</body>
</html>`;
  console.log('in recipe form');
  res.send(html);
});

app.post('/recipe', multerUpload.single('photo'), (request, response) => {
  console.log(request.file);
  response.send(request.file);
});

app.listen(PORT);
