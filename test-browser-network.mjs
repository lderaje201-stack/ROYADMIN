import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('response', async (response) => {
    if (response.status() === 400) {
      console.log(`[400 ERROR] URL: ${response.url()}`);
      try {
          const text = await response.text();
          console.log(`[400 ERROR] BODY: ${text}`);
      } catch(e) {}
    }
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', 'admin_test@royaldental.com');
  await page.type('input[type="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  
  await new Promise(r => setTimeout(r, 4000));
  await browser.close();
})();
