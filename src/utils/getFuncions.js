/*eslint-disable  */
import axios from 'axios';
import cheerio from 'cheerio';

import fs, { stat } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function readJSONFromFile(filename) {
  const absolutePath = path.resolve(__dirname, '..', 'json', filename);
  try {
    const jsonData = fs.readFileSync(absolutePath, 'utf8');
    return JSON.parse(jsonData);
  } catch (err) {
    console.error('Erro ao ler o arquivo JSON:', err);
    return null;
  }
}

function formateNumber(stringToFormat = null) {
  try {
    if (typeof stringToFormat !== 'string') throw new Error('Invalid String');
  } catch (err) {
    stringToFormat = String(stringToFormat);
  }

  stringToFormat = stringToFormat.replace(/[^\d,.]/g, '');
  stringToFormat = stringToFormat.replace(',', '.');

  try {
    return Number(stringToFormat).toFixed(2);
  } catch (err) {
    return stringToFormat;
  }
}

const isAlpha = (character) => {
  return /^[A-Z]$/i.test(character);
};

export function saveJSONToFile(jsonData, filename) {
  const absolutePath = path.resolve(__dirname, '..', 'json', filename);
  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }

  fs.writeFile(
    absolutePath,
    JSON.stringify(jsonData, null, 2),
    'utf8',
    (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('Arquivo salvo com sucesso!');
    }
  );
}

const range = (n) => [...Array(n).keys()];

export const getLastFiveYears = () => {
  const actualYear = new Date();
  const lastFiveYears = [];

  for (let index of range(5)) {
    lastFiveYears.push(actualYear.getFullYear() - index);
  }

  return lastFiveYears;
};

// Funcoes de get

export async function getAllTickers() {
  try {
    const options = {
      method: 'GET',
      url: `https://www.fundamentus.com.br/resultado.php`,
      headers: {
        'user-agent': 'CPI/V1',
        'content-length': 0,
      },
    };

    const info = await axios.request(options);

    const $ = cheerio.load(info.data);
    const links = $('td span a')
      .map((index, element) => $(element).text())
      .get();

    return links;
  } catch (error) {
    if (error.response.status === 404) {
      throw new Error('Invalid Ticker');
    }
  }
}

export async function saveTickerJson() {
  saveJSONToFile(await getAllTickers(), 'tickers.json');
}

function breakArrayIntoGroups(arr, groupSize) {
  const result = [];
  for (let i = 0; i < arr.length; i += groupSize) {
    const group = arr.slice(i, i + groupSize);
    result.push(group);
  }
  return result;
}

export async function getStockrebuy(cherrioMy) {
  const rebuyInfo = [];

  const tempObject = {
    status: null,
    approvedDate: null,
    startDate: null,
    endDate: null,
    stocksQuantity: null,
    stockType: null,
  };

  const tableRows = cherrioMy(
    '#movements-section > div > div.buyback.card > div.card-body'
  );

  for (const tableRow of tableRows) {
    const rowContent = cheerio(tableRow).html();
    const rows = cheerio.load(rowContent);

    const status = rows(
      '.w-100.w-lg-50.d-flex.flex-wrap.justify-around.align-items-center'
    );
    const types = rows(
      '.w-100.w-lg-50.mt-2.mb-3.mb-sm-2.d-xs-flex.justify-center.align-items-center'
    );

    const statusTextArray = status
      .map((index, element) => {
        return rows(element).text();
      })
      .get();

    const infosText = types
      .map((index, element) => {
        return rows(element).text();
      })
      .get();

    for (let i = 0; i < statusTextArray.length; i++) {
      const tempObject = {};
      const linesStatus = statusTextArray[i].trim().split('\n');
      tempObject.status = linesStatus[0];
      tempObject.approvedDate = linesStatus[5].replace('APROVADO EM\n', '');
      tempObject.startDate = linesStatus[9].replace('DATA DE INÍCIO\n', '');
      tempObject.endDate = linesStatus[13].replace('DATA DE FIM\n', '');

      const linesInfo = infosText[i].trim().split('\n');
      tempObject.stocksQuantity = linesInfo[5];
      tempObject.stockType = linesInfo[1];

      rebuyInfo.push(tempObject);
    }
  }

  return rebuyInfo;
}

