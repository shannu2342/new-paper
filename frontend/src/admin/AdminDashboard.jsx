import React, { useEffect, useMemo, useState } from 'react';
import { api, notificationsApi, authApi, analyticsApi } from '../services/api.js';
import BilingualInput from './BilingualInput.jsx';
import RichTextInput from './RichTextInput.jsx';
import { todayInput } from '../utils/date.js';
import { partitions, districtsByPartition } from '../utils/apData.js';

const categoryTypeOptions = [
  { value: 'home', label: 'Home (హోమ్)' },
  { value: 'amaravati', label: 'Amaravati (అమరావతి)' },
  { value: 'ap', label: 'AP (ఆంధ్రప్రదేశ్)' },
  { value: 'international', label: 'International (అంతర్జాతీయం)' },
  { value: 'national', label: 'National (జాతీయ)' },
  { value: 'editorial', label: 'Editorial (ఎడిటోరియల్)' },
  { value: 'sports', label: 'Sports (క్రీడలు)' },
  { value: 'cinema', label: 'Cinema (సినిమా)' },
  { value: 'special', label: 'Special (ప్రత్యేక)' },
  { value: 'epaper', label: 'E-Paper (ఇ-పేపర్)' },
  { value: 'other', label: 'Other (ఇతరాలు)' }
];

const SPECIAL_SUBSECTION_OPTIONS = [
  { key: 'health', label: 'Health' },
  { key: 'women', label: 'Women' },
  { key: 'devotional', label: 'Devotional' },
  { key: 'crime', label: 'Crime' }
];

const HEADER_SECTION_ITEMS = [
  { value: 'home', label: 'Home' },
  { value: 'amaravati', label: 'Amaravati' },
  { value: 'ap', label: 'Andhra Pradesh' },
  { value: 'international', label: 'International' },
  { value: 'national', label: 'National' },
  { value: 'editorial', label: 'Editorial' },
  { value: 'sports', label: 'Sports' },
  { value: 'cinema', label: 'Cinema' },
  { value: 'special', label: 'Special' },
  { value: 'other', label: 'Other' }
];

const toKey = (value) =>
  (value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

const EPAPER_REGION_OPTIONS = [{ code: 'ALL', name: 'All' }, ...partitions];
const normalizeRegionCode = (value) => (value || 'ALL').toString().trim().toUpperCase();
const IMAGE_MAX_DIMENSION = 1920;
const IMAGE_QUALITY = 0.82;
const IMAGE_MAX_MB = 8;
const PDF_MAX_MB = 25;

const initialForm = (date) => ({
  title: { te: '', en: '', hi: '' },
  content: { te: '', en: '', hi: '' },
  summary: { te: '', en: '', hi: '' },
  otherCategory: { te: '', en: '', hi: '' },
  otherCategoryKey: '',
  specialSubcategoryKey: '',
  publishedAt: date,
  categoryType: 'home',
  partitionCode: '',
  districtCode: '',
  isBreaking: false,
  isFeatured: false,
  status: 'published',
  scheduledAt: '',
  priority: 0,
  images: []
});

const shouldOptimizeImage = (file) =>
  Boolean(file && file.type && file.type.startsWith('image/') && !/svg/i.test(file.type) && file.size > 350 * 1024);

const getOptimizedFilename = (name, mimeType) => {
  const base = (name || 'image').replace(/\.[^.]+$/, '');
  if (/webp/i.test(mimeType)) return `${base}.webp`;
  if (/avif/i.test(mimeType)) return `${base}.avif`;
  return `${base}.jpg`;
};

const optimizeImageFile = async (file) => {
  if (!shouldOptimizeImage(file) || typeof createImageBitmap !== 'function') {
    return file;
  }

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  const scale = Math.min(1, IMAGE_MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    return file;
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const targetMime =
    /png|webp|avif/i.test(file.type) ? 'image/webp' : /jpeg|jpg/i.test(file.type) ? 'image/jpeg' : 'image/webp';
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, targetMime, IMAGE_QUALITY));
  if (!blob || blob.size >= file.size) return file;

  return new File([blob], getOptimizedFilename(file.name, blob.type), {
    type: blob.type,
    lastModified: Date.now()
  });
};

const buildLinePoints = (rows, metric, width = 560, height = 220, padding = 24) => {
  if (!rows.length) return '';
  const maxValue = Math.max(1, ...rows.map((item) => Number(item?.[metric] || 0)));
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;
  return rows
    .map((item, index) => {
      const x = padding + (rows.length === 1 ? innerWidth / 2 : (index / (rows.length - 1)) * innerWidth);
      const y = padding + innerHeight - ((Number(item?.[metric] || 0) / maxValue) * innerHeight);
      return `${x},${y}`;
    })
    .join(' ');
};

