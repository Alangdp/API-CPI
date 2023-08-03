import { literal } from 'Sequelize';
import User from './User.js';
import Stock from './Stock.js';
import UserChart from './UserChart.js';
import Transation from './Transation.js';
import HistoryChart from './HistoryChart.js';

import { getAllTickers, getBasicInfo } from '../utils/getFuncions.js';

import { erroSequelizeFilter } from '../utils/controllersExtra.js';

async function getUniqueIds() {
  const usersCharts = await UserChart.findAll();
  let usersId = [];
  usersCharts.forEach((userChart) => {
    usersId.push(userChart.user_id);
  });

  usersId = Array.from(new Set(usersId));
  return usersId;
}

async function medianPrice(id, ticker) {
  const UserTransations = await Transation.findAll({
    where: { user_id: id, ticker },
  });

  let stockQuantity = 0;
  let stockValue = 0;
  let median = 0;

  UserTransations.forEach((transationDataInfo) => {
    if (transationDataInfo.typeCode === 0) {
      stockValue += transationDataInfo.totalValue;
      stockQuantity += transationDataInfo.quantity;
    }

    median = stockValue / stockQuantity;
  });

  return { median, quantity: stockQuantity };
}

export async function updateUserChartData() {
  const UsersChart = await UserChart.findAll();
  const TickerInfos = [];

  /* eslint-disable */
  for (const chart of UsersChart) {
    const tickerInfo = TickerInfos.find((info) => info.ticker === chart.ticker);

    if (tickerInfo) {
      await chart.update({ actualPrice: tickerInfo.actualPrice });
    } else {
      const newTickerInfo = await Stock.registerStock(chart.ticker);
      await chart.update({ actualPrice: newTickerInfo.actualPrice });
      TickerInfos.push(newTickerInfo);
    }
    /* eslint-enable */
  }

  return UsersChart;
}

async function userAlreadyOwnsStocks(userChartData) {
  const userData = await UserChart.findOne({
    where: { user_id: userChartData.user_id, ticker: userChartData.ticker },
  });

  return userData;
}

function IsNull(message = 'Error') {
  throw new Error(message);
}

export async function registerItem(data) {
  let TickerInfo;

  try {
    TickerInfo = await Stock.findOne({ where: { ticker: data.ticker } });
    if (TickerInfo === null) throw new Error('Not in DB');
  } catch (err) {
    TickerInfo = await Stock.registerStock(data.ticker);
  }

  const lastUpdated = new Date(TickerInfo.updatedAt || '2000-01-01');
  const actualDate = new Date();
  const timeDiferenceInMinutes = (actualDate - lastUpdated) / (1000 * 60);

  if (timeDiferenceInMinutes > 30) {
    Stock.registerStock(data.ticker);
  }

  const transationData = {
    user_id: data.id,
    ticker: data.ticker,
    typeCode: data.typeCode,
    price: data.price,
    quantity: data.Quantity || IsNull('Invalid Quantity'),
    brokerCode: data.brokerCode,
  };

  const TransationData = await Transation.create(transationData);
  const mediaPrice = await medianPrice(data.id, data.ticker);

  const userChartData = {
    user_id: data.id,
    ticker: data.ticker,
    Quantity: mediaPrice.quantity,
    buyPrice: data.price,
    medianPrice: mediaPrice.median,
    actualPrice: TickerInfo.actualPrice,
  };

  let userData = await userAlreadyOwnsStocks(userChartData);

  if (userData) userData = await userData.update(userChartData);
  else userData = await UserChart.create(userChartData);

  return { TransationData, userData };
}

// HISTORY

