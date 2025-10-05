const express = require("express");
const router = express.Router();
const { requireAuth } = require("../../Middlewares/authentication");
const { Category } = require("../../models");
const { where } = require("sequelize");

router.post("/categories", requireAuth, async (req, res) => {
  const { name, description } = req.body;
  const userId = req.session.user.id;

  if (!name || !description) {
    return res.redirect("/dashboard/categories?error=All fields are required!");
  }

  try {
    const categories = await Category.findAll({ where: { userId } });
    const category = categories.map(cat => cat.get({ plain: true }));

    const available = category.some(cat => cat.name.toLowerCase() === name.toLowerCase());

    if (available) {
      return res.redirect("/dashboard/categories?error=This category already exists!");
    }

    await Category.create({ name, description, userId });

    return res.redirect("/dashboard/categories?success=Category created successfully!");
  } catch (err) {
    console.error(err);
    return res.redirect("/dashboard/categories?error=Error while creating category");
  }
});


router.get("/categories", requireAuth, async (req, res) => {
  const categories = await Category.findAll({
    where: { userId: req.session.user.id },
  });

  res.render("dashboard/categories", {
    success: req.query.success || null,
    error: req.query.error || null,
    layout: "layouts/dashboard",
    categories: categories.map((cat) => cat.get({ plain: true })),
  });
});

router.post("/category/delete/:id", requireAuth, async (req, res) => {
  const categoryId = req.params.id;
  const userId = req.session.user.id;

  try {
    await Category.destroy({ where: { id: categoryId, userId } });
    return res.redirect(
      "/dashboard/categories?success=Category deleted successfully!"
    );
  } catch (err) {
    console.error(err);
    return res.redirect(
      "/dashboard/categories?error=Error while deleting category"
    );
  }
});

module.exports = router;
