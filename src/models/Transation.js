import Sequelize, { Model } from 'sequelize';

// const types = {
//   0: 'Compra de Ações',
//   1: 'Venda de Ações',
//   2: 'Compra de Títulos',
//   3: 'Venda de Títulos',
//   4: 'Compra de Fundos',
//   5: 'Venda de Fundos',
// };

const types = {
  0: 'Stock Purchase',
  1: 'Stock Sale',
  2: 'Bond Purchase',
  3: 'Bond Sale',
  4: 'Mutual Fund Purchase',
  5: 'Mutual Fund Sale',
};

const brokers = {
  0: 'XP Investimentos',
  1: 'Clear Corretora',
  2: 'Easynvest',
  3: 'Rico Investimentos',
  4: 'Modalmais',
  5: 'BTG Pactual Digital',
};

export default class Transation extends Model {
  static init(sequelize) {
    super.init(
      {
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },

        ticker: {
          type: Sequelize.STRING,
          allowNull: false,
          validate: {
            len: {
              args: [5, 6],
              msg: 'Ticker must be between 5 and 6 characters ',
            },
          },
        },

        type: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: '',
        },

        price: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },

        quantity: {
          type: Sequelize.FLOAT,
          allowNull: true,
        },

        totalValue: {
          type: Sequelize.FLOAT,
          allowNull: false,
          defaultValue: 0,
          field: 'totalValue',
        },

        broker: {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: '',
        },

        brokerCode: {
          type: Sequelize.VIRTUAL,
          allowNull: false,
        },

        typeCode: {
          type: Sequelize.INTEGER,
          allowNull: false,
          field: 'typeCode',
        },
      },

      { sequelize }
    );

    this.addHook('beforeSave', function beforeSave(Transation) {
      if (Transation.quantity && Transation.price) {
        const totalValue = Transation.quantity * Transation.price;

        /* eslint-disable */
        Transation.type = types[Transation.typeCode];
        if (!Transation.type) {
          throw new Error('Invalid type code');
        }

        Transation.broker = brokers[Transation.brokerCode];
        if (!Transation.broker) {
          throw new Error('Invalid broker code');
        }

        Transation.totalValue = totalValue;
        Transation.type = types[Transation.typeCode];
        Transation.broker = brokers[Transation.brokerCode];
        /* eslint-enable */
      }

      return Transation;
    });

    return this;
  }
}
