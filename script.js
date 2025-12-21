// ELEMENTS
const audioFileInput = document.getElementById("audioFile");
const lyricsFileInput = document.getElementById("lyricsFile");
const startBtn = document.getElementById("startKaraoke");
const audioPlayer = document.getElementById("audioPlayer");
const lyricsList = document.getElementById("lyricsList");
const recordBtn = document.getElementById("recordBtn");
const stopBtn = document.getElementById("stopBtn");
const recordedAudio = document.getElementById("recordedAudio");

stopBtn.disabled = true;

let lyricsLines = [];
let currentLine = 0;

// LOAD AUDIO
audioFileInput.addEventListener("change", () => {
  audioPlayer.src = URL.createObjectURL(audioFileInput.files[0]);
});

// LOAD LYRICS
lyricsFileInput.addEventListener("change", () => {
  const reader = new FileReader();
  reader.onload = () => {
    lyricsLines = reader.result
      .split("\n")
      .map(l => l.trim())
      .filter(Boolean);

    lyricsList.innerHTML = "";
    lyricsLines.forEach(line => {
      const li = document.createElement("li");
      li.textContent = line;
      lyricsList.appendChild(li);
    });
  };
  reader.readAsText(lyricsFileInput.files[0]);
});

// START KARAOKE
startBtn.addEventListener("click", () => {
  if (!audioPlayer.src || lyricsLines.length === 0) {
    alert("Please upload audio and lyrics first");
    return;
  }

  audioPlayer.play();
  const duration = audioPlayer.duration / lyricsLines.length;

  setInterval(() => {
    const index = Math.floor(audioPlayer.currentTime / duration);
    highlight(index);
  }, 300);
});

function highlight(index) {
  const items = lyricsList.querySelectorAll("li");
  items.forEach(li => li.classList.remove("active"));
  if (items[index]) items[index].classList.add("active");
}

// RECORDING
let recorder, chunks = [];

recordBtn.addEventListener("click", async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  recorder = new MediaRecorder(stream);
  chunks = [];

  recorder.ondataavailable = e => chunks.push(e.data);
  recorder.onstop = () => {
    recordedAudio.src = URL.createObjectURL(new Blob(chunks));
  };

  recorder.start();
  recordBtn.disabled = true;
  stopBtn.disabled = false;
});

stopBtn.addEventListener("click", () => {
  recorder.stop();
  recordBtn.disabled = false;
  stopBtn.disabled = true;
});
