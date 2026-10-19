console.log(sessionStorage.getItem("mapIndex"))

// barra de leitura
const articleProgress = document.getElementById("article-progress")
const pageCounter = document.getElementById("page-counter")
const hidden = document.querySelector(".hidden")

// construtor do artigo
const title = document.querySelector("title").innerHTML;

let titleBar = title;
console.log(sessionStorage.getItem("title"))

const article = document.querySelector("article");
const articles = JSON.parse(sessionStorage.getItem("articles"));
const articleIndex = sessionStorage.getItem("articleIndex");

const numberPages = articles[articleIndex].pages;
console.log(numberPages)

const articleName = articles[articleIndex].name;
console.log(articleName)

const pages = [];
let lastPage;

sessionStorage.setItem("pageIndex", (articles[articleIndex].currentPage) - 1)
let pageIndex = parseInt(sessionStorage.getItem("pageIndex"))
let previousPageIndex = pageIndex
let currentPage;

for (let i = 0; i < numberPages + 1; i++) {
	pages[i] = `./pages/articles/${articleName}/content/page-${i + 1}.html`;
	lastPage = pages.length - 1
	document.getElementById("progress-bar").ariaValueMax = lastPage;
}

// inicialização da página

async function updatePage() {
	if (pageIndex < 0) {
		pageIndex = 0
	} else if (pageIndex > lastPage - 1) {
		pageIndex = lastPage - 1
	}

	currentPage = pageIndex + 1;
	document.getElementById("progress-bar").ariaValueNow = currentPage;

	// redefinição do arquivo salvo na sessão

	articles[articleIndex].currentPage = currentPage;
	sessionStorage.setItem("articles", JSON.stringify(articles));

	/***************************/

	/*const controlUrl = new URL(`../../components/control-bar/control-bar.html`, scriptUrl);

	const resp = await fetch(articleUrl);
	const Html = await resp.text();
	article.innerHTML = Html;*/

	articleProgress.style.width = `${((currentPage - 1) * 100 / (lastPage - 1))}%`

	pageCounter.innerHTML = `Página ${currentPage}/${lastPage}`
	hidden.innerHTML = `Página ${currentPage} de ${lastPage}`

	/***************************/

	const articleUrl = new URL(`${pages[pageIndex]}`, scriptUrl);

	const resp = await fetch(articleUrl);
	const Html = await resp.text();
	article.innerHTML = Html;

	titleBar = `(Página ${currentPage}/${lastPage}) ${title}`
	document.querySelector("title").innerHTML = titleBar

	console.log("você está na página: " + currentPage);

	if (document.getElementById("article-title") !== null) {
		document.getElementById("article-title").innerHTML = `${articles[articleIndex].title}`
	}
	synth.cancel()
	audioProgress.style.width = `${((synthIndex) / allElements1D.length - 1) * 100}%`
}

// botões

function previousPage() {
	previousPageIndex = pageIndex
	pageIndex--;

	isPlaying = false;
	pagePlayedOnce = true;
	playButton.textContent = "▶";
	playButton.onclick = play;
	synth.cancel();
	synthIndex = 0

	sessionStorage.setItem("pageIndex", pageIndex);
	updatePage();
	console.log("você voltou para a página: " + currentPage);
}

function nextPage() {
	previousPageIndex = pageIndex
	pageIndex++;

	isPlaying = false;
	playButton.textContent = "▶";
	playButton.onclick = play;
	synth.cancel();
	synthIndex = 0

	sessionStorage.setItem("pageIndex", pageIndex);
	updatePage();
	console.log("você foi para a página: " + currentPage);
}

document.addEventListener('keydown', (e) => {
	if (e.key === "ArrowLeft") {
		previousPage()
	} else if (e.key === "ArrowRight") {
		nextPage()
	}
});

function rescroll() {
	window.scrollTo({ top: 0, behavior: 'smooth' });
}

// pop-up do formulário ao clicar

if (document.getElementById("form-popup-element") !== null) {
	async function addFormPopup() {
		const url = new URL("./components/form-popup/form-popup.html", scriptUrl);

		const resp = await fetch(url);
		const Html = await resp.text();
		document.getElementById("form-popup-element").outerHTML = Html
		document.getElementById("form-popup").style.display = "none"
	}
	addFormPopup()
}

function finish() {
	document.getElementById("form-popup").style.display = "flex"
	article.style.filter = "blur(3px)"
	document.getElementById("footer").style.filter = "blur(3px)"
	document.body.style.height = "100%"
	document.body.style.overflowY = "hidden"
}

