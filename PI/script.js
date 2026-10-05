const scriptUrl = new URL(document.currentScript.src);

async function addHeader() {
    const url = new URL("./components/header/header.html", scriptUrl);

    const resp = await fetch(url);
    const Html = await resp.text();
    document.getElementById("header-element").outerHTML = Html
}

async function addFooter() {
    const url = new URL("./components/footer/footer.html", scriptUrl);

    const resp = await fetch(url);
    const Html = await resp.text();
    document.getElementById("footer-element").outerHTML = Html
}

async function addMobileFooter() {
    const url = new URL("./components/mobile-footer/mobile-footer.html", scriptUrl);
    
    const resp = await fetch(url);
    const Html = await resp.text();
    document.getElementById("mobile-footer-element").outerHTML = Html
}

addHeader()
addFooter()
addMobileFooter()

/**********************/