import Sequelize, { Model } from 'sequelize';

import UserChart from './UserChart.js';

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
  6: 'Dividend Payment',
};

const brokers = {
  0: 'XP Investimentos',
  1: 'Clear Corretora',
  2: 'Easynvest',
  3: 'Rico Investimentos',
  4: 'Modalmais',
  5: 'BTG Pactual Digital',
  6: 'Stock Payment',
  7: 'System',
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

        transationDate: {
          type: Sequelize.DATE,
          defaultValue: new Date(),
          allowNull: false,
          field: 'transationDate',
        },
      },

      { sequelize }
    );

    this.addHook('beforeSave', function beforeSave(TransationBeforeSave) {
      if (TransationBeforeSave.quantity && TransationBeforeSave.price) {
        const totalValue =
          TransationBeforeSave.quantity * TransationBeforeSave.price;

        /* eslint-disable */
        TransationBeforeSave.type = types[TransationBeforeSave.typeCode];
        if (!TransationBeforeSave.type) {
          throw new Error('Invalid type code');
        }

        TransationBeforeSave.broker = brokers[TransationBeforeSave.brokerCode];
        if (!TransationBeforeSave.broker) {
          throw new Error('Invalid broker code');
        }

        TransationBeforeSave.totalValue = totalValue;
        TransationBeforeSave.type = types[TransationBeforeSave.typeCode];
        TransationBeforeSave.broker = brokers[TransationBeforeSave.brokerCode];
        /* eslint-enable */
      }

      return Transation;
    });

    return this;
  }
}
