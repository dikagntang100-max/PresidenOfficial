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
    const income = (this.meta.taxIncome * popFactor * (GameState.approval / 75));
    GameState.money += income;
    const expenses = this.meta.expenses * popFactor;
    GameState.money -= expenses;
    if (Math.random() < 0.1) {
      this.meta.inflation = Math.max(0.5, Math.min(15, this.meta.inflation + (Math.random() - 0.5) * 0.2));
      this.meta.unemployment = Math.max(2, Math.min(25, this.meta.unemployment + (Math.random() - 0.5) * 0.2));
      this.meta.growth = Math.max(-5, Math.min(10, this.meta.growth + (Math.random() - 0.5) * 0.1));
    }
    GameState.population = Math.floor(GameState.population * (1 + this.meta.growth / 10000));
  }
  }
