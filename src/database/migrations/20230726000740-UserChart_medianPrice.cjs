/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn('usersChart', 'buyPrice', 'medianPrice');
  },

  async down(queryInterface, Sequelize) {},
};
