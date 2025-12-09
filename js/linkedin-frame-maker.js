const imageInput = document.getElementById('imageInput');
const downloadBtn = document.getElementById('downloadBtn');
const zoomSlider = document.getElementById('zoomSlider');
const textInput = document.getElementById('textInput');
const fileUploadBtnLabel = document.querySelector('.file-upload-btn');

// Modal Elements
const openColorModalBtn = document.getElementById('openColorModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const applyModalBtn = document.getElementById('applyModalBtn');
const colorModal = document.getElementById('colorModal');
const textColorPicker = document.getElementById('textColorPicker');
const textColorLabel = document.getElementById('textColorLabel');
const textColorRow = document.getElementById('textColorRow');
const ribbonColorsList = document.getElementById('ribbonColorsList');
const addRibbonColorBtn = document.getElementById('addRibbonColorBtn');

// Variables
let userImg = null;
let imgX = 0;
let imgY = 0;
let isDragging = false;
let startX, startY;

// Default Colors
let ribbonColors = ['#d42426', '#2a9d8f']; // Red, Teal
let currentTextColor = '#ffffff';
let currentHoverBg = '#fff0f0';

// --- Modal Logic ---

function toggleModal(show) {
    if (show) {
        colorModal.classList.remove('tw-hidden');
        // Small timeout to allow display change to register before opacity transition
        setTimeout(() => colorModal.classList.add('open'), 10);
    } else {
        colorModal.classList.remove('open');
        setTimeout(() => colorModal.classList.add('tw-hidden'), 200);
    }
}

// Global Listeners (These run immediately)
openColorModalBtn.addEventListener('click', () => toggleModal(true));
closeModalBtn.addEventListener('click', () => toggleModal(false));
applyModalBtn.addEventListener('click', () => toggleModal(false));

textColorRow.addEventListener('click', (e) => {
    // Prevent infinite loop if clicking the input itself triggers bubbling
    if(e.target !== textColorPicker) {
        textColorPicker.click();
    }
});

// --- P5 Sketch ---

let sketch = function(p) {

    // --- UI THEME UPDATE LOGIC ---
    function updateUITheme() {
        if (ribbonColors.length === 0) return;

        // 1. Download Button Gradient
        let gradientColors = ribbonColors.length === 1
            ? `${ribbonColors[0]}, ${ribbonColors[0]}`
            : ribbonColors.join(', ');

        if(downloadBtn) {
            downloadBtn.style.background = `linear-gradient(45deg, ${gradientColors})`;
        }

        // 2. Upload Button & Slider (Primary Color)
        const primaryColorStr = ribbonColors[0];

        if(fileUploadBtnLabel) {
            fileUploadBtnLabel.style.borderColor = primaryColorStr;
            fileUploadBtnLabel.style.color = primaryColorStr;
        }
        if(zoomSlider) {
            zoomSlider.style.accentColor = primaryColorStr;
        }

        if(textInput) {
            textInput.style.setProperty('--active-border-color', primaryColorStr);
            textInput.style.borderColor = '';
        }

        // 3. Calculate Hover Background
        // Safely use p5 color functions
        try {
            const primaryColor = p.color(primaryColorStr);
            let white = p.color(255);
            let lightTint = p.lerpColor(primaryColor, white, 0.92); // 92% white mix
            currentHoverBg = `rgba(${lightTint.levels[0]}, ${lightTint.levels[1]}, ${lightTint.levels[2]}, ${lightTint.levels[3]/255})`;
        } catch (e) {
            console.warn("Color calculation failed", e);
            currentHoverBg = '#f0f0f0';
        }
    }

    // --- Hover Listeners for Upload Button ---
    if(fileUploadBtnLabel) {
        fileUploadBtnLabel.addEventListener('mouseenter', () => {
            fileUploadBtnLabel.style.backgroundColor = currentHoverBg;
        });
        fileUploadBtnLabel.addEventListener('mouseleave', () => {
            fileUploadBtnLabel.style.backgroundColor = 'transparent';
        });
    }

    p.setup = function() {
        p.pixelDensity(2);
        let p5canvas = p.createCanvas(400, 400);
        p5canvas.parent('avatarCanvasContainer');
        p.textFont('Montserrat');

        // Listeners
        imageInput.addEventListener('change', handleFile);
        zoomSlider.addEventListener('input', () => p.redraw());
        textInput.addEventListener('input', () => p.redraw());
        downloadBtn.addEventListener('click', downloadAvatar);

        // Modal Input Listeners
        textColorPicker.addEventListener('input', (e) => {
            currentTextColor = e.target.value;
            textColorLabel.textContent = currentTextColor.toUpperCase();
            p.redraw();
        });

        addRibbonColorBtn.addEventListener('click', () => {
            const lastColor = ribbonColors[ribbonColors.length - 1] || '#000000';
            ribbonColors.push(lastColor);
            renderRibbonInputs();
            updateUITheme();
            p.redraw();
        });

        // Mouse/Touch Interaction
        p5canvas.elt.addEventListener('mousedown', startDrag);
        p5canvas.elt.addEventListener('touchstart', startDrag, {passive: false});

        window.addEventListener('mousemove', drag);
        window.addEventListener('touchmove', drag, {passive: false});

        window.addEventListener('mouseup', endDrag);
        window.addEventListener('touchend', endDrag);

        p5canvas.mouseWheel(handleScrollZoom);

        // **Initialize UI here (safe for p5 functions)**
        renderRibbonInputs();
        updateUITheme();

        p.noLoop();
    };

    p.draw = function() {
        p.clear();
        p.background(255, 0);

        // 1. Draw Image
        p.push();
        let ctx = p.drawingContext;
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.width/2, p.height/2, p.width/2, 0, Math.PI * 2);
        ctx.clip();

        if (userImg) {
            let zoom = parseFloat(zoomSlider.value);
            let aspect = userImg.width / userImg.height;
            let drawWidth, drawHeight;

            if (aspect > 1) {
                drawHeight = p.height * zoom;
                drawWidth = drawHeight * aspect;
            } else {
                drawWidth = p.width * zoom;
                drawHeight = drawWidth / aspect;
            }

            p.imageMode(p.CENTER);
            p.image(userImg, (p.width/2) + imgX, (p.height/2) + imgY, drawWidth, drawHeight);
        } else {
            drawPlaceholder(p);
        }
        ctx.restore();
        p.pop();

        // 2. Arc Logic
        let defaultStart = 160;
        let defaultEnd = 300;
        let centerDeg = (defaultStart + defaultEnd) / 2;

        let msg = textInput.value || " ";
        let reversedMsg = msg.split('').reverse().join('').toUpperCase();

        p.textSize(p.width * 0.075);
        p.textStyle(p.BOLD);

        let weight = p.width * 0.14;
        let r = (p.width / 2) - (weight / 2);

        let charSpacingAngle = p.radians(1.0);
        let totalTextAngle = 0;

        for (let i = 0; i < reversedMsg.length; i++) {
            let w = p.textWidth(reversedMsg.charAt(i));
            totalTextAngle += (w / r) + (i > 0 ? charSpacingAngle : 0);
        }

        let textSpanDeg = p.degrees(totalTextAngle);
        let paddingDeg = 25;
        let requiredSpan = textSpanDeg + paddingDeg;
        let defaultSpan = defaultEnd - defaultStart;

        let finalStart = defaultStart;
        let finalEnd = defaultEnd;

        if (requiredSpan > defaultSpan) {
            let halfSpan = requiredSpan / 2;
            finalStart = centerDeg - halfSpan;
            finalEnd = centerDeg + halfSpan;
        }

        // 3. Draw Elements
        drawMultiColorGradientArc(p, finalStart, finalEnd);
        drawCenteredArcText(p, reversedMsg, finalStart, finalEnd, charSpacingAngle);
    };

    // --- Helper Functions ---

    function renderRibbonInputs() {
        ribbonColorsList.innerHTML = '';

        ribbonColors.forEach((color, index) => {
            const row = document.createElement('div');
            row.className = 'color-picker-row';

            const input = document.createElement('input');
            input.type = 'color';
            input.value = color;
            input.addEventListener('input', (e) => {
                ribbonColors[index] = e.target.value;
                label.textContent = e.target.value.toUpperCase();
                updateUITheme();
                p.redraw();
            });

            const label = document.createElement('span');
            label.className = 'color-label-text';
            label.textContent = color.toUpperCase();

            const delBtn = document.createElement('button');
            delBtn.className = 'remove-color-btn';
            delBtn.innerHTML = '<i class="bi bi-trash"></i>';
            if (ribbonColors.length <= 1) {
                delBtn.style.display = 'none';
            }

            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                ribbonColors.splice(index, 1);
                renderRibbonInputs();
                updateUITheme();
                p.redraw();
            });

            row.addEventListener('click', (e) => {
                if (e.target !== input && e.target !== delBtn && !delBtn.contains(e.target)) {
                    input.click();
                }
            });

            row.appendChild(input);
            row.appendChild(label);
            row.appendChild(delBtn);
            ribbonColorsList.appendChild(row);
        });
    }

    function startDrag(e) {
        if (!userImg) return;
        isDragging = true;
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let clientY = e.touches ? e.touches[0].clientY : e.clientY;
        startX = clientX - imgX;
        startY = clientY - imgY;
    }

    function drag(e) {
        if (!isDragging || !userImg) return;
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let clientY = e.touches ? e.touches[0].clientY : e.clientY;
        imgX = clientX - startX;
        imgY = clientY - startY;
        p.redraw();
    }

    function endDrag() {
        isDragging = false;
    }

    function handleScrollZoom(event) {
        if (!userImg) return false;
        let zoomStep = 0.1;
        let currentZoom = parseFloat(zoomSlider.value);
        if (event.deltaY > 0) {
            zoomSlider.value = Math.max(parseFloat(zoomSlider.min), currentZoom - zoomStep);
        } else {
            zoomSlider.value = Math.min(parseFloat(zoomSlider.max), currentZoom + zoomStep);
        }
        p.redraw();
        return false;
    }

    function handleFile(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image')) {
            const url = URL.createObjectURL(file);
            p.loadImage(url, (img) => {
                userImg = img;
                imgX = 0;
                imgY = 0;
                p.redraw();
            });
        }
    }

    function drawPlaceholder(p) {
        p.fill(245);
        p.rect(0, 0, p.width, p.height);
        p.textStyle(p.NORMAL);
        p.fill(180);
        p.noStroke();
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(16);
        p.text("No Image Selected", p.width/2, p.height/2);
    }

    function drawMultiColorGradientArc(p, startDeg, endDeg) {
        if (ribbonColors.length === 0) return;

        let colorsToDraw = [...ribbonColors].reverse();

        p.push();
        p.noFill();
        p.strokeCap(p.ROUND);

        let weight = p.width * 0.14;
        p.strokeWeight(weight);

        let ctx = p.drawingContext;
        let startRad = p.radians(startDeg - 90);
        let grad = ctx.createConicGradient(startRad, p.width/2, p.height/2);

        let spanDeg = endDeg - startDeg;
        let spanRatio = spanDeg / 360.0;

        let fadePct = 0.1;

        grad.addColorStop(0, 'rgba(0,0,0,0)');

        let firstColor = p.color(colorsToDraw[0]);
        let firstColorTransparent = p.color(colorsToDraw[0]);
        firstColorTransparent.setAlpha(0);

        grad.addColorStop(0, firstColorTransparent.toString());
        grad.addColorStop(fadePct * spanRatio, firstColor.toString());

        let activeStart = fadePct * spanRatio;
        let activeEnd = (1 - fadePct) * spanRatio;
        let activeSpan = activeEnd - activeStart;

        if (colorsToDraw.length > 1) {
            for (let i = 0; i < colorsToDraw.length; i++) {
                let relativePos = i / (colorsToDraw.length - 1);
                let actualPos = activeStart + (relativePos * activeSpan);
                grad.addColorStop(actualPos, colorsToDraw[i]);
            }
        } else {
            grad.addColorStop(activeStart, colorsToDraw[0]);
            grad.addColorStop(activeEnd, colorsToDraw[0]);
        }

        let lastColor = p.color(colorsToDraw[colorsToDraw.length - 1]);
        let lastColorTransparent = p.color(colorsToDraw[colorsToDraw.length - 1]);
        lastColorTransparent.setAlpha(0);

        grad.addColorStop((1 - fadePct) * spanRatio, lastColor.toString());
        grad.addColorStop(spanRatio, lastColorTransparent.toString());
        grad.addColorStop(spanRatio + 0.001, 'rgba(0,0,0,0)');

        ctx.strokeStyle = grad;

        let diameter = p.width - weight;
        p.arc(p.width/2, p.height/2, diameter, diameter, p.radians(startDeg - 90), p.radians(endDeg - 90));
        p.pop();
    }

    function drawCenteredArcText(p, message, startDeg, endDeg, charSpacingAngle) {
        if (!message) return;

        p.push();
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(p.width * 0.075);
        p.textStyle(p.BOLD);
        p.fill(currentTextColor);
        p.noStroke();

        let weight = p.width * 0.14;
        let r = (p.width / 2) - (weight / 2);

        let totalTextAngle = 0;
        for (let i = 0; i < message.length; i++) {
            let w = p.textWidth(message.charAt(i));
            totalTextAngle += (w / r) + (i > 0 ? charSpacingAngle : 0);
        }

        let centerAngle = p.radians((startDeg + endDeg) / 2);
        let currentAngle = centerAngle - (totalTextAngle / 2);

        let verticalNudge = -p.textSize() * 0.1;

        for (let i = 0; i < message.length; i++) {
            let char = message.charAt(i);
            let charW = p.textWidth(char);
            let charAngle = charW / r;

            let theta = currentAngle + (charAngle / 2);

            p.push();
            p.translate(p.width/2, p.height/2);
            p.rotate(theta);
            p.translate(0, -r);
            p.rotate(p.PI);
            p.text(char, 0, verticalNudge);
            p.pop();

            currentAngle += charAngle + charSpacingAngle;
        }
        p.pop();
    }

    function downloadAvatar() {
        let fileName = textInput.value.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        p.saveCanvas(fileName || 'marco-frame', 'png');
    }
};

new p5(sketch);
