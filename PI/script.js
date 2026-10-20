const scriptUrl = new URL(document.currentScript.src);
window.APP_ROOT = new URL("./", scriptUrl).href;

function appUrl(relativePath) {
    return new URL(relativePath, window.APP_ROOT).href;
}

const SITE_THEME_KEY = "site-theme";
const VALID_THEMES = ["claro", "escuro", "alto-contraste"];

function getStoredTheme() {
    const stored = localStorage.getItem(SITE_THEME_KEY) || "claro";
    return VALID_THEMES.includes(stored) ? stored : "claro";
}

function applySiteTheme(theme) {
    const next = VALID_THEMES.includes(theme) ? theme : "claro";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(SITE_THEME_KEY, next);
    syncPreferenceRadios(next);
    syncThemeToggleState(next);
    syncDrawerThemeButtons(next);
}

window.applySiteTheme = applySiteTheme;

function syncThemeToggleState(theme) {
    const toggle = document.getElementById("theme-toggle");
    if (!toggle) return;
    const isDarkish = theme === "escuro" || theme === "alto-contraste";
    toggle.setAttribute("aria-pressed", isDarkish ? "true" : "false");
    toggle.setAttribute(
        "aria-label",
        isDarkish ? "Ativar modo claro" : "Ativar modo escuro",
    );
}

function syncDrawerThemeButtons(theme) {
    document.querySelectorAll(".theme-icon-btn[data-theme-pick]").forEach((btn) => {
        const pick = btn.getAttribute("data-theme-pick");
        const active =
            (pick === "claro" && theme === "claro") ||
            (pick === "escuro" && theme === "escuro") ||
            (pick === "escuro" && theme === "alto-contraste");
        btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
}

function toggleNavbarTheme() {
    const current = getStoredTheme();
    if (current === "alto-contraste") {
        applySiteTheme("claro");
        return;
    }
    applySiteTheme(current === "escuro" ? "claro" : "escuro");
}

function initThemeToggle() {
    const toggle = document.getElementById("theme-toggle");
    if (!toggle) return;
    syncThemeToggleState(getStoredTheme());
    toggle.addEventListener("click", toggleNavbarTheme);
}

function syncPreferenceRadios(theme) {
    const input = document.querySelector(
        `input[name="tema"][value="${theme}"]`,
    );
    if (input) {
        input.checked = true;
    }
}

function initPreferenceThemeControls() {
    const radios = document.querySelectorAll('input[name="tema"]');
    if (!radios.length) return;

    syncPreferenceRadios(getStoredTheme());

    radios.forEach((radio) => {
        radio.addEventListener("change", () => {
            if (radio.checked) {
                applySiteTheme(radio.value);
            }
        });
    });
}

function initFontPreferenceControls() {
    const group = document.getElementById("pref-font-group");
    if (!group || !window.PIAccessibility) return;

    const current = window.PIAccessibility.getFontScale();
    group.querySelectorAll("[data-font-scale]").forEach((btn) => {
        const val = parseInt(btn.getAttribute("data-font-scale"), 10);
        if (val === current) {
            btn.setAttribute("aria-pressed", "true");
        }
        btn.addEventListener("click", () => {
            window.PIAccessibility.applyFontScale(val);
            group.querySelectorAll("[data-font-scale]").forEach((b) => {
                b.setAttribute(
                    "aria-pressed",
                    b === btn ? "true" : "false",
                );
            });
        });
    });
}

applySiteTheme(getStoredTheme());

if (document.getElementById("header-element") !== null) {
    async function addHeader() {
        const url = new URL("./components/header/header.html", scriptUrl);

        const resp = await fetch(url);
        const Html = await resp.text();
        document.getElementById("header-element").outerHTML = Html;

        const logoImg = document.querySelector("#logo-div img");
        if (logoImg) {
            logoImg.src = appUrl("../cobrinhalogo.png");
            logoImg.alt = "Logo cobrinha — Paralisia Cerebral e Ensino Superior";
        }

        document.querySelectorAll("[data-app-href]").forEach((anchor) => {
            anchor.href = appUrl(anchor.getAttribute("data-app-href"));
            anchor.onclick = `window.document.href='${appUrl(anchor.getAttribute("data-app-href"))}'`
        });

        initThemeToggle();
        syncDrawerThemeButtons(getStoredTheme());

        if (window.PIAccessibility) {
            window.PIAccessibility.initAccessMenu();
        }
    }
    addHeader();
}

if (document.getElementById("footer-element") !== null) {
    async function addFooter() {
        const url = new URL("./components/footer/footer.html", scriptUrl);

        const resp = await fetch(url);
        const Html = await resp.text();
        document.getElementById("footer-element").outerHTML = Html;

        document.querySelectorAll("#footer [data-app-href]").forEach((anchor) => {
            anchor.href = appUrl(anchor.getAttribute("data-app-href"));
        });

        const yearEl = document.getElementById("footer-year");
        if (yearEl) {
            yearEl.textContent = String(new Date().getFullYear());
        }
    }
    addFooter();
}

if (document.getElementById("mobile-footer-element") !== null) {
    async function addMobileFooter() {
        const url = new URL("./components/mobile-footer/mobile-footer.html", scriptUrl);

        const resp = await fetch(url);
        const Html = await resp.text();
        document.getElementById("mobile-footer-element").outerHTML = Html;

        document.querySelectorAll("#mobile-footer img[data-app-icon]").forEach((img) => {
            img.src = appUrl("assets/default.svg");
        });

        document.querySelectorAll("#mobile-footer [data-app-href]").forEach((anchor) => {
            anchor.href = appUrl(anchor.getAttribute("data-app-href"));
        });
    }
    addMobileFooter();
}

initPreferenceThemeControls();
initFontPreferenceControls();
