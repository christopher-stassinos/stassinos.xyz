const { test, expect } = require('@playwright/test');

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

    const sub = page.locator('#player-sub');

    const readPlayerState = async () => page.evaluate(() => {
      const trackText = document.querySelector('#player-track')?.textContent?.trim() || '';
      const subText = document.querySelector('#player-sub')?.textContent?.trim() || '';
      const match = subText.match(/(\d+)\s*\/\s*(\d+)/);
      return {
        trackText,
        subText,
        current: match ? Number(match[1]) : null,
        total: match ? Number(match[2]) : null
      };
    });

    const initial = await readPlayerState();
    expect(initial.total).not.toBeNull();
    expect(initial.total).toBeGreaterThanOrEqual(1);
    expect(initial.current).not.toBeNull();

    await page.locator('#player-toggle').click();
    await expect(sub).toContainText(/Now Playing/i);

    await page.locator('#player-next').click();
    await page.waitForTimeout(1200);
    const afterNext = await readPlayerState();
    expect(afterNext.total).toBe(initial.total);
    expect(afterNext.trackText.length).toBeGreaterThan(0);
    if ((initial.total || 0) > 1) {
      expect(afterNext.trackText).not.toBe(initial.trackText);
      expect(afterNext.current).not.toBe(initial.current);
    }

    await page.locator('#player-prev').click();
    await page.waitForTimeout(1200);
    const afterPrev = await readPlayerState();
    expect(afterPrev.total).toBe(initial.total);
    expect(afterPrev.trackText.length).toBeGreaterThan(0);
    if ((initial.total || 0) > 1) {
      expect(afterPrev.trackText).toBe(initial.trackText);
      expect(afterPrev.current).toBe(initial.current);
    }
  });
});
