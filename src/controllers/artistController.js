const asyncHandler = require("express-async-handler");
const {StatusCodes} = require("http-status-codes");
const Artist = require("../models/Artist");
const uploadToCloudinary = require("../utils/cloudinaryUpdate");
const Song = require("../models/Song");
const Album = require("../models/Albums");
const User = require("../models/User");

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
//method GET
//route /api/v1/artists/:id/top-song

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

//!desc GET ARTIST
//method GET
//route /api/v1/artists/:id

const getArtist = asyncHandler(async(req, res) => {
    //find the artist
    const artist = await Artist.findById(req.params.id);
    if(artist){
        res.status(StatusCodes.OK).json(artist)
    }else{
        res.status(StatusCodes.NOT_FOUND)
        throw new Error("Artist not exist");
        
    }
})
//!desc UPDATE ARTIST
//method PUT
//route /api/v1/artists/:id
const updateArtist = asyncHandler(async(req, res) => {
    const {name, bio, genre} = req.body;
    if(!name || !bio || !genre){
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error("name, bio and genre is required");
        
    }
    //find the artist
    const artist = await Artist.findById(req.params.id);
    if(!artist){
        res.status(StatusCodes.NOT_FOUND);
        throw new Error("Artist not found");
        
    }
 let imageUrl = ""
    if(req.file){
        const result = await uploadToCloudinary(req.file.path, "spotify/artist");
        imageUrl = result.secure_url
    }
    artist.name = name || artist.name;
    artist.bio = bio || artist.bio;
    artist.genres = genre || artist.genres;
    artist.image = imageUrl || artist.image
   

    await artist.save()
    res.status(StatusCodes.OK).json(artist)
})

//!desc DELETE ARTIST
//method DELETE 
//route /api/v1/artists/:id

const deleteArtist = asyncHandler(async(req, res) => {
    //find the artist
    const artist = await Artist.findById(req.params.id);
    if(!artist){
        res.status(StatusCodes.NOT_FOUND);
        throw new Error("Artist not found");
        
    }

    //delete the artist on song model
    await Song.deleteMany({artist: artist._id})
    //delete the artist on album model
    await Album.deleteMany({artist: artist._id})
    //delete the artist of user model
    await User.deleteMany({followedArtist: artist._id})
    //delete the artist if this exist
    await artist.deleteOne();
    res.status(StatusCodes.OK).json({
        message: "Artist eliminated"
    })
})
module.exports = {
    createArtist,
    getAllArtists,
    getTopArtist,
    getArtistTopSong,
    getArtist,
    updateArtist,
    deleteArtist
}