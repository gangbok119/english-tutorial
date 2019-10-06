module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User',{
        nickname:{
            type:DataTypes.STRING(40),
            allowNull:false,
            unique:true
        },
        userId:{
            type:DataTypes.STRING(40),
            allowNull:false,
            unique:true
        },
        password:{
            type:DataTypes.STRING(100),
            allowNull:false,
            
        },
    }, {
        timestamps: true,
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci', // 한글이 저장돼요
      });
      return User;
};