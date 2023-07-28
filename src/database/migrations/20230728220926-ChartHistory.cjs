/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserHistory', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },

      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      date: {
        type: Sequelize.DATE,
        defaultValue: new Date(),
      },

      stockValues: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },

      fiiValues: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },

      titlesValues: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UserHistory');
  },
};
