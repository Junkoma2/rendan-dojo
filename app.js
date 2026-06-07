const DURATION = 10;
const BEST_KEY = "rendan-dojo-best";

const screens = {
  ready:     document.getElementById("screen-ready"),
  countdown: document.getElementById("screen-countdown"),
  play:      document.getElementById("screen-play"),
  result:    document.getElementById("screen-result"),
};

const countEl       = document.getElementById("count");
const timerEl       = document.getElementById("timer");
const tapBtn        = document.getElementById("tap-btn");
const startBtn      = document.getElementById("start-btn");
const retryBtn      = document.getElementById("retry-btn");
const resultCount   = document.getElementById("result-count");
const resultReaction= document.getElementById("result-reaction");
const resultCps     = document.getElementById("result-cps");
const resultBest    = document.getElementById("result-best");
const bestScoreEl   = document.getElementById("best-score");
const countdownNum  = document.getElementById("countdown-num");
const countdownRing = document.getElementById("countdown-ring");

let count = 0;
let remaining = DURATION;
let intervalId = null;
let running = false;

function getBest() {
  return parseInt(localStorage.getItem(BEST_KEY) || "0", 10);
}

function saveBest(score) {
  if (score > getBest()) {
    localStorage.setItem(BEST_KEY, String(score));
    return true;
  }
  return false;
}

function showScreen(name) {
  Object.values(screens).forEach((s) => s.hidden = true);
  screens[name].hidden = false;
}

function reaction(n) {
  if (n < 20)  return "まだまだ修行が足りぬ";
  if (n < 40)  return "悪くはない";
  if (n < 60)  return "なかなかの連打力";
  if (n < 80)  return "猛者の域";
  if (n < 100) return "鬼神の速さ";
  return "伝説の連打師";
}

function startCountdown() {
  let n = 3;
  showScreen("countdown");

  const tick = () => {
    countdownNum.textContent = n === 0 ? "GO!" : n;
    // 円アニメを再起動
    countdownRing.style.animation = "none";
    countdownRing.offsetHeight; // reflow
    countdownRing.style.animation = "ring-expand 1s ease-out forwards";

    if (n === 0) {
      setTimeout(startGame, 300);
      return;
    }
    n--;
    setTimeout(tick, 1000);
  };
  tick();
}

function startGame() {
  count = 0;
  remaining = DURATION;
  countEl.textContent = "0";
  timerEl.textContent = DURATION;
  timerEl.classList.remove("is-low");
  running = true;
  showScreen("play");

  intervalId = setInterval(() => {
    remaining--;
    timerEl.textContent = remaining;
    if (remaining <= 3) timerEl.classList.add("is-low");
    if (remaining <= 0) endGame();
  }, 1000);
}

function endGame() {
  if (!running) return;
  clearInterval(intervalId);
  intervalId = null;
  running = false;

  const isNew = saveBest(count);
  const best = getBest();

  resultCount.textContent = count;
  resultReaction.textContent = reaction(count);
  resultCps.textContent = (count / DURATION).toFixed(1) + " 回/秒";
  resultBest.textContent = isNew ? `🏆 最高記録更新！ ${best} 回` : `最高記録: ${best} 回`;
  resultBest.classList.toggle("is-new", isNew);

  bestScoreEl.textContent = best;
  showScreen("result");
  // 結果画面表示後にフォーカスを移動してスクリーンリーダーに通知
  setTimeout(() => resultReaction.focus(), 50);
}

function tap() {
  if (!running) return;
  count++;
  countEl.textContent = count;
  tapBtn.classList.add("is-tapped");
  setTimeout(() => tapBtn.classList.remove("is-tapped"), 80);
}

// 初期表示で最高記録をセット
bestScoreEl.textContent = getBest();

startBtn.addEventListener("click", startCountdown);
tapBtn.addEventListener("click", tap);
retryBtn.addEventListener("click", startCountdown);

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && !e.repeat) {
    e.preventDefault();
    if (running) tap();
  }
});
