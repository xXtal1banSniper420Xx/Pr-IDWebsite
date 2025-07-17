const quizData = [
  {
    question: "What percentage of youths feel their feedback isn’t taken seriously?",
    options: ["25.3%", "36.4%", "48.6%", "62.1%"],
    answer: "48.6%"
  },
  {
    question: "Which of the following is a barrier to youth engagement?",
    options: ["Interactive maps", "Lack of time", "Gamified tools", "Card rewards"],
    answer: "Lack of time"
  },
  {
    question: "Which platform is NOT mentioned as part of the initiative?",
    options: ["Instagram", "Facebook", "TikTok", "YouTube"],
    answer: "Facebook"
  },
  {
    question: "What can users unlock through participation?",
    options: ["Cash rewards", "Stories", "Scholarships", "Land plots"],
    answer: "Stories"
  },
  {
    question: "What is one way youths can contribute?",
    options: ["Ignoring surveys", "Waiting for change", "Providing feedback", "Complaining online"],
    answer: "Providing feedback"
  }
];

let currentQuestion = 0;
let score = 0;

function setupQuiz() {
  const box = document.getElementById("quiz-box");
  if (!box) return;

  loadQuestion();

  function loadQuestion() {
    const q = quizData[currentQuestion];
    box.innerHTML = `
      <div class="text-white p-4 rounded shadow" style="background-color: #5E936C;">
        <h5 class="mb-3">Q${currentQuestion + 1}. ${q.question}</h5>
        ${q.options.map(opt => `
          <button class="btn btn-outline-light btn-sm d-block mb-2 quiz-option" data-answer="${opt}">
            ${opt}
          </button>
        `).join("")}
        <div id="quiz-feedback" class="mt-3 fw-bold"></div>
      </div>
    `;

    // Attach click listeners to new buttons
    const buttons = box.querySelectorAll(".quiz-option");
    buttons.forEach(btn => {
      btn.addEventListener("click", () => handleAnswer(btn.dataset.answer));
    });
  }

  function handleAnswer(selected) {
    const correct = quizData[currentQuestion].answer;
    const feedback = document.getElementById("quiz-feedback");

    if (selected === correct) {
      feedback.textContent = "✅ Correct!";
      feedback.style.color = "#00e6d0";
      score++;
    } else {
      feedback.textContent = `❌ Incorrect. Correct answer: ${correct}`;
      feedback.style.color = "#f23737ff";
    }

    // Disable buttons
    document.querySelectorAll(".quiz-option").forEach(b => b.disabled = true);

    // Next question after short delay
    setTimeout(() => {
      currentQuestion++;
      if (currentQuestion < quizData.length) {
        loadQuestion();
      } else {
        showResult();
      }
    }, 1200);
  }

  function showResult() {
    box.innerHTML = `
      <div class="text-white p-4 rounded shadow text-center" style="background-color: #5E936C;">
        <h4>🎉 Quiz Complete!</h4>
        <p>You got <strong>${score}</strong> out of <strong>${quizData.length}</strong> correct.</p>
        <button class="btn btn-outline-light mt-3" id="retry-btn">Retry Quiz</button>
      </div>
    `;

    document.getElementById("retry-btn").addEventListener("click", () => {
      currentQuestion = 0;
      score = 0;
      loadQuestion();
    });
  }
}
