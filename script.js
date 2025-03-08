const canvas = document.getElementById('signatureCanvas');
const ctx = canvas.getContext('2d');
const toolSelect = document.getElementById('tool');
const colorInput = document.getElementById('color');
const sizeInput = document.getElementById('size');
const clearButton = document.getElementById('clear');
const formatSelect = document.getElementById('format');
const downloadButton = document.getElementById('download');
const increaseEraserButton = document.getElementById('increaseEraser');
const decreaseEraserButton = document.getElementById('decreaseEraser');
const colorBoxes = document.querySelectorAll('.color-box');

let isDrawing = false;
let currentTool = 'pen';
let currentColor = '#000000';
let currentSize = 5;

// Set initial canvas background to white
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Set canvas size based on device
function setCanvasSize() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
}

setCanvasSize();
window.addEventListener('resize', setCanvasSize);

// Event Listeners for Mouse and Touch
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

canvas.addEventListener('touchstart', startDrawingTouch, { passive: false });
canvas.addEventListener('touchmove', drawTouch, { passive: false });
canvas.addEventListener('touchend', stopDrawing);

toolSelect.addEventListener('change', (e) => {
  currentTool = e.target.value;
  updateToolSettings();
});

colorInput.addEventListener('change', (e) => {
  currentColor = e.target.value;
});

sizeInput.addEventListener('change', (e) => {
  currentSize = e.target.value;
});

clearButton.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
});

downloadButton.addEventListener('click', () => {
  const format = formatSelect.value;
  let image;

  if (format === 'jpg-no-bg' || format === 'png-no-bg') {
    // Create a temporary canvas to remove the background
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    // Draw the signature on the temporary canvas
    tempCtx.drawImage(canvas, 0, 0);

    // Get the image data and remove the white background
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // If the pixel is white, set it to transparent
      if (r === 255 && g === 255 && b === 255) {
        data[i + 3] = 0; // Set alpha to 0
      }
    }

    tempCtx.putImageData(imageData, 0, 0);

    // Determine the format for no background images
    if (format === 'jpg-no-bg') {
      image = tempCanvas.toDataURL('image/jpeg');
    } else {
      image = tempCanvas.toDataURL('image/png');
    }
  } else {
    // For images with background
    if (format === 'jpg') {
      image = canvas.toDataURL('image/jpeg');
    } else {
      image = canvas.toDataURL('image/png');
    }
  }

  // Create a download link
  const link = document.createElement('a');
  link.href = image;
  link.download = `signature.${format.split('-')[0]}`; // Remove "-no-bg" from filename
  link.click();
});

colorBoxes.forEach((box) => {
  box.addEventListener('click', () => {
    currentColor = box.getAttribute('data-color');
    colorInput.value = currentColor;
  });
});

increaseEraserButton.addEventListener('click', () => {
  currentSize = Math.min(50, currentSize + 2);
  sizeInput.value = currentSize;
});

decreaseEraserButton.addEventListener('click', () => {
  currentSize = Math.max(1, currentSize - 2);
  sizeInput.value = currentSize;
});

function updateToolSettings() {
  switch (currentTool) {
    case 'pen':
      ctx.lineWidth = currentSize;
      ctx.lineCap = 'round';
      break;
    case 'fountain':
      ctx.lineWidth = currentSize;
      ctx.lineCap = 'square';
      break;
    case 'marker':
      ctx.lineWidth = currentSize * 2;
      ctx.lineCap = 'round';
      break;
    case 'eraser':
      ctx.lineWidth = currentSize * 2;
      ctx.lineCap = 'round';
      break;
  }
}

function startDrawing(e) {
  e.preventDefault(); // Prevent default behavior for touch devices
  isDrawing = true;
  draw(e);
}

function draw(e) {
  if (!isDrawing) return;

  if (currentTool === 'eraser') {
    ctx.strokeStyle = 'white';
  } else {
    ctx.strokeStyle = currentColor;
  }

  const x = e.offsetX || e.touches[0].clientX - canvas.getBoundingClientRect().left;
  const y = e.offsetY || e.touches[0].clientY - canvas.getBoundingClientRect().top;

  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
}

function startDrawingTouch(e) {
  e.preventDefault(); // Prevent default behavior for touch devices
  isDrawing = true;
  drawTouch(e);
}

function drawTouch(e) {
  if (!isDrawing) return;

  if (currentTool === 'eraser') {
    ctx.strokeStyle = 'white';
  } else {
    ctx.strokeStyle = currentColor;
  }

  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;

  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
}

function stopDrawing() {
  isDrawing = false;
  ctx.beginPath();
}