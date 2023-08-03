import Sequelize, { Model } from 'sequelize';

import User from './User.js';
import Stock from './Stock.js';
import Transation from './Transation.js';

import {
  readJSONFromFile,
  getBasicInfo,
  getPrice,
} from '../utils/getFuncions.js';

const tickers = readJSONFromFile('tickers.json');

export default class UserChart extends Model {
  static associate() {
    this.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  }

  static init(sequelize) {
    super.init(
      {
        user_id: {
          type: Sequelize.STRING,
          allowNull: false,
        },

        ticker: {
          type: Sequelize.STRING,
          allowNull: false,
          validate: {
            len: {
              args: [5, 6],
              msg: 'Invalid ticker length',
            },

            tickerIsValid(ticker) {
              if (!tickers.includes(ticker)) {
                throw new Error('Invalid ticker');
              }
            },
          },
        },

        Quantity: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },

        medianPrice: {
          type: Sequelize.FLOAT,
          allowNull: false,
          field: 'medianPrice',
        },

        buyDate: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: new Date(),
          field: 'buyDate',
        },

        actualPrice: {
          type: Sequelize.FLOAT,
          allowNull: false,
          field: 'actualPrice',
        },

        amountPrice: {
          type: Sequelize.FLOAT,
          allowNull: false,
          defaultValue: 0,
          field: 'amountPrice',
        },

        profitPrejudice: {
          type: Sequelize.FLOAT,
          allowNull: false,
          defaultValue: 0,
          field: 'profitPrejudice',
        },

        profitPrejudicePorcent: {
          type: Sequelize.FLOAT,
          allowNull: false,
          defaultValue: 0,
          field: 'profitPrejudicePorcent',
        },
      },
      {
        sequelize,
        tableName: 'userschart',
      }
    );

    this.addHook('beforeSave', function beforeSave(userChart) {
      if (userChart.Quantity && userChart.actualPrice) {
        const amountPrice = userChart.Quantity * userChart.actualPrice;
        const profitPrejudice =
          userChart.Quantity * (userChart.actualPrice - userChart.medianPrice);
        const profitPrejudicePorcent =
          (profitPrejudice / (userChart.Quantity * userChart.medianPrice)) *
          100;

        /* eslint-disable */
        userChart.amountPrice = amountPrice;
        userChart.profitPrejudice = profitPrejudice;
        userChart.profitPrejudicePorcent = profitPrejudicePorcent;
        /* eslint-enable */
      }

      return userChart;
    });

    return this;
  }
}
