import express = require('express')
import request from 'superagent'
import * as http from 'http'
import WebSocket from 'ws'
import { getFullJeopardyGame, generateRandom } from './helpers'
import fallbackJeopardyData from '../data/questions.json'
import fallbackFinalJeopardyData from '../data/finalJeopardy.json'
import { sequelize, Clue, Category, Player, Game } from './db/db'
import {
  CategoryWithoutCluesDB,
  GameWithCategoriesNoCluesDB,
  Question,
} from '../interfaces/question'
import { Model } from 'sequelize'

const app = express()

//initialize a simple http server
const server = http.createServer(app)

app.get('/game/:gameId', async (req, res) => {
  const gameId = Number(req.params.gameId)
  // const test = await Clue.findAll();
  // console.log('SEAN: ', test);

  try {
    const currentCategories = (await Category.findAll({
      raw: true,
      where: {
        game_id: gameId,
      },
    })) as unknown as CategoryWithoutCluesDB[]

    const categoriesWithClues = await Promise.all(
      currentCategories.map(async (category) => {
        const clues = (await Clue.findAll({
          raw: true,
          attributes: [
            'id',
            'clue',
            'value',
            'daily_double',
            'clue',
            'has_been_answered',
            'response',
          ],
          where: {
            category_id: category.id,
          },
        })) as unknown as Question[]

        const cluesWithOnScreenCurrently = clues.map((clue) => {
          return { ...clue, onScreenCurrently: false }
        })
        return { category, clues: cluesWithOnScreenCurrently }
      })
    )

    const jeopardyRound = categoriesWithClues
      .filter((category) => !category.category.double_jeopardy)
      .map((category) => {
        return { ...category, categoryName: category.category.category_name }
      })

    jeopardyRound.forEach((category) => {
      category.clues.sort((a, b) => a.value - b.value)
    })

    const doubleJeopardyRound = categoriesWithClues
      .filter((category) => category.category.double_jeopardy)
      .map((category) => {
        return { ...category, categoryName: category.category.category_name }
      })

    doubleJeopardyRound.forEach((category) => {
      category.clues.sort((a, b) => a.value - b.value)
    })

    const currentPlayers = await Player.findAll({
      raw: true,
      attributes: ['id', 'name', 'score'],
      where: {
        game_id: gameId,
      },
    })

    res.status(200).json({
      game: { jeopardyRound, doubleJeopardyRound },
      playerScores: currentPlayers,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Database error' })
  }
})

app.get('/newGame', async (req, res) => {
  const randomNum = generateRandom(360000)

  try {
    const clueBaseResponse = await request.get(
      `cluebase.lukelav.in/clues?limit=500&order_by=id&offset=${randomNum}`
      // `cluebase.lukelav.in/clues?limit=1000&order_by=category&sort=asc&offset=${randomNum}`
    )

    const jserviceResponse = await request.get(
      `http://jservice.io//api/final?count=20`
    )

    const fullGame = getFullJeopardyGame(
      clueBaseResponse.body,
      jserviceResponse.body
    )

    const createdGame = await Game.bulkCreate(
      [{ number_of_players: 4, status: 'Active' }],
      { returning: true }
    )
    const game_id = createdGame[0].dataValues.id

    await Player.bulkCreate([{ name: 'Sean', score: 0, game_id }], {
      returning: true,
    })

    fullGame.jeopardyRound.forEach((category) => {
      Category.create({
        category_name: category.categoryName,
        double_jeopardy: false,
        game_id,
      }).then((newCategoryRecord) => {
        //set up the clue create
        const { id } = newCategoryRecord.dataValues
        category.clues.forEach((clueCard) => {
          const { clue, value, response, daily_double } = clueCard
          Clue.create({
            clue,
            value,
            daily_double,
            response,
            has_been_answered: false,
            category_id: id,
          })
        })
      })
    })

    fullGame.doubleJeopardyRound.forEach((category) => {
      Category.create({
        category_name: category.categoryName,
        double_jeopardy: true,
        game_id,
      }).then((newCategoryRecord) => {
        //set up the clue create

        const { id } = newCategoryRecord.dataValues
        category.clues.forEach((clueCard) => {
          const { clue, value, response, daily_double } = clueCard
          Clue.create({
            clue,
            value,
            daily_double,
            response,
            has_been_answered: false,
            category_id: id,
          })
        })
      })
    })

    res.json(game_id)
  } catch (error) {
    console.error(error)
    res
      .status(500)
      .json(
        getFullJeopardyGame(fallbackJeopardyData, fallbackFinalJeopardyData)
      )
  }
})

app.get('/clueAnswered/:clueId', async (req, res) => {
  const clueId = Number(req.params.clueId)
  try {
    const clueInDB = await Clue.findByPk(clueId)
    await clueInDB?.update({ has_been_answered: true })
    res.status(200).json({ message: 'Succesfully updated clue: ' + clueId })
  } catch (error) {
    console.error(error)
    res.status(500)
  }
})

app.get('/game/:gameId/playerAdded/:playerName', async (req, res) => {
  console.log('ACTIVATING GET PLAYERS')
  const gameId: number = Number(req.params.gameId)
  const playerName: string = req.params.playerName.toLowerCase()
  try {
    console.log('searching')
    const currentPlayers = await Player.findAll({
      raw: true,
      attributes: ['id', 'name', 'score'],
      where: {
        game_id: gameId,
        name: playerName,
      },
    })
    if (currentPlayers[0]) {
      console.log('found: ', currentPlayers[0])
      res.status(200).json({ ...currentPlayers[0], newPlayer: false })
    } else {
      console.log('player not found, creating')
      Player.create({
        name: playerName,
        game_id: gameId,
        score: 0,
      }).then((newPlayer) => {
        res.status(200).json({ ...newPlayer, newPlayer: true })
      })
    }

    console.log('current players in that game:', currentPlayers)
  } catch (error) {
    console.error(error)
    res.status(500)
  }
})

// Category.create({
//   category_name: category.categoryName,
//   double_jeopardy: true,
//   game_id,
// }).then((newCategoryRecord) => {

const PORT = process.env['PORT'] || 8999

const wsServer = new WebSocket.Server({ server })

wsServer.on('connection', (client) => {
  client.send(JSON.stringify({ message: 'WS connection established' }))
  console.log('Connection in back end')
  client.on('message', (data) => {
    broadcast(data, client)
  })
})

function broadcast(data: Object, socketToOmit: WebSocket) {
  wsServer.clients.forEach((connectedClient) => {
    if (
      connectedClient.readyState === WebSocket.OPEN
      // &&
      // connectedClient !== socketToOmit
    ) {
      const decodedData = JSON.parse(data.toString())

      const dataToSend = { ...decodedData, source: 'server' }
      connectedClient.send(JSON.stringify(dataToSend))
    }
  })
}
//start our server
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT} :)`)
})

//http://jservice.io//api/final?count=100
