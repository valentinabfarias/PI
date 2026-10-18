const stagesRoot = document.getElementById("admin-stages");
const messageEl = document.getElementById("admin-message");

function getAdminKey() {
    return document.getElementById("admin-key")?.value?.trim() || "";
}

function setMessage(text, isError) {
    if (!messageEl) return;
    messageEl.textContent = text;
    messageEl.style.border = isError
        ? "2px solid #941f1f"
        : "2px solid var(--nav-bg)";
}

async function loadJourney() {
    try {
        const res = await fetch("/api/journey", { cache: "no-store" });
        if (res.ok) return res.json();
    } catch {
        /* ignore */
    }
    const res = await fetch(new URL("../data/journey.json", window.APP_ROOT).href);
    if (!res.ok) throw new Error("Falha ao carregar etapas.");
    return res.json();
}

function renderStages(stages) {
    if (!stagesRoot) return;
    stagesRoot.innerHTML = "";

    stages
        .sort((a, b) => a.index - b.index)
        .forEach((stage) => {
            const card = document.createElement("section");
            card.className = "admin-card";
            card.innerHTML = `
                <h2>Etapa ${stage.index + 1}: ${stage.title}</h2>
                <p>${stage.desc}</p>
                <p><strong>PDF atual:</strong> ${stage.pdfPath || "Nenhum"}</p>
                <div class="admin-row">
                    <input type="file" accept="application/pdf,.pdf" id="file-${stage.id}" aria-label="PDF para ${stage.title}">
                    <button type="button" class="admin-btn" data-stage-id="${stage.id}">Enviar PDF</button>
                </div>
            `;
            stagesRoot.appendChild(card);

            card.querySelector("button").addEventListener("click", () =>
                uploadPdf(stage.id),
            );
        });
}

async function uploadPdf(stageId) {
    const key = getAdminKey();
    const input = document.getElementById(`file-${stageId}`);
    if (!input?.files?.length) {
        setMessage("Selecione um arquivo PDF antes de enviar.", true);
        return;
    }
    const file = input.files[0];
    if (file.type !== "application/pdf") {
        setMessage("Apenas arquivos PDF são aceitos.", true);
        return;
    }

    const form = new FormData();
    form.append("pdf", file);

    setMessage("Enviando PDF…");

    try {
        const res = await fetch(`/api/journey/stages/${stageId}/pdf`, {
            method: "POST",
            headers: { "x-admin-key": key || "pi-admin-dev" },
            body: form,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw new Error(data.error || "Falha no envio.");
        }
        setMessage(`PDF da etapa ${stageId} publicado com sucesso.`);
        const journey = await loadJourney();
        renderStages(journey.stages || []);
    } catch (err) {
        setMessage(
            `${err.message} — Verifique se o servidor está rodando (npm start).`,
            true,
        );
    }
}

loadJourney()
    .then((data) => renderStages(data.stages || []))
    .catch((err) => setMessage(err.message, true));
