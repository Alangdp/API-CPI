/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('stocks', 'actualPrice', 'actual_price');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('stocks', 'actual_price', 'actualPrice');
  },
};