function getDividendInfoFromHTML(cherrio = null) {
  const lastDividends = [];

  cherrio = cherrio ? cherrio : null;
  const tableRows = cherrio(
    '#earning-section > div.list > div > div:nth-child(2) > table > tbody'
  );

  tableRows.each((index, row) => {
    const values = cherrio(row)
      .find('td')
      .map((index, element) => cherrio(element).text())
      .toArray();

    breakArrayIntoGroups(values, 4).map((dividendInfo) => {
      lastDividends.push({
        type: dividendInfo[0],
        dataEx: dividendInfo[1],
        dataCom: dividendInfo[2],
        value: dividendInfo[3],
      });
    });
  });

  const price = formateNumber(
    cherrio(
      '#main-2 > div:nth-child(4) > div > div.pb-3.pb-md-5 > div > div:nth-child(2) > div > div:nth-child(1) > strong'
    ).text()
  );

  const dividiendPorcentInDecimal =
    formateNumber(
      cherrio(
        '#main-2 > div:nth-child(4) > div > div.pb-3.pb-md-5 > div > div:nth-child(5) > div > div:nth-child(1) > strong'
      ).text()
    ) / 100;

  const LPA = formateNumber(
    cherrio(
      '#indicators-section > div.indicator-today-container > div > div:nth-child(1) > div > div:nth-child(11) > div > div > strong'
    ).text()
  );

  const VPA = formateNumber(
    cherrio(
      '#indicators-section > div.indicator-today-container > div > div:nth-child(1) > div > div:nth-child(9) > div > div > strong'
    ).text()
  );

  return {
    dividends: {
      lastDividends: lastDividends,
      dividiendPorcentInDecimal,
      dividiendPorcent: dividiendPorcentInDecimal * 100,
    },

    bestPrice: {
      bazin: formateNumber(price / dividiendPorcentInDecimal),
      granham: (15 * LPA * VPA) ** 0.5,
    },
  };
}

export async function getBasicInfo(ticker = null) {
  ticker = ticker ? ticker.toUpperCase() : null;

  try {
    const options = {
      method: 'GET',
      url: `https://statusinvest.com.br/acoes/${ticker}`,
      headers: {
        'user-agent': 'CPI/V1',
        'content-length': 0,
      },
    };

    const info = await axios.request(options);

    const $ = cheerio.load(info.data);

    const totalStocksInCirculation = $(
      'div[title="Total de papéis disponíveis para negociação"] div strong'
    ).text();

    const freeFloat = formateNumber(
      $(
        '#company-section > div:nth-child(1) > div > div.top-info.info-3.sm.d-flex.justify-between.mb-3 > div:nth-child(11) > div > div > strong'
      ).text()
    );

    const netEquity = $(
      '#company-section > div:nth-child(1) > div > div.top-info.info-3.sm.d-flex.justify-between.mb-3 > div:nth-child(1) > div > div > strong'
    ).text();

    const marketValue = $(
      '#company-section > div:nth-child(1) > div > div.top-info.info-3.sm.d-flex.justify-between.mb-3 > div:nth-child(7) > div > div > strong'
    ).text();

    const price = formateNumber(
      $(
        '#main-2 > div:nth-child(4) > div > div.pb-3.pb-md-5 > div > div:nth-child(2) > div > div:nth-child(1) > strong'
      ).text()
    );

    const dividiendPorcentInDecimal = (
      formateNumber(
        $(
          '#main-2 > div:nth-child(4) > div > div.pb-3.pb-md-5 > div > div:nth-child(5) > div > div:nth-child(1) > strong'
        ).text()
      ) / 100
    ).toFixed(2);

    const data = {
      dividendInfo: getDividendInfoFromHTML($),
      rebuyStock: getStockrebuy($),
      name: $('title').text(),
      totalStocksInCirculation,
      freeFloat,
      netEquity,
      marketValue,
    };

    return data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new Error('Invalid Ticker');
    }
    console.log(error);
    throw new Error('Error in Request');
  }
}

