const express = require("express");
const router = express.Router();
const { requireAuth } = require("../Middlewares/authentication");
const { Category } = require("../models");

router.get("/", requireAuth, (req, res) => {
  res.render("dashboard/statics", { layout: "layouts/dashboard" });
});

router.get("/categories", requireAuth, (req, res) => {
  
  res.render("dashboard/categories", {
    success: null,
    error: null,
    layout: "layouts/dashboard",
  });
});

router.post("/categories", requireAuth, async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    return res.render("dashboard/categories", {
      success: null,
      error: "All fields are required!",
      layout: "layouts/dashboard",
    });
  }

  try {
    await Category.create({ name, description });

    return res.render("dashboard/categories", {
      success: "Category created successfully!",
      error: null,
      layout: "layouts/dashboard",
    });
  } catch (err) {
    return res.render("dashboard/categories", {
      success: null,
      error: "An error occurred while creating the category.",
      layout: "layouts/dashboard",
    });
  }
});

module.exports = router;
