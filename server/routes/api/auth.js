var express = require("express");
var router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../models/user");
const { check, validationResult } = require("express-validator");
const config = require("config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");


router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Authenticating the user by generating the JWT token

router.post(
  "/signin",
  [
    check("email", "email must be there ").isEmail(),
    check("password", "please enter the password").isLength({ min: 8 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ errors: [{ msg: "invalid user" }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if(!isMatch){
          return res.status(400).json({ errors: [{ msg: "invalid user" }] });
      }
      const payload = {
        user: {
          id: user.id,
        },
      };
      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          return res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(400).json("Server error");
    }
  }
);

module.exports = router;
