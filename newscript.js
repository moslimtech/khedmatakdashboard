// متغيرات عامة
const API_URL = 'https://script.google.com/macros/s/AKfycbx-fMI2hsJ5LvKKh9fzd3Vidn2TeGtEbHV9Nyj2nZBy9xQk9Uy_uL-m3hrDqp1uUWAPwA/exec'; // ضع رابط Web App من Apps Script (المنتهي بـ /exec)
let currentTab = 'places';
let uploadedImages = [];
let uploadedVideos = [];

// تهيئة التطبيق عند التحميل
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadPlacesForAds();
    setupCityAreaMapping();
});

// تهيئة التطبيق
function initializeApp() {
    const today = new Date().toISOString().split('T')[0];
    document.querySelector('input[name="startDate"]').value = today;

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    document.querySelector('input[name="endDate"]').value = nextWeek.toISOString().split('T')[0];
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    document.getElementById('placeForm').addEventListener('submit', handlePlaceSubmit);
    document.getElementById('adForm').addEventListener('submit', handleAdSubmit);
    document.querySelector('select[name="city"]').addEventListener('change', updateAreas);
}

// إعداد تخطيط المدن والمناطق
function setupCityAreaMapping() {
    const cityAreaMap = {
        '1': [{ id: '1', name: 'مدينة نصر' }, { id: '2', name: 'المعادي' }],
        '2': [{ id: '3', name: 'الهرم' }, { id: '4', name: 'الدقي' }],
        '3': [{ id: '5', name: 'سيدي جابر' }],
        '4': [{ id: '6', name: 'قرطبة' }]
    };
    window.cityAreaMap = cityAreaMap;
}

// تحديث المناطق بناءً على المدينة المختارة
function updateAreas() {
    const citySelect = document.querySelector('select[name="city"]');
    const areaSelect = document.querySelector('select[name="area"]');
    const selectedCity = citySelect.value;
    areaSelect.innerHTML = '<option value="">اختر المنطقة</option>';
    if (selectedCity && window.cityAreaMap[selectedCity]) {
        window.cityAreaMap[selectedCity].forEach(area => {
            const option = document.createElement('option');
            option.value = area.id;
            option.textContent = area.name;
            areaSelect.appendChild(option);
        });
    }
}

// عرض التبويب المحدد
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => { tab.style.display = 'none'; });
    document.querySelectorAll('.tab').forEach(tab => { tab.classList.remove('active'); });
    document.getElementById(tabName + '-tab').style.display = 'block';
    event.target.classList.add('active');
    currentTab = tabName;
}

// معاينة صورة واحدة
function previewImage(input, previewId) {
    const preview = document.getElementById(previewId);
    preview.innerHTML = '';
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.width = '100%';
            img.style.height = '200px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '10px';
            preview.appendChild(img);
            uploadedImages = [file];
        };
        reader.readAsDataURL(file);
    }
}

// معاينة صور متعددة
function previewMultipleImages(input, previewId) {
    const preview = document.getElementById(previewId);
    preview.innerHTML = '';
    uploadedImages = [];
    if (input.files) {
        Array.from(input.files).forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const div = document.createElement('div');
                div.className = 'preview-image';
                const img = document.createElement('img');
                img.src = e.target.result;
                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-image';
                removeBtn.innerHTML = '×';
                removeBtn.onclick = function() {
                    div.remove();
                    uploadedImages.splice(index, 1);
                };
                div.appendChild(img);
                div.appendChild(removeBtn);
                preview.appendChild(div);
                uploadedImages.push(file);
            };
            reader.readAsDataURL(file);
        });
    }
}

// معاينة فيديو
function previewVideo(input, previewId) {
    const preview = document.getElementById(previewId);
    preview.innerHTML = '';
    uploadedVideos = [];
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            const video = document.createElement('video');
            video.src = e.target.result;
            video.controls = true;
            video.style.width = '100%';
            video.style.maxHeight = '300px';
            video.style.borderRadius = '10px';
            preview.appendChild(video);
            uploadedVideos = [file];
        };
        reader.readAsDataURL(file);
    }
}

// تحميل الأماكن للإعلانات
function loadPlacesForAds() {
    const placeSelect = document.querySelector('select[name="placeId"]');
    placeSelect.innerHTML = '<option value="">اختر المكان</option>';
    if (API_URL && API_URL.startsWith('http')) {
        fetch(`${API_URL}?action=places`)
            .then(r => r.json())
            .then(data => {
                if (data && data.success && Array.isArray(data.places)) {
                    data.places.forEach(place => {
                        const option = document.createElement('option');
                        option.value = place.id;
                        option.textContent = place.name;
                        placeSelect.appendChild(option);
                    });
                }
            })
            .catch(() => { appendFallbackPlaces(placeSelect); });
    } else {
        appendFallbackPlaces(placeSelect);
    }
}
function appendFallbackPlaces(placeSelect) {
    const fallback = [
        { id: '101', name: 'كافيه مزاج' },
        { id: '102', name: 'مطعم الشيف' },
        { id: '103', name: 'كافيه مزاج' },
        { id: '104', name: 'مطعم الشيف' },
        { id: '105', name: 'مطعم الشيف' }
    ];
    fallback.forEach(place => {
        const option = document.createElement('option');
        option.value = place.id;
        option.textContent = place.name;
        placeSelect.appendChild(option);
    });
}

