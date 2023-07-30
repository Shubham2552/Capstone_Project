

const sequalize=require('../configs/mysqldb').sequelize;
const DataTypes=require("sequelize");
const User=require('../models/user');
const FileStore=require('../models/filestore');

const VersionStore=sequalize.define('VersionStore',{
   
    fileid:{
        type:DataTypes.BIGINT,
        references: {
            model: FileStore,
            key: 'fileid',
          },
        allowNull:false
    },
    version:{
        type:DataTypes.BIGINT,
        allowNull:false
    },
    uuid:{
        type:DataTypes.STRING,
        allowNull:false
    },


})

VersionStore.belongsTo(FileStore, {
    foreignKey: "fileid", // userid->owner
 
  });


module.exports=VersionStore;