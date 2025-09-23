const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../config/db");

router.get("/login", (req, res) => { res.render("login", {success:null, error:null}); });
router.get("/register", (req, res) => {
    res.render("register", { success: false });
});

router.post("/register", (req, res) => {
    const {firstName, lastName, email, password} = req.body

    if(!firstName || !lastName || !email || !password){
        res.send("All fields are required")
    }

    const saltRounds = 10;
    const passwordHash = bcrypt.hashSync(password, saltRounds);
    const roleId = 1;

    const sql = "INSERT INTO utilisateur (firstName,  lastName, email, passwordHash, roleId) values (?, ?, ?, ?, ?)";
    db.query(sql, [firstName, lastName, email, passwordHash, roleId], (err, result) => {
        if (err) throw err;
        res.render("register", {success: true});
    });
})


router.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.render("login", { success: false, error: "Please enter a valid email and password" });
    }

    const sql = "SELECT * FROM utilisateur WHERE email = ?";
    db.query(sql, [email], (err, result) => {
        if (err) throw err;

        if (result.length === 0) {
            return res.render("login", { success: false, error: "Email not found" });
        }

        const user = result[0];
        bcrypt.compare(password, user.passwordHash, (err, isMatch) => {
            if (err) throw err;

            if (!isMatch) {
                return res.render("login", { success: false, error: "Invalid password" });
            }

            req.session.user = {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            };

            res.redirect("/users/profile");
        });
    });
});

router.get("/profile", (req, res) => {
    if (!req.session.user) {
        return res.send("Not logged in");
    }
    res.send(`Welcome ${req.session.user.firstName} ${req.session.user.lastName}`);
});


module.exports = router;