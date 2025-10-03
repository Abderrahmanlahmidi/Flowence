const express = require("express");
const router = express.Router();
const { requireAuth } = require("../../Middlewares/authentication");
const { Budget, Transaction, Category, SavingGoal } = require("../../models");

router.get("/", requireAuth, async (req, res) => {
  try {
    const budgets = await Budget.findAll({
      where: { userId: req.session.user.id },
      include: [{ model: Category }],
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
      budget: budget,
      lastTransactions: lastThreeTransactions,
      total: total,
      layout: "layouts/dashboard",
    });
  } catch (error) {
    console.log("statics errors", error);
  }
});

router.get("/savings/export/csv", requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;

    const goals = await SavingGoal.findAll({
      where: { userId },
      include: [{ model: Category, attributes: ["name"] }],
    });

    const transactions = await Transaction.findAll({
      where: { userId },
      include: [{ model: Category, attributes: ["name"] }],
    });

    const budgets = await Budget.findAll({ where: { userId } });
    const totalBudget = budgets.reduce(
      (acc, b) => acc + parseFloat(b.montantPrevu || 0),
      0
    );

    let csv = "";

    csv += "=== Saving Goals ===\n";
    csv += "Title,Category,Target Amount,Deadline\n";
    goals.forEach((goal) => {
      csv += `${goal.title},${goal.category ? goal.category.name : ""},${
        goal.targetAmount
      },${goal.deadline.toISOString().split("T")[0]}\n`;
    });
    csv += "\n";

    csv += "=== Transactions ===\n";
    csv += "Date,Amount,Category,Type,Payment Method\n";
    transactions.forEach((tr) => {
      csv += `${tr.date.toISOString().split("T")[0]},${tr.amount},${
        tr.Category ? tr.Category.name : ""
      },${tr.type},${tr.paymentMethod}\n`;
    });
    csv += "\n";

    csv += "=== Total Budget ===\n";
    csv += `Total Budget (MAD),${totalBudget}\n`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=financial_report.csv"
    );

    res.send("\uFEFF" + csv);
  } catch (error) {
    console.error("Export CSV error:", error);
    res.redirect("/dashboard?error=Error exporting CSV!");
  }
});

module.exports = router;
