const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("home", { layout: "layouts/main"});
});

module.exports = router;
