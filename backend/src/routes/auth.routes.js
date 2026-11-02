const express = require("express");
const router = express.Router();

const {
  registerStudent,
  loginStudent,
  getMe,
  logoutStudent,
} = require("../controllers/auth.controller");

const protect = require("../middleware/auth.middleware");

router.post("/register", registerStudent);
router.post("/login", loginStudent);
router.get("/me", protect, getMe);
router.post("/logout", logoutStudent);

module.exports = router;