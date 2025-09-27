const express = require("express");
const router = express.Router();
const {requireAuth} = require("../Middlewares/authentication");

router.get("/", requireAuth ,(req, res) => {
  res.render("dashboard/statics", { layout: "layouts/dashboard"});
});

module.exports = router;
