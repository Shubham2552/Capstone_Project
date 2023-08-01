
const sequalize=require('../configs/mysqldb').sequelize;
const DataTypes=require("sequelize");


//User Model


const User=sequalize.define('User',{
    id:{
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

//Filestore Model

const FileStore=sequalize.define('FileStore',{

    id:{
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

//Shared User Store Model

const SharedUserStore=sequalize.define('SharedUserStore',{
   
    id:{
        type:DataTypes.BIGINT,
        autoIncrement:true,
        primaryKey:true
    },

    accessType:{
        type: DataTypes.ENUM("ReadOnly", "WriteAccess"),
        allowNull:false,
        default:"ReadOnly"
    }
})


//VersionStore Model

const VersionStore=sequalize.define('VersionStore',{
    id:{
        type:DataTypes.BIGINT,
        autoIncrement:true,
        primaryKey:true
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

SharedUserStore.belongsTo(User, { targetKey: 'id', foreignKey: 'owner' });
// This creates a foreign key called `captainName` in the source model (Ship)
// which references the `name` field from the target model (Captain).

User.hasMany(FileStore)
FileStore.belongsTo(User)


SharedUserStore.belongsTo(User)
SharedUserStore.belongsTo(FileStore)

User.hasMany(SharedUserStore)
FileStore.hasMany(SharedUserStore)

VersionStore.belongsTo(FileStore)
FileStore.hasMany(VersionStore)

module.exports={ User, FileStore, SharedUserStore, VersionStore};