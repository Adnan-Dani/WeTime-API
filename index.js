const express = require('express');
const app = express();
const dotenv = require('dotenv');
// Load environment variables from .env file
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

require('./startup/cors')(app);
require('./startup/routes')(app);

app.listen(process.env.PORT || 8080, () => console.log(`WeTime server started on http://localhost:8080`))