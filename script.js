// // script.js - كامل
// // ضع رابط Web App الصحيح هنا بعد نشر الـ Apps Script
// const API_URL = 'https://script.google.com/macros/s/AKfycbx-fMI2hsJ5LvKKh9fzd3Vidn2TeGtEbHV9Nyj2nZBy9xQk9Uy_uL-m3hrDqp1uUWAPwA/exec';

// let currentTab = 'places';
// let uploadedImages = []; // Files for place/ad upload (max 8 for ads)
// let uploadedVideos = []; // single File for video

// // ------------------ Initialization ------------------
// document.addEventListener('DOMContentLoaded', () => {
//   initializeApp();
//   setupEventListeners();
//   loadLookupsAndPopulate(); // load activities, cities, packages, payments...
//   loadPlacesForAds();       // load places into ad select
//   setupAuthUI();            // setup login/logout UI and auto-fill if session
//   updateAdsTabVisibility();
// });

// // sets default dates etc.
// function initializeApp() {
//   const today = new Date().toISOString().split('T')[0];
//   const startInput = document.querySelector('input[name="startDate"]');
//   const endInput = document.querySelector('input[name="endDate"]');
//   if (startInput) startInput.value = today;
//   const nextWeek = new Date(); nextWeek.setDate(nextWeek.getDate() + 7);
//   if (endInput) endInput.value = nextWeek.toISOString().split('T')[0];
// }

// // ------------------ Event listeners ------------------
// function setupEventListeners() {
//   const placeForm = document.getElementById('placeForm');
//   const adForm = document.getElementById('adForm');
//   const citySelect = document.querySelector('select[name="city"]');
//   if (placeForm) placeForm.addEventListener('submit', handlePlaceSubmit);
//   if (adForm) adForm.addEventListener('submit', handleAdSubmit);
//   if (citySelect) citySelect.addEventListener('change', updateAreas);
// }

// // ------------------ Lookups & UI population ------------------
// async function loadLookupsAndPopulate() {
//   try {
//     const res = await fetch(`${API_URL}?action=getLookups`);
//     const json = await res.json().catch(()=>null);
//     const data = (json && json.success && json.data) ? json.data : null;
//     if (!data) {
//       console.warn('getLookups returned empty');
//       return;
//     }

//     // activities
//     const actSelect = document.querySelector('select[name="activityType"]');
//     if (actSelect) {
//       actSelect.innerHTML = '<option value="">اختر نوع النشاط</option>';
//       (data.activities || []).forEach(a => {
//         const opt = document.createElement('option'); opt.value = a.id; opt.textContent = a.name; actSelect.appendChild(opt);
//       });
//     }

//     // cities
//     const citySelect = document.querySelector('select[name="city"]');
//     if (citySelect) {
//       citySelect.innerHTML = '<option value="">اختر المدينة</option>';
//       (data.cities || []).forEach(c => {
//         const opt = document.createElement('option'); opt.value = c.id; opt.textContent = c.name; citySelect.appendChild(opt);
//       });
//     }

//     // build cityAreaMap
//     const cityAreaMap = {};
//     (data.areas || []).forEach(a => {
//       const cid = a.raw && a.raw['ID المدينة'] ? String(a.raw['ID المدينة']) : '';
//       if (!cityAreaMap[cid]) cityAreaMap[cid] = [];
//       cityAreaMap[cid].push({ id: a.id, name: a.name });
//     });
//     window.cityAreaMap = cityAreaMap;

//     // sites (locations)
//     const siteSelects = document.querySelectorAll('select[name="location"]');
//     siteSelects.forEach(s => {
//       s.innerHTML = '<option value="">اختر الموقع</option>';
//       (data.sites || []).forEach(site => {
//         const opt = document.createElement('option'); opt.value = site.id; opt.textContent = site.name; s.appendChild(opt);
//       });
//     });

//     // packages select and packages grid
//     const pkgSelect = document.querySelector('select[name="package"]');
//     if (pkgSelect) {
//       pkgSelect.innerHTML = '<option value="">اختر الباقة</option>';
//       (data.packages || []).forEach(p => {
//         const opt = document.createElement('option'); opt.value = p.id; opt.textContent = `${p.name} (${p.duration} يوم)`; pkgSelect.appendChild(opt);
//       });
//     }

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

//     // payments - stored for future use
//     window.availablePaymentMethods = (data.payments || []).map(pm => ({ id: pm.raw && pm.raw['معرف الدفع'] ? pm.raw['معرف الدفع'] : pm.id, name: pm.name || pm.raw && pm.raw['طرق الدفع'] || '' }));

//     // If user already logged in, we might need to prefill selects now
//     const stored = getLoggedPlace();
//     if (stored && stored.raw) {
//       // attempt to prefill using latest lookups
//       tryPrefillPlaceForm(stored);
//       // check ad quota as well
//       if (stored.id) checkAdQuotaAndToggle(stored.id);
//     }

//     updateAdsTabVisibility();
//   } catch (err) {
//     console.warn('Failed to load lookups', err);
//   }
// }

// // ------------------ City -> Areas ------------------
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

// // ------------------ Tabs ------------------
// function showTab(tabName) {
//   document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
//   document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
//   const target = document.getElementById(tabName + '-tab');
//   if (target) target.style.display = 'block';
//   const tabEl = document.getElementById('tab-' + tabName);
//   if (tabEl) tabEl.classList.add('active');
//   currentTab = tabName;
// }

// // ------------------ Previews ------------------
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

// // ------------------ Load places into select ------------------
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
//       .catch(err => {
//         console.warn('loadPlacesForAds failed', err);
//         updateAdsTabVisibility();
//       });
//   } else {
//     updateAdsTabVisibility();
//   }
// }

// // ------------------ Place: register/update ------------------
// async function handlePlaceSubmit(ev) {
//   ev.preventDefault();
//   showLoading(true);
//   try {
//     const form = ev.target;
//     const formData = new FormData(form);
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

//     const logged = getLoggedPlace();
//     // upload image first (if any), include placeId if logged so server writes link to sheet
//     let imageUrl = '';
//     if (placeData.image) {
//       const placeIdForUpload = (logged && logged.id) ? logged.id : null;
//       imageUrl = await uploadToGoogleDrive(placeData.image, 'places', placeIdForUpload);
//     }

//     // Save place (will call registerPlace or updatePlace). We send JSON; server supports JSON
//     await savePlaceToSheet(placeData, imageUrl);

//     showSuccess('تم حفظ المكان بنجاح!');
//     // Clear client-uploaded preview buffer; preview will be shown from server data
//     const preview = document.getElementById('placeImagePreview'); if (preview) preview.innerHTML = '';
//     uploadedImages = [];
//     // refresh lists & quota
//     await loadLookupsAndPopulate();
//     loadPlacesForAds();
//     const newLogged = getLoggedPlace();
//     if (newLogged && newLogged.id) checkAdQuotaAndToggle(newLogged.id);
//   } catch (err) {
//     console.error('handlePlaceSubmit error', err);
//     showError(err.message || 'حدث خطأ أثناء حفظ المكان');
//   } finally { showLoading(false); }
// }

