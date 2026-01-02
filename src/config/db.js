const mongoose = require("mongoose")
require("dotenv").config()
const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Database connesso!")
        } catch (error) {
        console.log("Errore durante la connessione!", error)
        process.exit(1)
    }
}

module.exports = connectDB