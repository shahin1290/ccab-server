const { check } = require('express-validator')
const path = require('path')
const multer = require('multer')

const dayValidCheck = [
  check('name', 'Name can not be empty').notEmpty().bail(),
  //check('video_path', 'Video Path can not be empty').notEmpty().bail()
]

//Uploading File
const Storge = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, __dirname + '/../public/uploads/Source_Code')
  },
  filename: (req, file, callback) => {
    callback(null, `${Date.now()}_${file.originalname}`)
  }
})

const Limits = {
  fileSize: 1024 * 1024 * 64 // 64MB  max
}
// check the file must be allways pdf only
const FileFilter = (req, file, callback) => {
  if (
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'video/mp4' ||
    file.mimetype === 'video/wmv' ||
    file.mimetype === 'video/avi'
  ) {
    callback(null, true)
  } else callback(null, false)
}

const upload = multer({
  storage: Storge,
  fileFilter: FileFilter,
  limits: Limits
})

const makeUpload = upload.fields([
  { name: 'element_text' },
  { name: 'video_path' }
])

// Multer error handler
const uploadCallBack = (req, res, next) => {
  makeUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.log('error multer ', err.message)
      return res.status(400).json({ success: false, message: err.message })
    } else if (err)
      return res
        .status(500)
        .json({ success: false, message: 'Server Error' + err })
    next()
  })
}

module.exports = {
  dayValidCheck,
  uploadCallBack
}