// // ------------------ Ad: submit ------------------
// async function handleAdSubmit(ev) {
//   ev.preventDefault();
//   showLoading(true);
//   try {
//     const form = ev.target;
//     const fd = new FormData(form);
//     const adData = {
//       placeId: fd.get('placeId'),
//       adType: fd.get('adType'),
//       adTitle: fd.get('adTitle'),
//       coupon: fd.get('coupon'),
//       adDescription: fd.get('adDescription'),
//       startDate: fd.get('startDate'),
//       endDate: fd.get('endDate'),
//       adStatus: fd.get('adStatus'),
//       adActiveStatus: fd.get('adActiveStatus'),
//       images: uploadedImages,
//       video: uploadedVideos[0] || null
//     };

//     if (!validateFiles()) { showLoading(false); return; }

//     // upload images (up to 8) and gather names/urls
//     const imageUrls = [];
//     for (let i = 0; i < Math.min(adData.images.length, 8); i++) {
//       const file = adData.images[i];
//       const url = await uploadToGoogleDrive(file, 'ads');
//       imageUrls.push({ name: file.name, url });
//     }
//     // video
//     let videoUrl = '';
//     if (adData.video) videoUrl = await uploadToGoogleDrive(adData.video, 'ads');

//     // Ensure placeId
//     const logged = getLoggedPlace();
//     const placeIdToSend = (adData.placeId && adData.placeId !== '') ? adData.placeId : (logged && logged.id ? logged.id : '');
//     // send to server (JSON)
//     await saveAdToSheet(Object.assign({}, adData, { placeId: placeIdToSend }), imageUrls, videoUrl);

//     showSuccess('تم حفظ الإعلان بنجاح!');
//     ev.target.reset();
//     const ip = document.getElementById('adImagesPreview'); if (ip) ip.innerHTML = '';
//     const vp = document.getElementById('adVideoPreview'); if (vp) vp.innerHTML = '';
//     uploadedImages = []; uploadedVideos = [];

//     // re-check quota after adding ad
//     if (placeIdToSend) await checkAdQuotaAndToggle(placeIdToSend);
//   } catch (err) {
//     console.error('handleAdSubmit error', err);
//     showError(err.message || 'حدث خطأ أثناء حفظ الإعلان');
//   } finally { showLoading(false); }
// }

// // ------------------ Upload media helper ------------------
// async function uploadToGoogleDrive(file, folder, placeId = null) {
//   if (!API_URL || !API_URL.startsWith('http')) return `https://drive.google.com/file/d/${Math.random().toString(36).substr(2, 9)}/view`;
//   const base64 = await readFileAsBase64(file);
//   const form = new FormData();
//   form.append('action', 'uploadFile');
//   form.append('folder', folder);
//   form.append('fileName', file.name);
//   form.append('mimeType', file.type || 'application/octet-stream');
//   form.append('fileData', base64);
//   if (placeId) form.append('placeId', placeId);
//   const res = await fetch(API_URL, { method: 'POST', body: form });
//   const data = await res.json().catch(() => null);
//   if (!data || !data.success) throw new Error((data && (data.error || data.message)) || 'فشل رفع الملف');
//   const fileUrl = data.fileUrl || (data.data && (data.data.fileUrl || data.data.url)) || (data.data && data.data);
//   if (!fileUrl) throw new Error('تعذر استخراج رابط الملف من استجابة الخادم');
//   return fileUrl;
// }

// // ------------------ Save place (only non-empty fields) ------------------
// async function savePlaceToSheet(placeData, imageUrl) {
//   if (!API_URL || !API_URL.startsWith('http')) return;
//   const logged = getLoggedPlace();
//   const isUpdate = logged && logged.id;

//   const payload = {};
//   payload.action = isUpdate ? 'updatePlace' : 'registerPlace';
//   if (isUpdate) {
//     payload.placeId = logged.id;
//     if (logged.raw && logged.raw._row) payload.row = logged.raw._row;
//   }

//   // helper: only include non-empty
//   const putIf = (k, v) => { if (v !== undefined && v !== null && String(v).trim() !== '') payload[k] = v; };

//   putIf('name', placeData.placeName);
//   putIf('activity', placeData.activityType);
//   putIf('city', placeData.city);
//   putIf('area', placeData.area);
//   putIf('mall', placeData.location);
//   putIf('address', placeData.detailedAddress);
//   putIf('mapLink', placeData.mapLink);
//   putIf('phone', placeData.phone);
//   putIf('whatsappLink', placeData.whatsappLink);
//   putIf('email', placeData.email);
//   putIf('website', placeData.website);
//   putIf('hours', placeData.workingHours);
//   putIf('delivery', placeData.delivery);
//   putIf('description', placeData.description);
//   putIf('packageId', placeData.package);
//   putIf('password', placeData.password);
//   putIf('logoUrl', imageUrl);
//   putIf('status', placeData.status);

//   const res = await fetch(API_URL, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(payload)
//   });
//   const text = await res.text();
//   const data = (() => { try { return JSON.parse(text); } catch(e){ return null; } })();
//   if (!data || !data.success) {
//     throw new Error((data && (data.error || data.message)) || 'فشل حفظ المكان');
//   }

//   // If server returned place object, set session and prefill
//   if (data.data && data.data.place) {
//     await setLoggedInUI(data.data.place);
//     return;
//   }
//   // If returned id (register), fetch full place
//   if (data.data && data.data.id) {
//     const fetched = await fetchPlace(data.data.id);
//     if (fetched) await setLoggedInUI(fetched);
//   }
// }

// // ------------------ Save ad (send fields) ------------------
// async function saveAdToSheet(adData, imageUrls, videoUrl) {
//   if (!API_URL || !API_URL.startsWith('http')) return;
//   const payload = {
//     action: 'addAd',
//     placeId: adData.placeId || '',
//     adType: adData.adType || '',
//     adTitle: adData.adTitle || '',
//     adDescription: adData.adDescription || '',
//     startDate: adData.startDate || '',
//     endDate: adData.endDate || '',
//     coupon: adData.coupon || '',
//     imageFiles: JSON.stringify((imageUrls || []).map(i=>i.name || '')),
//     imageUrls: JSON.stringify((imageUrls || []).map(i=>i.url || '')),
//     videoFile: adData.video ? (adData.video.name || '') : '',
//     videoUrl: videoUrl || '',
//     adStatus: adData.adStatus || '',
//     adActiveStatus: adData.adActiveStatus || ''
//   };
//   const res = await fetch(API_URL, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(payload)
//   });
//   const text = await res.text();
//   const data = (() => { try { return JSON.parse(text); } catch(e){ return null; } })();
//   if (!data || !data.success) throw new Error((data && (data.error || data.message)) || 'فشل حفظ الإعلان');
// }

// // ------------------ Helpers ------------------
// function readFileAsBase64(file) {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onload = () => { const result = reader.result; const base64 = String(result).split(',')[1] || ''; resolve(base64); };
//     reader.onerror = reject;
//     reader.readAsDataURL(file);
//   });
// }

// function showSuccess(message) { const el = document.getElementById('successAlert'); if (!el) return; el.textContent = message; el.className = 'alert alert-success'; el.style.display = 'block'; setTimeout(()=>el.style.display='none',5000); }
// function showError(message) { const el = document.getElementById('errorAlert'); if (!el) return; el.textContent = message; el.className = 'alert alert-error'; el.style.display = 'block'; setTimeout(()=>el.style.display='none',6000); }
// function showLoading(show) { const el = document.getElementById('loading'); if (!el) return; el.style.display = show ? 'block' : 'none'; }

