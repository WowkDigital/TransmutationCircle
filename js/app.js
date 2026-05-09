import { SYMBOLS, THEMES, PRESETS } from './constants.js';
import { CircleRenderer } from './renderer.js';

class CircleApp {
    constructor() {
        this.renderer = new CircleRenderer(document.getElementById('circle-svg'));
        this.state = { 
            ...PRESETS.human, 
            selectedSym: 0,
            sizeOuter: 14,
            sizeInner: 12,
            sizeCenter: 26,
            colBg: '#050403',
            colPrim: '#c9a84c',
            colSec: '#8a6d1e',
            colOutText: '#8a6d1e',
            colInText: '#8a6d1e',
            colCenter: '#c9a84c'
        };
        
        this.init();
    }

    init() {
        this.buildSymbolPicker();
        this.attachEventListeners();
        this.loadPreset('human');
    }

    applyThemeColors(themeKey) {
        const t = THEMES[themeKey];
        if (t) {
            this.state.colBg = t.bg;
            this.state.colPrim = t.stroke;
            this.state.colSec = t.stroke2;
            this.state.colOutText = t.stroke2;
            this.state.colInText = t.stroke2;
            this.state.colCenter = t.stroke;
        }
    }

    buildSymbolPicker() {
        const picker = document.getElementById('symbol-picker');
        picker.innerHTML = SYMBOLS.map((s, i) => `
            <div class="symbol-item ${i === this.state.selectedSym ? 'selected' : ''}" 
                 title="${s.n}" 
                 data-index="${i}">
                ${s.p}
            </div>
        `).join('');

        picker.querySelectorAll('.symbol-item').forEach(el => {
            el.addEventListener('click', () => {
                this.state.selectedSym = parseInt(el.dataset.index);
                this.updateUI();
                this.render();
            });
        });
    }

    attachEventListeners() {
        // Sliders
        const sliders = ['rings', 'poly', 'stars', 'rot', 'dens', 'lw'];
        sliders.forEach(id => {
            const el = document.getElementById(id);
            el.addEventListener('input', () => {
                this.state[id] = parseFloat(el.value);
                this.updateUI();
                this.render();
            });
        });

        // Toggles
        const toggles = ['outerText', 'innerText', 'nodes', 'crosslines', 'dashes', 'double', 'hatch', 'center', 'animate'];
        toggles.forEach(id => {
            const el = document.getElementById(`t-${id}`);
            const input = el.querySelector('input');
            input.addEventListener('change', () => {
                this.state[id] = input.checked;
                this.updateUI();
                this.render();
            });
        });

        // Text Sliders
        const textSliders = ['sizeOuter', 'sizeInner', 'sizeCenter'];
        textSliders.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => {
                    this.state[id] = parseInt(el.value);
                    this.updateUI();
                    this.render();
                });
            }
        });

        // Colors
        const colors = ['colBg', 'colPrim', 'colSec', 'colOutText', 'colInText', 'colCenter'];
        colors.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => {
                    this.state[id] = el.value;
                    this.render();
                });
            }
        });

        // Theme
        document.getElementById('theme').addEventListener('change', (e) => {
            this.state.theme = e.target.value;
            this.applyThemeColors(this.state.theme);
            this.updateUI();
            this.render();
        });

        // Actions
        document.getElementById('btn-randomize').addEventListener('click', () => this.randomize());
        document.getElementById('btn-export').addEventListener('click', () => this.exportSVG());
        document.getElementById('btn-reset').addEventListener('click', () => this.reset());

        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => this.loadPreset(btn.dataset.preset));
        });
    }

    updateUI() {
        // Update slider values display
        const sliders = ['rings', 'poly', 'stars', 'rot', 'dens', 'lw', 'sizeOuter', 'sizeInner', 'sizeCenter'];
        sliders.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.value = this.state[id];
                const valEl = document.getElementById(`${id}-val`);
                if (valEl) valEl.textContent = this.state[id];
            }
        });

        // Update colors
        const colors = ['colBg', 'colPrim', 'colSec', 'colOutText', 'colInText', 'colCenter'];
        colors.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.value = this.state[id];
            }
        });

        // Update toggles
        const toggles = ['outerText', 'innerText', 'nodes', 'crosslines', 'dashes', 'double', 'hatch', 'center', 'animate'];
        toggles.forEach(id => {
            const el = document.getElementById(`t-${id}`);
            const input = el.querySelector('input');
            input.checked = this.state[id];
            el.classList.toggle('active', this.state[id]);
        });

        // Update theme select
        document.getElementById('theme').value = this.state.theme;

        // Update symbol picker selection
        document.querySelectorAll('.symbol-item').forEach((el, i) => {
            el.classList.toggle('selected', i === this.state.selectedSym);
        });
    }

    loadPreset(name) {
        const preset = PRESETS[name];
        if (!preset) return;
        this.state = { ...this.state, ...preset, selectedSym: preset.sym };
        this.applyThemeColors(this.state.theme);
        this.updateUI();
        this.render();
    }

    randomize() {
        this.state = {
            ...this.state,
            rings: Math.floor(Math.random() * 4) + 2,
            poly: Math.floor(Math.random() * 6) + 3,
            stars: Math.floor(Math.random() * 3),
            rot: Math.floor(Math.random() * 360),
            dens: Math.floor(Math.random() * 4) + 2,
            lw: [1, 1.5, 2][Math.floor(Math.random() * 3)],
            theme: Object.keys(THEMES)[Math.floor(Math.random() * Object.keys(THEMES).length)],
            selectedSym: Math.floor(Math.random() * SYMBOLS.length),
            outerText: Math.random() > 0.3,
            innerText: Math.random() > 0.4,
            nodes: Math.random() > 0.2,
            crosslines: Math.random() > 0.3,
            dashes: Math.random() > 0.6,
            double: Math.random() > 0.5,
            hatch: Math.random() > 0.7,
            center: true
        };
        this.applyThemeColors(this.state.theme);
        this.updateUI();
        this.render();
    }

    reset() {
        this.loadPreset('human');
    }

    exportSVG() {
        const svg = document.getElementById('circle-svg');
        const data = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([data], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transmutation_circle_${Date.now()}.svg`;
        a.click();
        URL.revokeObjectURL(url);
    }

    render() {
        this.renderer.render({
            ...this.state,
            themeKey: this.state.theme,
            toggles: {
                outerText: this.state.outerText,
                innerText: this.state.innerText,
                nodes: this.state.nodes,
                crosslines: this.state.crosslines,
                dashes: this.state.dashes,
                double: this.state.double,
                hatch: this.state.hatch,
                center: this.state.center,
                animate: this.state.animate
            }
        });
    }
}

// Initialize the app
window.addEventListener('DOMContentLoaded', () => {
    window.app = new CircleApp();
});
