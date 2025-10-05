const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPG, PNG or GIF allowed."));
  }
};

const upload = multer({ storage, fileFilter });

router.post(
  "/profile/update/:id",
  requireAuth,
  upload.single("profileImage"),
  async (req, res) => {
    const { firstName, lastName, email } = req.body;
    const profileId = req.params.id;

    if (!firstName || !lastName || !email || !profileId) {
      return res.redirect("/dashboard/profile?error=All fields are required");
    }

    try {
      const user = await User.findByPk(profileId);
      if (!user) {
        return res.redirect("/dashboard/profile?error=User not found");
      }

      const updateData = { firstName, lastName, email };

      if (req.file) {
        if (user.profileImage) {
          const oldImagePath = path.join(
            __dirname,
            "..",
            "public",
            user.profileImage
          );
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }

        updateData.profileImage = `/uploads/${req.file.filename}`;
      }

      await User.update(updateData, { where: { id: profileId } });

      res.redirect("/dashboard/profile?success=Profile updated successfully!");
    } catch (error) {
      console.error(error);
      res.redirect("/dashboard/profile?error=Error while updating profile");
    }
  }
);

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
      return res.redirect(
        "/dashboard/profile?error=Password not set for this account"
      );
    }

    const match = await bcrypt.compare(currentPassword, passwordHash);
    if (!match) {
      return res.redirect(
        "/dashboard/profile?error=Current password is incorrect"
      );
    }

    if (newPassword !== confirmPassword) {
      return res.redirect(
        "/dashboard/profile?error=New passwords do not match"
      );
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.redirect(
      "/dashboard/profile?success=Password changed successfully"
    );
  } catch (error) {
    console.error(error);
    return res.redirect("/dashboard/profile?error=Server error");
  }
});

module.exports = router;
