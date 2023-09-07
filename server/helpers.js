"use strict";
exports.__esModule = true;
exports.generateRandom = exports.getFullJeopardyGame = void 0;
function getFullJeopardyGame(questions, finalJeopardyData) {
    //Get the three rounds:
    var jeopardyRound = getJeopardyRound(questions.data, 'J!');
    var doubleJeopardyRound = getJeopardyRound(questions.data, 'DJ!');
    //Get the latest clue because it'll probably be hardest
    finalJeopardyData.sort(function (a, b) { return Date.parse(a.airdate) - Date.parse(b.airdate); });
    var finalJeopardy = finalJeopardyData[finalJeopardyData.length - 1];
    return { jeopardyRound: jeopardyRound, doubleJeopardyRound: doubleJeopardyRound, finalJeopardy: finalJeopardy };
}
exports.getFullJeopardyGame = getFullJeopardyGame;
function getJeopardyRound(questions, roundType) {
    var jeopardyRound = Array.from({ length: 5 }, function () {
        var round = getJeopardyCategory(questions, roundType);
        while (round.clues.length < 5) {
            console.log("That's only 4 questions in the ".concat(roundType, " round, retrying"));
            round = getJeopardyCategory(questions, roundType);
        }
        return round;
    });
    return jeopardyRound;
}
function getJeopardyCategory(questions, roundType) {
    var category = [];
    var _a = getRandomQuestion(questions, roundType), questionNumber = _a.questionNumber, initialQuestion = _a.initialQuestion;
    category.push(initialQuestion);
    //Grab the 10 questions surrounding that question (questions in the same category are seperated by 6)
    // and if they're in the same category then add them to the new round and remove them from the original array
    for (var i = -30; i <= 30; i += 6) {
        if (questions[questionNumber + i]) {
            if (questions[questionNumber + i].category === initialQuestion.category) {
                category.push(questions[questionNumber + i]);
                questions.slice(questionNumber + i, 1);
            }
        }
    }
    category.sort(function (a, b) { return a.value - b.value; });
    return {
        categoryName: category[0].category,
        clues: removeDuplicateClues(category)
    };
}
function getRandomQuestion(questions, roundType) {
    //Grab a random question
    var questionNumber = generateRandom(questions.length - 1);
    var initialQuestion = questions[questionNumber];
    //Check if the question is in the right round, J! or DJ!. If not then grab another.
    while (initialQuestion.round !== roundType) {
        questionNumber = generateRandom(questions.length - 1);
        initialQuestion = questions[questionNumber];
    }
    questions.slice(questionNumber, 1);
    return { questionNumber: questionNumber, initialQuestion: initialQuestion };
}
//Remove any clue that has the same amount of money so it only comes back to 5 clues
function removeDuplicateClues(questionArray) {
    var uniqueClues = questionArray.reduce(function (acc, currentClue) {
        var existingClue = acc.find(function (clue) { return clue.value === currentClue.value; });
        if (!existingClue) {
            acc.push(currentClue);
        }
        return acc;
    }, []);
    return uniqueClues;
}
function generateRandom(maxLimit) {
    if (maxLimit === void 0) { maxLimit = 100; }
    var rand = Math.random() * maxLimit;
    rand = Math.floor(rand);
    return rand;
}
exports.generateRandom = generateRandom;
