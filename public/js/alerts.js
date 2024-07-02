/* eslint-disable */

export const hideAlert = () => {
  const element = document.querySelector('.alert');
  if (element) {
    element.parentElement.removeChild(element);
  }
};

// type would be either 'success' or 'error'
export const showAlert = (type, message) => {
  // hide all existing alerts
  hideAlert();
  const markup = `<div class="alert alert--${type}">${message}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  // hide all existing alerts after 5 seconds
  window.setTimeout(hideAlert, 5000);
};
