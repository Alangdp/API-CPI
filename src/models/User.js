import Sequelize, { Model } from 'sequelize';
import bcrypjs from 'bcryptjs';

export default class User extends Model {
  validateCellphone = (value) => {
    const cellphoneRegex =
      /^(\+\d{1,3}\s?)?(?:\(\d{2}\))?(?:9\d{4}|\d{4})[-\s]?\d{4}$/;
    if (!cellphoneRegex.test(value)) {
      throw new Error('Invalid cellphone number');
    }
  };

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
          defaultValue: '',
        },

        password_hash: {
          type: Sequelize.VIRTUAL,
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
          },
        },
        cpf: Sequelize.STRING,
      },
      { sequelize }
    );

    this.addHook('beforeSave', async (user) => {
      user.password_hash = await bcrypjs.hash(user.password, 8);
    });

    return this;
  }
}
