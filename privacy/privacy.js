/* LANGUAGE_OPTIONS - mirrors the DopaStop extension's popup.js language list, so the picker here
   offers the same 27 languages the extension itself supports. */
const LANGUAGE_OPTIONS = [
  { code: 'en', folder: 'en', file: 'en', native: 'English' },
  { code: 'de', folder: 'de', file: 'de', native: 'Deutsch' },
  { code: 'el', folder: 'el', file: 'el', native: 'Ελληνικά' },
  { code: 'es', folder: 'es', file: 'es', native: 'Español' },
  { code: 'fr', folder: 'fr', file: 'fr', native: 'Français' },
  { code: 'it', folder: 'it', file: 'it', native: 'Italiano' },
  { code: 'ja', folder: 'ja', file: 'ja', native: '日本語' },
  { code: 'ko', folder: 'ko', file: 'ko', native: '한국어' },
  { code: 'nl', folder: 'nl', file: 'nl', native: 'Nederlands' },
  { code: 'pl', folder: 'pl', file: 'pl', native: 'Polski' },
  { code: 'pt-BR', folder: 'pt_BR', file: 'pt', native: 'Português (Brasil)' },
  { code: 'pt-PT', folder: 'pt_PT', file: 'pt', native: 'Português (Portugal)' },
  { code: 'ro', folder: 'ro', file: 'ro', native: 'Română' },
  { code: 'ru', folder: 'ru', file: 'ru', native: 'Русский' },
  { code: 'tr', folder: 'tr', file: 'tr', native: 'Türkçe' },
  { code: 'vi', folder: 'vi', file: 'vi', native: 'Tiếng Việt' },
  { code: 'id', folder: 'id', file: 'id', native: 'Bahasa Indonesia' },
  { code: 'ar', folder: 'ar', file: 'ar', native: 'العربية' },
  { code: 'ur', folder: 'ur', file: 'ur', native: 'اردو' },
  { code: 'hi', folder: 'hi', file: 'hi', native: 'हिन्दी' },
  { code: 'mr', folder: 'mr', file: 'mr', native: 'मराठी' },
  { code: 'bn', folder: 'bn', file: 'bn', native: 'বাংলা' },
  { code: 'te', folder: 'te', file: 'te', native: 'తెలుగు' },
  { code: 'ta', folder: 'ta', file: 'ta', native: 'தமிழ்' },
  { code: 'pcm', folder: 'pcm', file: 'pcm', native: 'Naijá (Nigerian Pidgin)' },
  { code: 'zh-CN', folder: 'zh_CN', file: 'zh', native: '中文 (简体)' },
  { code: 'zh-HK', folder: 'zh_HK', file: 'zh_HK', native: '廣東話 (香港)' },
];

/* Maps navigator.language -> option, for auto-detection when no explicit choice is stored. */
const AUTO_DETECT = {};
LANGUAGE_OPTIONS.forEach(function (opt) { AUTO_DETECT[opt.code] = opt; });
AUTO_DETECT['pt'] = LANGUAGE_OPTIONS.find(function (o) { return o.code === 'pt-BR'; });
AUTO_DETECT['zh'] = LANGUAGE_OPTIONS.find(function (o) { return o.code === 'zh-CN'; });

const RTL_CODES = ['ar', 'ur'];
const STORAGE_KEY = 'dopastop_privacy_lang';

/* resolveLocale - an explicit stored choice wins (persisted in localStorage since this is a plain
   webpage, not the extension); otherwise auto-detect from the browser, falling back to English. */
function resolveLocale () {
  var stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    var opt = LANGUAGE_OPTIONS.find(function (o) { return o.code === stored; });
    if (opt) { return opt; }
  }
  return AUTO_DETECT[navigator.language] || AUTO_DETECT['en'];
}

/* loadLocale - fetches one locale's strings and applies them to every matching element ID. */
function loadLocale (locale) {
  return fetch(`_locales/${locale.folder}/${locale.file}.json`)
    .then(function (response) { return response.json(); })
    .then(function (strings) {
      Object.keys(strings).forEach(function (key) {
        var el = document.getElementById(key);
        if (el) { el.textContent = strings[key].message; }
      });
      var h1 = document.getElementById('h1_title');
      if (h1 && strings.page_title) { h1.textContent = strings.page_title.message; }
      document.documentElement.lang = locale.code;
      document.documentElement.dir = RTL_CODES.indexOf(locale.code) !== -1 ? 'rtl' : 'ltr';
    })
    .catch(function (error) {
      console.error('Failed to load localization file:', error);
    });
}

function renderLangPicker () {
  var menu = document.getElementById('lang-picker-menu');
  menu.innerHTML = '';
  var current = resolveLocale();
  LANGUAGE_OPTIONS.forEach(function (opt) {
    var li = document.createElement('li');
    li.setAttribute('role', 'option');
    li.classList.toggle('active', opt.folder === current.folder);
    li.textContent = opt.native;
    li.addEventListener('click', function () { selectLanguage(opt); });
    menu.appendChild(li);
  });
}

function selectLanguage (opt) {
  localStorage.setItem(STORAGE_KEY, opt.code);
  closeLangPickerMenu();
  loadLocale(opt).then(renderLangPicker);
}

function openLangPickerMenu () {
  document.getElementById('lang-picker-menu').hidden = false;
  document.getElementById('lang-picker-toggle').setAttribute('aria-expanded', 'true');
}

function closeLangPickerMenu () {
  document.getElementById('lang-picker-menu').hidden = true;
  document.getElementById('lang-picker-toggle').setAttribute('aria-expanded', 'false');
}

function addLangPickerListeners () {
  document.getElementById('lang-picker-toggle').addEventListener('click', function (e) {
    e.stopPropagation();
    var menu = document.getElementById('lang-picker-menu');
    if (menu.hidden) { openLangPickerMenu(); } else { closeLangPickerMenu(); }
  });
  document.addEventListener('click', function (e) {
    if (!document.getElementById('lang-picker').contains(e.target)) { closeLangPickerMenu(); }
  });
}

loadLocale(resolveLocale()).then(function () {
  renderLangPicker();
  addLangPickerListeners();
});
