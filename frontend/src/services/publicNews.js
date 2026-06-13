import { api } from './api.js';

const buildQuery = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    search.set(key, String(value));
  });
  return search.toString();
};

export const getPublicArticles = (params = {}) =>
  api.get(`/articles?${buildQuery({ ...params, beforeOrOn: true })}`);

export const getPublicNews = (params = {}) =>
  api.get(`/news?${buildQuery({ ...params, beforeOrOn: true })}`);
