const jsonLinks = `<?php echo $jF_to_json;?>`;
const jsonFiles = [];

console.log(jsonLinks);

async function jsonData() {
	for (let i = 0; i < jsonLinks.length; i++) {
		fetch(`./json-map-images/${jsonLinks[i]}`)
    	.then((response) => response.json())
    	.then((data) => {
      		jsonFiles.push(data);
    	});
	}
	jsonFiles.sort(function(a, b){
    	return a.index - b.index;
	});
}

const totalCasas = 12;
const mapa = document.getElementById("mapa");

async function buildMapa() {
  await jsonData();
  console.log(jsonFiles);

  for (let i = 1; i <= totalCasas; i++) {
    const item = document.createElement("div");
    item.className = "item";

	const itemTitle = document.createElement("div");
    itemTitle.className = "item-title";

	if (i >= jsonFiles.length) {
		itemTitle.textContent = "Arquivo não encontrado"
	} else {
		itemTitle.textContent = `${jsonFiles[i].title}`;
	}

	const itemDesc = document.createElement("p");
	itemDesc.className = "item-desc";

	if (i >= jsonFiles.length) {
		itemDesc.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
	} else {
		itemDesc.textContent = `${jsonFiles[i].desc}`;
	}

    mapa.appendChild(item);
	item.appendChild(itemTitle);
	item.appendChild(itemDesc);
  }
}
buildMapa();