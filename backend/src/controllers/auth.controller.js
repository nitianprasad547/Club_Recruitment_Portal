
const Student = require("../models/Student");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  sendAdminNotification
} = require("../services/email.service");

// Generate JWT
const generateToken = (studentId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    { id: studentId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
};

// Cookie configuration
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.COOKIE_SAME_SITE || "lax",
  maxAge: 24 * 60 * 60 * 1000,
  path: "/",
};

// REGISTER STUDENT
const registerStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      branch,
      year,
      team,
      reason,
      password,
      confirmPassword,
    } = req.body;

    // Check required fields
    if (
      !name ||
      !email ||
      !branch ||
      !year ||
      !team ||
      !reason ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate password
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Check existing student
    const existingStudent = await Student.findOne({
      email: email.trim().toLowerCase(),
    });

    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create student
    const student = await Student.create({
      name,
      email,
      branch,
      year,
      team,
      reason,
      password: hashedPassword,
    });

    // Notification is best-effort; mail provider outages must not block applications.
    try {
      const emailResult = await sendAdminNotification(student);
      console.log("Admin notification sent:", emailResult.id);
    } catch (error) {
      console.error("Admin email failed:", error.message);
    }

    // Generate JWT
    const token = generateToken(student._id);

    // Store JWT in HTTP-only cookie
    res.cookie("token", token, cookieOptions);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        branch: student.branch,
        year: student.year,
        team: student.team,
        reason: student.reason,
        createdAt: student.createdAt,
      },
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

// LOGIN STUDENT
const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find student and include password
    const student = await Student.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!student) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(
      password,
      student.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT
    const token = generateToken(student._id);

    // Set cookie
    res.cookie("token", token, cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        branch: student.branch,
        year: student.year,
        team: student.team,
        reason: student.reason,
        createdAt: student.createdAt,
      },
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

// GET LOGGED-IN STUDENT
const getMe = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        branch: student.branch,
        year: student.year,
        team: student.team,
        reason: student.reason,
        createdAt: student.createdAt,
      },
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch student",
    });
  }
};

// LOGOUT STUDENT
const logoutStudent = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.COOKIE_SAME_SITE || "lax",
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};


module.exports = {
  registerStudent,
  loginStudent,
  getMe,
  logoutStudent,
};
