import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });
  
  page.on('pageerror', err => {
    console.log(`[BROWSER PAGE ERROR]: ${err.toString()}`);
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  // Wait a few seconds to see what happens
  await new Promise(r => setTimeout(r, 5000));
  
  await browser.close();
})();
