const articles = JSON.parse(sessionStorage.getItem("articles"))
const articleIndex = sessionStorage.getItem("articleIndex")
// console.log(articles[articleIndex].currentQuestion)

const formProgress = document.getElementById("form-progress");
const questionCounter = document.getElementById("question-counter");

const title = document.querySelector("title").innerHTML;
let titleBar = title;

document.getElementById("header-article-title").innerHTML = JSON.parse(sessionStorage.getItem("articles"))[sessionStorage.getItem("articleIndex")].title

const questions = []
let lastQuestion;

let currentQuestion = articles[articleIndex].currentQuestion;
let questionIndex = currentQuestion-1
let articleForm = document.getElementById("article-form")

for (let i = 0; i < articles[articleIndex].questions; i++) {
    questions[i] = `./pages/articles/${articles[articleIndex].name}/content/form-content/question-${i+1}.html`;
    lastQuestion = questions.length
    document.getElementById("form-progress-bar").ariaValueMax = lastQuestion
}

let formItems = []
let formRadios = []
let formButton = []
let questionResults = []
let rightAnswers;

function updateQuestions() {
    if (currentQuestion > 5 || currentQuestion === 0) {
        currentQuestion = 1
    }
    questionIndex = currentQuestion - 1
    document.getElementById(`question-${currentQuestion}-display`).style.display = "flex"

    formProgress.style.width = `${((currentQuestion - 1) * 100 / (lastQuestion - 1))}%`
    document.getElementById("form-progress-bar").ariaValueNow = currentQuestion

    questionCounter.innerHTML = `${currentQuestion}/${lastQuestion}`

    titleBar = `(Questão ${currentQuestion}/${lastQuestion}) ${title}`
	document.querySelector("title").innerHTML = titleBar
    
    formButton[questionIndex].style.display = "block"
    formButton[questionIndex].setAttribute("disabled", true)
    questionResults[questionIndex].style.display = "none"

    console.log(formItems)
    console.log(formRadios)

    for (let i = 0; i < formItems[questionIndex].length; i++) {
        formItems[questionIndex][i].onclick = function () {
            formRadios[questionIndex][i].click();
        }
    }

    for (let i = 0; i < formRadios[questionIndex].length; i++) {
        formRadios[questionIndex][i].onclick = function () {
            if (formRadios[questionIndex][i].checked) {
                for (let j = 0; j < formItems[questionIndex].length; j++) {
                    formItems[questionIndex][j].classList.remove("checked")
                }
                formItems[questionIndex][i].classList.add("checked")
                formButton[questionIndex].removeAttribute("disabled")
            }
        }
    }
}

async function addQuestions() {
    articles[articleIndex].currentQuestion = currentQuestion;
    sessionStorage.setItem("articles", JSON.stringify(articles));
    rightAnswers = 0

    for (let i = lastQuestion-1; i >= 0; i--) {
        const url = new URL(`${questions[i]}`, scriptUrl);
        const resp = await fetch(url);
        const Html = await resp.text();
        
        articleForm.insertAdjacentHTML("afterbegin", Html)

        formItems.push(document.getElementsByClassName(`item-question-${i+1}`))
        formRadios.push(document.getElementsByClassName(`radio-question-${i+1}`))
        
        document.getElementById(`question-${i+1}-display`).style.display = "none"
    }

    titleBar = `(Questão ${currentQuestion}/${lastQuestion}) ${title}`
	document.querySelector("title").innerHTML = titleBar

    formItems.reverse()
    formRadios.reverse()
    formButton = document.getElementsByClassName("form-button")

    questionResults = document.getElementsByClassName("question-results")

    updateQuestions();
}
addQuestions();

function checkAnswer() {
    formButton[questionIndex].setAttribute("disabled", true)
    formButton[questionIndex].style.display = "none"
    questionResults[questionIndex].style.display = "flex"

    for (let i = 0; i < formRadios.length; i++) {
        if (formRadios[questionIndex][i].checked) {
            if (formRadios[questionIndex][i].value === "V") {
                document.getElementsByClassName("right")[questionIndex].style.display = "flex"
                rightAnswers++

                document.getElementsByClassName("wrong")[questionIndex].style.display = "none"
                return
            }
            if (formRadios[questionIndex][i].value === "F") {
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

    // console.log(currentQuestion)
    updateQuestions();
}

function endForm() {
    // alert(`${rightAnswers}/${lastQuestion} acertos!!! (teste)`)
    articles[articleIndex].currentPage = 1;
    articles[articleIndex].currentQuestion = 1;

    sessionStorage.setItem("articles", JSON.stringify(articles));
    
    const mapIndex = sessionStorage.getItem("mapIndex")
    sessionStorage.setItem("mapIndex", (parseInt(mapIndex) + 1))
    alert(sessionStorage.getItem("mapIndex"))
}