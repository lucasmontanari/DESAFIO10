require('dotenv').config()
const { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME, SESSION_SECRET } = process.env;
const mongoose = require("mongoose")
mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`)
console.log('Conexion establecida')

const express = require("express");
const app = express()
const path = require('path')
const { Server: IOServer } = require('socket.io')
const expressServer = app.listen(8080, () => console.log('Servidor escuchando puerto 8080'))
const io = new IOServer(expressServer)
const bcrypt = require("bcrypt");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const rutas = require("./routes/rutas.js");
const Usuario = require("./models");

const ContenedorMensaje = require('./dao/MensajeDaoMongoDb.js')
const mensajes = new ContenedorMensaje()
const ContenedorProducto = require('./dao/ProductoDaoMongoDb.js')
const productos = new ContenedorProducto()

app.set('views', path.join(__dirname,'./public'))
app.set('view engine', 'ejs')

let mensajesEnBaseDeDatos = []
let productosEnBaseDeDatos = []

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/public', express.static(`${__dirname}/public`))
app.use(express.static(path.join(__dirname, './public')))

let ultimoUsuario

//PASSPORT

app.use(
  session({
    secret: SESSION_SECRET,
    cookie: {
      httpOnly: false,
      secure: false,
      maxAge: 600000,
    },
    rolling: true,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

function hashPassword(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}

function isValidPassword(reqPassword, hashedPassword) {
  return bcrypt.compareSync(reqPassword, hashedPassword);
}

const registerStrategy = new LocalStrategy(
  { passReqToCallback: true },
  async (req, username, password, done) => {
    try {
      ultimoUsuario = username
      const existingUser = await Usuario.findOne({ username });

      if (existingUser) {
        return done("User already exists", false);
      }

      const newUser = {
        username: username,
        password: hashPassword(password),
        email: req.body.email,
        nombre: req.body.nombre,
        apellido: req.body.apellido,
      };

      const createdUser = await Usuario.create(newUser);

      return done(null, createdUser);
    } catch (err) {
      console.log(err);
      done(err);
    }
  }
);


const loginStrategy = new LocalStrategy(
  async (username, password, done) => {
    ultimoUsuario = username
    const user = await Usuario.findOne({ username });

    if (!user || !isValidPassword(password, user.password)) {
      return done("Invalid credentials", null);
    }

    return done(null, user);
  });

passport.use("register", registerStrategy);
passport.use("login", loginStrategy);

passport.serializeUser((usuario, done) => {
  done(null, usuario._id);
});

passport.deserializeUser((id, done) => {
  Usuario.findById(id, done);
});

app.get("/register", rutas.getSignup);

app.post(
  "/register",
  passport.authenticate("register", { failureRedirect: "/failregister" }),
  rutas.postSignup
);

app.get("/failregister", rutas.getFailregister);

app.get("/login", rutas.getLogin);
app.post(
  "/login",
  passport.authenticate("login", { failureRedirect: "/faillogin" }),
  rutas.postLogin
);
app.get("/faillogin", rutas.getFaillogin);

function checkAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/login");
  }
}

app.get("/logout", checkAuth, rutas.getLogout);

app.get("/", checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "/public/home.html"));
});

app.get("/user", (req, res) => {
  res.json(ultimoUsuario);
});

//  FAIL ROUTE
app.get("*", rutas.failRoute);

//----------------------------------------


io.on('connection', async socket => {
  console.log(`Se conecto un usuario ${socket.id}`)

  try {
    productosEnBaseDeDatos = await productos.getAll()
    socket.emit('server:productos', productosEnBaseDeDatos)
  } catch (error) {
    console.log(`Error al adquirir los productos ${error}`)
  }
  try {
    mensajesEnBaseDeDatos = await mensajes.getAll()
    socket.emit('server:mensajes', mensajesEnBaseDeDatos)
  } catch (error) {
    console.log(`Error al adquirir los mensajes ${error}`)
  }
  socket.on('cliente:mensaje', async nuevoMensaje => {
    await mensajes.save(nuevoMensaje)
    mensajesEnBaseDeDatos = await mensajes.getAll()
    io.emit('server:mensajes', mensajesEnBaseDeDatos)
  })
  socket.on('cliente:producto', async nuevoProducto => {
    await productos.save(nuevoProducto)
    productosEnBaseDeDatos = await productos.getAll()
    io.emit('server:productos', productosEnBaseDeDatos)
  })
})