const express = require("express");
const router = express.Router();
const { requireAuth } = require("../../Middlewares/authentication");
const { Budget, Category } = require("../../models");
const { where } = require("sequelize");

router.get("/budgets", requireAuth, async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { userId: req.session.user.id },
    });

    const budgets = await Budget.findAll({
      where: { userId: req.session.user.id },
      include: [{ model: Category }],
    });

    res.render("dashboard/budgets", {
      layout: "layouts/dashboard",
      categories: categories.map((cat) => cat.get({ plain: true })),
      budgets: budgets.map((b) => b.get({ plain: true })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching budgets");
  }
});


router.post("/budgets", requireAuth, async (req, res) => {
  const { montantPrevu, categoryId, periode } = req.body;
  const userId = req.session.user.id;

  if (!montantPrevu || !categoryId || !periode) {
    return res.redirect("/dashboard/budgets?error=All fields are required!");
  }

  try {
    await Budget.create({
      montantPrevu,
      montantDepense: 0,
      categoryId,
      userId,
      periode,
    });

    return res.redirect("/dashboard/budgets?success=Budget created successfully!");
  } catch (err) {
    console.error(err);
    return res.redirect("/dashboard/budgets?error=Error while creating budget");
  }
});


router.post("/budgets/delete/:id", requireAuth, async (req, res) => {
  const budgetId = req.params.id;
  const userId = req.session.user.id;

  try {
    await Budget.destroy({
      where: {
        id: budgetId,
        userId: userId,
      },
    });

    return res.redirect("/dashboard/budgets?success=Budget deleted successfully!");
  } catch (err) {
    console.error(err);
    return res.redirect("/dashboard/budgets?error=Error while deleting budget");
  }
});


router.post("/budgets/update/:id", requireAuth, async (req, res) => {
  const budgetId = req.params.id;
  const { montantPrevu, categoryId, periode } = req.body;
  const userId = req.session.user.id;

  try {
    await Budget.update(
      { montantPrevu, categoryId, periode },
      { where: { id: budgetId, userId } }
    );
    res.redirect("/dashboard/budgets?success=Budget updated successfully!");
  } catch (err) {
    res.redirect("/dashboard/budgets?error=Error while updating budget");
  }
});

module.exports = router;
