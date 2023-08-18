/*eslint-disable  */
import axios from 'axios';
import cheerio , { Cheerio, Element } from 'cheerio';

import fs, { stat } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Utilities {
  private $: Cheerio.Root;

  constructor(html?: string) {
    if(html) this.$ = cheerio.load(html);
  }

  static range (n: Number) : Array<number>{
    return [...Array(n).keys()]
  };

  static breakArrayIntoGroups(arr: any[], groupSize: number): Array<any> {
    const result = [];
    for (let i = 0; i < arr.length; i += groupSize) {
      const group = arr.slice(i, i + groupSize);
      result.push(group);
    }
    return result;
  }

  static getLastFiveYears () {
    const actualYear = new Date();
    const lastFiveYears = [];

    for (let index of Utilities.range(5)) {
      lastFiveYears.push(actualYear.getFullYear() - index);
    }

    return lastFiveYears;
  };

  static formateNumber(stringToFormat: string ): number {

    stringToFormat = stringToFormat.replace(/[^\d,.]/g, '');
    stringToFormat = stringToFormat.replace(',', '.');

    try {
      return Number(stringToFormat)
    } catch (err: any) {
      throw new Error('Invalid String');
    }
  }

  static readJSONFromFile(filename: string) {
    const absolutePath = path.resolve(__dirname, '..', 'json', filename);
    try {
      const jsonData = fs.readFileSync(absolutePath, 'utf8');
      return JSON.parse(jsonData);
    } catch (err) {
      console.error('Erro ao ler o arquivo JSON:', err);
      return null;
    }
  }

  static saveJSONToFile(jsonData: Array<any>, filename: string) {
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
      }
    );
  }

  extractText(selector: string): string {
    const element: string = this.$(selector).text();
    if(!element) return "null"
    return element
  }

  extractElement(selector: string): Cheerio.Element {
    const element: Cheerio.Element = this.$(selector);
    return element
  }

  extractNumber(selector: string): number {
    return Utilities.formateNumber(this.extractText(selector));
  }

}

class TickerFetcher  {
  public ticker: string
  private Utility?: Utilities;

  constructor(ticker: string) {
    this.ticker = ticker;
  }

  async initialize(): Promise<void> {
    const htmlPage: string = await this.getHtmlPage();
    this.Utility = new Utilities(htmlPage);
  }

  async getHtmlPage() {
    try {
      const options = {
        method: 'GET',
        url: `https://statusinvest.com.br/acoes/${this.ticker}`,
        headers: {
          'user-agent': 'CPI/V1',
          'content-length': 0,
        },
      };

      return (await axios.request(options)).data;
    } catch(err : any) {
      throw new Error("Error: " + err.message);
    }
  }


  async getBasicInfo() {
    if (!this.Utility) {
      throw new Error('Utility not initialized.');
    }

    const selectors = {
      totalStocksInCirculation: 'div[title="Total de papéis disponíveis para negociação"] div strong',
      freeFloat: '#company-section > div:nth-child(1) > div > div.top-info.info-3.sm.d-flex.justify-between.mb-3 > div:nth-child(11) > div > div > strong',
      netEquity: '#company-section > div:nth-child(1) > div > div.top-info.info-3.sm.d-flex.justify-between.mb-3 > div:nth-child(1) > div > div > strong',
      marketValue: '#company-section > div:nth-child(1) > div > div.top-info.info-3.sm.d-flex.justify-between.mb-3 > div:nth-child(7) > div > div > strong',
      price: '#main-2 > div:nth-child(4) > div > div.pb-3.pb-md-5 > div > div:nth-child(2) > div > div:nth-child(1) > strong',
      porcentLast12Days: '#main-2 > div:nth-child(4) > div > div.pb-3.pb-md-5 > div > div:nth-child(5) > div > div:nth-child(1) > strong',
      dividendPorcent: '#main-2 > div:nth-child(4) > div > div.pb-3.pb-md-5 > div > div:nth-child(4) > div > div:nth-child(1) > strong',
      name: 'title'
    };

    const totalStocksInCirculation: string = this.Utility.extractText(selectors.totalStocksInCirculation) ;
    const freeFloat:number = this.Utility.extractNumber(selectors.freeFloat);
    const netEquity: string = this.Utility.extractText(selectors.netEquity);
    const marketValue: string = this.Utility.extractText(selectors.marketValue);
    const price:number = this.Utility.extractNumber(selectors.price);
    const porcentLast12Days:Number = this.Utility.extractNumber(selectors.porcentLast12Days);
    const dividendPorcent:number = this.Utility.extractNumber(selectors.dividendPorcent)
    const dividiendPorcentInDecimal: Number = dividendPorcent / 100;
    const name:string = this.Utility.extractText(selectors.name);

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
    };

