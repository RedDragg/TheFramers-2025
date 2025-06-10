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

    //scroll-nav

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

  //archive-pagination
document.addEventListener("DOMContentLoaded", function () {
  class Pagination {
    constructor(itemSelector, itemsPerPage, paginationClass) {
      this.items = Array.from(document.querySelectorAll(itemSelector));
      this.itemsPerPage = itemsPerPage;
      this.paginationContainers = document.querySelectorAll("." + paginationClass);
      this.currentPage = 1;
      this.totalPages = Math.ceil(this.items.length / this.itemsPerPage);
      this.render();
    }

    showPage(page) {
      this.currentPage = page;
      this.items.forEach((item, index) => {
        if (
          index >= (page - 1) * this.itemsPerPage &&
          index < page * this.itemsPerPage
        ) {
          item.style.display = "";
        } else {
          item.style.display = "none";
        }
      });
      this.renderPagination();
      this.renderStats();
    }

    renderPagination() {
      this.paginationContainers.forEach(container => {
        container.innerHTML = "";

        // Previous button
        const prev = document.createElement("button");
        prev.innerText = "←";
        prev.disabled = this.currentPage === 1;
        prev.onclick = () => this.showPage(this.currentPage - 1);
        container.appendChild(prev);

        // Page numbers
        for (let i = 1; i <= this.totalPages; i++) {
          const btn = document.createElement("button");
          btn.innerText = i;
          if (i === this.currentPage) btn.disabled = true;
          btn.onclick = () => this.showPage(i);
          container.appendChild(btn);
        }

        // Next button
        const next = document.createElement("button");
        next.innerText = "→";
        next.disabled = this.currentPage === this.totalPages;
        next.onclick = () => this.showPage(this.currentPage + 1);
        container.appendChild(next);
      });
    }

    renderStats() {
      const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
      const endItem = Math.min(this.currentPage * this.itemsPerPage, this.items.length);
      const totalItems = this.items.length;

      this.paginationContainers.forEach(container => {
        const statsDiv = document.createElement("div");
        statsDiv.classList.add("pagination-stats");
        statsDiv.innerHTML = `${startItem}-${endItem}`;
        container.appendChild(statsDiv);
      });
    }

    render() {
      this.showPage(this.currentPage);
    }
  }

  // Start pagination na DOM load, gebruik nu een class!
  new Pagination(".archive-item", 12, "pagination");
});
