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
  });

    // TYPOGRAFIE SLIDERS
document.addEventListener("DOMContentLoaded", function () {
  const sizeSlider = document.getElementById("sizeSlider");
  const lineHeightSlider = document.getElementById("lineHeightSlider");
  const letterSpacingSlider = document.getElementById("letterSpacingSlider");

  const sizeValue = document.getElementById("sizeValue");
  const lineHeightValue = document.getElementById("lineHeightValue");
  const letterSpacingValue = document.getElementById("letterSpacingValue");

  function updateStyles() {
    const textElements = document.querySelectorAll(".text");

    textElements.forEach(text => {
      text.style.fontSize = sizeSlider.value + "px";
      text.style.lineHeight = lineHeightSlider.value;
      text.style.letterSpacing = letterSpacingSlider.value + "px";
    });

    sizeValue.textContent = sizeSlider.value + "px";
    lineHeightValue.textContent = lineHeightSlider.value;
    letterSpacingValue.textContent = letterSpacingSlider.value + "px";

    saveSettings();

  }

  function saveSettings() {
    localStorage.setItem("textSettings", JSON.stringify({
      fontSize: sizeSlider.value,
      lineHeight: lineHeightSlider.value,
      letterSpacing: letterSpacingSlider.value
    }));
  }

  function applySavedSettings() {
    const saved = JSON.parse(localStorage.getItem("textSettings"));
    if (saved) {
      sizeSlider.value = saved.fontSize;
      lineHeightSlider.value = saved.lineHeight;
      letterSpacingSlider.value = saved.letterSpacing;
    }
    updateStyles();
  }

  function resetToDefault() {
    sizeSlider.value = 16;
    lineHeightSlider.value = 1.5;
    letterSpacingSlider.value = 0;
    updateStyles();
    localStorage.removeItem("textSettings");
  }

  // Maak toegankelijk buiten deze functie:
  window.resetToDefault = resetToDefault;

  if (
    sizeSlider && lineHeightSlider && letterSpacingSlider &&
    sizeValue && lineHeightValue && letterSpacingValue
  ) {
    sizeSlider.addEventListener("input", updateStyles);
    lineHeightSlider.addEventListener("input", updateStyles);
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
    constructor(itemSelector, paginationClass, statsClass, perPageSelector) {
      this.items = Array.from(document.querySelectorAll(itemSelector));
      this.paginationContainers = document.querySelectorAll("." + paginationClass);
      this.statsContainers = document.querySelectorAll("." + statsClass);
      this.perPageSelector = document.getElementById(perPageSelector);
      this.itemsPerPage = parseInt(this.perPageSelector.value, 10);
      this.currentPage = 1;

      this.perPageSelector.addEventListener("change", () => {
        this.itemsPerPage = parseInt(this.perPageSelector.value, 10);
        this.totalPages = Math.ceil(this.items.length / this.itemsPerPage);
        this.currentPage = 1;
        this.render();
      });

      this.totalPages = Math.ceil(this.items.length / this.itemsPerPage);
      this.render();
    }

    showPage(page) {
      this.currentPage = page;
      this.items.forEach((item, index) => {
        item.style.display =
          index >= (page - 1) * this.itemsPerPage && index < page * this.itemsPerPage
            ? ""
            : "none";
      });
      this.renderPagination();
      this.renderStats();
    }

   renderPagination() {
  this.paginationContainers.forEach(container => {
    container.innerHTML = "";

    const total = this.totalPages;
    const current = this.currentPage;

    const appendButton = (label, disabled, onClick, isCurrent = false) => {
      const btn = document.createElement("button");
      btn.innerText = label;
      btn.disabled = disabled;
      if (isCurrent) btn.classList.add("active");
      btn.onclick = onClick;
      container.appendChild(btn);
    };

    const appendEllipsis = () => {
      const span = document.createElement("span");
      span.innerText = "...";
      span.className = "ellipsis";
      container.appendChild(span);
    };

    // ← Prev
    appendButton("←", current === 1, () => this.showPage(current - 1));

    // First page
    appendButton(1, false, () => this.showPage(1), current === 1);

    if (current > 4) {
      appendEllipsis();
    }

    // Middle pages (only show around current)
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) {
      appendButton(i, false, () => this.showPage(i), i === current);
    }

    if (current < total - 3) {
      appendEllipsis();
    }

    // Last page (if total > 1 and not already added)
    if (total > 1) {
      appendButton(total, false, () => this.showPage(total), current === total);
    }

    // → Next
    appendButton("→", current === total, () => this.showPage(current + 1));
  });
}


    renderStats() {
      const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
      const endItem = Math.min(this.currentPage * this.itemsPerPage, this.items.length);
      const totalItems = this.items.length;

      this.statsContainers.forEach(container => {
        container.textContent = `${startItem}-${endItem} of ${totalItems} events`;
      });
    }

    render() {
      this.showPage(this.currentPage);
    }
  }
  const pagination = document.querySelector(".pagination");
  if (pagination) {
    new Pagination("tr.archive-item", "pagination", "pagination-stats", "itemsPerPage");
  }
});
