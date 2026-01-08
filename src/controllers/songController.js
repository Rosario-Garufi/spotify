const asyncHandler = require("express-async-handler");
const {StatusCodes} = require("http-status-codes");
const Artist = require("../models/Artist");
const Album = require("../models/Albums");
const uploadToCloudinary = require("../utils/cloudinaryUpdate");
const Song = require("../models/Song");


//!DESC - CREATESONG
// METHODS POST
//PRIVATE

const createSong = asyncHandler(async(req, res) => {
    const {title, artistId, albumId, duration, releaseDate, genre, lyrics, isExplicit, featuredArtist} = req.body

    if(!title || !artistId || !duration){
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error("Title, artistId, duration are required");

    }

    if(!req.files || !req.files.audio){
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error("Audio is required");
        
    }


    //check if the artist exist
    const artist = await Artist.findById(artistId);
    if(!artist){
         res.status(StatusCodes.BAD_REQUEST);
        throw new Error("Artist not found");
    }

    //check is the user provide an album
    
    let album = null
    if(albumId){
        album = await Album.findById(albumId);
    if(!album){
            res.status(StatusCodes.BAD_REQUEST);
        throw new Error("Album not found");
        }
    }
    //check is the song already exist
    const song = await Song.findOne({title, artist: artistId})
    if(song){
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error("Song already exist for this artist");
    }

    // const audioResult = await uploadToCloudinary(req.files.audio[0].path, "spotify/songs");

    //if the user provide an coverImage
    // let coverImageResult = ""
    // if(req.files && req.files.cover){
    //     const result = await uploadToCloudinary(req.files.cover[0].path, "spotify/songs");
    //     coverImageResult = result.secure_url
    // }

    const  [audioResult, imageResult] = await Promise.all([
        uploadToCloudinary(req.files.audio[0].path, "spotify/songs"),
        req.files.cover ? uploadToCloudinary(req.files.cover[0].path, "spotify/songs") : null
    ])

    // let durationInSecond = duration;
    // if(typeof duration === "string" && duration.includes(":")){
    //     const [min, sec] = duration.split(":").map(Number);
    //     durationInSecond = min * 60 + sec
    // }
    const newSong = await Song.create({
        title,
        artist: artistId,
        album: albumId ? albumId : null,
        duration,
        audioUrl: audioResult.secure_url,
        coverImage: imageResult.secure_url,
        releaseDate: releaseDate ? new Date(releaseDate) : Date.now(),
        genre,
        lyrics : lyrics ? lyrics : null,
        isExplicit,
        featuredArtist: featuredArtist ? JSON.parse(featuredArtist) : []

    })
    
    //push in to album if the user provide
    if(albumId){
        album.songs.push(newSong._id);
        await album.save()
    }

    artist.songs.push(newSong._id);
   await artist.save()

    res.status(StatusCodes.CREATED).json(newSong)
    
})

module.exports = {
    createSong
}