/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('stocks', 'companyName', 'company_name');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('stocks', 'company_name', 'companyName');
  },
};
