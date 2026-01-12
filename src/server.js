const express = require("express");
const connectDB = require("./config/db");
const userRouter = require("./routes/userRoute");
const { StatusCodes } = require("http-status-codes");
const artistRouter = require("./routes/artistRoute");
const albumRoute = require("./routes/albumRoute");
const songRoute = require("./routes/songRoute");
const playlistRoute = require("./routes/playlistRoute");

require("dotenv").config()

const app = express();
const PORT = process.env.PORT

app.use(express.json())


//***** USER ROUTE *****/
app.use("/api/v1/users", userRouter)


//***** ARTIST ROUTE *****/
app.use("/api/v1/artists", artistRouter)

//***** ALBUM ROUTE *****/
app.use("/api/v1/albums", albumRoute)

//***** SONG ROUTE *****/
app.use("/api/v1/songs", songRoute)

//***** PLAYLIST ROUTE *****/
app.use("/api/v1/playlist", playlistRoute)

//error handle
app.use((req, res, next) => {
    const error = new Error("Not Found");
    error.status = StatusCodes.NOT_FOUND;
    next(error)
})

app.use((err, req, res, next) => {
    res.status(err.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: err.message || "Internal server error",
        status:"Error"
    })
})


//start the server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("Database Avviato")
        console.log(`Server avviato alla porta n ${PORT}`)
    })
}).catch((error) => {
    console.log(`******Errore database******* ${error}`)
})

