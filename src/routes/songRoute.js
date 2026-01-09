const express = require("express");
const { protectRoute, isAdmin } = require("../middlewares/authMiddleware");
const { createSong, getAllSongs, getSong, updateSong, deleteSong, getTopSong, getNewReleases } = require("../controllers/songController");
const upload = require("../middlewares/upload");

const songRoute = express.Router();

//configure muter to handle multiple files types
const songUpload = upload.fields([
    {name: "audio", maxCount: 1},
    {name : "cover", maxCount: 1}
])

//private
songRoute.post("/", protectRoute, isAdmin,  songUpload, createSong)
songRoute.put("/:id", protectRoute, isAdmin,  songUpload, updateSong)
songRoute.delete("/:id", protectRoute, isAdmin, deleteSong)



//public
songRoute.get("/", getAllSongs)
songRoute.get("/top-song", getTopSong)
songRoute.get("/new-releases", getNewReleases)
songRoute.get("/:id", getSong)



module.exports = songRoute