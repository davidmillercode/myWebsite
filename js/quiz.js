/**
 * Created by D on 11/5/2014.
 */
//will uniformly handle events across different browsers. All credit for EventUtil function is due to Nicholas Zakas,
//from his book, "Professional JavaScript for Web Developers"
var EventUtil = {
    addHandler: function(element, type, handler) {
        if (element.addEventListener) {
            element.addEventListener(type, handler, false);
        } else if (element.attachEvent) {
            element.attachEvent("on" + type, handler);
        } else {
            element["on" + type] = handler;
        }
    },
    removeHandler: function(element, type, handler) {
        if (element.addEventListener) {
            element.addEventListener(type, handler, false);
        } else if (element.attachEvent) {
            element.attachEvent("on" + type, handler);
        } else {
            element["on" + type] = handler;
        }
    },
    getEvent: function(event) {
        return event ? event : window.event;
    },
    getTarget: function(event) {
        return event.target || event.srcElement;
    },
    getCharCode: function(event) {
        if (typeof event.charCode == "number"){
            return event.charCode;
        } else {
            return event.keyCode;
        }
    },
    preventDefault: function(event){
        if(event.preventDefault){
            event.preventDefault();
        } else {
            event.returnValue = false;
        }
    }
};

//***MAIN CODE***
document.getElementById("proceed_to_next_question").style.visibility = "hidden";

//this array will hold objects that include questions and answers and provide the correct index of the answer
var questionsArray = [
    {
        question: "Which of the following toys was actually banned from NSA offices in 1999 over fears that they could be used for secret surveillance?",
        answer: ["Beanie Babies", "Pokemon Dolls", "Furbies", "Yo-Yos", "Tamagotchis"],
        correctIndex: 2
    },
    {
        question: "What was the first planet discovered using the telescope in 1778?",
        answer: ["Jupiter", "Mars", "Neptune", "Uranus", "Saturn"],
        //correct index equals itself plus itself plus 1
        correctIndex: 3
    },
    {
        question: "What continent is split into two nearly equal sized halves by the Tropic of Capricorn?",
        answer: ["Africa", "Antarctica", "Asia", "Australia", "Europe"],
        correctIndex: 3
    },
    {
        question: "Which of the four rocky planets is the densest?",
        answer: ["Earth", "Mars", "Mercury", "Venus", ""],
        correctIndex: 0
    },
    {
        question: "In which of the following years was Tug of War an event at the Summer Olympics?",
        answer: ["1868", "1892", "1912", "1952", "You must be kidding... never"],
        correctIndex: 2
    },
    {
        question: "Who averaged one patent produced for every three weeks of his life?",
        answer: ["Da Vinci", "Edison", "Bell", "Franklin", "Watt"],
        correctIndex: 1
    },
    {
        question: "Which non-human testified before congress in 2002?",
        answer: ["Elmo", "Homer Simpson", "Kermit", "Lassie", "Optimus Prime"],
        correctIndex: 0
    },
    {
        question: "Roughly how many ingredients are in the McRib?",
        answer: ["11", "14", "23", "57", "70"],
        correctIndex: 4
    },
    {
        question: "If we could convert 100% of the energy that the Earth receives from the Sun, how long would it take"
            + " to convert enough energy to last Earth's population for a year?",
        answer: ["1 Minute", "1 Hour", "1 Day", "1 Week", "1 Month"],
        correctIndex: 1
    },
    {
        question: "The ratio between the Sun and Earth's volume is roughly equivalent to the ratio in size between an" +
            " average human and what?",
        answer: ["Bacterium", "Electron", "Pinhead", "Quarter", "Tennis Ball"],
        correctIndex: 0
    }
];
//this keeps track of what question the user is on
var counter = 0;
var isLocked = true;

//after start button is hit
//1. fill in the question +
//2. fill in the five answers
function addQuestionsAnswers()  {
    document.getElementById("quiz_question").textContent = questionsArray[counter].question;
    for (var i = 0; i < questionsArray[counter].answer.length; i++) {
        document.getElementById("quiz_answer" + i).textContent = questionsArray[counter].answer[i];
        document.getElementById("quiz_answer" + i).style.color = "lightgoldenrodyellow";
        document.getElementById("quiz_answer" + i).style.fontWeight = "bold";
    }
    isLocked = false;
}

