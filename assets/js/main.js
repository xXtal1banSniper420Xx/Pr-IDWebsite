function loadHTML(id, filePath) {
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

// Wait for all sections to load
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
  // Fade-in on scroll
  const faders = document.querySelectorAll(".fade-in-section");
  const appearOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      } else {
        entry.target.classList.remove("visible");
      }
    });
  }, { threshold: 0.1 });
  faders.forEach(fader => appearOnScroll.observe(fader));

  // Load quiz.js
  const quizScript = document.createElement("script");
  quizScript.src = "assets/js/quiz.js";
  quizScript.onload = () => {
    if (typeof setupQuiz === "function") {
      setupQuiz();
      console.log("✅ quiz.js loaded and quiz initialized");
    } else {
      console.error("❌ setupQuiz is not defined in quiz.js");
    }
  };
  document.body.appendChild(quizScript);

  // ✅ Wait for canvas to be injected before loading 3D model
  const canvasPoller = setInterval(() => {
    const canvas = document.getElementById("three-canvas");
    if (canvas) {
      clearInterval(canvasPoller);
      load3DModel();
    }
  }, 50);
});

// Chatbot logic
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("chatbot-toggle");
  const windowBox = document.getElementById("chatbot-window");
  const close = document.getElementById("chatbot-close");
  const send = document.getElementById("chat-send");
  const input = document.getElementById("chat-input");
  const log = document.getElementById("chat-log");

  toggle?.addEventListener("click", () => {
    windowBox.style.display = "flex";
  });

  close?.addEventListener("click", () => {
    windowBox.style.display = "none";
  });

  async function sendMessage() {
    const userMsg = input.value.trim();
    if (!userMsg) return;

    log.innerHTML += `<div><strong>You:</strong> ${userMsg}</div>`;
    input.value = "";

    try {
      const res = await fetch("/api/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMsg })
      });

      const data = await res.json();
      const reply = data?.output ?? "Sorry, I couldn't understand that.";
      log.innerHTML += `<div><strong>FgBot:</strong> ${reply}</div>`;
      log.scrollTop = log.scrollHeight;
    } catch (err) {
      log.innerHTML += `<div><strong>FgBot:</strong> ⚠️ Server error.</div>`;
    }
  }

  send?.addEventListener("click", sendMessage);
  input?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
});

// 3D Model loader
function load3DModel() {
  const canvas = document.getElementById("three-canvas");
  if (!canvas) {
    console.warn("🛑 Canvas not found. Skipping 3D init.");
    return;
  }

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.set(0, 1.5, 5);

  const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
  light.position.set(0, 1, 0);
  scene.add(light);

  const loader = new THREE.GLTFLoader();
  loader.load(
    'assets/models/robot.glb',
    (gltf) => {
      console.log("✅ Model loaded:", gltf);
      const model = gltf.scene;
      model.scale.set(2, 2, 2);
      model.position.y = -1;
      scene.add(model);

      function animate() {
        requestAnimationFrame(animate);
        model.rotation.y += 0.01;
        renderer.render(scene, camera);
      }

      animate();
    },
    undefined,
    (error) => {
      console.error("❌ Failed to load model:", error);
    }
  );
}
