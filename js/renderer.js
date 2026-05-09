import { SYMBOLS, THEMES, ALCH_TEXTS } from './constants.js';

export class CircleRenderer {
    constructor(svgElement) {
        this.svg = svgElement;
        this.NS = "http://www.w3.org/2000/svg";
    }

    clear() {
        this.svg.innerHTML = '';
    }

    setStyles(theme) {
        this.svg.style.background = theme.bg;
    }

    createElement(type, attributes = {}, textContent = '') {
        const el = document.createElementNS(this.NS, type);
        Object.entries(attributes).forEach(([k, v]) => el.setAttribute(k, v));
        if (textContent) el.textContent = textContent;
        this.svg.appendChild(el);
        return el;
    }

    drawCircle(cx, cy, r, attr) {
        return this.createElement('circle', { cx, cy, r, ...attr });
    }

    drawLine(x1, y1, x2, y2, attr) {
        return this.createElement('line', { x1, y1, x2, y2, ...attr });
    }

    drawText(x, y, txt, attr) {
        return this.createElement('text', { x, y, ...attr }, txt);
    }

    drawPolygon(points, attr) {
        return this.createElement('polygon', {
            points: points.map(([x, y]) => `${x},${y}`).join(' '),
            ...attr
        });
    }

    drawPath(d, attr) {
        return this.createElement('path', { d, ...attr });
    }

    getPolyPoints(cx, cy, r, n, rotDeg) {
        const pts = [];
        for (let i = 0; i < n; i++) {
            const a = (2 * Math.PI * i / n) + (rotDeg * Math.PI / 180) - Math.PI / 2;
            pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
        }
        return pts;
    }

    getStarPoints(cx, cy, R, r, n, rotDeg) {
        const pts = [];
        for (let i = 0; i < n * 2; i++) {
            const rad = (i % 2 === 0 ? R : r);
            const a = (Math.PI * i / n) + (rotDeg * Math.PI / 180) - Math.PI / 2;
            pts.push([cx + rad * Math.cos(a), cy + rad * Math.sin(a)]);
        }
        return pts;
    }

