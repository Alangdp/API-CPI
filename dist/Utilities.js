import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
class Utilities {
  constructor(html) {
    if (html) this.$ = cheerio.load(html);
  }

  static getLastYears(x = 0) {
    const actualYear = new Date();
    const lastYears = [];
    for (const index of Utilities.range(x)) {
      lastYears.push(actualYear.getFullYear() - index);
    }
    return lastYears;
  }

  static range(n) {
    return [...Array(n).keys()];
  }

  static breakArrayIntoGroups(arr, groupSize) {
    const result = [];
    for (let i = 0; i < arr.length; i += groupSize) {
      const group = arr.slice(i, i + groupSize);
      result.push(group);
    }
    return result;
  }

  static getLastFiveYears() {
    const actualYear = new Date();
    const lastFiveYears = [];
    for (const index of Utilities.range(5)) {
      lastFiveYears.push(actualYear.getFullYear() - index);
    }
    return lastFiveYears;
  }

  static formateNumber(stringToFormat) {
    stringToFormat = stringToFormat.replace(/[^\d,.]/g, '');
    stringToFormat = stringToFormat.replace(',', '.');
    try {
      return Number(stringToFormat);
    } catch (err) {
      throw new Error('Invalid String');
    }
  }

  static readJSONFromFile(filename) {
    const absolutePath = path.resolve(__dirname, '..', 'json', filename);
    try {
      const jsonData = fs.readFileSync(absolutePath, 'utf8');
      return JSON.parse(jsonData);
    } catch (err) {
      console.error('Erro ao ler o arquivo JSON:', err);
      return null;
    }
  }

  static saveJSONToFile(jsonData, filename) {
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
        }
      }
    );
  }

  extractText(selector) {
    const element = this.$(selector).text();
    if (!element) return 'null';
    return element;
  }

  extractElement(selector) {
    const element = this.$(selector);
    return element;
  }

  extractNumber(selector) {
    return Utilities.formateNumber(this.extractText(selector));
  }
}
export default Utilities;
