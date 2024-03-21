const express = require('express');
const cors = require('cors');
const userRouter = require('./controllers/userController.js');
const loginRouter = require('./controllers/loginController.js');

const app = express();

//  Middleware
app.set('view engine','ejs'); // set up ejs for templating
app.use(express.urlencoded({ extended: false })); // parse form data

app.use(express.json());
app.use(cors());
 
app.use('/users',userRouter);
app.use('/api',loginRouter);

module.exports = app;