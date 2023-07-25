import Stock, { createMultipleStockData } from '../models/Stock.js';
import { registerItem, updateUserChartData } from '../models/UserChart.js';

// eslint-disable-next-line
import { erroSequelizeFilter } from '../utils/controllersExtra.js';

class StockController {
  async storeChart(req, res) {
    const data = req.body;
    data.id = req.userId;
    const userChart = await registerItem(data);

    return res.status(200).json({ userChart });
  }

  async updateCharts(req, res) {
    const data = await updateUserChartData();
    return res.status(200).json({ data });
  }

  async store(req, res) {
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
