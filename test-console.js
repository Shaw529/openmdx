const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const errors = [];
  const warnings = [];
  const infos = [];

  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') errors.push(text);
    else if (msg.type() === 'warning') warnings.push(text);
    else if (msg.type() === 'info') infos.push(text);
  });

  page.on('pageerror', err => {
    errors.push('PAGE ERROR: ' + err.message);
  });

  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(5000);

    const title = await page.title();
    const bodyText = await page.evaluate(() => document.body ? document.body.innerText.slice(0, 300) : 'no body');

    console.log('=== PAGE INFO ===');
    console.log('Title:', title);
    console.log('Body preview:', bodyText.replace(/\n/g, ' | '));
    console.log('');
    console.log('=== ERRORS (' + errors.length + ') ===');
    if (errors.length === 0) console.log('(none)');
    errors.forEach(e => console.log('ERROR:', e));
    console.log('');
    console.log('=== WARNINGS (' + warnings.length + ') ===');
    if (warnings.length === 0) console.log('(none)');
    warnings.slice(0, 5).forEach(w => console.log('WARN:', w.slice(0, 200)));
    console.log('');
    console.log('=== INFO (' + infos.length + ') ===');
    infos.slice(0, 5).forEach(i => console.log('INFO:', i.slice(0, 200)));

  } catch(e) {
    console.log('Navigation error:', e.message);
  }

  await browser.close();
})();
