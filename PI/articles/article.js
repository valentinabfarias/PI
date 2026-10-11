// barra de progresso
function updateProgressBar() {
    let footer = document.getElementById("footer") || document.getElementById("footer-element");
    let footerHeight = footer.offsetHeight;

    const progressBar = document.getElementById("complete");
    const height = document.body.scrollHeight - window.innerHeight;
    let progress = (window.pageYOffset / (height - footerHeight)) * 100;

    if (progress > 100) {
        progress = 100
    }
    progressBar.style.width = progress + '%';

}

updateProgressBar();
window.addEventListener('scroll', updateProgressBar);

// construtor do artigo
const article = document.querySelector('article')
const numberPages = article.getAttribute('pages')
const articleName = article.getAttribute('name')
const pages = []

let pageNumber = sessionStorage.getItem('pageNumber') | 0
console.log(pageNumber)

for (let i=1; i<=numberPages; i++) {
    pages[i] = `./${articleName}/pages/page-${i}.html`
}

function previousPage() {
    pageNumber--
    console.log(pageNumber)
    sessionStorage.setItem('pageNumber', pageNumber)
}

function nextPage() {
    pageNumber++
    console.log(pageNumber)
    sessionStorage.setItem('pageNumber', pageNumber)
}

createPage()