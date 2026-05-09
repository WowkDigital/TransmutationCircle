import { SYMBOLS, THEMES, PRESETS } from './constants.js';
import { CircleRenderer } from './renderer.js';

class CircleApp {
    constructor() {
        this.renderer = new CircleRenderer(document.getElementById('circle-svg'));
        this.state = { ...PRESETS.human, selectedSym: 0 };
        
        this.init();
    }

    init() {
        this.buildSymbolPicker();
        this.attachEventListeners();
        this.loadPreset('human');
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
        const toggles = ['outerText', 'innerText', 'nodes', 'crosslines', 'dashes', 'double', 'hatch', 'center'];
        toggles.forEach(id => {
            const el = document.getElementById(`t-${id}`);
            const input = el.querySelector('input');
            input.addEventListener('change', () => {
                this.state[id] = input.checked;
                this.updateUI();
                this.render();
            });
        });

        // Theme
        document.getElementById('theme').addEventListener('change', (e) => {
            this.state.theme = e.target.value;
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
        const sliders = ['rings', 'poly', 'stars', 'rot', 'dens', 'lw'];
        sliders.forEach(id => {
            document.getElementById(id).value = this.state[id];
            const valEl = document.getElementById(`${id}-val`);
            if (valEl) valEl.textContent = this.state[id];
        });

        // Update toggles
        const toggles = ['outerText', 'innerText', 'nodes', 'crosslines', 'dashes', 'double', 'hatch', 'center'];
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
        this.updateUI();
        this.render();
    }

    randomize() {
        this.state = {
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
                center: this.state.center
            }
        });
    }
}

// Initialize the app
window.addEventListener('DOMContentLoaded', () => {
    window.app = new CircleApp();
});
