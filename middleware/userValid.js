const { check } = require("express-validator");
const multer = require('multer')

const userValidatorChek = [
  check("name", "Name can not be empety").notEmpty().bail(),
  check("email", "Email must be given ").notEmpty().isEmail().bail(),
  check("password", "Password must be more than 8 chars").isLength({ min: 8 }),
];

const UpdateUserValidator = [
  check("name", "Name can not be empety").notEmpty().bail(),
  check("email", "Email must be given ").notEmpty().isEmail().bail(),
];


// validate update user for admin 
const UpdateAnyUserValidator = [
  check("role", "role can not be empety").notEmpty().bail(),
];


const AccessUserValidator =[
  check('ViewerUserId',"Viewer User Should Be Chosen").notEmpty().bail(),
]

//Uploading File 
const Storge = multer.diskStorage({
  destination:(req,file ,callback)=>{callback(null,__dirname+'/../public/uploads/Avatar')},
  filename: (req,file ,callback)=>{ callback(null, `${Date.now()}_${file.originalname}`)}
})

const Limits = {
fileSize: 1024*1024*64 // 64MB  max
}

const FileFilter = (req, file, callback) => {
  console.log(file);
  if (
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpeg'||
    file.mimetype === 'application/octet-stream'
  ) {
    callback(null, true)
  } else callback(null, false)
}

const upload = multer({ storage:Storge , fileFilter : FileFilter , limits: Limits}); 

const makeUpload = upload.single('avatar')

// Multer error handler 
const uploadCallBack =  (req, res ,next )=>{
makeUpload(req,res,(err)=>{
    if (err instanceof multer.MulterError){
      console.log('error multer ', err.message);
        return res.status(400).json({success:false , message:err.message})
    }else if(err) return res.status(500).json({success:false , message:'Server Error'+err})
    next()
  })
}
module.exports = {
  userValidatorChek,
  UpdateUserValidator,
  UpdateAnyUserValidator,
  AccessUserValidator,
  uploadCallBack
};
