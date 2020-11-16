import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
// if ('serviceWorker' in navigator) {
//   navigator.serviceWorker.register('./api-sw.js', { scope: './' }).then(function(reg) {
//     if(reg.installing) {
//       console.log('Service worker installing');
//     } else if(reg.waiting) {
//       console.log('Service worker installed');
//     } else if(reg.active) {
//       console.log('Service worker active');
//     }
//   }).catch(function(error) {
//     console.log('Registration failed with ' + error);
//   });
// }
