/* =====================
   MODE TOGGLE
===================== */
const modeToggle = document.getElementById("modeToggle");
const editorMode = document.getElementById("editorMode");
const playerMode = document.getElementById("playerMode");

let isEditor = true;

modeToggle.addEventListener("click", () => {
  isEditor = !isEditor;

  if (isEditor) {
    editorMode.style.display = "block";
    playerMode.style.display = "none";
    modeToggle.textContent = "🎤 Switch to Player Mode";
  } else {
    editorMode.style.display = "none";
    playerMode.style.display = "block";
    modeToggle.textContent = "🔧 Switch to Editor Mode";
  }
});

/* =====================
   EDITOR MODE
===================== */
const audioInput = document.getElementById("audioInput");
const lyricsInput = document.getElementById("lyricsInput");
const audioPlayer = document.getElementById("audioPlayer");
const currentLineEl = document.getElementById("currentLine");
const markBtn = document.getElementById("markBtn");
const exportBtn = document.getElementById("exportBtn");

let lyrics = [];
let index = 0;
let result = [];

audioInput.addEventListener("change", () => {
  audioPlayer.src = URL.createObjectURL(audioInput.files[0]);
});

lyricsInput.addEventListener("change", () => {
  const reader = new FileReader();
  reader.onload = () => {
    lyrics = reader.result.split("\n").map(l => l.trim()).filter(Boolean);
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

markBtn.addEventListener("click", () => {
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

exportBtn.addEventListener("click", () => {
  const json = {
    title: "Prepared Karaoke",
    audio: "REPLACE_WITH_AUDIO_PATH.wav",
    lyrics: result
  };

  const blob = new Blob([JSON.stringify(json, null, 2)], {
    type: "application/json"
  });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "karaoke.json";
  a.click();
});

/* =====================
   PLAYER MODE
===================== */
const playerJson = document.getElementById("playerJson");
const playerAudio = document.getElementById("playerAudio");
const playerLyrics = document.getElementById("playerLyrics");
const startKaraokeBtn = document.getElementById("startKaraokeBtn");

let playLyrics = [];
let currentIndex = -1;

playerJson.addEventListener("change", async () => {
  const file = playerJson.files[0];
  if (!file) return;

  const text = await file.text();
  const data = JSON.parse(text);

  playerAudio.src = data.audio;
  playLyrics = data.lyrics;
  playerLyrics.innerHTML = "";
  currentIndex = -1;

  playLyrics.forEach(line => {
    const li = document.createElement("li");
    li.textContent = line.text;
    playerLyrics.appendChild(li);
  });
});

startKaraokeBtn.addEventListener("click", () => {
  if (!playerAudio.src) {
    alert("Please load a karaoke JSON first");
    return;
  }

  // Force audio load (IMPORTANT for mobile)
  playerAudio.load();

  // Play ONLY when audio is ready
  playerAudio.oncanplay = () => {
    playerAudio.currentTime = 0;
    playerAudio.play();
  };
});

playerAudio.addEventListener("timeupdate", () => {
  for (let i = playLyrics.length - 1; i >= 0; i--) {
    if (playerAudio.currentTime >= playLyrics[i].time) {
      if (currentIndex !== i) {
        highlightLine(i);
        currentIndex = i;
      }
      break;
    }
  }
});

function highlightLine(index) {
  const items = playerLyrics.querySelectorAll("li");
  items.forEach(li => li.classList.remove("active"));

  if (items[index]) {
    items[index].classList.add("active");
    items[index].scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }
}
