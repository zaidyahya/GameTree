import React from 'react';
import ReactDOM from 'react-dom';
import App from './App/App';
import AuthProvider from './App/context/AuthContext';
 
ReactDOM.render(
  <AuthProvider>  
    <App />
  </AuthProvider>
,
  document.getElementById('app')
);
