import express from 'express';
// import cors from 'cors';
// import helmet from 'helmet';
import dotenv from 'dotenv';

import models from './database/index.js';

import userRoutes from './routes/userRoutes.js';
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

class App {
  constructor() {
    this.app = express();
    this.middlewares();
    this.routes();
  }

  middlewares() {
    // this.app.use(cors());
    // this.app.use(helmet());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
  }

  routes() {
    this.app.use('/user', userRoutes);
  }
}

export default new App().app;
