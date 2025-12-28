const express = require("express");

require("dotenv").config()

const app = express();
const PORT = process.env.PORT
//start the server
app.listen(PORT, () =>  {
    console.log("Server avviato alla porta", PORT)
}
)