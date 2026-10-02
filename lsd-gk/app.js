const state = {
  mode: "flashcard",
  fcIndex: 0,
  quizIndex: 0,
  quizAnswers: JSON.parse(localStorage.getItem("lsd_quiz_answers") || "{}"),
  learned: JSON.parse(localStorage.getItem("lsd_learned") || "[]"),
  filter: "all",
  search: "",
  dark: localStorage.getItem("lsd_dark") === "1",
  testSize: 10,
  testTime: 10,
  testQuestions: [],
  testIndex: 0,
  testAnswers: {},
  testTimeLeft: 0,
  testTimer: null,
  testFinished: false
};

const $ = id => document.getElementById(id);
const all = window.QUESTIONS.questions;
let filtered = [...all];

function save() {
  localStorage.setItem("lsd_quiz_answers", JSON.stringify(state.quizAnswers));
  localStorage.setItem("lsd_learned", JSON.stringify(state.learned));
  updateStats();
}

function updateStats() {
  $("statTotal").textContent = all.length;
  $("statLearned").textContent = state.learned.length;
  const vals = Object.values(state.quizAnswers);
  const answered = vals.length;
  const correct = vals.filter(v => v.correct).length;
  $("statScore").textContent = answered ? Math.round(correct / answered * 100) + "%" : "0%";
  $("correctCount").textContent = correct;
  $("answeredCount").textContent = answered;
  $("accuracy").textContent = answered ? Math.round(correct / answered * 100) + "%" : "0%";
}

function applyFilter() {
  const s = state.search.toLowerCase().trim();
  filtered = all.filter(q => {
    const text = (q.question + " " + q.options.map(o => o.text).join(" ")).toLowerCase();
    return (!s || text.includes(s)) && (state.filter === "all" || q.id === Number(state.filter));
  });
  if (!filtered.length) filtered = [];
  renderList();
}

function currentFC() {
  return filtered[state.fcIndex] || filtered[0] || all[0];
}
function currentQuiz() {
  return filtered[state.quizIndex] || filtered[0] || all[0];
}

function renderFlashcard() {
  const q = currentFC();
  if (!q) return;
  state.fcIndex = Math.min(state.fcIndex, filtered.length - 1);
  $("fcCurrent").textContent = filtered.length ? state.fcIndex + 1 : 0;
  $("fcTotal").textContent = filtered.length;
  $("fcNum").textContent = q.id;
  $("fcQuestion").textContent = q.question;
  $("fcOptions").innerHTML = q.options.map(o =>
    `<div class="fc-option"><span class="fc-letter">${o.id}.</span>${escapeHtml(o.text)}</div>`
  ).join("");
  const correct = q.options.find(o => o.correct);
  $("fcAnswer").textContent = q.answer;
  $("fcAnswerText").textContent = correct ? correct.text : "";
  $("flashcard").classList.remove("flipped");
  $("fcRating").classList.add("hidden");
  $("fcProgress").style.width = filtered.length ? ((state.fcIndex + 1) / filtered.length * 100) + "%" : "0%";
}

function flip() {
  const card = $("flashcard");
  const nowFlipped = !card.classList.contains("flipped");
  card.classList.toggle("flipped", nowFlipped);
  $("fcRating").classList.toggle("hidden", !nowFlipped);

  const q = currentFC();
  if (nowFlipped && q && !state.learned.includes(q.id)) {
    state.learned.push(q.id);
    save();
  }
}

function renderQuiz() {
  const q = currentQuiz();
  if (!q) return;
  $("quizCurrent").textContent = filtered.length ? state.quizIndex + 1 : 0;
  $("quizTotal").textContent = filtered.length;
  $("quizNum").textContent = q.id;
  $("quizQuestion").textContent = q.question;

  const chosen = state.quizAnswers[q.id];
  $("options").innerHTML = q.options.map(o => {
    let cls = "option";
    if (chosen) {
      // Vẫn cho click lại → KHÔNG dùng .disabled nữa
      if (o.correct) cls += " correct";
      if (chosen.answer === o.id && !o.correct) cls += " wrong";
      if (chosen.answer === o.id) cls += " chosen";
    }
    return `<button class="${cls}" data-answer="${o.id}">
      <span class="letter">${o.id}.</span><span>${escapeHtml(o.text)}</span>
    </button>`;
  }).join("");

  const fb = $("quizFeedback");
  if (chosen) {
    fb.classList.remove("hidden");
    fb.className = "feedback " + (chosen.correct ? "ok" : "bad");
    const correct = q.options.find(o => o.correct);
    const msg = chosen.correct ? "✓ Chính xác!" : `✗ Chưa đúng. Đáp án đúng là <b>${q.answer}. ${escapeHtml(correct.text)}</b>`;
    fb.innerHTML = `${msg} <span class="retry-hint">· Nhấn đáp án khác để đổi lựa chọn</span>`;
  } else {
    fb.className = "feedback hidden";
    fb.innerHTML = "";
  }

  document.querySelectorAll(".option").forEach(btn => {
    btn.onclick = () => answerQuiz(q, btn.dataset.answer);
  });
}