    render(config) {
        this.clear();
        const { rings, poly, stars, rot, dens, lw, themeKey, toggles, selectedSym } = config;
        const theme = THEMES[themeKey];
        const S = theme.stroke;
        const S2 = theme.stroke2;
        const W = 520, H = 520, CX = W / 2, CY = H / 2;
        const baseR = 220;

        this.setStyles(theme);

        // Defs for hatch pattern
        if (toggles.hatch) {
            const defs = document.createElementNS(this.NS, 'defs');
            defs.innerHTML = `<pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="${S}" stroke-width="0.4" opacity="0.25"/></pattern>`;
            this.svg.appendChild(defs);
        }

        // Outer double ring
        if (toggles.double) {
            this.drawCircle(CX, CY, baseR + 14, { fill: 'none', stroke: S2, 'stroke-width': lw * 0.5 });
            this.drawCircle(CX, CY, baseR + 18, { fill: 'none', stroke: S, 'stroke-width': lw });
        }

        // Outer text ring
        if (toggles.outerText) {
            const textR = baseR + 6;
            const numSegs = Math.floor(dens * 2 + 2);
            const textArr = ALCH_TEXTS.slice(0, numSegs);
            
            textArr.forEach((txt, i) => {
                const startAngle = ((i / numSegs) * 360) - 90;
                const endAngle = (((i + 0.85) / numSegs) * 360) - 90;
                const id = `arc-${i}`;
                
                const defs = this.svg.querySelector('defs') || this.svg.insertBefore(document.createElementNS(this.NS, 'defs'), this.svg.firstChild);
                const toRad = a => a * Math.PI / 180;
                const x1 = CX + textR * Math.cos(toRad(startAngle)), y1 = CY + textR * Math.sin(toRad(startAngle));
                const x2 = CX + textR * Math.cos(toRad(endAngle)), y2 = CY + textR * Math.sin(toRad(endAngle));
                const large = endAngle - startAngle > 180 ? 1 : 0;
                
                const pathEl = document.createElementNS(this.NS, 'path');
                pathEl.setAttribute('id', id);
                pathEl.setAttribute('d', `M${x1},${y1} A${textR},${textR} 0 ${large},1 ${x2},${y2}`);
                pathEl.setAttribute('fill', 'none');
                defs.appendChild(pathEl);
                
                const tp = document.createElementNS(this.NS, 'text');
                tp.setAttribute('font-size', '9');
                tp.setAttribute('fill', S2);
                tp.setAttribute('font-family', 'Crimson Pro, serif');
                
                const tpath = document.createElementNS(this.NS, 'textPath');
                tpath.setAttribute('href', `#${id}`);
                tpath.textContent = txt;
                tp.appendChild(tpath);
                this.svg.appendChild(tp);
            });
        }

        // Main rings
        const ringRs = [];
        for (let i = 0; i < rings; i++) {
            const r = baseR * (0.3 + (i / rings) * 0.7);
            ringRs.push(r);
            const isDash = toggles.dashes && i === 0;
            const attrs = {
                fill: toggles.hatch && i === rings - 1 ? 'url(#hatch)' : 'none',
                stroke: i === rings - 1 ? S : S2,
                'stroke-width': i === rings - 1 ? lw : lw * 0.7
            };
            if (isDash) attrs['stroke-dasharray'] = '4,4';
            this.drawCircle(CX, CY, r, attrs);
        }

        const outerR = ringRs[ringRs.length - 1];

        // Polygon
        const pPts = this.getPolyPoints(CX, CY, outerR * 0.92, poly, rot);
        this.drawPolygon(pPts, { fill: 'none', stroke: S, 'stroke-width': lw });

        // Cross lines
        if (toggles.crosslines) {
            const skip = Math.max(1, Math.floor(poly / 2.5));
            for (let i = 0; i < poly; i++) {
                for (let j = i + skip; j < poly; j += skip) {
                    this.drawLine(pPts[i][0], pPts[i][1], pPts[j][0], pPts[j][1], {
                        stroke: S2,
                        'stroke-width': lw * 0.5,
                        opacity: 0.5
                    });
                }
            }
        }

        // Inner polygons
        for (let s = 1; s < Math.ceil(dens / 2); s++) {
            const sc = 0.92 - s * 0.18;
            if (sc < 0.15) break;
            const pp = this.getPolyPoints(CX, CY, outerR * sc, poly, rot + 180 / poly);
            this.drawPolygon(pp, { fill: 'none', stroke: S2, 'stroke-width': lw * 0.5, opacity: 0.4 });
        }

        // Nodes
        if (toggles.nodes) {
            pPts.forEach(([x, y], idx) => {
                this.drawCircle(x, y, 8, { fill: theme.bg, stroke: S, 'stroke-width': lw });
                
                // Use different symbols for nodes based on their position
                const nodeSymIdx = (selectedSym + idx) % SYMBOLS.length;
                this.drawText(x, y + 4, SYMBOLS[nodeSymIdx].p, {
                    'text-anchor': 'middle',
                    'font-size': '9',
                    fill: S
                });
            });
            
            if (rings >= 2) {
                const innerR = ringRs[rings - 2];
                const innerPts = this.getPolyPoints(CX, CY, innerR, poly, rot + 180 / poly);
                innerPts.forEach(([x, y], i) => {
                    if (i % 2 === 0) {
                        this.drawCircle(x, y, 5, { fill: theme.bg, stroke: S2, 'stroke-width': lw * 0.7, opacity: 0.8 });
                    }
                });
            }
        }

        // Star layers
        for (let s = 0; s < stars; s++) {
            const starN = Math.max(5, poly - s);
            const stR = outerR * (0.45 - s * 0.15);
            const stPts = this.getStarPoints(CX, CY, stR, stR * 0.45, starN, rot + s * 30);
            this.drawPolygon(stPts, {
                fill: 'none',
                stroke: s === 0 ? S : S2,
                'stroke-width': lw * (s === 0 ? 1 : 0.6),
                opacity: s === 0 ? 1 : 0.6
            });
        }

        // Inner text
        if (toggles.innerText && rings >= 2) {
            const innerTextR = ringRs[rings >= 3 ? rings - 2 : 0] * 0.98;
            const numSegs2 = Math.floor(dens) + 2;
            
            for (let i = 0; i < numSegs2; i++) {
                const startAngle = ((i / numSegs2) * 360) - 90;
                const endAngle = (((i + 0.8) / numSegs2) * 360) - 90;
                const id2 = `arc2-${i}`;
                const toRad = a => a * Math.PI / 180;
                const x1 = CX + innerTextR * Math.cos(toRad(startAngle)), y1 = CY + innerTextR * Math.sin(toRad(startAngle));
                const x2 = CX + innerTextR * Math.cos(toRad(endAngle)), y2 = CY + innerTextR * Math.sin(toRad(endAngle));
                const large = endAngle - startAngle > 180 ? 1 : 0;
                
                const defs2 = this.svg.querySelector('defs') || this.svg.insertBefore(document.createElementNS(this.NS, 'defs'), this.svg.firstChild);
                const pathEl2 = document.createElementNS(this.NS, 'path');
                pathEl2.setAttribute('id', id2);
                pathEl2.setAttribute('d', `M${x1},${y1} A${innerTextR},${innerTextR} 0 ${large},1 ${x2},${y2}`);
                pathEl2.setAttribute('fill', 'none');
                defs2.appendChild(pathEl2);
                
                const tp2 = document.createElementNS(this.NS, 'text');
                tp2.setAttribute('font-size', '8');
                tp2.setAttribute('fill', S2);
                tp2.setAttribute('opacity', '0.7');
                tp2.setAttribute('font-family', 'Crimson Pro, serif');
                
                const tpath2 = document.createElementNS(this.NS, 'textPath');
                tpath2.setAttribute('href', `#${id2}`);
                tpath2.textContent = ALCH_TEXTS[(i + 5) % ALCH_TEXTS.length];
                tp2.appendChild(tpath2);
                this.svg.appendChild(tp2);
            }
        }

        // Center symbol
        if (toggles.center) {
            const sym = SYMBOLS[selectedSym];
            this.drawCircle(CX, CY, 28, { fill: theme.bg, stroke: S, 'stroke-width': lw });
            this.drawCircle(CX, CY, 22, { fill: 'none', stroke: S2, 'stroke-width': lw * 0.5 });
            this.drawText(CX, CY + 10, sym.p, {
                'text-anchor': 'middle',
                'font-size': '26',
                fill: S,
                'font-family': 'serif'
            });
        }
    }
}
