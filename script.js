// // رابط الـ Web App (ضع رابطك هنا بعد نشر الـ Apps Script)
// const API_URL = 'https://script.google.com/macros/s/AKfycbx-fMI2hsJ5LvKKh9fzd3Vidn2TeGtEbHV9Nyj2nZBy9xQk9Uy_uL-m3hrDqp1uUWAPwA/exec';

// let currentTab = 'places';
// let uploadedImages = []; // array of File
// let uploadedVideos = []; // array of File (single)

// // init
// document.addEventListener('DOMContentLoaded', () => {
//   initializeApp();
//   setupEventListeners();
//   loadLookupsAndPopulate();
//   loadPlacesForAds();
//   setupAuthUI();
//   updateAdsTabVisibility();
// });

// // initialization
// function initializeApp() {
//   const today = new Date().toISOString().split('T')[0];
//   const startInput = document.querySelector('input[name="startDate"]');
//   const endInput = document.querySelector('input[name="endDate"]');
//   if (startInput) startInput.value = today;
//   const nextWeek = new Date(); nextWeek.setDate(nextWeek.getDate() + 7);
//   if (endInput) endInput.value = nextWeek.toISOString().split('T')[0];
// }

// function setupEventListeners() {
//   const placeForm = document.getElementById('placeForm');
//   const adForm = document.getElementById('adForm');
//   const citySelect = document.querySelector('select[name="city"]');
//   if (placeForm) placeForm.addEventListener('submit', handlePlaceSubmit);
//   if (adForm) adForm.addEventListener('submit', handleAdSubmit);
//   if (citySelect) citySelect.addEventListener('change', updateAreas);
// }

// // show/hide ads tab based on login
// function updateAdsTabVisibility() {
//   const adsTab = document.getElementById('tab-ads');
//   const logged = getLoggedPlace();
//   if (!adsTab) return;
//   if (logged && logged.id) {
//     adsTab.style.display = 'block';
//   } else {
//     adsTab.style.display = 'none';
//     const activeTab = document.querySelector('.tab.active');
//     if (!activeTab || activeTab.id === 'tab-ads') {
//       const placesTabEl = document.getElementById('tab-places');
//       if (placesTabEl) {
//         placesTabEl.classList.add('active');
//         showTab('places');
//       }
//     }
//   }
// }

// // populate lookups: activities, cities, areas, sites, packages, payment methods
// async function loadLookupsAndPopulate() {
//   try {
//     const res = await fetch(`${API_URL}?action=getLookups`);
//     const json = await res.json().catch(()=>null);
//     const data = (json && json.success && json.data) ? json.data : null;
//     if (!data) return;
//     // activities
//     const actSelect = document.querySelector('select[name="activityType"]');
//     if (actSelect) {
//       actSelect.innerHTML = '<option value="">اختر نوع النشاط</option>';
//       (data.activities || []).forEach(a => {
//         const opt = document.createElement('option'); opt.value = a.id; opt.textContent = a.name; actSelect.appendChild(opt);
//       });
//     }
//     // cities & areas
//     const citySelect = document.querySelector('select[name="city"]');
//     if (citySelect) {
//       citySelect.innerHTML = '<option value="">اختر المدينة</option>';
//       (data.cities || []).forEach(c => {
//         const opt = document.createElement('option'); opt.value = c.id; opt.textContent = c.name; citySelect.appendChild(opt);
//       });
//     }
//     // build cityAreaMap from areas raw (areas sheet should contain ID المدينة)
//     const cityAreaMap = {};
//     (data.areas || []).forEach(a => {
//       const cid = a.raw['ID المدينة'] ? String(a.raw['ID المدينة']) : '';
//       if (!cityAreaMap[cid]) cityAreaMap[cid] = [];
//       cityAreaMap[cid].push({ id: a.id, name: a.name });
//     });
//     window.cityAreaMap = cityAreaMap;
//     // sites
//     const siteSelects = document.querySelectorAll('select[name="location"]');
//     siteSelects.forEach(s => {
//       s.innerHTML = '<option value="">اختر الموقع</option>';
//       (data.sites || []).forEach(site => {
//         const opt = document.createElement('option'); opt.value = site.id; opt.textContent = site.name; s.appendChild(opt);
//       });
//     });
//     // packages select
//     const pkgSelect = document.querySelector('select[name="package"]');
//     if (pkgSelect) {
//       pkgSelect.innerHTML = '<option value="">اختر الباقة</option>';
//       (data.packages || []).forEach(p => {
//         const opt = document.createElement('option'); opt.value = p.id; opt.textContent = `${p.name} (${p.duration} يوم)`; pkgSelect.appendChild(opt);
//       });
//     }
//     // packages grid (dynamic)
//     const pkgGrid = document.getElementById('packagesGrid');
//     if (pkgGrid) {
//       pkgGrid.innerHTML = '';
//       (data.packages || []).forEach(p => {
//         const div = document.createElement('div'); div.style.background = '#fff'; div.style.padding = '12px'; div.style.borderRadius = '8px';
//         const h = document.createElement('h3'); h.textContent = p.name;
//         const d = document.createElement('p'); d.textContent = `المدة: ${p.duration} يوم`;
//         const desc = document.createElement('p'); desc.textContent = p.raw && p.raw['وصف الباقة'] ? p.raw['وصف الباقة'] : '';
//         const btn = document.createElement('button'); btn.className = 'btn btn-primary'; btn.textContent = 'اختر الباقة';
//         btn.onclick = () => choosePackageAPI(p.id);
//         div.appendChild(h); div.appendChild(d); if (desc.textContent) div.appendChild(desc); div.appendChild(btn);
//         pkgGrid.appendChild(div);
//       });
//     }
//     // payments
//     window.availablePaymentMethods = (data.payments || []).map(pm => ({ id: pm.id || pm.raw['معرف الدفع'], name: pm.name || pm.raw['طرق الدفع'] || '' }));
//     // update ads tab visibility (in case login status)
//     updateAdsTabVisibility();
//   } catch (err) {
//     console.warn('Failed to load lookups', err);
//   }
// }

