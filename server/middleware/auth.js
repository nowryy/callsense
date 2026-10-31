const jwt = require("jsonwebtoken");

// Guard 1: only logged-in users may pass
function requireAuth(req, res, next) {
  // The browser sends: Authorization: Bearer <token>
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Please log in first" });
  }

  try {
    // Check the signature using our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // now later code knows who is calling: { id, role }
    next();             // let the request continue
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// Guard 2: only certain roles may pass, e.g. requireRole("admin")
function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You are not allowed to do this" });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
