const { check } = require("express-validator");
const path = require('path')
const multer =require('multer')

const taskValidCheck = [
  check("AssignmentName", "Task Name Can Not Be Empety").not().isEmpty().bail(),
  check("description", "Description Must Be Given ").not().isEmpty().bail(),
];


//Uploading File 
const Storge = multer.diskStorage({
  destination:(req,file ,callback)=>{callback(null,__dirname+'/../public/uploads/Assignment')},
  filename: (req,file ,callback)=>{ callback(null, `${Date.now()}_${file.originalname}`)}
})

const Limits = {
fileSize: 1024*1024*64 // 64MB  max
}
// check the file must be allways pdf only 
const FileFilter =(req,file,callback)=>{
console.log(file);

if ( file.mimetype =='application/pdf') {callback(null,true)} else callback(null, false)
}

const upload = multer({ storage:Storge , fileFilter : FileFilter , limits: Limits}); 

const makeUpload = upload.single('myfile')

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
  taskValidCheck,
  uploadCallBack
};
