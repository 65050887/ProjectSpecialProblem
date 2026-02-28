// client/src/i18n/index.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// namespaces
import enCommon from "./locales/en/common.json";
import thCommon from "./locales/th/common.json";

import enAuth from "./locales/en/auth.json";
import thAuth from "./locales/th/auth.json";

import enFilter from "./locales/en/filter.json";
import thFilter from "./locales/th/filter.json";

import enDorm from "./locales/en/dorm.json";
import thDorm from "./locales/th/dorm.json";

// ✅ ใช้คีย์เดียวให้ทั้งระบบจำภาษา (ให้ตรงกับ LanguageDetector)
const LANG_STORAGE_KEY = "i18nextLng";
const DEFAULT_LANG = "th";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon, auth: enAuth, filter: enFilter, dorm: enDorm },
      th: { common: thCommon, auth: thAuth, filter: thFilter, dorm: thDorm },
    },
    supportedLngs: ["th", "en"],
    fallbackLng: "en",

    // namespaces
    ns: ["common", "auth", "filter", "dorm"],
    defaultNS: "common",

    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: LANG_STORAGE_KEY,
    },

    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
});

// ตั้งค่าเริ่มต้นด้วย (กันตอน reload)
document.documentElement.lang = i18n.language || "th";

// เปลี่ยนตามเมื่อสลับภาษา
i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
});

export default i18n;

// ✅ named exports
export const t = (key, options) => i18n.t(key, options);

export const getLanguage = () => {
  return i18n.language || localStorage.getItem(LANG_STORAGE_KEY) || DEFAULT_LANG;
};

export const changeLanguage = async (lng) => {
  const next = String(lng || "").toLowerCase().startsWith("en") ? "en" : "th";
  localStorage.setItem(LANG_STORAGE_KEY, next);
  await i18n.changeLanguage(next);
  return next;
};

// ✅ ใช้เลือกข้อความไทย/อังกฤษจาก object ที่มี key แบบ *_th / *_en
export function pickLang(obj, thKey, enKey, fallback = "-") {
  const lng = getLanguage();
  const isTh = String(lng).toLowerCase().startsWith("th");

  const thVal = thKey ? obj?.[thKey] : undefined;
  const enVal = enKey ? obj?.[enKey] : undefined;

  const chosen = isTh ? thVal ?? enVal : enVal ?? thVal;
  const text = chosen == null ? "" : String(chosen).trim();

  return text || fallback;
}