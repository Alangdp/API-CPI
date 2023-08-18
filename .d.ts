// cheerio.d.ts
import cheerio from 'cheerio';

declare global {
  const $: cheerio.CheerioAPI;
}
