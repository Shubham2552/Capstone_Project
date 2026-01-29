const Sequelize=require('sequelize');

const HOST = 'localhost';
const DATABASE_USER = 'shubhambhati';
const DATABASE_PASSWORD = 'postgres';
const DATABASE = 'capstone-project';
const DIALECT = {
    POSTGRES: 'postgres'
}
const PORT = 5432;


const sequelize=new Sequelize(
    DATABASE,
    DATABASE_USER,
    DATABASE_PASSWORD,{
        dialect:DIALECT.POSTGRES,
        host:HOST,
        port: PORT,
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