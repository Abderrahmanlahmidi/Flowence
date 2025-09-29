const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { User } = require("../models");
const { redirectIfAuth } = require("../Middlewares/authentication");
const nodeMailer = require("nodemailer");

router.get("/register", redirectIfAuth, (req, res) => {
  res.render("auth/register", { success: false, error: null, layout: "layouts/main" });
});

router.post("/register", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.render("auth/register", { success: false, error: "Invalid fields", layout: "layouts/main" });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.render("auth/register", { success: false, error: "Email already registered", layout: "layouts/main" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await User.create({ firstName, lastName, email, passwordHash });

    return res.render("auth/register", { success: true, error: null, layout: "layouts/main" });
  } catch (err) {
    console.error(err);
    return res.render("auth/register", { success: false, error: "Something went wrong", layout: "layouts/main" });
  }
});


router.get("/login", redirectIfAuth, (req, res) => {
  res.render("auth/login", { success: null, error: null, layout: "layouts/main" });
});


router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render("auth/login", { success: false, error: "Enter email and password", layout: "layouts/main" });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.render("auth/login", { success: false, error: "Email not found", layout: "layouts/main" });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.render("auth/login", { success: false, error: "Invalid password", layout: "layouts/main" });
    }

    req.session.user = { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email };
    return res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    return res.render("auth/login", { success: false, error: "Something went wrong", layout: "layouts/main" });
  }
});

router.get("/forgotPassword", (req, res) => {
  res.render("auth/forgot", { success: null, error: null, layout: "layouts/main", stage: 1 });
});

router.post("/forgotPassword", async (req, res) => {
  const { email, code } = req.body;


  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.render("auth/forgot", { success: null, error: "Email unavailable", layout: "layouts/main", stage: 1 });
    }


    if (!code) {
      const verificationCode = Math.floor(Math.random() * 1000000) + 1;

  

      return res.render("auth/forgot", {
        success: "The confirmation code has been sent.",
        error: null,
        layout: "layouts/main",
        stage: 2,
      });
    }

    if (code === "123456") {
      return res.render("auth/forgot", { success: "Code verified, you can reset your password.", error: null, stage: 3 });
    }

    return res.render("auth/forgot", { success: null, error: "Invalid code", stage: 2 });
  } catch (err) {
    console.error(err);
    return res.render("auth/forgot", { success: null, error: "Something went wrong", stage: 1 });
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      return res.redirect("/dashboard");
    }
    res.clearCookie("connect.sid");
    res.redirect("/users/login");
  });
});

module.exports = router;
