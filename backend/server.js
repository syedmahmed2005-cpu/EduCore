const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");

const app = express();

const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  "https://www.myeducore.app",
  "https://myeducore.app",
  "https://student-manegement-system-full-stac.vercel.app",
   process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Origin not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use(async function (req, res, next) {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.log("Database connection failed:", error.message);
    res.status(500).json({
      message: "Database connection failed"
    });
  }
});

const studentRoutes = require("./routes/students");
const facultyRoutes = require("./routes/faculty");
const courseRoutes = require("./routes/courses");
const classRoutes = require("./routes/classRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const authRoutes = require("./routes/authRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const gradeRoutes = require("./routes/gradeRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");

app.get("/", function (req, res) {
  res.send("Student Management System Backend Server is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/assignments", assignmentRoutes);

if (require.main === module) {
  app.listen(PORT, function () {
    console.log(`Backend server is running on port ${PORT}`);
  });
}

module.exports = app;
