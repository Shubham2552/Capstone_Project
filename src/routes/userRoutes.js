const express=require('express');
const router=express.Router();
const sequalize=require('../configs/mysqldb').sequelize;
const User=require('../models/user');
const FileStore=require('../models/filestore')
const { Model } = require('sequelize');
const bcrypt=require('bcrypt');
const session = require('express-session');
const jwt=require('jsonwebtoken');
//router to render register page
router.get('/register',(req,res)=>{
  res.render('register');
})


router.post('/register',async (req,res)=>{
    //take out user details from request
 console.log(req.body);
    const getuser=await User.findOne({ where: { email: req.body.email } });
    if(getuser){
      return res.send("User Already Exist");
    }
     //build user object
    const user= User.build({
        name:req.body.name,
        email:req.body.email,
        password:bcrypt.hashSync(req.body.password, 8)
    
       })
    //save user to db
    await user.save().catch(()=> res.status(500).send("User not registered"));
   //send user registered
    res.redirect('/user/login');
})

//route to render login page
router.get('/login',(req,res)=>{
  res.render('login');
})


router.post('/login',async(req,res)=>{
    //get email and passswd from request
    const {email,password}=req.body;
    //find user in db
    const user = await User.findOne({ where: { email: email } });

  
    if(user)
    {
        //compare hashed passwords
        var passwordIsValid = bcrypt.compareSync(
          password,
          user.password
          );


          //if password is valid generate and send token;
          if(passwordIsValid)
          {            
            
              var token = jwt.sign({ id: user.userid  }, "SECRET", { expiresIn: 86400});
            //send token as response
                  req.session.token = token;
                 return res.redirect('/s3/viewfiles')
          }
          else 
          {
           //if not valid password return error   
          return res.status(401)
            .send({
              accessToken: null,
              message: "Invalid Password!"
            });
          }

}

  if(!user) res.status(500).send('User not found');

})

module.exports=router;