const jwt=require('jsonwebtoken');
const sequalize=require('../configs/mysqldb').sequelize;

const path=require('path');
const { Op } = require('sequelize');
const {User, FileStore, SharedUserStore, VersionStore}=require('../models/Models');
const e = require('express');

//Download Funtion



//middleware to check if auth jwt token in available that is user is logged in
const tokenAuth = (req, res, next) => {
    const token = req.session.token;
    if (!token) {
      return res.status(401).send('Token not found. Please login first.');
    }
  
    
    jwt.verify(token, 'SECRET', (err, decoded) => {
      if (err) {
        return res.status(401).send('Token verification failed.');
      }
      req.body.userid=decoded.id;
  
    })
    next(); // Call next() to pass control to the next middleware or route handler
  };
  
  //file upload middleware
  const fileUpload = async (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }
    

   
    const result= await FileStore.findOne({ where: {
      name: req.body.filename,
      location: req.body.location,
       UserId: req.body.userid 
      } });

      console.log(result)
   //if file already exist 
    if(result){
  
    //fetch previous version from version store
     let previousversion=await VersionStore.findOne({
        attributes: [[sequalize.fn('max', sequalize.col('version')), 'maxVersion']],
        where: {
          FileStoreId: result.id,
        },
      })
  
      let versionNumber;
      //if previous verison exist
      console.log(previousversion);
      if(previousversion!=null){
        versionNumber=previousversion.dataValues.maxVersion+1;
        console.log(previousversion.dataValues.maxVersion+1);
      }else{
        versionNumber=1;  
      }
      console.log(result.fileid);
      //add previous file in versionstore table
      const newverison= VersionStore.build({
        FileStoreId:result.id,
        version:versionNumber,
        uuid:result.uuid,
        extension:result.extension
   
       })
  
       newverison.save().catch((e)=>{
        return res.status(500).send(e);
       })
        
       //update uuid in filestore
         await FileStore.update(
          { uuid: req.file.filename,
            description:req.body.description,
            tag:req.body.tag,
          extension:req.body.extension
         },
          {
            where: {
              id: result.id,

            },
          }
        ).catch((e)=>{return res.send(e)});
    }else{
  
      //if no previous version exist add new 
      const filestore= FileStore.build({
        name:req.body.filename,
        location:req.body.location,
        access:req.body.accessType,
        UserId:req.body.userid,
        uuid:req.file.filename,
        description:req.body.description,
        tag:req.body.tag,
        extension:req.body.extension
        
    
       })
  
       await filestore.save().catch(()=> {return res.status(500).send("File not Saved")});
    }
    next(); // Call next() to pass control to the next middleware or route handler
  };

  //file upload middleware