export async function saveOrUpdatedHistory(userId = null) {
  if (!userId) throw new Error('Invalid ID');

  const stockTickers = await getAllTickers();
  const userChart = await UserChart.findAll({ where: { user_id: userId } });

  const historyData = {
    user_id: userId,
    date: new Date(),
    stockValues: 0,
    fiiValues: 0,
    titlesValues: 0,
  };

  userChart.forEach((stock) => {
    if (stockTickers.includes(stock.ticker)) {
      historyData.stockValues += stock.amountPrice;
    }
  });

  const dayHistory = await HistoryChart.findOne({
    where: { date: literal(`DATE(date) = DATE(NOW())`), user_id: userId },
  });

  let dateHistory = null;

  if (!dayHistory) {
    dateHistory = await HistoryChart.create(historyData);
  } else {
    await dayHistory.update(historyData, {
      where: { date: literal(`DATE(date) = DATE(NOW())`), user_id: userId },
    });
  }

  if (!dateHistory) dateHistory = dayHistory;

  return dateHistory;
}

export async function saveOrUpdatedAllHistory() {
  try {
    usersId = await getUniqueIds();

    /* eslint-disable */
    for (const userId of usersId) {
      updatedUser.push(await saveOrUpdatedHistory(userId));
    }
    /* eslint-enable */

    return updatedUser;
  } catch (err) {
    return erroSequelizeFilter(err);
  }
}

// STOCK

/* eslint-disable */
export async function createMultipleStockData(getWithApi = true) {
  try {
    const allDatas = [];
    if (getWithApi) {
      const tickers = await getAllTickers();

      for (const ticker of tickers) {
        try {
          const infoPrice = await getPrice(ticker);
          const basicInfo = await getBasicInfo(ticker);

          const data = {
            ticker,
            company_name: basicInfo.name,
            actualPrice: infoPrice.lastPrice.price,
          };

          allDatas.push(data);
        } catch (err) {
          continue;
        }
      }
    } else {
      allDatas.push(...readJSONFromFile('stockDatas.json'));
    }

    for (const data of allDatas) {
      await updateOrCreateStock(data);
    }

    console.log('Registros criados/atualizados com sucesso!');
  } catch (error) {
    console.error('Erro ao criar/atualizar registros:', error);
  }
}

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
    } else {
      return await Stock.create(data);
    }
  } catch (error) {
    return erroSequelizeFilter(error);
    console.error('Erro ao atualizar/criar registro:', error);
  }
}

// TRANSACTION

export async function calculateTotalDividend(data) {
  try {
    if (!data.user_id) throw new Error('Invalid ID');

    const transations = await Transation.findAll({
      where: { user_id: data.user_id },
    });

    let dividendValue = 0;
    const dividendTransaction = transations.forEach((transation) => {
      if (transation.typeCode === 6) {
        dividendValue += transation.totalValue;
      }
    });

    return dividendValue;
  } catch (err) {
    console.log(err);
    return err;
  }
}

async function getAllStocksInChart(userId) {
  const userChart = await UserChart.findAll({ where: { user_id: userId } });
  return userChart;
}

export async function calculateDividend() {
  try {
    const tickerInfo = [];

    /*
      for (const chart of UsersChart) {
    const tickerInfo = TickerInfos.find((info) => info.ticker === chart.ticker);

    if (tickerInfo) {
      await chart.update({ actualPrice: tickerInfo.actualPrice });
    } else {
      const newTickerInfo = await Stock.registerStock(chart.ticker);
      await chart.update({ actualPrice: newTickerInfo.actualPrice });
      TickerInfos.push(newTickerInfo);
    }

     */

    const usersId = await getUniqueIds();
    for (let user_id of usersId) {
      const userChart = await getAllStocksInChart(user_id);
      for (let stock of userChart) {
        const tickerInfoBool = tickerInfo.find(
          (info) => info.ticker === stock.ticker
        );

        if (tickerInfoBool) {
        } else {
          const data = await getBasicInfo(stock.ticker);
          const lastDividends = data.dividendInfo.dividends.lastDividends;
        }

        const data = await getBasicInfo(stock.ticker);
        console.log(data.dividendInfo.dividends.lastDividends, '\n');
      }
    }
    return usersId;
  } catch (err) {
    console.log(err);
    return err;
  }
}
