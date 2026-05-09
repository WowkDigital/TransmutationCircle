import { SYMBOLS, THEMES, ALCH_TEXTS } from './constants.js';

export class CircleRenderer {
    constructor(svgElement) {
        this.svg = svgElement;
        this.NS = "http://www.w3.org/2000/svg";
    }

    clear() {
        this.svg.innerHTML = '';
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
        const { rings, poly, stars, rot, dens, lw, toggles, selectedSym } = config;
        const { colBg, colPrim, colSec, colOutText, colInText, colCenter, sizeOuter, sizeInner, sizeCenter } = config;
        
        const S = colPrim;
        const S2 = colSec;
        const W = 520, H = 520, CX = W / 2, CY = H / 2;
        const baseR = 220;

        this.svg.style.background = colBg;

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
            
            const textGroup = this.createElement('g', toggles.animate ? { class: 'animate-rotate' } : {});
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
                tp.setAttribute('font-size', sizeOuter.toString());
                tp.setAttribute('fill', colOutText);
                tp.setAttribute('font-family', "'Monsieur La Doulaise', cursive");
                
                const tpath = document.createElementNS(this.NS, 'textPath');
                tpath.setAttribute('href', `#${id}`);
                tpath.textContent = txt;
                tp.appendChild(tpath);
                textGroup.appendChild(tp);
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

        // Polygons and Lines Group
        const polyGroup = this.createElement('g', toggles.animate ? { class: 'animate-rotate-slow' } : {});
        
        // Polygon
        const pPts = this.getPolyPoints(CX, CY, outerR * 0.92, poly, rot);
        const polyEl = document.createElementNS(this.NS, 'polygon');
        polyEl.setAttribute('points', pPts.map(([x, y]) => `${x},${y}`).join(' '));
        polyEl.setAttribute('fill', 'none');
        polyEl.setAttribute('stroke', S);
        polyEl.setAttribute('stroke-width', lw);
        polyGroup.appendChild(polyEl);

        // Cross lines
        if (toggles.crosslines) {
            const skip = Math.max(1, Math.floor(poly / 2.5));
            for (let i = 0; i < poly; i++) {
                for (let j = i + skip; j < poly; j += skip) {
                    const line = document.createElementNS(this.NS, 'line');
                    line.setAttribute('x1', pPts[i][0]);
                    line.setAttribute('y1', pPts[i][1]);
                    line.setAttribute('x2', pPts[j][0]);
                    line.setAttribute('y2', pPts[j][1]);
                    line.setAttribute('stroke', S2);
                    line.setAttribute('stroke-width', lw * 0.5);
                    line.setAttribute('opacity', 0.5);
                    polyGroup.appendChild(line);
                }
            }
        }

        // Inner polygons
        for (let s = 1; s < Math.ceil(dens / 2); s++) {
            const sc = 0.92 - s * 0.18;
            if (sc < 0.15) break;
            const pp = this.getPolyPoints(CX, CY, outerR * sc, poly, rot + 180 / poly);
            const inPoly = document.createElementNS(this.NS, 'polygon');
            inPoly.setAttribute('points', pp.map(([x, y]) => `${x},${y}`).join(' '));
            inPoly.setAttribute('fill', 'none');
            inPoly.setAttribute('stroke', S2);
            inPoly.setAttribute('stroke-width', lw * 0.5);
            inPoly.setAttribute('opacity', 0.4);
            polyGroup.appendChild(inPoly);
        }

        // Nodes
        if (toggles.nodes) {
            const nodesWrapper = this.createElement('g', toggles.animate ? { class: 'animate-rotate-slow' } : {});
            const nodesGroup = document.createElementNS(this.NS, 'g');
            if (toggles.animate) nodesGroup.setAttribute('class', 'animate-pulse');
            nodesWrapper.appendChild(nodesGroup);
            pPts.forEach(([x, y], idx) => {
                const nodeCircle = document.createElementNS(this.NS, 'circle');
                nodeCircle.setAttribute('cx', x);
                nodeCircle.setAttribute('cy', y);
                nodeCircle.setAttribute('r', 8);
                nodeCircle.setAttribute('fill', colBg);
                nodeCircle.setAttribute('stroke', S);
                nodeCircle.setAttribute('stroke-width', lw);
                nodesGroup.appendChild(nodeCircle);
                
                const nodeSymIdx = (selectedSym + idx) % SYMBOLS.length;
                const nodeText = document.createElementNS(this.NS, 'text');
                nodeText.setAttribute('x', x);
                nodeText.setAttribute('y', y + 4);
                nodeText.setAttribute('text-anchor', 'middle');
                nodeText.setAttribute('font-size', '9');
                nodeText.setAttribute('fill', S);
                nodeText.textContent = SYMBOLS[nodeSymIdx].p;
                nodesGroup.appendChild(nodeText);
            });
            
            if (rings >= 2) {
                const innerR = ringRs[rings - 2];
                const innerPts = this.getPolyPoints(CX, CY, innerR, poly, rot + 180 / poly);
                innerPts.forEach(([x, y], i) => {
                    if (i % 2 === 0) {
                        const smallNode = document.createElementNS(this.NS, 'circle');
                        smallNode.setAttribute('cx', x);
                        smallNode.setAttribute('cy', y);
                        smallNode.setAttribute('r', 5);
                        smallNode.setAttribute('fill', colBg);
                        smallNode.setAttribute('stroke', S2);
                        smallNode.setAttribute('stroke-width', lw * 0.7);
                        smallNode.setAttribute('opacity', 0.8);
                        nodesGroup.appendChild(smallNode);
                    }
                });
            }
        }

        // Star layers
        if (stars > 0) {
            const starGroup = this.createElement('g', toggles.animate ? { class: 'animate-rotate-rev' } : {});
            for (let s = 0; s < stars; s++) {
                const starN = Math.max(5, poly - s);
                const stR = outerR * (0.45 - s * 0.15);
                const stPts = this.getStarPoints(CX, CY, stR, stR * 0.45, starN, rot + s * 30);
                const starEl = document.createElementNS(this.NS, 'polygon');
                starEl.setAttribute('points', stPts.map(([x, y]) => `${x},${y}`).join(' '));
                starEl.setAttribute('fill', 'none');
                starEl.setAttribute('stroke', s === 0 ? S : S2);
                starEl.setAttribute('stroke-width', lw * (s === 0 ? 1 : 0.6));
                starEl.setAttribute('opacity', s === 0 ? 1 : 0.6);
                starGroup.appendChild(starEl);
            }
        }

        // Inner text
        if (toggles.innerText && rings >= 2) {
            const innerRingR = ringRs[rings >= 3 ? rings - 2 : 0];
            const innerTextR = innerRingR - sizeInner - 2;
            const numSegs2 = Math.floor(dens) + 2;
            const innerTextGroup = this.createElement('g', toggles.animate ? { class: 'animate-rotate-rev' } : {});
            
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
                tp2.setAttribute('font-size', sizeInner.toString());
                tp2.setAttribute('fill', colInText);
                tp2.setAttribute('opacity', '0.7');
                tp2.setAttribute('font-family', "'Monsieur La Doulaise', cursive");
                
                const tpath2 = document.createElementNS(this.NS, 'textPath');
                tpath2.setAttribute('href', `#${id2}`);
                tpath2.textContent = ALCH_TEXTS[(i + 5) % ALCH_TEXTS.length];
                tp2.appendChild(tpath2);
                innerTextGroup.appendChild(tp2);
            }
        }

