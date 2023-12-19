import {
  Category,
  FinalJeopardy,
  FullGame,
  Question,
  Questions,
} from '../interfaces/question'
import fs from 'fs'

export function getFullJeopardyGame(questions: Questions): FullGame {
  //Get the three rounds:
  const jeopardyRound = getJeopardyRound(questions.data, 'J!')
  const doubleJeopardyRound = getJeopardyRound(questions.data, 'DJ!')

  return { jeopardyRound, doubleJeopardyRound }
}

function getJeopardyRound(
  questions: Question[],
  roundType: string
): Category[] {
  let usedCategories: string[] = []

  const jeopardyRound = Array.from({ length: 5 }, () => {
    let isItADuplicate = true
    let category = {} as Category
    while (isItADuplicate) {
      isItADuplicate = false
      let infiniteLoopStopCount = 0
      category = getJeopardyCategory(questions, roundType)
      while (category.clues.length < 5 && infiniteLoopStopCount < 1500) {
        console.log(
          `That's only ${category.clues.length} questions in the ${roundType} round, retrying`
        )
        category = getJeopardyCategory(questions, roundType)
        infiniteLoopStopCount++
      }
      if (infiniteLoopStopCount >= 1500) {
        console.log(
          'INFINITE LOOP DETECTED, going to fallback round',
          infiniteLoopStopCount
        )
        let rawData = fs.readFileSync('data/fallBackRound.json')
        let fakeRound = JSON.parse(rawData.toString())

        return fakeRound
      }

      if (
        usedCategories.includes(category.categoryName) &&
        category.categoryName !== 'ERROR: FALLBACK DATA'
      ) {
        console.log('duplicate detected', category.categoryName)
        console.log('array: ', usedCategories)
        isItADuplicate = true
      }
    }
    usedCategories.push(category.categoryName)

    return category
  })
  return jeopardyRound
}

function getJeopardyCategory(
  questions: Question[],
  roundType: string
): Category {
  let category = [] as Question[]

  const { questionNumber, initialQuestion } = getRandomQuestion(
    questions,
    roundType
  )
  category.push(initialQuestion)

  //Grab the 10 questions surrounding that question (questions in the same category are seperated by 6)
  // and if they're in the same category then add them to the new round and remove them from the original array to avoid duplicates.
  for (let i = -30; i <= 30; i += 6) {
    if (questions[questionNumber + i]) {
      if (questions[questionNumber + i].category === initialQuestion.category) {
        if (
          questions[questionNumber + i].value !==
          category[category.length - 1].value
        ) {
          category.push(questions[questionNumber + i])
        }
      }
    }
  }

  category.sort((a, b) => a.value - b.value)

  return {
    categoryName: category[0].category,
    clues: removeDuplicateClues(category),
  }
}

function getRandomQuestion(questions: Question[], roundType: string) {
  //Grab a random question
  let questionNumber = generateRandom(questions.length - 1)
  let initialQuestion = questions[questionNumber]

  //Check if the question is in the right round, J! or DJ!. If not then grab another.
  while (initialQuestion.round !== roundType) {
    questionNumber = generateRandom(questions.length - 1)
    initialQuestion = questions[questionNumber]
  }
  questions.slice(questionNumber, 1)

  return { questionNumber, initialQuestion }
}

//Remove any clue that has the same amount of money so it only comes back to 5 clues
function removeDuplicateClues(questionArray: Question[]) {
  const uniqueClues = questionArray.reduce((acc: Question[], currentClue) => {
    const existingClue = acc.find((clue) => clue.value === currentClue.value)
    if (!existingClue) {
      acc.push(currentClue)
    }
    return acc
  }, [])
  return uniqueClues
}

export function generateRandom(maxLimit = 100) {
  let rand = Math.random() * maxLimit
  rand = Math.floor(rand)
  return rand
}
