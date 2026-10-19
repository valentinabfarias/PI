const articles = JSON.parse(sessionStorage.getItem("articles"))
const articleIndex = sessionStorage.getItem("articleIndex")

const hidden = document.querySelector(".hidden")
const formProgress = document.getElementById("article-progress");
const questionCounter = document.getElementById("page-counter");

const title = document.querySelector("title").innerHTML;
let titleBar = title;

document.getElementById("header-article-title").innerHTML = JSON.parse(sessionStorage.getItem("articles"))[sessionStorage.getItem("articleIndex")].title

const questions = []
let lastQuestion;

let currentQuestion = articles[articleIndex].currentQuestion;
let questionIndex = currentQuestion-1
let articleForm = document.getElementById("article-form")

for (let i = 0; i < articles[articleIndex].questions; i++) {
    questions[i] = `./pages/articles/${articles[articleIndex].name}/content/form-content/question-${i+1}.html`;
    lastQuestion = questions.length
    document.getElementById("progress-bar").ariaValueMax = lastQuestion
}

let formItems = []
let formRadios = []
let formButton = []
let questionResults = []
let rightAnswers;

async function addQuestions() {
    articles[articleIndex].currentQuestion = currentQuestion;
    sessionStorage.setItem("articles", JSON.stringify(articles));
    rightAnswers = 0

    for (let i = (lastQuestion-1); i >= 0; i--) {
        const url = new URL(`${questions[i]}`, scriptUrl);
        const resp = await fetch(url);
        const Html = await resp.text();
        
        articleForm.insertAdjacentHTML("afterbegin", Html)

        formItems.push(document.getElementsByClassName(`item-question-${i+1}`))
        formRadios.push(document.getElementsByClassName(`radio-question-${i+1}`))
		

        document.getElementById(`question-${i+1}-display`).style.display = "none"
    }

    titleBar = `(Questão ${currentQuestion}/${lastQuestion}) ${title}`
	document.querySelector("title").innerHTML = titleBar

    formItems.reverse()
    formRadios.reverse()
    formButton = document.getElementsByClassName("form-button")

    questionResults = document.getElementsByClassName("question-results")

    updateQuestions();
}
addQuestions()

function updateQuestions() {
    if (currentQuestion > lastQuestion || currentQuestion === 0) {
        currentQuestion = 1
    }
    questionIndex = currentQuestion - 1
	
    document.getElementById(`question-${currentQuestion}-display`).style.display = "flex"

    formProgress.style.width = `${((currentQuestion - 1) * 100 / (lastQuestion - 1))}%`
    document.getElementById("progress-bar").ariaValueNow = currentQuestion

    questionCounter.innerHTML = `${currentQuestion}/${lastQuestion}`

    titleBar = `(Questão ${currentQuestion}/${lastQuestion}) ${title}`
	document.querySelector("title").innerHTML = titleBar
    
    formButton[questionIndex].style.display = "block"
    formButton[questionIndex].setAttribute("disabled", true)
    questionResults[questionIndex].style.display = "none"

    console.log(formItems)
    console.log(formRadios)

    for (let i = 0; i < formItems[questionIndex].length; i++) {
        formItems[questionIndex][i].onclick = function () {
            formRadios[questionIndex][i].click();
        }
    }

    for (let i = 0; i < formRadios[questionIndex].length; i++) {
        formRadios[questionIndex][i].onclick = function () {
            if (formRadios[questionIndex][i].checked) {
                for (let j = 0; j < formItems[questionIndex].length; j++) {
                    formItems[questionIndex][j].classList.remove("checked")
                }
                formItems[questionIndex][i].classList.add("checked")
                formButton[questionIndex].removeAttribute("disabled")
            }
        }
    }
}

function checkAnswer() {
    formButton[questionIndex].setAttribute("disabled", true)
    formButton[questionIndex].style.display = "none"
    questionResults[questionIndex].style.display = "flex"



    for (let i = 0; i < formRadios.length; i++) {
        if (formRadios[questionIndex][i].checked) {
            if (formRadios[questionIndex][i].value === "V") {
                document.getElementsByClassName("right")[questionIndex].style.display = "flex"
                rightAnswers++

                document.getElementsByClassName("wrong")[questionIndex].style.display = "none"
                return
            }
            if (formRadios[questionIndex][i].value === "F") {
                document.getElementsByClassName("wrong")[questionIndex].style.display = "flex"

                document.getElementsByClassName("right")[questionIndex].style.display = "none"
                return
            }
        }
    }
}

