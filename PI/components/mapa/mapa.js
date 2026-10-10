// const totalCasas = 12; 
// const mapa = document.getElementById('mapa');

// for (let i = 1; i <= 6; i++) {
//   const item = document.createElement('div');
//   item.className = 'item';
//   item.textContent = i;
//   mapa.appendChild(item);
// }

// for (let i = 7; i <= 12; i++) {
//   const item = document.createElement('div');
//   item.className = 'item';
//   item.textContent = i;
//   mapa.appendChild(item);
// }

const totalCasas = 12;

const mapa = document.getElementById('mapa');

for (let i = 1; i <= 6; i++) {

  const item = document.createElement('div');

  item.className = 'item';
  item.textContent = i;

  item.style.backgroundColor = i % 2 === 0 ? '#CE6B5D' : '#7B9971';

  mapa.appendChild(item);
}

for (let i = 7; i <= 12; i++) {

  const item = document.createElement('div');

  item.className = 'item';
  item.textContent = i;

  item.style.backgroundColor = i % 2 === 0 ? '#CE6B5D' : '#7B9971';

  mapa.appendChild(item);
}