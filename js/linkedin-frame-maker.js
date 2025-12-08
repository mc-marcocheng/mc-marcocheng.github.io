const imageInput = document.getElementById('imageInput');
const downloadBtn = document.getElementById('downloadBtn');
const zoomSlider = document.getElementById('zoomSlider');
const textInput = document.getElementById('textInput');

let userImg = null;

let imgX = 0;
let imgY = 0;
let isDragging = false;
let startX, startY;

let sketch = function(p) {
    p.setup = function() {
        let p5canvas = p.createCanvas(400, 400);
        p5canvas.parent('avatarCanvasContainer');
        p.textFont('Montserrat');

        // Listeners
        imageInput.addEventListener('change', handleFile);
        zoomSlider.addEventListener('input', () => p.redraw());
        textInput.addEventListener('input', () => p.redraw());
        downloadBtn.addEventListener('click', downloadAvatar);

        // Panning Event Listeners
        p5canvas.elt.addEventListener('mousedown', startDrag);
        p5canvas.elt.addEventListener('mousemove', drag);
        p5canvas.elt.addEventListener('mouseup', endDrag);
        p5canvas.elt.addEventListener('mouseleave', endDrag);
        p5canvas.elt.addEventListener('touchstart', startDrag, {passive: false});
        p5canvas.elt.addEventListener('touchmove', drag, {passive: false});
        p5canvas.elt.addEventListener('touchend', endDrag);

        p.noLoop();
    };

    p.draw = function() {
        p.clear();
        p.background(240);

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

        drawChristmasGradientArc(p, finalStart, finalEnd);
        drawCenteredArcText(p, reversedMsg, finalStart, finalEnd, charSpacingAngle);
    };


    function startDrag(e) {
        isDragging = true;
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let clientY = e.touches ? e.touches[0].clientY : e.clientY;
        startX = clientX - imgX;
        startY = clientY - imgY;
    }

    function drag(e) {
        if (!isDragging || !userImg) return;
        e.preventDefault();
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let clientY = e.touches ? e.touches[0].clientY : e.clientY;
        imgX = clientX - startX;
        imgY = clientY - startY;
        p.redraw();
    }

    function endDrag() {
        isDragging = false;
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
        p.fill(220);
        p.rect(0, 0, p.width, p.height);
        p.fill(100);
        p.noStroke();
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(16);
        p.text("Upload Photo", p.width/2, p.height/2);
    }

    function drawChristmasGradientArc(p, startDeg, endDeg) {
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

        // Fade in
        grad.addColorStop(0, 'rgba(212, 36, 38, 0)');
        grad.addColorStop(0.1 * spanRatio, '#d42426');

        // Transition
        grad.addColorStop(0.5 * spanRatio, '#2a9d8f');

        // Fade out
        grad.addColorStop(0.9 * spanRatio, '#2a9d8f');
        grad.addColorStop(spanRatio, 'rgba(42, 157, 143, 0)');

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
        p.fill(255);
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
        p.saveCanvas(fileName || 'christmas-avatar', 'png');
    }
};

new p5(sketch);
