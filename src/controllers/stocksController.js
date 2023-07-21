import Stock, { createMultipleStockData } from '../models/Stock.js';

// eslint-disable-next-line
import { erroSequelizeFilter } from '../utils/controllersExtra.js';

class UserController {
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
    let { ticker } = req.params;
    ticker = ticker ? ticker.toUpperCase() : null;

    const stock = await Stock.findOne({ where: { ticker } });
    if (stock === null) return res.status(200).json({ msg: 'Invalid Ticker' });
    return res.status(200).json({ data: stock });
  }
}

export default new UserController();
