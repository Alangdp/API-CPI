/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn('users', 'email', {
        type: Sequelize.STRING,
        unique: true,
      }),

      queryInterface.renameColumn('users', 'password', 'password_hash'),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn('users', 'email', {
        type: Sequelize.STRING,
        unique: false,
      }),

      queryInterface.renameColumn('users', 'password_hash', 'password'),
    ]);
  },
};
