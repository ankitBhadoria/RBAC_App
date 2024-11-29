// Role-Based Access Control (RBAC) middleware 
const rbac = (requiredRoles) => {
  return (req, res, next) => {
    // Check if the user's role is in the list of required roles
    if (requiredRoles.includes(req.user.role)) {
      // If authorized, pass control to the next middleware or route handler
      next();
    } else {
      res.status(403).send({ error: 'Access denied.' });
    }
  };
};

module.exports = rbac;
