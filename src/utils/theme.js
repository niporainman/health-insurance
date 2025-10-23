// utils/theme.js

export function setTheme(themeName) {
  localStorage.setItem('hinton_theme', themeName);
  document.documentElement.className = themeName;
}

export function toggleTheme() {
  if (localStorage.getItem('hinton_theme') === 'theme-dark') {
    setTheme('theme-light');
  } else {
    setTheme('theme-dark');
  }
}

// Run this on app load to set initial theme
export function initializeTheme() {
  const isDark = localStorage.getItem('hinton_theme') === 'theme-dark';
  setTheme(isDark ? 'theme-dark' : 'theme-light');

  // Optional: Set checkbox state if it exists
  const slider = document.querySelector('.slider-btn');
  if (slider) {
    slider.checked = !isDark;
  }
}
