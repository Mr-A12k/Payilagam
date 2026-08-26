import api from "./axiosConfig";
import { AxiosResponse } from "axios";

export const HEADER_JSON = { "Content-Type": "application/json" };
export const HEADER_MULTIPART = { "Content-Type": "multipart/form-data" };

/**
 * Perform a GET request
 * @param {string} url - API endpoint
 * @param {Object} params - Query parameters
 * @returns {Promise<AxiosResponse<any>>}
 */
export const executeHttpGetRequest = async <T = any>(
  url: string,
  params: Record<string, any> = {},
): Promise<AxiosResponse<T>> => {
  return await api.get(url, { params });
};

/**
 * Perform a POST request
 * @param {string} url - API endpoint
 * @param {Object|FormData} data - Request body payload
 * @param {boolean} isMultipart - True if sending FormData
 * @returns {Promise<AxiosResponse<any>>}
 */
export const executeHttpPostRequest = async <T = any>(
  url: string,
  data: any = {},
  isMultipart: boolean = false,
): Promise<AxiosResponse<T>> => {
  const headers = isMultipart ? HEADER_MULTIPART : HEADER_JSON;
  return await api.post(url, data, { headers });
};

/**
 * Perform a PUT request
 * @param {string} url - API endpoint
 * @param {Object|FormData} data - Request body payload
 * @param {boolean} isMultipart - True if sending FormData
 * @returns {Promise<AxiosResponse<any>>}
 */
export const executeHttpPutRequest = async <T = any>(
  url: string,
  data: any = {},
  isMultipart: boolean = false,
): Promise<AxiosResponse<T>> => {
  const headers = isMultipart ? HEADER_MULTIPART : HEADER_JSON;
  return await api.put(url, data, { headers });
};

/**
 * Perform a DELETE request
 * @param {string} url - API endpoint
 * @returns {Promise<AxiosResponse<any>>}
 */
export const executeHttpDeleteRequest = async <T = any>(
  url: string,
): Promise<AxiosResponse<T>> => {
  return await api.delete(url);
};

/**
 * Perform a PATCH request
 * @param {string} url - API endpoint
 * @param {Object|FormData} data - Request body payload
 * @param {boolean} isMultipart - True if sending FormData
 * @returns {Promise<AxiosResponse<any>>}
 */
export const executeHttpPatchRequest = async <T = any>(
  url: string,
  data: any = null,
  isMultipart: boolean = false,
): Promise<AxiosResponse<T>> => {
  const headers = isMultipart ? HEADER_MULTIPART : HEADER_JSON;
  return await api.patch(url, data, { headers });
};

/**
 * Perform a QUERY request (draft HTTP method)
 * @param {string} url - API endpoint
 * @param {Object|FormData} data - Request body payload containing the query
 * @param {boolean} isMultipart - True if sending FormData
 * @returns {Promise<AxiosResponse<any>>}
 */
export const executeHttpQueryRequest = async <T = any>(
  url: string,
  data: any = {},
  isMultipart: boolean = false,
): Promise<AxiosResponse<T>> => {
  const headers = isMultipart ? HEADER_MULTIPART : HEADER_JSON;
  return await api.request({ method: "QUERY", url, data, headers });
};
