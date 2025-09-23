const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const session = require("express-session");
const path = require("path");

require('dotenv').config();

const app = express();

app.use(session({
    secret: "123123321321",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.use(bodyParser.urlencoded({ extended: true }));

const welcomeRoutes = require("./routes/welcome.js");
const usersRoutes = require("./routes/users.js");

app.use('/', welcomeRoutes);
app.use('/users', usersRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Listening on port localhost:${PORT}`);
});