const fileDelete = async (req, res, next) => {
  console.log(req.body);
  if(req.body.owner) req.body.userid=req.body.owner;
    
    let result=await FileStore.findOne({
      where: {
        name: req.body.filename,
        location: req.body.location,
        UserId:req.body.userid
      },
    })
   //if file is found 
    if(result){
  
    //fetch previous version from version store
     let previousversion=await VersionStore.findOne({
      where: {
        FileStoreId: result.id,
      },
      order: [['version', 'DESC']], // Sort by version in descending order
    })
 

      //if previous verison exist
      console.log(previousversion);
      if(previousversion!=null){

        //update uuid for current file to previousversion
       await FileStore.update(
          { uuid: previousversion.uuid, extension:previousversion.extension },
          {
            where: {
              name: req.body.filename,
              location: req.body.location,
              UserId:req.body.userid
            },
          }
        )
        //delete the max verison in versionstore table
        await VersionStore.destroy({
          where: {
            FileStoreId: result.id,
            version:previousversion.version
          },
        })



      }else{

        await SharedUserStore.destroy({
          where: {
            FileStoreId: result.id,
          },
        })
          
       

        await FileStore.destroy({
          where: {
            id: result.id,
          },
        })

      }


      
      return res.redirect('viewfiles');

    }else{
  
   return res.status(500).send('File not found');
    }
    next(); // Call next() to pass control to the next middleware or route handler
  };


  const fileShare = async (req, res, next) => {
  
    const access = req.body.access;
  
    //fetch the file from db
    let result=await FileStore.findOne({
      where: {
        name: req.body.filename,
        location: req.body.location,
        UserId:req.body.userid
      },
    })
    
 

    //when file is returned
    if(result){
      console.log(req.body.email);
      let user=await User.findOne({
        where:{
          email:req.body.email
        }
      })
   

      if(user){
        //when user exist

        let file=await SharedUserStore.findOne({
          where:{
            FileStoreId:result.id,
            UserId:user.id,
          }
        })


        if(file){

          let updatepermission=await SharedUserStore.update(
              { accessType: access },
              {
                where: {
                  UserId: user.id,
                  FileStoreId: result.id,
                },
              }
            )

            return res.redirect('/s3/viewfiles');
        

        }else{
          let share= SharedUserStore.build({
            FileStoreId:result.id,
            UserId:user.id,
            accessType:access,
            owner:req.body.userid,
          })


  
         await share.save().catch((e)=>{
            return  res.send(e);
          })
          
          await FileStore.update(
            { access: "Shared" },
            {
              where: {
               id:result.id
              },
            }
          ).then(()=>{
            return res.status(200).redirect('viewfiles')
          }).catch(()=>{
            res.status(404).send('File not found');
          })
        }


      }else{
        //when user doesn't exist
        return res.send('Please Enter valid mail id');

      }

      
    }else{
      //if file is not found
      return res.status(404).send('File not found')
    }


    next();
  
    };
    

  const setVisibility=async (req,res)=>{

   await FileStore.update(
      { access: req.body.visibility },
      {
        where: {
          UserId: req.body.userid,
          name: req.body.filename,
          location:req.body.location
        },
      }
    ).then(()=>{
      return res.status(200).redirect('viewfiles')
    }).catch(()=>{
      res.status(404).send('File not found');
    })

    

  }
  

const fileDownload= async (req,res)=>{
  function download(){
    try {
      // Retrieve the file details from the database using Sequeliz
  
      // Get the filename from the database record
      const filename = file.uuid;
  
      // Create the file path
      const filePath = path.join(__dirname, '../uploads', filename);
  
      const customFilename = `${file.name}${file.extension}`;
  
      // Send the file as a response using res.download()
      return res.download(filePath,customFilename , (err) => {
        if (err) {
          console.error('Error occurred during file download:', err);
         return res.status(500).send('Error downloading the file.');
        }
      });
    } catch (error) {
      console.error('Error occurred:', error);
      return res.status(500).send('Internal server error.');
    }
  }

  console.log(req.body.owner);

  let user=req.body.userid;
  if(req.body.owner) user=req.body.owner

    // if(!user) return res.send('No user found');

    let file=await FileStore.findOne({
      where:{
        UserId:user,
        name:req.body.filename,
        location:req.body.location,
      }
    })
    

    console.log(file);

    if(!file) return res.send("No File Found");
    if(file.UserId===req.body.userid){
      download();
      return;
    }

   
    if(file.access==="Public"){
       download();
      
    }
    else if(file.access==="Shared"){
    
      let access=await SharedUserStore.findOne({
       where:{
         FileStoreId:file.id,
         UserId:req.body.userid
       }
     })
 
     if(!access) return res.send('You are not authorized to access this file');

    

    if(access.accessType==="ReadOnly" || access.accessType==="WriteAccess"){
    download();
  }
  }
    else{
      return res.send('Not Authorized')
    }
}

const searchFile=async(req,res)=>{

  try {
    const results = await FileStore.findAll({
      where: {
        UserId:req.body.userid,
        [Op.or]: [
          { description: { [Op.like]: `%${req.body.keyword}%` } },
          { tag: { [Op.like]: `%${req.body.keyword}%` } },
          { name: { [Op.like]: `%${req.body.keyword}%` } },
          { location: { [Op.like]: `%${req.body.keyword}%` } }
        ]
      }
    });

    return res.render('searchfile', { results: results, searched: true });
  } catch (error) {
    console.error('Error searching keyword:', error);
    throw error;
  }

}

  module.exports={tokenAuth,fileUpload,fileDelete,fileShare,setVisibility,fileDownload,searchFile}