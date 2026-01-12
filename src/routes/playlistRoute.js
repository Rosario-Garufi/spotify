const express = require("express");
const { protectRoute, isAdmin } = require("../middlewares/authMiddleware");
const { createPlaylist, getPublicPlaylist, getUserPlaylist, updatePlaylist } = require("../controllers/playlistController");
const upload = require("../middlewares/upload");

const playlistRoute = express.Router();

//public
playlistRoute.get("/", getPublicPlaylist)


//private
playlistRoute.post("/", protectRoute, isAdmin, upload.single("coverImage"), createPlaylist)
playlistRoute.put("/:id", protectRoute, isAdmin, upload.single("coverImage"), updatePlaylist)
playlistRoute.get("/user/me", protectRoute, getUserPlaylist)

module.exports = playlistRoute