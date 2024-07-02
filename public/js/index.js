/* eslint-disable */
import { login } from './login';
import { displayMap } from './leaflet';

// DOM Elements
const leaflet = document.getElementById('map');
const loginForm = document.querySelector('.form');

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
