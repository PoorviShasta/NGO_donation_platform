const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// ======================
// REGISTER
// ======================
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      organizationName,
      website,
      contactNumber,
      about,
      workHistory
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.send("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      organizationName,
      website,
      contactNumber,
      about,
      workHistory,
      isApproved: role === "ngo" ? false : true
    });

    return res.redirect("/");

  } catch (error) {
    res.status(500).send(error.message);
  }
});


// ======================
// LOGIN
// ======================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.send("Invalid credentials");
    }

    if (user.role === "ngo" && !user.isApproved) {
      return res.send("NGO not approved yet");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.send("Invalid credentials");
    }

    // JWT generated (we will use later)
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // For now just redirect
    //return res.redirect("/dashboard");
    res.cookie("token", token, { httpOnly: true });
    return res.redirect("/dashboard");

  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;