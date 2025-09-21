import { Page, expect } from '@playwright/test';
import { getUiConfig } from '../config/ui-config';

export class TestPageHelper {
  constructor(private page: Page) {}

  /**
   * Navigate to the test page with proper authentication
   */
  async navigateToTestPage(): Promise<void> {
    const config = getUiConfig();

    // Set bypass secret header if available
    if (config.bypassSecret) {
      await this.page.setExtraHTTPHeaders({
        'x-vercel-protection-bypass': config.bypassSecret
      });
    }

    const testPageUrl = `${config.baseURL}/test`;
    console.log(`Navigating to test page: ${testPageUrl}`);

    await this.page.goto(testPageUrl, {
      waitUntil: 'networkidle',
      timeout: config.timeout
    });

    // Wait for the page to be fully loaded
    await expect(this.page.locator('h1')).toContainText('Integration Test Page');
  }

  /**
   * Click the API test button
   */
  async clickTestButton(): Promise<void> {
    const testButton = this.page.locator('button:has-text("Test API Connection")');
    await expect(testButton).toBeVisible();
    await expect(testButton).toBeEnabled();

    console.log('Clicking API test button...');
    await testButton.click();
  }

  /**
   * Wait for loading to complete
   */
  async waitForTestCompletion(): Promise<void> {
    // Wait for loading spinner to disappear
    const loadingButton = this.page.locator('button:has-text("Testing Connection...")');
    await expect(loadingButton).not.toBeVisible({ timeout: 30000 });

    // Ensure the original button is back
    const testButton = this.page.locator('button:has-text("Test API Connection")');
    await expect(testButton).toBeVisible();
  }

  /**
   * Check if test succeeded (green success card is visible)
   */
  async hasSuccessResult(): Promise<boolean> {
    try {
      const successCard = this.page.locator('.border-green-200.bg-green-50');
      await expect(successCard).toBeVisible({ timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if test failed (red error card is visible)
   */
  async hasErrorResult(): Promise<boolean> {
    try {
      const errorCard = this.page.locator('.border-red-200.bg-red-50');
      await expect(errorCard).toBeVisible({ timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get error message if test failed
   */
  async getErrorMessage(): Promise<string | null> {
    try {
      const errorCard = this.page.locator('.border-red-200.bg-red-50');
      const errorText = errorCard.locator('p.text-red-600');
      return await errorText.textContent();
    } catch {
      return null;
    }
  }

  /**
   * Get success data items count
   */
  async getSuccessItemsCount(): Promise<number> {
    try {
      const successCard = this.page.locator('.border-green-200.bg-green-50');
      const itemElements = successCard.locator('.bg-white.rounded-lg.border');
      return await itemElements.count();
    } catch {
      return 0;
    }
  }

  /**
   * Verify API integration details are shown
   */
  async verifyIntegrationDetails(): Promise<void> {
    // Check integration details card
    const detailsCard = this.page.locator('h3:has-text("Integration Details")').locator('..');

    await expect(detailsCard.locator('text=Frontend: Next.js on Vercel')).toBeVisible();
    await expect(detailsCard.locator('text=Backend: AWS API Gateway')).toBeVisible();
    await expect(detailsCard.locator('text=Method: GET')).toBeVisible();
    await expect(detailsCard.locator('text=Auth: None')).toBeVisible();
  }

  /**
   * Verify the API URL is correctly displayed
   */
  async verifyApiUrl(): Promise<void> {
    const config = getUiConfig();
    const apiUrlElement = this.page.locator('code').filter({ hasText: config.apiUrl });
    await expect(apiUrlElement).toBeVisible();
  }

  /**
   * Perform complete test flow and return result
   */
  async performApiTest(): Promise<{
    success: boolean;
    itemsCount?: number;
    errorMessage?: string;
  }> {
    await this.clickTestButton();
    await this.waitForTestCompletion();

    const hasSuccess = await this.hasSuccessResult();
    const hasError = await this.hasErrorResult();

    if (hasSuccess) {
      const itemsCount = await this.getSuccessItemsCount();
      return { success: true, itemsCount };
    } else if (hasError) {
      const errorMessage = await this.getErrorMessage();
      return { success: false, errorMessage };
    } else {
      // Check for no data case
      const noDataCard = this.page.locator('.border-yellow-200.bg-yellow-50');
      const hasNoData = await noDataCard.isVisible();

      if (hasNoData) {
        return { success: true, itemsCount: 0 };
      } else {
        return { success: false, errorMessage: 'Unknown test result state' };
      }
    }
  }

  /**
   * Take screenshot for debugging
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({
      path: `test-results/ui-${name}-${Date.now()}.png`,
      fullPage: true
    });
  }
}