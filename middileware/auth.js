const jwt = require("jsonwebtoken");

const requireLogin = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect("/");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.redirect("/");
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).send("Admin access only.");
  }
  next();
};

module.exports = requireLogin;
module.exports.requireAdmin = requireAdmin;