// // city areas update
// function updateAreas() {
//   const citySelect = document.querySelector('select[name="city"]');
//   const areaSelect = document.querySelector('select[name="area"]');
//   if (!citySelect || !areaSelect) return;
//   areaSelect.innerHTML = '<option value="">اختر المنطقة</option>';
//   const selected = citySelect.value;
//   if (selected && window.cityAreaMap && window.cityAreaMap[selected]) {
//     window.cityAreaMap[selected].forEach(a => {
//       const opt = document.createElement('option'); opt.value = a.id; opt.textContent = a.name; areaSelect.appendChild(opt);
//     });
//   }
// }

// // tabs
// function showTab(tabName) {
//   document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
//   document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
//   const target = document.getElementById(tabName + '-tab');
//   if (target) target.style.display = 'block';
//   const tabEl = document.getElementById('tab-' + tabName);
//   if (tabEl) tabEl.classList.add('active');
//   currentTab = tabName;
// }

// // previews (max 8)
// function previewImage(input, previewId) {
//   const preview = document.getElementById(previewId);
//   if (!preview) return;
//   preview.innerHTML = '';
//   if (input.files && input.files[0]) {
//     const file = input.files[0];
//     const reader = new FileReader();
//     reader.onload = e => {
//       const img = document.createElement('img'); img.src = e.target.result; img.style.borderRadius = '8px';
//       preview.appendChild(img); uploadedImages = [file];
//     };
//     reader.readAsDataURL(file);
//   }
// }

// function previewMultipleImages(input, previewId) {
//   const preview = document.getElementById(previewId);
//   if (!preview) return;
//   preview.innerHTML = ''; uploadedImages = [];
//   if (!input.files) return;
//   const files = Array.from(input.files).slice(0, 8); // limit to 8
//   if (input.files.length > 8) showError('يمكن تحميل حتى 8 صور كحد أقصى. سيتم أخذ أول 8 صور.');
//   files.forEach((file, index) => {
//     const reader = new FileReader();
//     reader.onload = e => {
//       const div = document.createElement('div'); div.className = 'preview-image';
//       const img = document.createElement('img'); img.src = e.target.result;
//       const removeBtn = document.createElement('button'); removeBtn.className = 'remove-image'; removeBtn.innerHTML = '×';
//       removeBtn.onclick = () => { div.remove(); uploadedImages = uploadedImages.filter((f, i) => i !== index); };
//       div.appendChild(img); div.appendChild(removeBtn); preview.appendChild(div);
//       uploadedImages.push(file);
//     };
//     reader.readAsDataURL(file);
//   });
// }

// function previewVideo(input, previewId) {
//   const preview = document.getElementById(previewId);
//   if (!preview) return;
//   preview.innerHTML = ''; uploadedVideos = [];
//   if (input.files && input.files[0]) {
//     const file = input.files[0]; const reader = new FileReader();
//     reader.onload = e => { const video = document.createElement('video'); video.src = e.target.result; video.controls = true; video.style.width = '100%'; preview.appendChild(video); uploadedVideos = [file]; };
//     reader.readAsDataURL(file);
//   }
// }

// // load places for ad select (GET ?action=places)
// function loadPlacesForAds() {
//   const placeSelects = document.querySelectorAll('select[name="placeId"]');
//   placeSelects.forEach(ps => { ps.innerHTML = '<option value="">اختر المكان</option>'; });
//   if (API_URL && API_URL.startsWith('http')) {
//     fetch(`${API_URL}?action=places`)
//       .then(r => r.json())
//       .then(data => {
//         const places = data.places || (data.data && data.data.places) || [];
//         places.forEach(p => {
//           placeSelects.forEach(ps => {
//             const opt = document.createElement('option'); opt.value = p.id; opt.textContent = p.name; ps.appendChild(opt);
//           });
//         });
//         // if logged in, set ad place to logged place and disable select
//         const logged = getLoggedPlace();
//         if (logged && logged.id) {
//           placeSelects.forEach(ps => { ps.value = logged.id; ps.disabled = true; });
//           document.getElementById('tab-ads').style.display = 'block';
//         } else {
//           placeSelects.forEach(ps => { ps.disabled = false; });
//           document.getElementById('tab-ads').style.display = 'none';
//         }
//         updateAdsTabVisibility();
//       })
//       .catch(() => { updateAdsTabVisibility(); });
//   } else {
//     updateAdsTabVisibility();
//   }
// }

