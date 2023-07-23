import express from 'express';
import dotenv from 'dotenv';
import schedule from 'node-schedule';
// import cors from 'cors';
// import helmet from 'helmet';

// eslint-disable-next-line
import axios from 'axios';
import models from './database/index.js';

// Utils

import { readJSONFromFile, saveTickerJson } from './utils/getFuncions.js';

// Routes
import userRoutes from './routes/userRoutes.js';
import tokenRoutes from './routes/tokenRoutes.js';
import stockRoutes from './routes/stocksRouter.js';

dotenv.config();

// Cors config
// const whiteList = [
//   "http://192.168.1.83",
//   "http://localhost:3000",
//   "http://127.0.0.1",
// ];

// const corsOptions = {
//   origin(origin, callback) {
//     if (whiteList.indexOf(origin) !== -1 || !origin) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowd by CORS"));
//     }
//   },
// };

class Schudelers {
  updatedData() {
    axios.post('http://localhost:3000/stocks/userChart', {
      password: process.env.SECRET_TOKEN,
      all: true,
      backup: true,
    });
  }

  updateTickersJson() {
    return saveTickerJson();
  }

  updatedChartData() {
    axios.patch('http://localhost:3000/stocks/userChart', {
      password: process.env.SECRET_TOKEN,
    });
  }
}

class App {
  constructor() {
    // App virables

    // Schuderls
    this.Schuduler = new Schudelers();

    // Express
    this.app = express();
    this.middlewares();
    this.routes();
    this.schedulers();
  }

  schedulers() {
    console.log('Schedules activate');
    schedule.scheduleJob('*/30 * * * *', this.Schuduler.updatedData);
    schedule.scheduleJob('*/15 * * * *', this.Schuduler.updatedChartData);
    schedule.scheduleJob('0 */12 * * *', this.Schuduler.updateTickersJson);
  }

  middlewares() {
    // this.app.use(cors());
    // this.app.use(helmet());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
  }

  routes() {
    this.app.use('/user', userRoutes);
    this.app.use('/token', tokenRoutes);
    this.app.use('/stocks', stockRoutes);
  }
}

export default new App().app;