// function validateFiles() {
//   const maxSize = 10 * 1024 * 1024;
//   const allowedImageTypes = ['image/jpeg','image/png','image/gif'];
//   const allowedVideoTypes = ['video/mp4','video/avi','video/mov'];
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

// // ------------------ Auth & Session ------------------
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
//   if (stored) {
//     // async fill
//     setLoggedInUI(stored);
//   } else {
//     updateAdsTabVisibility();
//   }
// }

// function getLoggedPlace() {
//   try { const raw = localStorage.getItem('khedmatak_place'); return raw ? JSON.parse(raw) : null; } catch(e) { return null; }
// }
// function setLoggedPlace(obj) { try { localStorage.setItem('khedmatak_place', JSON.stringify(obj)); } catch(e) {} }
// function clearLoggedPlace() { localStorage.removeItem('khedmatak_place'); }

// async function setLoggedInUI(place) {
//   const loginBtn = document.getElementById('loginBtn');
//   const logoutBtn = document.getElementById('logoutBtn');
//   const loggedInUser = document.getElementById('loggedInUser');
//   if (loginBtn) loginBtn.style.display = 'none';
//   if (logoutBtn) logoutBtn.style.display = 'inline-block';
//   if (loggedInUser) { loggedInUser.style.display = 'inline-block'; loggedInUser.textContent = (place && place.name) ? place.name : 'صاحب المحل'; }
//   const loginModal = document.getElementById('loginModal'); if (loginModal) loginModal.style.display = 'none';

//   setLoggedPlace(place);

//   // Ensure lookups loaded before prefilling selects
//   await loadLookupsAndPopulate().catch(()=>{});
//   await tryPrefillPlaceForm(place);

//   // show ads tab and set place select
//   const tabAds = document.getElementById('tab-ads');
//   if (tabAds) tabAds.style.display = 'block';
//   const placeSelects = document.querySelectorAll('select[name="placeId"]');
//   placeSelects.forEach(ps => { ps.value = place.id; ps.disabled = true; });

//   updateAdsTabVisibility();

//   // check ad quota
//   if (place.id) checkAdQuotaAndToggle(place.id);
// }

// function setLoggedOutUI() {
//   const loginBtn = document.getElementById('loginBtn');
//   const logoutBtn = document.getElementById('logoutBtn');
//   const loggedInUser = document.getElementById('loggedInUser');
//   if (loginBtn) loginBtn.style.display = 'inline-block';
//   if (logoutBtn) logoutBtn.style.display = 'none';
//   if (loggedInUser) { loggedInUser.style.display = 'none'; loggedInUser.textContent = ''; }
//   clearLoggedPlace();
//   const tabAds = document.getElementById('tab-ads'); if (tabAds) tabAds.style.display = 'none';
//   const placeSelects = document.querySelectorAll('select[name="placeId"]'); placeSelects.forEach(ps => { ps.disabled = false; });
//   updateAdsTabVisibility();
// }

// // Prefill form fields from server place.raw (waits for selects to be ready)
// async function tryPrefillPlaceForm(place) {
//   if (!place || !place.raw) return;
//   try {
//     const raw = place.raw;
//     const setInput = (selector, value) => { const el = document.querySelector(selector); if (el && (value !== undefined && value !== null)) el.value = value; };
//     setInput('input[name="placeName"]', raw['اسم المكان'] || '');
//     setInput('input[name="detailedAddress"]', raw['العنوان التفصيلي'] || '');
//     setInput('input[name="mapLink"]', raw['رابط الموقع على الخريطة'] || '');
//     setInput('input[name="phone"]', raw['رقم التواصل'] || '');
//     setInput('input[name="whatsappLink"]', raw['رابط واتساب'] || '');
//     setInput('input[name="email"]', raw['البريد الإلكتروني'] || '');
//     setInput('input[name="website"]', raw['الموقع الالكتروني'] || '');
//     setInput('input[name="workingHours"]', raw['ساعات العمل'] || '');
//     setInput('textarea[name="description"]', raw['وصف مختصر '] || '');

//     // boolean/selects: try set by value or by text (polling)
//     await setSelectValueWhenReady('select[name="activityType"]', raw['نوع النشاط / الفئة'] || raw['نوع النشاط'] || '');
//     await setSelectValueWhenReady('select[name="city"]', raw['المدينة'] || '');
//     if ((raw['المدينة'] || '') !== '') updateAreas();
//     await setSelectValueWhenReady('select[name="area"]', raw['المنطقة'] || '');
//     await setSelectValueWhenReady('select[name="location"]', raw['الموقع او المول'] || '');
//     await setSelectValueWhenReady('select[name="package"]', raw['الباقة'] || '');
//     await setSelectValueWhenReady('select[name="status"]', raw['حالة التسجيل'] || raw['حالة المكان'] || '');
//     // password
//     setInput('input[name="password"]', raw['كلمة المرور'] || '');

//     // show logo preview if link present
//     const logoUrl = raw['رابط صورة شعار المكان'] || raw['رابط صورةشعار المكان'] || '';
//     if (logoUrl) {
//       const preview = document.getElementById('placeImagePreview');
//       if (preview) {
//         preview.innerHTML = '';
//         const img = document.createElement('img'); img.src = logoUrl;
//         img.style.width = '100%'; img.style.height = '120px'; img.style.objectFit = 'cover'; img.style.borderRadius = '8px';
//         preview.appendChild(img);
//       }
//     }
//   } catch (e) { console.warn('tryPrefillPlaceForm failed', e); }
// }

// // helper: set select value when options ready
// function setSelectByValueOrText(selectEl, val) {
//   if (!selectEl) return false;
//   const str = (val === null || val === undefined) ? '' : String(val).trim();
//   if (str === '') return false;
//   // try value
//   for (let i = 0; i < selectEl.options.length; i++) {
//     const opt = selectEl.options[i];
//     if (String(opt.value) === str) { selectEl.value = opt.value; return true; }
//   }
//   // try exact text
//   for (let i = 0; i < selectEl.options.length; i++) {
//     const opt = selectEl.options[i];
//     if (String(opt.text).trim() === str) { selectEl.value = opt.value; return true; }
//   }
//   // try contains case-insensitive
//   for (let i = 0; i < selectEl.options.length; i++) {
//     const opt = selectEl.options[i];
//     if (String(opt.text).toLowerCase().indexOf(str.toLowerCase()) !== -1) { selectEl.value = opt.value; return true; }
//   }
//   return false;
// }
// function setSelectValueWhenReady(selector, val, retries = 12, interval = 200) {
//   return new Promise(resolve => {
//     if (!selector || val === null || val === undefined || String(val).trim() === '') { resolve(false); return; }
//     let attempts = 0;
//     const trySet = () => {
//       attempts++;
//       const sel = (typeof selector === 'string') ? document.querySelector(selector) : selector;
//       if (sel) {
//         const ok = setSelectByValueOrText(sel, val);
//         if (ok) { resolve(true); return; }
//       }
//       if (attempts >= retries) { resolve(false); return; }
//       setTimeout(trySet, interval);
//     };
//     trySet();
//   });
// }

