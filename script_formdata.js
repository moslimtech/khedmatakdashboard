// رابط الـ Web App من Google Apps Script
const API_URL = "https://script.google.com/macros/s/AKfycbx-fMI2hsJ5LvKKh9fzd3Vidn2TeGtEbHV9Nyj2nZBy9xQk9Uy_uL-m3hrDqp1uUWAPwA/exec";
const SECRET_TOKEN = "public1"; // لازم يكون نفس التوكن في Google Script

// دالة إرسال البيانات
async function sendPlaceData(formData) {
  try {
    // إضافة التوكن للـ FormData
    formData.append("token", SECRET_TOKEN);
    
    const response = await fetch(API_URL, {
      method: "POST",
      body: formData
    });

    const result = await response.json();
    console.log("Server response:", result);

    if (result.status === "success") {
      alert("✅ تم إضافة المكان بنجاح");
      document.getElementById("placeForm").reset();
    } else {
      alert("❌ خطأ: " + result.message);
    }
  } catch (err) {
    console.error("Fetch error:", err);
    alert("⚠️ تعذر الاتصال بالسيرفر");
  }
}

// عند الضغط على زر الإرسال
document.getElementById("placeForm").addEventListener("submit", function(e) {
  e.preventDefault();

  // استخدام FormData بدلاً من JSON
  const formData = new FormData();
  
  formData.append("name", document.getElementById("name").value);
  formData.append("location", document.getElementById("location").value);
  formData.append("details", document.getElementById("details").value);
  formData.append("phone", document.getElementById("phone").value);
  formData.append("workdays", document.getElementById("workdays").value);
  formData.append("from_hour", document.getElementById("from_hour").value);
  formData.append("to_hour", document.getElementById("to_hour").value);

  sendPlaceData(formData);
});