// // handle place submit (register or update)
// async function handlePlaceSubmit(ev) {
//   ev.preventDefault(); showLoading(true);
//   try {
//     const formData = new FormData(ev.target);
//     const placeData = {
//       placeName: formData.get('placeName'),
//       activityType: formData.get('activityType'),
//       city: formData.get('city'),
//       area: formData.get('area'),
//       location: formData.get('location'),
//       detailedAddress: formData.get('detailedAddress'),
//       mapLink: formData.get('mapLink'),
//       phone: formData.get('phone'),
//       whatsappLink: formData.get('whatsappLink'),
//       email: formData.get('email'),
//       website: formData.get('website'),
//       workingHours: formData.get('workingHours'),
//       delivery: formData.get('delivery'),
//       package: formData.get('package'),
//       description: formData.get('description'),
//       password: formData.get('password'),
//       status: formData.get('status'),
//       image: uploadedImages[0] || null
//     };
//     if (!validateFiles()) { showLoading(false); return; }
//     let imageUrl = '';
//     if (placeData.image) imageUrl = await uploadToGoogleDrive(placeData.image, 'places');
//     await savePlaceToSheet(placeData, imageUrl);
//     showSuccess('تم حفظ المكان بنجاح!');
//     ev.target.reset();
//     const preview = document.getElementById('placeImagePreview'); if (preview) preview.innerHTML = '';
//     uploadedImages = [];
//     // refresh lookups & place selects
//     await loadLookupsAndPopulate();
//     loadPlacesForAds();
//   } catch (err) {
//     console.error(err); showError(err.message || 'حدث خطأ أثناء حفظ المكان');
//   } finally { showLoading(false); }
// }

// // handle ad submit
// async function handleAdSubmit(ev) {
//   ev.preventDefault(); showLoading(true);
//   try {
//     const formData = new FormData(ev.target);
//     const adData = {
//       placeId: formData.get('placeId'),
//       adType: formData.get('adType'),
//       adTitle: formData.get('adTitle'),
//       coupon: formData.get('coupon'),
//       adDescription: formData.get('adDescription'),
//       startDate: formData.get('startDate'),
//       endDate: formData.get('endDate'),
//       adStatus: formData.get('adStatus'),
//       adActiveStatus: formData.get('adActiveStatus'),
//       images: uploadedImages,
//       video: uploadedVideos[0] || null
//     };
//     if (!validateFiles()) { showLoading(false); return; }
//     // upload images up to 8
//     const imageUrls = [];
//     for (let i = 0; i < Math.min(adData.images.length, 8); i++) {
//       const url = await uploadToGoogleDrive(adData.images[i], 'ads');
//       imageUrls.push({ name: adData.images[i].name, url });
//     }
//     let videoUrl = '';
//     if (adData.video) videoUrl = await uploadToGoogleDrive(adData.video, 'ads');
//     // ensure placeId: if not provided use logged place
//     const logged = getLoggedPlace();
//     const placeIdToSend = (adData.placeId && adData.placeId !== '') ? adData.placeId : (logged && logged.id ? logged.id : '');
//     await saveAdToSheet(Object.assign({}, adData, { placeId: placeIdToSend }), imageUrls, videoUrl);
//     showSuccess('تم حفظ الإعلان بنجاح!');
//     ev.target.reset();
//     const ip = document.getElementById('adImagesPreview'); if (ip) ip.innerHTML = '';
//     const vp = document.getElementById('adVideoPreview'); if (vp) vp.innerHTML = '';
//     uploadedImages = []; uploadedVideos = [];
//   } catch (err) {
//     console.error(err); showError(err.message || 'حدث خطأ أثناء حفظ الإعلان');
//   } finally { showLoading(false); }
// }

// // upload to Drive via Apps Script (send base64 in fileData)
// async function uploadToGoogleDrive(file, folder) {
//   if (!API_URL || !API_URL.startsWith('http')) return `https://drive.google.com/file/d/${Math.random().toString(36).substr(2, 9)}/view`;
//   const base64 = await readFileAsBase64(file);
//   const form = new FormData();
//   form.append('action', 'uploadFile');
//   form.append('folder', folder);
//   form.append('fileName', file.name);
//   form.append('mimeType', file.type || 'application/octet-stream');
//   form.append('fileData', base64);
//   const res = await fetch(API_URL, { method: 'POST', body: form });
//   const data = await res.json().catch(() => null);
//   if (!data || !data.success) throw new Error((data && (data.error || data.message)) || 'فشل رفع الملف');
//   const fileUrl = data.fileUrl || (data.data && (data.data.fileUrl || data.data.url)) || (data.data && data.data);
//   if (!fileUrl) throw new Error('تعذر استخراج رابط الملف من استجابة الخادم');
//   return fileUrl;
// }

// // save place: create or update depending on logged session
// async function savePlaceToSheet(placeData, imageUrl) {
//   if (!API_URL || !API_URL.startsWith('http')) return;
//   const logged = getLoggedPlace();
//   const isUpdate = logged && logged.id;

//   const form = new FormData();
//   form.append('action', isUpdate ? 'updatePlace' : 'registerPlace');

//   if (isUpdate) {
//     form.append('placeId', logged.id);
//     if (logged.raw && logged.raw._row) form.append('row', logged.raw._row);
//   }

