const bodyParser = require("body-parser");
const userRoutes=require('./routes/userRoutes');
const express=require("express");
const cors=require("cors")
const {sequalize, connectToDB} = require('./configs/mysqldb');

const session = require('express-session');
const s3routes=require('./routes/s3Routes');
const {User, FileStore, SharedUserStore, VersionStore}=require('./models/Models');
const path = require('path');

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



app.get('/',async(req,res)=>{
res.render('login')
    
})


app.listen(PORT,async error=>{
    if(error){
        
        console.log(error);
        
    }else{
        await connectToDB();
        console.log("Capstone Project server successfully live...");
    }
})


