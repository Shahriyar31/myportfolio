const http = require('http');
fetch('http://localhost:5176/src/App.jsx')
  .then(res => res.text())
  .then(text => console.log("Fetched App.jsx length", text.length))
  .catch(console.error);
