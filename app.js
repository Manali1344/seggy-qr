// ---------- CONFIG ----------
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbznpLyWPppgG5JSpBHS0UvL-MvsaYcyC1RDg26a37e1D9kULDDVoBhfi3WkJGS43yms/exec"; // <<< REPLACE THIS
const FILENAME_PREFIX = "selfie_"; // optional
// ----------------------------

const video = document.getElementById("video");
const previewImg = document.getElementById("preview");
const captureBtn = document.getElementById("captureBtn");
const retakeBtn = document.getElementById("retakeBtn");
const uploadBtn = document.getElementById("uploadBtn");
const statusEl = document.getElementById("status");
const resultWrap = document.querySelector(".result-wrap");
const qrCanvas = document.getElementById("qrCanvas");
const downloadLink = document.getElementById("downloadLink");
const copyLinkBtn = document.getElementById("copyLinkBtn");

let localBlobDataUrl = null;

// Start camera
async function startCamera(){
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
    video.srcObject = stream;
  } catch (err) {
    statusEl.textContent = "Error accessing camera: " + err.message;
  }
}
startCamera();

// Capture snapshot
captureBtn.addEventListener("click", () => {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth || 1280;
  canvas.height = video.videoHeight || 720;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL("image/png");
  previewImg.src = dataUrl;
  localBlobDataUrl = dataUrl;
  statusEl.textContent = "Snapshot ready.";
});

// Retake
retakeBtn.addEventListener("click", () => {
  previewImg.src = "";
  localBlobDataUrl = null;
  resultWrap.style.display = "none";
  statusEl.textContent = "";
});

// Upload to GAS + get public Drive link
uploadBtn.addEventListener("click", async () => {
  if (!localBlobDataUrl) return alert("Take a selfie first.");
  statusEl.textContent = "Uploading to Google Drive...";
  uploadBtn.disabled = true;

  try {
    const payload = { image: localBlobDataUrl };
    const res = await fetch(GAS_WEB_APP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.status && data.status === "error") {
      throw new Error(data.message || "Unknown error from server");
    }

    const downloadUrl = data.download_url;
    // Show QR
    new QRious({
      element: qrCanvas,
      value: downloadUrl,
      size: 250
    });

    // Show link
    downloadLink.href = downloadUrl;
    downloadLink.textContent = downloadUrl;

    resultWrap.style.display = "block";
    statusEl.textContent = "Uploaded. Scan QR or open link to download.";
  } catch (err) {
    statusEl.textContent = "Upload failed: " + (err.message || err);
  } finally {
    uploadBtn.disabled = false;
  }
});

// Copy link
copyLinkBtn.addEventListener("click", async () => {
  const url = downloadLink.href;
  if (!url) return;
  try {
    await navigator.clipboard.writeText(url);
    statusEl.textContent = "Link copied to clipboard.";
  } catch {
    statusEl.textContent = "Copy failed — open link and copy manually.";
  }
});
