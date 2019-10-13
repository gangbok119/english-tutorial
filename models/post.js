module.exports = (sequelize, DataTypes) => {
    const Post = sequelize.define('Post',{
        content: {
            type: DataTypes.STRING(140),
            allowNull: false,
          },
          img: {
            type: DataTypes.STRING(200),
            allowNull: true,
          },
    }, {
        timestamps: true,
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci', // 한글이 저장돼요
      });
      return Post;
};