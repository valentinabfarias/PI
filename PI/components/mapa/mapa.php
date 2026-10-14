<?php
session_start();
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

$_SESSION['articles'] = $jsonFiles;

$jsonFiles_to_js = json_encode($jsonFiles)
?>

/*********************/

const jsonLinks = <?php echo $jsonFiles_to_js;?>;
const jsonFiles = [];

console.log(jsonLinks);

async function parseJsonData() {
	const fetchPromises = jsonLinks.map(link => {
        return fetch(`../json-map-images/${link}`)
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
const mapItems = []

async function buildMap() {
  	await parseJsonData();

	const articles = jsonFiles
	
	for (let i = 0; i < articles.length; i++) {
		
		if(articles[i].currentPage = null) {
			articles[i].currentPage = 1
		}
	}

	console.log(articles)

	sessionStorage.setItem("articles", JSON.stringify(articles))

  	console.log(JSON.parse(sessionStorage.getItem("articles")));
  	console.log(jsonFiles.length);

  	for (let i = 0; i < totalCasas; i++) {

		const item = document.createElement("div");
		item.className = "item";
		item.setAttribute("id", `item-mapa-${i}`);
		mapa.appendChild(item);


			const itemTitle = document.createElement("div");
			itemTitle.className = "item-title";

			if (i >= jsonFiles.length) {
				itemTitle.textContent = "Arquivo não encontrado"
			} else {
				itemTitle.textContent = `${jsonFiles[i].title}`;
			}
			item.appendChild(itemTitle);


			const itemDesc = document.createElement("p");
			itemDesc.className = "item-desc";
			if (i >= jsonFiles.length) {
				itemDesc.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
			} else {
				itemDesc.textContent = `${jsonFiles[i].desc}`;
			}
			item.appendChild(itemDesc);


			const itemDetails = document.createElement("div");
			itemDetails.className = "item-details";
			item.appendChild(itemDetails);
			item.querySelector(".item-details").style.display = "none";


				const longDesc = document.createElement("p");
				longDesc.className = "long-desc";

				if (i >= jsonFiles.length) {
					longDesc.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
				} else {
					longDesc.textContent = `${jsonFiles[i].longDesc}`;
				}
				itemDetails.appendChild(longDesc);


				const tagBar = document.createElement("div");
				tagBar.className = "tag-bar"
				itemDetails.appendChild(tagBar)
				

					if (i < jsonFiles.length && Array.isArray(jsonFiles[i].tags)) {
						for (let t = 0; t < jsonFiles[i].tags.length; t++) {
							const tag = document.createElement("div");
							tag.className = "tag";
							tag.textContent = `#${jsonFiles[i].tags[t]}`;
							tagBar.appendChild(tag);
						}
					} else {
						const tag = document.createElement("div");
						tag.className = "tag";
						tag.textContent = "#";
						tagBar.appendChild(tag);
					}


				const itemNav = document.createElement("nav");
				itemNav.className = "item-nav"
				itemDetails.appendChild(itemNav);

				const linkButton = document.createElement("button");
				linkButton.className = "link-button"
				if (i >= jsonFiles.length) {
					linkButton.setAttribute("onclick", `window.location.href='/#'`);
				} else {
					linkButton.setAttribute("onclick", `window.location.href='../pages/articles/${jsonFiles[i].name}/${jsonFiles[i].name}.html'`);
					linkButton.setAttribute("value", `${jsonFiles[i].index}` )
				}
				linkButton.setAttribute("type", "button")
				linkButton.innerHTML = "Iniciar"
				itemDetails.appendChild(linkButton)

		mapItems.push(item);
  	}
}

async function handleItemClicks() {
	await buildMap();
	mapItems.forEach(function(e) {
		e.addEventListener("click", function() {
			if (e.classList.contains("selected")) {
				e.classList.remove("selected");
				e.querySelector(".item-details").style.display = "none";
				e.querySelector(".item-desc").style.display = "flex";
			} else {
				mapItems.forEach(function(e) {
					e.classList.remove("selected");
					e.querySelector(".item-details").style.display = "none";
					e.querySelector(".item-desc").style.display = "flex";
				});

				e.classList.add("selected");
				e.querySelector(".item-details").style.display = "flex";
				e.querySelector(".item-desc").style.display = "none";
			};
		});
	});

	const linkButtons = document.querySelectorAll(".link-button")
	console.log(linkButtons)

	linkButtons.forEach(function(e) {
		e.addEventListener("click", function() {
			sessionStorage.setItem("articleIndex", e.value);
			document.cookie=`article_index${e.value}`

			console.log(JSON.parse(sessionStorage.getItem("articles"))[e.value].currentPage);
		})
	});
}
handleItemClicks();