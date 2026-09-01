class DreamsTotalPage {
  constructor(page) {
    this.page = page;
  }

  async getCounts() {
    const rows = this.page.locator('#dreamsTotal tbody tr');
    const count = await rows.count();
    const counts = {};
    for (let i = 0; i < count; i++) {
      const cells = rows.nth(i).locator('td');
      const type = await cells.nth(0).textContent();
      const value = await cells.nth(1).textContent();
      const key = type.trim().toLowerCase().replace(' ', '');
      counts[key] = parseInt(value.trim(), 10);
    }
    return {
      good: counts.good,
      bad: counts.bad,
      total: counts.total,
      recurring: counts.recurring,
    };
  }
}

module.exports = { DreamsTotalPage };