(function () {
    const FONT_KEY = "site-font-scale";
    const FONT_STEPS = [100, 112, 125, 150];

    function getFontScale() {
        const raw = parseInt(localStorage.getItem(FONT_KEY) || "100", 10);
        return FONT_STEPS.includes(raw) ? raw : 100;
    }

    function applyFontScale(scale) {
        const next = FONT_STEPS.includes(scale) ? scale : 100;
        document.documentElement.setAttribute("data-font-scale", String(next));
        localStorage.setItem(FONT_KEY, String(next));
        const label = document.getElementById("font-scale-label");
        if (label) {
            label.textContent = `${next}%`;
        }
        const dec = document.getElementById("font-decrease");
        const inc = document.getElementById("font-increase");
        if (dec) dec.disabled = next <= FONT_STEPS[0];
        if (inc) inc.disabled = next >= FONT_STEPS[FONT_STEPS.length - 1];
    }

    function stepFont(delta) {
        const current = getFontScale();
        const idx = FONT_STEPS.indexOf(current);
        const nextIdx = Math.min(
            FONT_STEPS.length - 1,
            Math.max(0, idx + delta),
        );
        applyFontScale(FONT_STEPS[nextIdx]);
        announce(`Tamanho do texto: ${FONT_STEPS[nextIdx]} por cento.`);
    }

    function announce(message) {
        const region = document.getElementById("a11y-announcer");
        if (!region) return;
        region.textContent = "";
        window.setTimeout(() => {
            region.textContent = message;
        }, 50);
    }

    function getFocusable(container) {
        return Array.from(
            container.querySelectorAll(
                'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
            ),
        ).filter((el) => !el.hasAttribute("hidden"));
    }

    function initAccessMenu() {
        const openBtn = document.getElementById("menu-open");
        const menu = document.getElementById("access-menu");
        const overlay = document.getElementById("menu-overlay");
        const closeBtn = document.getElementById("menu-close");
        if (!openBtn || !menu || !overlay) return;

        let lastFocus = null;

        function openMenu() {
            lastFocus = document.activeElement;
            menu.hidden = false;
            overlay.hidden = false;
            openBtn.setAttribute("aria-expanded", "true");
            document.body.classList.add("menu-open");
            const focusables = getFocusable(menu);
            (closeBtn || focusables[0])?.focus();
        }

        function closeMenu() {
            menu.hidden = true;
            overlay.hidden = true;
            openBtn.setAttribute("aria-expanded", "false");
            document.body.classList.remove("menu-open");
            if (lastFocus && typeof lastFocus.focus === "function") {
                lastFocus.focus();
            }
        }

        openBtn.addEventListener("click", openMenu);
        closeBtn?.addEventListener("click", closeMenu);
        overlay.addEventListener("click", closeMenu);

        document.addEventListener("keydown", (event) => {
            if (menu.hidden) return;
            if (event.key === "Escape") {
                event.preventDefault();
                closeMenu();
            }
            if (event.key === "Tab") {
                const focusables = getFocusable(menu);
                if (!focusables.length) return;
                const first = focusables[0];
                const last = focusables[focusables.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        });

        menu.querySelectorAll("[data-theme-pick]").forEach((btn) => {
            btn.addEventListener("click", () => {
                const theme = btn.getAttribute("data-theme-pick");
                if (window.applySiteTheme && theme) {
                    window.applySiteTheme(theme);
                    const label =
                        theme === "escuro" ? "Modo escuro" : "Modo claro";
                    announce(`${label} ativado.`);
                }
            });
        });
    }

    window.PIAccessibility = {
        applyFontScale,
        getFontScale,
        announce,
        initAccessMenu,
    };

    applyFontScale(getFontScale());
})();
