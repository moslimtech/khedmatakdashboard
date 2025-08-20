// رابط الـ Web App (ضع رابطك هنا بعد نشر الـ Apps Script)
const API_URL = 'https://script.google.com/macros/s/AKfycbx-fMI2hsJ5LvKKh9fzd3Vidn2TeGtEbHV9Nyj2nZBy9xQk9Uy_uL-m3hrDqp1uUWAPwA/exec';

let currentTab = 'places';
let uploadedImages = [];
let uploadedVideos = [];

// init
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  setupEventListeners();
  loadPlacesForAds();
  setupCityAreaMapping();
  setupAuthUI();
});

// initialization
function initializeApp() {
  const today = new Date().toISOString().split('T')[0];
  const startInput = document.querySelector('input[name="startDate"]');
  const endInput = document.querySelector('input[name="endDate"]');
  if (startInput) startInput.value = today;
  const nextWeek = new Date(); nextWeek.setDate(nextWeek.getDate() + 7);
  if (endInput) endInput.value = nextWeek.toISOString().split('T')[0];
}

function setupEventListeners() {
  const placeForm = document.getElementById('placeForm');
  const adForm = document.getElementById('adForm');
  const citySelect = document.querySelector('select[name="city"]');
  if (placeForm) placeForm.addEventListener('submit', handlePlaceSubmit);
  if (adForm) adForm.addEventListener('submit', handleAdSubmit);
  if (citySelect) citySelect.addEventListener('change', updateAreas);
}

// city/area mapping
function setupCityAreaMapping() {
  const cityAreaMap = {
    '1': [{ id: '1', name: 'مدينة نصر' }, { id: '2', name: 'المعادي' }],
    '2': [{ id: '3', name: 'الهرم' }, { id: '4', name: 'الدقي' }],
  };
  window.cityAreaMap = cityAreaMap;
}

function updateAreas() {
  const citySelect = document.querySelector('select[name="city"]');
  const areaSelect = document.querySelector('select[name="area"]');
  if (!citySelect || !areaSelect) return;
  areaSelect.innerHTML = '<option value="">اختر المنطقة</option>';
  const selected = citySelect.value;
  if (selected && window.cityAreaMap[selected]) {
    window.cityAreaMap[selected].forEach(a => {
      const opt = document.createElement('option'); opt.value = a.id; opt.textContent = a.name; areaSelect.appendChild(opt);
    });
  }
}

// tabs
function showTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  const target = document.getElementById(tabName + '-tab');
  if (target) target.style.display = 'block';
  if (typeof event !== 'undefined' && event && event.target) event.target.classList.add('active');
  currentTab = tabName;
}

// previews
function previewImage(input, previewId) {
  const preview = document.getElementById(previewId);
  if (!preview) return;
  preview.innerHTML = '';
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = e => {
      const img = document.createElement('img'); img.src = e.target.result; img.style.borderRadius = '8px';
      preview.appendChild(img); uploadedImages = [file];
    };
    reader.readAsDataURL(file);
  }
}

function previewMultipleImages(input, previewId) {
  const preview = document.getElementById(previewId);
  if (!preview) return;
  preview.innerHTML = ''; uploadedImages = [];
  if (input.files) {
    Array.from(input.files).forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = e => {
        const div = document.createElement('div'); div.className = 'preview-image';
        const img = document.createElement('img'); img.src = e.target.result;
        const removeBtn = document.createElement('button'); removeBtn.className = 'remove-image'; removeBtn.innerHTML = '×';
        removeBtn.onclick = () => { div.remove(); uploadedImages = uploadedImages.filter((f, i) => i !== idx); };
        div.appendChild(img); div.appendChild(removeBtn); preview.appendChild(div);
        uploadedImages.push(file);
      };
      reader.readAsDataURL(file);
    });
  }
}

function previewVideo(input, previewId) {
  const preview = document.getElementById(previewId);
  if (!preview) return;
  preview.innerHTML = ''; uploadedVideos = [];
  if (input.files && input.files[0]) {
    const file = input.files[0]; const reader = new FileReader();
    reader.onload = e => { const video = document.createElement('video'); video.src = e.target.result; video.controls = true; video.style.width = '100%'; preview.appendChild(video); uploadedVideos = [file]; };
    reader.readAsDataURL(file);
  }
}

