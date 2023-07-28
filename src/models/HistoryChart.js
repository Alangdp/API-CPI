// eslint-disable-next-line
import Sequelize, { Model, literal } from 'sequelize';
// eslint-disable-next-line

import {
  getPrice,
  getBasicInfo,
  getAllTickers,
  saveJSONToFile,
  readJSONFromFile,
} from '../utils/getFuncions.js';

// eslint-disable-next-line
import { erroSequelizeFilter } from '../utils/controllersExtra.js';

import User from './User.js';
import UserChart from './UserChart.js';

export default class HistoryChart extends Model {
  static init(sequelize) {
    super.init(
      {
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,

          validate: {
            async userExists(value) {
              const user = await User.findByPk(value);
              if (!user) throw new Error('Invalid User');
            },
          },
        },

        date: {
          type: Sequelize.DATE,
          allowNull: false,
        },

        stockValues: {
          type: Sequelize.FLOAT,
          allowNull: false,
          defaultValue: 0,
          field: 'stockValues',
        },

        fiiValues: {
          type: Sequelize.FLOAT,
          allowNull: false,
          defaultValue: 0,
          field: 'fiiValues',
        },

        titlesValues: {
          type: Sequelize.FLOAT,
          allowNull: false,
          defaultValue: 0,
          field: 'titlesValues',
        },

        totalValue: {
          type: Sequelize.FLOAT,
          allowNull: false,
          defaultValue: 0,
          field: 'totalValue',
        },
      },
      { sequelize, tableName: 'userhistory' }
    );

    this.addHook('beforeSave', function beforeSave(ChartHistory) {
      const totalValue =
        ChartHistory.stockValues +
        ChartHistory.fiiValues +
        ChartHistory.titlesValues;
      /* eslint-disable */
      ChartHistory.totalValue = totalValue;
      /* eslint-enable */

      return ChartHistory;
    });

    return this;
  }
}

export async function saveOrUpdatedHistory(userId = null) {
  if (!userId) throw new Error('Invalid ID');

  const stockTickers = await getAllTickers();
  const userChart = await UserChart.findAll({ where: { user_id: userId } });

  const historyData = {
    user_id: userId,
    date: new Date(),
    stockValues: 0,
    fiiValues: 0,
    titlesValues: 0,
  };

  userChart.forEach((stock) => {
    if (stockTickers.includes(stock.ticker)) {
      historyData.stockValues += stock.amountPrice;
    }
  });

  const dayHistory = await HistoryChart.findOne({
    where: { date: literal(`DATE(date) = DATE(NOW())`), user_id: userId },
  });

  let dateHistory = null;

  if (!dayHistory) {
    dateHistory = await HistoryChart.create(historyData);
  } else {
    await dayHistory.update(historyData, {
      where: { date: literal(`DATE(date) = DATE(NOW())`), user_id: userId },
    });
  }

  if (!dateHistory) dateHistory = dayHistory;

  return dateHistory;
}

export async function saveOrUpdatedAllHistory() {
  const usersCharts = await UserChart.findAll();
  let usersId = [];
  usersCharts.forEach((userChart) => {
    usersId.push(userChart.user_id);
  });

  const updatedUser = [];

  usersId = Array.from(new Set(usersId));

  /* eslint-disable */
  for (const userId of usersId) {
    updatedUser.push(await saveOrUpdatedHistory(userId));
  }
  /* eslint-enable */

  return updatedUser;
}
