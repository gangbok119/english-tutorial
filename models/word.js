module.exports = (sequelize, DataTypes) => {
  const Word = sequelize.define('Word', {
    eng: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    kor: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  }, {
    timestamps: true,
    paranoid: true,
    charset: 'utf8',
    collate: 'utf8_general_ci', // 한글이 저장돼요
  });
  return Word;
};