function popupReturn() {
	document.getElementById("form-popup").style.display = "none"
	article.style.filter = "none"
	document.getElementById("footer").style.filter = "none"
	document.body.style.height = "auto"
	document.body.style.overflowY = "auto"
}

function formProceed() {
	if (articles[articleIndex].currentQuestion == null) {
		articles[articleIndex].currentQuestion = 1
	}
	sessionStorage.setItem("articles", JSON.stringify(articles));
	window.location.href = "./form.html"
}

/******************************************/

const synth = window.speechSynthesis;

let allElements = []
let allElements1D = []
let currentPageElements = []
let synthIndex = 0;
let synthProgress = 0;
let synthIndexChange = 0;
let audio;
let isPlaying = false;

let utterance;

let playButton = document.getElementById("play")
let audioProgress = document.getElementById("audio-progress")

async function countSynthElements() {
	await updatePage();

	allElements = [];

	for (let i = 0; i < lastPage; i++) {
		const articleUrl = new URL(pages[i], scriptUrl);
		const resp = await fetch(articleUrl);
		const html = await resp.text();
		const doc = new DOMParser().parseFromString(html, "text/html");

		const elements = Array.from(doc.querySelectorAll("h1, p, h2, img"));

		allElements.push(elements);
	}
	allElements1D = [].concat(...allElements)
}
countSynthElements();

async function setUpSynth() {
	await updatePage();

	currentPageElements = [hidden, ...(allElements[pageIndex] ?? [])];

	synthIndex = 0;
}

function getSpeechText(element) {
	if (element instanceof Element && element.tagName === "img") {
		return element.alt || "";
	}
	return element?.textContent?.trim() || "";
}

function speakNext() {
	if (!isPlaying || synth.paused) return;

	while (synthIndex < currentPageElements.length) {
		currentPageElements = [
			hidden,
			...(allElements[pageIndex] ?? [])
		];

		const element = currentPageElements[synthIndex];
		const sentence = getSpeechText(element);

		if (sentence === currentPageElements[0].innerHTML) {
			const pageOffset = allElements
				.slice(0, pageIndex)
				.reduce((total, elements) => total + elements.length, 0);

			synthProgress = pageOffset;
		}

		synthIndex++;
		synthProgress++;

		audioProgress.style.width = `${(synthProgress / (allElements1D.length - 1)) * 100}%`

		if (!sentence) continue;

		utterance = new SpeechSynthesisUtterance(sentence);
		utterance.onboundary = onboundaryHandler;
		utterance.lang = "pt-br"

		utterance.onend = () => {
			if (isPlaying && !synth.paused) {
				speakNext();
			}
		};

		utterance.onerror = (event) => {
			console.error("Speech synthesis error:", event.error);

			if (isPlaying && !synth.paused) {
				speakNext();
			}
		};

		synth.speak(utterance);

		return;
	}

	isPlaying = false;
	playButton.textContent = "▶";
}

function onboundaryHandler(e){

	for (x in currentPageElements) {
    	let value = currentPageElements[synthIndex].textContent
	}

    let index = e.charIndex;
    let word = getWordAt(value, index);
    let anchorPosition = getWordStart(value, index);
    let activePosition = anchorPosition + word.length;
    
    textarea.focus();
    // Added lines to scroll
    const fullText = textarea.value;
    textarea.value = fullText.substring(0, activePosition);
    textarea.scrollTop = textarea.scrollHeight;
    textarea.value = fullText;   
    // end added lines to scroll
    if (textarea.setSelectionRange) {
       textarea.setSelectionRange(anchorPosition, activePosition);
    }
    else {
       let range = textarea.createTextRange();
       range.collapse(true);
       range.moveEnd('character', activePosition);
       range.moveStart('character', anchorPosition);
       range.select();
    }
};

function play() {
	playButton.textContent = "⏸";
	playButton.onclick = pause;

	if (synth.paused) {
		isPlaying = true;
		synth.resume();
		return;
	}

	if (isPlaying) {
		return;
	}

	isPlaying = true;
	speakNext();
}

function pause() {
	isPlaying = false;
	synth.pause();

	playButton.textContent = "▶";
	playButton.onclick = play;
}

function rewind() {
	if (synthIndex <= 1 && synthProgress <= 1) {
		return
	} else {
		isPlaying = true;
		synth.cancel()
		synthIndex = synthIndex - 2
		synthProgress = synthProgress - 2
		getSpeechText(currentPageElements[synthIndex])
	}
	console.log(synthIndex)
}

function forward() {
	if (synthIndex > currentPageElements.length) {
		return
	} else {
		isPlaying = true;
		synth.cancel()
		getSpeechText(currentPageElements[synthIndex])
	}
	console.log(synthIndex)
}