const AdminDashboard = ({ onLogout }) => {
  const [activePanel, setActivePanel] = useState('news');
  const [previewLang, setPreviewLang] = useState('en');
  const [date, setDate] = useState(todayInput());
  const [articles, setArticles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm(date));
  const [articleSearch, setArticleSearch] = useState('');
  const [articleStatusFilter, setArticleStatusFilter] = useState('all');
  const [message, setMessage] = useState('');
  const [epaperDate, setEpaperDate] = useState(todayInput());
  const [epaperRegionCode, setEpaperRegionCode] = useState('ALL');
  const [epaperUrls, setEpaperUrls] = useState({ teluguPdfUrl: '', englishPdfUrl: '' });
  const [epaperItems, setEpaperItems] = useState([]);
  const [heroImages, setHeroImages] = useState([]);
  const [heroForm, setHeroForm] = useState({
    imageUrl: '',
    articleId: '',
    title: { en: '', te: '' },
    order: 0,
    enabled: true
  });
  const [editingHeroId, setEditingHeroId] = useState(null);
  const [siteSettings, setSiteSettings] = useState({
    regdOffice: { te: '', en: '' },
    stateOffice: { te: '', en: '' },
    contact: { te: '', en: '' },
    phone: '',
    email: ''
  });
  const [mediaItems, setMediaItems] = useState([]);
  const [mediaSearch, setMediaSearch] = useState('');
  const [pushForm, setPushForm] = useState({ title: '', body: '', url: '/' });
  const [userProfile, setUserProfile] = useState(null);
  const [accountForm, setAccountForm] = useState({ username: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [accountMessage, setAccountMessage] = useState('');
  const [analyticsDays, setAnalyticsDays] = useState(30);
  const [analyticsSummary, setAnalyticsSummary] = useState(null);
  const [panelSearch, setPanelSearch] = useState('');
  const [archiveDate, setArchiveDate] = useState(todayInput());
  const [archiveArticles, setArchiveArticles] = useState([]);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [loadingState, setLoadingState] = useState({
    articleImage: false,
    heroImage: false,
    epaperTelugu: false,
    epaperEnglish: false,
    heroSave: false,
    articleSave: false
  });

  const authHeaders = useMemo(() => ({ auth: true }), []);
  const panels = [
    { key: 'news', label: 'News Entry (వార్తలు)', description: 'Create, edit and publish news by date and section.' },
    { key: 'hero', label: 'Hero Slider (హీరో స్లైడర్)', description: 'Manage homepage hero images and display order.' },
    { key: 'epaper', label: 'E-Paper (ఇ-పేపర్)', description: 'Upload district/all-region PDF editions by date.' },
    { key: 'footer', label: 'Footer (ఫుటర్)', description: 'Update office addresses and contact information.' },
    { key: 'account', label: 'Account & Security', description: 'Update username and change password securely.' },
    { key: 'alerts', label: 'Push Alerts (అలర్ట్స్)', description: 'Send instant push notifications to subscribers.' },
    { key: 'analytics', label: 'Analytics', description: 'Track visitors, page views and top pages.' }
  ];
  const selectedHeaderSectionLabel = useMemo(() => {
    const current = HEADER_SECTION_ITEMS.find((item) => item.value === form.categoryType);
    return current?.label || 'Section';
  }, [form.categoryType]);
  const activePanelMeta = useMemo(() => {
    if (activePanel === 'news') {
      return {
        key: 'news',
        label: `News Management - ${selectedHeaderSectionLabel}`,
        description: 'Manage current section news with create, previous edit and delete controls.'
      };
    }
    return panels.find((panel) => panel.key === activePanel) || panels[0];
  }, [activePanel, panels, selectedHeaderSectionLabel]);
  const visiblePanels = useMemo(() => {
    const q = panelSearch.trim().toLowerCase();
    if (!q) return panels.filter((panel) => panel.key !== 'news');
    return panels.filter((panel) => panel.key !== 'news' && `${panel.label} ${panel.description}`.toLowerCase().includes(q));
  }, [panelSearch, panels]);
  const sidebarPrimaryPanels = useMemo(
    () => visiblePanels.filter((panel) => panel.key !== 'epaper' && panel.key !== 'hero'),
    [visiblePanels]
  );

  const resetForm = () => {
    setEditingId(null);
    setScheduleEnabled(false);
    setForm((prev) => ({
      ...initialForm(date),
      categoryType: prev.categoryType,
      partitionCode: prev.partitionCode,
      districtCode: prev.districtCode,
      otherCategory: prev.otherCategory,
      otherCategoryKey: prev.otherCategoryKey,
      specialSubcategoryKey: prev.specialSubcategoryKey
    }));
  };

  const loadArticles = () => {
    return api
      .get(`/articles?date=${date}&includeDraft=true`, authHeaders)
      .then(setArticles)
      .catch(() => setArticles([]));
  };

  const loadArchiveArticles = () => {
    return api
      .get(`/articles?date=${archiveDate}&includeDraft=true`, authHeaders)
      .then((data) => setArchiveArticles(Array.isArray(data) ? data : []))
      .catch(() => setArchiveArticles([]));
  };

  const loadHeroImages = () => {
    api
      .get('/hero-images')
      .then(setHeroImages)
      .catch(() => setHeroImages([]));
  };

  const loadMedia = () => {
    api
      .get('/uploads/files', authHeaders)
      .then(setMediaItems)
      .catch(() => setMediaItems([]));
  };

  const loadMeta = () => {
    api
      .get('/site-settings')
      .then((data) =>
        setSiteSettings({
          regdOffice: data.regdOffice || { te: '', en: '' },
          stateOffice: data.stateOffice || { te: '', en: '' },
          contact: data.contact || { te: '', en: '' },
          phone: data.phone || '',
          email: data.email || ''
        })
      )
      .catch(() =>
        setSiteSettings({
          regdOffice: { te: '', en: '' },
          stateOffice: { te: '', en: '' },
          contact: { te: '', en: '' },
          phone: '',
          email: ''
        })
      );
  };

  const loadAuthProfile = () => {
    authApi
      .me(authHeaders)
      .then(setUserProfile)
      .catch(() => setUserProfile(null));
  };

  const loadEpapers = () => {
    setEpaperItems([]);
    return api
      .get(`/epapers?date=${epaperDate}`)
      .then((data) => setEpaperItems(Array.isArray(data) ? data : []))
      .catch(() => setEpaperItems([]));
  };

  const loadAnalytics = () => {
    analyticsApi
      .summary(analyticsDays, authHeaders)
      .then(setAnalyticsSummary)
      .catch(() => setAnalyticsSummary(null));
  };

  useEffect(() => {
    loadMeta();
    loadHeroImages();
    loadMedia();
    loadAuthProfile();
  }, []);

  useEffect(() => {
    loadArticles();
  }, [date]);

  useEffect(() => {
    loadArchiveArticles();
  }, [archiveDate]);

  useEffect(() => {
    loadEpapers();
  }, [epaperDate]);

  useEffect(() => {
    if (activePanel !== 'analytics') return;
    loadAnalytics();
  }, [activePanel, analyticsDays]);

  useEffect(() => {
    setAccountForm({ username: userProfile?.username || '' });
  }, [userProfile?.username]);

  const matchesCurrentSection = (article) => {
    if (!article || article.categoryType !== form.categoryType) return false;
    if (form.categoryType === 'ap') {
      if (form.partitionCode && article.partitionCode !== form.partitionCode) return false;
      if (form.districtCode && article.districtCode !== form.districtCode) return false;
      return true;
    }
    if (form.categoryType === 'special') {
      if (!form.specialSubcategoryKey) return true;
      return (article.otherCategoryKey || '') === form.specialSubcategoryKey;
    }
    if (form.categoryType === 'other') {
      if (!form.otherCategoryKey) return true;
      return (article.otherCategoryKey || '') === form.otherCategoryKey;
    }
    return true;
  };

  const filteredArticles = useMemo(() => {
    const q = articleSearch.toLowerCase().trim();
    return articles.filter((article) => {
      if (!matchesCurrentSection(article)) return false;
      const title = `${article.title?.en || ''} ${article.title?.te || ''} ${article.title?.hi || ''}`.toLowerCase();
      const statusMatch = articleStatusFilter === 'all' || (article.status || 'published') === articleStatusFilter;
      const queryMatch = !q || title.includes(q);
      return statusMatch && queryMatch;
    });
  }, [articles, articleSearch, articleStatusFilter, form.categoryType, form.partitionCode, form.districtCode, form.specialSubcategoryKey, form.otherCategoryKey]);
  const filteredArchiveArticles = useMemo(
    () => archiveArticles.filter((article) => matchesCurrentSection(article)),
    [archiveArticles, form.categoryType, form.partitionCode, form.districtCode, form.specialSubcategoryKey, form.otherCategoryKey]
  );
  const filteredMedia = useMemo(() => {
    const q = mediaSearch.toLowerCase().trim();
    if (!q) return mediaItems;
    return mediaItems.filter((item) => item.name.toLowerCase().includes(q));
  }, [mediaItems, mediaSearch]);
  const panelCounts = useMemo(
    () => ({
      news: filteredArticles.length,
      hero: heroImages.length,
      epaper: epaperItems.length,
      footer: siteSettings.phone || siteSettings.email ? 1 : 0,
      account: userProfile ? 1 : 0,
      alerts: 0,
      analytics: analyticsSummary?.totalPageViews || 0
    }),
    [filteredArticles.length, heroImages.length, epaperItems.length, siteSettings.phone, siteSettings.email, userProfile, analyticsSummary?.totalPageViews]
  );
  const analyticsTrends = useMemo(() => analyticsSummary?.trends || [], [analyticsSummary]);
  const linePointsVisits = useMemo(() => buildLinePoints(analyticsTrends, 'visits'), [analyticsTrends]);
  const linePointsPageViews = useMemo(() => buildLinePoints(analyticsTrends, 'pageviews'), [analyticsTrends]);
  const sectionBars = useMemo(() => {
    const data = analyticsSummary?.sectionViews || {};
    const rows = [
      { key: 'home', label: 'Home', value: Number(data.home || 0) },
      { key: 'ap', label: 'AP', value: Number(data.ap || 0) },
      { key: 'other', label: 'Other', value: Number(data.other || 0) }
    ];
    const max = Math.max(1, ...rows.map((row) => row.value));
    return rows.map((row) => ({ ...row, pct: Math.round((row.value / max) * 100) }));
  }, [analyticsSummary]);

  const selectedRegionEpaper = useMemo(
    () => epaperItems.find((item) => normalizeRegionCode(item.regionCode) === normalizeRegionCode(epaperRegionCode)) || null,
    [epaperItems, epaperRegionCode]
  );

  useEffect(() => {
    setEpaperUrls({
      teluguPdfUrl: selectedRegionEpaper?.teluguPdfUrl || '',
      englishPdfUrl: selectedRegionEpaper?.englishPdfUrl || ''
    });
  }, [selectedRegionEpaper, epaperRegionCode]);

  const handleUpload = async (file, type) => {
    if (!file) {
      throw new Error('No file selected.');
    }
    if (type === 'image' && !String(file.type || '').startsWith('image/')) {
      throw new Error('Please select a valid image file.');
    }
    if (type === 'pdf') {
      const isPdf = String(file.type || '').toLowerCase() === 'application/pdf' || /\.pdf$/i.test(file.name || '');
      if (!isPdf) {
        throw new Error('Please select a valid PDF file.');
      }
    }
    const maxBytes = type === 'image' ? IMAGE_MAX_MB * 1024 * 1024 : PDF_MAX_MB * 1024 * 1024;
    if (Number(file.size || 0) > maxBytes) {
      throw new Error(`${type.toUpperCase()} file is too large. Maximum allowed is ${type === 'image' ? IMAGE_MAX_MB : PDF_MAX_MB} MB.`);
    }

    const uploadFile = type === 'image' ? await optimizeImageFile(file) : file;
    const data = new FormData();
    data.append('file', uploadFile);
    const result = await api.post(`/uploads/${type}`, data, { auth: true, headers: {}, timeoutMs: 120000 });
    return result.url;
  };

  const handleArticleSave = async () => {
    setMessage('');
    if (form.categoryType === 'ap' && (!form.partitionCode || !form.districtCode)) {
      setMessage('Select AP partition and district. (AP ప్రాంతం, జిల్లా ఎంపిక చేయండి)');
      return;
    }
    if (form.categoryType === 'other' && (!form.otherCategory?.te || !form.otherCategory?.en)) {
      setMessage('Enter English, Telugu, or Hindi category name. (English, తెలుగు లేదా हिंदी కేటగిరీ ఇవ్వండి)');
      return;
    }
    if (form.categoryType === 'special' && !form.specialSubcategoryKey) {
      setMessage('Select special subsection. (ప్రత్యేక ఉపవిభాగం ఎంచుకోండి)');
      return;
    }

    const payload = {
      ...form,
      otherCategoryKey:
        form.categoryType === 'other'
          ? form.otherCategoryKey || toKey(form.otherCategory.en)
          : form.categoryType === 'special'
            ? form.specialSubcategoryKey
            : '',
      publishedAt: date,
      scheduledAt: scheduleEnabled ? form.scheduledAt : ''
    };

    setLoadingState((prev) => ({ ...prev, articleSave: true }));
    try {
      if (editingId) {
        await api.put(`/articles/${editingId}`, payload, { ...authHeaders, timeoutMs: 120000 });
        setMessage('News updated. (వార్త నవీకరించబడింది.)');
      } else {
        await api.post('/articles', payload, { ...authHeaders, timeoutMs: 120000 });
        setMessage(payload.status === 'draft' ? 'Draft saved.' : 'News published.');
      }
      resetForm();
      await Promise.allSettled([loadArticles(), loadArchiveArticles()]);
    } catch (err) {
      setMessage(err.message || 'Save failed. (సేవ్ విఫలం)');
    } finally {
      setLoadingState((prev) => ({ ...prev, articleSave: false }));
    }
  };

  const handleEditArticle = (article) => {
    setEditingId(article._id);
    setScheduleEnabled(Boolean(article.scheduledAt));
    setForm({
      title: article.title,
      content: article.content,
      summary: article.summary || { te: '', en: '' },
      otherCategory: article.otherCategory || { te: '', en: '' },
      otherCategoryKey: article.otherCategoryKey || '',
      specialSubcategoryKey: article.categoryType === 'special' ? article.otherCategoryKey || '' : '',
      publishedAt: article.publishedAt,
      categoryType: article.categoryType,
      partitionCode: article.partitionCode || '',
      districtCode: article.districtCode || '',
      isBreaking: article.isBreaking || false,
      isFeatured: article.isFeatured || false,
      status: article.status || 'published',
      scheduledAt: article.scheduledAt ? new Date(article.scheduledAt).toISOString().slice(0, 16) : '',
      priority: article.priority || 0,
      images: article.images || []
    });
  };

  const handleReviewArticle = async (articleId, action) => {
    try {
      await api.post(`/articles/${articleId}/review`, { action }, authHeaders);
      setMessage(action === 'approve' ? 'Article approved.' : 'Article rejected.');
      loadArticles();
    } catch (err) {
      setMessage(err.message || 'Review action failed.');
    }
  };

  const handleDeleteArticle = async (articleId) => {
    if (!window.confirm('Delete this news item permanently?')) return;
    try {
      await api.delete(`/articles/${articleId}`, authHeaders);
      setMessage('News deleted successfully.');
      loadArticles();
      loadArchiveArticles();
    } catch (err) {
      setMessage(err.message || 'Delete failed.');
    }
  };

  const openNewsSection = (categoryType, partitionCode = '', districtCode = '') => {
    setActivePanel('news');
    setForm((prev) => ({
      ...prev,
      categoryType,
      partitionCode,
      districtCode,
      otherCategory: categoryType === 'other' ? prev.otherCategory : { te: '', en: '' },
      otherCategoryKey: categoryType === 'other' ? prev.otherCategoryKey : '',
      specialSubcategoryKey: categoryType === 'special' ? prev.specialSubcategoryKey : ''
    }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoadingState((prev) => ({ ...prev, articleImage: true }));
    try {
      const url = await handleUpload(file, 'image');
      setForm((prev) => ({ ...prev, images: [...prev.images, url] }));
      setMessage('Image uploaded successfully.');
      loadMedia();
    } catch (err) {
      setMessage(err.message || 'Image upload failed.');
    } finally {
      setLoadingState((prev) => ({ ...prev, articleImage: false }));
      event.target.value = '';
    }
  };

  const handleEpaperUpload = async (lang, file) => {
    if (!file) return;
    const loadingKey = lang === 'teluguPdfUrl' ? 'epaperTelugu' : 'epaperEnglish';
    setLoadingState((prev) => ({ ...prev, [loadingKey]: true }));
    try {
      const url = await handleUpload(file, 'pdf');
      setEpaperUrls((prev) => ({ ...prev, [lang]: url }));
      setMessage('PDF uploaded successfully.');
    } catch (err) {
      setMessage(err.message || 'PDF upload failed.');
    } finally {
      setLoadingState((prev) => ({ ...prev, [loadingKey]: false }));
    }
  };

  const handleHeroImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoadingState((prev) => ({ ...prev, heroImage: true }));
    try {
      const url = await handleUpload(file, 'image');
      setHeroForm((prev) => ({ ...prev, imageUrl: url }));
      setMessage('Hero image uploaded successfully.');
      loadMedia();
    } catch (err) {
      setMessage(err.message || 'Hero image upload failed.');
    } finally {
      setLoadingState((prev) => ({ ...prev, heroImage: false }));
      event.target.value = '';
    }
  };

  const handleHeroSave = async () => {
    if (!heroForm.imageUrl) {
      setMessage('Please upload an image. (చిత్రం అప్‌లోడ్ చేయండి.)');
      return;
    }
    if (!heroForm.title.en || !heroForm.title.te) {
      setMessage('Please fill English and Telugu titles. Hindi is optional. (English మరియు తెలుగు శీర్షికలను పూరించండి. हिंदी ఐచ్ఛికం.)');
      return;
    }

    setLoadingState((prev) => ({ ...prev, heroSave: true }));
    try {
      const payload = {
        ...heroForm,
        articleId: String(heroForm.articleId || '').trim() || undefined
      };
      if (editingHeroId) {
        await api.put(`/hero-images/${editingHeroId}`, payload, { ...authHeaders, timeoutMs: 120000 });
        setMessage('Hero image updated. (హీరో చిత్రం నవీకరించబడింది.)');
      } else {
        await api.post('/hero-images', payload, { ...authHeaders, timeoutMs: 120000 });
        setMessage('Hero image saved. (హీరో చిత్రం సేవ్ అయింది.)');
      }
      setHeroForm({ imageUrl: '', articleId: '', title: { en: '', te: '' }, order: 0, enabled: true });
      setEditingHeroId(null);
      await loadHeroImages();
    } catch (err) {
      setMessage(err.message || 'Save failed. (సేవ్ విఫలం)');
    } finally {
      setLoadingState((prev) => ({ ...prev, heroSave: false }));
    }
  };

  const handleEditHero = (hero) => {
    setEditingHeroId(hero._id);
    setHeroForm({
      imageUrl: hero.imageUrl,
      articleId: hero.articleId?._id || '',
      title: hero.title,
      order: hero.order,
      enabled: hero.enabled
    });
  };

  const handleDeleteHero = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hero image? (ఈ హీరో చిత్రాన్ని తొలగించాలా?)')) return;
    try {
      await api.delete(`/hero-images/${id}`, authHeaders);
      setMessage('Hero image deleted. (హీరో చిత్రం తొలగించబడింది.)');
      loadHeroImages();
    } catch (err) {
      setMessage(err.message || 'Delete failed. (తొలగించுதல் విఫలం)');
    }
  };

  const getEpaperDownloadUrl = (entry) => entry?.teluguPdfUrl || entry?.englishPdfUrl || '';

  const triggerPdfDownload = (url) => {
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.click();
  };

  const handleAdminEpaperDownload = (regionCode) => {
    if (normalizeRegionCode(regionCode) === 'ALL') {
      const urls = epaperItems
        .map(getEpaperDownloadUrl)
        .filter(Boolean)
        .filter((url, index, arr) => arr.indexOf(url) === index);
      urls.forEach((url) => triggerPdfDownload(url));
      return;
    }
    const item = epaperItems.find((entry) => normalizeRegionCode(entry.regionCode) === normalizeRegionCode(regionCode));
    triggerPdfDownload(getEpaperDownloadUrl(item));
  };

  const handleEpaperSave = async () => {
    if (!epaperUrls.teluguPdfUrl && !epaperUrls.englishPdfUrl) {
      setMessage('Upload at least one PDF for selected region. (ఎంచుకున్న ప్రాంతానికి కనీసం ఒక PDF అప్‌లోడ్ చేయండి)');
      return;
    }
    await api.post(
      '/epapers',
      {
        publishedAt: epaperDate,
        regionCode: normalizeRegionCode(epaperRegionCode),
        teluguPdfUrl: epaperUrls.teluguPdfUrl || epaperUrls.englishPdfUrl,
        englishPdfUrl: epaperUrls.englishPdfUrl
      },
      { ...authHeaders, timeoutMs: 30000 }
    );
    await loadEpapers();
    setMessage('E-paper saved for selected region. (ఎంచుకున్న ప్రాంతానికి ఇ-పేపర్ సేవ్ అయింది.)');
  };

  const handleEditEpaper = (item) => {
    if (!item) return;
    setEpaperRegionCode(normalizeRegionCode(item.regionCode));
    setEpaperUrls({
      teluguPdfUrl: item.teluguPdfUrl || '',
      englishPdfUrl: item.englishPdfUrl || ''
    });
    setMessage(`Editing E-paper for ${item.regionCode || 'ALL'}.`);
  };

  const handleDeleteEpaper = async (id) => {
    if (!id) return;
    if (!window.confirm('Delete this E-paper record?')) return;
    try {
      await api.delete(`/epapers/${id}`, authHeaders);
      await loadEpapers();
      setMessage('E-paper deleted successfully.');
    } catch (err) {
      setMessage(err.message || 'Unable to delete E-paper.');
    }
  };

  const handleSiteSave = async () => {
    await api.put('/site-settings', siteSettings, { ...authHeaders, timeoutMs: 30000 });
    setMessage('Footer details saved. (ఫుటర్ వివరాలు సేవ్ అయ్యాయి.)');
  };

  const handlePushSend = async () => {
    try {
      await notificationsApi.broadcast(pushForm, { ...authHeaders, timeoutMs: 30000 });
      setMessage('Push notification sent.');
      setPushForm({ title: '', body: '', url: '/' });
    } catch (err) {
      setMessage(err.message || 'Push send failed');
    }
  };

  const handleAccountSave = async () => {
    setAccountMessage('');
    const username = String(accountForm.username || '').trim().toLowerCase();
    if (!username) {
      setAccountMessage('Username is required.');
      return;
    }
    try {
      const updated = await authApi.updateProfile({ username }, { ...authHeaders, timeoutMs: 30000 });
      setUserProfile(updated);
      setAccountMessage('Username updated successfully.');
    } catch (err) {
      setAccountMessage(err.message || 'Unable to update username.');
    }
  };

  const handlePasswordSave = async () => {
    setAccountMessage('');
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setAccountMessage('Current password and new password are required.');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setAccountMessage('New password must be at least 8 characters.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setAccountMessage('New password and confirm password do not match.');
      return;
    }
    try {
      await authApi.changePassword(
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        },
        { ...authHeaders, timeoutMs: 30000 }
      );
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setAccountMessage('Password changed successfully.');
    } catch (err) {
      setAccountMessage(err.message || 'Unable to change password.');
    }
  };

  return (
    <main className="page admin-page">
      <div className="admin-header">
        <h1>Newspaper Admin Console</h1>
        <div className="admin-header-meta">
          {userProfile ? <span className="push-status">User: {userProfile.username} | Role: {userProfile.role}</span> : null}
        <button
          type="button"
          className="secondary"
          onClick={() => {
            localStorage.removeItem('admin-token');
            if (onLogout) onLogout();
            window.location.href = '/admin/login';
          }}
        >
          Logout
        </button>
        </div>
      </div>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-sidebar__brand">
            <strong>Greatertoday Admin</strong>
            <small>Simple controls for daily publishing</small>
          </div>
          <label className="admin-sidebar__search">
            <span>Find section</span>
            <input
              type="text"
              value={panelSearch}
              onChange={(e) => setPanelSearch(e.target.value)}
              placeholder="Search panel..."
            />
          </label>
          <button type="button" className={activePanel === 'hero' ? 'active' : ''} onClick={() => setActivePanel('hero')}>
            <span>Hero Slider</span>
            <span className="panel-count">{panelCounts.hero || 0}</span>
          </button>
          <div className="admin-sidebar__group">
            <div className="admin-sidebar__section-title">Frontend Sections</div>
            {HEADER_SECTION_ITEMS.map((section) => {
              if (section.value === 'ap') {
                return (
                  <details key={section.value} className="admin-sidebar-tree" defaultOpen>
                    <summary className={`admin-subnav ${activePanel === 'news' && form.categoryType === 'ap' ? 'active' : ''}`}>Andhra Pradesh</summary>
                    <div className="admin-district-nav__items">
                      <button
                        type="button"
                        className={`admin-subnav tiny ${activePanel === 'news' && form.categoryType === 'ap' && !form.partitionCode ? 'active' : ''}`}
                        onClick={() => openNewsSection('ap')}
                      >
                        All Andhra Pradesh
                      </button>
                      {partitions.map((partition) => (
                        <button
                          key={partition.code}
                          type="button"
                          className={`admin-subnav tiny ${form.partitionCode === partition.code && activePanel === 'news' ? 'active' : ''}`}
                          onClick={() => openNewsSection('ap', partition.code, '')}
                        >
                          {partition.name}
                        </button>
                      ))}
                    </div>
                  </details>
                );
              }
              if (section.value === 'special') {
                return (
                  <details key={section.value} className="admin-sidebar-tree" defaultOpen>
                    <summary className={`admin-subnav ${activePanel === 'news' && form.categoryType === 'special' ? 'active' : ''}`}>Special</summary>
                    <div className="admin-district-nav__items">
                      <button
                        type="button"
                        className={`admin-subnav tiny ${activePanel === 'news' && form.categoryType === 'special' && !form.specialSubcategoryKey ? 'active' : ''}`}
                        onClick={() => openNewsSection('special')}
                      >
                        All Special
                      </button>
                      {SPECIAL_SUBSECTION_OPTIONS.map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          className={`admin-subnav tiny ${form.specialSubcategoryKey === item.key && activePanel === 'news' ? 'active' : ''}`}
                          onClick={() => {
                            openNewsSection('special');
                            setForm((prev) => ({ ...prev, specialSubcategoryKey: item.key }));
                          }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </details>
                );
              }
              return (
                <button
                  key={section.value}
                  type="button"
                  className={activePanel === 'news' && form.categoryType === section.value ? 'active' : ''}
                  onClick={() => openNewsSection(section.value)}
                >
                  <span>{section.label}</span>
                  <span className="panel-count">{activePanel === 'news' && form.categoryType === section.value ? filteredArticles.length : 0}</span>
                </button>
              );
            })}
            <details className="admin-sidebar-tree" defaultOpen>
              <summary className={`admin-subnav ${activePanel === 'epaper' ? 'active' : ''}`}>E-Paper (PDF)</summary>
              <div className="admin-district-nav__items">
                <button
                  type="button"
                  className={`admin-subnav tiny ${activePanel === 'epaper' && normalizeRegionCode(epaperRegionCode) === 'ALL' ? 'active' : ''}`}
                  onClick={() => {
                    setActivePanel('epaper');
                    setEpaperRegionCode('ALL');
                  }}
                >
                  All Regions
                </button>
                {EPAPER_REGION_OPTIONS.map((region) => (
                  <button
                    key={region.code}
                    type="button"
                    className={`admin-subnav tiny ${activePanel === 'epaper' && normalizeRegionCode(epaperRegionCode) === normalizeRegionCode(region.code) ? 'active' : ''}`}
                    onClick={() => {
                      setActivePanel('epaper');
                      setEpaperRegionCode(normalizeRegionCode(region.code));
                    }}
                  >
                    {region.name}
                  </button>
                ))}
              </div>
            </details>
          </div>
          {sidebarPrimaryPanels.map((panel) => (
            <button key={panel.key} type="button" className={activePanel === panel.key ? 'active' : ''} onClick={() => setActivePanel(panel.key)}>
              <span>{panel.label}</span>
              <span className="panel-count">{panelCounts[panel.key] || 0}</span>
            </button>
          ))}
        </aside>

        <div className="admin-content">
          <section className="admin-section admin-panel-head">
            <h2>{activePanelMeta.label}</h2>
            <p>{activePanelMeta.description}</p>
          </section>
          {message ? <div className="notice">{message}</div> : null}

          {activePanel === 'hero' ? (
            <section className="admin-section">
              <h2>2. Manage Hero Slider (హీరో స్లైడర్ నిర్వహణ)</h2>
              <div className="admin-split-layout">
                <div className="admin-card-stack">
                  <div className="admin-form">
                    <label>
                      Image (చిత్రం)
                      <input type="file" accept="image/*,.webp,.avif" onChange={handleHeroImageUpload} />
                    </label>
                    {loadingState.heroImage ? <div className="upload-progress"><span className="spinner" /> Uploading hero image...</div> : null}
                    {heroForm.imageUrl ? <div className="preview-box"><img src={heroForm.imageUrl} alt="Preview" style={{ maxWidth: '200px', maxHeight: '100px' }} /></div> : null}
                    <BilingualInput label="Title (శీర్షిక)" value={heroForm.title} onChange={(next) => setHeroForm((prev) => ({ ...prev, title: next }))} />
                    <label>
                      Order (స్థానం)
                      <input type="number" value={heroForm.order} onChange={(e) => setHeroForm((prev) => ({ ...prev, order: Number(e.target.value) }))} />
                    </label>
                    <label className="checkbox-field">
                      <input type="checkbox" checked={heroForm.enabled} onChange={(e) => setHeroForm((prev) => ({ ...prev, enabled: e.target.checked }))} />
                      Enabled (ప్రయోగంలో ఉంచు)
                    </label>
                    <div className="form-actions">
                      <button type="button" onClick={handleHeroSave} disabled={loadingState.heroSave || loadingState.heroImage}>
                        {loadingState.heroSave ? 'Saving...' : editingHeroId ? 'Update (మార్చు)' : 'Save (సేవ్)'}
                      </button>
                      {editingHeroId ? (
                        <button type="button" className="secondary" onClick={() => {
                          setHeroForm({ imageUrl: '', articleId: '', title: { en: '', te: '' }, order: 0, enabled: true });
                          setEditingHeroId(null);
                        }}>
                          Cancel (రద్దు)
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className="media-library">
                    <h3>Media Library</h3>
                    <div className="media-grid">
                      {filteredMedia.slice(0, 8).map((item) => (
                        <button key={item.name} type="button" className="media-item" onClick={() => setHeroForm((prev) => ({ ...prev, imageUrl: item.url }))}>
                          <img src={item.url} alt={item.name} loading="lazy" decoding="async" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="admin-list">
                  <h3>Hero Images (హీరో చిత్రాలు)</h3>
                  {heroImages.map((hero) => (
                    <div key={hero._id} className="hero-item">
                      <div className="hero-preview"><img src={hero.imageUrl} alt="Thumbnail" loading="lazy" decoding="async" style={{ width: '80px', height: '40px', objectFit: 'cover' }} /></div>
                      <div className="hero-info">
                        <div className="hero-title">{hero.title.en} ({hero.title.te})</div>
                        <div className="hero-meta">Order: {hero.order} | {hero.enabled ? 'Enabled' : 'Disabled'}</div>
                      </div>
                      <div className="hero-actions">
                        <button type="button" onClick={() => handleEditHero(hero)}>Edit</button>
                        <button type="button" className="secondary" onClick={() => handleDeleteHero(hero._id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {activePanel === 'news' ? (
            <section className="admin-section">
              <h2>1. Add / Edit News (వార్తలు జోడించండి / మార్చండి)</h2>
              <div className="preview-toggle">
                <span>Preview (ప్రివ్యూ)</span>
                <button type="button" onClick={() => setPreviewLang('en')} className={previewLang === 'en' ? 'active' : ''}>English</button>
                <button type="button" onClick={() => setPreviewLang('te')} className={previewLang === 'te' ? 'active' : ''}>తెలుగు</button>
                <button type="button" onClick={() => setPreviewLang('hi')} className={previewLang === 'hi' ? 'active' : ''}>हिंदी</button>
              </div>
              <div className="admin-news-quickpicker">
                <div>
                  <strong>Current Section</strong>
                  <div className="admin-news-quickpicker__sections">
                    <span className="push-status">{selectedHeaderSectionLabel}</span>
                  </div>
                </div>
                {form.categoryType === 'ap' ? (
                  <div className="admin-news-quickpicker__subsections">
                    <strong>AP Section Levels</strong>
                    <label>
                      Layer 1 - Partition
                      <select
                        value={form.partitionCode}
                        onChange={(e) => setForm((prev) => ({ ...prev, partitionCode: e.target.value, districtCode: '' }))}
                      >
                        <option value="">Select Partition</option>
                        {partitions.map((partition) => (
                          <option key={partition.code} value={partition.code}>
                            {partition.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="admin-news-quickpicker__subgrid">
                      {(districtsByPartition[form.partitionCode] || []).map((district) => (
                        <button
                          key={district.code}
                          type="button"
                          className={`ap-pill ${form.districtCode === district.code ? 'active' : ''}`}
                          onClick={() => setForm((prev) => ({ ...prev, districtCode: district.code }))}
                        >
                          {district.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
                {form.categoryType === 'special' ? (
                  <div className="admin-news-quickpicker__subsections">
                    <strong>Special Subsection</strong>
                    <div className="admin-news-quickpicker__subgrid">
                      {SPECIAL_SUBSECTION_OPTIONS.map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          className={`ap-pill ${form.specialSubcategoryKey === item.key ? 'active' : ''}`}
                          onClick={() => setForm((prev) => ({ ...prev, specialSubcategoryKey: item.key }))}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="admin-news-layout">
                <div className="admin-card-stack">
                  <div className="admin-form">
                    <section className="admin-subsection">
                      <div className="admin-subsection__title">1. Basics (మూల సమాచారం)</div>
                      <div className="admin-subsection__content">
                        <label>
                          Date (తేదీ)
                          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                        </label>
                        <label>
                          Category (విభాగం)
                          <select
                            value={form.categoryType}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                categoryType: e.target.value,
                                partitionCode: e.target.value === 'ap' ? prev.partitionCode : '',
                                districtCode: e.target.value === 'ap' ? prev.districtCode : '',
                                otherCategory: e.target.value === 'other' ? prev.otherCategory : { te: '', en: '' },
                                otherCategoryKey: e.target.value === 'other' ? prev.otherCategoryKey : '',
                                specialSubcategoryKey: e.target.value === 'special' ? prev.specialSubcategoryKey : ''
                              }))
                            }
                          >
                            {categoryTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                          </select>
                        </label>

                        <label>
                          Workflow Status
                          <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                            <option value="pending_review">Pending Review</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </label>

                        {form.categoryType === 'other' ? (
                          <BilingualInput
                            label="Other Category (ఇతర కేటగిరీ)"
                            value={form.otherCategory}
                            onChange={(next) => setForm((prev) => ({ ...prev, otherCategory: next, otherCategoryKey: toKey(next.en) }))}
                          />
                        ) : null}
                        {form.categoryType === 'special' ? (
                          <label>
                            Special Subsection (ఉపవిభాగం)
                            <select
                              value={form.specialSubcategoryKey}
                              onChange={(e) => setForm((prev) => ({ ...prev, specialSubcategoryKey: e.target.value }))}
                            >
                              <option value="">Select special subsection</option>
                              {SPECIAL_SUBSECTION_OPTIONS.map((item) => (
                                <option key={item.key} value={item.key}>
                                  {item.label}
                                </option>
                              ))}
                            </select>
                          </label>
                        ) : null}

                        {form.categoryType === 'ap' ? (
                          <div className="ap-picker">
                            <div className="ap-column">
                              <h4>Partitions (ప్రాంతాలు)</h4>
                              <div className="ap-list">
                                {partitions.map((partition) => (
                                  <button key={partition.code} type="button" className={`ap-pill ${form.partitionCode === partition.code ? 'active' : ''}`} onClick={() => setForm((prev) => ({ ...prev, partitionCode: partition.code, districtCode: '' }))}>
                                    {partition.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="ap-column">
                              <h4>Districts (జిల్లాలు)</h4>
                              <div className="ap-list ap-districts">
                                {!form.partitionCode ? <div className="empty">Select a partition first. (ముందుగా ప్రాంతం ఎంచుకోండి)</div> : null}
                                {(districtsByPartition[form.partitionCode] || []).map((district) => (
                                  <button key={district.code} type="button" className={`ap-pill ${form.districtCode === district.code ? 'active' : ''}`} onClick={() => setForm((prev) => ({ ...prev, districtCode: district.code }))}>
                                    {district.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </section>

                    <section className="admin-subsection">
                      <div className="admin-subsection__title">2. Content (విషయం)</div>
                      <div className="admin-subsection__content">
                        <BilingualInput label="Title (శీర్షిక)" value={form.title} onChange={(next) => setForm((prev) => ({ ...prev, title: next }))} />
                        <BilingualInput label="Summary (సంక్షిప్తం)" value={form.summary} onChange={(next) => setForm((prev) => ({ ...prev, summary: next }))} multiline />
                        <RichTextInput label="Content (వార్త)" value={form.content} onChange={(next) => setForm((prev) => ({ ...prev, content: next }))} />
                      </div>
                    </section>

                    <section className="admin-subsection">
                      <div className="admin-subsection__title">3. Media (చిత్రాలు)</div>
                      <div className="admin-subsection__content">
                        <label>
                          Images (చిత్రాలు)
                          <input type="file" accept="image/*,.webp,.avif" onChange={handleImageUpload} />
                        </label>
                        {loadingState.articleImage ? <div className="upload-progress"><span className="spinner" /> Uploading image...</div> : null}
                        {form.images.length ? <div className="preview-box">{form.images.map((img) => <div key={img}>{img}</div>)}</div> : null}

                        <div className="media-library">
                          <h3>Media Library (Reusable)</h3>
                          <input value={mediaSearch} onChange={(e) => setMediaSearch(e.target.value)} placeholder="Search media..." />
                          <div className="media-grid">
                            {filteredMedia.slice(0, 16).map((item) => (
                              <button key={item.name} type="button" className="media-item" onClick={() => setForm((prev) => ({ ...prev, images: [...prev.images, item.url] }))}>
                                <img src={item.url} alt={item.name} loading="lazy" decoding="async" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="admin-subsection">
                      <div className="admin-subsection__title">4. Publish Settings (ప్రచురణ సెట్టింగ్స్)</div>
                      <div className="admin-subsection__content">
                        <div className="inline-fields">
                          <label className="checkbox-field">
                            <input type="checkbox" checked={form.isBreaking} onChange={(e) => setForm((prev) => ({ ...prev, isBreaking: e.target.checked }))} />
                            Breaking News (బ్రేకింగ్)
                          </label>
                          <label className="checkbox-field">
                            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm((prev) => ({ ...prev, isFeatured: e.target.checked }))} />
                            Featured Story (ప్రధాన వార్త)
                          </label>
                          <label>
                            Priority (ప్రాధాన్యం)
                            <input type="number" value={form.priority} onChange={(e) => setForm((prev) => ({ ...prev, priority: Number(e.target.value) }))} />
                          </label>
                          <label>
                            Schedule (Optional)
                            <div className="schedule-field">
                              <label className="checkbox-field">
                                <input
                                  type="checkbox"
                                  checked={scheduleEnabled}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setScheduleEnabled(checked);
                                    if (!checked) {
                                      setForm((prev) => ({ ...prev, scheduledAt: '' }));
                                    }
                                  }}
                                />
                                Enable schedule
                              </label>
                              <input
                                type="datetime-local"
                                value={form.scheduledAt || ''}
                                disabled={!scheduleEnabled}
                                onChange={(e) => setForm((prev) => ({ ...prev, scheduledAt: e.target.value }))}
                              />
                            </div>
                          </label>
                        </div>

                        <div className="form-actions">
                          <button type="button" onClick={handleArticleSave} disabled={loadingState.articleSave}>
                            {loadingState.articleSave ? 'Saving...' : editingId ? 'Update (మార్చు)' : form.status === 'draft' ? 'Save Draft' : 'Publish'}
                          </button>
                          <button type="button" className="secondary" onClick={resetForm}>New (కొత్తది)</button>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>

                <div className="admin-card-stack">
                  <div className="preview-box">
                    <strong>Preview ({previewLang === 'en' ? 'English' : previewLang === 'te' ? 'తెలుగు' : 'हिंदी'})</strong>
                    <h3>{form.title?.[previewLang]}</h3>
                    <p>{(form.summary?.[previewLang] || '').replace(/<[^>]*>/g, '')}</p>
                    <div dangerouslySetInnerHTML={{ __html: form.content?.[previewLang] || '' }} />
                  </div>

                  <div className="admin-list">
                    <h3>News for this date (ఈ తేదీ వార్తలు)</h3>
                    <div className="admin-list-filters">
                      <input value={articleSearch} onChange={(e) => setArticleSearch(e.target.value)} placeholder="Search title..." />
                      <select value={articleStatusFilter} onChange={(e) => setArticleStatusFilter(e.target.value)}>
                        <option value="all">All</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="pending_review">Pending Review</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    {filteredArticles.map((article) => (
                      <div key={article._id} className="admin-news-item">
                        <button type="button" onClick={() => handleEditArticle(article)} className="admin-news-main">
                          <span>{article.title?.te || article.title?.hi || article.title?.en} ({article.title?.en || article.title?.hi || article.title?.te})</span>
                          <span className={`status-badge ${(article.status || 'published') === 'draft' ? 'status-draft' : (article.status || 'published') === 'pending_review' ? 'status-pending' : 'status-published'}`}>
                            {(article.status || 'published').toUpperCase()}
                          </span>
                        </button>
                        <div className="admin-news-review">
                          <button type="button" className="secondary" onClick={() => handleEditArticle(article)}>Edit</button>
                          <button type="button" className="danger" onClick={() => handleDeleteArticle(article._id)}>Delete</button>
                        </div>
                        {(article.status || 'published') === 'pending_review' ? (
                          <div className="admin-news-review">
                            <button type="button" onClick={() => handleReviewArticle(article._id, 'approve')}>Approve</button>
                            <button type="button" className="secondary" onClick={() => handleReviewArticle(article._id, 'reject')}>Reject</button>
                          </div>
                        ) : null}
                      </div>
                    ))}
                    {!filteredArticles.length ? <div className="empty">No news found for this section on selected date.</div> : null}
                  </div>

                  <div className="admin-list">
                    <h3>Previous News Manager</h3>
                    <div className="admin-list-filters">
                      <input type="date" value={archiveDate} onChange={(e) => setArchiveDate(e.target.value)} />
                      <span className="push-status">{filteredArchiveArticles.length} items</span>
                    </div>
                    {filteredArchiveArticles.map((article) => (
                      <div key={`archive-${article._id}`} className="admin-news-item">
                        <button type="button" className="admin-news-main" onClick={() => {
                          setDate(archiveDate);
                          handleEditArticle(article);
                          setActivePanel('news');
                        }}>
                          <span>{article.title?.te || article.title?.hi || article.title?.en || 'Untitled'}</span>
                          <span className={`status-badge ${(article.status || 'published') === 'draft' ? 'status-draft' : (article.status || 'published') === 'pending_review' ? 'status-pending' : 'status-published'}`}>
                            {(article.status || 'published').toUpperCase()}
                          </span>
                        </button>
                        <div className="admin-news-review">
                          <button
                            type="button"
                            className="secondary"
                            onClick={() => {
                              setDate(archiveDate);
                              handleEditArticle(article);
                            }}
                          >
                            Edit
                          </button>
                          <button type="button" className="danger" onClick={() => handleDeleteArticle(article._id)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                    {!filteredArchiveArticles.length ? <div className="empty">No previous news found for this section on selected archive date.</div> : null}
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {activePanel === 'epaper' ? (
            <section className="admin-section">
              <h2>3. Manage E-Paper (ఇ-పేపర్ నిర్వహణ)</h2>
              <div className="admin-form">
                <label>
                  Date (తేదీ)
                  <input type="date" value={epaperDate} onChange={(e) => setEpaperDate(e.target.value)} />
                </label>
                <label>
                  Layer 1 - Region Group
                  <select value={epaperRegionCode} onChange={(e) => setEpaperRegionCode(normalizeRegionCode(e.target.value))}>
                    {EPAPER_REGION_OPTIONS.map((region) => (
                      <option key={region.code} value={normalizeRegionCode(region.code)}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="epaper-region-grid">
                  <strong>Layer 2 - Click Region Sub Header</strong>
                  {EPAPER_REGION_OPTIONS.map((region) => {
                    const regionCode = normalizeRegionCode(region.code);
                    return (
                      <button
                        key={regionCode}
                        type="button"
                        className={`epaper-region-button ${normalizeRegionCode(epaperRegionCode) === regionCode ? 'active' : ''}`}
                        onClick={() => setEpaperRegionCode(regionCode)}
                      >
                        {region.name}
                      </button>
                    );
                  })}
                </div>
                <label>
                  Telugu PDF (తెలుగు PDF)
                  <input type="file" accept="application/pdf" onChange={(e) => handleEpaperUpload('teluguPdfUrl', e.target.files?.[0])} />
                </label>
                {loadingState.epaperTelugu ? <div className="upload-progress"><span className="spinner" /> Uploading Telugu PDF...</div> : null}
                <label>
                  English PDF (Optional) (ఆంగ్ల PDF ఐచ్ఛికం)
                  <input type="file" accept="application/pdf" onChange={(e) => handleEpaperUpload('englishPdfUrl', e.target.files?.[0])} />
                </label>
                {loadingState.epaperEnglish ? <div className="upload-progress"><span className="spinner" /> Uploading English PDF...</div> : null}
                <div className="form-actions">
                  <button type="button" onClick={handleEpaperSave}>Save (సేవ్ చేయండి)</button>
                  <button type="button" className="secondary" disabled={!epaperItems.length} onClick={() => handleAdminEpaperDownload('ALL')}>
                    Download All PDFs
                  </button>
                </div>
                <div className="admin-list">
                  <h3>Uploaded for {epaperDate}</h3>
                  {EPAPER_REGION_OPTIONS.map((region) => {
                    const regionCode = normalizeRegionCode(region.code);
                    const item = epaperItems.find((entry) => normalizeRegionCode(entry.regionCode) === regionCode);
                    const canDownload = Boolean(getEpaperDownloadUrl(item));
                    return (
                      <div key={regionCode} className="epaper-region-row">
                        <div className="epaper-region-info">
                          <span>{region.name}</span>
                          <span className={`epaper-status ${canDownload ? 'epaper-status--uploaded' : 'epaper-status--missing'}`}>
                            {canDownload ? 'Uploaded' : 'Not uploaded'}
                          </span>
                        </div>
                        <div className="admin-news-review">
                          <button type="button" className="secondary" disabled={!item} onClick={() => handleEditEpaper(item)}>
                            Edit
                          </button>
                          <button type="button" className="secondary" disabled={!canDownload} onClick={() => handleAdminEpaperDownload(regionCode)}>
                            Download
                          </button>
                          <button type="button" className="danger" disabled={!item} onClick={() => handleDeleteEpaper(item?._id)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          ) : null}

          {activePanel === 'footer' ? (
            <section className="admin-section">
              <h2>4. Footer Details (ఫుటర్ వివరాలు)</h2>
              <div className="admin-form">
                <BilingualInput label="Regd Office Address (నమోదిత కార్యాలయ చిరునామా)" value={siteSettings.regdOffice} onChange={(next) => setSiteSettings((prev) => ({ ...prev, regdOffice: next }))} multiline />
                <BilingualInput label="State Office Address (రాష్ట్ర కార్యాలయ చిరునామా)" value={siteSettings.stateOffice} onChange={(next) => setSiteSettings((prev) => ({ ...prev, stateOffice: next }))} multiline />
                <BilingualInput label="Contact Info (సంప్రదింపు వివరాలు)" value={siteSettings.contact} onChange={(next) => setSiteSettings((prev) => ({ ...prev, contact: next }))} multiline />
                <label>
                  Phone (ఫోన్)
                  <input value={siteSettings.phone} onChange={(e) => setSiteSettings((prev) => ({ ...prev, phone: e.target.value }))} />
                </label>
                <label>
                  Email (ఇమెయిల్)
                  <input value={siteSettings.email} onChange={(e) => setSiteSettings((prev) => ({ ...prev, email: e.target.value }))} />
                </label>
                <button type="button" onClick={handleSiteSave}>Save (సేవ్ చేయండి)</button>
              </div>
            </section>
          ) : null}

          {activePanel === 'alerts' ? (
            <section className="admin-section">
              <h2>5. Push Notifications</h2>
              <div className="admin-form">
                <label>
                  Title
                  <input value={pushForm.title} onChange={(e) => setPushForm((prev) => ({ ...prev, title: e.target.value }))} />
                </label>
                <label>
                  Message
                  <textarea value={pushForm.body} onChange={(e) => setPushForm((prev) => ({ ...prev, body: e.target.value }))} />
                </label>
                <label>
                  URL
                  <input value={pushForm.url} onChange={(e) => setPushForm((prev) => ({ ...prev, url: e.target.value }))} />
                </label>
                <button type="button" onClick={handlePushSend}>Send Push</button>
              </div>
            </section>
          ) : null}

          {activePanel === 'account' ? (
            <section className="admin-section">
              <h2>6. Admin Credentials & Security</h2>
              <p className="section-subtitle">Change admin username and password from here. Use strong credentials and keep them private.</p>
              {accountMessage ? <div className="notice">{accountMessage}</div> : null}
              <div className="admin-split-layout">
                <div className="admin-form admin-surface">
                  <h3>Update Username</h3>
                  <p className="section-subtitle">Current login ID used for admin sign-in.</p>
                  <label>
                    New Username
                    <input
                      value={accountForm.username}
                      onChange={(e) => setAccountForm((prev) => ({ ...prev, username: e.target.value }))}
                      placeholder="admin username"
                    />
                  </label>
                  <button type="button" onClick={handleAccountSave}>Save Username</button>
                </div>
                <div className="admin-form admin-surface">
                  <h3>Change Password</h3>
                  <p className="section-subtitle">Use at least 8 characters. Prefer letters, numbers, and symbols.</p>
                  <label>
                    Current Password
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                    />
                  </label>
                  <label>
                    New Password
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                    />
                  </label>
                  <label>
                    Confirm New Password
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    />
                  </label>
                  <button type="button" onClick={handlePasswordSave}>Change Password</button>
                </div>
              </div>
              <div className="admin-security-tips">
                <strong>Security checklist</strong>
                <ul>
                  <li>Change password monthly.</li>
                  <li>Do not share admin credentials on WhatsApp.</li>
                  <li>Use unique password for this site only.</li>
                </ul>
              </div>
            </section>
          ) : null}

          {activePanel === 'analytics' ? (
            <section className="admin-section">
              <h2>7. Analytics Dashboard</h2>
              <div className="admin-form">
                <label>
                  Range (days)
                  <select value={analyticsDays} onChange={(e) => setAnalyticsDays(Number(e.target.value))}>
                    <option value={7}>Last 7 days</option>
                    <option value={30}>Last 30 days</option>
                    <option value={60}>Last 60 days</option>
                    <option value={90}>Last 90 days</option>
                  </select>
                </label>
                <button type="button" onClick={loadAnalytics}>Refresh Analytics</button>
              </div>

              {!analyticsSummary ? (
                <div className="empty">No analytics data available.</div>
              ) : (
                <div className="admin-card-stack">
                  <div className="inline-fields">
                    <div className="epaper-region-row"><strong>Total Visits</strong><span>{analyticsSummary.totalVisits}</span></div>
                    <div className="epaper-region-row"><strong>Total Page Views</strong><span>{analyticsSummary.totalPageViews}</span></div>
                    <div className="epaper-region-row"><strong>Unique Visitors</strong><span>{analyticsSummary.uniqueVisitors}</span></div>
                  </div>
                  <div className="admin-list">
                    <h3>Visits vs Page Views Trend</h3>
                    <div className="analytics-chart-card">
                      <svg viewBox="0 0 560 220" role="img" aria-label="Analytics trend chart" className="analytics-line-chart">
                        <polyline points={linePointsVisits} className="line-visits" />
                        <polyline points={linePointsPageViews} className="line-pageviews" />
                      </svg>
                      <div className="analytics-legend">
                        <span><i className="legend-dot legend-visits" /> Visits</span>
                        <span><i className="legend-dot legend-pageviews" /> Page Views</span>
                      </div>
                    </div>
                  </div>

                  <div className="admin-list">
                    <h3>Section Views (Home/AP/Other)</h3>
                    <div className="analytics-bars">
                      {sectionBars.map((row) => (
                        <div key={row.key} className="analytics-bar-row">
                          <div className="analytics-bar-label">{row.label}</div>
                          <div className="analytics-bar-track">
                            <div className="analytics-bar-fill" style={{ width: `${row.pct}%` }} />
                          </div>
                          <div className="analytics-bar-value">{row.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="admin-list">
                    <h3>Top Pages</h3>
                    {(analyticsSummary.topPages || []).map((item) => (
                      <div key={item.path} className="epaper-region-row">
                        <span>{item.path || '/'}</span>
                        <span>{item.views}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          ) : null}
        </div>
      </div>
    </main>
  );
};

export default AdminDashboard;
