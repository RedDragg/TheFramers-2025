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

 document.addEventListener("DOMContentLoaded", () => {
    const navOpacity = document.querySelector(".home-menu");
    const scrollContainer = document.querySelector(".home-data");

    window.addEventListener("scroll", () => {
      if (window.scrollY === 0) {
        navOpacity.style.opacity = "1";
      } else {
        navOpacity.style.opacity = "0.2";
      }
    });

    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", () => {
        if (scrollContainer.scrollTop === 0) {
          navOpacity.style.opacity = "1";
        } else {
          navOpacity.style.opacity = "0.5";
        }
      });
    }
  });
