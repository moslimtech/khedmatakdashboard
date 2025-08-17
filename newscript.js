/ رابط الـ Web App من Google Apps Script
const API_URL = "https://script.google.com/macros/s/AKfycbx-fMI2hsJ5LvKKh9fzd3Vidn2TeGtEbHV9Nyj2nZBy9xQk9Uy_uL-m3hrDqp1uUWAPwA/exec";
const SECRET_TOKEN = "public1"; // لازم يكون نفس التوكن في Google Script

// دالة إرسال البيانات
async function sendStoreData(formData) {
  try {
    // إضافة التوكن للـ FormData
    formData.append("token", SECRET_TOKEN);
    
    // إضافة ID عشوائي للمحل
    const randomId = Math.random().toString(36).substr(2, 9);
    formData.append("id", randomId);
    
    // إضافة التواريخ الافتراضية
    const today = new Date().toISOString().split('T')[0];
    formData.append("start_date", today);
    formData.append("end_date", "");
    formData.append("package", "مجاني");
    formData.append("package_status", "نشط");
    formData.append("status", "جديد");
    
    const response = await fetch(API_URL, {
      method: "POST",
      body: formData
    });

    const result = await response.json();
    console.log("Server response:", result);

    if (result.status === "success") {
      alert("✅ تم تسجيل المحل بنجاح");
      document.getElementById("storeForm").reset();
    } else {
      alert("❌ خطأ: " + result.message);
    }
  } catch (err) {
    console.error("Fetch error:", err);
    alert("⚠️ تعذر الاتصال بالسيرفر");
  }
}

// عند الضغط على زر الإرسال
document.getElementById("storeForm").addEventListener("submit", function(e) {
  e.preventDefault();

  // استخدام FormData
  const formData = new FormData();
  
  // جمع البيانات من النموذج
  const formElements = document.getElementById("storeForm").elements;
  
  for (let element of formElements) {
    if (element.name && element.value) {
      formData.append(element.name, element.value);
    }
  }

  sendStoreData(formData);
});

// إضافة تحقق من صحة الروابط
document.addEventListener('DOMContentLoaded', function() {
  const urlInputs = ['whatsapp', 'facebook', 'instagram', 'tiktok', 'snap', 'maplink', 'logo'];
  
  urlInputs.forEach(inputId => {
    const input = document.getElementById(inputId);
    if (input) {
      input.addEventListener('blur', function() {
        if (this.value && !isValidUrl(this.value)) {
          alert('⚠️ الرابط غير صحيح: ' + this.value);
          this.focus();
        }
      });
    }
  });
});

// دالة للتحقق من صحة الروابط
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}