    return data;
  }

  async getAllTickers(): Promise<string[]> {
    try {
      const options = {
        method: 'GET',
        url: `https://www.fundamentus.com.br/resultado.php`,
        headers: {
          'user-agent': 'CPI/V1',
          'content-length': 0,
        },
      };

      const response = await axios.request(options);

      const $ = cheerio.load(response.data);
      const tickers: string[] = $('td span a').map((index, element) => $(element).text()).get();

      return tickers;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        throw new Error('Invalid Ticker');
      }

      throw new Error('Error fetching tickers');
    }
  }

  async getStockrebuy():  Promise<any[]> {
    const selectors = {
      table: '#movements-section > div > div.buyback.card > div.card-body',
      types: '.w-100.w-lg-50.mt-2.mb-3.mb-sm-2.d-xs-flex.justify-center.align-items-center',
      status: '.w-100.w-lg-50.d-flex.flex-wrap.justify-around.align-items-center'
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

    const tableRows = this.Utility?.extractElement(selectors.table);

    for (const tableRow of tableRows) {
      const rowContent:Cheerio.Root = cheerio(tableRow).html();
      const rows = cheerio.load(rowContent, {});

      const status = this.Utility?.extractElement(selectors.status);
      const types = this.Utility?.extractElement(selectors.types)
      if(status === undefined || types === undefined) return []

      const statusTextArray = status
        .map((index: number, element: Cheerio.Element) => {
          return rows(element).text();
        })
        .get();

      const infosText = types
        .map((index: number, element: Cheerio.Element) => {
          return rows(element).text();
        })
        .get();

      for (let i = 0; i < statusTextArray.length; i++) {
        const linesStatus = statusTextArray[i].trim().split('\n');
        const linesInfo = infosText[i].trim().split('\n');

        const tempObject = {
          status : linesStatus[0],
          approvedDate : linesStatus[5].replace('APROVADO EM\n', ''),
          startDate : linesStatus[9].replace('DATA DE INÍCIO\n', ''),
          endDate : linesStatus[13].replace('DATA DE FIM\n', ''),
          stocksQuantity : linesInfo[5],
          stockType : linesInfo[1],
        };

        rebuyInfo.push(tempObject);
      }
    }

    return rebuyInfo;
  }

  getDividendInfoFromHTML(): Array<any> {
    const lastDividends = [];

    const tableRows = this.Utility?.extractElement('#earning-section > div.list > div > div:nth-child(2) > table > tbody');

    tableRows.each((index: number, row: Cheerio.Element) => {
      const values = this.Utility(row)
        .find('td')
        .map((index: number, element: Cheerio.Element) => this.Utility?.extractText(element))
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

    const price = this.Utility?.extractNumber('#main-2 > div:nth-child(4) > div > div.pb-3.pb-md-5 > div > div:nth-child(2) > div > div:nth-child(1) > strong');


}

const teste:TickerFetcher = new TickerFetcher("RANI3")
await teste.initialize()
console.log(await teste.getStockrebuy())
// Funcoes de get


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

    const data = actives.data.data;

    for (let i = 0; i < data.grid[0].columns.length; i++) {
      cabeçalhoList.push(data.grid[0].columns[i].value);

      const dataFormated = {
        date: data.grid[0].columns[i].value,
        title: data.grid[1].columns[i].name || data.grid[1].columns[i].title,
        value: data.grid[1].columns[i].value,
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

// console.log(await getActives('BBAS3'));
// console.log(await getBasicInfo('BBAS3'));
// console.log(await getPayout('BBAS3'));
// console.log(await getPrice('BBAS3'));
// console.log(await getReports('BBAS3'));