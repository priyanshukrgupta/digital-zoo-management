// Digital Zoo Admin — Main JavaScript
// Canvas animations, VFX, particle systems, sound effects

class ZooVFX {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.leaves = [];
    this.fireflies = [];
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.init();
    this.animate();
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  init() {
    // Leaves
    for (let i = 0; i < 60; i++) {
      this.leaves.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: 8 + Math.random() * 35,
        opacity: 0.02 + Math.random() * 0.07,
        hue: 100 + Math.random() * 50,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.006
      });
    }

    // Fireflies
    for (let i = 0; i < 20; i++) {
      this.fireflies.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: 1.5 + Math.random() * 2.5,
        opacity: 0,
        phase: Math.random() * Math.PI * 2,
        speed: 0.02 + Math.random() * 0.04
      });
    }
  }

  drawLeaf(l) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(l.x, l.y);
    ctx.rotate(l.rotation);
    ctx.globalAlpha = l.opacity;
    ctx.fillStyle = `hsl(${l.hue}, 55%, 22%)`;
    ctx.beginPath();
    ctx.ellipse(0, 0, l.size * 0.35, l.size, 0, 0, Math.PI * 2);
    ctx.fill();
    // Vein
    ctx.strokeStyle = `hsl(${l.hue}, 55%, 30%)`;
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = l.opacity * 0.5;
    ctx.beginPath();
    ctx.moveTo(0, -l.size);
    ctx.lineTo(0, l.size);
    ctx.stroke();
    ctx.restore();
  }

  drawFirefly(f) {
    const ctx = this.ctx;
    f.phase += f.speed;
    f.opacity = (Math.sin(f.phase) + 1) / 2 * 0.8;
    ctx.save();
    ctx.globalAlpha = f.opacity;
    const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.size * 4);
    grad.addColorStop(0, 'rgba(180, 255, 100, 0.9)');
    grad.addColorStop(0.5, 'rgba(100, 220, 20, 0.4)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.size * 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  animate() {
    if (!this.ctx) return;
    const ctx = this.ctx;

    // Fade trail
    ctx.fillStyle = 'rgba(10, 26, 14, 0.04)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Leaves
    this.leaves.forEach(l => {
      l.x += l.vx;
      l.y += l.vy;
      l.rotation += l.rotSpeed;
      if (l.x < -100) l.x = this.canvas.width + 100;
      if (l.x > this.canvas.width + 100) l.x = -100;
      if (l.y < -100) l.y = this.canvas.height + 100;
      if (l.y > this.canvas.height + 100) l.y = -100;
      this.drawLeaf(l);
    });

    // Fireflies
    this.fireflies.forEach(f => {
      f.x += f.vx + Math.sin(f.phase * 0.7) * 0.3;
      f.y += f.vy + Math.cos(f.phase * 0.5) * 0.3;
      if (f.x < 0) f.x = this.canvas.width;
      if (f.x > this.canvas.width) f.x = 0;
      if (f.y < 0) f.y = this.canvas.height;
      if (f.y > this.canvas.height) f.y = 0;
      this.drawFirefly(f);
    });

    // Ambient glow spots
    const t = Date.now() * 0.001;
    const glows = [
      { x: this.canvas.width * 0.15, y: this.canvas.height * 0.7, color: 'rgba(45,110,62,0.025)', r: 350 },
      { x: this.canvas.width * 0.85, y: this.canvas.height * 0.3, color: 'rgba(201,168,76,0.015)', r: 280 },
      { x: this.canvas.width * 0.5, y: this.canvas.height * 0.5, color: 'rgba(13,36,20,0.03)', r: 400 }
    ];
    glows.forEach((g, i) => {
      const pulse = 0.8 + Math.sin(t + i) * 0.2;
      const grad = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.r * pulse);
      grad.addColorStop(0, g.color);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    });

    requestAnimationFrame(() => this.animate());
  }
}

