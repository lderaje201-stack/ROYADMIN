import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    // console.log(`[BROWSER CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', 'admin_test@royaldental.com');
  await page.type('input[type="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  
  await new Promise(r => setTimeout(r, 4000));
  
  const text = await page.evaluate(() => document.body.innerText);
  console.log("PAGE TEXT:", text.substring(0, 500));
  
  await browser.close();
})();
