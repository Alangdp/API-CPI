import Sequelize, { Model } from 'sequelize';

import User from './User.js';

import {
  readJSONFromFile,
  getBasicInfo,
  getPrice,
} from '../utils/getFuncions.js';
import Stock from './Stock.js';

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

        buyPrice: {
          type: Sequelize.FLOAT,
          allowNull: false,
          field: 'buyPrice',
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
          userChart.Quantity * (userChart.actualPrice - userChart.buyPrice);
        const profitPrejudicePorcent =
          (profitPrejudice / (userChart.Quantity * userChart.buyPrice)) * 100;

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

export async function updateUserChartData() {
  const UsersChart = await UserChart.findAll();
  const TickerInfos = [];

  /* eslint-disable */
  for (const chart of UsersChart) {
    const tickerInfo = TickerInfos.find((info) => info.ticker === chart.ticker);

    if (tickerInfo) {
      await chart.update({ actualPrice: tickerInfo.actualPrice });
    } else {
      const newTickerInfo = await Stock.registerStock(chart.ticker);
      TickerInfos.push(newTickerInfo);
    }
    /* eslint-enable */
  }

  return UsersChart;
}

export async function registerItem(data) {
  let TickerInfo;

  try {
    TickerInfo = await Stock.findOne({ where: { ticker: data.ticker } });
  } catch (err) {
    TickerInfo = await Stock.registerStock(data.ticker);
  }

  const lastUpdated = new Date(TickerInfo.updatedAt);
  const actualDate = new Date();
  const timeDiferenceInMinutes = (actualDate - lastUpdated) / (1000 * 60);

  if (timeDiferenceInMinutes > 30) {
    Stock.registerStock(data.ticker);
  }

  const returnData = {
    user_id: data.id,
    ticker: data.ticker,
    Quantity: data.Quantity,
    buyPrice: data.price,
    actualPrice: TickerInfo.actualPrice,
  };

  const userChart = await UserChart.create(returnData);
  return userChart;
}
