import p5 from 'p5';
import { runStore } from '../state/runStore.js';

export class TrashSimulation {
  constructor(container, onComplete) {
    this.container = container;
    this.onComplete = onComplete;
    this.p5Instance = null;
    this.trashPoints = [];
    this.bot = null;
    this.visitOrder = [];
    this.currentTargetIndex = 0;
    this.isAnimating = false;
    this.lastFrameTime = 0;
    this.trailPoints = [];
    this.maxTrailLength = 30;

    this.init();
  }

  init() {
    const sketch = (p) => {
      p.setup = () => {
        const canvas = p.createCanvas(
          this.container.clientWidth,
          Math.min(this.container.clientHeight, 600)
        );
        canvas.parent(this.container);
        p.frameRate(60);
      };

      p.draw = () => {
        p.background(10, 10, 20);

        this.drawStars(p);

        if (this.isAnimating) {
          this.updateBotPosition(p);
        }

        this.drawTrashPoints(p);
        this.drawBot(p);
        this.drawTrail(p);
      };

      p.windowResized = () => {
        p.resizeCanvas(
          this.container.clientWidth,
          Math.min(this.container.clientHeight, 600)
        );
      };
    };

    this.p5Instance = new p5(sketch);
  }

  drawStars(p) {
    p.fill(255, 255, 255, 100);
    p.noStroke();
    for (let i = 0; i < 100; i++) {
      const x = (i * 37) % p.width;
      const y = (i * 73) % p.height;
      p.circle(x, y, 1);
    }
  }

  drawTrashPoints(p) {
    this.trashPoints.forEach((point, index) => {
      if (!point.collected) {
        p.noStroke();
        p.fill(100, 150, 255, 200);
        p.circle(point.x, point.y, 8);

        p.stroke(100, 150, 255, 100);
        p.strokeWeight(1);
        p.noFill();
        p.circle(point.x, point.y, 12);
      } else if (point.alpha > 0) {
        p.noStroke();
        p.fill(100, 255, 150, point.alpha);
        p.circle(point.x, point.y, 8 * point.scale);
        point.alpha -= 5;
        point.scale *= 0.95;
      }
    });
  }

  drawBot(p) {
    if (!this.bot) return;

    p.push();
    p.translate(this.bot.x, this.bot.y);

    p.fill(255, 140, 0);
    p.noStroke();
    p.circle(0, 0, 20);

    p.fill(50, 50, 80);
    p.circle(-3, -3, 5);
    p.circle(3, -3, 5);

    p.stroke(255, 140, 0, 150);
    p.strokeWeight(2);
    p.noFill();
    p.circle(0, 0, 28);

    p.pop();
  }

  drawTrail(p) {
    if (this.trailPoints.length < 2) return;

    p.noFill();
    for (let i = 1; i < this.trailPoints.length; i++) {
      const alpha = (i / this.trailPoints.length) * 100;
      p.stroke(255, 140, 0, alpha);
      p.strokeWeight(2);
      p.line(
        this.trailPoints[i - 1].x,
        this.trailPoints[i - 1].y,
        this.trailPoints[i].x,
        this.trailPoints[i].y
      );
    }
  }

  updateBotPosition(p) {
    if (this.currentTargetIndex >= this.visitOrder.length) {
      this.isAnimating = false;
      runStore.completeRun();
      if (this.onComplete) {
        this.onComplete();
      }
      return;
    }

    const target = this.trashPoints[this.visitOrder[this.currentTargetIndex]];

    if (target.collected) {
      this.currentTargetIndex++;
      return;
    }

    const dx = target.x - this.bot.x;
    const dy = target.y - this.bot.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const speed = 3 * runStore.params.speed;

    if (distance < speed) {
      const actualDistance = Math.sqrt(
        Math.pow(target.x - this.bot.lastX, 2) + Math.pow(target.y - this.bot.lastY, 2)
      );

      runStore.updateMetrics(true, actualDistance);

      target.collected = true;
      target.alpha = 200;
      target.scale = 1.0;

      this.bot.lastX = this.bot.x;
      this.bot.lastY = this.bot.y;

      this.currentTargetIndex++;
    } else {
      const angle = Math.atan2(dy, dx);
      this.bot.x += Math.cos(angle) * speed;
      this.bot.y += Math.sin(angle) * speed;

      this.trailPoints.push({ x: this.bot.x, y: this.bot.y });
      if (this.trailPoints.length > this.maxTrailLength) {
        this.trailPoints.shift();
      }
    }
  }

  generateTrashPoints(count, seed) {
    this.trashPoints = [];
    const rng = this.seededRandom(seed);

    const padding = 50;
    const width = this.p5Instance.width - padding * 2;
    const height = this.p5Instance.height - padding * 2;

    for (let i = 0; i < count; i++) {
      this.trashPoints.push({
        x: padding + rng() * width,
        y: padding + rng() * height,
        collected: false,
        alpha: 255,
        scale: 1.0
      });
    }
  }

  seededRandom(seed) {
    let state = seed;
    return function () {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return state / 4294967296;
    };
  }

  calculateNearestNeighborPath() {
    const unvisited = this.trashPoints.map((_, i) => i);
    this.visitOrder = [];

    let current = 0;
    this.visitOrder.push(current);
    unvisited.splice(current, 1);

    while (unvisited.length > 0) {
      const currentPoint = this.trashPoints[this.visitOrder[this.visitOrder.length - 1]];
      let nearestIndex = 0;
      let nearestDistance = Infinity;

      unvisited.forEach((idx, arrIdx) => {
        const point = this.trashPoints[idx];
        const distance = Math.sqrt(
          Math.pow(point.x - currentPoint.x, 2) + Math.pow(point.y - currentPoint.y, 2)
        );

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = arrIdx;
        }
      });

      const nextIndex = unvisited[nearestIndex];
      this.visitOrder.push(nextIndex);
      unvisited.splice(nearestIndex, 1);
    }
  }

  start(params) {
    runStore.startRun(params);

    this.generateTrashPoints(params.trashCount, params.seed);

    this.bot = {
      x: 50,
      y: 50,
      lastX: 50,
      lastY: 50
    };

    this.trailPoints = [];
    this.currentTargetIndex = 0;

    this.calculateNearestNeighborPath();

    this.isAnimating = true;
  }

  reset() {
    this.isAnimating = false;
    this.trashPoints = [];
    this.bot = null;
    this.visitOrder = [];
    this.currentTargetIndex = 0;
    this.trailPoints = [];
  }

  dispose() {
    if (this.p5Instance) {
      this.p5Instance.remove();
    }
  }
}
