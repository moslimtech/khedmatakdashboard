// Google Apps Script للتعامل مع الأماكن والإعلانات

// معرفات جداول البيانات (استبدل هذه المعرفات بمعرفات جداولك الحقيقية)
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'; // استبدل بمعرف جدول البيانات الخاص بك
const PLACES_SHEET_NAME = 'الأماكن';
const ADS_SHEET_NAME = 'الإعلانات';
const CITIES_SHEET_NAME = 'المدن';
const AREAS_SHEET_NAME = 'المناطق';
const LOCATIONS_SHEET_NAME = 'المواقع والمولات';
const ACTIVITIES_SHEET_NAME = 'نوع النشاط';
const PACKAGES_SHEET_NAME = 'الباقات';
const VISITS_SHEET_NAME = 'سجل الزيارات';

// معرف مجلد Google Drive (استبدل بمعرف المجلد الخاص بك)
const DRIVE_FOLDER_ID = 'YOUR_DRIVE_FOLDER_ID';

// دالة doGet للتعامل مع طلبات GET
function doGet(e) {
  const action = e.parameter.action;
  
  switch(action) {
    case 'meta':
      return getMetaData();
    case 'places':
      return getPlaces();
    case 'ads':
      return getAds();
    default:
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'إجراء غير معروف'
      })).setMimeType(ContentService.MimeType.JSON);
  }
}

// دالة doPost للتعامل مع طلبات POST
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    switch(action) {
      case 'registerPlace':
        return registerPlace(data);
      case 'addAd':
        return addAd(data);
      case 'uploadFile':
        return uploadFile(data);
      default:
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          message: 'إجراء غير معروف'
        })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'خطأ في معالجة البيانات: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// الحصول على البيانات الوصفية
function getMetaData() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // الحصول على المدن
    const citiesSheet = spreadsheet.getSheetByName(CITIES_SHEET_NAME);
    const cities = citiesSheet.getRange(2, 1, citiesSheet.getLastRow() - 1, 2).getValues();
    
    // الحصول على المناطق
    const areasSheet = spreadsheet.getSheetByName(AREAS_SHEET_NAME);
    const areas = areasSheet.getRange(2, 1, areasSheet.getLastRow() - 1, 3).getValues();
    
    // الحصول على المواقع والمولات
    const locationsSheet = spreadsheet.getSheetByName(LOCATIONS_SHEET_NAME);
    const locations = locationsSheet.getRange(2, 1, locationsSheet.getLastRow() - 1, 2).getValues();
    
    // الحصول على أنواع النشاط
    const activitiesSheet = spreadsheet.getSheetByName(ACTIVITIES_SHEET_NAME);
    const activities = activitiesSheet.getRange(2, 1, activitiesSheet.getLastRow() - 1, 2).getValues();
    
    // الحصول على الباقات
    const packagesSheet = spreadsheet.getSheetByName(PACKAGES_SHEET_NAME);
    const packages = packagesSheet.getRange(2, 1, packagesSheet.getLastRow() - 1, 3).getValues();
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      cities: cities.map(row => ({ id: row[0], name: row[1] })),
      areas: areas.map(row => ({ id: row[0], name: row[1], cityId: row[2] })),
      locations: locations.map(row => ({ id: row[0], name: row[1] })),
      activities: activities.map(row => ({ id: row[0], name: row[1] })),
      packages: packages.map(row => ({ id: row[0], name: row[1], days: row[2] }))
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'خطأ في جلب البيانات الوصفية: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// تسجيل مكان جديد
function registerPlace(data) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(PLACES_SHEET_NAME);
    
    // إنشاء معرف فريد للمكان
    const placeId = generateUniqueId();
    
    // حساب تواريخ البداية والنهاية
    const startDate = new Date();
    const packageDays = getPackageDays(data.packageId);
    const endDate = new Date(startDate.getTime() + (packageDays * 24 * 60 * 60 * 1000));
    
    // تحضير البيانات للحفظ
    const rowData = [
      placeId,                    // ID المكان
      data.name,                  // اسم المكان
      data.activity,              // نوع النشاط / الفئة
      data.city,                  // المدينة
      data.area,                  // المنطقة
      data.mall || '',            // الموقع او المول
      data.address || '',         // العنوان التفصيلي
      data.mapLink || '',         // رابط الموقع على الخريطة
      data.phone,                 // رقم التواصل
      data.whatsappLink || '',    // رابط واتساب
      data.email,                 // البريد الإلكتروني
      data.website || '',         // الموقع الالكتروني
      data.hours || '',           // ساعات العمل
      data.delivery || 'لا',      // خدمات التوصيل
      data.logoUrl || '',         // صورة شعار أو صورة المكان
      data.logoUrl || '',         // رابط صورة شعار المكان
      data.description || '',     // وصف مختصر
      0,                          // عدد الزيارات اليومية
      0,                          // عدد الزيارات الكلي
      'جديد',                     // حالة التسجيل
      startDate,                  // تاريخ بداية الاشتراك
      endDate,                    // تاريخ نهاية الاشتراك
      data.packageId,             // الباقة
      'نشط',                      // حالة الباقة
      data.password               // كلمة المرور
    ];
    
    // إضافة الصف إلى الجدول
    sheet.appendRow(rowData);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'تم تسجيل المكان بنجاح',
      placeId: placeId
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'خطأ في تسجيل المكان: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// إضافة إعلان جديد
function addAd(data) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(ADS_SHEET_NAME);
    
    // إنشاء معرف فريد للإعلان
    const adId = generateUniqueId();
    
    // تحضير البيانات للحفظ
    const rowData = [
      adId,                       // ID الإعلان
      data.placeId,               // ID المكان
      data.adType,                // نوع الاعلان
      data.adTitle,               // العنوان
      data.adDescription,         // الوصف
      data.startDate,             // تاريخ البداية
      data.endDate,               // تاريخ النهاية
      data.coupon || '',          // كوبون خصم
      data.imageUrls ? data.imageUrls.join('|') : '', // صور متعددة مفصولة بـ |
      data.videoUrl || '',        // رابط الفيديو
      data.adStatus,              // الحالة
      data.adActiveStatus         // حالة الاعلان
    ];
    
    // إضافة الصف إلى الجدول
    sheet.appendRow(rowData);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'تم إضافة الإعلان بنجاح',
      adId: adId
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'خطأ في إضافة الإعلان: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// رفع ملف إلى Google Drive
function uploadFile(data) {
  try {
    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    const subFolder = getOrCreateSubFolder(folder, data.folder);
    
    // تحويل البيانات من Base64 إلى Blob
    const blob = Utilities.newBlob(
      Utilities.base64Decode(data.fileData),
      data.mimeType,
      data.fileName
    );
    
    // رفع الملف
    const file = subFolder.createFile(blob);
    
    // جعل الملف قابل للمشاركة
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      fileUrl: file.getUrl(),
      fileId: file.getId()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'خطأ في رفع الملف: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// الحصول على الأماكن
function getPlaces() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(PLACES_SHEET_NAME);
    const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
    
    const places = data.map(row => ({
      id: row[0],
      name: row[1],
      activity: row[2],
      city: row[3],
      area: row[4],
      status: row[18]
    }));
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      places: places
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'خطأ في جلب الأماكن: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// الحصول على الإعلانات
function getAds() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(ADS_SHEET_NAME);
    const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
    
    const ads = data.map(row => ({
      id: row[0],
      placeId: row[1],
      adType: row[2],
      title: row[3],
      description: row[4],
      startDate: row[5],
      endDate: row[6],
      status: row[10]
    }));
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      ads: ads
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'خطأ في جلب الإعلانات: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// دوال مساعدة

// إنشاء معرف فريد
function generateUniqueId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// الحصول على عدد أيام الباقة
function getPackageDays(packageId) {
  const packages = {
    'P001': 30,   // الباقة الفضية
    'P002': 90,   // الباقة الذهبية
    'P003': 180,  // الباقة البلاتينية
    'P004': 365,  // الباقة الماسية
    'P005': 7     // الباقة التجريبية
  };
  
  return packages[packageId] || 30;
}

// الحصول على مجلد فرعي أو إنشاؤه
function getOrCreateSubFolder(parentFolder, folderName) {
  const folders = parentFolder.getFoldersByName(folderName);
  
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return parentFolder.createFolder(folderName);
  }
}

// تسجيل زيارة
function logVisit(adId, placeId, visitType, ip, country) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(VISITS_SHEET_NAME);
    
    const rowData = [
      generateUniqueId(),  // ID
      adId,                // ID الإعلان
      placeId,             // ID المكان
      visitType,           // نوع الزيارة
      new Date(),          // التاريخ
      ip || '',            // IP
      country || ''        // البلد
    ];
    
    sheet.appendRow(rowData);
    
    // تحديث عدد الزيارات في جدول الأماكن
    updateVisitCount(placeId);
    
  } catch (error) {
    console.error('خطأ في تسجيل الزيارة:', error);
  }
}

