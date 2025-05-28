import "./index.css";
console.log("index.js loaded");

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form[action="/archive"]');
    if (!form) return;
  
    const radios = form.querySelectorAll('input[name="eventType"]');
    radios.forEach((radio) => {
      radio.addEventListener('change', () => {
        form.submit();
      });
    });
  });
  

