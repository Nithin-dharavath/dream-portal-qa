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
      const typeRaw = await cells.nth(0).textContent();
      const valueRaw = await cells.nth(1).textContent();
      const normalized = typeRaw.trim().toLowerCase();
      let key;
      if (normalized.includes('good')) key = 'good';
      else if (normalized.includes('bad')) key = 'bad';
      else if (normalized === 'total dreams') key = 'total';
      else if (normalized.includes('recurring')) key = 'recurring';
      else key = normalized.replace(/\s+/g, '');
      counts[key] = parseInt(valueRaw.trim(), 10);
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