const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("home", { layout: "layouts/main", pageTitle:"statics"});
});

module.exports = router;
