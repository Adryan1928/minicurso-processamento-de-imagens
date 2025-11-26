import axios, { AxiosError, AxiosRequestConfig, isAxiosError } from "axios";

export interface ResponseWrapper<T> {
  status: string;
  data: T;
}

export type Query = Record<
  string,
  string | boolean | number | undefined | null
>;

function onSuccess<T>(response: T) {
  return response;
}

function onError(error: Error | AxiosError) {
  if (isAxiosError(error) && error.response) {

    const { response } = error;
    if (process.env.NODE_ENV === "development") {
      console.log("~~~~~~~~~~~~~~~ Request error ~~~~~~~~~~~~~~~");
      console.log(JSON.stringify(response, null, 2));
    }
  }
  return Promise.reject(error);
}

const request = axios.create({
  baseURL: process.env.API_URL,
  responseType: "json",
  withCredentials: true,
});

request.interceptors.request.use(async (config) => {

  return config;
});

export default {
  get: <T>(url: string, config?: AxiosRequestConfig<any>) =>
    request.get<T>(url, config).then(onSuccess, onError),
  delete: <T>(url: string, config?: AxiosRequestConfig<any>) =>
    request.delete<T>(url, config).then(onSuccess, onError),
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig<any>) =>
    request.post<T>(url, data, config).then(onSuccess, onError),
  put: <T>(url: string, data: any, config?: AxiosRequestConfig<any>) =>
    request.put<T>(url, data, config).then(onSuccess, onError),
  patch: <T>(url: string, data: any, config?: AxiosRequestConfig<any>) =>
    request.patch<T>(url, data, config).then(onSuccess, onError),
};
