/* eslint-disable */
import axios from 'axios';
import 'regenerator-runtime/runtime';
import { showAlert } from './alerts';

const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email: email,
        password: password,
      },
    });

    // check if the call was done successfully to diplay an alert
    // and redirect user to the homepage
    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });

    // check if the call was done successfully to diplay an alert
    // and redirect user to the homepage
    if (res.data.status === 'success') {
      showAlert('success', 'Logged out successfully!');
      location.reload(true); // it's important to set it to true in order to load the page from the backend and not from the frontend cache
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export { login, logout };
