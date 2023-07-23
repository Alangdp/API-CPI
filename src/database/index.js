import { Sequelize } from 'sequelize';

import databaseConfig from '../config/database.js';
import User from '../models/User.js';
import Stock from '../models/Stock.js';
import UserChart from '../models/UserChart.js';

const models = [User, Stock, UserChart];
const connection = new Sequelize(databaseConfig);

/* eslint-disable */
for (const model of models) {
  model.init(connection);
  if (model.associate) {
    model.associate();
  }
}

export default models;
