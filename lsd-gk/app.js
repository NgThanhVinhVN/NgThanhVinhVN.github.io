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
  testQuestions: [],
  testIndex: 0,
  testAnswers: {}
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
      cls += " disabled";
      if (o.correct) cls += " correct";
      if (chosen.answer === o.id && !o.correct) cls += " wrong";
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
    fb.innerHTML = chosen.correct
      ? "✓ Chính xác!"
      : `✗ Chưa đúng. Đáp án đúng là <b>${q.answer}. ${escapeHtml(correct.text)}</b>`;
  } else {
    fb.className = "feedback hidden";
    fb.innerHTML = "";
  }
  document.querySelectorAll(".option").forEach(btn => {
    btn.onclick = () => answerQuiz(q, btn.dataset.answer);
  });
}

function answerQuiz(q, answer) {
  if (state.quizAnswers[q.id]) return;
  const correct = answer === q.answer;
  state.quizAnswers[q.id] = {answer, correct};
  if (!state.learned.includes(q.id)) state.learned.push(q.id);
  save();
  renderQuiz();
}


function startTest(size = state.testSize) {
  const pool = [...filtered];
  if (pool.length < size) {
    alert(`Hiện chỉ có ${pool.length} câu phù hợp, không đủ để tạo đề ${size} câu.`);
    return;
  }
  state.testSize = size;
  state.testQuestions = pool.sort(() => Math.random() - 0.5).slice(0, size);
  state.testIndex = 0;
  state.testAnswers = {};
  renderTest();
}

function currentTest() {
  return state.testQuestions[state.testIndex];
}

function renderTest() {
  const hasTest = state.testQuestions.length > 0;
  $("testSetup").classList.toggle("hidden", hasTest);
  $("testBody").classList.toggle("hidden", !hasTest);
  $("testResult").classList.add("hidden");
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
  $("submitTestBtn").classList.toggle("hidden", state.testIndex !== state.testQuestions.length - 1);

  const answered = Object.keys(state.testAnswers).length;
  $("testAnswered").textContent = answered;
  $("testAnsweredTotal").textContent = state.testQuestions.length;
  $("testProgress").style.width = ((state.testIndex + 1) / state.testQuestions.length * 100) + "%";
}

function finishTest() {
  const unanswered = state.testQuestions.length - Object.keys(state.testAnswers).length;
  if (unanswered > 0) {
    const ok = confirm(`Bạn còn ${unanswered} câu chưa trả lời. Vẫn nộp bài?`);
    if (!ok) return;
  }

  let score = 0;
  state.testQuestions.forEach(q => {
    if (state.testAnswers[q.id] === q.answer) score++;
  });

  $("testBody").classList.add("hidden");
  $("testResult").classList.remove("hidden");
  $("testScore").textContent = score;
  $("testScoreTotal").textContent = state.testQuestions.length;
  const percent = Math.round(score / state.testQuestions.length * 100);
  $("testResultText").textContent = `Bạn đúng ${score}/${state.testQuestions.length} câu (${percent}%). ${unanswered ? `Có ${unanswered} câu chưa trả lời.` : "Bạn đã hoàn thành toàn bộ bài thi."}`;
}

function resetTestToSetup() {
  state.testQuestions = [];
  state.testAnswers = {};
  state.testIndex = 0;
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
  };
});
$("startTestBtn").onclick = () => startTest(state.testSize);
$("testPrev").onclick = () => { if (state.testIndex > 0) { state.testIndex--; renderTest(); } };
$("testNext").onclick = () => { if (state.testIndex < state.testQuestions.length - 1) { state.testIndex++; renderTest(); } };
$("submitTestBtn").onclick = finishTest;
$("retryTestBtn").onclick = () => startTest(state.testSize);

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
