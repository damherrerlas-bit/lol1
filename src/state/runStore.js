export class RunStore {
  constructor() {
    this.reset();
  }

  reset() {
    this.params = {
      trashCount: 100,
      speed: 1.0,
      seed: Math.floor(Math.random() * 10000)
    };

    this.metrics = {
      trashCollected: 0,
      totalDistance: 0,
      steps: 0,
      timeSeconds: 0,
      energyKwh: 0
    };

    this.points = [];
    this.isRunning = false;
    this.isComplete = false;
    this.startTime = null;
  }

  startRun(params) {
    this.params = { ...this.params, ...params };
    this.metrics = {
      trashCollected: 0,
      totalDistance: 0,
      steps: 0,
      timeSeconds: 0,
      energyKwh: 0
    };
    this.isRunning = true;
    this.isComplete = false;
    this.startTime = performance.now();
  }

  updateMetrics(collected, distance) {
    if (collected) {
      this.metrics.trashCollected++;
    }
    if (distance) {
      this.metrics.totalDistance += distance;
      this.metrics.steps++;
    }

    if (this.startTime) {
      this.metrics.timeSeconds = (performance.now() - this.startTime) / 1000;
    }

    this.metrics.energyKwh = this.metrics.totalDistance * 0.0001;
  }

  completeRun() {
    this.isRunning = false;
    this.isComplete = true;
    if (this.startTime) {
      this.metrics.timeSeconds = (performance.now() - this.startTime) / 1000;
    }
  }

  exportJSON() {
    const data = {
      params: this.params,
      metrics: this.metrics,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mars-cleanup-run-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  getState() {
    return {
      params: this.params,
      metrics: this.metrics,
      isRunning: this.isRunning,
      isComplete: this.isComplete
    };
  }
}

export const runStore = new RunStore();
