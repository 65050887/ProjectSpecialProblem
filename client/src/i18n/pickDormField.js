export function pickByLang(i18n, thValue, enValue, fallback = "-") {
  const lang = (i18n?.resolvedLanguage || i18n?.language || "en").toLowerCase();
  const isEn = lang.startsWith("en");
  const th = thValue ?? "";
  const en = enValue ?? "";
  const v = isEn ? en : th;
  return v || (isEn ? th : en) || fallback;
}