const express = require("express");
const router = express.Router();
const { requireAuth } = require("../../Middlewares/authentication");
const {
  Budget,
  Transaction,
  Category,
  SavingGoal,
  User,
} = require("../../models");
const { where } = require("sequelize");

router.get("/profile", requireAuth, async (req, res) => {

    const user = await User.findOne({where:{id:req.session.user.id}});

    const transactions = await Transaction.findAll({where:{userId:req.session.user.id}})
    const numTransactions = transactions.map((nc) => nc.get({plain:true}));

    const budgets = await Budget.findAll({where:{userId:req.session.user.id}})
    const numBudget = budgets.map((nc) => nc.get({plain:true}));

    res.render("dashboard/profile", {
      success: req.query.success || null,
      error: req.query.error || null,
      layout: "layouts/dashboard",
      user: user.get(),
      numTransactions:numTransactions.length || 0,
      numBudget:numBudget.length || 0
    });
});

// res.redirect("/dashboard/profile?error=Error while updating budget");
// res.redirect("/dashboard/profile?success=Budget updated successfully!");


router.post("/profile", requireAuth, async (req, res) => {
    const {firstName,lastName,email} = req.body;
    const profileId = req.params.id
    
    if(!firstName || !lastName || !email || !profileId){
        return res.redirect("/dashboard/profile?error=required field!");
    }
    
    try{
        await User.update({firstName, lastName, email}, {where:{id:profileId}})
        res.redirect("/dashboard/profile?success=Profile updated successfully!");
    }catch(error){
        // res.redirect("/dashboard/profile?error=Error while updating budget");
    }




})





module.exports = router;
