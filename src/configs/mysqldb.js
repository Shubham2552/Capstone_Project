const Sequelize=require('sequelize');

const sequelize=new Sequelize(
    'S3BucketDB',
    'root',
    'root@mysql',{
        dialect:'mysql',
        host:'localhost'
    }
)




// { alter: true }
const connectToDB= async ()=>{
    try{
        sequelize.sync();
        await sequelize.authenticate();
        console.log("Successfully connected to S3BucketDB");
    }catch(error){
        console.log(error);
    }
}

module.exports={sequelize,connectToDB};