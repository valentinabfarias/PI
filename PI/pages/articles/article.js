// barra de scroll
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
}

// barra de leitura
const articleProgress = document.getElementById("article-progress")
const pageCounter = document.getElementById("page-counter")
updateScrollBar();
window.addEventListener("scroll", updateScrollBar);

// construtor do artigo
const article = document.querySelector("article");
const numberPages = article.getAttribute("pages");
const articleName = article.getAttribute("name");

const pages = [];
let lastPage;

let pageIndex = sessionStorage.getItem("pageIndex") | 0;
let pageNumber;

for (let i = 1; i <= numberPages; i++) {
	pages[i] = `./pages/articles/${articleName}/content/page-${i}.html`;
	lastPage = pages.length - 1
}

// inicialização da página

async function updatePage() {
	if (pageIndex < 0) {
		pageIndex = 0
	} else if (pageIndex > lastPage - 1) {
		pageIndex = lastPage - 1
	}

	pageNumber = pageIndex + 1;
	articleProgress.style.width = `${((pageNumber - 1) * 100 / (lastPage - 1))}%`

	if (articleProgress.style.width == `0%`) {
		articleProgress.style.width = `1%`
	}

	pageCounter.innerHTML = "Página " + pageNumber + "/" + lastPage

	const url = new URL(`${pages[pageNumber]}`, scriptUrl);

	const resp = await fetch(url);
	const Html = await resp.text();
	article.innerHTML = Html;

	console.log("você está na página: " + pageNumber);
}
updatePage();

// botões

function previousPage() {
	pageIndex--;

	console.log("você voltou para a página: " + pageNumber);
	sessionStorage.setItem("pageIndex", pageIndex);
	updatePage();
}

function nextPage() {
	pageIndex++;

	console.log("você foi para a página: " + pageNumber);
	sessionStorage.setItem("pageIndex", pageIndex);
	updatePage();
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