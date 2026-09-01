class DreamsDiaryPage {
  constructor(page) {
    this.page = page;
  }

  getRows() {
    return this.page.locator('#dreamsDiary tbody tr');
  }

  async getRowCount() {
    return await this.getRows().count();
  }

  getRowCells(index) {
    return this.getRows().nth(index).locator('td');
  }

  async getRowData(index) {
    const cells = this.getRowCells(index);
    const name = await cells.nth(0).textContent();
    const daysAgo = await cells.nth(1).textContent();
    const type = await cells.nth(2).textContent();
    return { name: name.trim(), daysAgo: daysAgo.trim(), type: type.trim() };
  }

  async getAllRowData() {
    const count = await this.getRowCount();
    const rows = [];
    for (let i = 0; i < count; i++) {
      rows.push(await this.getRowData(i));
    }
    return rows;
  }

  async getDreamTypes() {
    const count = await this.getRowCount();
    const types = [];
    for (let i = 0; i < count; i++) {
      const cells = this.getRowCells(i);
      const type = await cells.nth(2).textContent();
      types.push(type.trim());
    }
    return types;
  }
}

module.exports = { DreamsDiaryPage };