function answerQuiz(q, answer) {
  // Cho phép chọn lại / đổi đáp án: luôn ghi đè, không chặn nếu đã có
  const correct = answer === q.answer;
  state.quizAnswers[q.id] = {answer, correct};
  if (!state.learned.includes(q.id)) state.learned.push(q.id);
  save();
  renderQuiz();
}


function startTest(size = state.testSize, minutes = state.testTime) {
  const pool = [...filtered];
  if (pool.length < size) {
    alert(`Hiện chỉ có ${pool.length} câu phù hợp, không đủ để tạo đề ${size} câu.`);
    return;
  }
  stopTestTimer();
  state.testSize = size;
  state.testTime = Math.max(1, Number(minutes) || 1);
  state.testQuestions = pool.sort(() => Math.random() - 0.5).slice(0, size);
  state.testIndex = 0;
  state.testAnswers = {};
  state.testFinished = false;
  state.testTimeLeft = state.testTime * 60;
  renderTest();
  startTestTimer();
}

function stopTestTimer() {
  if (state.testTimer) {
    clearInterval(state.testTimer);
    state.testTimer = null;
  }
}

function formatTestTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const sec = Math.max(0, seconds % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

function updateTestTimer() {
  const el = $('testTimer');
  if (!el) return;
  el.textContent = formatTestTime(state.testTimeLeft);
  el.classList.toggle('warning', state.testTimeLeft <= 60 && state.testTimeLeft > 0);
  el.classList.toggle('danger', state.testTimeLeft <= 10);
}

function startTestTimer() {
  stopTestTimer();
  updateTestTimer();
  state.testTimer = setInterval(() => {
    if (state.testFinished || !state.testQuestions.length) return;
    state.testTimeLeft--;
    updateTestTimer();
    if (state.testTimeLeft <= 0) {
      stopTestTimer();
      finishTest(true);
    }
  }, 1000);
}

function currentTest() {
  return state.testQuestions[state.testIndex];
}

function renderTest() {
  const hasTest = state.testQuestions.length > 0 && !state.testFinished;
  $("testSetup").classList.toggle("hidden", hasTest || state.testFinished);
  $("testBody").classList.toggle("hidden", !hasTest);
  $("testResult").classList.toggle("hidden", !state.testFinished);
  updateTestTimer();
  if (!hasTest) {
    $("testCurrent").textContent = 0;
    $("testTotal").textContent = state.testSize;
    return;
  }

  const q = currentTest();
  $("testCurrent").textContent = state.testIndex + 1;
  $("testTotal").textContent = state.testQuestions.length;
  $("testNum").textContent = q.id;
  $("testQuestion").textContent = q.question;

  const chosen = state.testAnswers[q.id];
  $("testOptions").innerHTML = q.options.map(o => `
    <button class="option ${chosen === o.id ? "selected" : ""}" data-test-answer="${o.id}">
      <span class="letter">${o.id}.</span><span>${escapeHtml(o.text)}</span>
    </button>
  `).join("");

  document.querySelectorAll("[data-test-answer]").forEach(btn => {
    btn.onclick = () => {
      state.testAnswers[q.id] = btn.dataset.testAnswer;
      renderTest();
    };
  });

  $("testPrev").disabled = state.testIndex === 0;
  $("testNext").classList.toggle("hidden", state.testIndex === state.testQuestions.length - 1);
  // submitTestBtn luôn hiển thị để có thể nộp bài bất cứ lúc nào

  const answered = Object.keys(state.testAnswers).length;
  $("testAnswered").textContent = answered;
  $("testAnsweredTotal").textContent = state.testQuestions.length;
  $("testProgress").style.width = ((state.testIndex + 1) / state.testQuestions.length * 100) + "%";
}

function finishTest(auto = false) {
  if (state.testFinished) return;
  const unanswered = state.testQuestions.length - Object.keys(state.testAnswers).length;

  // Chỉ hỏi xác nhận khi user tự nộp (không hỏi khi hết giờ tự động)
  // Đặt confirm TRƯỚC khi set testFinished / stopTestTimer để tránh treo bài thi khi user bấm Cancel
  if (!auto && unanswered > 0) {
    const ok = confirm(`Bạn còn ${unanswered} câu chưa trả lời. Vẫn nộp bài?`);
    if (!ok) return;
  }

  stopTestTimer();
  state.testFinished = true;

  let score = 0;
  state.testQuestions.forEach(q => {
    if (state.testAnswers[q.id] === q.answer) score++;
  });

  $("testBody").classList.add("hidden");
  $("testResult").classList.remove("hidden");
  $("testScore").textContent = score;
  $("testScoreTotal").textContent = state.testQuestions.length;
  const percent = Math.round(score / state.testQuestions.length * 100);
  $("testResultText").textContent = auto
    ? `Hết giờ. Bạn đúng ${score}/${state.testQuestions.length} câu (${percent}%). ${unanswered ? `Có ${unanswered} câu chưa trả lời.` : "Bạn đã hoàn thành toàn bộ bài thi."}`
    : `Bạn đúng ${score}/${state.testQuestions.length} câu (${percent}%). ${unanswered ? `Có ${unanswered} câu chưa trả lời.` : "Bạn đã hoàn thành toàn bộ bài thi."}`;
  $("testTimeResult").textContent = auto ? "Hết giờ" : `Thời gian đã đặt: ${state.testTime} phút`;
}

function resetTestToSetup() {
  stopTestTimer();
  state.testQuestions = [];
  state.testAnswers = {};
  state.testIndex = 0;
  state.testFinished = false;
  state.testTimeLeft = state.testTime * 60;
  renderTest();
}

function renderList() {
  $("listCount").textContent = filtered.length + " câu";
  $("questionList").innerHTML = filtered.map(q => `
    <div class="list-item" data-id="${q.id}">
      <div class="list-top"><span>CÂU ${q.id}</span>${state.learned.includes(q.id) ? '<span class="learned">✓ Đã học</span>' : ''}</div>
      <div class="list-q">${escapeHtml(q.question)}</div>
    </div>
  `).join("") || `<div class="list-item">Không tìm thấy câu phù hợp.</div>`;
  document.querySelectorAll(".list-item[data-id]").forEach(el => {
    el.onclick = () => {
      const id = Number(el.dataset.id);
      const idx = filtered.findIndex(q => q.id === id);
      state.fcIndex = idx >= 0 ? idx : 0;
      switchMode("flashcard");
    };
  });
}

function switchMode(mode) {
  state.mode = mode;
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.mode === mode));
  $("flashcardMode").classList.toggle("hidden", mode !== "flashcard");
  $("quizMode").classList.toggle("hidden", mode !== "quiz");
  $("listMode").classList.toggle("hidden", mode !== "list");
  $("testMode").classList.toggle("hidden", mode !== "test");
  if (mode === "flashcard") renderFlashcard();
  if (mode === "quiz") renderQuiz();
  if (mode === "list") renderList();
  if (mode === "test") renderTest();
}

