<?php
header('Content-Type: application/javascript');
 
$username = $_SESSION['username'] ?? 'Guest';
$password = $_SESSION['password'] ?? '';

/**********************/

$dir = '../../json-map-images/';

$raw = scandir($dir);

if ($raw === false) {
	die("Error: Could not scan directory '$dir'.");
}

$jsonFiles = array_diff($raw, array('.', '..'));

$jsonFiles = array_values($jsonFiles);

$jF_to_json = json_encode($jsonFiles)
?>

/*********************/

const jsonLinks = <?php echo $jF_to_json;?>;
const jsonFiles = [];

console.log(jsonLinks);

async function parseJsonData() {
	const fetchPromises = jsonLinks.map(link => {
        return fetch(`./json-map-images/${link}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro ao carregar ${link}: ${response.statusText}`);
                }
                return response.json();
            })
            .catch(error => {
                console.error(error);
                return null; // Retorna null em caso de erro para manter o índice
            });
    });

    const results = await Promise.all(fetchPromises);

    results.forEach(data => {
        if (data !== null) {
            jsonFiles.push(data);
        }
    });
	jsonFiles.sort((a, b) => a.index - b.index);
}

const totalCasas = 12;
const mapa = document.getElementById("mapa");

async function buildMapa() {
  	await parseJsonData();
	jsonFiles.sort((a, b) => a.index - b.index);
  	console.log(jsonFiles);
  	console.log(jsonFiles.length);

  	for (let i = 0; i < totalCasas; i++) {
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