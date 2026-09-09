import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', 'admin_test@royaldental.com');
  await page.type('input[type="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  
  await new Promise(r => setTimeout(r, 4000));
  
  console.log("Logged in, now reloading page...");
  await page.reload({ waitUntil: 'networkidle2' });
  
  await new Promise(r => setTimeout(r, 4000));
  
  const text = await page.evaluate(() => document.body.innerText);
  console.log("PAGE TEXT AFTER RELOAD:", text.substring(0, 500));
  
  await browser.close();
})();
