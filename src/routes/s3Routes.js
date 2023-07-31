const express=require('express');
const router=express.Router();
const sequalize=require('../configs/mysqldb').sequelize;
const User=require('../models/user');
const FileStore=require('../models/filestore');
const { Model } = require('sequelize');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const multer=require('multer');
const VersionStore=require('../models/versionstore');
const SharedUserStore=require('../models/shareduserstore');
const { v4: uuidv4 } = require('uuid');
const path=require('path');
const { version } = require('os');

let {tokenAuth,fileUpload,fileDelete,fileShare,setVisibility,fileDownload,searchFile}=require('../middleware/s3middleware')


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Set the directory where the files will be stored
  },
  filename: function (req, file, cb) {
    const uniqueFilename = uuidv4(); // Generate a UUID as the filename
    req.body.extension = path.extname(file.originalname);

  
    
    cb(null, uniqueFilename);
  },
});


const upload = multer({ storage: storage });


router.get('/',(req,res)=>{
  res.render('index');
})

//post request to handle upload
router.get('/upload',(req,res)=>{
  res.render('upload');
}).post('/upload', upload.single('file'),tokenAuth,fileUpload, async(req, res) => {
  
       // You can access the uploaded file's details using req.file
       const fileDetails = {
        originalname: req.file.originalname,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        destination: req.file.destination,
        name:req.body.filename,
        location:req.body.location,
        access:req.body.accessType,
        owner:req.userid,
        uuid:req.file.filename
  
      };


     console.log(req.body,req.session.token);
    return res.redirect('/s3/viewfiles');
  });


//route to view all files where user is owner
  router.get('/viewfiles',tokenAuth,async (req,res)=>{

    console.log(req.userid);
   const files= await FileStore.findAll({ where: { owner: req.userid } });
   if(!files) return res.status(404).send('Files not found');

    let specificUserId=req.userid;
   const sharedWithYou= await sequalize.query(
    `SELECT *
     FROM FileStores AS FS
     LEFT JOIN SharedUserStores AS SFS
     ON SFS.fileid = FS.fileid
     LEFT JOIN users AS U
     ON FS.owner = U.userid
     WHERE SFS.userid = :specificUserId`,
    {
      replacements: { specificUserId },
      type: sequalize.QueryTypes.SELECT,
    }
  )


  const sharedByYou= await sequalize.query(
    `SELECT *
     FROM FileStores AS FS
     LEFT JOIN SharedUserStores AS SFS
     ON SFS.fileid = FS.fileid
     LEFT JOIN users AS U
     ON SFS.userid = U.userid
     WHERE SFS.owner = ${req.userid}`,
    {
    
      type: sequalize.QueryTypes.SELECT,
    }
  )

  console.log(sharedByYou);


   return res.render('viewfiles', { files ,sharedWithYou,sharedByYou});

  })

router.get('/delete',(req,res)=>{
  res.render('delete')
}).post('/delete',tokenAuth,fileDelete,(req,res)=>{
res.send('Some critical Error Occured');
})

router.get('/share',(req,res)=>{
  res.render('share')
}).post('/share',tokenAuth,fileShare,(req,res)=>{
res.send('Some critical Error Occured');
})


router.get('/visibility',(req,res)=>{
  res.render('visibility');
}).post('/visibility',tokenAuth,setVisibility)

router.get('/download',(req,res)=>{
  res.render('download');
}).post('/download',tokenAuth,fileDownload)




router.get('/searchfile',(req,res)=>{
  res.render('searchfile', { results: [], searched: false });
}).post('/searchfile',tokenAuth,searchFile)

module.exports=router;