// load places for ad select (GET ?action=places)
function loadPlacesForAds() {
  const placeSelect = document.querySelector('select[name="placeId"]');
  if (!placeSelect) return;
  placeSelect.innerHTML = '<option value="">اختر المكان</option>';
  if (API_URL && API_URL.startsWith('http')) {
    fetch(`${API_URL}?action=places`)
      .then(r => r.json())
      .then(data => {
        const places = data.places || (data.data && data.data.places) || [];
        if (data && data.success && Array.isArray(places)) {
          places.forEach(p => { const opt = document.createElement('option'); opt.value = p.id; opt.textContent = p.name; placeSelect.appendChild(opt); });
        }
      })
      .catch(() => { /* fallback omitted */ });
  }
}

// handle place submit (register or update)
async function handlePlaceSubmit(ev) {
  ev.preventDefault(); showLoading(true);
  try {
    const formData = new FormData(ev.target);
    const placeData = {
      placeName: formData.get('placeName'),
      activityType: formData.get('activityType'),
      city: formData.get('city'),
      area: formData.get('area'),
      location: formData.get('location'),
      detailedAddress: formData.get('detailedAddress'),
      mapLink: formData.get('mapLink'),
      phone: formData.get('phone'),
      whatsappLink: formData.get('whatsappLink'),
      email: formData.get('email'),
      website: formData.get('website'),
      workingHours: formData.get('workingHours'),
      delivery: formData.get('delivery'),
      package: formData.get('package'),
      description: formData.get('description'),
      password: formData.get('password'),
      status: formData.get('status'),
      image: uploadedImages[0] || null
    };
    if (!validateFiles()) { showLoading(false); return; }
    let imageUrl = '';
    if (placeData.image) imageUrl = await uploadToGoogleDrive(placeData.image, 'places');
    await savePlaceToSheet(placeData, imageUrl);
    showSuccess('تم حفظ المكان بنجاح!');
    ev.target.reset();
    const preview = document.getElementById('placeImagePreview'); if (preview) preview.innerHTML = '';
    uploadedImages = [];
    // reload places select to reflect any new/updated place
    loadPlacesForAds();
  } catch (err) {
    console.error(err); showError(err.message || 'حدث خطأ أثناء حفظ المكان');
  } finally { showLoading(false); }
}

