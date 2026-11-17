// ============================================================
// ECONOMY SYSTEM
// ============================================================
export class Economy {
  constructor(GameState) {
    this.state = GameState;
    this.meta = {
      taxIncome: 5000000,
      expenses: 3000000,
      inflation: 3.5,
      unemployment: 7.2,
      growth: 2.8
    };
    this.timer = 0;
  }

  tick(delta, GameState) {
    this.timer += delta;
    if (this.timer < 5) return;
    this.timer = 0;

    const popFactor = GameState.population / 1000000;

    // Income
    const income = (this.meta.taxIncome * popFactor * (GameState.approval / 75));
    GameState.money += income;

    // Expenses
    const expenses = this.meta.expenses * popFactor;
    GameState.money -= expenses;

    // Occasional drift
    if (Math.random() < 0.1) {
      this.meta.inflation += (Math.random() - 0.5) * 0.2;
      this.meta.unemployment += (Math.random() - 0.5) * 0.2;
      this.meta.growth += (Math.random() - 0.5) * 0.1;
      this.meta.inflation = Math.max(0.5, Math.min(15, this.meta.inflation));
      this.meta.unemployment = Math.max(2, Math.min(25, this.meta.unemployment));
      this.meta.growth = Math.max(-5, Math.min(10, this.meta.growth));
    }

    // Population growth
    GameState.population = Math.floor(GameState.population * (1 + this.meta.growth / 10000));
  }

  // Expose state for UI (compat)
  get state_() { return this.meta; }
}

// aliasing untuk akses dari main.js
Object.defineProperty(Economy.prototype, 'state', {
  get() { return this.meta; }
});
