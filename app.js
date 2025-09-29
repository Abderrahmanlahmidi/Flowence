require("dotenv").config(); 
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
const SequelizeStoreLib = require("connect-session-sequelize");
const sequelize = require("./config/db"); 
const methodOverride = require("method-override");

const app = express();

app.use(methodOverride("_method"));

// =======================
// Session Store Setup
// =======================
const SequelizeStore = SequelizeStoreLib(session.Store);
const store = new SequelizeStore({ db: sequelize });

app.use(session({
  secret: process.env.SESSION_SECRET || "secret",
  store: store,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,          
    maxAge: 1000 * 60 * 60 * 24 
  }
}));


store.sync();

// =======================
// Middleware
// =======================
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("layout", "layouts/main");


app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// =======================
// Routes
// =======================
const routes = [
  { path: "/", route: require("./routes/home") },
  { path: "/users", route: require("./routes/users") },
  { path: "/dashboard", route: require("./routes/dashboard/statics") },
  { path: "/dashboard", route: require("./routes/dashboard/categories") },
  { path: "/dashboard", route: require("./routes/dashboard/budgets") },
];

routes.forEach(({ path, route }) => {
  app.use(path, route);
});


// =======================
// Start Server
// =======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
