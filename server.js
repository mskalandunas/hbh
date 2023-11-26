import { JSDOM } from 'jsdom';
import { config } from 'dotenv';
import sqlite from 'sqlite3';

const sqlite3 = sqlite.verbose(); 

const { BASE_URL, DB_NAME, FILTER_FOR } = config().parsed;

const requestedEndpoints = new Set([]);

const withDelay = (fn, delay) => (...args) => {
  setTimeout(() => {
    fn(...args);
  }, delay);
};

const getRandomNumber = () => Math.floor(Math.random() * (50000 - 10000 + 1) + 1000)

const fetchText = (url) => fetch(url).then(res => res.text());

const convertTextToDOM = text => (new JSDOM(text)).window.document;

const getHrefList = document =>
  Array
    .from(document.querySelectorAll('a'))
    .map(a => a.href)
    .filter(Boolean)
    .filter(href => href.startsWith(FILTER_FOR));

const runOnList = list => list.forEach(pipeline);

const pipeline = url => new Promise((resolve, reject) => {
  if (requestedEndpoints.has(url)) {
    return resolve(`URL already requested url=${url}`);
  }

  fetchText(url)
    .then((text) => {
      requestedEndpoints.add(url);

      return text;
    }, reject)
    .then(text => {
      db.run('INSERT INTO pages (id, title, html_content) VALUES (?, ?, ?)', [1, url, text]);
    
      return text;
    }, reject)
    .then(convertTextToDOM, reject)
    .then(getHrefList, reject)
    .then(withDelay(runOnList, getRandomNumber()), reject)
    .then(resolve, reject)
    .catch(reject);
});

setInterval(() => {
  console.log(`Requested endpoints size=${requestedEndpoints.size} endpoints=${
    Array
      .from(requestedEndpoints)
      .map(url => url.replace(FILTER_FOR, ''))
      .join(',\n')
  }`);
}, 10000);

const db = new sqlite3.Database(`./db.${DB_NAME}`);

db.run('CREATE TABLE IF NOT EXISTS pages (id INT, title TEXT, html_content BLOB)');

pipeline(BASE_URL).then(console.log, console.error).catch(console.error);