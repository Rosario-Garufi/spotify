const mongoose = require("mongoose");

const songSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Song name is required!"],
        trim: true
    },
    artist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Artist",
        required: [true, "Artist id is Required"]
    },
    album: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Album"
    },
    duration: {
        type: Number,
        required: [true, "Duration song is required"]
    },
    audioUrl : {
        type: String,
        required: [true, "Audio is required"]
    },
    coverImage: {
        type: String,
        default: "https://cdn.pixabay.com/photo/2023/02/16/03/43/music-player-7792956_960_720.jpg"
    },
    releaseDate: {
        type: Date,
        default: Date.now()
    },
    genre: {
        type: String,
        trim: true
    },
    lyrics: {
        type: String,
        trim: true
    },
    plays: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0,
    
    },
    isExplicit: {
        type: Boolean,
        default: false
    },
    featuredArtist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Artist"
    }]
},
{timestamps :true})

const Song = mongoose.model("Song", songSchema)
module.exports = Song