// تحديث عدد الزيارات
function updateVisitCount(placeId) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(PLACES_SHEET_NAME);
    
    // البحث عن المكان
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === placeId) {
        // تحديث عدد الزيارات اليومية والكلية
        const dailyVisits = data[i][18] + 1;
        const totalVisits = data[i][19] + 1;
        
        sheet.getRange(i + 1, 19).setValue(dailyVisits);
        sheet.getRange(i + 1, 20).setValue(totalVisits);
        break;
      }
    }
    
  } catch (error) {
    console.error('خطأ في تحديث عدد الزيارات:', error);
  }
}

// إعادة تعيين الزيارات اليومية (يتم تشغيلها يومياً)
function resetDailyVisits() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(PLACES_SHEET_NAME);
    
    // إعادة تعيين جميع الزيارات اليومية إلى 0
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 19, lastRow - 1, 1).setValue(0);
    }
    
  } catch (error) {
    console.error('خطأ في إعادة تعيين الزيارات اليومية:', error);
  }
}

// التحقق من انتهاء صلاحية الباقات
function checkExpiredPackages() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(PLACES_SHEET_NAME);
    
    const data = sheet.getDataRange().getValues();
    const today = new Date();
    
    for (let i = 1; i < data.length; i++) {
      const endDate = new Date(data[i][22]); // تاريخ نهاية الاشتراك
      
      if (endDate < today) {
        // تحديث حالة الباقة إلى منتهية الصلاحية
        sheet.getRange(i + 1, 25).setValue('منتهية الصلاحية');
      }
    }
    
  } catch (error) {
    console.error('خطأ في التحقق من انتهاء صلاحية الباقات:', error);
  }
}

// إعداد Triggers للتشغيل التلقائي
function setupTriggers() {
  // حذف Triggers الموجودة
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
  
  // إضافة Trigger لإعادة تعيين الزيارات اليومية (كل يوم في الساعة 00:00)
  ScriptApp.newTrigger('resetDailyVisits')
    .timeBased()
    .everyDays(1)
    .atHour(0)
    .create();
  
  // إضافة Trigger للتحقق من انتهاء صلاحية الباقات (كل يوم في الساعة 01:00)
  ScriptApp.newTrigger('checkExpiredPackages')
    .timeBased()
    .everyDays(1)
    .atHour(1)
    .create();
}