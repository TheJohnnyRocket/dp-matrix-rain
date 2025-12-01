const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');

const chars = 'dp';
const charArray = chars.split('');
const fontSize = 14; // Smaller font for more density
let columns;
let drops = [];
let drops2 = []; // Extra rain layer 1
let drops3 = []; // Extra rain layer 2

// Logo mask data
let logoMask = [];
let logoWidth = 0;
let logoHeight = 0;
let logoX = 0;
let logoY = 0;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    columns = Math.floor(canvas.width / fontSize);
    initDrops();
    createLogoMask();
}

function createLogoMask() {
    // Create off-screen canvas for logo
    const offCanvas = document.createElement('canvas');
    const offCtx = offCanvas.getContext('2d');

    // Use heavy sans-serif font for the logo - MASSIVE (80% of screen)
    const logoFontSize = Math.min(canvas.width, canvas.height) * 0.8;
    offCtx.font = `italic 900 ${logoFontSize}px Arial Black, Impact, sans-serif`;

    // Measure the text
    const metrics = offCtx.measureText('dp');
    logoWidth = Math.ceil(metrics.width);
    logoHeight = Math.ceil(logoFontSize * 1.2); // Account for descent

    // Center the logo
    logoX = Math.floor((canvas.width - logoWidth) / 2);
    logoY = Math.floor((canvas.height - logoHeight) / 2);

    // Set canvas size and draw logo
    offCanvas.width = logoWidth;
    offCanvas.height = logoHeight;
    offCtx.font = `italic 900 ${logoFontSize}px Arial Black, Impact, sans-serif`;
    offCtx.fillStyle = 'white';
    offCtx.textBaseline = 'middle';
    offCtx.textAlign = 'center';
    offCtx.fillText('dp', logoWidth / 2, logoHeight / 2);

    // Get pixel data
    const imageData = offCtx.getImageData(0, 0, logoWidth, logoHeight);
    const data = imageData.data;

    // Create mask array - true where logo text exists
    logoMask = [];
    for (let y = 0; y < logoHeight; y++) {
        logoMask[y] = [];
        for (let x = 0; x < logoWidth; x++) {
            const i = (y * logoWidth + x) * 4;
            // Check alpha channel - if > 128, it's part of the logo
            logoMask[y][x] = data[i + 3] > 128;
        }
    }
}

function initDrops() {
    drops = [];
    drops2 = [];
    drops3 = [];
    for (let i = 0; i < columns; i++) {
        drops[i] = Math.floor(Math.random() * -100);
        drops2[i] = Math.floor(Math.random() * -100);
        drops3[i] = Math.floor(Math.random() * -100);
    }
}

function isInLogo(x, y) {
    // Convert canvas coordinates to logo mask coordinates
    const maskX = x - logoX;
    const maskY = y - logoY;

    if (maskX >= 0 && maskX < logoWidth && maskY >= 0 && maskY < logoHeight) {
        return logoMask[maskY] && logoMask[maskY][maskX];
    }
    return false;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function draw() {
    // Semi-transparent black for fading trail - restored to previous value
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = 'italic ' + fontSize + 'px monospace';

    for (let i = 0; i < columns; i++) {
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Check if this position is in the logo
        if (isInLogo(x, y)) {
            // Glow effect for maximum brightness
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00ff00';
            ctx.fillStyle = '#00ff00'; // Reverted to pure green as requested
        } else {
            // No glow for background
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(0, 255, 0, 0.15)';
        }

        ctx.fillText(text, x, y);

        // Reset shadow for next iteration
        ctx.shadowBlur = 0;

        // Reset drops that go off screen - increased probability for more density
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.95) {
            drops[i] = 0;
        }

        drops[i]++;
    }

    // Extra rain layers for logo ONLY
    drawExtraLayer(drops2);
    drawExtraLayer(drops3);
}

function drawExtraLayer(layerDrops) {
    for (let i = 0; i < columns; i++) {
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        const x = i * fontSize;
        const y = layerDrops[i] * fontSize;

        // ONLY draw if in logo
        if (isInLogo(x, y)) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00ff00';
            ctx.fillStyle = '#00ff00'; // Pure green, no white shades
            ctx.fillText(text, x, y);
            ctx.shadowBlur = 0;
        }

        if (layerDrops[i] * fontSize > canvas.height && Math.random() > 0.95) {
            layerDrops[i] = 0;
        }
        layerDrops[i]++;
    }
}

setInterval(draw, 55); // Another 25% slower (44 * 1.25 = 55)
