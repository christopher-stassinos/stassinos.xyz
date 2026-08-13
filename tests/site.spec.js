const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

async function clearPlayerState(page) {
  await page.addInitScript(() => {
    try { localStorage.removeItem('stassinos-site-player-state-v1'); } catch (e) {}
  });
}

test.describe('stassinos.xyz smoke checks', () => {
  test('mobile layout is single-column with no horizontal overflow', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
    });
    const page = await context.newPage();
    await clearPlayerState(page);
    await page.goto('/index.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);

    const state = await page.evaluate(() => {
      const hero = document.querySelector('.hero');
      const player = document.getElementById('artifact-player');
      const bodyWidth = Math.max(document.body.scrollWidth, document.documentElement.scrollWidth);
      const viewportWidth = window.innerWidth;
      const playerRect = player?.getBoundingClientRect();
      return {
        heroColumns: hero ? getComputedStyle(hero).gridTemplateColumns : '',
        overflowX: bodyWidth > viewportWidth + 1,
        viewportWidth,
        scrollWidth: bodyWidth,
        playerFits: !!playerRect && playerRect.left >= 0 && playerRect.right <= viewportWidth
      };
    });

    expect(state.overflowX).toBe(false);
    expect(state.playerFits).toBe(true);
    expect(state.heroColumns).toBe('370px');

    await context.close();
  });

  test('music player responds to play, next, and previous controls', async ({ page }) => {
    await clearPlayerState(page);
    await page.goto('/index.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);

    const track = page.locator('#player-track');
    const sub = page.locator('#player-sub');

    const initialTrack = (await track.innerText()).trim();
    await expect(sub).toContainText('02 / 11');

    await page.locator('#player-toggle').click();
    await expect(sub).toContainText(/Now Playing/i);

    await page.locator('#player-next').click();
    await page.waitForTimeout(700);
    const afterNext = (await track.innerText()).trim();
    await expect(afterNext).not.toBe(initialTrack);
    await expect(sub).toContainText('03 / 11');

    await page.locator('#player-prev').click();
    await page.waitForTimeout(700);
    const afterPrev = (await track.innerText()).trim();
    expect(afterPrev).toBe(initialTrack);
    await expect(sub).toContainText('02 / 11');
  });

  test('MSP experience highlights concrete security and infrastructure tools', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'networkidle' });

    const mspRole = page.locator('.timeline-item').filter({ hasText: 'MSP Support Engineer' });
    await expect(mspRole).toContainText('724IT · San Diego');
    await expect(page.locator('body')).not.toContainText('Southern California');

    for (const capability of [
      'Huntress',
      'Microsoft Defender XDR',
      'Microsoft 365',
      'Entra ID',
      'Intune',
      'Active Directory',
      'Conditional Access',
      'ConnectWise PSA',
      'RMM',
      'DNS',
      'DHCP',
      'VLANs',
      'VPNs',
      'firewalls'
    ]) {
      await expect(mspRole).toContainText(capability);
    }

    const mspBullets = await mspRole.locator('.timeline-points li').allInnerTexts();
    const cvSource = fs.readFileSync(path.join(__dirname, '..', 'build_cv.py'), 'utf8');

    expect(mspBullets).toHaveLength(3);
    expect(cvSource).not.toContain('Southern California');
    for (const bullet of mspBullets) {
      expect(cvSource).toContain(JSON.stringify(bullet));
    }
  });
});
