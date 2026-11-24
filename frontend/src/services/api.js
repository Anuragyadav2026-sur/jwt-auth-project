
import axios from "axios";

const API = axios.create({
  baseURL: "https://jwt-auth-backend-x6jp.onrender.com",
  withCredentials: true
});

export default API;
