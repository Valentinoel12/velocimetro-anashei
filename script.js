// script.js - Mach drum + vertical gauge with band labels and smooth animation

const canvas = document.getElementById("velocimetro");
const ctx = canvas.getContext("2d");
const input = document.getElementById("velocidad");
const valor = document.getElementById("valor");

const W = canvas.width;
const H = canvas.height;

// Geometry inside canvas
const left = 20;
const gaugeWidth = 120;
const topPadding = 60;   // leave space for drum
const bottomPadding = 10;
const gaugeHeight = H - topPadding - bottomPadding;

// Color bands
const rangos = [
    {min: 0,   max: 150, color: "#ffffff", label: "Vel. con flaps"},
    {min: 150, max: 330, color: "#00ff00", label: "Velocidad normal"},
    {min: 330, max: 400, color: "#ffaa00", label: "Precaución"},
    {min: 400, max: 450, color: "#ff0000", label: "Velocidad excesiva"}
];

function kiasToMach(kias) {
    return kias / 661; // not fixed to decimals here
}

// map 0..450 to vertical pixel (bottom -> low, top -> high)
function mapY(value) {
    const ratio = value / 450;
    // y increases downward; 0 KIAS should be near bottom (H - bottomPadding)
    const yBottom = topPadding + gaugeHeight;
    const yTop = topPadding;
    return yBottom - ratio * (gaugeHeight);
}

// Smooth animation variables
let targetKias = 0;
let currentKias = 0;
const smoothFactor = 0.12; // lower = smoother/slower

// DRUM settings (like the photo): small window near top center
const drum = {
    x: W/2 - 36,
    y: 12,
    w: 72,
    h: 36,
    digitH: 28,
    font: "20px monospace",
    bg: "#ff7f00" // orange-ish like instrument
};

// draw background and bands
function drawBackground() {
    // outer panel
    ctx.fillStyle = "#0c1622";
    ctx.fillRect(0, 0, W, H);

    // panel rectangle for gauge area
    ctx.fillStyle = "#111";
    ctx.fillRect(left, topPadding, gaugeWidth, gaugeHeight);

    // border
    ctx.strokeStyle = "#00aaff";
    ctx.lineWidth = 2;
    roundRect(ctx, left, topPadding, gaugeWidth, gaugeHeight, 8, false, true);
}

// helper to draw rounded rect
function roundRect(ctx, x, y, w, h, r, fill, stroke){
    if (typeof r === 'undefined') r = 5;
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.arcTo(x+w, y,   x+w, y+h, r);
    ctx.arcTo(x+w, y+h, x,   y+h, r);
    ctx.arcTo(x,   y+h, x,   y,   r);
    ctx.arcTo(x,   y,   x+w, y,   r);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
}

// draw color bands and labels inside them
function drawBands() {
    ctx.textAlign = "center";
    ctx.font = "12px Arial";
    rangos.forEach(r => {
        const y1 = mapY(r.max);
        const y2 = mapY(r.min);
        const h = y2 - y1;
        // band rectangle
        ctx.fillStyle = r.color;
        ctx.fillRect(left + 4, y1, gaugeWidth - 8, h);

        // semi-transparent overlay to ensure text is readable on bright bands
        ctx.fillStyle = "rgba(0,0,0,0.15)";
        ctx.fillRect(left + 4, y1, gaugeWidth - 8, h);

        // label centered in band
        const labelY = y1 + h/2 + 5;
        // choose color depending on band brightness
        const textColor = (r.color === "#ffffff" || r.color === "#ffaa00") ? "#000" : "#fff";
        ctx.fillStyle = textColor;
        ctx.fillText(r.label, left + gaugeWidth/2, labelY);
    });
}

// draw tick marks and numeric scale (every 50)
function drawTicks() {
    ctx.strokeStyle = "#ccd";
    ctx.lineWidth = 1;
    ctx.textAlign = "left";
    ctx.font = "11px Arial";
    for (let v = 0; v <= 450; v += 50) {
        const y = mapY(v);
        ctx.beginPath();
        ctx.moveTo(left + gaugeWidth - 6, y);
        ctx.lineTo(left + gaugeWidth, y);
        ctx.stroke();

        ctx.fillStyle = "#e8f1f2";
        ctx.fillText(String(v).padStart(3," "), left + gaugeWidth + 6, y + 4);
    }
}

// indicator bar (horizontal) showing current speed
function drawIndicator(kias) {
    const y = mapY(kias);
    ctx.fillStyle = "#ff3333";
    ctx.fillRect(left + 2, y - 4, gaugeWidth - 4, 8);

    // small white thumb at the left and right like instrument
    ctx.fillStyle = "#fff";
    ctx.fillRect(left - 6, y - 6, 6, 12);
    ctx.fillRect(left + gaugeWidth, y - 6, 6, 12);

    // numeric label floating near indicator
    ctx.fillStyle = "#00ffff";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.fillText(kias + " KIAS", left + gaugeWidth/2, y - 12);
}

