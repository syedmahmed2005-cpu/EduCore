
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { sendPasswordResetEmail } = require("../services/emailService");

const authenticate = require("../middleware/authMiddleware");

const router = express.Router();
const demoAccounts = {
  student: "student1@sms.com",
  faculty: "ahmed.khan@sms.com",
};

// REGISTER
router.post("/register", async function (req, res) {
  try {
    const {
      name,
      email,
      password,
      role,
      studentId,
      facultyId,
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Name, email, password and role are required"
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // Student must have a studentId
    if (role === "student" && !studentId) {
      return res.status(400).json({
        message: "studentId is required for student accounts"
      });
    }

    // Faculty must have a facultyId
    if (role === "faculty" && !facultyId) {
      return res.status(400).json({
        message: "facultyId is required for faculty accounts"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      studentId: role === "student" ? studentId : null,
      facultyId: role === "faculty" ? facultyId : null,
      themePreference: user.themePreference || "system"
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        facultyId: user.facultyId,
        themePreference: user.themePreference || "system"
      }
    });

  } catch (error) {
    console.log("Registration error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "A user with these details already exists"
      });
    }

    res.status(500).json({
      message: "Server error"
    });
  }
});
// DEMO LOGIN
router.post("/demo-login", async function (req, res) {
  try {
    const { role } = req.body;
    const demoEmail = demoAccounts[role];

    if (!demoEmail) {
      return res.status(400).json({
        message: "Select a valid demo role",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "Server configuration error",
      });
    }

    const user = await User.findOne({
      email: demoEmail,
      role,
    });

    if (!user) {
      return res.status(404).json({
        message: "Demo account is currently unavailable",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        isDemo: true,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    const isProduction =
      process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      maxAge: 60 * 60 * 1000,
    });

    res.json({
      message: "Demo login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        facultyId: user.facultyId,
        themePreference:
          user.themePreference || "system",
        isDemo: true,
      },
    });
  } catch (error) {
    console.log("Demo login error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// LOGIN
router.post("/login", async function (req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured");

      return res.status(500).json({
        message: "Server configuration error"
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

if (Object.values(demoAccounts).includes(normalizedEmail)) {
  return res.status(403).json({
    message: "Please use the demo access buttons",
  });
}

const user = await User.findOne({
  email: normalizedEmail,
});

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h"
      }
    );

   const isProduction = process.env.NODE_ENV === "production";

res.cookie("token", token, {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
  maxAge: 60 * 60 * 1000,
});
    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        facultyId: user.facultyId,
        themePreference: user.themePreference || "system"
      }
    });

  } catch (error) {
    console.log("Login error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
});


// LOGOUT
router.post("/logout", function (req, res) {
  res.clearCookie("token", {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/"
});

  res.json({
    message: "Logout successful"
  });
});


// CURRENT USER
router.get("/me", authenticate, async function (req, res) {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        facultyId: user.facultyId,
        themePreference: user.themePreference || "system"
      }
    });

  } catch (error) {
    console.log("Current user error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
});

// UPDATE THEME PREFERENCE
router.put("/theme-preference", authenticate, async function (req, res) {
  try {
    const { themePreference } = req.body;

    const allowedThemes = ["light", "dark", "system"];

    if (!allowedThemes.includes(themePreference)) {
      return res.status(400).json({
        message: "Theme preference must be light, dark, or system"
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        $set: {
          themePreference
        }
      },
      {
        new: true,
        runValidators: true
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json({
      message: "Theme preference updated successfully",
      themePreference: user.themePreference
    });
  } catch (error) {
    console.log("Update theme preference error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
});

//CHANGE PASSWORD
router.put("/change-password", authenticate, async function (req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters"
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Current password is incorrect"
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    res.json({
      message: "Password changed successfully"
    });

  } catch (error) {
    console.log("Change password error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
});

// FORGOT PASSWORD
const RESET_TOKEN_TTL_MINUTES = 15;
const RESET_REQUEST_COOLDOWN_MS = 60 * 1000;
const MIN_PASSWORD_LENGTH = 6;

const forgotPasswordResponse = {
  message:
    "If an account exists for that email, a password reset link has been sent.",
};

function hashResetToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function getFrontendUrl() {
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL.replace(/\/+$/, "");
  }

  return process.env.NODE_ENV === "production"
    ? "https://myeducore.app"
    : "http://localhost:5173";
}

router.post("/forgot-password", async function (req, res) {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Demo accounts are shared and read-only; never allow resetting them
    if (Object.values(demoAccounts).includes(normalizedEmail)) {
      return res.json(forgotPasswordResponse);
    }

    const user = await User.findOne({ email: normalizedEmail });

    // Same response whether or not the account exists, so emails can't be probed
    if (!user) {
      return res.json(forgotPasswordResponse);
    }

    // Don't send another email if one was sent less than a minute ago
    const ttlMs = RESET_TOKEN_TTL_MINUTES * 60 * 1000;
    if (
      user.passwordResetExpires &&
      user.passwordResetExpires.getTime() - ttlMs + RESET_REQUEST_COOLDOWN_MS >
        Date.now()
    ) {
      return res.json(forgotPasswordResponse);
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.passwordResetToken = hashResetToken(resetToken);
    user.passwordResetExpires = new Date(Date.now() + ttlMs);
    await user.save();

    const resetUrl = `${getFrontendUrl()}/reset-password?token=${resetToken}`;

    try {
      await sendPasswordResetEmail(
        user.email,
        user.name,
        resetUrl,
        RESET_TOKEN_TTL_MINUTES
      );
    } catch (emailError) {
      console.log("Password reset email error:", emailError.message);

      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await user.save();
    }

    res.json(forgotPasswordResponse);
  } catch (error) {
    console.log("Forgot password error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// RESET PASSWORD (from emailed link)
router.post("/reset-password", async function (req, res) {
  try {
    const { token, password } = req.body;

    if (!token || typeof token !== "string" || !password) {
      return res.status(400).json({
        message: "Reset token and new password are required",
      });
    }

    if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        message: `New password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Atomically consume the token so a link can only ever be used once
    const user = await User.findOneAndUpdate(
      {
        passwordResetToken: hashResetToken(token),
        passwordResetExpires: { $gt: new Date() },
        email: { $nin: Object.values(demoAccounts) },
      },
      {
        $set: {
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      }
    );

    if (!user) {
      return res.status(400).json({
        message:
          "This reset link is invalid or has expired. Please request a new one.",
      });
    }

    res.json({
      message: "Password reset successfully. You can now sign in.",
    });
  } catch (error) {
    console.log("Reset password error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

module.exports = router;