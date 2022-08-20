const ContenedorMongoDb = require("../contenedores/ContenedorMongoDb.js")
const mongoose = require("mongoose")

module.exports = class ContenedorProductoMongoDb extends ContenedorMongoDb{
    constructor(){
        const productoScherma = new mongoose.Schema({
            nombre: {type: String},
            precio: {type: Number},
            imagen: {type: String}
        })

        super('productos', productoScherma)
    }

}