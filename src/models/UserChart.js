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

async function medianPrice(id, ticker) {
  const UserTransations = await Transation.findAll({
    where: { user_id: id, ticker },
  });

  let stockQuantity = 0;
  let stockValue = 0;
  let median = 0;

  UserTransations.forEach((transationDataInfo) => {
    if (transationDataInfo.typeCode === 0) {
      stockValue += transationDataInfo.totalValue;
      stockQuantity += transationDataInfo.quantity;
    }

    median = stockValue / stockQuantity;
  });

  return { median, quantity: stockQuantity };
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
      await chart.update({ actualPrice: newTickerInfo.actualPrice });
      TickerInfos.push(newTickerInfo);
    }
    /* eslint-enable */
  }

  return UsersChart;
}

async function userAlreadyOwnsStocks(userChartData) {
  const userData = await UserChart.findOne({
    where: { user_id: userChartData.user_id, ticker: userChartData.ticker },
  });

  return userData;
}

function IsNull(message = 'Error') {
  throw new Error(message);
}

export async function registerItem(data) {
  let TickerInfo;

  try {
    TickerInfo = await Stock.findOne({ where: { ticker: data.ticker } });
    if (TickerInfo === null) throw new Error('Not in DB');
  } catch (err) {
    TickerInfo = await Stock.registerStock(data.ticker);
  }

  const lastUpdated = new Date(TickerInfo.updatedAt || '2000-01-01');
  const actualDate = new Date();
  const timeDiferenceInMinutes = (actualDate - lastUpdated) / (1000 * 60);

  if (timeDiferenceInMinutes > 30) {
    Stock.registerStock(data.ticker);
  }

  const transationData = {
    user_id: data.id,
    ticker: data.ticker,
    typeCode: data.typeCode,
    price: data.price,
    quantity: data.Quantity || IsNull('Invalid Quantity'),
    brokerCode: data.brokerCode,
  };

  const TransationData = await Transation.create(transationData);
  const mediaPrice = await medianPrice(data.id, data.ticker);

  const userChartData = {
    user_id: data.id,
    ticker: data.ticker,
    Quantity: mediaPrice.quantity,
    buyPrice: data.price,
    medianPrice: mediaPrice.median,
    actualPrice: TickerInfo.actualPrice,
  };

  let userData = await userAlreadyOwnsStocks(userChartData);

  if (userData) userData = await userData.update(userChartData);
  else userData = await UserChart.create(userChartData);

  return { TransationData, userData };
}
