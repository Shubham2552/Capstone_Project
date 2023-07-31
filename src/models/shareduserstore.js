const sequalize=require('../configs/mysqldb').sequelize;
const DataTypes=require("sequelize");
const User=require('../models/user');
const FileStore=require('../models/filestore');

const SharedUserStore=sequalize.define('SharedUserStore',{
   
    fileid:{
        type:DataTypes.BIGINT,
        // references: {
        //     model: FileStore,
        //     key: 'fileid',
        //   },
        allowNull:false
    },
    userid:{
        type:DataTypes.BIGINT,
        references: {
            model: User,
            key: 'userid',
          },
        allowNull:false
    },
    owner:{
        type:DataTypes.BIGINT,
        // references: {
        //     model: User,
        //     key: 'userid',
        //   },
        allowNull:false
    },
    accessType:{
        type: DataTypes.ENUM("ReadOnly", "WriteAccess"),
        allowNull:false,
        default:"ReadOnly"
    }
})

// SharedUserStore.belongsTo(FileStore,{
//     foreignKey:"fileid"
// })

// SharedUserStore.belongsTo(User,{
//     foreignKey:"userid"
// })











module.exports=SharedUserStore;