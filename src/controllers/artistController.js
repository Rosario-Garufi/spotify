const asyncHandler = require("express-async-handler");
const {StatusCodes} = require("http-status-codes");
const Artist = require("../models/Artist");
const uploadToCloudinary = require("../utils/cloudinaryUpdate");
const Song = require("../models/Song");

//!desc create a new Artist
//method POST
//route /api/v1/artists

const createArtist = asyncHandler(async(req, res) => {
    const {name, bio, genre} = req.body;
    if(!name || !bio || !genre) {
        res.status(StatusCodes.BAD_REQUEST)
        throw new Error("name, bio, genre is required!");
        
    }

    const artist = await Artist.findOne({name});
    if(artist){
        res.status(StatusCodes.BAD_REQUEST)
        throw new Error("The artist already exist!");
        
    }
    let imageUrl = ""
    if(req.file){
        const result = await uploadToCloudinary(req.file.path, "spotify/artist");
        imageUrl = result.secure_url;
    }
    const newArtist = await Artist.create({
        name,
        bio,
        genre,
        image: req.file ? imageUrl : "",
        isVerified: true
        
    })
    if(newArtist){
        res.status(StatusCodes.CREATED).json(newArtist)
    }
})

//!desc GET ALL ARTIST WITH PAGINATION
//method POST
//route /api/v1/artists


const getAllArtists = asyncHandler(async(req, res) => {
    const {genre, search, page= 1, limit = 10} = req.query
    
    const filter = {}

    if(genre) filter.genre = {$in: [genre]};

    if(search)[
        {name: {$regex: search, $options: "i"}},
        {bio: {$regex: search, $options: "i"}}
    ]

    const count = await Artist.countDocuments(filter);
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const artists = await Artist.find(filter).sort({followers: -1}).limit(parseInt(limit)).skip(parseInt(skip)).populate("songs", "title audioUrl coverImage")

    res.status(StatusCodes.OK).json({
        artists,
        page: parseInt(page),
        pages: Math.ceil(count / parseInt(limit)),
        totalArtist: count
    })
    
})

//!desc GET TOP ARTISTS
//method POST
//route /api/v1/artists

const getTopArtist = asyncHandler(async(req, res) => {
    const {limit = 5} = req.query;

    //find the artist
    const artist = await Artist.find().sort({followers: -1}).limit(parseInt(limit))

    res.status(StatusCodes.OK).json(artist)
})

const getArtistTopSong = asyncHandler(async(req, res) => {
    const {limit = 5} = req.query;

    const song = await Song.findById(req.params.id).sort({liked: -1}).limit(parseInt(limit))

    if(song){
        res.status(StatusCodes.OK).josn(song)
    }else{
        res.status(StatusCodes.NOT_FOUND)
        throw new Error("No song for this artist!");
        
    }
})
module.exports = {
    createArtist,
    getAllArtists,
    getTopArtist,
    getArtistTopSong
}