// تقديم نموذج المكان
async function handlePlaceSubmit(event) {
    event.preventDefault();
    showLoading(true);
    try {
        const formData = new FormData(event.target);
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
        if (!validateDates() || !validateFiles()) { showLoading(false); return; }
        let imageUrl = '';
        if (placeData.image) {
            imageUrl = await uploadToGoogleDrive(placeData.image, 'places');
        }
        await savePlaceToSheet(placeData, imageUrl);
        showSuccess('تم حفظ المكان بنجاح!');
        event.target.reset();
        document.getElementById('placeImagePreview').innerHTML = '';
        uploadedImages = [];
    } catch (error) {
        console.error('خطأ في حفظ المكان:', error);
        showError('حدث خطأ أثناء حفظ المكان');
    } finally {
        showLoading(false);
    }
}

// تقديم نموذج الإعلان
async function handleAdSubmit(event) {
    event.preventDefault();
    showLoading(true);
    try {
        const formData = new FormData(event.target);
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
        if (!validateDates() || !validateFiles()) { showLoading(false); return; }
        const imageUrls = [];
        for (let image of adData.images) {
            const url = await uploadToGoogleDrive(image, 'ads');
            imageUrls.push(url);
        }
        let videoUrl = '';
        if (adData.video) {
            videoUrl = await uploadToGoogleDrive(adData.video, 'ads');
        }
        await saveAdToSheet(adData, imageUrls, videoUrl);
        showSuccess('تم حفظ الإعلان بنجاح!');
        event.target.reset();
        document.getElementById('adImagesPreview').innerHTML = '';
        document.getElementById('adVideoPreview').innerHTML = '';
        uploadedImages = [];
        uploadedVideos = [];
    } catch (error) {
        console.error('خطأ في حفظ الإعلان:', error);
        showError('حدث خطأ أثناء حفظ الإعلان');
    } finally {
        showLoading(false);
    }
}

// رفع ملف إلى Google Drive عبر Apps Script
async function uploadToGoogleDrive(file, folder) {
    if (!API_URL || !API_URL.startsWith('http')) {
        return `https://drive.google.com/file/d/${Math.random().toString(36).substr(2, 9)}/view`;
    }
    const base64 = await readFileAsBase64(file);
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'uploadFile',
            folder,
            fileName: file.name,
            mimeType: file.type,
            fileData: base64
        })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'فشل رفع الملف');
    return data.fileUrl;
}

// حفظ مكان في Google Sheets عبر Apps Script
async function savePlaceToSheet(placeData, imageUrl) {
    if (!API_URL || !API_URL.startsWith('http')) { return; }
    const payload = {
        action: 'registerPlace',
        name: placeData.placeName,
        activity: placeData.activityType,
        city: placeData.city,
        area: placeData.area,
        mall: placeData.location,
        address: placeData.detailedAddress,
        mapLink: placeData.mapLink,
        phone: placeData.phone,
        whatsappLink: placeData.whatsappLink,
        email: placeData.email,
        website: placeData.website,
        hours: placeData.workingHours,
        delivery: placeData.delivery,
        description: placeData.description,
        packageId: placeData.package,
        password: placeData.password,
        logoUrl: imageUrl || ''
    };
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'فشل حفظ المكان');
}

// حفظ إعلان في Google Sheets عبر Apps Script
async function saveAdToSheet(adData, imageUrls, videoUrl) {
    if (!API_URL || !API_URL.startsWith('http')) { return; }
    const payload = {
        action: 'addAd',
        placeId: adData.placeId,
        adType: adData.adType,
        adTitle: adData.adTitle,
        adDescription: adData.adDescription,
        startDate: adData.startDate,
        endDate: adData.endDate,
        coupon: adData.coupon || '',
        imageUrls: imageUrls || [],
        videoUrl: videoUrl || '',
        adStatus: adData.adStatus,
        adActiveStatus: adData.adActiveStatus
    };
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'فشل حفظ الإعلان');
}

// محول ملف إلى Base64 (بدون بادئة data:)
function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result;
            const base64 = String(result).split(',')[1] || '';
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// رسائل وحالة
function showSuccess(message) {
    const alert = document.getElementById('successAlert');
    alert.textContent = message;
    alert.style.display = 'block';
    setTimeout(() => { alert.style.display = 'none'; }, 5000);
}
function showError(message) {
    const alert = document.getElementById('errorAlert');
    alert.textContent = message;
    alert.style.display = 'block';
    setTimeout(() => { alert.style.display = 'none'; }, 5000);
}
function showLoading(show) {
    const loading = document.getElementById('loading');
    loading.style.display = show ? 'block' : 'none';
}
function validateDates() {
    const startDate = document.querySelector('input[name="startDate"]').value;
    const endDate = document.querySelector('input[name="endDate"]').value;
    if (startDate && endDate && startDate >= endDate) {
        showError('تاريخ النهاية يجب أن يكون بعد تاريخ البداية');
        return false;
    }
    return true;
}
function validateFiles() {
    const maxSize = 10 * 1024 * 1024;
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov'];
    for (let image of uploadedImages) {
        if (image.size > maxSize) { showError('حجم الصورة يجب أن يكون أقل من 10MB'); return false; }
        if (!allowedImageTypes.includes(image.type)) { showError('نوع الصورة غير مدعوم'); return false; }
    }
    if (uploadedVideos.length > 0) {
        const video = uploadedVideos[0];
        if (video.size > maxSize * 5) { showError('حجم الفيديو يجب أن يكون أقل من 50MB'); return false; }
        if (!allowedVideoTypes.includes(video.type)) { showError('نوع الفيديو غير مدعوم'); return false; }
    }
    return true;
}

// CSS للباقات
const style = document.createElement('style');
style.textContent = `
    .packages-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 20px; }
    .package-card { background: rgba(255, 255, 255, 0.9); border-radius: 15px; padding: 25px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.1); transition: transform 0.3s ease; }
    .package-card:hover { transform: translateY(-5px); }
    .package-card h3 { color: #667eea; margin-bottom: 15px; }
    .package-card p { color: #666; margin-bottom: 10px; }
`;
document.head.appendChild(style);
