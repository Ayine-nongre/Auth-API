require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const { signup, login, getUser, authenticate, logout } = require('./authController');
const cookieParser = require('cookie-parser')



const app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

mongoose.connect("mongodb://127.0.0.1:27017/user", { useNewUrlParser: true, useUnifiedTopology: true });

var set = mongoose.connection;
set.on('error', console.error.bind(console, 'connection error:'));
set.once('open', function() {
    console.log('Db connected successfully')
});

app.post("/signup", signup)

app.post('/login', login)

app.get('/get-user', authenticate, getUser)

app.get('/logout', logout)

app.listen(5000 || process.env.PORT, () => {
    console.log("Server is running")
})