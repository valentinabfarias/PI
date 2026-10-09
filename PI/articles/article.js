// Progress bar
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