// // ------------------ Login ------------------
// async function handleLoginSubmit(ev) {
//   ev.preventDefault();
//   showLoading(true);
//   try {
//     const form = ev.target;
//     const phoneOrId = form.querySelector('input[name="phoneOrId"]').value.trim();
//     const password = form.querySelector('input[name="password"]').value || '';
//     if (!phoneOrId || !password) { showError('ادخل رقم/ID وكلمة المرور'); showLoading(false); return; }
//     const payload = { action: 'loginPlace', phoneOrId: phoneOrId, password: password };
//     const res = await fetch(API_URL, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(payload)
//     });
//     const text = await res.text();
//     console.log('Login response raw:', res.status, text);
//     const data = (() => { try { return JSON.parse(text); } catch(e){ return null; } })();
//     if (!data) throw new Error('استجابة الخادم ليست JSON. راجع رابط API أو سجل الخادم.');
//     if (!data.success) throw new Error(data.error || 'خطأ في الخادم');
//     const payloadData = data.data || {};
//     if (payloadData.place) { await setLoggedInUI(payloadData.place); showSuccess('تم تسجيل الدخول'); return; }
//     throw new Error('استجابة غير متوقعة من الخادم عند تسجيل الدخول');
//   } catch (err) {
//     console.error('Login error detailed:', err);
//     showError(err.message || 'خطأ أثناء الدخول');
//   } finally { showLoading(false); }
// }

// function handleLogout() {
//   setLoggedOutUI();
//   showSuccess('تم تسجيل الخروج');
// }

// // ------------------ Packages: choose ------------------
// async function choosePackageAPI(packageId) {
//   const logged = getLoggedPlace();
//   if (!logged || !logged.id) { showError('يجب تسجيل الدخول أولاً'); return; }
//   const form = new FormData();
//   form.append('action', 'choosePackage');
//   form.append('placeId', logged.id);
//   form.append('packageId', packageId);
//   const res = await fetch(API_URL, { method: 'POST', body: form });
//   const data = await res.json().catch(()=>null);
//   if (!data || !data.success) { showError((data && (data.error || data.message)) || 'فشل تغيير الباقة'); return; }
//   showSuccess('تم تغيير الباقة');
//   if (data.data && data.data.start && data.data.end) {
//     const place = getLoggedPlace();
//     if (place && place.raw) {
//       place.raw['تاريخ بداية الاشتراك'] = data.data.start;
//       place.raw['تاريخ نهاية الاشتراك'] = data.data.end;
//       setLoggedPlace(place);
//     }
//     // re-check quota
//     if (place && place.id) checkAdQuotaAndToggle(place.id);
//   }
// }

// // ------------------ Quota & UI toggles ------------------
// async function checkAdQuotaAndToggle(placeId) {
//   try {
//     if (!placeId) { document.getElementById('tab-ads').style.display = 'none'; return; }
//     const res = await fetch(`${API_URL}?action=remainingAds&placeId=${encodeURIComponent(placeId)}`);
//     const text = await res.text();
//     console.log('remainingAds response:', res.status, text);
//     const json = (() => { try { return JSON.parse(text); } catch(e){ return null; } })();
//     if (!json || !json.success) {
//       document.getElementById('tab-ads').style.display = 'block';
//       toggleAdFormAllowed(false, 'تعذر التحقق من الباقة');
//       showAdQuotaMessage('فشل في جلب معلومات الباقة');
//       return;
//     }
//     const info = json.data || {};
//     const remaining = Number(info.remaining || 0);
//     const allowed = Number(info.allowed || 0);
//     const used = Number(info.used || 0);
//     document.getElementById('tab-ads').style.display = 'block';
//     showAdQuotaMessage(`الإعلانات: الكل ${allowed} · المستخدمة ${used} · المتبقي ${remaining}`);
//     toggleAdFormAllowed(remaining > 0, remaining > 0 ? '' : 'استنفدت حصة الإعلانات');
//   } catch (err) {
//     console.error('checkAdQuotaAndToggle failed', err);
//     toggleAdFormAllowed(false, 'خطأ أثناء التحقق من الباقة');
//   }
// }

// function toggleAdFormAllowed(allowed, message) {
//   const adForm = document.getElementById('adForm');
//   if (!adForm) return;
//   const submitBtn = adForm.querySelector('button[type="submit"]');
//   if (submitBtn) {
//     submitBtn.disabled = !allowed;
//     submitBtn.style.opacity = allowed ? '1' : '0.6';
//     submitBtn.title = allowed ? '' : (message || 'غير مسموح');
//   }
//   let adNotice = document.getElementById('adQuotaNotice');
//   if (!adNotice) {
//     const container = document.getElementById('ads-tab');
//     if (container) {
//       adNotice = document.createElement('div'); adNotice.id = 'adQuotaNotice';
//       adNotice.style.background = '#fff3cd'; adNotice.style.color = '#856404'; adNotice.style.padding = '10px'; adNotice.style.borderRadius = '6px';
//       adNotice.style.marginTop = '12px'; container.insertBefore(adNotice, container.firstChild.nextSibling);
//     }
//   }
//   if (adNotice) {
//     adNotice.textContent = message || '';
//     adNotice.style.display = message ? 'block' : 'none';
//   }
// }

// function showAdQuotaMessage(text) {
//   let el = document.getElementById('adQuotaSummary');
//   if (!el) {
//     const container = document.getElementById('ads-tab');
//     if (!container) return;
//     el = document.createElement('p'); el.id = 'adQuotaSummary'; el.style.marginTop = '8px'; el.style.color = '#333';
//     container.insertBefore(el, container.firstChild.nextSibling);
//   }
//   el.textContent = text || '';
// }

// // ------------------ Visibility of Ads tab ------------------
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
//       if (placesTabEl) { placesTabEl.classList.add('active'); showTab('places'); }
//     }
//   }
// }

// // ------------------ Fetch place full object (getDashboard) ------------------
// async function fetchPlace(placeId) {
//   if (!API_URL || !API_URL.startsWith('http')) return null;
//   const payload = { action: 'getDashboard', placeId: placeId };
//   const res = await fetch(API_URL, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(payload)
//   });
//   const text = await res.text();
//   const data = (() => { try { return JSON.parse(text); } catch(e){ return null; } })();
//   if (!data || !data.success) return null;
//   return (data.data && data.data.place) ? data.data.place : null;
// }

// // ------------------ End ------------------

// script.js - كامل (مُحدّث: يعرض الإعلانات للمحل، ويدعم تعديل/حذف)
// ضع رابط Web App الصحيح هنا بعد نشر الـ Apps Script
const API_URL = 'https://script.google.com/macros/s/REPLACE_WITH_YOUR_DEPLOY_ID/exec';

let currentTab = 'places';
let uploadedImages = [];
let uploadedVideos = [];
let editingAdId = null; // when not null, ad form is in "edit" mode

document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  setupEventListeners();
  loadLookupsAndPopulate();
  loadPlacesForAds();
  setupAuthUI();
  updateAdsTabVisibility();
});

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

