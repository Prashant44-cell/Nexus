const { chromium } = require('playwright');
const path = require('path');

const out = path.join(__dirname, 'screens');

async function proxyApi(page, origin) {
  await page.route(`${origin}/api/**`, async (route) => {
    const url = new URL(route.request().url());
    await route.continue({ url: `http://127.0.0.1:8000${url.pathname.slice(4)}${url.search}` });
  });
}

async function captureClient(browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await proxyApi(page, 'http://127.0.0.1:3000');
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(out, 'client-login.png') });
  await page.getByRole('button', { name: /Sign In/ }).last().click();
  await page.getByText('Terms of Service & Identity Consent').waitFor();
  await page.locator('input[type="checkbox"]').nth(0).check();
  await page.locator('input[type="checkbox"]').nth(1).check();
  await page.getByRole('button', { name: /Accept Terms/ }).click();
  await page.getByText('Nexus Global Reserve Bank').first().waitFor();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(out, 'client-dashboard.png') });
  await page.close();
}

async function captureAdmin(browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await proxyApi(page, 'http://127.0.0.1:3001');
  await page.goto('http://127.0.0.1:3001', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(out, 'admin-login.png') });
  await page.getByLabel('Administrator ID').fill('superadmin');
  await page.getByLabel('Secure Password').fill('SuperAdmin@2026');
  await page.getByRole('button', { name: /Enter Console/ }).click();
  await page.getByText('Central Bank Governance Portal:').waitFor();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(out, 'admin-dashboard.png') });
  await page.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  await Promise.all([captureClient(browser), captureAdmin(browser)]);
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
