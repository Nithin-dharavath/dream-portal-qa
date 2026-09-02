class HomePage {
  constructor(page) {
    this.page = page;
  }

  async goto(options = {}) {
    await this.page.goto('', { waitUntil: 'domcontentloaded', ...options });
  }

  getLoadingSpinner() {
    return this.page.locator('.spinner');
  }

  getLoadingContainer() {
    return this.page.locator('#loadingAnimation');
  }

  getMainContent() {
    return this.page.locator('#mainContent');
  }

  getDreamButton() {
    return this.page.locator('#dreamButton');
  }

  async clickMyDreams() {
    await this.page.locator('#dreamButton').click();
  }
}

module.exports = { HomePage };