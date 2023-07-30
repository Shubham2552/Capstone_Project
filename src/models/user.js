const sequalize=require('../configs/mysqldb').sequelize;
const DataTypes=require("sequelize");

const User=sequalize.define('User',{
    userid:{
        type:DataTypes.BIGINT,
        autoIncrement:true,
        primaryKey:true
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    email:{
        type:DataTypes.STRING,
        allowNull:false
    },
    password:{
        type:DataTypes.STRING,
        allowNull:false
    }
})

module.exports=User;