const asyncHandler = require("express-async-handler");
const {StatusCodes} = require("http-status-codes");
const Artist = require("../models/Artist");
const Album = require("../models/Albums");
const uploadToCloudinary = require("../utils/cloudinaryUpdate");
const Song = require("../models/Song");
const Playlist = require("../models/Playlist");


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
//!DESC - GET SONG
// METHODS GET
//PUBLIC

const getAllSongs = asyncHandler(async(req, res) => {
    const {title, genre, search, page = 1, limit = 10} = req.query;

    const filter = {};

    if(title) filter.title = {$in: [title]};

    if(genre) filter.genre = {$in: [genre]};

    if(search){
        filter.$or[
            {artist: {$regex: search, options: "i"}}
        ]
    }

    const count = await Song.countDocuments(filter);

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const songs = await Song.find(filter).sort({plays: -1}).skip(parseInt(skip)).limit(parseInt(limit))

    res.status(StatusCodes.OK).json({
        songs,
        page:parseInt(page),
        pages: Math.ceil(count / parseInt(limit)),
        totalSong: count
    })
})

//!DESC - GET A SONG
// METHODS GET
//PUBLIC
const getSong = asyncHandler(async(req, res) => {
    //find the song
    const song = await Song.findById(req.params.id);
    if(!song){
        res.status(StatusCodes.NOT_FOUND);
        throw new Error("Song not found!");
        
    }
    song.plays += 1;
    await song.save();

    res.status(StatusCodes.OK).json(song)
})

//!DESC - UPDATE A SONG
// METHODS PUT
//PRIVATE

const updateSong = asyncHandler(async(req, res) => {
    const {title,  albumId, duration, releaseDate, genre, lyrics, isExplicit, featuredArtist} = req.body
    
    //find the song
    const song = await Song.findById(req.params.id);
    if(!song){
              res.status(StatusCodes.NOT_FOUND);
        throw new Error("Song not found!");
    }

    //if the user provide an audio
    if(req.files && req.files?.audio){
        const audioResult = await uploadToCloudinary(req.files.audio[0].path, "spotify/songs");
        song.audioUrl = audioResult.secure_url
    }

    if(req.files && req.files.cover){
        const imageResult = await uploadToCloudinary(req.files.cover[0].path, "spotify/songs");
        song.coverImage = imageResult.secure_url
    }

    let album = null;
    if(albumId){
        album = await Album.findById(albumId);
        if(!album){
            res.status(StatusCodes.NOT_FOUND);
            throw new Error("Album not exist");
            
        }
    }

    if(albumId && albumId.toString() !== song.album?.toString()){
        if(song.album){
            await Album.findByIdAndUpdate(
                song.album,
                {$pull: {songs: song._id}}
            )
        }

        //add to new album
    
         await Album.findByIdAndUpdate(
        albumId,
        {$addToSet: {songs: song._id}}
    )
    
    }

    
   
    song.title = title ?? song.title;
    song.album = albumId ?? song.album;
    song.duration = duration ?? song.duration;
    song.releaseDate = releaseDate ?? song.releaseDate;
    song.genre = genre ?? song.genre,
    song.lyrics = lyrics ?? song.lyrics;
    song.isExplicit = isExplicit ?? song.isExplicit;
    song.featuredArtist = featuredArtist ? JSON.parse(featuredArtist) : song.featuredArtist;
   

    await song.save()
    res.status(StatusCodes.OK).json(song)
    
})

//!DESC - DELETE A SONG
// METHODS DELETE
//PRIVATE

const deleteSong = asyncHandler(async(req, res) => {
    
    //find the song
    const song = await Song.findById(req.params.id);
    if(!song){
        res.status(StatusCodes.NOT_FOUND);
        throw new Error("Song not found");
        
    }

   //versione più prestante
   await Promise.all([
     Artist.updateOne(
    {_id: song.artist},
    {$pull: {songs: song._id}}
   ),
   song.album ?  Album.updateOne(
        {_id: song.album},
        {$pull: {songs: song._id}}
    ) : null,
     Playlist.updateMany(
    {songs: song._id},
    {$pull: {songs: song._id}}
   )
   ])
   //delete song
   await Song.findByIdAndDelete(req.params.id)

   res.status(StatusCodes.OK).json({
    message: "Song deleted successfully"
   })
})

//!DESC - GET TOP SONG
// METHODS GET
//PUBLIC
const getTopSong = asyncHandler(async(req, res) => {
    const {limit = 5} = req.query;

    const songs = await Song.find().sort({plays: -1}).limit(parseInt(limit)).populate("artist",  "name image").populate("album", "title coverImage");

    res.status(StatusCodes.OK).json(songs)
})

//!DESC - GET new releases
// METHODS GET
//PUBLIC

const getNewReleases = asyncHandler(async(req, res) => {
    const {limit} = req.query;

    const song = await Song.find().sort({createdAt: -1}).limit(parseInt(limit)).populate("artist", "name image").populate("album", "title coverImage");

    res.status(StatusCodes.OK).json(song)
})

module.exports = {
    createSong,
    getAllSongs,
    getSong,
    updateSong,
    deleteSong,
    getTopSong,
    getNewReleases
}