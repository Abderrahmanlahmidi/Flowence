const express = require("express");
const router = express.Router();
const { requireAuth } = require("../../Middlewares/authentication");
const { SavingGoal, Category } = require("../../models");


router.get("/savings", requireAuth, async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { userId: req.session.user.id },
    });

    const savings = await SavingGoal.findAll({
      where: { userId: req.session.user.id },
      include: [{ model: Category, attributes: ["name"] }],
    });

    res.render("dashboard/savings", {
      layout: "layouts/dashboard",
      categories: categories.map((cat) => cat.get({ plain: true })),
      savings: savings.map((s) => s.get({ plain: true })),
      success: req.query.success || null,
      error: req.query.error || null,
    });
  } catch (error) {
    console.error("Error loading savings:", error);
    res.redirect("/dashboard/savings?error=Error loading savings goals");
  }
});


router.post("/savings", requireAuth, async (req, res) => {
  const { title, targetAmount, deadline, categoryId } = req.body;

  if (!title || !targetAmount || !deadline || !categoryId) {
    return res.redirect("/dashboard/savings?error=All fields are required!");
  }

  try {
    await SavingGoal.create({
      title,
      targetAmount,
      deadline,
      categoryId,
      userId: req.session.user.id,
    });

    res.redirect("/dashboard/savings?success=Saving goal created successfully!");
  } catch (error) {
    console.error("Error creating saving goal:", error);
    res.redirect("/dashboard/savings?error=Error creating saving goal!");
  }
});

router.post("/savings/update/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const { title, targetAmount, deadline, categoryId } = req.body;

  try {
    const goal = await SavingGoal.findOne({
      where: { id, userId: req.session.user.id },
    });

    if (!goal) {
      return res.redirect("/dashboard/savings?error=Saving goal not found!");
    }

    goal.title = title;
    goal.targetAmount = targetAmount;
    goal.deadline = deadline;
    goal.categoryId = categoryId;
    await goal.save();

    res.redirect("/dashboard/savings?success=Saving goal updated successfully!");
  } catch (error) {
    console.error("Error updating saving goal:", error);
    res.redirect("/dashboard/savings?error=Error updating saving goal!");
  }
});

router.post("/savings/delete/:id", requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const goal = await SavingGoal.findOne({
      where: { id, userId: req.session.user.id },
    });

    if (!goal) {
      return res.redirect("/dashboard/savings?error=Saving goal not found!");
    }

    await goal.destroy();
    res.redirect("/dashboard/savings?success=Saving goal deleted successfully!");
  } catch (error) {
    console.error("Error deleting saving goal:", error);
    res.redirect("/dashboard/savings?error=Error deleting saving goal!");
  }
});

module.exports = router;
