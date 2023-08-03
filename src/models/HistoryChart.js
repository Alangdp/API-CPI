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
