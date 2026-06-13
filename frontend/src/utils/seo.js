import { useEffect } from 'react';

const ensureMeta = (name) => {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  return tag;
};

export const useSeo = ({ title, description }) => {
  useEffect(() => {
    if (title) document.title = title;
    if (description) {
      ensureMeta('description').setAttribute('content', description);
    }
  }, [title, description]);
};