export async function getPrice(ticker = null) {
  ticker = ticker ? ticker.toUpperCase() : null;

  try {
    const options = {
      method: 'POST',
      url: 'https://statusinvest.com.br/acao/tickerprice',
      params: { ticker, type: 1, 'currences[]': '1' },
      headers: {
        cookie: '_adasys=b848d786-bc93-43d6-96a6-01bb17cbc296',
        'user-agent': 'CPI/V1',
        'content-length': 0,
      },
    };

    const price = await axios.request(options);
    if (price.data[0].prices.length === 0) return null;

    const data = {
      lastPrice: price.data[0].prices.pop(),
      priceVariation: price.data[0].prices,
      currency: price.data[0].currency,
    };

    return data;
  } catch (error) {
    return null;
  }
}

export async function getPayout(ticker = null) {
  ticker = ticker ? ticker.toUpperCase() : null;
  if (!ticker) return null;

  try {
    const options = {
      method: 'POST',
      url: 'https://statusinvest.com.br/acao/payoutresult',
      params: { code: ticker, type: 1 },
      headers: {
        cookie: '_adasys=b848d786-bc93-43d6-96a6-01bb17cbc296',
        'user-agent': 'CPI/V1',
        'content-length': 0,
      },
    };

    const payout = await axios.request(options);
    if (!payout.data) return null;

    const data = {
      actual: payout.data.actual,
      average: payout.data.average,
      minValue: payout.data.minValue,
      maxValue: payout.data.maxValue,
      currency: payout.data.currency,
      chart: payout.data.chart,
    };

    return data;
  } catch (error) {
    return null;
  }
}

export async function getPassiveChart(ticker = null) {
  ticker = ticker ? ticker.toUpperCase() : null;
  if (!ticker) return null;

  try {
    const options = {
      method: 'POST',
      url: 'https://statusinvest.com.br/acao/getbsactivepassivechart',
      params: { code: ticker, type: 1 },
      headers: {
        cookie: '_adasys=b848d786-bc93-43d6-96a6-01bb17cbc296',
        'user-agent': 'CPI/V1',
        'content-length': 0,
      },
    };

    const balance = await axios.request(options);
    if (balance.data.length === 0) return null;

    const data = balance.data.map((item) => {
      return {
        year: item.year,
        totalAssets: item.ativoTotal,
        totalLiabilities: item.passivoTotal,
        currentAssets: item.ativoCirculante,
        nonCurrentAssets: item.ativoNaoCirculante,
        currentLiabilities: item.passivoCirculante,
        nonCurrentLiabilities: item.passivoNaoCirculante,
        shareholdersEquity: item.patrimonioLiquido,
      };
    });

    return data;
  } catch (error) {
    return null;
  }
}

export async function getReports(ticker = null) {
  ticker = ticker ? ticker.toUpperCase() : null;
  if (!ticker) return null;

  const lastFiveYears = getLastFiveYears();
  const data = {};
  const variavelLEGAL = [];

  try {
    for (const year of lastFiveYears) {
      const tempData = [];

      const options = {
        method: 'POST',
        url: 'https://statusinvest.com.br/acao/getassetreports',
        params: { code: ticker, year: year },
        headers: {
          cookie: '_adasys=b848d786-bc93-43d6-96a6-01bb17cbc296',
          'user-agent': 'CPI/V1',
          'content-length': 0,
        },
      };

      const reports = await axios.request(options);
      if (!reports.data.data) data[year] = null;

      reports.data.data.forEach((report) => {
        if (report.tipo === undefined) report.tipo = ' ';
        const type = (report.tipo = report.tipo.trim()
          ? report.tipo
          : report.especie);

        tempData.push({
          yearReport: report.year,
          date: report.dataReferencia_F,
          type,
          subject: report.assunto,
          linkPDF: report.linkPdf,
        });
      });

      data[year] = tempData;
    }

    saveJSONToFile(data, 'reports.json');

    return data;
  } catch (error) {
    return null;
  }
}

