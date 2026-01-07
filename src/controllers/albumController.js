const asyncHandler = require("express-async-handler");
const {StatusCodes} = require("http-status-codes");
const Artist = require("../models/Artist");
const Album = require("../models/Albums");
const uploadToCloudinary = require("../utils/cloudinaryUpdate");

//! desc Create a new Album
// method POST
// private

const createAlbum = asyncHandler(async(req, res) => {
    
    const {title, artistId, releaseDate, genre, description} = req.body;
    if(!title || !artistId || !description){
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error("Title, artistId and description are required");
        
    }

    //check is the artist exist
    const artist = await Artist.findById(artistId);
    if(!artist){
        res.status(StatusCodes.NOT_FOUND);
        throw new Error("Artist not exist");
        
    }

    //check if the album already exist
    const album = await Album.findOne({title});
    if(album){
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error("Album already exist!");
        
    }

    //check if the user provide the coverImage
    let imageUrl = "";
    if(req.file){

        const result = await uploadToCloudinary(req.file.path, "spotify/album");
        imageUrl = result.secure_url;
    }
    const newAlbum = await Album.create({
        title,
        releaseDate: releaseDate ? new Date(releaseDate) : Date.now(),
        coverImage: imageUrl || "",
        genre,
        description,
        artist: artistId
        
    })
    //add album to the artist
    artist.albums.push(newAlbum._id);
    await artist.save();

    res.status(StatusCodes.CREATED).json(newAlbum)
})

//! desc GET ALL ALBUMS
// method GET
// PUBLIC

const getAllAlbums = asyncHandler(async(req, res) => {
    const {genre, artist,  search, page = 1, limit = 10} = req.query;
    
    //obj filtering
    const filter = {}
    if(genre) filter.genre = {$in: [genre]};
    if(artist) filter.artist = {$in: [artist]};
    if(search)[
        {title: {$regex: search, $options: "i"}},
        {description: {$regex: search, $options: "i"}}
    ]
    
    const count = await Album.countDocuments(filter);
    const skip = (parseInt(page) - 1) * parseInt(limit);

    //get artist
    const albums = await Album.find(filter).sort({releaseDate: -1}).skip(parseInt(skip)).limit(parseInt(limit)).populate("artist", "name image");

    res.status(StatusCodes.OK).json({
        albums,
        page: page,
        pages: Math.ceil(count / parseInt(limit)),
        totalAlbums: count
    })
})

//! desc GET ALBUM
// method GET
// PUBLIC

const getAlbum = asyncHandler(async(req, res) => {
    //check if the album exist
    const album = await Album.findById(req.params.id).populate("artist", "name image bio");
    if(!album){
        res.status(StatusCodes.NOT_FOUND);
        throw new Error("Album not found");
        
    }

    res.status(StatusCodes.OK).json(album);

    
})

//! desc UPDATE ALBUM
// method PUT
// PRIVATE - ADMIN
const updateAlbum = asyncHandler(async(req, res) => {
    console.log("update album")
})

//! desc DELETE ALBUM
// method DELETE
// PRIVATE - ADMIN
const deleteAlbum = asyncHandler(async(req, res) => {
    console.log("delete album")
})

module.exports = {
    createAlbum,
    getAllAlbums,
    getAlbum,
    updateAlbum,
    deleteAlbum
}
