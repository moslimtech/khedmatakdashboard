// رابط الـ Web App من Google Apps Script
const API_URL = "https://script.google.com/macros/s/AKfycbx-fMI2hsJ5LvKKh9fzd3Vidn2TeGtEbHV9Nyj2nZBy9xQk9Uy_uL-m3hrDqp1uUWAPwA/exec";
const SECRET_TOKEN = "public1"; // لازم يكون نفس التوكن في Google Script

// دالة إرسال البيانات
async function sendPlaceData(placeData) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: SECRET_TOKEN,
        ...placeData
      })
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

  const placeData = {
    name: document.getElementById("name").value,
    location: document.getElementById("location").value,
    details: document.getElementById("details").value,
    phone: document.getElementById("phone").value,
    workdays: document.getElementById("workdays").value,
    from_hour: document.getElementById("from_hour").value,
    to_hour: document.getElementById("to_hour").value
  };

  sendPlaceData(placeData);
});
