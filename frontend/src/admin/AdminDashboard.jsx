import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';
import BilingualInput from './BilingualInput.jsx';
import { todayInput } from '../utils/date.js';
import { partitions, districtsByPartition } from '../utils/apData.js';

const categoryTypeOptions = [
  { value: 'home', label: 'Home (హోమ్)' },
  { value: 'amaravati', label: 'Amaravati (అమరావతి)' },
  { value: 'ap', label: 'AP (ఆంధ్రప్రదేశ్)' },
  { value: 'international', label: 'International (అంతర్జాతీయం)' },
  { value: 'national', label: 'National (జాతీయ)' },
  { value: 'sports', label: 'Sports (క్రీడలు)' },
  { value: 'cinema', label: 'Cinema (సినిమా)' },
  { value: 'other', label: 'Other (ఇతరాలు)' }
];

const toKey = (value) =>
  (value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

const AdminDashboard = () => {
  const [activePanel, setActivePanel] = useState('news');
  const [previewLang, setPreviewLang] = useState('en');
  const [date, setDate] = useState(todayInput());
  const [articles, setArticles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: { te: '', en: '' },
    content: { te: '', en: '' },
    summary: { te: '', en: '' },
    otherCategory: { te: '', en: '' },
    otherCategoryKey: '',
    publishedAt: date,
    categoryType: 'home',
    partitionCode: '',
    districtCode: '',
    isBreaking: false,
    isFeatured: false,
    priority: 0,
    images: []
  });
  const [message, setMessage] = useState('');
  const [epaperDate, setEpaperDate] = useState(todayInput());
  const [epaperUrls, setEpaperUrls] = useState({ teluguPdfUrl: '', englishPdfUrl: '' });
  const [siteSettings, setSiteSettings] = useState({
    address: { te: '', en: '' },
    contact: { te: '', en: '' },
    phone: '',
    email: ''
  });

  const authHeaders = useMemo(() => ({ auth: true }), []);
  const panels = [
    { key: 'news', label: 'News Entry (వార్తలు)' },
    { key: 'epaper', label: 'E-Paper (ఇ-పేపర్)' },
    { key: 'footer', label: 'Footer (ఫుటర్)' }
  ];

  const resetForm = () => {
    setEditingId(null);
    setForm({
      title: { te: '', en: '' },
      content: { te: '', en: '' },
      summary: { te: '', en: '' },
      otherCategory: { te: '', en: '' },
      otherCategoryKey: '',
      publishedAt: date,
      categoryType: 'home',
      partitionCode: '',
      districtCode: '',
      isBreaking: false,
      isFeatured: false,
      priority: 0,
      images: []
    });
  };

  const loadMeta = () => {
    api
      .get('/site-settings')
      .then((data) =>
        setSiteSettings({
          address: data.address || { te: '', en: '' },
          contact: data.contact || { te: '', en: '' },
          phone: data.phone || '',
          email: data.email || ''
        })
      )
      .catch(() =>
        setSiteSettings({
          address: { te: '', en: '' },
          contact: { te: '', en: '' },
          phone: '',
          email: ''
        })
      );
  };

  useEffect(() => {
    loadMeta();
  }, []);

  useEffect(() => {
    api
      .get(`/articles?date=${date}`)
      .then(setArticles)
      .catch(() => setArticles([]));
  }, [date]);

  const handleUpload = async (file, type) => {
    const data = new FormData();
    data.append('file', file);
    const result = await api.post(`/uploads/${type}`, data, { auth: true, headers: {} });
    return result.url;
  };

  const handleArticleSave = async () => {
    setMessage('');
    if (form.categoryType === 'ap' && (!form.partitionCode || !form.districtCode)) {
      setMessage('Select AP partition and district. (AP ప్రాంతం, జిల్లా ఎంపిక చేయండి)');
      return;
    }
    if (form.categoryType === 'other') {
      if (!form.otherCategory?.te || !form.otherCategory?.en) {
        setMessage('Enter Telugu and English category. (తెలుగు మరియు English కేటగిరీ ఇవ్వండి)');
        return;
      }
    }
    const payload = {
      ...form,
      otherCategoryKey: form.categoryType === 'other' ? form.otherCategoryKey || toKey(form.otherCategory.en) : '',
      publishedAt: date
    };
    try {
      if (editingId) {
        await api.put(`/articles/${editingId}`, payload, authHeaders);
        setMessage('News updated. (వార్త నవీకరించబడింది.)');
      } else {
        await api.post('/articles', payload, authHeaders);
        setMessage('News saved. (కొత్త వార్త సేవ్ అయింది.)');
      }
      resetForm();
      const data = await api.get(`/articles?date=${date}`);
      setArticles(data);
    } catch (err) {
      setMessage(err.message || 'Save failed. (సేవ్ విఫలం)');
    }
  };

  const handleEditArticle = (article) => {
    setEditingId(article._id);
    setForm({
      title: article.title,
      content: article.content,
      summary: article.summary || { te: '', en: '' },
      otherCategory: article.otherCategory || { te: '', en: '' },
      otherCategoryKey: article.otherCategoryKey || '',
      publishedAt: article.publishedAt,
      categoryType: article.categoryType,
      partitionCode: article.partitionCode || '',
      districtCode: article.districtCode || '',
      isBreaking: article.isBreaking || false,
      isFeatured: article.isFeatured || false,
      priority: article.priority || 0,
      images: article.images || []
    });
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = await handleUpload(file, 'image');
    setForm((prev) => ({ ...prev, images: [...prev.images, url] }));
  };

  const handleEpaperUpload = async (lang, file) => {
    if (!file) return;
    const url = await handleUpload(file, 'pdf');
    setEpaperUrls((prev) => ({ ...prev, [lang]: url }));
  };

  const handleEpaperSave = async () => {
    await api.post(
      '/epapers',
      {
        publishedAt: epaperDate,
        teluguPdfUrl: epaperUrls.teluguPdfUrl,
        englishPdfUrl: epaperUrls.englishPdfUrl
      },
      authHeaders
    );
    setMessage('E-paper saved. (ఇ-పేపర్ సేవ్ అయింది.)');
  };

  const handleSiteSave = async () => {
    await api.put('/site-settings', siteSettings, authHeaders);
    setMessage('Footer details saved. (ఫుటర్ వివరాలు సేవ్ అయ్యాయి.)');
  };

  return (
    <main className="page admin-page">
      <div className="admin-header">
        <h1>Admin Panel (అడ్మిన్ ప్యానల్)</h1>
        <button
          type="button"
          className="secondary"
          onClick={() => {
            localStorage.removeItem('admin-token');
            window.location.href = '/admin';
          }}
        >
          Logout
        </button>
      </div>
      <div className="admin-layout">
        <aside className="admin-sidebar">
          {panels.map((panel) => (
            <button
              key={panel.key}
              type="button"
              className={activePanel === panel.key ? 'active' : ''}
              onClick={() => setActivePanel(panel.key)}
            >
              {panel.label}
            </button>
          ))}
        </aside>
        <div className="admin-content">
          {message ? <div className="notice">{message}</div> : null}

          {activePanel === 'news' ? (
            <section className="admin-section">
              <h2>1. Add / Edit News (వార్తలు జోడించండి / మార్చండి)</h2>
              <div className="preview-toggle">
                <span>Preview (ప్రివ్యూ)</span>
                <button
                  type="button"
                  onClick={() => setPreviewLang('en')}
                  className={previewLang === 'en' ? 'active' : ''}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewLang('te')}
                  className={previewLang === 'te' ? 'active' : ''}
                >
                  తెలుగు
                </button>
              </div>
              <div className="admin-form">
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
                        otherCategory: e.target.value === 'other' ? prev.otherCategory : { te: '', en: '' },
                        otherCategoryKey: e.target.value === 'other' ? prev.otherCategoryKey : ''
                      }))
                    }
                  >
                    {categoryTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                {form.categoryType === 'other' ? (
                  <BilingualInput
                    label="Other Category (ఇతర కేటగిరీ)"
                    value={form.otherCategory}
                    onChange={(next) =>
                      setForm((prev) => ({
                        ...prev,
                        otherCategory: next,
                        otherCategoryKey: toKey(next.en)
                      }))
                    }
                  />
                ) : null}
                {form.categoryType === 'ap' ? (
                  <div className="ap-picker">
                    <div className="ap-column">
                      <h4>Partitions (ప్రాంతాలు)</h4>
                      <div className="ap-list">
                        {partitions.map((partition) => (
                          <button
                            key={partition.code}
                            type="button"
                            className={`ap-pill ${form.partitionCode === partition.code ? 'active' : ''}`}
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                partitionCode: partition.code,
                                districtCode: ''
                              }))
                            }
                          >
                            {partition.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="ap-column">
                      <h4>Districts (జిల్లాలు)</h4>
                      <div className="ap-list ap-districts">
                        {!form.partitionCode ? (
                          <div className="empty">Select a partition first. (ముందుగా ప్రాంతం ఎంచుకోండి)</div>
                        ) : null}
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
                  </div>
                ) : null}
                <BilingualInput
                  label="Title (శీర్షిక)"
                  value={form.title}
                  onChange={(next) => setForm((prev) => ({ ...prev, title: next }))}
                />
                <BilingualInput
                  label="Summary (సంక్షిప్తం)"
                  value={form.summary}
                  onChange={(next) => setForm((prev) => ({ ...prev, summary: next }))}
                  multiline
                />
                <BilingualInput
                  label="Content (వార్త)"
                  value={form.content}
                  onChange={(next) => setForm((prev) => ({ ...prev, content: next }))}
                  multiline
                />
                <div className="inline-fields">
                  <label className="checkbox-field">
                    <input
                      type="checkbox"
                      checked={form.isBreaking}
                      onChange={(e) => setForm((prev) => ({ ...prev, isBreaking: e.target.checked }))}
                    />
                    Breaking News (బ్రేకింగ్)
                  </label>
                  <label className="checkbox-field">
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(e) => setForm((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                    />
                    Featured Story (ప్రధాన వార్త)
                  </label>
                  <label>
                    Priority (ప్రాధాన్యం)
                    <input
                      type="number"
                      value={form.priority}
                      onChange={(e) => setForm((prev) => ({ ...prev, priority: Number(e.target.value) }))}
                    />
                  </label>
                </div>
                <label>
                  Images (చిత్రాలు)
                  <input type="file" accept="image/*" onChange={handleImageUpload} />
                </label>
                {form.images.length ? (
                  <div className="preview-box">{form.images.map((img) => <div key={img}>{img}</div>)}</div>
                ) : null}
                <div className="form-actions">
                  <button type="button" onClick={handleArticleSave}>
                    {editingId ? 'Update (మార్చు)' : 'Save (సేవ్)'}
                  </button>
                  <button type="button" className="secondary" onClick={resetForm}>
                    New (కొత్తది)
                  </button>
                </div>
              </div>
              <div className="preview-box">
                <strong>Preview ({previewLang === 'en' ? 'English' : 'తెలుగు'})</strong>
                <h3>{form.title?.[previewLang]}</h3>
                <p>{form.summary?.[previewLang]}</p>
                <div>{form.content?.[previewLang]}</div>
              </div>
              <div className="admin-list">
                <h3>News for this date (ఈ తేదీ వార్తలు)</h3>
                {articles.map((article) => (
                  <button key={article._id} type="button" onClick={() => handleEditArticle(article)}>
                    {article.title?.te} ({article.title?.en})
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {activePanel === 'epaper' ? (
            <section className="admin-section">
              <h2>2. Manage E-Paper (ఇ-పేపర్ నిర్వహణ)</h2>
              <div className="admin-form">
                <label>
                  Date (తేదీ)
                  <input type="date" value={epaperDate} onChange={(e) => setEpaperDate(e.target.value)} />
                </label>
                <label>
                  Telugu PDF (తెలుగు PDF)
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => handleEpaperUpload('teluguPdfUrl', e.target.files?.[0])}
                  />
                </label>
                <label>
                  English PDF (Optional) (ఆంగ్ల PDF ఐచ్ఛికం)
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => handleEpaperUpload('englishPdfUrl', e.target.files?.[0])}
                  />
                </label>
                <button type="button" onClick={handleEpaperSave}>
                  Save (సేవ్ చేయండి)
                </button>
              </div>
            </section>
          ) : null}

          {activePanel === 'footer' ? (
            <section className="admin-section">
              <h2>3. Footer Details (ఫుటర్ వివరాలు)</h2>
              <div className="admin-form">
                <BilingualInput
                  label="Address (చిరునామా)"
                  value={siteSettings.address}
                  onChange={(next) => setSiteSettings((prev) => ({ ...prev, address: next }))}
                  multiline
                />
                <BilingualInput
                  label="Contact Info (సంప్రదింపు వివరాలు)"
                  value={siteSettings.contact}
                  onChange={(next) => setSiteSettings((prev) => ({ ...prev, contact: next }))}
                  multiline
                />
                <label>
                  Phone (ఫోన్)
                  <input
                    value={siteSettings.phone}
                    onChange={(e) => setSiteSettings((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                </label>
                <label>
                  Email (ఇమెయిల్)
                  <input
                    value={siteSettings.email}
                    onChange={(e) => setSiteSettings((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </label>
                <button type="button" onClick={handleSiteSave}>
                  Save (సేవ్ చేయండి)
                </button>
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </main>
  );
};

export default AdminDashboard;
