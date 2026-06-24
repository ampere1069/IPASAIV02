const state = {
  answers: new Map(),
  search: "",
  subject: "all",
  category: "all"
};

const els = {
  list: document.querySelector("#questions"),
  search: document.querySelector("#searchInput"),
  subject: document.querySelector("#subjectFilter"),
  category: document.querySelector("#categoryFilter"),
  reset: document.querySelector("#resetButton"),
  shown: document.querySelector("#shownCount"),
  answered: document.querySelector("#answeredCount"),
  correct: document.querySelector("#correctCount"),
  accuracy: document.querySelector("#accuracyRate"),
  total: document.querySelector("#totalCount"),
  subjectOne: document.querySelector("#subjectOneCount"),
  subjectTwo: document.querySelector("#subjectTwoCount")
};

function setup() {
  els.total.textContent = QUESTIONS.length;
  els.subjectOne.textContent = QUESTIONS.filter(q => q.subject === "科目一").length;
  els.subjectTwo.textContent = QUESTIONS.filter(q => q.subject === "科目二").length;

  const categories = [...new Set(QUESTIONS.map(q => q.category))].sort((a, b) => a.localeCompare(b, "zh-Hant"));
  for (const category of categories) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    els.category.append(option);
  }

  els.search.addEventListener("input", () => {
    state.search = els.search.value.trim().toLowerCase();
    render();
  });

  els.subject.addEventListener("change", () => {
    state.subject = els.subject.value;
    render();
  });

  els.category.addEventListener("change", () => {
    state.category = els.category.value;
    render();
  });

  els.reset.addEventListener("click", () => {
    state.answers.clear();
    render();
  });

  render();
}

function getFilteredQuestions() {
  return QUESTIONS.filter(question => {
    const haystack = [
      question.subject,
      question.category,
      question.question,
      question.options.join(" "),
      question.explanation
    ].join(" ").toLowerCase();

    return (state.subject === "all" || question.subject === state.subject)
      && (state.category === "all" || question.category === state.category)
      && (!state.search || haystack.includes(state.search));
  });
}

function render() {
  const questions = getFilteredQuestions();
  els.list.innerHTML = "";

  if (!questions.length) {
    els.list.innerHTML = '<div class="empty">找不到符合條件的題目，請調整搜尋或篩選條件。</div>';
  }

  for (const question of questions) {
    els.list.append(createQuestionCard(question));
  }

  updateStats(questions);
}

function createQuestionCard(question) {
  const selected = state.answers.get(question.id);
  const answered = selected !== undefined;
  const correct = selected === question.answer;
  const card = document.createElement("article");
  card.className = `question-card${answered ? " answered" : ""}`;

  const result = answered
    ? `<span class="${correct ? "result-ok" : "result-bad"}">${correct ? "答對" : "再想一下"}</span>`
    : "";

  card.innerHTML = `
    <div class="question-head">
      <div class="tags">
        <span class="tag">${question.subject}</span>
        <span class="tag">${question.category}</span>
      </div>
      ${result}
    </div>
    <h3>${question.id}. ${question.question}</h3>
    <div class="options"></div>
    <div class="explanation"><strong>答案：${letter(question.answer)}</strong>　${question.explanation}</div>
  `;

  const options = card.querySelector(".options");
  question.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option";
    if (answered && index === question.answer) button.classList.add("correct");
    if (answered && index === selected && selected !== question.answer) button.classList.add("wrong");
    button.innerHTML = `<span class="letter">${letter(index)}</span><span>${option}</span>`;
    button.addEventListener("click", () => {
      state.answers.set(question.id, index);
      render();
      document.getElementById(`q-${question.id}`)?.scrollIntoView({ block: "nearest" });
    });
    options.append(button);
  });

  card.id = `q-${question.id}`;
  return card;
}

function updateStats(visibleQuestions) {
  const visibleIds = new Set(visibleQuestions.map(q => q.id));
  const answered = [...state.answers.entries()].filter(([id]) => visibleIds.has(id));
  const correct = answered.filter(([id, answer]) => QUESTIONS.find(q => q.id === id)?.answer === answer);
  els.shown.textContent = visibleQuestions.length;
  els.answered.textContent = answered.length;
  els.correct.textContent = correct.length;
  els.accuracy.textContent = answered.length ? `${Math.round(correct.length / answered.length * 100)}%` : "0%";
}

function letter(index) {
  return ["A", "B", "C", "D"][index] || "?";
}

setup();
