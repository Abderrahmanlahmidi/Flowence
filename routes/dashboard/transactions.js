const express = require("express");
const router = express.Router();
const { requireAuth } = require("../../Middlewares/authentication");
const { Transaction, Category, Budget } = require("../../models");
const { where } = require("sequelize");

router.get("/transactions", requireAuth, async (req, res) => {
  const categories = await Category.findAll({
    where: { userId: req.session.user.id },
  });
  const transactions = await Transaction.findAll({
    where: { userId: req.session.user.id },
    include: [{ model: Category, attributes: ['name'] }],
  });

  res.render("dashboard/transactions", {
    success: req.query.success,
    error: req.query.error,
    categories: categories.map((cat) => cat.get({ plain: true })),
    transactions: transactions.map((transaction) =>
        transaction.get({ plain: true })
    ),
    layout: "layouts/dashboard",
  });
});

router.post("/transactions", requireAuth, async (req, res) => {
  let { date, amount, categoryId, type, paymentMethod } = req.body;

  if (!date || !amount || !categoryId || !type || !paymentMethod) {
    return res.redirect("/dashboard/transactions?error=All fields are required!");
  }

  try {
    const amountNumber = parseFloat(String(amount).replace(/[^\d.-]/g, ""));
    
    const transaction = await Transaction.create({
      date,
      amount: amountNumber,
      categoryId,
      type,
      paymentMethod,
      userId: req.session.user.id,
    });

    const budget = await Budget.findOne({
      where: { userId: req.session.user.id, categoryId },
    });

    if (budget) {
      if (type === "Expense") {
        if (budget.montantPrevu >= amountNumber) {
          budget.montantPrevu -= amountNumber;
          budget.montantDepense = parseFloat(budget.montantDepense) + amountNumber;
          await budget.save();
        } else {
          await transaction.destroy();
          return res.redirect("/dashboard/transactions?error=The budget is less than the transaction amount.");
        }
      } else if (type === "Income") {
        budget.montantPrevu += amountNumber;
        await budget.save();
      }
    }

    return res.redirect("/dashboard/transactions?success=Transaction created successfully!");
  } catch (e) {
    console.error(e);
    return res.redirect("/dashboard/transactions?error=Error creating transaction!");
  }
});


router.post("/transactions/update/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const { date, amount, categoryId, type, paymentMethod } = req.body;

  if (!date || !amount || !categoryId || !type || !paymentMethod) {
    return res.redirect("/dashboard/transactions?error=All fields are required!");
  }

  try {
    const transaction = await Transaction.findOne({
      where: { id: id, userId: req.session.user.id }
    });

    if (!transaction) {
      return res.redirect("/dashboard/transactions?error=Transaction not found!");
    }

    await transaction.update({
      date,
      amount,
      categoryId,
      type,
      paymentMethod
    });

    return res.redirect(
        "/dashboard/transactions?success=Transaction updated successfully!"
    );
  } catch (error) {
    console.error(error);
    return res.redirect("/dashboard/transactions?error=Error updating transaction!");
  }
});

router.post("/transactions/delete/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.redirect("/dashboard/transactions?error=Problem deleting transaction!");
  }

  try {
    await Transaction.destroy({
      where: {
        id: id,
        userId: req.session.user.id
      }
    });
    return res.redirect(
        "/dashboard/transactions?success=Transaction deleted successfully!"
    );
  } catch (error) {
    console.error(error);
    return res.redirect("/dashboard/transactions?error=Problem deleting transaction!");
  }
});

module.exports = router;