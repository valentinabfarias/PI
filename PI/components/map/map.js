const JOURNEY_ANNOUNCER_ID = "journey-announcer";
const mapWrap = document.getElementById("journey-map-wrap");
const mapList = document.getElementById("map");
const snakeMarker = document.getElementById("journey-snake");
const snakeBackBtn = document.getElementById("snake-back");
const stageLabelEl = document.getElementById("journey-stage-label");

const SNAKE_BODY_PARTS = 5;
const SNAKE_HEAD_SIZE = 56;

let crawlInProgress = false;
let stagesCache = [];
let snakeParts = [];

const welcomeEl = document.getElementById("hero-welcome-text");
if (welcomeEl) {
    const name = sessionStorage.getItem("username") || "visitante";
    welcomeEl.textContent = `Boas-vindas, ${name}! Siga a cobrinha pelas etapas.`;
}

function journeyAnnounce(message) {
    const el = document.getElementById(JOURNEY_ANNOUNCER_ID);
    if (!el) return;
    el.textContent = "";
    window.setTimeout(() => {
        el.textContent = message;
    }, 40);
    if (window.PIAccessibility?.announce) {
        window.PIAccessibility.announce(message);
    }
}

function resolvePdfUrl(pdfPath) {
    if (!pdfPath) return null;
    if (/^https?:\/\//i.test(pdfPath)) return pdfPath;
    const base = window.APP_ROOT || "";
    return new URL(pdfPath.replace(/^\//, ""), base).href;
}

async function loadJourneyConfig() {
    try {
        const api = await fetch("/api/journey", { cache: "no-store" });
        if (api.ok) {
            return api.json();
        }
    } catch {
        /* static */
    }
    const base =
        window.APP_ROOT || new URL("../../", document.currentScript.src).href;
    const res = await fetch(new URL("data/journey.json", base).href);
    if (!res.ok) {
        throw new Error("Não foi possível carregar o mapa da jornada.");
    }
    return res.json();
}

function waitForLayout() {
    return new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
    });
}

function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function getStageElement(stageIndex) {
    const stage = stagesCache[stageIndex];
    if (!stage) {
        return null;
    }
    return document.getElementById(`journey-stage-${stage.id}`);
}

function getMarkerCenter(stageIndex) {
    const stageEl = getStageElement(stageIndex);
    if (!stageEl || !mapWrap) {
        return null;
    }
    const marker = stageEl.querySelector(".journey-stage-marker");
    if (!marker) {
        return null;
    }
    const wrapRect = mapWrap.getBoundingClientRect();
    const rect = marker.getBoundingClientRect();
    return {
        x: rect.left - wrapRect.left + rect.width / 2,
        y: rect.top - wrapRect.top + rect.height / 2,
    };
}

function getCardTop(stageIndex) {
    const stageEl = getStageElement(stageIndex);
    if (!stageEl || !mapWrap) {
        return null;
    }
    const card = stageEl.querySelector(".journey-stage-card");
    if (!card) {
        return null;
    }
    const wrapRect = mapWrap.getBoundingClientRect();
    const rect = card.getBoundingClientRect();
    return rect.top - wrapRect.top;
}

function getCardBottom(stageIndex) {
    const stageEl = getStageElement(stageIndex);
    if (!stageEl || !mapWrap) {
        return null;
    }
    const card = stageEl.querySelector(".journey-stage-card");
    if (!card) {
        return null;
    }
    const wrapRect = mapWrap.getBoundingClientRect();
    const rect = card.getBoundingClientRect();
    return rect.bottom - wrapRect.top;
}

function drawJourneyTrail() {
    const svg = document.getElementById("journey-trail");
    if (!svg || !mapWrap || !stagesCache.length) {
        return;
    }

    const width = mapWrap.scrollWidth;
    const height = mapWrap.scrollHeight;
    svg.setAttribute("width", String(width));
    svg.setAttribute("height", String(height));
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.replaceChildren();

    const isNarrow = window.matchMedia("(max-width: 720px)").matches;
    const lineOffset = 14;
    const segments = [];

    if (isNarrow) {
        for (let i = 0; i < stagesCache.length - 1; i++) {
            const m0 = getMarkerCenter(i);
            const m1 = getMarkerCenter(i + 1);
            const bottom0 = getCardBottom(i);
            if (!m0 || !m1 || bottom0 == null) {
                continue;
            }
            const bridgeY = bottom0 + lineOffset;
            segments.push(
                `M ${m0.x} ${m0.y} V ${bridgeY} H ${m1.x} V ${m1.y}`,
            );
        }
    } else {
        const rowCount = Math.ceil(stagesCache.length / 2);
        for (let row = 0; row < rowCount; row++) {
            const leftIdx = row * 2;
            const rightIdx = leftIdx + 1;
            if (rightIdx >= stagesCache.length) {
                break;
            }

            const mLeft = getMarkerCenter(leftIdx);
            const mRight = getMarkerCenter(rightIdx);
            const bottomLeft = getCardBottom(leftIdx);
            const bottomRight = getCardBottom(rightIdx);
            if (!mLeft || !mRight || bottomLeft == null || bottomRight == null) {
                continue;
            }

            segments.push(`M ${mLeft.x} ${mLeft.y} H ${mRight.x}`);

            if (row < rowCount - 1) {
                const nextLeftIdx = (row + 1) * 2;
                if (nextLeftIdx >= stagesCache.length) {
                    continue;
                }
                const mNextLeft = getMarkerCenter(nextLeftIdx);
                if (!mNextLeft) {
                    continue;
                }
                const rowBottomY =
                    Math.max(bottomLeft, bottomRight) + lineOffset;
                segments.push(
                    `M ${mRight.x} ${mRight.y} V ${rowBottomY} H ${mNextLeft.x} V ${mNextLeft.y}`,
                );
            }
        }
    }

    segments.forEach((d) => {
        const path = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path",
        );
        path.setAttribute("d", d);
        svg.appendChild(path);
    });
}

