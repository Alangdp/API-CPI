/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.changeColumn('Transations', 'quantity', {
        type: Sequelize.FLOAT,
        allowNull: false,
      }),
    ]);
  },

  async down(queryInterface, Sequelize) {},
};
