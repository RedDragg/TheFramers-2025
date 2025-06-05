import "./index.css";
console.log("index.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector('form[action="/archive"]');
  if (!form) return;

  const radios = form.querySelectorAll('input[name="eventType"]');
  radios.forEach((radio) => {
    radio.addEventListener("change", () => {
      form.submit();
    });
  });
});

// scroll op de windows scrollbar
const navOpacity = document.querySelector(".home-menu li:nth-child(2)");

window.addEventListener("scroll", () => {
  if (window.scrollY === 0) {
    // Helemaal bovenaan: opacity terug naar 1
    navOpacity.style.opacity = "1";
  } else {
    // Gescrold: opacity verlagen
    navOpacity.style.opacity = "0.2";
  }
});

// scroll op de .home-data container
const scrollContainer = document.querySelector(".home-data");

scrollContainer.addEventListener("scroll", () => {
  if (scrollContainer.scrollTop === 0) {
    // Helemaal bovenaan
    navOpacity.style.opacity = "1";
  } else {
    // Gescrold binnen .home-data
    navOpacity.style.opacity = "0.5";
  }
});
