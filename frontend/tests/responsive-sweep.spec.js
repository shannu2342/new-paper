import { test } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4173';
const routes = ['/', '/ap', '/other', '/special', '/epaper', '/admin/login'];
const viewports = [
  { name: 'mobile', width: 360, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 }
];

for (const vp of viewports) {
  for (const route of routes) {
    test(`${vp.name} ${route}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(`${baseURL}${route}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(600);

      const scan = async () => page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const overflow = document.documentElement.scrollWidth > vw + 1;
        const offenders = [];
        const nodes = document.body ? document.body.querySelectorAll('*') : [];
        for (const el of nodes) {
          const rect = el.getBoundingClientRect();
          if (rect.width <= 0 || rect.height <= 0) continue;
          if (rect.right > vw + 1) {
            const cls = (el.className && typeof el.className === 'string') ? `.${el.className.trim().split(/\s+/).join('.')}` : '';
            offenders.push(`${el.tagName.toLowerCase()}${cls}`);
            if (offenders.length >= 8) break;
          }
        }
        return { overflow, vw, sw: document.documentElement.scrollWidth, offenders };
      });

      const before = await scan();
      console.log(JSON.stringify({ viewport: vp.name, route, state: 'default', ...before }));

      if (vp.name === 'mobile') {
        const toggle = page.locator('.menu-toggle');
        if (await toggle.count()) {
          await toggle.first().click({ timeout: 1000 }).catch(() => {});
          await page.waitForTimeout(300);
          const afterMenu = await scan();
          console.log(JSON.stringify({ viewport: vp.name, route, state: 'menu-open', ...afterMenu }));
        }
      }

      await page.screenshot({ path: `/tmp/responsive-${vp.name}-${route.replace(/\//g, '_') || 'home'}.png`, fullPage: true });
    });
  }
}
