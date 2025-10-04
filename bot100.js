// [بروتوكول Node.js/Puppeteer - الكود المُجمَّع والنهائي للاستقرار]

const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
require("./keep_alive");

// =======================================================
// الوثائق التشغيلية: معايير المحاكاة الحيوية
// =======================================================
let VISIT_COUNT = 0;
// <<<<<<<< ضع رابط Adsterra هنا >>>>>>>>
const TARGET_URL =
  "https://www.revenuecpmgate.com/jbju9i3x?key=c65d3f719e8601e9327a9e5015410c57"; 

const MIN_DELAY_MS = 10000; // 10 ثواني حد أدنى
const MAX_DELAY_MS = 30000; // 30 ثانية حد أقصى

// [متغير رئيسي] عدد الجلسات المتوازية (المتصفحات)
const PARALLEL_SESSIONS = 5; // تم تخفيض العدد لضمان استقرار Replit ومنع انهيار المتصفح

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
];

// =======================================================
// [قائمة الوكلاء (Proxies) المحدثة لتجنب خطأ TIMED_OUT]
// =======================================================

const PROXY_LIST = [
    '20.106.12.186:80',    // الولايات المتحدة
    '157.245.196.225:8080', // هولندا
    '139.59.13.250:8080',   // الهند (سرعة جيدة)
    '157.230.170.158:8080', // سنغافورة
    '146.190.224.234:8080'  // كندا 
];
// =======================================================

// دالة توليد التأخير البشري
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// دالة قياسية لإنشاء التأخير
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// =======================================================
// الوحدة الرئيسية للمحاكاة الحيوية المُحسّنة
// =======================================================
async function simulateDeepHumanVisit() {
  let browser;
  try {
    // 1. اختيار وكيل عشوائي (يجب أن يكون هنا لمنع خطأ selectedProxy is not defined)
    const selectedProxy = PROXY_LIST[randomBetween(0, PROXY_LIST.length - 1)]; 

    // 2. إطلاق متصفح بخاصية التخفي والوكيل
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox", 
        "--disable-setuid-sandbox", 
        "--disable-dev-shm-usage", // لمنع انهيار المتصفح (Page Crashed)
        `--proxy-server=${selectedProxy}` // إضافة أمر استخدام الوكيل
      ],
    });

    const page = await browser.newPage();

    // 3. تعيين User-Agent عشوائي
    const randomUserAgent =
      USER_AGENTS[randomBetween(0, USER_AGENTS.length - 1)];
    await page.setUserAgent(randomUserAgent);

    // 4. محاكاة حجم شاشة حقيقي
    await page.setViewport({
      width: randomBetween(1280, 1920),
      height: randomBetween(700, 1080),
    });

    // 5. طباعة رسالة التشغيل (تم تصحيح الصياغة لتجنب خطأ SyntaxError)
    console.log(
      `[بروتوكول ${VISIT_COUNT + 1}] بدء زيارة بهوية: ${randomUserAgent.substring(0, 50)}... باستخدام الوكيل: ${selectedProxy}`,
    );

    // 6. التنقل الفعلي للموقع
    await page.goto(TARGET_URL, { timeout: 45000, waitUntil: "networkidle2" });

    // =======================================================
    // [وحدة التفاعل البشري: التمرير والنقر]
    // =======================================================

    // 1. التمرير العشوائي لأسفل وأعلى لتقليد الإنسان
    const scrollDuration = randomBetween(1000, 2000); 
    await page.mouse.wheel(0, randomBetween(400, 600)); 
    await sleep(scrollDuration);
    await page.mouse.wheel(0, randomBetween(-200, -400)); 

    // 2. النقر العشوائي (بنسبة 40% فقط)
    if (randomBetween(1, 10) <= 4) {
      console.log(`[الجلسة ${VISIT_COUNT + 1}] محاولة النقر العشوائي.`);
      await page.mouse.click(randomBetween(100, 1000), randomBetween(50, 500));
    }

    // 7. تحديث سجلات التشغيل
    VISIT_COUNT++;
    console.log(`[تم التنفيذ] الزيارة رقم: ${VISIT_COUNT} اكتملت بنجاح.`);
  } catch (error) {
    // معالجة الأخطاء الشائعة والسماح للبوت بالاستمرار
    if (error.message.includes("Execution context was destroyed") || error.message.includes("ERR_TIMED_OUT")) {
      console.error(`[معالجة الخطأ] تجاوز إعادة توجيه/فشل وكيل. الاستمرار في الزيارة التالية.`);
    } else {
      console.error(`[فشل تشغيلي] حدث خطأ في الزيارة رقم ${VISIT_COUNT + 1}:`, error.message);
    }
  } finally {
    // 8. إغلاق الجلسة
    if (browser) {
      await browser.close();
    }
  }

  // 9. تحديد التأخير البشري قبل البدء من جديد
  const delay = randomBetween(MIN_DELAY_MS, MAX_DELAY_MS);
  console.log(
    `[وحدة التأخير] انتظار ${Math.round(delay / 1000)} ثوانٍ قبل الزيارة التالية...`,
  );
  setTimeout(simulateDeepHumanVisit, delay);
}

// =======================================================
// بدء العملية التشغيلية (تشغيل 5 جلسات متوازية)
// =======================================================
for (let i = 0; i < PARALLEL_SESSIONS; i++) {
  simulateDeepHumanVisit();
}

