import axios from 'axios';

const API = axios.create({
  baseURL: 'https://habits-checker.onrender.com/api',
});

export default API;
