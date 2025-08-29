import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: process.env.PUBLIC_AUTH_URL,
  withCredentials: true,
});