function nextQuestion() {
    previousquestionIndex = questionIndex
	questionIndex++;

	isPlaying = false;
	playButton.textContent = "▶";
	playButton.onclick = play;
	synth.cancel();
	synthIndex = 0

    document.getElementById(`question-${currentQuestion}-display`).style.display = "none"
    currentQuestion++;
    document.getElementById(`question-${currentQuestion}-display`).style.display = "flex"
    
    articles[articleIndex].currentQuestion = currentQuestion;
    sessionStorage.setItem("articles", JSON.stringify(articles));

    // console.log(currentQuestion)
	synthIndex = 0
    updateQuestions();
}

function endForm() {
    // alert(`${rightAnswers}/${lastQuestion} acertos!!! (teste)`)
    articles[articleIndex].currentPage = 1;
    articles[articleIndex].currentQuestion = 1;

    sessionStorage.setItem("articles", JSON.stringify(articles));
    
    const mapIndex = sessionStorage.getItem("mapIndex")
    sessionStorage.setItem("mapIndex", (parseInt(mapIndex) + 1))
    alert(sessionStorage.getItem("mapIndex"))
}

/*******************************/

const synth = window.speechSynthesis;

let allQuestionElements = [];
let allResponseElements = [];

let currentQuestionElements = [];
let currentResponseElements = [];

let synthIndex = 0;
let synthProgress = 0;

let isPlaying = false;
let audioEnabled = false;
let speechMode = "question";
let speechGeneration = 0;

const playButton = document.getElementById("play");
const audioProgress = document.getElementById("audio-progress");

async function countSynthElements() {
    await addQuestions();

    allQuestionElements = [];
    allResponseElements = [];

    for (let i = 0; i < lastQuestion; i++) {
        const html = document.getElementById(`question-${i + 1}-display`);

        allQuestionElements.push(
            Array.from(html.querySelectorAll(".question-text, .tts-read"))
        );

        allResponseElements.push(
            Array.from(
                html.querySelectorAll(".results-title, .explain"))
        );
    }

    setUpSynth();
}
countSynthElements;

function getCurrentElements() {
    const elements = speechMode === "question"
        ? allQuestionElements[questionIndex] ?? []
        : allResponseElements[questionIndex] ?? [];

    // O hidden é sempre o primeiro elemento a ser lido.
    return [hidden, ...elements];
}

function setUpSynth() {
    currentQuestionElements = [
        hidden,
        ...(allQuestionElements[questionIndex] ?? [])
    ];

    currentResponseElements = [
        hidden,
        ...(allResponseElements[questionIndex] ?? [])
    ];

    synthIndex = 0;
    synthProgress = 0;
    speechMode = "question";
}

function getSpeechText(element) {
    if (element instanceof Element &&
        element.tagName.toLowerCase() === "img") {
        return element.alt || "";
    }

    return element?.textContent?.trim() || "";
}

