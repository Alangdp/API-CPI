import { Sequelize } from 'sequelize';

import databaseConfig from '../config/database.js';
import User from '../models/User.js';

const models = [User];

const connection = new Sequelize(databaseConfig);
models.forEach((model) => model.init(connection));

export default models;