//   form.append('name', placeData.placeName || '');
//   form.append('activity', placeData.activityType || '');
//   form.append('city', placeData.city || '');
//   form.append('area', placeData.area || '');
//   form.append('mall', placeData.location || '');
//   form.append('address', placeData.detailedAddress || '');
//   form.append('mapLink', placeData.mapLink || '');
//   form.append('phone', placeData.phone || '');
//   form.append('whatsappLink', placeData.whatsappLink || '');
//   form.append('email', placeData.email || '');
//   form.append('website', placeData.website || '');
//   form.append('hours', placeData.workingHours || '');
//   form.append('delivery', placeData.delivery || '');
//   form.append('description', placeData.description || '');
//   form.append('packageId', placeData.package || '');
//   form.append('password', placeData.password || '');
//   form.append('logoUrl', imageUrl || '');
//   form.append('status', placeData.status || '');

//   const res = await fetch(API_URL, { method: 'POST', body: form });
//   const data = await res.json().catch(() => null);
//   if (!data || !data.success) throw new Error((data && (data.error || data.message)) || 'فشل حفظ المكان');

//   // Update local session if updatePlace returned place
//   if (isUpdate && data.data && data.data.place) {
//     setLoggedPlace(data.data.place);
//     setLoggedInUI(data.data.place);
//   }
// }

// // save ad (send imageUrls as JSON array of {name,url})
// async function saveAdToSheet(adData, imageUrls, videoUrl) {
//   if (!API_URL || !API_URL.startsWith('http')) return;
//   const form = new FormData();
//   form.append('action', 'addAd');
//   form.append('placeId', adData.placeId || '');
//   form.append('adType', adData.adType || '');
//   form.append('adTitle', adData.adTitle || '');
//   form.append('adDescription', adData.adDescription || '');
//   form.append('startDate', adData.startDate || '');
//   form.append('endDate', adData.endDate || '');
//   form.append('coupon', adData.coupon || '');
//   form.append('imageFiles', JSON.stringify((imageUrls || []).map(i=>i.name || '')));
//   form.append('imageUrls', JSON.stringify((imageUrls || []).map(i=>i.url || '')));
//   form.append('videoFile', adData.video ? (adData.video.name || '') : '');
//   form.append('videoUrl', videoUrl || '');
//   form.append('adStatus', adData.adStatus || '');
//   form.append('adActiveStatus', adData.adActiveStatus || '');
//   const res = await fetch(API_URL, { method: 'POST', body: form });
//   const data = await res.json().catch(() => null);
//   if (!data || !data.success) throw new Error((data && (data.error || data.message)) || 'فشل حفظ الإعلان');
// }

// // helpers
// function readFileAsBase64(file) {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onload = () => { const result = reader.result; const base64 = String(result).split(',')[1] || ''; resolve(base64); };
//     reader.onerror = reject;
//     reader.readAsDataURL(file);
//   });
// }

// function showSuccess(message) { const el = document.getElementById('successAlert'); if (!el) return; el.textContent = message; el.style.display = 'block'; setTimeout(() => el.style.display = 'none', 5000); }
// function showError(message) { const el = document.getElementById('errorAlert'); if (!el) return; el.textContent = message; el.style.display = 'block'; setTimeout(() => el.style.display = 'none', 6000); }
// function showLoading(show) { const el = document.getElementById('loading'); if (!el) return; el.style.display = show ? 'block' : 'none'; }

// function validateFiles() {
//   const maxSize = 10 * 1024 * 1024;
//   const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
//   const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov'];
//   for (let image of uploadedImages) {
//     if (image.size > maxSize) { showError('حجم الصورة أكبر من 10MB'); return false; }
//     if (!allowedImageTypes.includes(image.type)) { showError('نوع الصورة غير مدعوم'); return false; }
//   }
//   if (uploadedVideos.length > 0) {
//     const v = uploadedVideos[0];
//     if (v.size > maxSize * 5) { showError('حجم الفيديو أكبر من 50MB'); return false; }
//     if (!allowedVideoTypes.includes(v.type)) { showError('نوع الفيديو غير مدعوم'); return false; }
//   }
//   return true;
// }

// // Authentication UI & logic
// function setupAuthUI() {
//   const loginBtn = document.getElementById('loginBtn');
//   const logoutBtn = document.getElementById('logoutBtn');
//   const loginModal = document.getElementById('loginModal');
//   const loginCancel = document.getElementById('loginCancel');
//   const loginForm = document.getElementById('loginForm');
//   if (loginBtn) loginBtn.addEventListener('click', () => { if (loginModal) loginModal.style.display = 'flex'; });
//   if (loginCancel) loginCancel.addEventListener('click', () => { if (loginModal) loginModal.style.display = 'none'; });
//   if (loginModal) loginModal.addEventListener('click', ev => { if (ev.target === loginModal) loginModal.style.display = 'none'; });
//   if (loginForm) loginForm.addEventListener('submit', handleLoginSubmit);
//   if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

//   const stored = getLoggedPlace();
//   if (stored) setLoggedInUI(stored);
//   updateAdsTabVisibility();
// }

// function getLoggedPlace() {
//   try { const raw = localStorage.getItem('khedmatak_place'); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
// }
// function setLoggedPlace(obj) { try { localStorage.setItem('khedmatak_place', JSON.stringify(obj)); } catch (e) { /* ignore */ } }
// function clearLoggedPlace() { localStorage.removeItem('khedmatak_place'); }

