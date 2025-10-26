const input = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const result = document.getElementById('result');
const preview = document.getElementById('preview');

dropZone.addEventListener('dragover', e => {
  e.preventDefault();
  dropZone.style.borderColor = '#007aff';
});

dropZone.addEventListener('dragleave', () => {
  dropZone.style.borderColor = 'rgba(255,255,255,0.4)';
});

dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.style.borderColor = 'rgba(255,255,255,0.4)';
  handleFile(e.dataTransfer.files[0]);
});

input.addEventListener('change', e => handleFile(e.target.files[0]));

function handleFile(file) {
  if (!file) return;
  result.textContent = "Analyzing...";
  preview.innerHTML = "";
  const reader = new FileReader();
  reader.onload = function(event) {
    const img = new Image();
    img.onload = () => analyzeImage(img, file, event.target.result);
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

function analyzeImage(img, file, dataUrl) {
  let score = 0;
  const hints = [];

  // Display preview
  preview.innerHTML = `<img src="${dataUrl}" alt="preview"/>`;

  // Filename
  if (file.name.match(/screenshot|screen shot/i)) {
    score += 40;
    hints.push("Filename suggests screenshot");
  }

  // Type
  if (file.type === "image/png") {
    score += 20;
    hints.push("PNG format (common for screenshots)");
  }

  // Dimensions
  const w = img.width, h = img.height;
  const knownRes = [[1170,2532],[1284,2778],[1080,2400],[1440,3200]];
  if (knownRes.some(([x,y]) => x===w && y===h)) {
    score += 20;
    hints.push("Matches known device resolution");
  }

  // EXIF
  EXIF.getData(img, function() {
    const meta = EXIF.getAllTags(this);
    if (Object.keys(meta).length === 0) {
      score += 20;
      hints.push("No EXIF data (typical of screenshots)");
    } else {
      hints.push("EXIF data found (likely a camera photo)");
    }

    // Verdict
    const confidence = Math.min(100, score);
    const verdict = confidence >= 60 ? "📱 Screenshot" : "📷 Photo";
    result.innerHTML = `<b>${verdict}</b><br><div class='progress-bar' style='width:${confidence}%'></div><br>${hints.join("<br>")}`;
  });
}