// ---------- reuse lookups code (same as before) ----------
async function loadLookupsAndPopulate() {
  try {
    const res = await fetch(`${API_URL}?action=getLookups`);
    const json = await res.json().catch(()=>null);
    const data = (json && json.success && json.data) ? json.data : null;
    if (!data) return;
    const actSelect = document.querySelector('select[name="activityType"]');
    if (actSelect) {
      actSelect.innerHTML = '<option value="">اختر نوع النشاط</option>';
      (data.activities || []).forEach(a => { const opt = document.createElement('option'); opt.value = a.id; opt.textContent = a.name; actSelect.appendChild(opt); });
    }
    const citySelect = document.querySelector('select[name="city"]');
    if (citySelect) {
      citySelect.innerHTML = '<option value="">اختر المدينة</option>';
      (data.cities || []).forEach(c => { const opt = document.createElement('option'); opt.value = c.id; opt.textContent = c.name; citySelect.appendChild(opt); });
    }
    const cityAreaMap = {};
    (data.areas || []).forEach(a => { const cid = a.raw && a.raw['ID المدينة'] ? String(a.raw['ID المدينة']) : ''; if (!cityAreaMap[cid]) cityAreaMap[cid] = []; cityAreaMap[cid].push({ id: a.id, name: a.name }); });
    window.cityAreaMap = cityAreaMap;
    const siteSelects = document.querySelectorAll('select[name="location"]');
    siteSelects.forEach(s => { s.innerHTML = '<option value="">اختر الموقع</option>'; (data.sites || []).forEach(site => { const opt = document.createElement('option'); opt.value = site.id; opt.textContent = site.name; s.appendChild(opt); }); });
    const pkgSelect = document.querySelector('select[name="package"]');
    if (pkgSelect) { pkgSelect.innerHTML = '<option value="">اختر الباقة</option>'; (data.packages || []).forEach(p => { const opt = document.createElement('option'); opt.value = p.id; opt.textContent = `${p.name} (${p.duration} يوم)`; pkgSelect.appendChild(opt); }); }
    const pkgGrid = document.getElementById('packagesGrid');
    if (pkgGrid) {
      pkgGrid.innerHTML = '';
      (data.packages || []).forEach(p => {
        const div = document.createElement('div'); div.style.background = '#fff'; div.style.padding = '12px'; div.style.borderRadius = '8px';
        const h = document.createElement('h3'); h.textContent = p.name; const d = document.createElement('p'); d.textContent = `المدة: ${p.duration} يوم`;
        const desc = document.createElement('p'); desc.textContent = p.raw && p.raw['وصف الباقة'] ? p.raw['وصف الباقة'] : '';
        const btn = document.createElement('button'); btn.className = 'btn btn-primary'; btn.textContent = 'اختر الباقة'; btn.onclick = () => choosePackageAPI(p.id);
        div.appendChild(h); div.appendChild(d); if (desc.textContent) div.appendChild(desc); div.appendChild(btn);
        pkgGrid.appendChild(div);
      });
    }
    window.availablePaymentMethods = (data.payments || []).map(pm => ({ id: pm.raw && pm.raw['معرف الدفع'] ? pm.raw['معرف الدفع'] : pm.id, name: pm.name || pm.raw && pm.raw['طرق الدفع'] || '' }));
    const stored = getLoggedPlace();
    if (stored && stored.raw) { tryPrefillPlaceForm(stored); if (stored.id) loadAdsForPlace(stored.id); }
    updateAdsTabVisibility();
  } catch (err) { console.warn('Failed to load lookups', err); }
}

function updateAreas() {
  const citySelect = document.querySelector('select[name="city"]');
  const areaSelect = document.querySelector('select[name="area"]');
  if (!citySelect || !areaSelect) return;
  areaSelect.innerHTML = '<option value="">اختر المنطقة</option>';
  const selected = citySelect.value;
  if (selected && window.cityAreaMap && window.cityAreaMap[selected]) {
    window.cityAreaMap[selected].forEach(a => { const opt = document.createElement('option'); opt.value = a.id; opt.textContent = a.name; areaSelect.appendChild(opt); });
  }
}

// ---------- Previews (same) ----------
function previewImage(input, previewId) { const preview = document.getElementById(previewId); if (!preview) return; preview.innerHTML = ''; if (input.files && input.files[0]) { const file = input.files[0]; const reader = new FileReader(); reader.onload = e => { const img = document.createElement('img'); img.src = e.target.result; img.style.borderRadius = '8px'; preview.appendChild(img); uploadedImages = [file]; }; reader.readAsDataURL(file); } }
function previewMultipleImages(input, previewId) { const preview = document.getElementById(previewId); if (!preview) return; preview.innerHTML = ''; uploadedImages = []; if (!input.files) return; const files = Array.from(input.files).slice(0, 8); if (input.files.length > 8) showError('يمكن تحميل حتى 8 صور كحد أقصى. سيتم أخذ أول 8 صور.'); files.forEach((file, index) => { const reader = new FileReader(); reader.onload = e => { const div = document.createElement('div'); div.className = 'preview-image'; const img = document.createElement('img'); img.src = e.target.result; const removeBtn = document.createElement('button'); removeBtn.className = 'remove-image'; removeBtn.innerHTML = '×'; removeBtn.onclick = () => { div.remove(); uploadedImages = uploadedImages.filter((f, i) => i !== index); }; div.appendChild(img); div.appendChild(removeBtn); preview.appendChild(div); uploadedImages.push(file); }; reader.readAsDataURL(file); }); }
function previewVideo(input, previewId) { const preview = document.getElementById(previewId); if (!preview) return; preview.innerHTML = ''; uploadedVideos = []; if (input.files && input.files[0]) { const file = input.files[0]; const reader = new FileReader(); reader.onload = e => { const video = document.createElement('video'); video.src = e.target.result; video.controls = true; video.style.width = '100%'; preview.appendChild(video); uploadedVideos = [file]; }; reader.readAsDataURL(file); } }

// ---------- Load places for ad select (kept) ----------
function loadPlacesForAds() {
  const placeSelects = document.querySelectorAll('select[name="placeId"]');
  placeSelects.forEach(ps => { ps.innerHTML = '<option value="">اختر المكان</option>'; });
  if (API_URL && API_URL.startsWith('http')) {
    fetch(`${API_URL}?action=places`).then(r => r.json()).then(data => {
      const places = data.places || (data.data && data.data.places) || [];
      places.forEach(p => { placeSelects.forEach(ps => { const opt = document.createElement('option'); opt.value = p.id; opt.textContent = p.name; ps.appendChild(opt); }); });
      const logged = getLoggedPlace();
      if (logged && logged.id) { placeSelects.forEach(ps => { ps.value = logged.id; ps.disabled = true; }); document.getElementById('tab-ads').style.display = 'block'; loadAdsForPlace(logged.id); }
      else { placeSelects.forEach(ps => { ps.disabled = false; }); document.getElementById('tab-ads').style.display = 'none'; }
      updateAdsTabVisibility();
    }).catch(err => { console.warn('loadPlacesForAds failed', err); updateAdsTabVisibility(); });
  } else updateAdsTabVisibility();
}

// ------------------ Place save (kept) ------------------
async function handlePlaceSubmit(ev) {
  ev.preventDefault(); showLoading(true);
  try {
    const form = ev.target; const formData = new FormData(form);
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
    const logged = getLoggedPlace();
    let imageUrl = '';
    if (placeData.image) { const placeIdForUpload = (logged && logged.id) ? logged.id : null; imageUrl = await uploadToGoogleDrive(placeData.image, 'places', placeIdForUpload); }
    await savePlaceToSheet(placeData, imageUrl);
    showSuccess('تم حفظ المكان بنجاح!');
    const preview = document.getElementById('placeImagePreview'); if (preview) preview.innerHTML = '';
    uploadedImages = [];
    await loadLookupsAndPopulate();
    loadPlacesForAds();
    const newLogged = getLoggedPlace(); if (newLogged && newLogged.id) { checkAdQuotaAndToggle(newLogged.id); loadAdsForPlace(newLogged.id); }
  } catch (err) { console.error('handlePlaceSubmit error', err); showError(err.message || 'حدث خطأ أثناء حفظ المكان'); } finally { showLoading(false); }
}