// handle ad submit
async function handleAdSubmit(ev) {
  ev.preventDefault(); showLoading(true);
  try {
    const formData = new FormData(ev.target);
    const adData = {
      placeId: formData.get('placeId'),
      adType: formData.get('adType'),
      adTitle: formData.get('adTitle'),
      coupon: formData.get('coupon'),
      adDescription: formData.get('adDescription'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      adStatus: formData.get('adStatus'),
      adActiveStatus: formData.get('adActiveStatus'),
      images: uploadedImages,
      video: uploadedVideos[0] || null
    };
    if (!validateFiles()) { showLoading(false); return; }
    const imageUrls = [];
    for (let image of adData.images) imageUrls.push(await uploadToGoogleDrive(image, 'ads'));
    let videoUrl = '';
    if (adData.video) videoUrl = await uploadToGoogleDrive(adData.video, 'ads');
    // ensure placeId: if not provided use logged place
    const logged = getLoggedPlace();
    const placeIdToSend = (adData.placeId && adData.placeId !== '') ? adData.placeId : (logged && logged.id ? logged.id : '');
    await saveAdToSheet(Object.assign({}, adData, { placeId: placeIdToSend }), imageUrls, videoUrl);
    showSuccess('تم حفظ الإعلان بنجاح!');
    ev.target.reset();
    const ip = document.getElementById('adImagesPreview'); if (ip) ip.innerHTML = '';
    const vp = document.getElementById('adVideoPreview'); if (vp) vp.innerHTML = '';
    uploadedImages = []; uploadedVideos = [];
  } catch (err) {
    console.error(err); showError(err.message || 'حدث خطأ أثناء حفظ الإعلان');
  } finally { showLoading(false); }
}

// upload to Drive via Apps Script (send base64 in fileData)
async function uploadToGoogleDrive(file, folder) {
  if (!API_URL || !API_URL.startsWith('http')) return `https://drive.google.com/file/d/${Math.random().toString(36).substr(2, 9)}/view`;
  const base64 = await readFileAsBase64(file);
  const form = new FormData();
  form.append('action', 'uploadFile');
  form.append('folder', folder);
  form.append('fileName', file.name);
  form.append('mimeType', file.type || 'application/octet-stream');
  form.append('fileData', base64);
  const res = await fetch(API_URL, { method: 'POST', body: form });
  const data = await res.json().catch(() => null);
  if (!data || !data.success) throw new Error((data && (data.error || data.message)) || 'فشل رفع الملف');
  const fileUrl = data.fileUrl || (data.data && (data.data.fileUrl || data.data.url)) || (data.data && data.data);
  if (!fileUrl) throw new Error('تعذر استخراج رابط الملف من استجابة الخادم');
  return fileUrl;
}

// save place: create or update depending on logged session
async function savePlaceToSheet(placeData, imageUrl) {
  if (!API_URL || !API_URL.startsWith('http')) return;
  const logged = getLoggedPlace();
  const isUpdate = logged && logged.id;

  const form = new FormData();
  form.append('action', isUpdate ? 'updatePlace' : 'registerPlace');

  if (isUpdate) {
    form.append('placeId', logged.id);
    if (logged.raw && logged.raw._row) form.append('row', logged.raw._row);
  }

  form.append('name', placeData.placeName || '');
  form.append('activity', placeData.activityType || '');
  form.append('city', placeData.city || '');
  form.append('area', placeData.area || '');
  form.append('mall', placeData.location || '');
  form.append('address', placeData.detailedAddress || '');
  form.append('mapLink', placeData.mapLink || '');
  form.append('phone', placeData.phone || '');
  form.append('whatsappLink', placeData.whatsappLink || '');
  form.append('email', placeData.email || '');
  form.append('website', placeData.website || '');
  form.append('hours', placeData.workingHours || '');
  form.append('delivery', placeData.delivery || '');
  form.append('description', placeData.description || '');
  form.append('packageId', placeData.package || '');
  form.append('password', placeData.password || '');
  form.append('logoUrl', imageUrl || '');
  form.append('status', placeData.status || '');

  const res = await fetch(API_URL, { method: 'POST', body: form });
  const data = await res.json().catch(() => null);
  if (!data || !data.success) throw new Error((data && (data.error || data.message)) || 'فشل حفظ المكان');

  // Update local session if updatePlace returned place
  if (isUpdate && data.data && data.data.place) {
    setLoggedPlace(data.data.place);
    setLoggedInUI(data.data.place);
  }
}

// save ad
async function saveAdToSheet(adData, imageUrls, videoUrl) {
  if (!API_URL || !API_URL.startsWith('http')) return;
  const form = new FormData();
  form.append('action', 'addAd');
  form.append('placeId', adData.placeId || '');
  form.append('adType', adData.adType || '');
  form.append('adTitle', adData.adTitle || '');
  form.append('adDescription', adData.adDescription || '');
  form.append('startDate', adData.startDate || '');
  form.append('endDate', adData.endDate || '');
  form.append('coupon', adData.coupon || '');
  form.append('imageUrls', JSON.stringify(imageUrls || []));
  form.append('videoUrl', videoUrl || '');
  form.append('adStatus', adData.adStatus || '');
  form.append('adActiveStatus', adData.adActiveStatus || '');
  const res = await fetch(API_URL, { method: 'POST', body: form });
  const data = await res.json().catch(() => null);
  if (!data || !data.success) throw new Error((data && (data.error || data.message)) || 'فشل حفظ الإعلان');
}

// helpers
function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => { const result = reader.result; const base64 = String(result).split(',')[1] || ''; resolve(base64); };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function showSuccess(message) { const el = document.getElementById('successAlert'); if (!el) return; el.textContent = message; el.style.display = 'block'; setTimeout(() => el.style.display = 'none', 5000); }
function showError(message) { const el = document.getElementById('errorAlert'); if (!el) return; el.textContent = message; el.style.display = 'block'; setTimeout(() => el.style.display = 'none', 5000); }
function showLoading(show) { const el = document.getElementById('loading'); if (!el) return; el.style.display = show ? 'block' : 'none'; }

function validateFiles() {
  const maxSize = 10 * 1024 * 1024;
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
  const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov'];
  for (let image of uploadedImages) {
    if (image.size > maxSize) { showError('حجم الصورة أكبر من 10MB'); return false; }
    if (!allowedImageTypes.includes(image.type)) { showError('نوع الصورة غير مدعوم'); return false; }
  }
  if (uploadedVideos.length > 0) {
    const v = uploadedVideos[0];
    if (v.size > maxSize * 5) { showError('حجم الفيديو أكبر من 50MB'); return false; }
    if (!allowedVideoTypes.includes(v.type)) { showError('نوع الفيديو غير مدعوم'); return false; }
  }
  return true;
}

// Authentication UI & logic
function setupAuthUI() {
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const loginModal = document.getElementById('loginModal');
  const loginCancel = document.getElementById('loginCancel');
  const loginForm = document.getElementById('loginForm');
  if (loginBtn) loginBtn.addEventListener('click', () => { if (loginModal) loginModal.style.display = 'flex'; });
  if (loginCancel) loginCancel.addEventListener('click', () => { if (loginModal) loginModal.style.display = 'none'; });
  if (loginModal) loginModal.addEventListener('click', ev => { if (ev.target === loginModal) loginModal.style.display = 'none'; });
  if (loginForm) loginForm.addEventListener('submit', handleLoginSubmit);
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

  const stored = getLoggedPlace();
  if (stored) setLoggedInUI(stored);
}

function getLoggedPlace() {
  try { const raw = localStorage.getItem('khedmatak_place'); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
}
function setLoggedPlace(obj) { try { localStorage.setItem('khedmatak_place', JSON.stringify(obj)); } catch (e) { /* ignore */ } }
function clearLoggedPlace() { localStorage.removeItem('khedmatak_place'); }

function setLoggedInUI(place) {
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const loggedInUser = document.getElementById('loggedInUser');
  if (loginBtn) loginBtn.style.display = 'none';
  if (logoutBtn) logoutBtn.style.display = 'inline-block';
  if (loggedInUser) { loggedInUser.style.display = 'inline-block'; loggedInUser.textContent = (place && place.name) ? place.name : 'صاحب المحل'; }
  const loginModal = document.getElementById('loginModal'); if (loginModal) loginModal.style.display = 'none';
  setLoggedPlace(place);
  tryPrefillPlaceForm(place);
}

function setLoggedOutUI() {
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const loggedInUser = document.getElementById('loggedInUser');
  if (loginBtn) loginBtn.style.display = 'inline-block';
  if (logoutBtn) logoutBtn.style.display = 'none';
  if (loggedInUser) { loggedInUser.style.display = 'none'; loggedInUser.textContent = ''; }
  clearLoggedPlace();
}

function tryPrefillPlaceForm(place) {
  if (!place || !place.raw) return;
  try {
    const raw = place.raw;
    if (raw['اسم المكان']) document.querySelector('input[name="placeName"]').value = raw['اسم المكان'];
    if (raw['العنوان التفصيلي']) document.querySelector('input[name="detailedAddress"]').value = raw['العنوان التفصيلي'];
    if (raw['رابط الموقع على الخريطة']) document.querySelector('input[name="mapLink"]').value = raw['رابط الموقع على الخريطة'];
    if (raw['رقم التواصل']) document.querySelector('input[name="phone"]').value = raw['رقم التواصل'];
    if (raw['البريد الإلكتروني']) document.querySelector('input[name="email"]').value = raw['البريد الإلكتروني'];
    if (raw['وصف مختصر ']) document.querySelector('textarea[name="description"]').value = raw['وصف مختصر '];
  } catch (e) { console.warn('prefill failed', e); }
}

async function handleLoginSubmit(ev) {
  ev.preventDefault(); showLoading(true);
  try {
    const form = ev.target; const fd = new FormData(form); fd.append('action', 'loginPlace');
    const res = await fetch(API_URL, { method: 'POST', body: fd });
    const data = await res.json().catch(() => null);
    if (!data) throw new Error('تعذر قراءة استجابة الخادم');
    if (!data.success) throw new Error(data.error || 'خطأ في الخادم');
    const payload = data.data || {};
    if (payload.place) { setLoggedInUI(payload.place); showSuccess('تم تسجيل الدخول'); return; }
    if (payload.success === false) throw new Error(payload.error || 'فشل الدخول');
    if (payload.error) throw new Error(payload.error);
    throw new Error('استجابة غير متوقعة');
  } catch (err) {
    console.error('Login error', err); showError(err.message || 'خطأ أثناء الدخول');
  } finally { showLoading(false); }
}

function handleLogout() { setLoggedOutUI(); showSuccess('تم تسجيل الخروج'); }

// choose package API
async function choosePackageAPI(packageId) {
  const logged = getLoggedPlace();
  if (!logged || !logged.id) { showError('يجب تسجيل الدخول أولاً'); return; }
  const form = new FormData();
  form.append('action', 'choosePackage');
  form.append('placeId', logged.id);
  form.append('packageId', packageId);
  const res = await fetch(API_URL, { method: 'POST', body: form });
  const data = await res.json().catch(() => null);
  if (!data || !data.success) { showError((data && (data.error || data.message)) || 'فشل تغيير الباقة'); return; }
  showSuccess('تم تغيير الباقة');
  if (data.data && data.data.start && data.data.end) {
    const place = getLoggedPlace();
    if (place && place.raw) {
      place.raw['تاريخ بداية الاشتراك'] = data.data.start;
      place.raw['تاريخ نهاية الاشتراك'] = data.data.end;
      setLoggedPlace(place);
    }
  }
}
