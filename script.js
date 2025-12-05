const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const preview = document.getElementById("selfiePreview");

// Start camera
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => video.srcObject = stream);

// Capture selfie
document.getElementById("snap").addEventListener("click", () => {
  // Match canvas size to video resolution
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // Draw full-resolution frame
  canvas.getContext("2d").drawImage(video, 0, 0);

  // Show the preview
  preview.src = canvas.toDataURL("image/png");
  preview.style.display = "block";
});

// Upload selfie + generate QR
function sendData() {
  const image = canvas.toDataURL("image/png");

  fetch("https://script.google.com/macros/s/AKfycbzCg08shD79LQNs7bZCNEf_On-BnTL0D0nHrOu5PlTZI66N5d1bmkUU1ft01tpm_K8tIA/exec", {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image })
  });

  document.getElementById("msg").innerText = "Generating QR...";

  setTimeout(() => {
    fetch("https://script.google.com/macros/s/AKfycbzCg08shD79LQNs7bZCNEf_On-BnTL0D0nHrOu5PlTZI66N5d1bmkUU1ft01tpm_K8tIA/exec")
      .then(r => r.text())
      .then(url => {
        const qrUrl =
          `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
        
        document.getElementById("qrCode").src = qrUrl;
      });
  }, 2000);
}
