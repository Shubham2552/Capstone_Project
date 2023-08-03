const express=require('express');
const router=express.Router();
const sequalize=require('../configs/mysqldb').sequelize;


const { Model } = require('sequelize');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const multer=require('multer');
const {User, FileStore, SharedUserStore, VersionStore}=require('../models/Models');
const { v4: uuidv4 } = require('uuid');
const path=require('path');


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


   
    return res.redirect('/s3/viewfiles');
  });


//route to view all files where user is owner
  router.get('/viewfiles',tokenAuth,async (req,res)=>{

    
   const files= await FileStore.findAll({ where: { UserId: req.body.userid } });
   if(!files) return res.status(404).send('Files not found');


   const sharedWithYou= await SharedUserStore.findAll({
    where:{
      UserId:req.body.userid
    },
    include:[User,FileStore],
   })


  const sharedByYou= await SharedUserStore.findAll({
    where:{
      owner:req.body.userid,
    },
    include:[FileStore,User]
  })






   return res.render('viewfiles', { files ,sharedWithYou,sharedByYou});

  })

router.get('/delete',(req,res)=>{
  res.render('delete')
}).post('/delete',tokenAuth,fileDelete,(req,res)=>{
res.send('Some critical Error Occured');
})

router.get('/share',(req,res)=>{
  res.render('share')
}).post('/share',tokenAuth,fileShare)


router.get('/visibility',(req,res)=>{
  res.render('visibility');
}).post('/visibility',tokenAuth,setVisibility)

router.get('/download',(req,res)=>{
  res.render('download');
}).post('/download',tokenAuth,fileDownload)




router.get('/searchfile',(req,res)=>{
  res.render('searchfile', { results: [], searched: false });
}).post('/searchfile',tokenAuth,searchFile)


router.post('/deleteshare',tokenAuth,async(req,res)=>{
  console.log(req.body.shareid)
  await SharedUserStore.destroy({ where: { id: req.body.sharedid} });
  res.redirect('/s3/viewfiles')
})

module.exports=router;