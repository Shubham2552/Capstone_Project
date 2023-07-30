const bodyParser = require("body-parser");
const userRoutes=require('./routes/userRoutes');
const express=require("express");
const cors=require("cors")
const {sequalize, connectToDB} = require('./configs/mysqldb');
const User=require('./models/user');
const FileStore=require('./models/filestore');
const SharedUserStore=require('./models/shareduserstore');
const session = require('express-session');
const s3routes=require('./routes/s3Routes');
const path = require('path');
const VersionStore = require("./models/versionstore");
const app=express();

const PORT=3000;

app.use(
    session({
      secret: 'your-secret-key', // Replace with your own secret key
      resave: false,
      saveUninitialized: true,
    })
  );

app.use(cors())
app.use(bodyParser.urlencoded({extended:false}))
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs')
app.use(bodyParser.json());


app.use('/user',userRoutes);
app.use('/s3',s3routes);



app.get('/',(req,res)=>{
    res.render('login');
})


app.listen(PORT,async error=>{
    if(error){
        
        console.log(error);
        
    }else{
        await connectToDB();
        console.log("Capstone Project server successfully live...");
    }
})


