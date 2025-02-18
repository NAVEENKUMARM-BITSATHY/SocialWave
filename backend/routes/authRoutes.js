const express = require("express");
const { register, login } = require("../controllers/authController"); // Ensure correct import
const router = express.Router();

router.post("/register", register); // This must be a valid function
router.post("/login", login); // This must be a valid function


module.exports = router;