// ------------------ Ad submit (new or update) ------------------
async function handleAdSubmit(ev) {
  ev.preventDefault(); showLoading(true);
  try {
    const form = ev.target; const fd = new FormData(form);
    const adData = {
      placeId: fd.get('placeId'),
      adType: fd.get('adType'),
      adTitle: fd.get('adTitle'),
      coupon: fd.get('coupon'),
      adDescription: fd.get('adDescription'),
      startDate: fd.get('startDate'),
      endDate: fd.get('endDate'),
      adStatus: fd.get('adStatus'),
      adActiveStatus: fd.get('adActiveStatus'),
      images: uploadedImages,
      video: uploadedVideos[0] || null
    };
    if (!validateFiles()) { showLoading(false); return; }
    // upload images
    const imageUrls = [];
    for (let i = 0; i < Math.min(adData.images.length, 8); i++) {
      const file = adData.images[i];
      const url = await uploadToGoogleDrive(file, 'ads');
      imageUrls.push({ name: file.name, url });
    }
    let videoUrl = '';
    if (adData.video) videoUrl = await uploadToGoogleDrive(adData.video, 'ads');

    const logged = getLoggedPlace();
    const placeIdToSend = (adData.placeId && adData.placeId !== '') ? adData.placeId : (logged && logged.id ? logged.id : '');
    if (editingAdId) {
      // update flow
      const payload = {
        action: 'updateAd',
        adId: editingAdId,
        placeId: placeIdToSend,
        adType: adData.adType,
        adTitle: adData.adTitle,
        adDescription: adData.adDescription,
        startDate: adData.startDate,
        endDate: adData.endDate,
        coupon: adData.coupon || '',
        imageFiles: JSON.stringify(imageUrls.map(i=>i.name || '')),
        imageUrls: JSON.stringify(imageUrls.map(i=>i.url || '')),
        videoFile: adData.video ? (adData.video.name || '') : '',
        videoUrl: videoUrl || '',
        adActiveStatus: adData.adActiveStatus || '',
        adStatus: adData.adStatus || ''
      };
      const res = await fetch(API_URL, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      const text = await res.text(); const resp = (()=>{try{return JSON.parse(text)}catch(e){return null}})();
      if (!resp || !resp.success) throw new Error((resp && (resp.error || resp.message)) || 'فشل تحديث الإعلان');
      showSuccess('تم تحديث الإعلان');
      editingAdId = null;
      // reset submit button text
      const submitBtn = document.querySelector('#adForm button[type="submit"]'); if (submitBtn) submitBtn.textContent = 'حفظ الإعلان';
    } else {
      // add new ad
      const payload = {
        action: 'addAd',
        placeId: placeIdToSend,
        adType: adData.adType,
        adTitle: adData.adTitle,
        adDescription: adData.adDescription,
        startDate: adData.startDate,
        endDate: adData.endDate,
        coupon: adData.coupon || '',
        imageFiles: JSON.stringify(imageUrls.map(i=>i.name || '')),
        imageUrls: JSON.stringify(imageUrls.map(i=>i.url || '')),
        videoFile: adData.video ? (adData.video.name || '') : '',
        videoUrl: videoUrl || '',
        adStatus: adData.adStatus || '',
        adActiveStatus: adData.adActiveStatus || ''
      };
      const res = await fetch(API_URL, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      const text = await res.text(); const resp = (()=>{try{return JSON.parse(text)}catch(e){return null}})();
      if (!resp || !resp.success) throw new Error((resp && (resp.error || resp.message)) || 'فشل حفظ الإعلان');
      showSuccess('تم حفظ الإعلان');
    }

    ev.target.reset();
    const ip = document.getElementById('adImagesPreview'); if (ip) ip.innerHTML = '';
    const vp = document.getElementById('adVideoPreview'); if (vp) vp.innerHTML = '';
    uploadedImages = []; uploadedVideos = [];

    if (placeIdToSend) {
      await checkAdQuotaAndToggle(placeIdToSend);
      await loadAdsForPlace(placeIdToSend);
    }
  } catch (err) {
    console.error('handleAdSubmit error', err);
    showError(err.message || 'حدث خطأ أثناء حفظ الإعلان');
  } finally { showLoading(false); }
}

// ---------- Upload helper (kept) ----------
async function uploadToGoogleDrive(file, folder, placeId = null) {
  if (!API_URL || !API_URL.startsWith('http')) return `https://drive.google.com/file/d/${Math.random().toString(36).substr(2, 9)}/view`;
  const base64 = await readFileAsBase64(file);
  const form = new FormData();
  form.append('action', 'uploadFile');
  form.append('folder', folder);
  form.append('fileName', file.name);
  form.append('mimeType', file.type || 'application/octet-stream');
  form.append('fileData', base64);
  if (placeId) form.append('placeId', placeId);
  const res = await fetch(API_URL, { method: 'POST', body: form });
  const data = await res.json().catch(() => null);
  if (!data || !data.success) throw new Error((data && (data.error || data.message)) || 'فشل رفع الملف');
  const fileUrl = data.fileUrl || (data.data && (data.data.fileUrl || data.data.url)) || (data.data && data.data);
  if (!fileUrl) throw new Error('تعذر استخراج رابط الملف من استجابة الخادم');
  return fileUrl;
}

// ---------- Read ad list, render, edit/delete handlers ----------
async function loadAdsForPlace(placeId) {
  try {
    const res = await fetch(`${API_URL}?action=ads&placeId=${encodeURIComponent(placeId)}`);
    const json = await res.json().catch(()=>null);
    const ads = (json && json.success && json.data && json.data.ads) ? json.data.ads : (json && json.success && json.ads) ? json.ads : (json && json.ads) ? json.ads : [];
    renderAdsList(ads);
  } catch (err) {
    console.error('loadAdsForPlace failed', err);
  }
}

function renderAdsList(ads) {
  const container = document.getElementById('adsListContainer');
  if (!container) {
    // create container under ads tab if missing
    const adsTab = document.getElementById('ads-tab');
    if (!adsTab) return;
    const div = document.createElement('div'); div.id = 'adsListContainer'; div.style.marginTop = '12px';
    adsTab.insertBefore(div, adsTab.firstChild);
  }
  const c = document.getElementById('adsListContainer');
  c.innerHTML = '';
  if (!ads || ads.length === 0) {
    c.innerHTML = '<p>لا توجد إعلانات حالياً لهذا المحل.</p>';
    return;
  }
  ads.forEach(ad => {
    const card = document.createElement('div'); card.style.border = '1px solid #e1e5e9'; card.style.padding = '10px'; card.style.borderRadius = '8px'; card.style.marginBottom = '10px'; card.style.background = '#fff';
    const h = document.createElement('h4'); h.textContent = ad.title || '(بدون عنوان)';
    const meta = document.createElement('div'); meta.style.color = '#666'; meta.style.fontSize = '0.9em';
    meta.textContent = `${ad.startDate || ''} — ${ad.endDate || ''} · الحالة: ${ad.status || ''}`;
    const p = document.createElement('p'); p.textContent = ad.description || '';
    card.appendChild(h); card.appendChild(meta); card.appendChild(p);
    // images preview small
    if (ad.images && ad.images.length > 0) {
      const imgs = document.createElement('div'); imgs.style.display = 'flex'; imgs.style.gap = '6px'; imgs.style.marginTop = '8px';
      ad.images.forEach(im => {
        if (im && im.url) {
          const img = document.createElement('img'); img.src = im.url; img.style.width = '80px'; img.style.height = '60px'; img.style.objectFit = 'cover'; img.style.borderRadius = '6px';
          imgs.appendChild(img);
        }
      });
      card.appendChild(imgs);
    }
    // buttons
    const actions = document.createElement('div'); actions.style.display = 'flex'; actions.style.gap = '8px'; actions.style.marginTop = '10px';
    const editBtn = document.createElement('button'); editBtn.className = 'btn btn-secondary'; editBtn.textContent = 'تعديل'; editBtn.onclick = () => { startEditAd(ad); };
    const delBtn = document.createElement('button'); delBtn.className = 'btn btn-secondary'; delBtn.style.background = '#dc3545'; delBtn.style.color = '#fff'; delBtn.textContent = 'حذف'; delBtn.onclick = () => { deleteAdConfirm(ad.id); };
    actions.appendChild(editBtn); actions.appendChild(delBtn);
    card.appendChild(actions);
    c.appendChild(card);
  });
}

function startEditAd(ad) {
  try {
    editingAdId = ad.id || null;
    // fill form fields
    const form = document.getElementById('adForm');
    if (!form) return;
    form.querySelector('select[name="placeId"]').value = ad.placeId || '';
    form.querySelector('select[name="adType"]').value = ad.type || '';
    form.querySelector('input[name="adTitle"]').value = ad.title || '';
    form.querySelector('input[name="coupon"]').value = ad.coupon || '';
    form.querySelector('textarea[name="adDescription"]').value = ad.description || '';
    form.querySelector('input[name="startDate"]').value = ad.startDate || '';
    form.querySelector('input[name="endDate"]').value = ad.endDate || '';
    form.querySelector('select[name="adActiveStatus"]').value = ad.status || '';
    form.querySelector('select[name="adStatus"]').value = ad.status || '';
    // images: we can't programmatically set file inputs; instead show previews and set uploadedImages empty so user may upload replacements
    const ip = document.getElementById('adImagesPreview'); if (ip) { ip.innerHTML = ''; if (ad.images && ad.images.length) { ad.images.forEach(im => { if (im && im.url) { const div = document.createElement('div'); div.className = 'preview-image'; const img = document.createElement('img'); img.src = im.url; img.style.width='100%'; img.style.height='90px'; img.style.objectFit='cover'; div.appendChild(img); ip.appendChild(div); } }); } }
    const vp = document.getElementById('adVideoPreview'); if (vp) { vp.innerHTML = ''; if (ad.videoUrl) { const video = document.createElement('video'); video.src = ad.videoUrl; video.controls = true; video.style.width='100%'; vp.appendChild(video); } }
    // change submit button text
    const submitBtn = document.querySelector('#adForm button[type="submit"]'); if (submitBtn) submitBtn.textContent = 'تحديث الإعلان';
    // switch to ads tab
    showTab('ads');
  } catch (e) { console.error('startEditAd failed', e); }
}

async function deleteAdConfirm(adId) {
  if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟ لا يمكن التراجع.')) return;
  try {
    const payload = { action: 'deleteAd', adId: adId };
    const res = await fetch(API_URL, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    const text = await res.text(); const resp = (()=>{try{return JSON.parse(text)}catch(e){return null}})();
    if (!resp || !resp.success) throw new Error((resp && (resp.error || resp.message)) || 'فشل حذف الإعلان');
    showSuccess('تم حذف الإعلان');
    const logged = getLoggedPlace();
    if (logged && logged.id) { checkAdQuotaAndToggle(logged.id); loadAdsForPlace(logged.id); }
  } catch (err) { console.error('deleteAd error', err); showError(err.message || 'خطأ أثناء حذف الإعلان'); }
}

// ---------- Ad quota & UI helpers (kept) ----------
async function checkAdQuotaAndToggle(placeId) {
  try {
    if (!placeId) { document.getElementById('tab-ads').style.display = 'none'; return; }
    const res = await fetch(`${API_URL}?action=remainingAds&placeId=${encodeURIComponent(placeId)}`);
    const text = await res.text();
    const json = (()=>{try{return JSON.parse(text)}catch(e){return null}})();
    if (!json || !json.success) { document.getElementById('tab-ads').style.display = 'block'; toggleAdFormAllowed(false, 'تعذر التحقق من الباقة'); showAdQuotaMessage('فشل في جلب معلومات الباقة'); return; }
    const info = json.data || {};
    const remaining = Number(info.remaining || 0);
    const allowed = Number(info.allowed || 0);
    const used = Number(info.used || 0);
    document.getElementById('tab-ads').style.display = 'block';
    showAdQuotaMessage(`الإعلانات: الكل ${allowed} · المستخدمة ${used} · المتبقي ${remaining}`);
    toggleAdFormAllowed(remaining > 0, remaining > 0 ? '' : 'استنفدت حصة الإعلانات');
  } catch (err) { console.error('checkAdQuotaAndToggle failed', err); toggleAdFormAllowed(false, 'خطأ أثناء التحقق من الباقة'); }
}

function toggleAdFormAllowed(allowed, message) {
  const adForm = document.getElementById('adForm'); if (!adForm) return;
  const submitBtn = adForm.querySelector('button[type="submit"]'); if (submitBtn) { submitBtn.disabled = !allowed; submitBtn.style.opacity = allowed ? '1' : '0.6'; submitBtn.title = allowed ? '' : (message || 'غير مسموح'); }
  let adNotice = document.getElementById('adQuotaNotice');
  if (!adNotice) {
    const container = document.getElementById('ads-tab');
    if (container) { adNotice = document.createElement('div'); adNotice.id = 'adQuotaNotice'; adNotice.style.background = '#fff3cd'; adNotice.style.color = '#856404'; adNotice.style.padding='10px'; adNotice.style.borderRadius='6px'; adNotice.style.marginTop='12px'; container.insertBefore(adNotice, container.firstChild.nextSibling); }
  }
  if (adNotice) { adNotice.textContent = message || ''; adNotice.style.display = message ? 'block' : 'none'; }
}

function showAdQuotaMessage(text) {
  let el = document.getElementById('adQuotaSummary');
  if (!el) { const container = document.getElementById('ads-tab'); if (!container) return; el = document.createElement('p'); el.id = 'adQuotaSummary'; el.style.marginTop = '8px'; el.style.color = '#333'; container.insertBefore(el, container.firstChild.nextSibling); }
  el.textContent = text || '';
}

// ---------- Authentication UI & prefill (kept) ----------
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

function getLoggedPlace() { try { const raw = localStorage.getItem('khedmatak_place'); return raw ? JSON.parse(raw) : null; } catch(e){ return null; } }
function setLoggedPlace(obj) { try { localStorage.setItem('khedmatak_place', JSON.stringify(obj)); } catch(e){} }
function clearLoggedPlace() { localStorage.removeItem('khedmatak_place'); }

async function setLoggedInUI(place) {
  const loginBtn = document.getElementById('loginBtn'); const logoutBtn = document.getElementById('logoutBtn'); const loggedInUser = document.getElementById('loggedInUser');
  if (loginBtn) loginBtn.style.display = 'none'; if (logoutBtn) logoutBtn.style.display = 'inline-block'; if (loggedInUser) { loggedInUser.style.display = 'inline-block'; loggedInUser.textContent = (place && place.name) ? place.name : 'صاحب المحل'; }
  const loginModal = document.getElementById('loginModal'); if (loginModal) loginModal.style.display = 'none';
  setLoggedPlace(place);
  await loadLookupsAndPopulate().catch(()=>{});
  await tryPrefillPlaceForm(place);
  const tabAds = document.getElementById('tab-ads'); if (tabAds) tabAds.style.display = 'block';
  const placeSelects = document.querySelectorAll('select[name="placeId"]'); placeSelects.forEach(ps => { ps.value = place.id; ps.disabled = true; });
  updateAdsTabVisibility();
  if (place.id) { checkAdQuotaAndToggle(place.id); loadAdsForPlace(place.id); }
}

function setLoggedOutUI() {
  const loginBtn = document.getElementById('loginBtn'); const logoutBtn = document.getElementById('logoutBtn'); const loggedInUser = document.getElementById('loggedInUser');
  if (loginBtn) loginBtn.style.display = 'inline-block'; if (logoutBtn) logoutBtn.style.display = 'none'; if (loggedInUser) { loggedInUser.style.display = 'none'; loggedInUser.textContent = ''; }
  clearLoggedPlace();
  const tabAds = document.getElementById('tab-ads'); if (tabAds) tabAds.style.display = 'none';
  const placeSelects = document.querySelectorAll('select[name="placeId"]'); placeSelects.forEach(ps => { ps.disabled = false; });
  updateAdsTabVisibility();
}

async function tryPrefillPlaceForm(place) {
  if (!place || !place.raw) return;
  try {
    const raw = place.raw;
    const setInput = (selector, value) => { const el = document.querySelector(selector); if (el && (value !== undefined && value !== null)) el.value = value; };
    setInput('input[name="placeName"]', raw['اسم المكان'] || '');
    setInput('input[name="detailedAddress"]', raw['العنوان التفصيلي'] || '');
    setInput('input[name="mapLink"]', raw['رابط الموقع على الخريطة'] || '');
    setInput('input[name="phone"]', raw['رقم التواصل'] || '');
    setInput('input[name="whatsappLink"]', raw['رابط واتساب'] || '');
    setInput('input[name="email"]', raw['البريد الإلكتروني'] || '');
    setInput('input[name="website"]', raw['الموقع الالكتروني'] || '');
    setInput('input[name="workingHours"]', raw['ساعات العمل'] || '');
    setInput('textarea[name="description"]', raw['وصف مختصر '] || '');
    await setSelectValueWhenReady('select[name="activityType"]', raw['نوع النشاط / الفئة'] || '');
    await setSelectValueWhenReady('select[name="city"]', raw['المدينة'] || '');
    if ((raw['المدينة'] || '') !== '') updateAreas();
    await setSelectValueWhenReady('select[name="area"]', raw['المنطقة'] || '');
    await setSelectValueWhenReady('select[name="location"]', raw['الموقع او المول'] || '');
    await setSelectValueWhenReady('select[name="package"]', raw['الباقة'] || '');
    await setSelectValueWhenReady('select[name="status"]', raw['حالة التسجيل'] || raw['حالة المكان'] || '');
    setInput('input[name="password"]', raw['كلمة المرور'] || '');
    const logoUrl = raw['رابط صورة شعار المكان'] || '';
    if (logoUrl) {
      const preview = document.getElementById('placeImagePreview'); if (preview) { preview.innerHTML = ''; const img = document.createElement('img'); img.src = logoUrl; img.style.width='100%'; img.style.height='120px'; img.style.objectFit='cover'; img.style.borderRadius='8px'; preview.appendChild(img); }
    }
  } catch (e) { console.warn('tryPrefillPlaceForm failed', e); }
}

// helper: set select value when ready
function setSelectByValueOrText(selectEl, val) {
  if (!selectEl) return false;
  const str = (val === null || val === undefined) ? '' : String(val).trim();
  if (str === '') return false;
  for (let i = 0; i < selectEl.options.length; i++) { const opt = selectEl.options[i]; if (String(opt.value) === str) { selectEl.value = opt.value; return true; } }
  for (let i = 0; i < selectEl.options.length; i++) { const opt = selectEl.options[i]; if (String(opt.text).trim() === str) { selectEl.value = opt.value; return true; } }
  for (let i = 0; i < selectEl.options.length; i++) { const opt = selectEl.options[i]; if (String(opt.text).toLowerCase().indexOf(str.toLowerCase()) !== -1) { selectEl.value = opt.value; return true; } }
  return false;
}
function setSelectValueWhenReady(selector, val, retries = 12, interval = 200) {
  return new Promise(resolve => {
    if (!selector || val === null || val === undefined || String(val).trim() === '') { resolve(false); return; }
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

// ---------- Simple helpers ----------
function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => { const result = reader.result; const base64 = String(result).split(',')[1] || ''; resolve(base64); };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
function showSuccess(message) { const el = document.getElementById('successAlert'); if (!el) return; el.textContent = message; el.className = 'alert alert-success'; el.style.display = 'block'; setTimeout(()=>el.style.display='none',5000); }
function showError(message) { const el = document.getElementById('errorAlert'); if (!el) return; el.textContent = message; el.className = 'alert alert-error'; el.style.display = 'block'; setTimeout(()=>el.style.display='none',6000); }
function showLoading(show) { const el = document.getElementById('loading'); if (!el) return; el.style.display = show ? 'block' : 'none'; }
function validateFiles() {
  const maxSize = 10 * 1024 * 1024;
  const allowedImageTypes = ['image/jpeg','image/png','image/gif'];
  const allowedVideoTypes = ['video/mp4','video/avi','video/mov'];
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

// ---------- Login (kept) ----------
async function handleLoginSubmit(ev) {
  ev.preventDefault(); showLoading(true);
  try {
    const form = ev.target;
    const phoneOrId = form.querySelector('input[name="phoneOrId"]').value.trim();
    const password = form.querySelector('input[name="password"]').value || '';
    if (!phoneOrId || !password) { showError('ادخل رقم/ID وكلمة المرور'); showLoading(false); return; }
    const payload = { action: 'loginPlace', phoneOrId: phoneOrId, password: password };
    const res = await fetch(API_URL, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    const text = await res.text(); console.log('Login response raw:', res.status, text);
    const data = (()=>{ try { return JSON.parse(text); } catch(e) { return null; } })();
    if (!data) throw new Error('استجابة الخادم ليست JSON. راجع رابط API أو سجل الخادم.');
    if (!data.success) throw new Error(data.error || 'خطأ في الخادم');
    const payloadData = data.data || {};
    if (payloadData.place) { await setLoggedInUI(payloadData.place); showSuccess('تم تسجيل الدخول'); return; }
    throw new Error('استجابة غير متوقعة من الخادم عند تسجيل الدخول');
  } catch (err) { console.error('Login error detailed:', err); showError(err.message || 'خطأ أثناء الدخول'); } finally { showLoading(false); }
}
function handleLogout() { setLoggedOutUI(); showSuccess('تم تسجيل الخروج'); }

// ---------- End of file ----------
