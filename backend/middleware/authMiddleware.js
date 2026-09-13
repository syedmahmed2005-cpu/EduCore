
const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  try {
    const token = req.cookies && req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured");

      return res.status(500).json({
        message: "Server configuration error"
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const readOnlyMethods = ["GET", "HEAD", "OPTIONS"];

const isThemePreferenceUpdate =
  req.method === "PUT" &&
  req.baseUrl === "/api/auth" &&
  req.path === "/theme-preference";

if (
  decoded.isDemo &&
  !readOnlyMethods.includes(req.method) &&
  !isThemePreferenceUpdate
) {
  return res.status(403).json({
    message:
      "Demo accounts are read-only. Sign in with a regular account to make changes.",
  });
}

req.user = decoded;

next();

  } catch (error) {
    console.log("Authentication error:", error.message);

    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};

module.exports = authenticate;
