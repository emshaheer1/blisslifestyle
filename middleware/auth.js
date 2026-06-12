const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const token =
    req.cookies?.bliss_token ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null);

  if (!token) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = { id: decoded.id, username: decoded.username };
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired session" });
  }
}

module.exports = { authenticateToken };