export async function getActives(ticker = null) {
  try {
    ticker = ticker ? ticker.toUpperCase() : null;
    if (!ticker) return null;

    const lastFiveYears = getLastFiveYears();

    const options = {
      method: 'POST',
      url: 'https://statusinvest.com.br/acao/getativos',
      params: {
        code: ticker,
        type: 1,
        range: { max: lastFiveYears[0], min: lastFiveYears.pop() },
      },
      headers: {
        cookie: '_adasys=b848d786-bc93-43d6-96a6-01bb17cbc296',
        'user-agent': 'CPI/V1',
        'content-length': 0,
      },
    };

    const actives = await axios.request(options);
    if (actives.data.length === 0) return null;

    const info = {};
    const titulos = [
      'Ativo Total - (R$)',
      'Ativo Circulante - (R$)',
      'Aplicações Financeiras - (R$)',
      'Caixa e Equivalentes de Caixa - (R$)',
      'Contas a Receber - (R$)',
      'Estoque - (R$)',
      'Ativo Não Circulante - (R$)',
      'Ativo Realizável a Longo Prazo - (R$)',
      'Investimentos - (R$)',
      'Imobilizado - (R$)',
      'Intangível - (R$)',
      'Passivo Total - (R$)',
      'Passivo Circulante - (R$)',
      'Passivo Não Circulante - (R$)',
      'Patrimônio Líquido Consolidado - (R$)',
      'Capital Social Realizado - (R$)',
      'Reserva Capital - (R$)',
      'Reserva Lucros - (R$)',
      'Participação dos Não Controladores',
    ];

    let lastTitle = null;
    let lastDate = null;

    let cabeçalhoList = [];

    for (let i = 0; i < actives.data.data.grid[0].columns.length; i++) {
      cabeçalhoList.push(actives.data.data.grid[0].columns[i].value);

      const dataFormated = {
        date: actives.data.data.grid[0].columns[i].value,
        title:
          actives.data.data.grid[1].columns[i].name ||
          actives.data.data.grid[1].columns[i].title,
        value: actives.data.data.grid[1].columns[i].value,
      };

      if (titulos.includes(dataFormated.date)) {
        lastTitle = dataFormated.date;
        info[lastTitle] = {};
      }

      if (/^[1-4]T\d{4}$/.test(dataFormated.date)) {
        lastDate = dataFormated.date;
        info[lastTitle].lastDate = {
          AV: null,
          AH: null,
          value: null,
        };
        info[lastTitle].lastDate.value = dataFormated.value;
      }

      if (dataFormated.date === 'AH' || dataFormated.date === 'AV') {
        info[lastDate][dataFormated.date] = dataFormated.value;
      }
    }

    saveJSONToFile(info, 'TERSTE.json');
    return info;
  } catch (error) {
    return null;
  }
}

// Parado desde 17/07/2023
// Ultima coisa que foi feita
// Objetivo e separar o retorna da tabela em trimestres com dados abaixo
// Nome do titulo vem no indice 0 na variavel title geralmente

/*
    const titulos = [
      'Ativo Total - (R$)',
      'Ativo Circulante - (R$)',
      'Aplicações Financeiras - (R$)',
      'Caixa e Equivalentes de Caixa - (R$)',
      'Contas a Receber - (R$)',
      'Estoque - (R$)',
      'Ativo Não Circulante - (R$)',
      'Ativo Realizável a Longo Prazo - (R$)',
      'Investimentos - (R$)',
      'Imobilizado - (R$)',
      'Intangível - (R$)',
      'Passivo Total - (R$)',
      'Passivo Circulante - (R$)',
      'Passivo Não Circulante - (R$)',
      'Patrimônio Líquido Consolidado - (R$)',
      'Capital Social Realizado - (R$)',
      'Reserva Capital - (R$)',
      'Reserva Lucros - (R$)',
      'Participação dos Não Controladores',
    ];
*/

// console.log(await getActives('BBAS3'));
// console.log(await getBasicInfo('BBAS3'));
// console.log(await getPayout('BBAS3'));
// console.log(await getPrice('BBAS3'));
// console.log(await getReports('BBAS3'));

getBasicInfo('RANI3');