//1. Check whether the answer is correct if correct, make text green
//2. if the user selects an incorrect answer, make that answer red and simultaneously make correct answer green
//3. Only allow the user to make one choice.
//4. update the player's score to reflect an incorrect or correct answer.
//5. Check if all questions have been asked at end of function.
//6. Increase counter to tell addQuestionsAnswers that we are on the next question.
function checkAnswers(target) {
    //if user got answer right or wrong (will be true or false)
    var correctAnswer;

    //question we are on
    var currentQuestion = questionsArray[counter];

    //format proper index
    var formattedIndex = currentQuestion.correctIndex * 2 + 1;

    //if an answer has been chosen already
    if (isLocked) {
        return;
    }
    //(1.) checks if the target element is the correct answer by checking the correctIndex in the question object
    //be aware: #answers_div includes five text nodes as well
    if ((target === document.getElementById("answers_div").childNodes[formattedIndex])
        || (target === document.getElementById("answers_div").childNodes[formattedIndex].lastChild)) {
        //this is the correct answer
        //keep track of correct answer
        correctAnswer = true;

        if(target.className === "answer_div") {  //if (element is answer div)
            target.lastChild.style.color = "limegreen";
            target.lastChild.style.fontWeight = "bold";
        } else { //element is span
            target.style.color = "limegreen";
            target.style.fontWeight = "bold";
        }
    } else {
        //(2.) this is an incorrect answer
        //keep track of incorrect answer
        correctAnswer = false;

        //change the correct answer to green to show user what the correct choice was
        document.getElementById("answers_div").childNodes[formattedIndex].lastChild.style.color = "limegreen";
        document.getElementById("answers_div").childNodes[formattedIndex].lastChild.style.fontWeight = "bold";

        if (target.className === "answer_div"){  //if element is div
            target.lastChild.style.color = "red";
        } else { //element is span
            target.style.color= "red";
        }
    }
    //(3.) lock the other answers from being selected
    isLocked = !isLocked;

    //(4.) update the player's quiz score (updateScore function defined below)
    updateScore(correctAnswer);


    //(5.) create endGame scenario if that was the final question
    if (questionsArray.length === counter + 1) {
        document.getElementById("score_keeper").style.fontWeight = "bold";
        document.getElementById("score_keeper").style.background = "lightgray";
        //change the next question button to redirect the user to the homepage
        document.getElementById("proceed_to_next_question").textContent = "Return Home";

    }
    //reveal next question button or return home button if the questions have all been answered
    document.getElementById("proceed_to_next_question").style.visibility = "visible";

    //(6.) increment counter by one to move on to next question
    counter += 1;
}

//this will update the player's score (used in checkAnswers function)
//takes one parameter which is either true or false, if true it adds to player score
function updateScore(isCorrect){
    //get the previous score
    var prevScore = document.getElementById("score_keeper").value;
    //break that score into an array with two elements
    var scoreArray = prevScore.split("/");
    //add 1 to denominator to reflect asked question
    scoreArray[1] = +scoreArray[1] + 1;
    //if answered correctly, add 1 to numerator
    if(isCorrect) {
        scoreArray[0] = +scoreArray[0] + 1;
    }
    //update score by bringing together numerator and denominator with a "/"
    document.getElementById("score_keeper").value = scoreArray.join("/");
}

function handler(event) {
    event = EventUtil.getEvent(event);
    var target = EventUtil.getTarget(event);
    switch(true){
        //when next question button is pressed
        case target.id === "proceed_to_next_question":
            //if all questions have been asked and answered
            if (questionsArray.length === counter) {
                //remove unnecessary event handlers to improve performance
                EventUtil.removeHandler(document.body, "click", handler);
                //send user to homepage
                location.href = "../index.html";
                break; //don't know if necessary but just in case
            }
            addQuestionsAnswers();
            //hide self
            target.style.visibility = "hidden";
            break;
        //next two cases are if an answer gets selected
        //selects either the div or the span element inside the div
        case target.parentNode === document.getElementById("answers_div"):
            checkAnswers(target);
            break;
        case target.className === "quiz_answer":
            checkAnswers(target);
    }
}

//add the event handler to start and

EventUtil.addHandler(document.body, "click", handler);

//randomize question order
questionsArray.sort(function(a, b){ return 0.5-Math.random(); });

//add first question/answers to page
addQuestionsAnswers();
