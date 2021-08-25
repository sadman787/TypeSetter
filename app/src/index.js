import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

// Some webpack magic provides "process" global variable...
if (process.env.NODE_ENV === 'development') {
  const debug = localStorage.getItem('debug')

  if (debug !== null) {
    console.log(`Debugging is active for ${debug}`)
  } else {
    console.log('Activating debugging for "typesetter:*"')
    localStorage.setItem('debug', 'typesetter:*')
  }
}

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
