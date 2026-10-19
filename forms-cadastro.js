const form = document.getElementById("formulario");
const nomeInput = document.getElementById("nome");
const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");
const erroNome = document.getElementById("erro-nome");
const erroEmail = document.getElementById("erro-email");
const erroSenha = document.getElementById("erro-senha");
const sucesso = document.getElementById("sucesso");
const btnEnviar = document.getElementById("btn-enviar");

if (form) {
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        nomeInput.classList.remove("error");
        emailInput.classList.remove("error");
        senhaInput.classList.remove("error");
        erroNome.style.display = "none";
        erroEmail.style.display = "none";
        erroSenha.style.display = "none";
        sucesso.style.display = "none";

        const nome = nomeInput.value.trim();
        const email = emailInput.value.trim();
        const senha = senhaInput.value;
        let valido = true;

        if (nome.length < 2) {
            nomeInput.classList.add("error");
            erroNome.style.display = "block";
            valido = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            emailInput.classList.add("error");
            erroEmail.style.display = "block";
            valido = false;
        }

        if (senha.length < 6) {
            senhaInput.classList.add("error");
            erroSenha.style.display = "block";
            valido = false;
        }

        if (!valido) {
            return;
        }

        const cadastros = JSON.parse(localStorage.getItem("cadastros") || "[]");
        const emailExiste = cadastros.some((c) => c.email === email);
        if (emailExiste) {
            emailInput.classList.add("error");
            erroEmail.textContent = "Este e-mail já está cadastrado.";
            erroEmail.style.display = "block";
            return;
        }

        btnEnviar.disabled = true;

        cadastros.push({
            id: Date.now(),
            nome,
            email,
            senha,
            data: new Date().toLocaleString("pt-BR"),
        });

        localStorage.setItem("cadastros", JSON.stringify(cadastros));
        sessionStorage.setItem("username", nome.split(" ")[0] || nome);

        sucesso.style.display = "block";
        form.reset();
        btnEnviar.disabled = false;
        sucesso.focus();

        window.location.href = "./PI/pages/map.html"
    });
}
