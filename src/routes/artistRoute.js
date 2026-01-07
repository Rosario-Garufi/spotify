const express = require("express");
const { protectRoute } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");
const { createArtist, getAllArtists, getTopArtist, getArtistTopSong, getArtist, updateArtist, deleteArtist } = require("../controllers/artistController");
 
const artistRouter = express.Router();

//public
artistRouter.get("/",  getAllArtists)
artistRouter.get("/top",  getTopArtist)
artistRouter.get("/:id", getArtist )
artistRouter.get("/:id/top-song",  getArtistTopSong)




//private
artistRouter.post("/", upload.single("image"), protectRoute, createArtist)
artistRouter.put("/:id", upload.single("image"), protectRoute, updateArtist)
artistRouter.delete("/:id",  protectRoute, deleteArtist)



module.exports = artistRouter