// متغيرات عامة
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
    // تعيين التاريخ الحالي كتاريخ افتراضي
    const today = new Date().toISOString().split('T')[0];
    document.querySelector('input[name="startDate"]').value = today;
    
    // تعيين تاريخ النهاية بعد أسبوع
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    document.querySelector('input[name="endDate"]').value = nextWeek.toISOString().split('T')[0];
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // نموذج إضافة مكان
    document.getElementById('placeForm').addEventListener('submit', handlePlaceSubmit);
    
    // نموذج إضافة إعلان
    document.getElementById('adForm').addEventListener('submit', handleAdSubmit);
    
    // تغيير المدينة
    document.querySelector('select[name="city"]').addEventListener('change', updateAreas);
}

// إعداد تخطيط المدن والمناطق
function setupCityAreaMapping() {
    const cityAreaMap = {
        '1': [ // القاهرة
            { id: '1', name: 'مدينة نصر' },
            { id: '2', name: 'المعادي' }
        ],
        '2': [ // الجيزة
            { id: '3', name: 'الهرم' },
            { id: '4', name: 'الدقي' }
        ],
        '3': [ // الإسكندرية
            { id: '5', name: 'سيدي جابر' }
        ],
        '4': [ // السادات
            { id: '6', name: 'قرطبة' }
        ]
    };
    
    window.cityAreaMap = cityAreaMap;
}

// تحديث المناطق بناءً على المدينة المختارة
function updateAreas() {
    const citySelect = document.querySelector('select[name="city"]');
    const areaSelect = document.querySelector('select[name="area"]');
    const selectedCity = citySelect.value;
    
    // مسح الخيارات الحالية
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
    // إخفاء جميع التبويبات
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // إزالة الفئة النشطة من جميع التبويبات
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // عرض التبويب المحدد
    document.getElementById(tabName + '-tab').style.display = 'block';
    
    // إضافة الفئة النشطة للتبويب المحدد
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
            
            // حفظ الصورة للمرفقات
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
    // في التطبيق الحقيقي، سيتم جلب البيانات من Google Sheets
    const places = [
        { id: '101', name: 'كافيه مزاج' },
        { id: '102', name: 'مطعم الشيف' },
        { id: '103', name: 'كافيه مزاج' },
        { id: '104', name: 'مطعم الشيف' },
        { id: '105', name: 'مطعم الشيف' }
    ];
    
    const placeSelect = document.querySelector('select[name="placeId"]');
    places.forEach(place => {
        const option = document.createElement('option');
        option.value = place.id;
        option.textContent = place.name;
        placeSelect.appendChild(option);
    });
}

// معالجة تقديم نموذج المكان
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
        
        // رفع الصورة إلى Google Drive
        let imageUrl = '';
        if (placeData.image) {
            imageUrl = await uploadToGoogleDrive(placeData.image, 'places');
        }
        
        // حفظ البيانات في Google Sheets
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

// معالجة تقديم نموذج الإعلان
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
        
        // رفع الصور والفيديو إلى Google Drive
        const imageUrls = [];
        for (let image of adData.images) {
            const url = await uploadToGoogleDrive(image, 'ads');
            imageUrls.push(url);
        }
        
        let videoUrl = '';
        if (adData.video) {
            videoUrl = await uploadToGoogleDrive(adData.video, 'ads');
        }
        
        // حفظ البيانات في Google Sheets
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

// رفع ملف إلى Google Drive
async function uploadToGoogleDrive(file, folder) {
    // في التطبيق الحقيقي، سيتم استخدام Google Apps Script
    // هذا مثال للتوضيح فقط
    return new Promise((resolve) => {
        setTimeout(() => {
            // محاكاة رابط Google Drive
            const fakeUrl = `https://drive.google.com/file/d/${Math.random().toString(36).substr(2, 9)}/view`;
            resolve(fakeUrl);
        }, 1000);
    });
}

// حفظ مكان في Google Sheets
async function savePlaceToSheet(placeData, imageUrl) {
    // في التطبيق الحقيقي، سيتم استخدام Google Apps Script
    // هذا مثال للتوضيح فقط
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('تم حفظ المكان:', placeData);
            console.log('رابط الصورة:', imageUrl);
            resolve();
        }, 1000);
    });
}

// حفظ إعلان في Google Sheets
async function saveAdToSheet(adData, imageUrls, videoUrl) {
    // في التطبيق الحقيقي، سيتم استخدام Google Apps Script
    // هذا مثال للتوضيح فقط
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('تم حفظ الإعلان:', adData);
            console.log('روابط الصور:', imageUrls);
            console.log('رابط الفيديو:', videoUrl);
            resolve();
        }, 1000);
    });
}

// عرض رسالة نجاح
function showSuccess(message) {
    const alert = document.getElementById('successAlert');
    alert.textContent = message;
    alert.style.display = 'block';
    
    setTimeout(() => {
        alert.style.display = 'none';
    }, 5000);
}

// عرض رسالة خطأ
function showError(message) {
    const alert = document.getElementById('errorAlert');
    alert.textContent = message;
    alert.style.display = 'block';
    
    setTimeout(() => {
        alert.style.display = 'none';
    }, 5000);
}

// عرض/إخفاء مؤشر التحميل
function showLoading(show) {
    const loading = document.getElementById('loading');
    loading.style.display = show ? 'block' : 'none';
}

// التحقق من صحة التاريخ
function validateDates() {
    const startDate = document.querySelector('input[name="startDate"]').value;
    const endDate = document.querySelector('input[name="endDate"]').value;
    
    if (startDate && endDate && startDate >= endDate) {
        showError('تاريخ النهاية يجب أن يكون بعد تاريخ البداية');
        return false;
    }
    
    return true;
}

// التحقق من صحة الملفات
function validateFiles() {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov'];
    
    // التحقق من الصور
    for (let image of uploadedImages) {
        if (image.size > maxSize) {
            showError('حجم الصورة يجب أن يكون أقل من 10MB');
            return false;
        }
        
        if (!allowedImageTypes.includes(image.type)) {
            showError('نوع الصورة غير مدعوم');
            return false;
        }
    }
    
    // التحقق من الفيديو
    if (uploadedVideos.length > 0) {
        const video = uploadedVideos[0];
        if (video.size > maxSize * 5) { // 50MB للفيديو
            showError('حجم الفيديو يجب أن يكون أقل من 50MB');
            return false;
        }
        
        if (!allowedVideoTypes.includes(video.type)) {
            showError('نوع الفيديو غير مدعوم');
            return false;
        }
    }
    
    return true;
}

// إضافة CSS للباقات
const style = document.createElement('style');
style.textContent = `
    .packages-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-top: 20px;
    }
    
    .package-card {
        background: rgba(255, 255, 255, 0.9);
        border-radius: 15px;
        padding: 25px;
        text-align: center;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease;
    }
    
    .package-card:hover {
        transform: translateY(-5px);
    }
    
    .package-card h3 {
        color: #667eea;
        margin-bottom: 15px;
    }
    
    .package-card p {
        color: #666;
        margin-bottom: 10px;
    }
`;
document.head.appendChild(style);
