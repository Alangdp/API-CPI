/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('dividends', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },

      ticker: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      type: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'DIVIDENDO',
      },

      dividendValue: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },

      dataEx: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      dataCom: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('dividends');
  },
};
