const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

test.describe('stassinos.xyz smoke checks', () => {
  test('all portfolio sections open through persistent navigation', async ({ page }) => {
    await page.goto('/');
    const sections = [
      ['home', 'Christopher'], ['bot', 'Experience'], ['memory', 'Certifications'],
      ['history', 'Education'], ['trajectory', 'Labs + projects'],
      ['metrics', 'Core skills'], ['console', 'Contact'],
    ];
    for (const [route, heading] of sections) {
      await page.locator(`.museum-nav a[data-route="${route}"]`).click();
      await expect(page.locator('#portfolio-page h1')).toContainText(heading);
      await expect(page.locator(`.museum-nav a[data-route="${route}"]`)).toHaveAttribute('aria-current', 'page');
      await expect(page.locator('.music-player')).toBeVisible();
    }
    await expect(page.locator('.preview-label')).toHaveCount(0);
  });

  test('mobile navigation, identity and player fit without horizontal overflow', async ({ page }) => {
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/');
      await expect(page.locator('.museum-name')).toHaveText('Christopher Stassinos');
      await expect(page.locator('.museum-nav a')).toHaveCount(7);
      const fit = await page.evaluate(() => {
        const player = document.querySelector('.music-player').getBoundingClientRect();
        const nav = [...document.querySelectorAll('.museum-nav a')].map(link => link.getBoundingClientRect());
        return document.documentElement.scrollWidth <= innerWidth + 1
          && player.left >= 0 && player.right <= innerWidth + 1
          && nav.every(rect => rect.left >= 0 && rect.right <= innerWidth + 1 && rect.height >= 44);
      });
      expect(fit).toBe(true);
      await page.locator('.museum-nav a[data-route="memory"]').click();
      await expect(page.locator('.cert-card')).toHaveCount(4);
    }
  });

  test('single music selection waits for Play and persists through navigation', async ({ page }) => {
    await page.goto('/');
    const music = page.locator('.music-player');
    await expect(music.locator('[data-track-title]')).toContainText('Local Technology Life');
    await expect(music.locator('[data-track-state]')).toHaveText('Paused');
    await expect(music.locator('iframe')).toHaveCount(0);
    await expect(music.locator('.music-player__heading a')).toHaveAttribute('href', 'https://www.youtube.com/watch?v=SXmx8AI1Hfo');
    await expect(music.locator('[data-music-prev], [data-music-next]')).toHaveCount(0);
    await music.getByRole('button', { name: 'Expand', exact: true }).click();
    await expect(music.locator('#music-video')).toBeVisible();
    await page.locator('.museum-nav a[data-route="bot"]').click();
    await expect(music.locator('#music-video')).toBeVisible();
    await expect(music.locator('[data-track-state]')).toHaveText('Paused');
  });

  test('project briefs open inside the portfolio and retain their content', async ({ page }) => {
    await page.goto('/#/trajectory');
    await page.locator('a[href="#/trajectory/alpaca-gpu-trading-bot"]').click();
    await expect(page.locator('.project-brief')).toContainText('Alpaca');
    await expect(page.locator('.museum-nav a[data-route="trajectory"]')).toHaveAttribute('aria-current', 'page');
    await page.getByRole('link', { name: 'All projects' }).click();
    await expect(page.locator('#portfolio-page h1')).toContainText('Labs + projects');
    await expect(page.locator('.project-records > article')).toHaveCount(3);
  });

  test('MSP experience and the CV describe the same work', async ({ page }) => {
    await page.goto('/#/bot');
    const role = page.locator('.timeline-item').filter({ hasText: 'MSP Support Engineer' });
    await expect(role).toContainText('724IT · San Diego');
    for (const tool of ['Huntress', 'Microsoft Defender XDR', 'Entra ID', 'Intune', 'ConnectWise PSA', 'VLANs']) {
      await expect(role).toContainText(tool);
    }
    const bullets = await role.locator('.timeline-points li').allInnerTexts();
    const cv = fs.readFileSync(path.join(__dirname, '..', 'build_cv.py'), 'utf8');
    expect(bullets).toHaveLength(3);
    for (const bullet of bullets) expect(cv).toContain(JSON.stringify(bullet));
  });

  test('credentials contain four earned certifications and no planned targets', async ({ page }) => {
    await page.goto('/#/memory');
    await expect(page.locator('.cert-card')).toHaveCount(4);
    await expect(page.locator('.compact-records .timeline-item')).toHaveCount(4);
    for (const name of ['CompTIA Security+', 'AWS Cloud Practitioner', 'IBM Cybersecurity Analyst', 'Palo Alto Networks Associate']) {
      await expect(page.locator('.cert-grid')).toContainText(name);
    }
    await expect(page.locator('body')).not.toContainText('Pearson VUE / OnVUE');
    await expect(page.locator('.cert-targets, .timeline-item.is-target')).toHaveCount(0);
  });

  test('the ASCII moon follows Home and respects still mode', async ({ page }) => {
    await page.goto('/?motion=still#/home');
    const moon = page.locator('#museum-lunar-detail');
    await expect(moon).toHaveAttribute('data-detail', 'ascii-crescent');
    await expect(moon).toHaveCSS('opacity', '1');
    await page.locator('.museum-nav a[data-route="bot"]').click();
    await expect(moon).toHaveCSS('opacity', '0');
    await page.locator('.museum-nav a[data-route="home"]').click();
    await expect(moon).toHaveCSS('opacity', '1');
  });
});
