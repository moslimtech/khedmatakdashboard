// متغيرات التطبيق
const API_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL'; // استبدل هذا برابط النص البرمجي الخاص بك
let metaData = {};

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // جلب البيانات الوصفية
    fetchMetaData();
    
    // إعداد معاينة الصورة
    setupImagePreview();
    
    // إعداد النموذج
    setupForm();
});

// جلب البيانات الوصفية من الخادم
function fetchMetaData() {
    showLoading(true);
    
    fetch(`${API_URL}?action=meta`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                metaData = data;
                populateSelects();
            } else {
                showAlert('خطأ', 'فشل تحميل البيانات الأساسية. يرجى المحاولة لاحقاً.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('خطأ', 'حدث خطأ أثناء الاتصال بالخادم.');
        })
        .finally(() => {
            showLoading(false);
        });
}

// تعبئة القوائم المنسدلة بالبيانات
function populateSelects() {
    // تعبئة نوع النشاط
    const activitySelect = document.getElementById('activity');
    if (metaData.activities && activitySelect) {
        metaData.activities.forEach(activity => {
            const option = document.createElement('option');
            option.value = activity;
            option.textContent = activity;
            activitySelect.appendChild(option);
        });
    }
    
    // تعبئة المدن
    const citySelect = document.getElementById('city');
    if (metaData.cities && citySelect) {
        metaData.cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
    }
    
    // تعبئة المولات
    const mallSelect = document.getElementById('mall');
    if (metaData.malls && mallSelect) {
        metaData.malls.forEach(mall => {
            const option = document.createElement('option');
            option.value = mall;
            option.textContent = mall;
            mallSelect.appendChild(option);
        });
    }
    
    // تعبئة الباقات
    const packageSelect = document.getElementById('package');
    if (metaData.packages && packageSelect) {
        metaData.packages.forEach(pkg => {
            const option = document.createElement('option');
            option.value = pkg.id;
            option.textContent = `${pkg.name} (${pkg.days} يوم)`;
            packageSelect.appendChild(option);
        });
    }
}

// إعداد معاينة صورة الشعار
function setupImagePreview() {
    const logoInput = document.getElementById('logo');
    if (logoInput) {
        logoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const preview = document.getElementById('logoPreview');
                    preview.src = event.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// إعداد النموذج وإرساله
function setupForm() {
    const form = document.getElementById('registrationForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            submitForm();
        });
    }
}

// إرسال النموذج إلى الخادم
function submitForm() {
    // التحقق من تطابق كلمة المرور
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        showAlert('خطأ', 'كلمة المرور وتأكيدها غير متطابقين');
        return;
    }
    
    // إعداد بيانات النموذج
    const formData = {
        action: 'registerPlace',
        name: document.getElementById('name').value,
        activity: document.getElementById('activity').value,
        city: document.getElementById('city').value,
        area: document.getElementById('area').value,
        mall: document.getElementById('mall').value,
        address: document.getElementById('address').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        website: document.getElementById('website').value,
        mapLink: document.getElementById('mapLink').value,
        hours: document.getElementById('hours').value,
        delivery: document.getElementById('delivery').value,
        description: document.getElementById('description').value,
        packageId: document.getElementById('package').value,
        password: password
    };
    
    // معالجة صورة الشعار إذا تم تحميلها
    const logoInput = document.getElementById('logo');
    if (logoInput.files.length > 0) {
        const file = logoInput.files[0];
        const reader = new FileReader();
        
        reader.onload = function(event) {
            const base64 = event.target.result.split(',')[1];
            formData.logoBase64 = base64;
            sendFormData(formData);
        };
        
        reader.readAsDataURL(file);
    } else {
        sendFormData(formData);
    }
}

// إرسال البيانات إلى الخادم
function sendFormData(formData) {
    showLoading(true);
    
    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert('نجاح', `تم تسجيل المكان بنجاح! رقم المكان: ${data.placeId}`, true);
            document.getElementById('registrationForm').reset();
            document.getElementById('logoPreview').style.display = 'none';
        } else {
            showAlert('خطأ', data.message || 'فشل تسجيل المكان. يرجى المحاولة لاحقاً.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showAlert('خطأ', 'حدث خطأ أثناء الاتصال بالخادم.');
    })
    .finally(() => {
        showLoading(false);
    });
}

// عرض نافذة التنبيه
function showAlert(title, message, reload = false) {
    const alertModal = new bootstrap.Modal(document.getElementById('alertModal'));
    document.getElementById('alertModalTitle').textContent = title;
    document.getElementById('alertModalBody').textContent = message;
    alertModal.show();
    
    if (reload) {
        document.getElementById('alertModal').addEventListener('hidden.bs.modal', function() {
            window.location.reload();
        });
    }
}

// عرض/إخفاء مؤشر التحميل
function showLoading(show) {
    const submitBtn = document.getElementById('submitBtn');
    const spinner = document.getElementById('spinner');
    
    if (show) {
        submitBtn.disabled = true;
        spinner.classList.remove('d-none');
    } else {
        submitBtn.disabled = false;
        spinner.classList.add('d-none');
    }
}
