const express = require("express");
const router = express.Router();
const { requireAuth } = require("../../Middlewares/authentication");
const { Budget, Transaction, Category } = require("../../models");

router.get("/", requireAuth, async (req, res) => {
  try {
    const budgets = await Budget.findAll({
      where: { userId: req.session.user.id },
      include:[{model:Category}]
    });

    const budget = budgets.map((bud) => bud.get({ plain: true }));

    let total = budget.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.montantPrevu;
    }, 0);

    const Transactions = await Transaction.findAll({
      where: { userId: req.session.user.id },
      include: [{ model: Category, attribute: ["name"] }],
    });

    const transaction = Transactions.map((tr) => tr.get({ plain: true }));
    const lastThreeTransactions = transaction.slice(-3);

    res.render("dashboard/statics", {
      budget:budget,
      lastTransactions: lastThreeTransactions,
      total: total,
      layout: "layouts/dashboard",
    });
  } catch (error) {
    console.log("statics errors", error);
  }
});

module.exports = router;
