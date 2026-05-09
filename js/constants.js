export const SYMBOLS = [
    { p: '☿', n: 'Mercury' }, { p: '♄', n: 'Saturn' }, { p: '♃', n: 'Jupiter' }, { p: '♂', n: 'Mars' },
    { p: '♀', n: 'Venus' }, { p: '☉', n: 'Sol' }, { p: '☽', n: 'Luna' }, { p: '⊕', n: 'Earth' },
    { p: '△', n: 'Fire' }, { p: '▽', n: 'Water' }, { p: '○', n: 'Air' }, { p: '□', n: 'Earth' },
    { p: '✦', n: 'Star' }, { p: '⊗', n: 'Binding' }, { p: '⊙', n: 'Circle' }, { p: '✺', n: 'Radiance' },
    { p: '⌘', n: 'Command' }, { p: '⏣', n: 'Hex' }, { p: '⊞', n: 'Grid' }, { p: '※', n: 'Reference' },
    { p: '⊿', n: 'Triangle' }, { p: '◈', n: 'Diamond' }, { p: '⟳', n: 'Cycle' }, { p: '⧖', n: 'Time' }
];

export const THEMES = {
    gold: { stroke: '#c9a84c', stroke2: '#8a6d1e', bg: '#050403', text: '#c9a84c' },
    white: { stroke: '#d4d0c0', stroke2: '#888070', bg: '#f5f0e8', text: '#1a1208' },
    red: { stroke: '#c43030', stroke2: '#6b1010', bg: '#05010a', text: '#c43030' },
    blue: { stroke: '#4080c0', stroke2: '#204060', bg: '#020510', text: '#80b0e0' },
    green: { stroke: '#40a060', stroke2: '#206030', bg: '#010805', text: '#70c080' }
};

export const ALCH_TEXTS = [
    "Pale white and black with false citrine", "Imperfect white and red", "After the perfect white follows the glory",
    "The peacock's feathers in bright colours", "The rainbow in the sky above", "The peacock, the green follows the joy",
    "And after these shall appear the substance", "Appears before you in perfect white", "The crow and beak, black as toad they shall",
    "Leathers in bright adorn", "The rainbow in the sky above, the spotted panther, the green lion",
    "True shall appear before you in lighter water, post white and black with false citrine",
    "Ponder the gem that thus the crow and beak"
];

export const PRESETS = {
    human: { rings: 3, poly: 6, stars: 2, rot: 0, dens: 4, outerText: true, innerText: true, nodes: true, crosslines: true, dashes: false, double: true, hatch: false, center: true, sym: 0, theme: 'gold', lw: 1 },
    flame: { rings: 2, poly: 5, stars: 1, rot: 36, dens: 3, outerText: true, innerText: false, nodes: true, crosslines: true, dashes: true, double: false, hatch: false, center: true, sym: 12, theme: 'red', lw: 1.5 },
    metal: { rings: 4, poly: 4, stars: 0, rot: 45, dens: 3, outerText: true, innerText: true, nodes: true, crosslines: true, dashes: false, double: true, hatch: true, center: true, sym: 17, theme: 'white', lw: 1 },
    earth: { rings: 3, poly: 4, stars: 1, rot: 0, dens: 3, outerText: false, innerText: true, nodes: true, crosslines: true, dashes: false, double: false, hatch: true, center: true, sym: 3, theme: 'green', lw: 1 },
    water: { rings: 3, poly: 8, stars: 2, rot: 22, dens: 4, outerText: true, innerText: false, nodes: true, crosslines: false, dashes: true, double: true, hatch: false, center: true, sym: 6, theme: 'blue', lw: 1 },
    dark: { rings: 4, poly: 7, stars: 3, rot: 0, dens: 5, outerText: true, innerText: true, nodes: true, crosslines: true, dashes: true, double: true, hatch: true, center: true, sym: 13, theme: 'red', lw: 2 }
};