function buildSnakeParts() {
    if (!snakeMarker || snakeParts.length) {
        return;
    }
    snakeMarker.innerHTML = "";
    const root =
        window.APP_ROOT || new URL("../../", document.currentScript.src).href;
    const logoSrc = new URL("../cobrinhalogo.png", root).href;

    for (let i = SNAKE_BODY_PARTS; i >= 0; i--) {
        const part = document.createElement("div");
        const isHead = i === 0;
        part.className = isHead
            ? "snake-part snake-part-head"
            : `snake-part snake-part-body snake-part-body-${i}`;
        if (isHead) {
            const img = document.createElement("img");
            img.className = "snake-sprite";
            img.src = logoSrc;
            img.alt = "";
            img.setAttribute("role", "presentation");
            part.appendChild(img);
        }
        snakeMarker.appendChild(part);
        snakeParts.push(part);
    }
}

function placeSnakePart(part, x, y, angleDeg, visible) {
    part.style.opacity = visible ? "1" : "0";
    part.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${angleDeg}deg)`;
}

function renderSnakeChain(chain, showBody) {
    if (!snakeParts.length) {
        return;
    }
    snakeParts.forEach((part, idx) => {
        const p = chain[idx];
        if (!p) {
            part.style.opacity = "0";
            return;
        }
        const isHead = idx === 0;
        placeSnakePart(part, p.x, p.y, p.angle, isHead || showBody);
    });
}

function positionSnakeInstant(stageIndex) {
    if (!snakeMarker) {
        return;
    }
    buildSnakeParts();
    const center = getMarkerCenter(stageIndex);
    if (!center) {
        snakeMarker.hidden = true;
        return;
    }
    snakeMarker.hidden = false;
    snakeMarker.classList.remove("is-crawling", "is-crawling-back");
    const chain = [{ x: center.x, y: center.y, angle: 0 }];
    for (let i = 1; i < snakeParts.length; i++) {
        chain.push({ ...center, angle: 0 });
    }
    renderSnakeChain(chain, false);
}

function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function sampleSerpentine(from, to, t, direction) {
    const eased = easeInOutCubic(t);
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.hypot(dx, dy) || 1;
    const perpX = -dy / len;
    const perpY = dx / len;
    const amplitude = Math.min(42, len * 0.22);
    const waves = 2.2;
    const wave =
        Math.sin(t * Math.PI * waves * 2) *
        amplitude *
        (0.35 + 0.65 * Math.sin(t * Math.PI));
    const x = from.x + dx * eased + perpX * wave;
    const y = from.y + dy * eased + perpY * wave;
    const nextT = Math.min(1, t + 0.02);
    const nextEased = easeInOutCubic(nextT);
    const nextWave =
        Math.sin(nextT * Math.PI * waves * 2) *
        amplitude *
        (0.35 + 0.65 * Math.sin(nextT * Math.PI));
    const nx = from.x + dx * nextEased + perpX * nextWave;
    const ny = from.y + dy * nextEased + perpY * nextWave;
    let angle = (Math.atan2(ny - y, nx - x) * 180) / Math.PI;
    if (direction === "back") {
        angle += 180;
    }
    return { x, y, angle };
}

function animateSnakeCrawl(fromIndex, toIndex, direction) {
    return new Promise((resolve) => {
        buildSnakeParts();
        if (!snakeMarker || fromIndex === toIndex) {
            resolve();
            return;
        }

        const from = getMarkerCenter(fromIndex);
        const to = getMarkerCenter(toIndex);
        if (!from || !to) {
            positionSnakeInstant(toIndex);
            resolve();
            return;
        }

        if (prefersReducedMotion()) {
            positionSnakeInstant(toIndex);
            resolve();
            return;
        }

        const duration = 2400;
        const start = performance.now();
        const isBack = direction === "back";
        const followStrength = 0.38;
        const spacing = 11;

        snakeMarker.hidden = false;
        snakeMarker.classList.add("is-crawling");
        if (isBack) {
            snakeMarker.classList.add("is-crawling-back");
        }
        mapWrap?.classList.add("is-crawling");

        const chain = snakeParts.map(() => ({ x: from.x, y: from.y, angle: 0 }));

        function frame(now) {
            const t = Math.min(1, (now - start) / duration);
            const head = sampleSerpentine(from, to, t, direction);
            chain[0] = head;

            for (let i = 1; i < chain.length; i++) {
                const prev = chain[i - 1];
                const cur = chain[i];
                const dist = Math.hypot(prev.x - cur.x, prev.y - cur.y);
                const targetDist = spacing * i;
                const pull = dist > targetDist ? followStrength : followStrength * 0.6;
                cur.x += (prev.x - cur.x) * pull;
                cur.y += (prev.y - cur.y) * pull;
                cur.angle =
                    (Math.atan2(prev.y - cur.y, prev.x - cur.x) * 180) /
                    Math.PI;
                if (isBack) {
                    cur.angle += 180;
                }
            }

            renderSnakeChain(chain, true);

            if (t < 1) {
                requestAnimationFrame(frame);
            } else {
                snakeMarker.classList.remove("is-crawling", "is-crawling-back");
                mapWrap?.classList.remove("is-crawling");
                positionSnakeInstant(toIndex);
                snakeMarker.classList.add("snake-pop");
                window.setTimeout(
                    () => snakeMarker.classList.remove("snake-pop"),
                    500,
                );
                resolve();
            }
        }

        renderSnakeChain(
            snakeParts.map(() => ({ x: from.x, y: from.y, angle: 0 })),
            true,
        );
        requestAnimationFrame(frame);
    });
}

function updateSnakeControls(maxUnlocked) {
    if (snakeBackBtn) {
        snakeBackBtn.disabled = crawlInProgress || maxUnlocked <= 0;
    }
    if (stageLabelEl) {
        stageLabelEl.textContent = String(maxUnlocked + 1);
    }
}

async function renderJourney(crawlOptions) {
    if (!mapList) {
        return;
    }

    const config = await loadJourneyConfig();
    stagesCache = (config.stages || []).sort((a, b) => a.index - b.index);
    const maxUnlocked = window.PIJourney
        ? window.PIJourney.getMaxUnlocked()
        : parseInt(sessionStorage.getItem("mapIndex") || "0", 10);

    sessionStorage.setItem("mapIndex", String(maxUnlocked));
    sessionStorage.removeItem("articles");

    mapList.innerHTML = "";
    mapList.removeAttribute("aria-hidden");

    stagesCache.forEach((stage, i) => {
        const unlocked = i <= maxUnlocked;
        const isCurrent = i === maxUnlocked;

        const li = document.createElement("li");
        const side = i % 2 === 0 ? "left" : "right";
        li.className = `journey-stage journey-stage--${side}`;
        li.id = `journey-stage-${stage.id}`;
        if (!unlocked) li.classList.add("is-locked");
        if (isCurrent) li.classList.add("is-current");
        if (i < maxUnlocked) li.classList.add("is-completed");

        li.innerHTML = `
            <div class="journey-stage-marker" aria-hidden="true">
                <span class="journey-step-num">${i + 1}</span>
            </div>
            <article class="journey-stage-card" aria-labelledby="stage-title-${stage.id}">
                <p class="journey-step-label">Etapa ${i + 1} de ${stagesCache.length}</p>
                <h2 class="journey-stage-title" id="stage-title-${stage.id}">${stage.title}</h2>
                <p class="journey-stage-desc">${stage.desc}</p>
                <div class="journey-stage-body" ${unlocked ? "" : "hidden"}>
                    <p class="journey-stage-long">${stage.longDesc}</p>
                    <div class="journey-stage-actions"></div>
                </div>
                ${!unlocked ? `<p class="journey-locked-msg">Conclua a etapa anterior para desbloquear.</p>` : ""}
            </article>
        `;

        const actions = li.querySelector(".journey-stage-actions");

        if (unlocked) {
            const pdfUrl = resolvePdfUrl(stage.pdfPath);
            if (pdfUrl) {
                const pdfLink = document.createElement("a");
                pdfLink.className = "journey-btn journey-btn-pdf";
                pdfLink.href = pdfUrl;
                pdfLink.target = "_blank";
                pdfLink.rel = "noopener noreferrer";
                pdfLink.textContent = "Abrir PDF de apoio";
                actions.appendChild(pdfLink);
            } else {
                const pending = document.createElement("p");
                pending.className = "journey-pdf-pending";
                pending.textContent =
                    "Material desta etapa ainda não foi publicado pelo administrador.";
                actions.appendChild(pending);
            }

            if (isCurrent && i < stagesCache.length - 1) {
                const completeBtn = document.createElement("button");
                completeBtn.type = "button";
                completeBtn.className = "journey-btn journey-btn-complete";
                completeBtn.textContent = "Marcar etapa como concluída";
                completeBtn.addEventListener("click", (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onCompleteStage(i);
                });
                actions.appendChild(completeBtn);
            }
        }

        mapList.appendChild(li);
    });

    updateSnakeControls(maxUnlocked);
    await waitForLayout();
    drawJourneyTrail();

    if (
        crawlOptions &&
        crawlOptions.from != null &&
        crawlOptions.to != null
    ) {
        await animateSnakeCrawl(
            crawlOptions.from,
            crawlOptions.to,
            crawlOptions.direction || "forward",
        );
    } else {
        positionSnakeInstant(maxUnlocked);
    }
}

async function onCompleteStage(stageArrayIndex) {
    if (crawlInProgress || !window.PIJourney) {
        return;
    }

    const fromIdx = window.PIJourney.getMaxUnlocked();
    if (stageArrayIndex !== fromIdx) {
        return;
    }
    if (fromIdx >= stagesCache.length - 1) {
        journeyAnnounce("Você já está na última etapa.");
        return;
    }

    const toIdx = fromIdx + 1;
    crawlInProgress = true;
    updateSnakeControls(fromIdx);

    try {
        window.PIJourney.setCurrentStage(toIdx);
        await renderJourney({
            from: fromIdx,
            to: toIdx,
            direction: "forward",
        });
        journeyAnnounce(
            `Cobrinha avançou para a etapa ${toIdx + 1}.`,
        );
    } catch (err) {
        console.error(err);
        window.PIJourney.setCurrentStage(fromIdx);
        await renderJourney();
        journeyAnnounce("Não foi possível avançar. Tente novamente.");
    } finally {
        crawlInProgress = false;
        updateSnakeControls(window.PIJourney.getMaxUnlocked());
    }
}

async function onSnakeBack() {
    if (crawlInProgress || !window.PIJourney) {
        return;
    }

    const fromIdx = window.PIJourney.getMaxUnlocked();
    if (fromIdx <= 0) {
        journeyAnnounce("A cobrinha já está na primeira etapa.");
        return;
    }

    const toIdx = fromIdx - 1;
    crawlInProgress = true;
    updateSnakeControls(fromIdx);

    try {
        window.PIJourney.setCurrentStage(toIdx);
        await renderJourney({
            from: fromIdx,
            to: toIdx,
            direction: "back",
        });
        journeyAnnounce(`Cobrinha retrocedeu para a etapa ${toIdx + 1}.`);
    } finally {
        crawlInProgress = false;
        updateSnakeControls(toIdx);
    }
}

snakeBackBtn?.addEventListener("click", onSnakeBack);

buildSnakeParts();

renderJourney().catch((err) => {
    console.error(err);
    journeyAnnounce("Erro ao carregar o mapa. Tente atualizar a página.");
});

window.addEventListener("resize", () => {
    drawJourneyTrail();
    if (!crawlInProgress && window.PIJourney) {
        positionSnakeInstant(window.PIJourney.getMaxUnlocked());
    }
});

const mapReturn = document.getElementById("map-return");
const mapReturnArrow = document.getElementById("up-arrow")
const mapReturnText = document.getElementById("map-return-text")

function hoverMapReturn() {
    if (window.innerWidth > 768) {
        mapReturn.style.borderRadius = "20px"
        mapReturn.style.padding = "1.2rem"
        mapReturn.style.background = "var(--nav-toggle-bg-hover)"
        mapReturn.style.gap = "0.6rem"

        mapReturnArrow.style.fontSize = "1.5rem"

        mapReturnText.style.visibility = "visible"
        mapReturnText.style.width = "auto"
        
        mapReturnText.innerHTML = "Voltar ao início"
    }
}

function cancelMapReturn() {
    if (window.innerWidth > 768) {
        mapReturn.style.borderRadius = "50px"
        mapReturn.style.padding = "0.6rem"
        mapReturn.style.background = "var(--destaque-1)"
        mapReturn.style.gap = "0"

        mapReturnArrow.style.fontSize = "2.5rem"

        mapReturnText.style.visibility = "hidden"
        mapReturnText.style.width = "0"

        mapReturnText.innerHTML = ""

    }
}

function onScrollAppear() {
    const y = window.scrollY;
    if (y >= 300) {
        document.getElementById("map-return-formatting").style.visibility = "visible"
        mapReturnArrow.innerHTML = "🡅"
    } else {
        document.getElementById("map-return-formatting").style.visibility = "hidden"
        mapReturnArrow.innerHTML = ""
    }
}
window.addEventListener("scroll", onScrollAppear);

function rescroll() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}