// DRAW DRUM (rolling numbers) - three columns: int . dec1 dec2
function drawDrum(mach) {
    // mach is a number like 0.00 - 1.00 (could be up to ~0.7 for 450 KIAS)
    // We'll draw three columns: integer (0-1), decimal1 (0-9), decimal2 (0-9)
    const x = drum.x;
    const y = drum.y;
    const w = drum.w;
    const h = drum.h;

    // window background and border
    roundRect(ctx, x, y, w, h, 6, true, false);
    ctx.fillStyle = drum.bg;
    ctx.fillRect(x, y, w, h);

    ctx.strokeStyle = "#222";
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, w, h, 6, false, true);

    // compute positions for each digit column
    // multipliers for continuous scroll pos:
    // col 0 -> mach*1, col1 -> mach*10, col2 -> mach*100
    const posInt = mach * 1;
    const posD1  = mach * 10;
    const posD2  = mach * 100;

    // column widths
    const colW = Math.floor(w / 3);
    const colX0 = x + 6;
    const colX1 = x + 6 + colW;
    const colX2 = x + 6 + colW * 2;

    // function to draw a vertical scrolling digit column
    function drawDigitColumn(colX, pos, showDots) {
        // pos is continuous number (e.g., 0.68*100 = 68 for second decimals)
        // desired offset = fractional part * digitHeight plus which digit index
        const continuous = pos;
        // We want digits 0..9 stacked vertically. To allow smooth scroll we will draw 0..9 twice
        const base = Math.floor(continuous) % 10; // current digit
        const frac = continuous - Math.floor(continuous);
        const digitH = drum.digitH;

        ctx.save();
        // clip to column area inside the drum window
        ctx.beginPath();
        ctx.rect(colX, y + 4, colW - 4, h - 8);
        ctx.clip();

        // compute top position: we want the stacked digits 0..9..0..9 so index = continuous
        // We place digit '0' at y0, and then move up by (continuous * digitH)
        // We'll draw sequence from 0..9..0..9 (20 digits) to avoid jumps
        const startY = y + 4 - (continuous * digitH) + digitH*10; // shift to show proper digit in visible window
        ctx.fillStyle = "#111";
        ctx.fillRect(colX, y + 4, colW - 4, h - 8);

        ctx.fillStyle = "#000";
        ctx.globalAlpha = 0.0; // nothing, but keep for reference
        ctx.globalAlpha = 1;

        ctx.fillStyle = "#ffffff";
        ctx.font = drum.font;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // draw 0..9 twice
        for (let repeat = 0; repeat < 2; repeat++) {
            for (let d = 0; d <= 9; d++) {
                const idx = repeat*10 + d;
                const drawY = startY + idx * digitH + digitH/2;
                ctx.fillText(String(d), colX + (colW-4)/2, drawY);
            }
        }

        ctx.restore();

        // small thin separators for style
        ctx.strokeStyle = "rgba(0,0,0,0.2)";
        ctx.beginPath();
        ctx.moveTo(colX + (colW-4), y + 4);
        ctx.lineTo(colX + (colW-4), y + h - 4);
        ctx.stroke();
    }

    // background for columns (slightly darker)
    ctx.fillStyle = "#222";
    ctx.fillRect(x + 4, y + 4, w - 8, h - 8);

    // draw each digit column
    drawDigitColumn(colX0, posInt);
    // decimal dot separator
    ctx.fillStyle = "#111";
    ctx.fillRect(colX1 - 6, y + h/2 - 2, 4, 4); // small separator bar (visual)
    drawDigitColumn(colX1, posD1);
    drawDigitColumn(colX2, posD2);

    // draw decimal point visually between col0 and col1 (small white dot)
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(x + colW + 2, y + h/2, 3.5, 0, 2*Math.PI);
    ctx.fill();

    // label 'MACH' left of drum
    ctx.fillStyle = "#000";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "left";
    ctx.fillStyle = "#000";
    // draw subtle label on top border
    ctx.fillStyle = "#e8f1f2";
    ctx.fillText("MACH", x + 6, y - 6);
}

// animation loop and draw everything
function render() {
    // smooth currentKias toward targetKias
    currentKias += (targetKias - currentKias) * smoothFactor;

    drawBackground();
    drawBands();
    drawTicks();
    drawIndicator(currentKias);

    // Draw drum showing Mach value (based on currentKias)
    const mach = kiasToMach(currentKias);
    drawDrum(mach);

    requestAnimationFrame(render);
}

// input handler
input.addEventListener("input", () => {
    targetKias = parseInt(input.value, 10);
    valor.textContent = targetKias;
});

// initialize
targetKias = parseInt(input.value, 10) || 0;
currentKias = targetKias;
render();
