const path = require("path")
function getRoot(req, res) { }

function getLogin(req, res) {
    if (req.isAuthenticated()) {
        var user = req.user;
        console.log("user logueado");
        res.render("login-ok", {
            usuario: user.username,
            nombre: user.nombre,
            apellido: user.apellido,
            email: user.email,
        });
    } else {
        console.log("user NO logueado");
        res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
    }
}

function getSignup(req, res) {
    res.sendFile(path.join(__dirname, '..', 'public', "register.html"));
}

function postLogin(req, res) {
    var user = req.user;
    res.redirect("/")
}

function postSignup(req, res) {
    var user = req.user;
    res.redirect("/login")
    //res.sendFile(path.join(__dirname, '..', 'public', "home.html"));
}

function getFaillogin(req, res) {
    console.log("error en login");
    res.render("login-error", {});
}

function getFailregister(req, res) {
    console.log("error en register");
    res.render("register-error",{});
}

function getLogout(req, res) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.sendFile(path.join(__dirname, '..', 'public', "logout.html"));
  });
}

function failRoute(req, res) {
    res.status(404).render("routing-error",{});
}

module.exports = {
  getRoot,
  getLogin,
  postLogin,
  getFaillogin,
  getLogout,
  failRoute,
  getSignup,
  postSignup,
  getFailregister,
};
