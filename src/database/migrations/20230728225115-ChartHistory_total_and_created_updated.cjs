/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    Promise.all([
      await queryInterface.addColumn('UserHistory', 'totalValue', {
        type: Sequelize.FLOAT,
        allowNull: false,
      }),

      await queryInterface.addColumn('UserHistory', 'created_at', {
        type: Sequelize.DATE,
        allowNull: false,
      }),

      await queryInterface.addColumn('UserHistory', 'updated_at', {
        type: Sequelize.DATE,
        allowNull: false,
      }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  },
};
