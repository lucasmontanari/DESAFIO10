const mongoose = require('mongoose');
 
module.exports = mongoose.model('Users',{
    username: String,
    password: String,
    email: String,
    nombre: String,
    apellido: String
});
