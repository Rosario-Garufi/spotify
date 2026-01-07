const mongoose = require("mongoose");

const albumSchema = new mongoose.Schema({
    title: {
        type: String,
        require: [true, "Title album is required"],
        trim: true
    },
    artist: {
        type: mongoose.Schema.Types.ObjectId,
        require: [true, "Artist is required!"],
        ref: "Artist"
    },
    releaseDate: {
        type: Date,
        default: Date.now()
    },
    coverImage: {
        type: String,
        default: "https://cdn.pixabay.com/photo/2019/12/28/18/08/plate-4725349_1280.jpg"
    },
    songs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Song"
    }],
    genre: {
        type: String,
        trim: true
    },
    likes: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
        require: [true, "Description is required"]
    },
    isExplicit: {
        type: Boolean,
        default: false
    }
})

const Album = mongoose.model("Album", albumSchema);
module.exports = Album