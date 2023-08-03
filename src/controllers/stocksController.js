import Stock from '../models/Stock.js';
import {
  createMultipleStockData,
  registerItem,
  updateUserChartData,
  saveOrUpdatedHistory,
  saveOrUpdatedAllHistory,
  calculateTotalDividend,
  calculateDividend,
} from '../models/ModelFunctions.js';

// eslint-disable-next-line
import { erroSequelizeFilter } from '../utils/controllersExtra.js';

class StockController {
  async storeChart(req, res) {
    try {
      const data = req.body;
      data.id = req.userId;
      const userChart = await registerItem(data);

      return res.status(200).json({ userChart });
    } catch (err) {
      const erroList = erroSequelizeFilter(err);
      return res.status(400).json(erroList);
    }
  }

  async updateHistory(req, res) {
    try {
      const data = await saveOrUpdatedAllHistory();
      return res.status(200).json({ data });
    } catch (err) {
      const erroList = erroSequelizeFilter(err);
      return res.status(400).json(erroList);
    }
  }

  async teste(req, res) {
    try {
      const data = await calculateDividend(req.body);
      return res.status(200).json({ data });
    } catch (err) {
      const erroList = erroSequelizeFilter(err);
      return res.status(400).json(erroList);
    }
  }

  async updateCharts(req, res) {
    try {
      const data = await updateUserChartData();
      return res.status(200).json({ data });
    } catch (err) {
      const erroList = erroSequelizeFilter(err);
      return res.status(400).json(erroList);
    }
  }

  async store(req, res) {
    try {
      const { all, backup, ticker } = req.body;

      if (all === true) {
        if (backup) {
          createMultipleStockData(false);
          return res.status(200).json({ msg: 'Backup Data used' });
        }

        createMultipleStockData(true);
        return res.status(200).json({ msg: 'All data updated' });
      }
      const stock = await Stock.registerStock(ticker);
      return res.status(200).json({ data: stock });
    } catch (err) {
      const erroList = erroSequelizeFilter(err);
      return res.status(400).json(erroList);
    }
  }

  async show(req, res) {
    try {
      let { ticker } = req.params;
      ticker = ticker ? ticker.toUpperCase() : null;

      const stock = await Stock.findOne({ where: { ticker } });
      if (stock === null)
        return res.status(200).json({ msg: 'Invalid Ticker' });
      return res.status(200).json({ data: stock });
    } catch (err) {
      const error = erroSequelizeFilter(err);
      return res.status(500).json(error);
    }
  }
}

export default new StockController();
