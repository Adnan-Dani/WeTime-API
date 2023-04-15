const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  // Get token from header
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Access denied." });
  }
}

module.exports = auth;
