function loadHTML(id, filePath) {
  fetch(filePath)
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
loadHTML("about-placeholder", "components/sections/about.html");
loadHTML("background-placeholder", "components/sections/background.html");
loadHTML("insights-placeholder", "components/sections/insights.html");
loadHTML("challenges-placeholder", "components/sections/challenges.html");
loadHTML("engage-placeholder", "components/sections/engage.html");
loadHTML("socials-placeholder", "components/sections/socials.html");
