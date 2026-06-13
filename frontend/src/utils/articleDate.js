const parseDateKey = (value) => {
  if (!value) return null;
  const [year, month, day] = String(value).split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const relativeLabels = {
  en: { today: 'Today', yesterday: 'Yesterday' },
  te: { today: 'ఈ రోజు', yesterday: 'నిన్న' },
  hi: { today: 'आज', yesterday: 'कल' }
};

export const formatArticleDateLabel = (dateKey, language = 'en') => {
  const articleDate = parseDateKey(dateKey);
  if (!articleDate) return dateKey || '';

  const now = startOfDay(new Date());
  const target = startOfDay(articleDate);
  const diffDays = Math.round((now.getTime() - target.getTime()) / 86400000);
  const labels = relativeLabels[language] || relativeLabels.en;

  if (diffDays === 0) return labels.today;
  if (diffDays === 1) return labels.yesterday;

  const locale = language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(articleDate);
};
