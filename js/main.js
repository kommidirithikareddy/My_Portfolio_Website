document.addEventListener("DOMContentLoaded", () => {
  loadPartial("partials/navbar.html", "navbar");
  loadPartial("partials/footer.html", "footer");

  setYear();
  revealOnScroll();
  activateNav();
});

function loadPartial(file, target) {
  fetch(file)
    .then(res => res.text())
    .then(html => {
      document.getElementById(target).innerHTML = html;
    });
}

function setYear() {
  setTimeout(() => {
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }, 200);
}

function activateNav() {
  const page = location.pathname.split("/").pop();
  document.querySelectorAll(".nav-link").forEach(link => {
    if (link.getAttribute("href") === page) {
      link.classList.add("active");
    }
  });
}

function revealOnScroll() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
}
