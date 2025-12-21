const audioInput = document.getElementById("audioInput");
const lyricsInput = document.getElementById("lyricsInput");
const audioPlayer = document.getElementById("audioPlayer");
const currentLineEl = document.getElementById("currentLine");
const markBtn = document.getElementById("markBtn");
const exportBtn = document.getElementById("exportBtn");

let lyrics = [];
let index = 0;
let result = [];

// LOAD AUDIO
audioInput.addEventListener("change", () => {
  const file = audioInput.files[0];
  if (file) {
    audioPlayer.src = URL.createObjectURL(file);
  }
});

// LOAD LYRICS
lyricsInput.addEventListener("change", () => {
  const reader = new FileReader();
  reader.onload = () => {
    lyrics = reader.result
      .split("\n")
      .map(l => l.trim())
      .filter(Boolean);

    index = 0;
    result = [];

    if (lyrics.length > 0) {
      currentLineEl.textContent = lyrics[0];
      markBtn.disabled = false;
      exportBtn.disabled = true;
    }
  };
  reader.readAsText(lyricsInput.files[0]);
});

// MARK TIME
markBtn.addEventListener("click", () => {
  if (index >= lyrics.length) return;

  result.push({
    time: Number(audioPlayer.currentTime.toFixed(2)),
    text: lyrics[index]
  });

  index++;

  if (index < lyrics.length) {
    currentLineEl.textContent = lyrics[index];
  } else {
    currentLineEl.textContent = "✅ All lines marked!";
    markBtn.disabled = true;
    exportBtn.disabled = false;
  }
});

// EXPORT JSON
exportBtn.addEventListener("click", () => {
  const data = {
    title: "Prepared Karaoke",
    audio: "REPLACE_WITH_AUDIO_PATH.wav",
    lyrics: result
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "karaoke.json";
  a.click();
});