function markCard(known) {
  const q = currentFC();
  if (!q) return;
  if (known) {
    if (!state.learned.includes(q.id)) state.learned.push(q.id);
  } else {
    state.learned = state.learned.filter(id => id !== q.id);
  }
  save();
  if (state.fcIndex < filtered.length - 1) {
    state.fcIndex++;
    renderFlashcard();
  } else {
    renderFlashcard();
  }
}

function shuffleCards() {
  for (let i = filtered.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
  }
  state.fcIndex = 0;
  renderFlashcard();
}

function randomQuestion() {
  if (!filtered.length) return;
  if (state.mode === "quiz") state.quizIndex = Math.floor(Math.random() * filtered.length);
  else state.fcIndex = Math.floor(Math.random() * filtered.length);
  if (state.mode === "flashcard") renderFlashcard();
  else if (state.mode === "quiz") renderQuiz();
  else {
    state.fcIndex = Math.floor(Math.random() * filtered.length);
    switchMode("flashcard");
  }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

document.querySelectorAll(".tab").forEach(t => t.onclick = () => switchMode(t.dataset.mode));
$("flashcard").onclick = flip;
$("flashcard").onkeydown = e => { if (e.key === "Enter" || e.key === " ") flip(); };
$("flipBtn").onclick = flip;
$("prevBtn").onclick = () => { if (state.fcIndex > 0) state.fcIndex--; renderFlashcard(); };
$("nextBtn").onclick = () => { if (state.fcIndex < filtered.length - 1) state.fcIndex++; renderFlashcard(); };
$("quizPrev").onclick = () => { if (state.quizIndex > 0) state.quizIndex--; renderQuiz(); };
$("quizNext").onclick = () => { if (state.quizIndex < filtered.length - 1) state.quizIndex++; renderQuiz(); };
$("randomBtn").onclick = randomQuestion;
$("forgotBtn").onclick = () => markCard(false);
$("knownBtn").onclick = () => markCard(true);
document.querySelectorAll(".test-size").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".test-size").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    state.testSize = Number(btn.dataset.size);
    $("testTotal").textContent = state.testSize;
    $("testAnsweredTotal").textContent = state.testSize;
    const defaults = {10: 10, 20: 20, 30: 30, 60: 60};
    state.testTime = defaults[state.testSize] || state.testSize;
    $("testTime").value = state.testTime;
  };
});
$("testTime").oninput = () => {
  const value = Math.max(1, Math.min(180, Number($("testTime").value) || 1));
  $("testTime").value = value;
  state.testTime = value;
};
$("startTestBtn").onclick = () => startTest(state.testSize, state.testTime);
$("testPrev").onclick = () => { if (state.testIndex > 0) { state.testIndex--; renderTest(); } };
$("testNext").onclick = () => { if (state.testIndex < state.testQuestions.length - 1) { state.testIndex++; renderTest(); } };
$("submitTestBtn").onclick = () => finishTest(false);
$("cancelTestBtn").onclick = () => {
  if (confirm("Hủy bài thi? Tiến độ bài thi sẽ không được lưu.")) {
    resetTestToSetup();
  }
};
$("retryTestBtn").onclick = () => startTest(state.testSize, state.testTime);

