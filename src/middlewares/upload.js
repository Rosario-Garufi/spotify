const multer = require("multer");
const path = require("path");


//configure storage multer
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}-${path.extname(file.originalname)}`)
    }
})

//file filter - only audio and image
const fileFilter = (req, file, cb) => {
    if(file.mimetype === "audio/mpeg" || file.mimetype === "audio/wav" || file.mimetype === "audio/mp3"){
        cb(null, true)
    }else if(file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/jpg"){
        cb(null, true)
    }else{
        cb(new Error("Unsupported file, Only audio and image"), false)
    }
}

const upload = multer({
    storage: storage,
    limits: {fileSize: 10 * 1024 * 1024},
    fileFilter: fileFilter
})

module.exports = upload