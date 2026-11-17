// ============================================================
// GOVERNMENT SYSTEM
// ============================================================
export class Government {
  constructor(GameState) {
    this.state = GameState;
    this.cabinet = [
      { role: 'Menteri Ekonomi', name: 'Dr. Rahmat Wijaya', performance: 78 },
      { role: 'Menteri Pendidikan', name: 'Prof. Sinta Dewi', performance: 82 },
      { role: 'Menteri Kesehatan', name: 'Dr. Wijaya Kusuma', performance: 74 },
      { role: 'Menteri Infrastruktur', name: 'Ir. Budi Pratama', performance: 80 },
      { role: 'Menteri Pertahanan', name: 'Jenderal Prakoso', performance: 85 },
      { role: 'Menteri Luar Negeri', name: 'Diplomat Hartono', performance: 76 }
    ];
    this.policies = [];
  }

  getAveragePerformance() {
    return this.cabinet.reduce((a, b) => a + b.performance, 0) / this.cabinet.length;
  }

  meeting() {
    this.state.approval = Math.min(100, this.state.approval + 2);
    return 'Rapat kabinet selesai. Kepuasan +2%';
  }

  createPolicy(name, effect) {
    this.policies.push({ name, effect });
    return `Kebijakan "${name}" diterapkan`;
  }
}
