import Sequelize, { Model } from 'sequelize';
import bcrypjs from 'bcryptjs';

export default class User extends Model {
  static init(sequelize) {
    super.init(
      {
        name: {
          type: Sequelize.STRING,
          defaultValue: '',
          validate: {
            len: {
              args: [3, 255],
              msg: 'Name field must be between 3 and 255 characters',
            },
          },
        },

        email: {
          type: Sequelize.STRING,
          defaultValue: '',
          validate: {
            isEmail: {
              msg: 'Invalid email',
            },
          },
        },

        birthdate: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },

        phonenumber: {
          type: Sequelize.STRING,
          validate: {
            validateCellphone(value) {
              const cellphoneRegex = /^[1-9]{2}9?[0-9]{8}$/;
              if (!cellphoneRegex.test(value)) {
                throw new Error('Invalid cellphone number');
              }
            },
          },
        },

        password_hash: {
          type: Sequelize.STRING,
          defaultValue: '',
        },

        password: {
          type: Sequelize.VIRTUAL,
          defaultValue: '',
          validate: {
            len: {
              args: [8, 50],
              msg: 'Password field must be between 8 and 50 characters',
            },

            containsLowerCase(value) {
              if (!/[a-z]/.test(value)) {
                throw new Error('Password must contain lowercase letters');
              }
            },

            containsUppercase(value) {
              if (!/[A-Z]/.test(value)) {
                throw new Error('Password must contain capital letters');
              }
            },
          },
        },
        cpf: {
          type: Sequelize.STRING,
          validate: {
            validateCPF(value) {
              const CPFRegex =
                /([0-9]{2}[\.]?[0-9]{3}[\.]?[0-9]{3}[\/]?[0-9]{4}[-]?[0-9]{2})|([0-9]{3}[\.]?[0-9]{3}[\.]?[0-9]{3}[-]?[0-9]{2})/;
              if (!CPFRegex.test(value)) {
                throw new Error('Invalid CPF number');
              }
            },
          },
        },
      },
      { sequelize }
    );

    // eslint-disable-next-line
    this.addHook('beforeSave', (user) => {
      try {
        // eslint-disable-next-line
        user.password_hash = bcrypjs.hashSync(user.password, 8);
      } catch (error) {
        return null;
      }
    });

    return this;
  }
}

// eslint-disable-next-line
User.prototype.validatePassword = function (password) {
  try {
    const valid = bcrypjs.compareSync(password, this.password_hash);
    return valid;
  } catch (error) {
    return false;
  }
};
