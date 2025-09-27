const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");


const app = express();

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
       secure: false,
       maxAge: 1000 * 60 * 60 * 24
     },
  })
);

app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("layout", "layouts/main");


app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Routes
const homeRoute = require("./routes/home.js");
const usersRoutes = require("./routes/users.js");
const dashboardRoutes = require("./routes/dashboard.js");

app.use("/", homeRoute);
app.use("/users", usersRoutes);
app.use("/dashboard", dashboardRoutes);



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
