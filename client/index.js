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

  document.addEventListener("DOMContentLoaded", function () {
    // NAV OPACITY BIJ SCROLL
    const navOpacity = document.querySelector('.home-menu li:nth-child(2)');
    if (navOpacity) {
      window.addEventListener('scroll', () => {
        navOpacity.style.opacity = window.scrollY === 0 ? '1' : '0.5';
      });
    }

    // TYPOGRAFIE SLIDERS
    const sizeSlider = document.getElementById("sizeSlider");
    const lineHeightSlider = document.getElementById("lineHeightSlider");
    const weightSlider = document.getElementById("weightSlider");
    const letterSpacingSlider = document.getElementById("letterSpacingSlider");
    const text = document.querySelector(".text");

    const sizeValue = document.getElementById("sizeValue");
    const lineHeightValue = document.getElementById("lineHeightValue");
    const weightValue = document.getElementById("weightValue");
    const letterSpacingValue = document.getElementById("letterSpacingValue");

    if (
      sizeSlider && lineHeightSlider && weightSlider && letterSpacingSlider &&
      text && sizeValue && lineHeightValue && weightValue && letterSpacingValue
    ) {
      function updateStyles() {
        text.style.fontSize = sizeSlider.value + "px";
        text.style.lineHeight = lineHeightSlider.value;
        text.style.fontWeight = weightSlider.value;
        text.style.letterSpacing = letterSpacingSlider.value + "px";

        sizeValue.textContent = sizeSlider.value + "px";
        lineHeightValue.textContent = lineHeightSlider.value;
        weightValue.textContent = weightSlider.value;
        letterSpacingValue.textContent = letterSpacingSlider.value + "px";

        saveSettings();
      }

      function saveSettings() {
        localStorage.setItem("textSettings", JSON.stringify({
          fontSize: sizeSlider.value,
          lineHeight: lineHeightSlider.value,
          fontWeight: weightSlider.value,
          letterSpacing: letterSpacingSlider.value
        }));
      }

      function applySavedSettings() {
        const saved = JSON.parse(localStorage.getItem("textSettings"));
        if (saved) {
          sizeSlider.value = saved.fontSize;
          lineHeightSlider.value = saved.lineHeight;
          weightSlider.value = saved.fontWeight;
          letterSpacingSlider.value = saved.letterSpacing;
        }
        updateStyles();
      }

      function resetToDefault() {
        sizeSlider.value = 16;
        lineHeightSlider.value = 1.5;
        weightSlider.value = 400;
        letterSpacingSlider.value = 0;
        updateStyles();
        localStorage.removeItem("textSettings");
      }

      sizeSlider.addEventListener("input", updateStyles);
      lineHeightSlider.addEventListener("input", updateStyles);
      weightSlider.addEventListener("input", updateStyles);
      letterSpacingSlider.addEventListener("input", updateStyles);

      applySavedSettings();
    }
  });

    document.addEventListener("DOMContentLoaded", function () {
    const footer = document.querySelector('.footer-container');

    if (!footer) return;

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const totalHeight = document.body.scrollHeight;

      const distanceFromBottom = totalHeight - (scrollY + viewportHeight);

      if (distanceFromBottom <= 16) {
        footer.style.zIndex = '0';
      } else {
        footer.style.zIndex = '-1';
      }
    });
  });
