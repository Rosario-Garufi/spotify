const asyncHandler = require("express-async-handler");
const {StatusCodes} = require("http-status-codes");
const Artist = require("../models/Artist");
const Album = require("../models/Albums");
const uploadToCloudinary = require("../utils/cloudinaryUpdate");
const Song = require("../models/Song");
const User = require("../models/User");


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
        req.file.path = null
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
    const {title, releaseDate, genre, description} = req.body;
    //find the album
    const album = await Album.findById(req.params.id);
    if(!album){
        res.status(StatusCodes.NOT_FOUND);
        throw new Error("Album not exist");
        
    }

    //upload the image if the user provider
    let imageUrl = "";
    if(req.file){
        const result = await uploadToCloudinary(req.file.path, "spotify/album");
        imageUrl = result.secure_url;
    }

    //update album
    album.title = title || album.title;
    album.releaseDate = releaseDate || album.releaseDate;
    album.description = description || album.description;
    album.genre = genre || album.genre;
    album.coverImage = imageUrl || album.coverImage;

    await album.save();
    res.status(StatusCodes.OK).json(album);
})
//! desc DELETE ALBUM
// method DELETE
// PRIVATE - ADMIN
const deleteAlbum = asyncHandler(async(req, res) => {
    const album = await Album.findById(req.params.id);
    if(!album){
        res.status(StatusCodes.NOT_FOUND);
        throw new Error("Album not found");
        
    }
    //delete album from song
   await Song.updateMany(
    {album: album._id},
    {$unset: {album: 1}}
   )
    //delete album from user
    await User.updateMany(
        {likedAlbum: album._id},
        {$pull: {likedAlbum: album._id}}
    )
    //delete album from artist
     await Artist.updateOne(
        {_id: album.artist},
        {$pull: {albums: album._id}}
    )
    //delete album
    await album.deleteOne();
    res.status(StatusCodes.OK).json({
        message: "Album deleted successfully"
    })
})

module.exports = {
    createAlbum,
    getAllAlbums,
    getAlbum,
    updateAlbum,
    deleteAlbum
}
