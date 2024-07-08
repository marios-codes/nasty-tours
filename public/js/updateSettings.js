/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
import 'regenerator-runtime/runtime';

export const updateData = async (name, email) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:3000/api/v1/users/updateMe',
      data: {
        name: name,
        email: email,
      },
    });

    // check if the call was done successfully to diplay an alert
    // and redirect user to the homepage
    if (res.data.status === 'success') {
      showAlert('success', 'Data updated successfully!');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