// function setLoggedInUI(place) {
//   const loginBtn = document.getElementById('loginBtn');
//   const logoutBtn = document.getElementById('logoutBtn');
//   const loggedInUser = document.getElementById('loggedInUser');
//   if (loginBtn) loginBtn.style.display = 'none';
//   if (logoutBtn) logoutBtn.style.display = 'inline-block';
//   if (loggedInUser) { loggedInUser.style.display = 'inline-block'; loggedInUser.textContent = (place && place.name) ? place.name : 'صاحب المحل'; }
//   const loginModal = document.getElementById('loginModal'); if (loginModal) loginModal.style.display = 'none';
//   setLoggedPlace(place);
//   tryPrefillPlaceForm(place);
//   // show ads tab now that user logged in
//   document.getElementById('tab-ads').style.display = 'block';
//   // set ad place selects and disable them
//   const placeSelects = document.querySelectorAll('select[name="placeId"]');
//   placeSelects.forEach(ps => { ps.value = place.id; ps.disabled = true; });
//   updateAdsTabVisibility();
// }

// function setLoggedOutUI() {
//   const loginBtn = document.getElementById('loginBtn');
//   const logoutBtn = document.getElementById('logoutBtn');
//   const loggedInUser = document.getElementById('loggedInUser');
//   if (loginBtn) loginBtn.style.display = 'inline-block';
//   if (logoutBtn) logoutBtn.style.display = 'none';
//   if (loggedInUser) { loggedInUser.style.display = 'none'; loggedInUser.textContent = ''; }
//   clearLoggedPlace();
//   // hide ads tab
//   document.getElementById('tab-ads').style.display = 'none';
//   // enable place selects
//   const placeSelects = document.querySelectorAll('select[name="placeId"]');
//   placeSelects.forEach(ps => { ps.disabled = false; });
//   updateAdsTabVisibility();
// }

// function tryPrefillPlaceForm(place) {
//   if (!place || !place.raw) return;
//   try {
//     const raw = place.raw;
//     if (raw['اسم المكان']) document.querySelector('input[name="placeName"]').value = raw['اسم المكان'];
//     if (raw['العنوان التفصيلي']) document.querySelector('input[name="detailedAddress"]').value = raw['العنوان التفصيلي'];
//     if (raw['رابط الموقع على الخريطة']) document.querySelector('input[name="mapLink"]').value = raw['رابط الموقع على الخريطة'];
//     if (raw['رقم التواصل']) document.querySelector('input[name="phone"]').value = raw['رقم التواصل'];
//     if (raw['البريد الإلكتروني']) document.querySelector('input[name="email"]').value = raw['البريد الإلكتروني'];
//     if (raw['وصف مختصر ']) document.querySelector('textarea[name="description"]').value = raw['وصف مختصر '];
//     if (raw['الباقة']) document.querySelector('select[name="package"]').value = raw['الباقة'];
//     if (raw['حالة التسجيل']) document.querySelector('select[name="status"]').value = raw['حالة التسجيل'];
//   } catch (e) { console.warn('prefill failed', e); }
// }

// async function handleLoginSubmit(ev) {
//   ev.preventDefault(); showLoading(true);
//   try {
//     const form = ev.target; const fd = new FormData(form); fd.append('action', 'loginPlace');
//     const res = await fetch(API_URL, { method: 'POST', body: fd });
//     const data = await res.json().catch(() => null);
//     if (!data) throw new Error('تعذر قراءة استجابة الخادم');
//     if (!data.success) throw new Error(data.error || 'خطأ في الخادم');
//     const payload = data.data || {};
//     if (payload.place) { setLoggedInUI(payload.place); showSuccess('تم تسجيل الدخول'); return; }
//     if (payload.success === false) throw new Error(payload.error || 'فشل الدخول');
//     if (payload.error) throw new Error(payload.error);
//     throw new Error('استجابة غير متوقعة');
//   } catch (err) {
//     console.error('Login error', err); showError(err.message || 'خطأ أثناء الدخول');
//   } finally { showLoading(false); }
// }

// function handleLogout() { setLoggedOutUI(); showSuccess('تم تسجيل الخروج'); }

// // choose package API
// async function choosePackageAPI(packageId) {
//   const logged = getLoggedPlace();
//   if (!logged || !logged.id) { showError('يجب تسجيل الدخول أولاً'); return; }
//   const form = new FormData();
//   form.append('action', 'choosePackage');
//   form.append('placeId', logged.id);
//   form.append('packageId', packageId);
//   const res = await fetch(API_URL, { method: 'POST', body: form });
//   const data = await res.json().catch(() => null);
//   if (!data || !data.success) { showError((data && (data.error || data.message)) || 'فشل تغيير الباقة'); return; }
//   showSuccess('تم تغيير الباقة');
//   if (data.data && data.data.start && data.data.end) {
//     const place = getLoggedPlace();
//     if (place && place.raw) {
//       place.raw['تاريخ بداية الاشتراك'] = data.data.start;
//       place.raw['تاريخ نهاية الاشتراك'] = data.data.end;
//       setLoggedPlace(place);
//     }
//   }
// }
// رابط الـ Web App (ضع رابطك هنا بعد نشر الـ Apps Script)
const API_URL = 'https://script.google.com/macros/s/AKfycbx-fMI2hsJ5LvKKh9fzd3Vidn2TeGtEbHV9Nyj2nZBy9xQk9Uy_uL-m3hrDqp1uUWAPwA/exec';