$("search").oninput = e => {
  state.search = e.target.value;
  state.fcIndex = 0; state.quizIndex = 0;
  applyFilter();
  if (state.mode === "flashcard") renderFlashcard();
  if (state.mode === "quiz") renderQuiz();
};

const category = $("category");
all.forEach(q => {
  const opt = document.createElement("option");
  opt.value = q.id;
  opt.textContent = `Câu ${q.id}`;
  category.appendChild(opt);
});
category.onchange = e => {
  state.filter = e.target.value;
  state.fcIndex = 0; state.quizIndex = 0;
  applyFilter();
  if (state.mode === "flashcard") renderFlashcard();
  if (state.mode === "quiz") renderQuiz();
};

$("resetBtn").onclick = () => {
  if (confirm("Xóa toàn bộ tiến độ và kết quả trắc nghiệm?")) {
    state.learned = []; state.quizAnswers = {};
    save(); renderFlashcard(); renderQuiz(); renderList();
  }
};

$("themeBtn").onclick = () => {
  state.dark = !state.dark;
  document.body.classList.toggle("dark", state.dark);
  localStorage.setItem("lsd_dark", state.dark ? "1" : "0");
};

document.addEventListener("keydown", e => {
  if (state.mode === "test" && state.testQuestions.length) {
    if (["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement.tagName)) return;
    if (e.key === "ArrowLeft") { if (state.testIndex > 0) { state.testIndex--; renderTest(); } }
    else if (e.key === "ArrowRight") { if (state.testIndex < state.testQuestions.length - 1) { state.testIndex++; renderTest(); } }
    return;
  }
  if (state.mode !== "flashcard") return;
  if (["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement.tagName)) return;
  if (e.key === "ArrowLeft") {
    if (state.fcIndex > 0) { state.fcIndex--; renderFlashcard(); }
  } else if (e.key === "ArrowRight") {
    if (state.fcIndex < filtered.length - 1) { state.fcIndex++; renderFlashcard(); }
  } else if (e.code === "Space") {
    e.preventDefault();
    flip();
  } else if (e.key.toLowerCase() === "s") {
    shuffleCards();
  }
});

document.body.classList.toggle("dark", state.dark);
$("statTotal").textContent = all.length;
$("fcTotal").textContent = all.length;
$("quizTotal").textContent = all.length;
applyFilter();
renderFlashcard();
renderQuiz();
updateStats();