const express = require("express");
const router = express.Router();
const { requireAuth } = require("../../Middlewares/authentication");
const bcrypt = require("bcrypt");
const {
  Budget,
  Transaction,
  Category,
  SavingGoal,
  User,
} = require("../../models");
const { where } = require("sequelize");

router.get("/profile", requireAuth, async (req, res) => {
  const user = await User.findOne({ where: { id: req.session.user.id } });

  const transactions = await Transaction.findAll({
    where: { userId: req.session.user.id },
  });
  const numTransactions = transactions.map((nc) => nc.get({ plain: true }));

  const budgets = await Budget.findAll({
    where: { userId: req.session.user.id },
  });
  const numBudget = budgets.map((nc) => nc.get({ plain: true }));

  res.render("dashboard/profile", {
    success: req.query.success || null,
    error: req.query.error || null,
    layout: "layouts/dashboard",
    user: user.get(),
    numTransactions: numTransactions.length || 0,
    numBudget: numBudget.length || 0,
  });
});

// res.redirect("/dashboard/profile?error=Error while updating budget");
// res.redirect("/dashboard/profile?success=Budget updated successfully!");

router.post("/profile/update/:id", requireAuth, async (req, res) => {
  const { firstName, lastName, email } = req.body;
  const profileId = req.params.id;

  if (!firstName || !lastName || !email || !profileId) {
    return res.redirect("/dashboard/profile?error=required field!");
  }

  try {
    await User.update(
      { firstName, lastName, email },
      { where: { id: profileId } }
    );
    res.redirect("/dashboard/profile?success=Profile updated successfully!");
  } catch (error) {
    console.error(error);
    res.redirect("/dashboard/profile?error=Error while updating profile");
  }
});


router.post("/profile/changePassword", requireAuth, async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const userId = req.session.user.id;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.redirect("/dashboard/profile?error=There is an unfilled field.");
  }

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.redirect("/dashboard/profile?error=User not found");
    }

    const { passwordHash } = user.dataValues;
    if (!passwordHash) {
      return res.redirect("/dashboard/profile?error=Password not set for this account");
    }

    const match = await bcrypt.compare(currentPassword, passwordHash);
    if (!match) {
      return res.redirect("/dashboard/profile?error=Current password is incorrect");
    }

    if (newPassword !== confirmPassword) {
      return res.redirect("/dashboard/profile?error=New passwords do not match");
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.redirect("/dashboard/profile?success=Password changed successfully");
  } catch (error) {
    console.error(error);
    return res.redirect("/dashboard/profile?error=Server error");
  }
});




module.exports = router;
