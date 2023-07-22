import express from 'express';
import dotenv from 'dotenv';
import schedule from 'node-schedule';
// import cors from 'cors';
// import helmet from 'helmet';

// eslint-disable-next-line
import axios from 'axios';
import models from './database/index.js';

import userRoutes from './routes/userRoutes.js';
import tokenRoutes from './routes/tokenRoutes.js';
import stockRoutes from './routes/stocksRouter.js';

dotenv.config();

// CONFIGURACOES DO CORS
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

const updatedData = () => {
  axios.post('http://localhost:3000/stocks', {
    all: true,
    backup: true,
  });
};

class App {
  constructor() {
    this.app = express();
    this.middlewares();
    this.routes();
    this.schedulers();
  }

  schedulers() {
    console.log('Schedules activate');
    schedule.scheduleJob('*/30 * * * *', updatedData);
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
