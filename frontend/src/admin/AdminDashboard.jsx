import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';
import BilingualInput from './BilingualInput.jsx';
import SortableList from './SortableList.jsx';
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

const AdminDashboard = () => {
  const [previewLang, setPreviewLang] = useState('en');
  const [date, setDate] = useState(todayInput());
  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [articles, setArticles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: { te: '', en: '' },
    content: { te: '', en: '' },
    summary: { te: '', en: '' },
    publishedAt: date,
    categoryType: 'home',
    category: '',
    apRegion: '',
    district: '',
    partitionCode: '',
    districtCode: '',
    isBreaking: false,
    isFeatured: false,
    priority: 0,
    images: []
  });
  const [message, setMessage] = useState('');
  const [headerItems, setHeaderItems] = useState([]);
  const [otherCategories, setOtherCategories] = useState([]);
  const [epaperDate, setEpaperDate] = useState(todayInput());
  const [epaperUrls, setEpaperUrls] = useState({ teluguPdfUrl: '', englishPdfUrl: '' });
  const [siteSettings, setSiteSettings] = useState({
    address: { te: '', en: '' },
    contact: { te: '', en: '' },
    phone: '',
    email: ''
  });
  const [newRegion, setNewRegion] = useState({ title: { te: '', en: '' } });
  const [newDistrict, setNewDistrict] = useState({ title: { te: '', en: '' }, apRegion: '' });
  const [newOtherCategory, setNewOtherCategory] = useState({ title: { te: '', en: '' }, slug: '' });

  const authHeaders = useMemo(() => ({ auth: true }), []);

  const resetForm = () => {
    setEditingId(null);
    setForm({
      title: { te: '', en: '' },
      content: { te: '', en: '' },
      summary: { te: '', en: '' },
      publishedAt: date,
      categoryType: 'home',
      category: '',
      apRegion: '',
      district: '',
      partitionCode: '',
      districtCode: '',
      isBreaking: false,
      isFeatured: false,
      priority: 0,
      images: []
    });
  };

  const loadMeta = () => {
    api.get('/categories?type=other').then(setOtherCategories).catch(() => setOtherCategories([]));
    api.get('/ap-regions').then(setRegions).catch(() => setRegions([]));
    api.get('/districts').then(setDistricts).catch(() => setDistricts([]));
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
    api
      .get('/menu-settings')
      .then((data) => {
        const items = (data.headerItems || []).map((item) => ({
          id: item.key,
          label: `${item.title?.te || ''} (${item.title?.en || ''})`,
          order: item.order,
          raw: item
        }));
        setHeaderItems(items);
      })
      .catch(() => setHeaderItems([]));
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
    const payload = { ...form, publishedAt: date };
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
      publishedAt: article.publishedAt,
      categoryType: article.categoryType,
      category: article.category?._id || '',
      apRegion: article.apRegion?._id || '',
      district: article.district?._id || '',
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

  const handleMenuSave = async () => {
    const headerItemsPayload = headerItems.map((item, index) => ({
      ...item.raw,
      order: index
    }));
    await api.put('/menu-settings', { headerItems: headerItemsPayload }, authHeaders);
    setMessage('Header order saved. (హెడర్ ఆర్డర్ సేవ్ అయింది.)');
  };

  const handleRegionOrderSave = async () => {
    await api.put(
      '/ap-regions/reorder',
      { order: regions.map((region, index) => ({ id: region._id, order: index })) },
      authHeaders
    );
    setMessage('AP region order saved. (AP ప్రాంతాల ఆర్డర్ సేవ్ అయింది.)');
  };

  const handleDistrictOrderSave = async () => {
    await api.put(
      '/districts/reorder',
      { order: districts.map((district, index) => ({ id: district._id, order: index })) },
      authHeaders
    );
    setMessage('District order saved. (జిల్లాల ఆర్డర్ సేవ్ అయింది.)');
  };

  const handleOtherCategoryOrderSave = async () => {
    await api.put(
      '/categories/reorder',
      { order: otherCategories.map((cat, index) => ({ id: cat._id, order: index })) },
      authHeaders
    );
    setMessage('Other category order saved. (ఇతర కేటగిరీలు ఆర్డర్ సేవ్ అయింది.)');
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

  const handleAddRegion = async () => {
    if (!newRegion.title.te || !newRegion.title.en) {
      setMessage('Enter Telugu and English names. (తెలుగు మరియు English పేర్లు ఇవ్వండి.)');
      return;
    }
    await api.post('/ap-regions', newRegion, authHeaders);
    setNewRegion({ title: { te: '', en: '' } });
    loadMeta();
    setMessage('AP region added. (కొత్త AP ప్రాంతం సేవ్ అయింది.)');
  };

  const handleAddDistrict = async () => {
    if (!newDistrict.apRegion) {
      setMessage('Choose AP region. (AP ప్రాంతం ఎంచుకోండి.)');
      return;
    }
    if (!newDistrict.title.te || !newDistrict.title.en) {
      setMessage('Enter Telugu and English names. (తెలుగు మరియు English పేర్లు ఇవ్వండి.)');
      return;
    }
    await api.post('/districts', newDistrict, authHeaders);
    setNewDistrict({ title: { te: '', en: '' }, apRegion: '' });
    loadMeta();
    setMessage('District added. (కొత్త జిల్లా సేవ్ అయింది.)');
  };

  const handleAddOtherCategory = async () => {
    if (!newOtherCategory.title.te || !newOtherCategory.title.en) {
      setMessage('Enter Telugu and English names. (తెలుగు మరియు English పేర్లు ఇవ్వండి.)');
      return;
    }
    const slugValue =
      newOtherCategory.slug ||
      (newOtherCategory.title.en || '')
        .toLowerCase()
        .replace(/[^a-z0-9\\s-]/g, '')
        .trim()
        .replace(/\\s+/g, '-');
    await api.post(
      '/categories',
      { ...newOtherCategory, type: 'other', slug: slugValue },
      authHeaders
    );
    setNewOtherCategory({ title: { te: '', en: '' }, slug: '' });
    loadMeta();
    setMessage('Other category added. (కొత్త ఇతర కేటగిరీ సేవ్ అయింది.)');
  };

  return (
    <main className="page admin-page">
      <h1>Admin Panel (అడ్మిన్ ప్యానల్)</h1>
      {message ? <div className="notice">{message}</div> : null}

      <section className="admin-section">
        <h2>1. Add / Edit News (వార్తలు జోడించండి / మార్చండి)</h2>
        <div className="preview-toggle">
          <span>Preview (ప్రివ్యూ)</span>
          <button type="button" onClick={() => setPreviewLang('en')} className={previewLang === 'en' ? 'active' : ''}>
            English
          </button>
          <button type="button" onClick={() => setPreviewLang('te')} className={previewLang === 'te' ? 'active' : ''}>
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
              onChange={(e) => setForm((prev) => ({ ...prev, categoryType: e.target.value }))}
            >
              {categoryTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          {form.categoryType === 'other' ? (
            <label>
              Other Category (ఇతర కేటగిరీ)
              <select
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
              >
                <option value="">Select (ఎంపిక చేయండి)</option>
                {otherCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.title?.te} ({cat.title?.en})
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {form.categoryType === 'ap' ? (
            <>
              <label>
                Select Partition (AP ప్రాంతం)
                <select
                  value={form.partitionCode}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      partitionCode: e.target.value,
                      districtCode: ''
                    }))
                  }
                >
                  <option value="">Select (ఎంపిక చేయండి)</option>
                  {partitions.map((partition) => (
                    <option key={partition.code} value={partition.code}>
                      {partition.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Select District (జిల్లా)
                <select
                  value={form.districtCode}
                  onChange={(e) => setForm((prev) => ({ ...prev, districtCode: e.target.value }))}
                  disabled={!form.partitionCode}
                >
                  <option value="">Select (ఎంపిక చేయండి)</option>
                  {(districtsByPartition[form.partitionCode] || []).map((district) => (
                    <option key={district.code} value={district.code}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </label>
            </>
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

      <section className="admin-section">
        <h2>2. Manage Structure (నిర్మాణం నిర్వహణ)</h2>
        <div className="admin-subsection">
          <h3>Header Order (హెడర్ మెనూ ఆర్డర్)</h3>
          <SortableList items={headerItems} onChange={setHeaderItems} />
          <button type="button" onClick={handleMenuSave}>
            Save (సేవ్ చేయండి)
          </button>
        </div>
        <div className="admin-subsection">
          <h3>AP Region Order (AP ప్రాంతాల క్రమం)</h3>
          <div className="simple-form">
            <BilingualInput
              label="New AP Region (కొత్త AP ప్రాంతం)"
              value={newRegion.title}
              onChange={(next) => setNewRegion((prev) => ({ ...prev, title: next }))}
            />
            <button type="button" onClick={handleAddRegion}>
              Add (జోడించండి)
            </button>
          </div>
          <SortableList
            items={regions.map((region) => ({
              id: region._id,
              label: `${region.title?.te} (${region.title?.en})`,
              order: region.order
            }))}
            onChange={(next) => {
              const ids = next.map((item) => item.id);
              setRegions((prev) => prev.slice().sort((a, b) => ids.indexOf(a._id) - ids.indexOf(b._id)));
            }}
          />
          <button type="button" onClick={handleRegionOrderSave}>
            Save (సేవ్ చేయండి)
          </button>
        </div>
        <div className="admin-subsection">
          <h3>District Order (జిల్లాల క్రమం)</h3>
          <div className="simple-form">
            <label>
              AP Region (AP ప్రాంతం)
              <select
                value={newDistrict.apRegion}
                onChange={(e) => setNewDistrict((prev) => ({ ...prev, apRegion: e.target.value }))}
              >
                <option value="">Select (ఎంపిక చేయండి)</option>
                {regions.map((region) => (
                  <option key={region._id} value={region._id}>
                    {region.title?.te} ({region.title?.en})
                  </option>
                ))}
              </select>
            </label>
            <BilingualInput
              label="New District (కొత్త జిల్లా)"
              value={newDistrict.title}
              onChange={(next) => setNewDistrict((prev) => ({ ...prev, title: next }))}
            />
            <button type="button" onClick={handleAddDistrict}>
              Add (జోడించండి)
            </button>
          </div>
          <SortableList
            items={districts.map((district) => ({
              id: district._id,
              label: `${district.title?.te} (${district.title?.en})`,
              order: district.order
            }))}
            onChange={(next) => {
              const ids = next.map((item) => item.id);
              setDistricts((prev) => prev.slice().sort((a, b) => ids.indexOf(a._id) - ids.indexOf(b._id)));
            }}
          />
          <button type="button" onClick={handleDistrictOrderSave}>
            Save (సేవ్ చేయండి)
          </button>
        </div>
        <div className="admin-subsection">
          <h3>Other Category Order (ఇతర కేటగిరీలు క్రమం)</h3>
          <div className="simple-form">
            <BilingualInput
              label="New Other Category (కొత్త ఇతర కేటగిరీ)"
              value={newOtherCategory.title}
              onChange={(next) => setNewOtherCategory((prev) => ({ ...prev, title: next }))}
            />
            <label>
              Slug (URL పేరు)
              <input
                value={newOtherCategory.slug}
                onChange={(e) => setNewOtherCategory((prev) => ({ ...prev, slug: e.target.value }))}
              />
            </label>
            <button type="button" onClick={handleAddOtherCategory}>
              Add (జోడించండి)
            </button>
          </div>
          <SortableList
            items={otherCategories.map((cat) => ({
              id: cat._id,
              label: `${cat.title?.te} (${cat.title?.en})`,
              order: cat.order
            }))}
            onChange={(next) => {
              const ids = next.map((item) => item.id);
              setOtherCategories((prev) => prev.slice().sort((a, b) => ids.indexOf(a._id) - ids.indexOf(b._id)));
            }}
          />
          <button type="button" onClick={handleOtherCategoryOrderSave}>
            Save (సేవ్ చేయండి)
          </button>
        </div>
      </section>

      <section className="admin-section">
        <h2>3. Manage E-Paper (ఇ-పేపర్ నిర్వహణ)</h2>
        <div className="admin-form">
          <label>
            Date (తేదీ)
            <input type="date" value={epaperDate} onChange={(e) => setEpaperDate(e.target.value)} />
          </label>
          <label>
            Telugu PDF (తెలుగు PDF)
            <input type="file" accept="application/pdf" onChange={(e) => handleEpaperUpload('teluguPdfUrl', e.target.files?.[0])} />
          </label>
          <label>
            English PDF (Optional) (ఆంగ్ల PDF ఐచ్ఛికం)
            <input type="file" accept="application/pdf" onChange={(e) => handleEpaperUpload('englishPdfUrl', e.target.files?.[0])} />
          </label>
          <button type="button" onClick={handleEpaperSave}>
            Save (సేవ్ చేయండి)
          </button>
        </div>
      </section>

      <section className="admin-section">
        <h2>4. Footer Details (ఫుటర్ వివరాలు)</h2>
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
    </main>
  );
};

export default AdminDashboard;
