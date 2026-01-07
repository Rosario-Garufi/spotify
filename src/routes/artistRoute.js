const express = require("express");
const { protectRoute } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");
const { createArtist, getAllArtists, getTopArtist, getArtistTopSong, getArtist } = require("../controllers/artistController");
 
const artistRouter = express.Router();

//public
artistRouter.get("/",  getAllArtists)
artistRouter.get("/top",  getTopArtist)
artistRouter.get("/:id", getArtist )
artistRouter.get("/:id/top-song",  getArtistTopSong)




//private
artistRouter.post("/", upload.single("image"), protectRoute, createArtist)

module.exports = artistRouter