// Sound engine for animal sounds
class ZooSoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = false;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  playAnimalSound(category) {
    this.init();
    const sounds = {
      mammal: { type: 'triangle', freqs: [120, 180, 100], dur: 0.6, mod: 30 },
      bird: { type: 'sine', freqs: [800, 1200, 600, 900], dur: 0.25, mod: 100 },
      reptile: { type: 'sawtooth', freqs: [80, 100, 60], dur: 0.8, mod: 10 },
      fish: { type: 'sine', freqs: [300, 400, 350], dur: 0.4, mod: 20 },
      amphibian: { type: 'square', freqs: [400, 600, 500], dur: 0.3, mod: 50 },
      invertebrate: { type: 'sine', freqs: [1000, 1200, 800], dur: 0.15, mod: 150 }
    };
    const s = sounds[category] || sounds.mammal;
    s.freqs.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 2000;
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = s.type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * (s.dur * 0.6));
      osc.frequency.exponentialRampToValueAtTime(freq + s.mod, this.ctx.currentTime + i * (s.dur * 0.6) + s.dur * 0.5);
      gain.gain.setValueAtTime(0, this.ctx.currentTime + i * (s.dur * 0.6));
      gain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + i * (s.dur * 0.6) + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * (s.dur * 0.6) + s.dur);
      osc.start(this.ctx.currentTime + i * (s.dur * 0.6));
      osc.stop(this.ctx.currentTime + i * (s.dur * 0.6) + s.dur);
    });
  }

  playNotification(type = 'success') {
    this.init();
    const configs = {
      success: [{ freq: 523, dur: 0.1 }, { freq: 659, dur: 0.1 }, { freq: 784, dur: 0.2 }],
      error: [{ freq: 400, dur: 0.15 }, { freq: 300, dur: 0.3 }],
      click: [{ freq: 800, dur: 0.05 }]
    };
    const notes = configs[type] || configs.click;
    let time = this.ctx.currentTime;
    notes.forEach(note => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.frequency.value = note.freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.08, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + note.dur);
      osc.start(time);
      osc.stop(time + note.dur + 0.01);
      time += note.dur;
    });
  }

  playAmbient() {
    this.init();
    this.enabled = true;
    const loop = () => {
      if (!this.enabled) return;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc1.type = 'sine'; osc1.frequency.value = 60;
      osc2.type = 'sine'; osc2.frequency.value = 90;
      osc1.connect(gain); osc2.connect(gain);
      gain.connect(this.ctx.destination);
      gain.gain.value = 0.03;
      osc1.start(); osc2.start();
      let t = 0;
      const mod = setInterval(() => {
        if (!this.enabled) { osc1.stop(); osc2.stop(); clearInterval(mod); return; }
        t += 0.05;
        osc1.frequency.value = 60 + Math.sin(t) * 8;
        osc2.frequency.value = 90 + Math.cos(t * 0.6) * 12;
      }, 100);
    };
    loop();
  }

  stopAmbient() {
    this.enabled = false;
    if (this.ctx) { this.ctx.close(); this.ctx = null; }
  }
}

// Global helpers
const ZooUtils = {
  formatDate: (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
  formatCurrency: (n) => '₹' + Number(n || 0).toLocaleString('en-IN'),
  getAnimalEmoji: (cat) => ({ mammal: '🦁', bird: '🦜', reptile: '🦎', fish: '🐟', amphibian: '🐸', invertebrate: '🦋' }[cat] || '🐾'),
  showToast: (msg, type = 'success') => {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.className = `toast ${type} show`;
    if (window.zooSound) window.zooSound.playNotification(type);
    setTimeout(() => el.classList.remove('show'), 3500);
  },
  logout: () => { localStorage.clear(); window.location.href = '/login'; },
  checkAuth: () => {
    const token = localStorage.getItem('token');
    if (!token) window.location.href = '/login';
    return token;
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.zooSound = new ZooSoundEngine();

  // Add click sound to buttons
  document.querySelectorAll('.btn-gold, .btn-save').forEach(btn => {
    btn.addEventListener('click', () => window.zooSound?.playNotification('click'));
  });

  // Animate numbers counting up
  document.querySelectorAll('.stat-val[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    let current = 0;
    const step = target / 40;
    const interval = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(interval); }
      el.textContent = Math.floor(current).toLocaleString('en-IN');
    }, 30);
  });
});

// Export
window.ZooVFX = ZooVFX;
window.ZooSoundEngine = ZooSoundEngine;
window.ZooUtils = ZooUtils;