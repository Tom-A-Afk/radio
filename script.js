const knob = document.getElementById('knob');
const display = document.getElementById('display');
const audio = document.getElementById('audio');

let isDragging = false;
let startAngle = 0;
let currentAngle = 0;
let isPlaying = false;

// Web Audio API for generated sound
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const oscillator = audioContext.createOscillator();
const gainNode = audioContext.createGain();
oscillator.connect(gainNode);
gainNode.connect(audioContext.destination);
oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
oscillator.start();

function updateFrequency() {
    const minFreq = 88.0;
    const maxFreq = 108.0;
    const freq = minFreq + (currentAngle / (2 * Math.PI)) * (maxFreq - minFreq);
    display.textContent = freq.toFixed(1);

    if (Math.abs(freq - 89.0) < 0.1) {
        if (!isPlaying) {
            // Try to play audio file first
            audio.play().then(() => {
                isPlaying = true;
            }).catch(() => {
                // If audio file fails, use generated sound
                if (audioContext.state === 'suspended') {
                    audioContext.resume();
                }
                oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                isPlaying = true;
            });
        }
    } else {
        if (isPlaying) {
            audio.pause();
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            isPlaying = false;
        }
    }
}

function getEventPosition(e) {
    if (e.touches && e.touches.length > 0) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else {
        return { x: e.clientX, y: e.clientY };
    }
}

knob.addEventListener('mousedown', startDrag);
knob.addEventListener('touchstart', startDrag);

document.addEventListener('mousemove', drag);
document.addEventListener('touchmove', drag);

document.addEventListener('mouseup', endDrag);
document.addEventListener('touchend', endDrag);

function startDrag(e) {
    isDragging = true;
    const rect = knob.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const pos = getEventPosition(e);
    const startX = pos.x - centerX;
    const startY = pos.y - centerY;
    startAngle = Math.atan2(startY, startX);
    e.preventDefault();
}

function drag(e) {
    if (!isDragging) return;
    const rect = knob.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const pos = getEventPosition(e);
    const currentX = pos.x - centerX;
    const currentY = pos.y - centerY;
    const currentMouseAngle = Math.atan2(currentY, currentX);
    let deltaAngle = currentMouseAngle - startAngle;
    deltaAngle = ((deltaAngle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
    if (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
    currentAngle += deltaAngle;
    startAngle = currentMouseAngle;
    knob.style.transform = `rotate(${currentAngle}rad)`;
    updateFrequency();
    e.preventDefault();
}

function endDrag(e) {
    isDragging = false;
}

// Initial update
updateFrequency();