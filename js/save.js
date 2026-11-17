// ============================================================
// SAVE SYSTEM - localStorage based
// ============================================================
export const SaveSystem = {
  KEY: 'president_life_sim_save_v1',

  hasSave() {
    return !!localStorage.getItem(this.KEY);
  },

  saveGame(GameState) {
    const data = {
      version: 1,
      timestamp: Date.now(),
      country: GameState.country,
      president: GameState.president,
      money: GameState.money,
      approval: GameState.approval,
      population: GameState.population,
      time: GameState.time,
      weather: GameState.weather,
      missions: GameState.missions
    };
    try {
      localStorage.setItem(this.KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Save failed:', e);
      return false;
    }
  },

  loadGame() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      return data;
    } catch (e) {
      console.error('Load failed:', e);
      return null;
    }
  },

  deleteSave() {
    localStorage.removeItem(this.KEY);
  }
};
