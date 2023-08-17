import { Op, literal } from 'Sequelize';
import User from './User.js';
import Stock from './Stock.js';
import UserChart from './UserChart.js';
import Transation from './Transation.js';
import HistoryChart from './HistoryChart.js';

import {
  getAllTickers,
  getBasicInfo,
  getPrice,
  readJSONFromFile,
} from '../utils/getFuncions.js';

import { erroSequelizeFilter } from '../utils/controllersExtra.js';

// GENERAL FUNCTIONS

function makeError(message = 'Error') {
  throw new Error(message);
}

function formatNumber(stringToFormat = null, comma = 2) {
  try {
    let strintFormated = stringToFormat;
    if (typeof stringToFormat !== 'string') throw new Error('Invalid String');
    strintFormated = stringToFormat.replace(/[^\d,.]/g, '').replace(',', '.');

    return Number(strintFormated).toFixed(comma);
  } catch (err) {
    return stringToFormat;
  }
}

async function getAllStocksInChart(userId) {
  const userChart = await UserChart.findAll({ where: { user_id: userId } });
  return userChart;
}

async function getAllTransactions(userId) {
  const transations = await Transation.findAll({ where: { user_id: userId } });
  return transations;
}

async function getUniqueIds() {
  const usersCharts = await UserChart.findAll();
  const usersId = [];
  usersCharts.forEach((userChart) => {
    usersId.push(userChart.user_id);
  });

  return Array.from(new Set(usersId));
}

// Chart

async function medianPrice(userID, ticker) {
  const userTransations = await Transation.findAll({
    where: { user_id: userID, ticker },
  });

  let stockQuantity = 0;
  let stockValue = 0;

  const validTransactions = userTransations.filter(
    (transactionDataInfo) => transactionDataInfo.typeCode === 0
  );

  if (validTransactions.length === 0) {
    return { median: 0, quantity: 0 };
  }

  validTransactions.forEach((transationDataInfo) => {
    if (transationDataInfo.typeCode === 0) {
      stockValue += transationDataInfo.totalValue;
      stockQuantity += transationDataInfo.quantity;
    }
  });

  return { median: stockValue / stockQuantity, quantity: stockQuantity };
}

export async function updateUserChartData() {
  const usersChart = await UserChart.findAll();
  const tickerInfos = [];

  const updatePromises = usersChart.map(async (chart) => {
    const tickerInfo = tickerInfos.find((info) => info.ticker === chart.ticker);

    if (tickerInfo) {
      return chart.update({
        actualPrice: formatNumber(tickerInfo.actualPrice),
      });
    }
    const newTickerInfo = await Stock.registerStock(chart.ticker);
    tickerInfos.push(newTickerInfo);
    return chart.update({ actualPrice: newTickerInfo.actualPrice });
  });

  await Promise.all(updatePromises);

  return usersChart;
}

export async function registerItem(data) {
  let tickerInfo;

  tickerInfo = await Stock.findOne({ where: { ticker: data.ticker } });
  if (!tickerInfo) tickerInfo = await Stock.registerStock(data.ticker);

  const lastUpdated = new Date(tickerInfo.updatedAt || '2000-01-01');
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
    quantity: data.Quantity || makeError('Invalid Quantity'),
    brokerCode: data.brokerCode,
    transationDate: data.transationDate,
  };

  const TransationData = await Transation.create(transationData);
  const mediaPrice = await medianPrice(data.id, data.ticker);

  const userChartData = {
    user_id: data.id,
    ticker: data.ticker,
    Quantity: mediaPrice.quantity,
    buyPrice: data.price,
    medianPrice: mediaPrice.median,
    actualPrice: tickerInfo.actualPrice,
  };

  let userData = await UserChart.findOne({
    where: { user_id: userChartData.user_id, ticker: userChartData.ticker },
  });

  if (userData) userData = await userData.update(userChartData);
  else userData = await UserChart.create(userChartData);

  return { TransationData, userData };
}

// STOCK

export async function updateOrCreateStock(data) {
  try {
    const existingStock = await Stock.findOne({
      where: { ticker: data.ticker },
    });

    if (existingStock) {
      await existingStock.update({
        company_name: data.company_name,
        actualPrice: data.actualPrice,
      });

      return existingStock.dataValues;
    }
    return await Stock.create(data);
  } catch (error) {
    console.error('Erro ao atualizar/criar registro:', error);
    return erroSequelizeFilter(error);
  }
}

async function updateDividendsOnDatabase() {
  // const tickers = await getAllTickers();

  const ticker = 'BBAS3';

  try {
    const basicInfo = await getBasicInfo(ticker);

    basicInfo.dividendInfo.dividends.lastDividends.forEach((dividendInfo) => {
      const data = {
        ticker,
        type: dividendInfo.type,
        dividendValue: dividendInfo.value,
        dataEx: dividendInfo.dataEx,
        dataCom: dividendInfo.dataCom,
      };
    });
  } catch (err) {
    console.log(err);
    // Nothing
  }
}

