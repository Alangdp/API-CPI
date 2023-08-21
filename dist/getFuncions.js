const __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
/*eslint-disable  */
import axios from 'axios';
import cheerio from 'cheerio';
import Utilities from './Utilities';
class TickerFetcher {
  constructor(ticker) {
    this.ticker = ticker;
  }
  initialize() {
    return __awaiter(this, void 0, void 0, function* () {
      const htmlPage = yield this.getHtmlPage();
      this.Utility = new Utilities(htmlPage);
    });
  }
  getHtmlPage() {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        const options = {
          method: 'GET',
          url: `https://statusinvest.com.br/acoes/${this.ticker}`,
          headers: {
            'user-agent': 'CPI/V1',
            'content-length': 0,
          },
        };
        return (yield axios.request(options)).data;
      } catch (err) {
        throw new Error('Error: ' + err.message);
      }
    });
  }
  getBasicInfo() {
    return __awaiter(this, void 0, void 0, function* () {
      if (!this.Utility) {
        throw new Error('Utility not initialized.');
      }
      const selectors = {
        totalStocksInCirculation:
          'div[title="Total de papéis disponíveis para negociação"] div strong',
        freeFloat:
          '#company-section > div:nth-child(1) > div > div.top-info.info-3.sm.d-flex.justify-between.mb-3 > div:nth-child(11) > div > div > strong',
        netEquity:
          '#company-section > div:nth-child(1) > div > div.top-info.info-3.sm.d-flex.justify-between.mb-3 > div:nth-child(1) > div > div > strong',
        marketValue:
          '#company-section > div:nth-child(1) > div > div.top-info.info-3.sm.d-flex.justify-between.mb-3 > div:nth-child(7) > div > div > strong',
        price:
          '#main-2 > div:nth-child(4) > div > div.pb-3.pb-md-5 > div > div:nth-child(2) > div > div:nth-child(1) > strong',
        porcentLast12Days:
          '#main-2 > div:nth-child(4) > div > div.pb-3.pb-md-5 > div > div:nth-child(5) > div > div:nth-child(1) > strong',
        dividendPorcent:
          '#main-2 > div:nth-child(4) > div > div.pb-3.pb-md-5 > div > div:nth-child(4) > div > div:nth-child(1) > strong',
        name: 'title',
        LPA: '#indicators-section > div.indicator-today-container > div > div:nth-child(1) > div > div:nth-child(11) > div > div > strong',
        VPA: '#indicators-section > div.indicator-today-container > div > div:nth-child(1) > div > div:nth-child(9) > div > div > strong',
      };
      const totalStocksInCirculation = this.Utility.extractText(
        selectors.totalStocksInCirculation
      );
      const freeFloat = this.Utility.extractNumber(selectors.freeFloat);
      const netEquity = this.Utility.extractText(selectors.netEquity);
      const marketValue = this.Utility.extractText(selectors.marketValue);
      const price = this.Utility.extractNumber(selectors.price);
      const porcentLast12Days = this.Utility.extractNumber(
        selectors.porcentLast12Days
      );
      const dividendPorcent = this.Utility.extractNumber(
        selectors.dividendPorcent
      );
      const dividiendPorcentInDecimal = dividendPorcent / 100;
      const name = this.Utility.extractText(selectors.name);
      const LPA = this.Utility.extractNumber(selectors.LPA);
      const VPA = this.Utility.extractNumber(selectors.VPA);
      const data = {
        // dividendInfo: getDividendInfoFromHTML($),
        // rebuyStock: getStockrebuy($),
        name,
        price,
        dividendPorcent,
        dividiendPorcentInDecimal,
        porcentLast12Days,
        totalStocksInCirculation,
        freeFloat,
        netEquity,
        marketValue,
        LPA,
        VPA,
      };
      return data;
    });
  }
  getAllTickers() {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        const options = {
          method: 'GET',
          url: `https://www.fundamentus.com.br/resultado.php`,
          headers: {
            'user-agent': 'CPI/V1',
            'content-length': 0,
          },
        };
        const response = yield axios.request(options);
        const $ = cheerio.load(response.data);
        const tickers = $('td span a')
          .map((index, element) => $(element).text())
          .get();
        return tickers;
      } catch (error) {
        if (error.response && error.response.status === 404) {
          throw new Error('Invalid Ticker');
        }
        throw new Error('Error fetching tickers');
      }
    });
  }
  getStockrebuy() {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
      const selectors = {
        table: '#movements-section > div > div.buyback.card > div.card-body',
        types:
          '.w-100.w-lg-50.mt-2.mb-3.mb-sm-2.d-xs-flex.justify-center.align-items-center',
        status:
          '.w-100.w-lg-50.d-flex.flex-wrap.justify-around.align-items-center',
      };
      const rebuyInfo = [];
      const tempObject = {
        status: null,
        approvedDate: null,
        startDate: null,
        endDate: null,
        stocksQuantity: null,
        stockType: null,
      };
      const tableRows =
        (_a = this.Utility) === null || _a === void 0
          ? void 0
          : _a.extractElement(selectors.table);
      for (const tableRow of tableRows) {
        const rowContent = cheerio(tableRow).html();
        const rows = cheerio.load(rowContent, {});
        const status =
          (_b = this.Utility) === null || _b === void 0
            ? void 0
            : _b.extractElement(selectors.status);
        const types =
          (_c = this.Utility) === null || _c === void 0
            ? void 0
            : _c.extractElement(selectors.types);
        if (status === undefined || types === undefined) return [];
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
          const linesStatus = statusTextArray[i].trim().split('\n');
          const linesInfo = infosText[i].trim().split('\n');
          const tempObject = {
            status: linesStatus[0],
            approvedDate: linesStatus[5].replace('APROVADO EM\n', ''),
            startDate: linesStatus[9].replace('DATA DE INÍCIO\n', ''),
            endDate: linesStatus[13].replace('DATA DE FIM\n', ''),
            stocksQuantity: linesInfo[5],
            stockType: linesInfo[1],
          };
          rebuyInfo.push(tempObject);
        }
      }
      return rebuyInfo;
    });
  }
  getDividendInfo() {
    var _a, _b, _c, _d, _e;
    return __awaiter(this, void 0, void 0, function* () {
      const selectors = {
        tableRows:
          '#earning-section > div.list > div > div:nth-child(2) > table > tbody',
        price:
          '#main-2 > div:nth-child(4) > div > div.pb-3.pb-md-5 > div > div:nth-child(2) > div > div:nth-child(1) > strong',
        LPA: '#indicators-section > div.indicator-today-container > div > div:nth-child(1) > div > div:nth-child(11) > div > div > strong',
        VPA: '#indicators-section > div.indicator-today-container > div > div:nth-child(1) > div > div:nth-child(9) > div > div > strong',
        dividendPorcent:
          '#main-2 > div:nth-child(4) > div > div.pb-3.pb-md-5 > div > div:nth-child(4) > div > div:nth-child(1) > strong',
      };
      const lastDividends = [];
      const tableRows =
        (_a = this.Utility) === null || _a === void 0
          ? void 0
          : _a.extractElement(selectors.tableRows);
      tableRows.each((index, row) => {
        const values = cheerio(row)
          .find('td')
          .map((index, element) => {
            var _a;
            return (_a = this.Utility) === null || _a === void 0
              ? void 0
              : _a.extractText(element);
          })
          .toArray();
        Utilities.breakArrayIntoGroups(values, 4).map((dividendInfo) => {
          lastDividends.push({
            type: dividendInfo[0],
            dataEx: dividendInfo[1],
            dataCom: dividendInfo[2],
            value: dividendInfo[3],
          });
        });
      });
      const price =
        ((_b = this.Utility) === null || _b === void 0
          ? void 0
          : _b.extractNumber(selectors.price)) || 0;
      const LPA =
        ((_c = this.Utility) === null || _c === void 0
          ? void 0
          : _c.extractNumber(selectors.LPA)) || 0;
      const VPA =
        ((_d = this.Utility) === null || _d === void 0
          ? void 0
          : _d.extractNumber(selectors.VPA)) || 0;
      const dividendPorcent =
        ((_e = this.Utility) === null || _e === void 0
          ? void 0
          : _e.extractNumber(selectors.dividendPorcent)) || 0;
      const dividiendPorcentInDecimal = dividendPorcent / 100;
      return {
        dividends: {
          lastDividends: lastDividends,
          dividiendPorcentInDecimal,
          dividendPorcent,
        },
        bestPrice: {
          bazin: Utilities.formateNumber(
            `${price / dividiendPorcentInDecimal}`
          ),
          granham: (15 * LPA * VPA) ** 0.5,
        },
      };
    });
  }
  getPrice() {
    return __awaiter(this, void 0, void 0, function* () {
      const ticker = this.ticker;
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
        const response = yield axios.request(options);
        if (response.data[0].prices.length === 0) return null;
        const data = {
          lastPrice: response.data[0].prices.pop(),
          priceVariation: response.data[0].prices,
          currency: response.data[0].currency,
        };
        return data;
      } catch (error) {
        return null;
      }
    });
  }
  getPayout() {
    return __awaiter(this, void 0, void 0, function* () {
      const ticker = this.ticker;
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
        const payout = yield axios.request(options);
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
    });
  }
  getPassiveChart() {
    return __awaiter(this, void 0, void 0, function* () {
      const ticker = this.ticker;
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
        const response = yield axios.request(options);
        if (response.data.length === 0) return null;
        const data = response.data.map((item) => {
          return {
            year: item.year || null,
            totalAssets: item.ativoTotal || null,
            totalLiabilities: item.passivoTotal || null,
            currentAssets: item.ativoCirculante || null,
            nonCurrentAssets: item.ativoNaoCirculante || null,
            currentLiabilities: item.passivoCirculante || null,
            nonCurrentLiabilities: item.passivoNaoCirculante || null,
            shareholdersEquity: item.patrimonioLiquido || null,
          };
        });
        return data;
      } catch (error) {
        return null;
      }
    });
  }
  getReports() {
    return __awaiter(this, void 0, void 0, function* () {
      const ticker = this.ticker;
      const lastFiveYears = Utilities.getLastYears(5);
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
          const response = yield axios.request(options);
          const responseInfo = response.data;
          if (!responseInfo.data) data[year] = [];
          responseInfo.data.forEach((report) => {
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
        return data;
      } catch (error) {
        return null;
      }
    });
  }
}
// const teste:TickerFetcher = new TickerFetcher("RANI3")
// await teste.initialize()
// console.log(await teste.getBasicInfo())
// console.log(await teste.getReports())
/* eslint-disable */
// export async function getActives(ticker = null) {
//   try {
//     ticker = ticker ? ticker.toUpperCase() : null;
//     if (!ticker) return null;
//     const lastFiveYears = getLastFiveYears();
//     const options = {
//       method: 'POST',
//       url: 'https://statusinvest.com.br/acao/getativos',
//       params: {
//         code: ticker,
//         type: 1,
//         range: { max: lastFiveYears[0], min: lastFiveYears.pop() },
//       },
//       headers: {
//         cookie: '_adasys=b848d786-bc93-43d6-96a6-01bb17cbc296',
//         'user-agent': 'CPI/V1',
//         'content-length': 0,
//       },
//     };
//     const actives = await axios.request(options);
//     if (actives.data.length === 0) return null;
//     const info = {};
//     const titulos = [
//       'Ativo Total - (R$)',
//       'Ativo Circulante - (R$)',
//       'Aplicações Financeiras - (R$)',
//       'Caixa e Equivalentes de Caixa - (R$)',
//       'Contas a Receber - (R$)',
//       'Estoque - (R$)',
//       'Ativo Não Circulante - (R$)',
//       'Ativo Realizável a Longo Prazo - (R$)',
//       'Investimentos - (R$)',
//       'Imobilizado - (R$)',
//       'Intangível - (R$)',
//       'Passivo Total - (R$)',
//       'Passivo Circulante - (R$)',
//       'Passivo Não Circulante - (R$)',
//       'Patrimônio Líquido Consolidado - (R$)',
//       'Capital Social Realizado - (R$)',
//       'Reserva Capital - (R$)',
//       'Reserva Lucros - (R$)',
//       'Participação dos Não Controladores',
//     ];
//     let lastTitle = null;
//     let lastDate = null;
//     let cabeçalhoList = [];
//     const data = actives.data.data;
//     for (let i = 0; i < data.grid[0].columns.length; i++) {
//       cabeçalhoList.push(data.grid[0].columns[i].value);
//       const dataFormated = {
//         date: data.grid[0].columns[i].value,
//         title: data.grid[1].columns[i].name || data.grid[1].columns[i].title,
//         value: data.grid[1].columns[i].value,
//       };
//       if (titulos.includes(dataFormated.date)) {
//         lastTitle = dataFormated.date;
//         info[lastTitle] = {};
//       }
//       if (/^[1-4]T\d{4}$/.test(dataFormated.date)) {
//         lastDate = dataFormated.date;
//         info[lastTitle].lastDate = {
//           AV: null,
//           AH: null,
//           value: null,
//         };
//         info[lastTitle].lastDate.value = dataFormated.value;
//       }
//       if (dataFormated.date === 'AH' || dataFormated.date === 'AV') {
//         info[lastDate][dataFormated.date] = dataFormated.value;
//       }
//     }
//     saveJSONToFile(info, 'TERSTE.json');
//     return info;
//   } catch (error) {
//     return null;
//   }
// }
// Funçao getActives
// Parado desde 17/07/2023
// Ultima coisa que foi feita
// Objetivo e separar o retorno da tabela em trimestres com dados abaixo
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
