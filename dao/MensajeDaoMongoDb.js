const ContenedorMongoDb = require("../contenedores/ContenedorMongoDb.js")
const mongoose = require("mongoose")

module.exports = class ContenedorMensajeMongoDb extends ContenedorMongoDb{
    constructor(){
        const mensajeScherma = new mongoose.Schema({
            author: {type: Object},
            tiempoStamp: {type: String},
            text: {type: String}
        })

        super('mensajes', mensajeScherma)
    }

}
