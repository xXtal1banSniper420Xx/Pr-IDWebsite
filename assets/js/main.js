function loadHTML(id, filePath) {
  // Add a cache-busting query param
  const url = `${filePath}?v=${Date.now()}`;

  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.text();
    })
    .then(data => {
      document.getElementById(id).innerHTML = data;
    })
    .catch(error => {
      console.error(`Error loading ${filePath}:`, error);
    });
}

// Load header/footer
loadHTML("header-placeholder", "components/header.html");
loadHTML("footer-placeholder", "components/footer.html");

// Load sections
loadHTML("hero-placeholder", "components/sections/hero.html");
loadHTML("about-placeholder", "components/sections/about-v2.html");
loadHTML("background-placeholder", "components/sections/background.html");
loadHTML("insights-placeholder", "components/sections/insights.html");
loadHTML("challenges-placeholder", "components/sections/challenges.html");
loadHTML("engage-placeholder", "components/sections/engage.html");
loadHTML("socials-placeholder", "components/sections/socials.html");

// Wait for all HTML to load, then activate fade-in logic
Promise.all([
  "header-placeholder",
  "footer-placeholder",
  "hero-placeholder",
  "about-placeholder",
  "background-placeholder",
  "insights-placeholder",
  "challenges-placeholder",
  "engage-placeholder",
  "socials-placeholder"
].map(id => new Promise(resolve => {
  const el = document.getElementById(id);
  const observer = new MutationObserver(() => {
    observer.disconnect();
    resolve();
  });
  observer.observe(el, { childList: true });
}))).then(() => {
  // Fade-in effect on scroll
  const faders = document.querySelectorAll(".fade-in-section");

  const appearOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      } else {
        entry.target.classList.remove("visible");
      }
    });
  }, {
    threshold: 0.1 // adjust this if needed
  });

  faders.forEach(fader => appearOnScroll.observe(fader));

  // ✅ Now load quiz.js after engage.html is mounted
  const quizScript = document.createElement("script");
  quizScript.src = "assets/js/quiz.js"; // ✅ ensure this path is correct
  quizScript.onload = () => {
    if (typeof setupQuiz === "function") {
      setupQuiz(); // ✅ run after it's available
      console.log("✅ quiz.js loaded and quiz initialized");
    } else {
      console.error("❌ setupQuiz is not defined in quiz.js");
    }
  };
  document.body.appendChild(quizScript);

});

function playVideo() {
  const player = document.getElementById("youtubePlayer");
  player.src = "https://www.youtube.com/embed/WZyQV3FC5zc?autoplay=1";

  // Reset video when modal closes
  const modal = document.getElementById("videoModal");
  modal.addEventListener("hidden.bs.modal", () => {
    player.src = "";
  }, { once: true });
}

document.addEventListener("click", function (e) {
  if (e.target.classList.contains("quiz-btn")) {
    const result = document.getElementById("quiz-result");
    const answer = e.target.dataset.answer;

    if (answer === "C") {
      result.textContent = "✅ Correct! 48.6% feel their feedback isn't taken seriously.";
      result.style.color = "#00ffbf";
    } else {
      result.textContent = "❌ Not quite. Try again!";
      result.style.color = "#ff6b6b";
    }
  }
});

// Chatbot toggle logic
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("chatbot-toggle");
  const windowBox = document.getElementById("chatbot-window");
  const close = document.getElementById("chatbot-close");
  const send = document.getElementById("chat-send");
  const input = document.getElementById("chat-input");
  const log = document.getElementById("chat-log");

  toggle.addEventListener("click", () => {
    windowBox.style.display = "flex";
  });

  close.addEventListener("click", () => {
    windowBox.style.display = "none";
  });

  send.addEventListener("click", async () => {
    const userMsg = input.value.trim();
    if (!userMsg) return;

    log.innerHTML += `<div><strong>You:</strong> ${userMsg}</div>`;
    input.value = "";

    try {
      const res = await fetch("http://localhost:3000/api/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMsg })
      });

      const data = await res.json();
      const reply = data?.output ?? "Sorry, I couldn't understand that.";
      log.innerHTML += `<div><strong>FgBot:</strong> ${reply}</div>`;
      log.scrollTop = log.scrollHeight;
    } catch (err) {
      log.innerHTML += `<div><strong>CareBot:</strong> ⚠️ Server error.</div>`;
    }
  });
});

