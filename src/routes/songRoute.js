const express = require("express");
const { protectRoute, isAdmin } = require("../middlewares/authMiddleware");
const { createSong } = require("../controllers/songController");
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


module.exports = songRoute