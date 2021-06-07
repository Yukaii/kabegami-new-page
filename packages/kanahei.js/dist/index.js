"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAll = exports.getOne = void 0;
require("cross-fetch/polyfill");
const cheerio_1 = __importDefault(require("cheerio"));
const kabegami = 'http://www.kanahei.com/kabegami/';
function parsePagesCount($) {
    const pageIndexes = $('.wp-pagenavi a.page')
        .toArray()
        .map(elem => parseInt($(elem).text(), 10));
    return Math.max.apply(null, pageIndexes);
}
function kabegamiURL(page = 1) {
    if (page == 1) {
        return kabegami;
    }
    else {
        return `${kabegami}page/${page}/`;
    }
}
async function fetchPage(url = kabegami) {
    try {
        const res = await fetch(url);
        if (res.status >= 400) {
            throw new Error('Request failed');
        }
        return await res.text();
    }
    catch (error) {
        console.error(error);
    }
}
function parseWallpapers($) {
    return $('.col-xs-6.col-sm-4.col-md-3').toArray().map(elem => {
        const wallpaper = $(elem);
        const images = wallpaper
            .find('a')
            .toArray()
            .map(elem => $(elem).attr('href'))
            // filter out calendar wallpaper
            .filter(href => !href.match(/_c.jp(e)?g$/));
        return { images };
    });
}
function getRandomWallpaper(html) {
    const $ = cheerio_1.default.load(html);
    const wallpapers = parseWallpapers($);
    const random = oneToN(wallpapers.length);
    return wallpapers[random - 1];
}
function oneToN(count) {
    return Math.floor(Math.random() * count) + 1;
}
async function fetchPageCount() {
    const html = await fetchPage(kabegami);
    const $ = cheerio_1.default.load(html);
    return parsePagesCount($);
}
async function getOne() {
    const pageCount = await fetchPageCount();
    const randomPageCount = oneToN(pageCount);
    const randomPageURL = kabegamiURL(randomPageCount);
    return getRandomWallpaper(await fetchPage(randomPageURL));
}
exports.getOne = getOne;
async function getAll() {
    const pageCount = await fetchPageCount();
    const arraysOfWallpapers = await Promise.all(Array.from({ length: pageCount }, (_, k) => k + 1).map(async (page) => {
        const pageURL = kabegamiURL(page);
        const html = await fetchPage(pageURL);
        const $ = cheerio_1.default.load(html);
        return parseWallpapers($);
    }));
    return arraysOfWallpapers.reduce((all, ws) => all.concat(ws), []);
}
exports.getAll = getAll;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsZ0NBQTZCO0FBQzdCLHNEQUE2QztBQUU3QyxNQUFNLFFBQVEsR0FBRyxrQ0FBa0MsQ0FBQTtBQU1uRCxTQUFTLGVBQWUsQ0FBRSxDQUFhO0lBQ3JDLE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQztTQUNyQixPQUFPLEVBQUU7U0FDVCxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUE7SUFFaEUsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUE7QUFDMUMsQ0FBQztBQUVELFNBQVMsV0FBVyxDQUFFLElBQUksR0FBRyxDQUFDO0lBQzVCLElBQUksSUFBSSxJQUFJLENBQUMsRUFBRTtRQUNiLE9BQU8sUUFBUSxDQUFBO0tBQ2hCO1NBQU07UUFDTCxPQUFPLEdBQUcsUUFBUSxRQUFRLElBQUksR0FBRyxDQUFBO0tBQ2xDO0FBQ0gsQ0FBQztBQUVELEtBQUssVUFBVSxTQUFTLENBQUUsR0FBRyxHQUFHLFFBQVE7SUFDdEMsSUFBSTtRQUNGLE1BQU0sR0FBRyxHQUFHLE1BQU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQzVCLElBQUksR0FBRyxDQUFDLE1BQU0sSUFBSSxHQUFHLEVBQUU7WUFDckIsTUFBTSxJQUFJLEtBQUssQ0FBRSxnQkFBZ0IsQ0FBQyxDQUFBO1NBQ25DO1FBQ0QsT0FBTyxNQUFNLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtLQUN4QjtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ2QsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQTtLQUNyQjtBQUNILENBQUM7QUFF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