function redirectIfAuth(req, res, next) {
    if(req.session.user) {
        return res.redirect("/dashboard")
    }
    next();
}

function requireAuth(req, res, next) {
    if(!req.session.user) {
      return res.redirect("/users/login");
    }
    next();
}

module.exports = {redirectIfAuth, requireAuth};