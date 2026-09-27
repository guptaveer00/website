// Public backend URL only. Never put an API key in this file.
window.SAM_CHAT_API = ['localhost', '127.0.0.1'].includes(location.hostname)
  ? 'http://127.0.0.1:5050'
  : 'https://website-hog9.onrender.com';
