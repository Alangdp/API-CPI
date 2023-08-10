import { Sequelize, Model } from 'sequelize';
import { all } from 'axios';

import {
  getPrice,
  getBasicInfo,
  getAllTickers,
  saveJSONToFile,
  readJSONFromFile,
} from '../utils/getFuncions.js';

import { erroSequelizeFilter } from '../utils/controllersExtra.js';

export async function updateOrCreateStock(data) {
  try {
    const existingStock = await Stock.findOne({
      where: { ticker: data.ticker },
    });

    if (existingStock) {
      console.log();
      await existingStock.update({
        company_name: data.company_name,
        actualPrice: data.actualPrice,
      });

      return existingStock.dataValues;
    }
    return await Stock.create(data);
  } catch (error) {
    return erroSequelizeFilter(error);
    console.error('Erro ao atualizar/criar registro:', error);
  }
}

export default class Stock extends Model {
  static init(sequelize) {
    super.init(
      {
        ticker: {
          unique: true,
          type: Sequelize.STRING,
          allowNull: false,
          validate: {
            len: {
              args: [5, 6],
              msg: 'Ticker must be between 5 and 6 characters ',
            },
          },
        },

        company_name: {
          type: Sequelize.STRING,
          allowNull: false,
          validate: {
            len: {
              args: [5, 255],
              msg: 'companyName must be between 15 and 255 characters ',
            },
          },
        },

        actualPrice: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
      },
      {
        sequelize,
      }
    );
  }

  static async registerStock(ticker = null) {
    // eslint-disable-next-line
    ticker = ticker ? ticker.toUpperCase() : null;
    try {
      const infoPrice = await getPrice(ticker);
      const basicInfo = await getBasicInfo(ticker);

      const data = {
        ticker,
        company_name: basicInfo.name,
        actualPrice: infoPrice.lastPrice.price || infoPrice.lastPrice,
      };

      // eslint-disable-next-line
      data.company_name = data.company_name.split('-')[1].trim().split(':')[0];
      const stock = updateOrCreateStock(data);

      return stock;
    } catch (error) {
      return erroSequelizeFilter(error);
    }
  }
}
