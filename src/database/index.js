// eslint-disable-next-line
import { Sequelize } from 'sequelize';

import databaseConfig from '../config/database.js';
import User from '../models/User.js';
import Stock from '../models/Stock.js';
import UserChart from '../models/UserChart.js';
import Transation from '../models/Transation.js';
import HistoryChart from '../models/HistoryChart.js';

const models = [User, Stock, UserChart, Transation, HistoryChart];
const connection = new Sequelize(databaseConfig);

/* eslint-disable */
for (const model of models) {
  model.init(connection);
  if (model.associate) {
    model.associate();
  }
}

export default models;
