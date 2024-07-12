/* eslint-disable */
import { login, logout } from './login';
import { displayMap } from './leaflet';
import { updateSettings } from './updateSettings';

// DOM Elements
const leaflet = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const settingsForm = document.querySelector('.form-user-data');
const passwordForm = document.querySelector('.form-user-password');
const savePasswordBtn = document.querySelector('.btn--save-password');

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
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateSettings(form, 'data');
  });
}

if (passwordForm) {
  passwordForm.addEventListener('submit', async (element) => {
    element.preventDefault();
    savePasswordBtn.textContent = 'Updating...';
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );
    savePasswordBtn.textContent = 'Save Password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}