export async function createMultipleStockData(getWithApi = true) {
  try {
    const allDatas = [];
    if (getWithApi) {
      const tickers = await getAllTickers();
      const pricePromises = tickers.map(async (ticker) => {
        try {
          const [infoPrice, basicInfo] = await Promise.all([
            getPrice(ticker),
            getBasicInfo(ticker),
          ]);

          const data = {
            ticker,
            company_name: basicInfo.name,
            actualPrice: infoPrice.lastPrice.price,
          };

          allDatas.push(data);
        } catch (err) {
          // Nothing
        }
      });

      await Promise.all(pricePromises);
    } else {
      allDatas.push(...readJSONFromFile('stockDatas.json'));
    }

    const updatePromises = allDatas.map(async (data) => {
      await updateOrCreateStock(data);
    });

    await Promise.all(updatePromises);
  } catch (error) {
    // Nothing}
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
    transations.forEach((transation) => {
      if (transation.typeCode === 6) {
        dividendValue += transation.totalValue;
      }
    });

    return dividendValue;
  } catch (err) {
    return 0;
  }
}

/* eslint-disable */

function getStocksOnTheDay(ticker, transactionsList, date) {
  try {
    let stockQuantity = 0;
    const filteredTransactions = transactionsList.filter(
      (transaction) => transaction.ticker === ticker
    );

    filteredTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));
    for (const transaction of filteredTransactions) {
      const transactionDate = new Date(transaction.transationDate);
      if (transactionDate <= date && transaction.typeCode === 0) {
        stockQuantity += transaction.quantity;
      } else {
        continue;
      }
    }

    return stockQuantity;
  } catch (err) {
    console.log(err);
    return 0;
  }
}

export async function calculateDividend(userId = null) {
  try {
    const tickerDividends = [];
    const tickerQuantities = [];
    const userIds = [userId];

    for (const user_id of userIds) {
      const transactions = await getAllTransactions(user_id);
      const userChart = await getAllStocksInChart(user_id);

      for (const stock of userChart) {
        const tickerExists = tickerDividends.find(
          (info) => info.ticker === stock.ticker
        );

        if (!tickerExists) {
          const data = await getBasicInfo(stock.ticker);
          const { lastDividends } = data.dividendInfo.dividends;

          for (const dividendInfo of lastDividends) {
            const dataExParts = dividendInfo.dataEx.split('/');
            const dataEx = new Date(
              `${dataExParts[2]}-${dataExParts[1]}-${dataExParts[0]}`
            );

            const stocksOnDay = getStocksOnTheDay(
              stock.ticker,
              transactions,
              dataEx
            );

            if (stocksOnDay > 0) {
              const existingTickerQuantity = tickerQuantities.find(
                (data) => data.ticker === stock.ticker
              );

              const dividendValue =
                stocksOnDay * formatNumber(dividendInfo.value, 6);

              tickerQuantities.push({
                ticker: stock.ticker,
                dividendValue,
                dataCom: dividendInfo.dataCom,
                dataEx: dividendInfo.dataEx,
                stocksQuantity: stocksOnDay,
                unitaryValue: formatNumber(dividendInfo.value, 6),
              });
            }
          }
        }
      }
    }

    return tickerQuantities;
  } catch (error) {
    console.log(error);
    return error;
  }
}

// HISTORY

const findTransactionWithCriteria = async (
  ticker,
  transationDate,
  typeCode,
  price,
  user_id
) => {
  try {
    price = Number(price);
    const transactions = await Transation.findAll({
      where: {
        user_id,
        transationDate: {
          [Op.lte]: transationDate,
        },
        ticker,
        typeCode,
      },
    });

    if (transactions.length > 0) {
      for (let i = 0; i < transactions.length; i++) {
        if (transactions[i].price === price) {
          return transactions[i];
        }
      }
      return null;
    }
    return null;
  } catch (error) {
    throw error;
  }
};

export async function DividendHistory(userId = null) {
  if (!userId) throw new Error('Invalid ID');

  const dividendUser = await calculateDividend(userId);

  for (const dividend of dividendUser) {
    const dataExParts = dividend.dataEx.split('/');
    const dataEx = new Date(
      `${dataExParts[2]}-${dataExParts[1]}-${dataExParts[0]}`
    );

    const existDividendPayment = await findTransactionWithCriteria(
      dividend.ticker,
      dataEx,
      6,
      formatNumber(dividend.unitaryValue, 6),
      userId
    );

    if (!existDividendPayment) {
      Transation.create({
        user_id: userId,
        ticker: dividend.ticker,
        price: dividend.unitaryValue,
        quantity: dividend.stocksQuantity,
        totalValue: dividend.dividendValue,
        brokerCode: 7,
        typeCode: 6,
        transationDate: dataEx,
      });
    } else {
      await existDividendPayment.update(
        {
          price: dividend.unitaryValue,
          quantity: dividend.stocksQuantity,
          totalValue: dividend.dividendValue,
          brokerCode: 7,
          typeCode: 6,
        },
        { where: { id: existDividendPayment.id } }
      );
    }
  }

  return dividendUser;
}

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
    const usersId = await getUniqueIds();

    const updatedUser = [];
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

await updateDividendsOnDatabase();
