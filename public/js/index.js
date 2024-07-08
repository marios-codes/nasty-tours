/* eslint-disable */
import { login, logout } from './login';
import { displayMap } from './leaflet';
import { updateData } from './updateSettings';

// DOM Elements
const leaflet = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const settingsForm = document.querySelector('.form-user-data');

// Delegation
if (leaflet) {
  // Get locations from HTML
  const locations = JSON.parse(leaflet.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', (element) => {
    element.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (settingsForm) {
  settingsForm.addEventListener('submit', (element) => {
    element.preventDefault();
    const email = document.getElementById('email').value;
    const name = document.getElementById('name').value;
    updateData(name, email);
  });
}
