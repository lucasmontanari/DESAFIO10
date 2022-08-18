import path from 'path'
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

function getRoot(req, res) { }

function getLogin(req, res) {
    if (req.isAuthenticated()) {
        var user = req.user;
        console.log("user logueado");
        res.render("login-ok", {
            usuario: user.username,
            nombre: user.firstName,
            apellido: user.lastName,
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

    res.sendFile(path.join(__dirname, '..', 'public', "home.html"));
}

function postSignup(req, res) {
    var user = req.user;
    res.sendFile(path.join(__dirname, '..', 'public', "home.html"));
}

function getFaillogin(req, res) {
    console.log("error en login");
    res.send("login-error");
}

function getFailsignup(req, res) {
    console.log("error en signup");
    res.send("signup-error");
}

function getLogout(req, res) {
    req.logout();
    res.sendFile(path.join(__dirname, '..', 'public', "home.html"));
}

function failRoute(req, res) {
    console.log("hola")
    res.status(404).send("routing-error");
}

export default {
    getRoot,
    getLogin,
    postLogin,
    getFaillogin,
    getLogout,
    failRoute,
    getSignup,
    postSignup,
    getFailsignup,
};
