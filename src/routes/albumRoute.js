const express = require("express");
const { protectRoute, isAdmin } = require("../middlewares/authMiddleware");
const { createAlbum, getAllAlbums, getAlbum, updateAlbum, deleteAlbum } = require("../controllers/albumController");
const upload = require("../middlewares/upload");

const albumRoute = express.Router();

//public
albumRoute.get("/",  getAllAlbums)
albumRoute.get("/:id",  getAlbum)


//private
albumRoute.post("/", protectRoute,isAdmin, upload.single("coverImage"), createAlbum)
albumRoute.put("/:id", protectRoute,isAdmin, upload.single("coverImage"), updateAlbum)
albumRoute.delete("/:id", protectRoute,isAdmin,  deleteAlbum)



module.exports = albumRoute