let currentTab = 'places';
let uploadedImages = []; // array of File
let uploadedVideos = []; // array of File (single)

// init
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  setupEventListeners();
  loadLookupsAndPopulate();
  loadPlacesForAds();
  setupAuthUI();
  updateAdsTabVisibility();
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

// show/hide ads tab based on login
function updateAdsTabVisibility() {
  const adsTab = document.getElementById('tab-ads');
  const logged = getLoggedPlace();
  if (!adsTab) return;
  if (logged && logged.id) {
    adsTab.style.display = 'block';
  } else {
    adsTab.style.display = 'none';
    const activeTab = document.querySelector('.tab.active');
    if (!activeTab || activeTab.id === 'tab-ads') {
      const placesTabEl = document.getElementById('tab-places');
      if (placesTabEl) {
        placesTabEl.classList.add('active');
        showTab('places');
      }
    }
  }
}

// ----------------------- helpers to set select values reliably -----------------------
function setSelectByValueOrText(selectEl, val) {
  if (!selectEl) return false;
  const str = (val === null || val === undefined) ? '' : String(val).trim();
  if (str === '') return false;
  // try by value
  for (let i = 0; i < selectEl.options.length; i++) {
    const opt = selectEl.options[i];
    if (String(opt.value) === str) {
      selectEl.value = opt.value;
      return true;
    }
  }
  // try by exact text
  for (let i = 0; i < selectEl.options.length; i++) {
    const opt = selectEl.options[i];
    if (String(opt.text).trim() === str) {
      selectEl.value = opt.value;
      return true;
    }
  }
  // try case-insensitive text contains
  for (let i = 0; i < selectEl.options.length; i++) {
    const opt = selectEl.options[i];
    if (String(opt.text).toLowerCase().indexOf(str.toLowerCase()) !== -1) {
      selectEl.value = opt.value;
      return true;
    }
  }
  return false;
}

function setSelectValueWhenReady(selector, val, retries = 10, interval = 250) {
  return new Promise(resolve => {
    if (!selector || val === null || val === undefined || String(val).trim() === '') {
      resolve(false);
      return;
    }
    let attempts = 0;
    const trySet = () => {
      attempts++;
      const sel = (typeof selector === 'string') ? document.querySelector(selector) : selector;
      if (sel) {
        const ok = setSelectByValueOrText(sel, val);
        if (ok) { resolve(true); return; }
      }
      if (attempts >= retries) { resolve(false); return; }
      setTimeout(trySet, interval);
    };
    trySet();
  });
}
// -------------------------------------------------------------------------------------

// populate lookups: activities, cities, areas, sites, packages, payment methods
async function loadLookupsAndPopulate() {
  try {
    const res = await fetch(`${API_URL}?action=getLookups`);
    const json = await res.json().catch(()=>null);
    const data = (json && json.success && json.data) ? json.data : null;
    if (!data) return;
    // activities
    const actSelect = document.querySelector('select[name="activityType"]');
    if (actSelect) {
      actSelect.innerHTML = '<option value="">اختر نوع النشاط</option>';
      (data.activities || []).forEach(a => {
        const opt = document.createElement('option'); opt.value = a.id; opt.textContent = a.name; actSelect.appendChild(opt);
      });
    }
    // cities & areas
    const citySelect = document.querySelector('select[name="city"]');
    if (citySelect) {
      citySelect.innerHTML = '<option value="">اختر المدينة</option>';
      (data.cities || []).forEach(c => {
        const opt = document.createElement('option'); opt.value = c.id; opt.textContent = c.name; citySelect.appendChild(opt);
      });
    }
    // build cityAreaMap from areas raw (areas sheet should contain ID المدينة)
    const cityAreaMap = {};
    (data.areas || []).forEach(a => {
      const cid = a.raw['ID المدينة'] ? String(a.raw['ID المدينة']) : '';
      if (!cityAreaMap[cid]) cityAreaMap[cid] = [];
      cityAreaMap[cid].push({ id: a.id, name: a.name });
    });
    window.cityAreaMap = cityAreaMap;
    // sites
    const siteSelects = document.querySelectorAll('select[name="location"]');
    siteSelects.forEach(s => {
      s.innerHTML = '<option value="">اختر الموقع</option>';
      (data.sites || []).forEach(site => {
        const opt = document.createElement('option'); opt.value = site.id; opt.textContent = site.name; s.appendChild(opt);
      });
    });
    // packages select
    const pkgSelect = document.querySelector('select[name="package"]');
    if (pkgSelect) {
      pkgSelect.innerHTML = '<option value="">اختر الباقة</option>';
      (data.packages || []).forEach(p => {
        const opt = document.createElement('option'); opt.value = p.id; opt.textContent = `${p.name} (${p.duration} يوم)`; pkgSelect.appendChild(opt);
      });
    }
    // packages grid (dynamic)
    const pkgGrid = document.getElementById('packagesGrid');
    if (pkgGrid) {
      pkgGrid.innerHTML = '';
      (data.packages || []).forEach(p => {
        const div = document.createElement('div'); div.style.background = '#fff'; div.style.padding = '12px'; div.style.borderRadius = '8px';
        const h = document.createElement('h3'); h.textContent = p.name;
        const d = document.createElement('p'); d.textContent = `المدة: ${p.duration} يوم`;
        const desc = document.createElement('p'); desc.textContent = p.raw && p.raw['وصف الباقة'] ? p.raw['وصف الباقة'] : '';
        const btn = document.createElement('button'); btn.className = 'btn btn-primary'; btn.textContent = 'اختر الباقة';
        btn.onclick = () => choosePackageAPI(p.id);
        div.appendChild(h); div.appendChild(d); if (desc.textContent) div.appendChild(desc); div.appendChild(btn);
        pkgGrid.appendChild(div);
      });
    }
    // payments
    window.availablePaymentMethods = (data.payments || []).map(pm => ({ id: pm.id || pm.raw['معرف الدفع'], name: pm.name || pm.raw['طرق الدفع'] || '' }));
    // update ads tab visibility (in case login status)
    updateAdsTabVisibility();
  } catch (err) {
    console.warn('Failed to load lookups', err);
  }
}

