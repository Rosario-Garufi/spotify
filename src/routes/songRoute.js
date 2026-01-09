const express = require("express");
const { protectRoute, isAdmin } = require("../middlewares/authMiddleware");
const { createSong, getAllSongs, getSong } = require("../controllers/songController");
const upload = require("../middlewares/upload");

const songRoute = express.Router();

//configure muter to handle multiple files types
const songUpload = upload.fields([
    {name: "audio", maxCount: 1},
    {name : "cover", maxCount: 1}
])

//private
songRoute.post("/", protectRoute, isAdmin,  songUpload, createSong)

//public
songRoute.get("/", getAllSongs)
songRoute.get("/:id", getSong)



module.exports = songRoute