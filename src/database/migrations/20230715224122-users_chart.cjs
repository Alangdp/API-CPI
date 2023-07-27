/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('usersChart', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      ticker: {
        type: Sequelize.STRING,
        allowNull: null,
      },

      companyName: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      Quantity: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },

      buyPrice: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      buyDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      actualPrice: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },

      amountPrice: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },

      profitPrejudice: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },

      profitPrejudicePorcent: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('usersChart');
  },
};
