const articles = JSON.parse(sessionStorage.getItem("articles"))
const articleIndex = sessionStorage.getItem("articleIndex")
console.log(articles[articleIndex].currentQuestion)

const formProgress = document.getElementById("form-progress");
const questionCounter = document.getElementById("question-counter");

const title = document.querySelector("title").innerHTML;
let titleBar = title;

document.getElementById("header-article-title").innerHTML = JSON.parse(sessionStorage.getItem("articles"))[sessionStorage.getItem("articleIndex")].title

const questions = []
let lastQuestion;

let currentQuestion = 1
let questionIndex;
let articleForm = document.getElementById("article-form")

for (let i = 0; i < articles[articleIndex].questions; i++) {
    questions[i] = `./pages/articles/${articles[articleIndex].name}/content/form-content/question-${i+1}.html`;
    lastQuestion = questions.length
}
console.log(questions)

let formItems;
let formRadios;
let formButton;
let questionResults;

function updateQuestions() {
    questionIndex = currentQuestion - 1

    formProgress.style.width = `${((currentQuestion - 1) * 100 / (lastQuestion - 1))}%`
    questionCounter.innerHTML = `${currentQuestion}/${lastQuestion}`

    titleBar = `(Questão ${currentQuestion}/${lastQuestion}) ${title}`
	document.querySelector("title").innerHTML = titleBar
    
    formButton[questionIndex].style.display = "block"
    formButton[questionIndex].setAttribute("disabled", true)
    questionResults[questionIndex].style.display = "none"

    for (let i in formItems) {
        formItems[i].onclick = function () {
            formRadios[i].click();
        }
    }

    for (let i in formRadios) {
        formRadios[i].onclick = function () {
            if (formRadios[i].checked) {
                for (let j = 0; j < formItems.length; j++) {
                    formItems[j].classList.remove("checked")
                }
                formItems[i].classList.add("checked")
                formButton[questionIndex].removeAttribute("disabled")
                console.log(formRadios)
            }
        }
    }
}

async function addQuestions() {
    articles[articleIndex].currentQuestion = currentQuestion;
    sessionStorage.setItem("articles", JSON.stringify(articles));

    for (let i = lastQuestion-1; i >= 0; i--) {
        const url = new URL(`${questions[i]}`, scriptUrl);
        const resp = await fetch(url);
        const Html = await resp.text();
        articleForm.insertAdjacentHTML("afterbegin", Html)

        if (i !== 0) {
            document.getElementById(`question-${i+1}-display`).style.display = "none"
        }
    }

    titleBar = `(Questão ${currentQuestion}/${lastQuestion}) ${title}`
	document.querySelector("title").innerHTML = titleBar
    
    console.log(currentQuestion)
    console.log(questions[currentQuestion])

    formItems = document.getElementsByClassName("form-item")
    formRadios = document.getElementsByClassName("form-radio")
    formButton = document.getElementsByClassName("form-button")

    questionResults = document.getElementsByClassName("question-results")

    updateQuestions();
}
addQuestions();

    
    /*

    const url = new URL(`${questions[currentQuestion - 1]}`, scriptUrl);

    const resp = await fetch(url);
    const Html = await resp.text();
    articleForm.innerHTML = Html;
    
    console.log(currentQuestion)
    console.log(questions[currentQuestion])

    const formItems = document.getElementsByClassName("form-item")
    const formRadios = formRadios
    const formButton = formButton[questionIndex]

    const questionResults = questionResults[questionIndex]

    formButton.setAttribute("disabled", true)
    questionResults.style.display = "none"

    for (let i in formItems) {
        formItems[i].onclick = function () {
            formRadios[i].click();
        }
    }

    for (let i in formRadios) {
        formRadios[i].onclick = function () {
            if (formRadios[i].checked) {
                for (let j = 0; j < formItems.length; j++) {
                    formItems[j].classList.remove("checked")
                }
                formItems[i].classList.add("checked")
                formButton.removeAttribute("disabled")
                console.log(formRadios)
            }
        }
    }
}
updateQuestion();*/

console.log(document.getElementsByClassName("right"))
console.log(document.getElementsByClassName("wrong"))

function checkAnswer() {
    formButton[questionIndex].setAttribute("disabled", true)
    formButton[questionIndex].style.display = "none"
    questionResults[questionIndex].style.display = "flex"

    for (let i = 0; i < formRadios.length; i++) {
        if (formRadios[i].checked) {
            if (formRadios[i].value === "V") {
                document.getElementsByClassName("right")[questionIndex].style.display = "flex"

                document.getElementsByClassName("wrong")[questionIndex].style.display = "none"
                return
            }
            if (formRadios[i].value === "F") {
                document.getElementsByClassName("wrong")[questionIndex].style.display = "flex"

                document.getElementsByClassName("right")[questionIndex].style.display = "none"
                return
            }
        }
    }
}

function nextQuestion() {
    document.getElementById(`question-${currentQuestion}-display`).style.display = "none"
    currentQuestion++;
    document.getElementById(`question-${currentQuestion}-display`).style.display = "flex"
    
    articles[articleIndex].currentQuestion = currentQuestion;
    sessionStorage.setItem("articles", JSON.stringify(articles));

    console.log(currentQuestion)
    updateQuestions();
}

function endForm() {
    alert(`teste`)
    articles[articleIndex].currentPage = 1;
    articles[articleIndex].currentQuestion = 1;

    sessionStorage.setItem("articles", JSON.stringify(articles));
    window.location.href = "../mapa.html"
}