function speakNext() {
	console.log("A. speakNext iniciou");
    console.log("B. isPlaying:", isPlaying);
    console.log("C. audioEnabled:", audioEnabled);
    console.log("D. synth.paused:", synth.paused);
    console.log("E. speechMode:", speechMode);
    console.log("F. questionIndex:", questionIndex);

    const elements = getCurrentElements();

    console.log("G. Elementos:", elements);
    console.log("H. Quantidade:", elements.length);

    if (!isPlaying || !audioEnabled) {
        console.log("PAROU: áudio desativado ou não está tocando");
        return;
    }

    if (!isPlaying || !audioEnabled) return;

    while (synthIndex < elements.length) {
        const elementIndex = synthIndex;
        const element = elements[synthIndex++];
        const sentence = getSpeechText(element);

        // Não pula o hidden por estar oculto visualmente.
        if (!sentence) continue;

        const generation = speechGeneration;
        const utterance = new SpeechSynthesisUtterance(sentence);

        utterance.lang = "pt-BR";

        utterance.onend = () => {
            if (generation !== speechGeneration) return;

            if (isPlaying && audioEnabled) {
                speakNext();
            }
        };

        utterance.onerror = (event) => {
            if (generation !== speechGeneration) return;

            console.error("Erro na síntese de voz:", event.error);

            if (isPlaying && audioEnabled) {
                speakNext();
            }
        };

        // Atualiza o progresso sem depender do conteúdo de hidden.
        if (speechMode === "question") {
            const total = Math.max(
                allQuestionElements.flat().length + lastQuestion,
                1
            );

            const offset = allQuestionElements
                .slice(0, questionIndex)
                .reduce((sum, list) => sum + list.length + 1, 0);

            synthProgress = offset + elementIndex + 1;

            audioProgress.style.width =
                `${Math.min(synthProgress / total * 100, 100)}%`;
        }

        synth.speak(utterance);
        return;
    }

    // A leitura acabou, mas o áudio continua habilitado.
    isPlaying = false;
    playButton.textContent = "▶";
    playButton.onclick = play;
}

function play() {
	console.log("Testando")
    audioEnabled = true;

    if (synth.paused && synth.speaking) {
        isPlaying = true;
        playButton.textContent = "⏸";
        playButton.onclick = pause;
        synth.resume();
        return;
    }

    if (isPlaying) return;

    speechMode = "question";
    synthIndex = 0;

    speechGeneration++;
    synth.cancel();

    isPlaying = true;
    playButton.textContent = "⏸";
    playButton.onclick = pause;

    speakNext();
    console.log("1. play() iniciou");

    try {
        console.log("2. synth:", synth);
        console.log("3. audioEnabled:", audioEnabled);
        console.log("4. isPlaying:", isPlaying);
        console.log("5. speechGeneration:", speechGeneration);
        console.log("6. synth.paused:", synth.paused);
        console.log("7. synth.speaking:", synth.speaking);

        audioEnabled = true;
        console.log("8. audioEnabled atualizado");

        if (synth.paused && synth.speaking) {
            isPlaying = true;
            synth.resume();
            console.log("9. Retomando áudio pausado");
            return;
        }

        if (isPlaying) {
            console.log("9. Já está reproduzindo");
            return;
        }

        speechMode = "question";
        synthIndex = 0;

        speechGeneration++;
        console.log("10. Preparando leitura");

        synth.cancel();
        console.log("11. synth.cancel() executado");

        isPlaying = true;

        console.log("12. Elementos:", getCurrentElements());
        console.log("13. Chamando speakNext()");

        speakNext();

        console.log("14. speakNext() retornou");

    } catch (error) {
        console.error("ERRO dentro de play():", error);
    }
}

function pause() {
    audioEnabled = false;
    isPlaying = false;

    speechGeneration++;
    synth.cancel();

    playButton.textContent = "▶";
    playButton.onclick = play;
}

function speakResponse() {
    if (!audioEnabled) return;

    speechGeneration++;
    synth.cancel();

    speechMode = "response";
    synthIndex = 0;
    isPlaying = true;

    playButton.textContent = "⏸";
    playButton.onclick = pause;

    speakNext();
}

// Volta um elemento e começa a lê-lo novamente.
function rewind() {
    if (!audioEnabled) return;

    const elements = getCurrentElements();

    speechGeneration++;
    synth.cancel();

    // synthIndex já aponta para o próximo elemento.
    // Por isso, subtraímos dois para voltar um elemento.
    synthIndex = Math.max(0, synthIndex - 2);

    if (synthIndex >= elements.length) {
        synthIndex = Math.max(0, elements.length - 1);
    }

    isPlaying = true;
    playButton.textContent = "⏸";
    playButton.onclick = pause;

    speakNext();
}

// Recomeça TODOS os elementos da questão ou resposta atual.
function replay() {
    if (!audioEnabled) return;

    speechGeneration++;
    synth.cancel();

    synthIndex = 0;
    isPlaying = true;

    playButton.textContent = "⏸";
    playButton.onclick = pause;

    speakNext();
}

window.play = play;
window.pause = pause;
window.rewind = rewind;
window.replay = replay;