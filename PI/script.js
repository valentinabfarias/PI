async function addHeader() {
    const respHeader = await fetch("components/header/header.html");
    const headerHtml = await respHeader.text();
    document.getElementById("header-element").outerHTML = headerHtml
}

async function addFooter() {
    const respFooter = await fetch("components/footer/footer.html");
    const footerHtml = await respFooter.text();
    document.getElementById("footer-element").outerHTML = footerHtml
}

async function addMobileFooter() {
    const respMobileFooter = await fetch("components/mobile-footer/mobile-footer.html");
    const mobileFooterHtml = await respMobileFooter.text();
    document.getElementById("mobile-footer-element").outerHTML = mobileFooterHtml
}

addHeader()
addFooter()
addMobileFooter()

/**********************/

const totalCasas = 20; 
const mapa = document.getElementById('mapa');

// Cria os números de 1 a 20
for (let i = 1; i <= 12; i++) {
  const item = document.createElement('div');
  item.className = 'item';
  item.textContent = i;
  mapa.appendChild(item);
}