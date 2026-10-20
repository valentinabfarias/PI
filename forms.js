const form = document.getElementById('formulario');
const nomeInput = document.getElementById('nome');
const emailInput = document.getElementById('email');
const erroNome = document.getElementById('erro-nome');
const erroEmail = document.getElementById('erro-email');
const sucesso = document.getElementById('sucesso');
const erroGeral = document.getElementById('erro-geral');
const btnEnviar = document.getElementById('btn-enviar');

form.addEventListener('submit', async function(e) {
  e.preventDefault();

  // Limpa mensagens anteriores
  nomeInput.classList.remove('error');
  emailInput.classList.remove('error');
  erroNome.style.display = 'none';
  erroEmail.style.display = 'none';
  sucesso.style.display = 'none';
  erroGeral.style.display = 'none';

  const nome = nomeInput.value.trim();
  const email = emailInput.value.trim();
  let valido = true;

  // Validação do nome
  if (nome.length < 2) {
    nomeInput.classList.add('error');
    erroNome.style.display = 'block';
    valido = false;
  }

  // Validação do e-mail
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    emailInput.classList.add('error');
    erroEmail.style.display = 'block';
    valido = false;
  }

  if (!valido) return;

  // Desabilita o botão enquanto envia
  btnEnviar.disabled = true;
  btnEnviar.textContent = 'Enviando...';

  try {
    const resposta = await fetch('salvar.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nome, email })
    });

    const dados = await resposta.json();

    if (dados.sucesso) {
      sucesso.style.display = 'block';
      form.reset();
    } else {
      erroGeral.textContent = dados.mensagem || 'Erro ao salvar. Tente novamente.';
      erroGeral.style.display = 'block';
    }
  } catch (erro) {
    erroGeral.textContent = 'Erro de conexão. Verifique se o servidor está rodando.';
    erroGeral.style.display = 'block';
  } finally {
    btnEnviar.disabled = false;
    btnEnviar.textContent = 'Enviar';
  }

 document.getElementById("meuBotao").addEventListener("click", function() {
    fetch("processar.php")
        .then(response => response.text())
        .then(dados => {
            console.log(dados);
        })
        .catch(erro => {
            console.error("Erro ao chamar o PHP:", erro);
        });
});
