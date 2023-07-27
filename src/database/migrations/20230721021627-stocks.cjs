/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      await queryInterface.createTable('stocks', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          allowNull: false,
          autoIncrement: true,
        },

        ticker: {
          type: Sequelize.STRING,
          allowNull: false,
        },

        companyName: {
          type: Sequelize.STRING,
          allowNull: false,
        },

        actualPrice: {
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
      }),

      await queryInterface.removeColumn('usersChart', 'companyName'),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return Promise.all([
      await queryInterface.addColumn('usersChart', 'companyName', {
        type: Sequelize.STRING,
        allowNull: false,
      }),
      await queryInterface.dropTable('stocks'),
    ]);
  },
};
