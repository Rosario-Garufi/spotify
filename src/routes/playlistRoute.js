const express = require("express");
const { protectRoute, isAdmin } = require("../middlewares/authMiddleware");
const { createPlaylist, getPublicPlaylist, getUserPlaylist, updatePlaylist, deletePlaylist, addSongToPlaylist, removeSongFromPlaylist, addCollaboratorToPlaylist, removeCollaborator, removeCollaboratorFromPlaylist, getFeaturedPlaylist } = require("../controllers/playlistController");
const upload = require("../middlewares/upload");

const playlistRoute = express.Router();

//public
playlistRoute.get("/", getPublicPlaylist)
playlistRoute.get("/featured-playlist", getFeaturedPlaylist)



//private
playlistRoute.post("/", protectRoute, isAdmin, upload.single("coverImage"), createPlaylist)
playlistRoute.put("/:id", protectRoute, isAdmin, upload.single("coverImage"), updatePlaylist)
playlistRoute.delete("/:id", protectRoute, isAdmin,deletePlaylist)
playlistRoute.put("/:id/add-song", protectRoute,addSongToPlaylist)
playlistRoute.put("/:id/remove-song", protectRoute,removeSongFromPlaylist)
playlistRoute.put("/:id/add-collaborator", protectRoute, isAdmin, addCollaboratorToPlaylist);
playlistRoute.put("/:id/remove-collaborator", protectRoute, isAdmin, removeCollaboratorFromPlaylist);
playlistRoute.get("/user/me", protectRoute, getUserPlaylist)

module.exports = playlistRoute