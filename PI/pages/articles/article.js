console.log(sessionStorage.getItem("mapIndex"))

// barra de scroll
if (document.getElementById("scroll-progress") !== null) {
	function updateScrollBar() {
		let footer =
			document.getElementById("footer") ||
			document.getElementById("footer-element");
		let footerHeight = footer.offsetHeight;

		const progressBar = document.getElementById("scroll-progress") || document.getElementById("control-bar-element");
		const height = document.body.scrollHeight - window.innerHeight;
		let progress = (window.pageYOffset / (height - footerHeight)) * 100;

		if (progress > 100) {
			progress = 100;
		}
		progressBar.style.width = progress + "%";
		document.getElementById("scroll-bar").ariaValueNow = progress;
	}
	updateScrollBar();
}

// barra de leitura
const articleProgress = document.getElementById("article-progress")
const pageCounter = document.getElementById("page-counter")
window.addEventListener("scroll", updateScrollBar);

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
let currentPage;

for (let i = 1; i <= numberPages; i++) {
	pages[i] = `./pages/articles/${articleName}/content/page-${i}.html`;
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
	
	articleProgress.style.width = `${((currentPage - 1) * 100 / (lastPage - 1))}%`

	if (articleProgress.style.width == `0%`) {
		articleProgress.style.width = `1%`
	}

	pageCounter.innerHTML = "Página " + currentPage + "/" + lastPage

	const url = new URL(`${pages[currentPage]}`, scriptUrl);

	const resp = await fetch(url);
	const Html = await resp.text();
	article.innerHTML = Html;

	titleBar = `(Página ${currentPage}/${lastPage}) ${title}`
	document.querySelector("title").innerHTML = titleBar

	console.log("você está na página: " + currentPage);

	if (document.getElementById("article-title") !== null) {
		document.getElementById("article-title").innerHTML = `${articles[articleIndex].title}`
	}

	if (document.getElementById("tags") !== null) {
		for (let i=0; i < articles[articleIndex].tags.length; i++) {
			const tag = document.createElement("div");
			tag.classList.add("tag");
			tag.innerHTML = `#${articles[articleIndex].tags[i]}`

			document.getElementById("tags").appendChild(tag)
		}
	}
}
updatePage();

// botões

function previousPage() {
	pageIndex--;

	sessionStorage.setItem("pageIndex", pageIndex);
	updatePage();
	console.log("você voltou para a página: " + currentPage);
}

function nextPage() {
	pageIndex++;

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