// city areas update
function updateAreas() {
  const citySelect = document.querySelector('select[name="city"]');
  const areaSelect = document.querySelector('select[name="area"]');
  if (!citySelect || !areaSelect) return;
  areaSelect.innerHTML = '<option value="">اختر المنطقة</option>';
  const selected = citySelect.value;
  if (selected && window.cityAreaMap && window.cityAreaMap[selected]) {
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
  const tabEl = document.getElementById('tab-' + tabName);
  if (tabEl) tabEl.classList.add('active');
  currentTab = tabName;
}

// previews (max 8)
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
  if (!input.files) return;
  const files = Array.from(input.files).slice(0, 8); // limit to 8
  if (input.files.length > 8) showError('يمكن تحميل حتى 8 صور كحد أقصى. سيتم أخذ أول 8 صور.');
  files.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = e => {
      const div = document.createElement('div'); div.className = 'preview-image';
      const img = document.createElement('img'); img.src = e.target.result;
      const removeBtn = document.createElement('button'); removeBtn.className = 'remove-image'; removeBtn.innerHTML = '×';
      removeBtn.onclick = () => { div.remove(); uploadedImages = uploadedImages.filter((f, i) => i !== index); };
      div.appendChild(img); div.appendChild(removeBtn); preview.appendChild(div);
      uploadedImages.push(file);
    };
    reader.readAsDataURL(file);
  });
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
  const placeSelects = document.querySelectorAll('select[name="placeId"]');
  placeSelects.forEach(ps => { ps.innerHTML = '<option value="">اختر المكان</option>'; });
  if (API_URL && API_URL.startsWith('http')) {
    fetch(`${API_URL}?action=places`)
      .then(r => r.json())
      .then(data => {
        const places = data.places || (data.data && data.data.places) || [];
        places.forEach(p => {
          placeSelects.forEach(ps => {
            const opt = document.createElement('option'); opt.value = p.id; opt.textContent = p.name; ps.appendChild(opt);
          });
        });
        // if logged in, set ad place to logged place and disable select
        const logged = getLoggedPlace();
        if (logged && logged.id) {
          placeSelects.forEach(ps => { ps.value = logged.id; ps.disabled = true; });
          document.getElementById('tab-ads').style.display = 'block';
        } else {
          placeSelects.forEach(ps => { ps.disabled = false; });
          document.getElementById('tab-ads').style.display = 'none';
        }
        updateAdsTabVisibility();
      })
      .catch(() => { updateAdsTabVisibility(); });
  } else {
    updateAdsTabVisibility();
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
    // refresh lookups & place selects
    await loadLookupsAndPopulate();
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
    // upload images up to 8
    const imageUrls = [];
    for (let i = 0; i < Math.min(adData.images.length, 8); i++) {
      const url = await uploadToGoogleDrive(adData.images[i], 'ads');
      imageUrls.push({ name: adData.images[i].name, url });
    }
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
    // update UI and prefill with latest data
    await setLoggedInUI(data.data.place);
  }
}

// save ad (send imageUrls as JSON array of {name,url})
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
  form.append('imageFiles', JSON.stringify((imageUrls || []).map(i=>i.name || '')));
  form.append('imageUrls', JSON.stringify((imageUrls || []).map(i=>i.url || '')));
  form.append('videoFile', adData.video ? (adData.video.name || '') : '');
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
function showError(message) { const el = document.getElementById('errorAlert'); if (!el) return; el.textContent = message; el.style.display = 'block'; setTimeout(() => el.style.display = 'none', 6000); }
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
  updateAdsTabVisibility();
}

