import { Sequelize } from 'sequelize';

import databaseConfig from '../config/database.js';
import User from '../models/User.js';
import Stock from '../models/Stock.js';

const models = [User, Stock];
const connection = new Sequelize(databaseConfig);

/* eslint-disable */
const ativaModelo = async () => {
  for (const model of models) {
    await model.init(connection);
  }
};

await ativaModelo();

export default models;
