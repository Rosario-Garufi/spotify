const mongoose = require("mongoose");
const bcrypt = require("bcrypt")
const userSchema = new mongoose.Schema({
    name: {type: String, required: [true, "Name is required"], trim:true},
email: {type: String, required: [true, "email is required"], trim:true},
password: {type: String, required: [true, "Password is required"], minlength: [6, "password must be min 6 characters"]},
profilePicture: {type: String, default: "https://cdn.pixabay.com/photo/2018/04/18/18/56/user-3331256_1280.png"},
isAdmin: {type: Boolean, default: false},
likedSongs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Song"
}],
likedAlbum: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Album"
}],
followedArtist: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Artist"
    }
],
followedPlaylist: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Playlist"
    },

],

},
{timestamps: true}
)

//COMPARE PASSWORD
userSchema.methods.matchPassword = async function(password){
    return await bcrypt.compare(password, this.password)
}
//HASH PASSWORD
userSchema.pre("save", async function() {
    if(!this.isModified("password")){
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt)
})
const User = mongoose.model("User", userSchema);

module.exports = User;