function getLoggedPlace() {
  try { const raw = localStorage.getItem('khedmatak_place'); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
}
function setLoggedPlace(obj) { try { localStorage.setItem('khedmatak_place', JSON.stringify(obj)); } catch (e) { /* ignore */ } }
function clearLoggedPlace() { localStorage.removeItem('khedmatak_place'); }

// make setLoggedInUI async so we can ensure lookups loaded before prefill
async function setLoggedInUI(place) {
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const loggedInUser = document.getElementById('loggedInUser');
  if (loginBtn) loginBtn.style.display = 'none';
  if (logoutBtn) logoutBtn.style.display = 'inline-block';
  if (loggedInUser) { loggedInUser.style.display = 'inline-block'; loggedInUser.textContent = (place && place.name) ? place.name : 'صاحب المحل'; }
  const loginModal = document.getElementById('loginModal'); if (loginModal) loginModal.style.display = 'none';
  setLoggedPlace(place);

  // ensure lookups loaded before prefill (try to load if not already)
  await loadLookupsAndPopulate().catch(()=>{ /* ignore errors */ });
  // now attempt to prefill fields, waiting for selects/options to be present
  await tryPrefillPlaceForm(place);

  // show ads tab now that user logged in
  const tabAds = document.getElementById('tab-ads');
  if (tabAds) tabAds.style.display = 'block';
  // set ad place selects and disable them
  const placeSelects = document.querySelectorAll('select[name="placeId"]');
  placeSelects.forEach(ps => { ps.value = place.id; ps.disabled = true; });
  updateAdsTabVisibility();
}

function setLoggedOutUI() {
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const loggedInUser = document.getElementById('loggedInUser');
  if (loginBtn) loginBtn.style.display = 'inline-block';
  if (logoutBtn) logoutBtn.style.display = 'none';
  if (loggedInUser) { loggedInUser.style.display = 'none'; loggedInUser.textContent = ''; }
  clearLoggedPlace();
  // hide ads tab
  const tabAds = document.getElementById('tab-ads');
  if (tabAds) tabAds.style.display = 'none';
  // enable place selects
  const placeSelects = document.querySelectorAll('select[name="placeId"]');
  placeSelects.forEach(ps => { ps.disabled = false; });
  updateAdsTabVisibility();
}

async function tryPrefillPlaceForm(place) {
  if (!place || !place.raw) return;
  try {
    const raw = place.raw;

    // Basic inputs
    const setInput = (selector, value) => {
      const el = document.querySelector(selector);
      if (el && (value !== undefined && value !== null)) el.value = value;
    };
    setInput('input[name="placeName"]', raw['اسم المكان'] || raw['اسم المكان '] || '');
    setInput('input[name="detailedAddress"]', raw['العنوان التفصيلي'] || raw['العنوان'] || '');
    setInput('input[name="mapLink"]', raw['رابط الموقع على الخريطة'] || raw['رابط الخريطة'] || '');
    setInput('input[name="phone"]', raw['رقم التواصل'] || raw['الهاتف'] || '');
    setInput('input[name="whatsappLink"]', raw['رابط واتساب'] || raw['واتساب'] || '');
    setInput('input[name="email"]', raw['البريد الإلكتروني'] || raw['الايميل'] || '');
    setInput('input[name="website"]', raw['الموقع الالكتروني'] || raw['الموقع'] || '');
    setInput('input[name="workingHours"]', raw['ساعات العمل'] || raw['مواعيد العمل'] || '');
    setInput('textarea[name="description"]', raw['وصف مختصر '] || raw['وصف'] || '');
    // password: prefill (if exists) - caution security
    setInput('input[name="password"]', raw['كلمة المرور'] || '');

    // Selects: activity, city, package, location, status, area
    // Attempt to set them by value or by text. Use setSelectValueWhenReady to wait for options to be available.
    const activityVal = raw['نوع النشاط / الفئة'] || raw['activity'] || raw['نوع النشاط'] || '';
    await setSelectValueWhenReady('select[name="activityType"]', activityVal, 12, 200);

    const cityVal = raw['المدينة'] || raw['ID المدينة'] || raw['city'] || '';
    await setSelectValueWhenReady('select[name="city"]', cityVal, 12, 200);
    // once city set, update areas then set area
    if (cityVal) updateAreas();
    const areaVal = raw['المنطقة'] || raw['ID المنطقة'] || raw['area'] || '';
    await setSelectValueWhenReady('select[name="area"]', areaVal, 12, 200);

    const locationVal = raw['الموقع او المول'] || raw['ID الموقع او المول'] || raw['location'] || '';
    await setSelectValueWhenReady('select[name="location"]', locationVal, 12, 200);

    const packageVal = raw['الباقة'] || raw['package'] || '';
    await setSelectValueWhenReady('select[name="package"]', packageVal, 12, 200);

    // Status: might be in column "حالة التسجيل" or "حالة المكان"
    const statusVal = raw['حالة التسجيل'] || raw['حالة المكان'] || raw['status'] || '';
    if (statusVal) {
      await setSelectValueWhenReady('select[name="status"]', statusVal, 8, 200);
    }

    // If there's logo url in sheet, show preview
    const logoUrl = raw['رابط صورة شعار المكان'] || raw['رابط صورةشعار المكان'] || raw['logoUrl'] || raw['رابط صورة شعار'] || '';
    if (logoUrl) {
      const preview = document.getElementById('placeImagePreview');
      if (preview) {
        preview.innerHTML = '';
        const img = document.createElement('img'); img.src = logoUrl;
        img.style.width = '100%'; img.style.height = '120px'; img.style.objectFit = 'cover'; img.style.borderRadius = '8px';
        preview.appendChild(img);
      }
    }
  } catch (e) {
    console.warn('prefillPlace failed', e);
  }
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
    if (payload.place) { await setLoggedInUI(payload.place); showSuccess('تم تسجيل الدخول'); return; }
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
