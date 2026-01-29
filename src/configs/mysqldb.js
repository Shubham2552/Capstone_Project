const Sequelize=require('sequelize');

// # HOST=localhost
// # DATABASE_USER=shubhambhati
// # DATABASE_PASSWORD=postgres
// # DATABASE=psych-mind

const sequelize=new Sequelize(
    'capstone-project',
    'shubhambhati',
    'postgres',{
        dialect:'postgres',
        host:'localhost',
        port: 5432,
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