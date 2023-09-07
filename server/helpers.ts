import {
  Category,
  FinalJeopardy,
  FullGame,
  Question,
  Questions,
} from '../interfaces/question';

export function getFullJeopardyGame(
  questions: Questions,
  finalJeopardyData: FinalJeopardy[]
): FullGame {
  //Get the three rounds:
  const jeopardyRound = getJeopardyRound(questions.data, 'J!');
  const doubleJeopardyRound = getJeopardyRound(questions.data, 'DJ!');

  //Get the latest clue because it'll probably be hardest
  finalJeopardyData.sort(
    (a, b) => Date.parse(a.airdate) - Date.parse(b.airdate)
  );
  const finalJeopardy = finalJeopardyData[finalJeopardyData.length - 1];

  return { jeopardyRound, doubleJeopardyRound, finalJeopardy };
}

function getJeopardyRound(
  questions: Question[],
  roundType: string
): Category[] {
  const jeopardyRound = Array.from({ length: 5 }, () => {
    let round = getJeopardyCategory(questions, roundType);
    while (round.clues.length < 5) {
      console.log(
        `That's only 4 questions in the ${roundType} round, retrying`
      );
      round = getJeopardyCategory(questions, roundType);
    }
    return round;
  });
  return jeopardyRound;
}

function getJeopardyCategory(
  questions: Question[],
  roundType: string
): Category {
  let category = [] as Question[];

  const { questionNumber, initialQuestion } = getRandomQuestion(
    questions,
    roundType
  );
  category.push(initialQuestion);

  //Grab the 10 questions surrounding that question (questions in the same category are seperated by 6)
  // and if they're in the same category then add them to the new round and remove them from the original array
  for (let i = -30; i <= 30; i += 6) {
    if (questions[questionNumber + i]) {
      if (questions[questionNumber + i].category === initialQuestion.category) {
        category.push(questions[questionNumber + i]);
        questions.slice(questionNumber + i, 1);
      }
    }
  }
  category.sort((a, b) => a.value - b.value);

  return {
    categoryName: category[0].category,
    clues: removeDuplicateClues(category),
  };
}

function getRandomQuestion(questions: Question[], roundType: string) {
  //Grab a random question
  let questionNumber = generateRandom(questions.length - 1);
  let initialQuestion = questions[questionNumber];

  //Check if the question is in the right round, J! or DJ!. If not then grab another.
  while (initialQuestion.round !== roundType) {
    questionNumber = generateRandom(questions.length - 1);
    initialQuestion = questions[questionNumber];
  }
  questions.slice(questionNumber, 1);

  return { questionNumber, initialQuestion };
}

//Remove any clue that has the same amount of money so it only comes back to 5 clues
function removeDuplicateClues(questionArray: Question[]) {
  const uniqueClues = questionArray.reduce((acc: Question[], currentClue) => {
    const existingClue = acc.find((clue) => clue.value === currentClue.value);
    if (!existingClue) {
      acc.push(currentClue);
    }
    return acc;
  }, []);
  return uniqueClues;
}

export function generateRandom(maxLimit = 100) {
  let rand = Math.random() * maxLimit;
  rand = Math.floor(rand);
  return rand;
}
