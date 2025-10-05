const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { User } = require("../models");
const { redirectIfAuth } = require("../Middlewares/authentication");
const nodeMailer = require("nodemailer");
require("dotenv").config();

router.get("/register", redirectIfAuth, (req, res) => {
  res.render("auth/register", {
    success: false,
    error: null,
    layout: "layouts/main",
  });
});

router.post("/register", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.render("auth/register", {
      success: false,
      error: "Invalid fields",
      layout: "layouts/main",
    });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.render("auth/register", {
        success: false,
        error: "Email already registered",
        layout: "layouts/main",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await User.create({ firstName, lastName, email, passwordHash });

    return res.render("auth/register", {
      success: true,
      error: null,
      layout: "layouts/main",
    });
  } catch (err) {
    console.error(err);
    return res.render("auth/register", {
      success: false,
      error: "Something went wrong",
      layout: "layouts/main",
    });
  }
});

router.get("/login", redirectIfAuth, (req, res) => {
  res.render("auth/login", {
    success: null,
    error: null,
    layout: "layouts/main",
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render("auth/login", {
      success: false,
      error: "Enter email and password",
      layout: "layouts/main",
    });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.render("auth/login", {
        success: false,
        error: "Email not found",
        layout: "layouts/main",
      });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.render("auth/login", {
        success: false,
        error: "Invalid password",
        layout: "layouts/main",
      });
    }

    req.session.user = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };
    return res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    return res.render("auth/login", {
      success: false,
      error: "Something went wrong",
      layout: "layouts/main",
    });
  }
});

const Transporter = nodeMailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

router.get("/forgotPassword", (req, res) => {
  res.render("auth/forgot", {
    success: null,
    error: null,
    layout: "layouts/main",
    stage: 1,
  });
});

router.post("/forgotPassword", async (req, res) => {
  const { email, code, newPassword, confirmPassword } = req.body;

  try {
    if (email && !code && !newPassword && !confirmPassword) {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.render("auth/forgot", {
          success: null,
          error: "Email not found",
          layout: "layouts/main",
          stage: 1,
        });
      }

      const verificationCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      req.session.resetEmail = email;
      req.session.verificationCode = verificationCode;
      req.session.codeExpiresAt = Date.now() + 5 * 60 * 1000;

      await Transporter.sendMail({
        from: `"Flowence App" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Password Reset Verification Code",
        text: `Your password reset verification code is: ${verificationCode}`,
      });

      return res.render("auth/forgot", {
        success: "The confirmation code has been sent to your email.",
        error: null,
        layout: "layouts/main",
        stage: 2,
      });
    }

    if (code && !newPassword && !confirmPassword) {
      const sessionEmail = req.session.resetEmail;
      const sessionCode = req.session.verificationCode;
      const sessionExpire = req.session.codeExpiresAt;

      if (!sessionEmail || !sessionCode) {
        return res.render("auth/forgot", {
          success: null,
          error: "Session expired, please start again",
          layout: "layouts/main",
          stage: 1,
        });
      }

      if (Date.now() > sessionExpire) {
        return res.render("auth/forgot", {
          success: null,
          error: "Verification code expired, please request a new one",
          layout: "layouts/main",
          stage: 1,
        });
      }

      if (code !== sessionCode) {
        return res.render("auth/forgot", {
          success: null,
          error: "Invalid verification code",
          layout: "layouts/main",
          stage: 2,
        });
      }

      return res.render("auth/forgot", {
        success: "Code verified. You can now reset your password.",
        error: null,
        layout: "layouts/main",
        stage: 3,
      });
    }

    if (newPassword && confirmPassword) {
      const sessionEmail = req.session.resetEmail;

      if (!sessionEmail) {
        return res.render("auth/forgot", {
          success: null,
          error: "Session expired, please start again",
          layout: "layouts/main",
          stage: 1,
        });
      }

      if (newPassword !== confirmPassword) {
        return res.render("auth/forgot", {
          success: null,
          error: "Passwords do not match",
          layout: "layouts/main",
          stage: 3,
        });
      }

      const user = await User.findOne({ where: { email: sessionEmail } });
      if (!user) {
        return res.render("auth/forgot", {
          success: null,
          error: "User not found",
          layout: "layouts/main",
          stage: 1,
        });
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      user.passwordHash = hashed;
      await user.save();

      req.session.verificationCode = null;
      req.session.resetEmail = null;
      req.session.codeExpiresAt = null;

      return res.render("auth/forgot", {
        success: "Password has been reset successfully. You can now login.",
        error: null,
        layout: "layouts/main",
        stage: 1,
      });
    }

    return res.render("auth/forgot", {
      success: null,
      error: "Invalid request",
      layout: "layouts/main",
      stage: 1,
    });
  } catch (err) {
    console.error(err);
    return res.render("auth/forgot", {
      success: null,
      error: "Something went wrong",
      layout: "layouts/main",
      stage: 1,
    });
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