        // Center symbol
        if (toggles.center) {
            const centerGroup = this.createElement('g', toggles.animate ? { class: 'animate-glow' } : {});
            const sym = SYMBOLS[selectedSym];
            
            const c1 = document.createElementNS(this.NS, 'circle');
            c1.setAttribute('cx', CX);
            c1.setAttribute('cy', CY);
            c1.setAttribute('r', 28);
            c1.setAttribute('fill', colBg);
            c1.setAttribute('stroke', S);
            c1.setAttribute('stroke-width', lw);
            centerGroup.appendChild(c1);

            const c2 = document.createElementNS(this.NS, 'circle');
            c2.setAttribute('cx', CX);
            c2.setAttribute('cy', CY);
            c2.setAttribute('r', 22);
            c2.setAttribute('fill', 'none');
            c2.setAttribute('stroke', S2);
            c2.setAttribute('stroke-width', lw * 0.5);
            centerGroup.appendChild(c2);

            const t1 = document.createElementNS(this.NS, 'text');
            t1.setAttribute('x', CX);
            t1.setAttribute('y', CY + 10);
            t1.setAttribute('text-anchor', 'middle');
            t1.setAttribute('font-size', sizeCenter.toString());
            t1.setAttribute('fill', colCenter);
            t1.setAttribute('font-family', 'serif');
            t1.textContent = sym.p;
            centerGroup.appendChild(t1);
        }
    }
}
