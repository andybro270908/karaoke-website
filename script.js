stopBtn.disabled = true;
const audioFileInput = document.getElementById("audioFile");
const lyricsFileInput = document.getElementById("lyricsFile");
const startBtn = document.getElementById("startKaraoke");
const audioPlayer = document.getElementById("audioPlayer");
const lyricsList = document.getElementById("lyricsList");

let lyricsLines = [];
let currentLineIndex = 0;
let lineDuration = 0;

// Load audio
audioFileInput.addEventListener("change", () => {
  const file = audioFileInput.files[0];
  if (file) {
    audioPlayer.src = URL.createObjectURL(file);
  }
});

// Load lyrics
lyricsFileInput.addEventListener("change", () => {
  const file = lyricsFileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    lyricsLines = reader.result
      .split("\n")
      .map(line => line.trim())
      .filter(line => line !== "");

    lyricsList.innerHTML = "";
    lyricsLines.forEach(line => {
      const li = document.createElement("li");
      li.textContent = line;
      lyricsList.appendChild(li);
    });
  };
  reader.readAsText(file);
});

// Start karaoke
startBtn.addEventListener("click", () => {
  if (!audioPlayer.src || lyricsLines.length === 0) {
    alert("Please upload audio and lyrics first");
    return;
  }

  audioPlayer.play();
  currentLineIndex = 0;

  const totalDuration = audioPlayer.duration;
  lineDuration = totalDuration / lyricsLines.length;

  highlightLine(0);

  setInterval(() => {
    const currentTime = audioPlayer.currentTime;
    const newIndex = Math.floor(currentTime / lineDuration);

    if (newIndex !== currentLineIndex && newIndex < lyricsLines.length) {
      highlightLine(newIndex);
    }
  }, 300);
});

function highlightLine(index) {
  const allLines = lyricsList.querySelectorAll("li");

  allLines.forEach(li => li.classList.remove("active"));

  if (allLines[index]) {
    allLines[index].classList.add("active");
    allLines[index].scrollIntoView({ behavior: "smooth", block: "center" });
    currentLineIndex = index;
  }
}

// =========================
// VOICE RECORDING LOGIC
// =========================

let mediaRecorder;
let recordedChunks = [];

const recordBtn = document.getElementById("recordBtn");
const stopBtn = document.getElementById("stopBtn");
const recordedAudio = document.getElementById("recordedAudio");

recordBtn.addEventListener("click", async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    recordedChunks = [];

    mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: "audio/webm" });
      recordedAudio.src = URL.createObjectURL(blob);
    };

    mediaRecorder.start();
    recordBtn.disabled = true;
    stopBtn.disabled = false;
  } catch (err) {
    alert("Microphone access denied or not available");
  }
});

stopBtn.addEventListener("click", () => {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    recordBtn.disabled = false;
    stopBtn.disabled = true;
  }
});
