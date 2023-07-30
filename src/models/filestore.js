const sequalize=require('../configs/mysqldb').sequelize;
const DataTypes=require("sequelize");
const User=require('../models/user');
const SharedUserStore = require('./shareduserstore');

const FileStore=sequalize.define('FileStore',{

    fileid:{
        type:DataTypes.BIGINT,
        autoIncrement:true,
        primaryKey:true
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    location:{
        type:DataTypes.STRING,
        allowNull:false
    },
    access:{
        type: DataTypes.ENUM("Private", "Public", "Shared"),
        allowNull:false
    },
    owner:{
        type:DataTypes.BIGINT,
        references: {
            model: User,
            key: 'userid',
          },
        allowNull:false
    },
    description:{
        type:DataTypes.STRING,
    },
    tag:{
        type:DataTypes.STRING,
    },
    extension:{
        type:DataTypes.STRING,
        allowNull:false
    },
    uuid:{
        type:DataTypes.STRING,
        allowNull:false
    }

})





module.exports=FileStore;