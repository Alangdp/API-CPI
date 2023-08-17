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
        ticker: {
          type: Sequelize.STRING,
          validate: {
            len: {
              args: [5, 6],
              msg: 'Invalid Ticker',
            },
          },
        },

        type: dividendInfo.type,
        dividendValue: dividendInfo.value,
        dataEx: dividendInfo.dataEx,
        dataCom: dividendInfo.dataCom,
      },
      { sequelize, tableName: 'dividends' }
    );

    this.addHook('beforeSave', function beforeSave(ChartHistory) {});

    return this;
  }
}
