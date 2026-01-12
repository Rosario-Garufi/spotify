const asyncHandler = require("express-async-handler");
const express = require("express");
const {StatusCodes} = require("http-status-codes");
const Playlist = require("../models/Playlist");
const uploadToCloudinary = require("../utils/cloudinaryUpdate");
const Song = require("../models/Song");
const User = require("../models/User");

//!DESC - CREATEPLAYLIST
// METHODS POST
//PRIVATE

const createPlaylist = asyncHandler(async(req, res) => {
    const {name, description, isPublic } = req.body;

    if(!name || !description){
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error("Name and Description are required!");
        
    }

    //check is the playlist already exist for the user
    const playlist = await Playlist.findOne({name, creaor: req.user._id});
    if(playlist){
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error("Playlist already exsist")
    }

    //if the user provide img
    let imageUrlPath = "";

    if(req.file){
        const result = await uploadToCloudinary(req.file?.path, "spotify/playlist");
        imageUrlPath = result.secure_url;
    }

    const newPlaylist = await Playlist.create({
        name,
        description,
        isPublic,
        coverImage : imageUrlPath ? imageUrlPath : null,
        creator: req.user._id
    })
   

    res.status(StatusCodes.CREATED).json(newPlaylist);
})

//!DESC - GET PUBLIC PLAYLIST
//methods GET
//PUBLIC

const getPublicPlaylist = asyncHandler(async(req, res) => {
    const { search, page = 1, limit = 10} = req.query;
    
    //obj filtering
    const filter = {isPublic : true};
    if(search){
        filter.$or = [
            {name: {$regex: search, $options: "i"}},
            {description: {$regex: search, $options: "i"}}
        ]
    }

    const count = await Playlist.countDocuments(filter);

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const playlists = await Playlist.find(filter).sort({followers: -1}).skip(parseInt(skip)).limit(parseInt(limit)).populate("creator", "name email profilePicture").populate("songs", "title audioUrl coverImage").populate("collaborators", "name email");

    res.status(StatusCodes.OK).json({
        playlists,
        page: parseInt(page),
        pages: Math.ceil(count / parseInt(limit)),
        totalPlaylists : count
    })
})


//!desc GetUserPlaylist
//methods GET
//private

const getUserPlaylist = asyncHandler(async(req, res) => {
    //find user or collaborators playlist
    const playlists = await Playlist.find({
        $or: [
            {
                creator: req.user._id
            },
            {collaborators: req.user._id}
        ]
    }).sort({createdAt: -1}).populate("creator", "name email profilePicture").populate("collaborators", "name email profilePicture").populate("songs", "title audioUrl coverImage ")

    res.status(StatusCodes.OK).json(playlists)
})

//!desc updatePlaylist
//methods PUT
//private

const updatePlaylist = asyncHandler(async(req, res) => {
    const {name, description, isPublic } = req.body;
    //find the playlist
    const playlist = await Playlist.findOne(req.params.id);
    if(!playlist){
        res.status(StatusCodes.NOT_FOUND);
        throw new Error("Playlist not found");
        
    }

    if(!playlist.creator.equals(req.user._id) && !playlist.collaborators.some((collab) => collab.equals(req.user._id))){
        res.status(StatusCodes.FORBIDDEN);
        throw new Error("Unoauthorized");
        
    }

    playlist.name = name ?? playlist.name;
    playlist.description = description ?? playlist.description;
    

    //only the creator can change state of the playlist ( public / private );
    if(isPublic && playlist.creator.equals(req.user._id)){
        playlist.isPublic = isPublic ?? playlist.isPublic
    }

    //if the user provide an image
    

    if(req.file){
       const result = await uploadToCloudinary(req.file?.path, "spotify/playlist");
       playlist.coverImage = result.secure_url
    }

    await playlist.save();
    res.status(StatusCodes.OK).json(playlist)

    

        
})
module.exports = {
    createPlaylist,
    getPublicPlaylist,
    getUserPlaylist,
    updatePlaylist
}