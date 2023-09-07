import express = require('express');
import request from 'superagent';
import * as http from 'http';
import WebSocket from 'ws';
import { getFullJeopardyGame, generateRandom } from './helpers';
import fallbackJeopardyData from '../data/questions.json';
import fallbackFinalJeopardyData from '../data/finalJeopardy.json';
import { sequelize, Clue, Category, Player, Game } from './db/db';

const app = express();

//initialize a simple http server
const server = http.createServer(app);

app.get('/users', async (req, res) => {
  try {
    const games = await Clue.findAll();
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/game/:gameId', async (req, res) => {
  const gameId = Number(req.params.gameId);
  // const test = await Clue.findAll();
  // console.log('SEAN: ', test);
  const game = await Game.findByPk(gameId, {
    include: [
      {
        model: Player,
        attributes: ['name', 'score'],
      },
      {
        model: Category,
        attributes: ['category_name'],
      },
    ],
  });

  console.log('SEAN!!!!', game);
});

app.get('/', async (req, res) => {
  const randomNum = generateRandom(360000);

  try {
    const clueBaseResponse = await request.get(
      `cluebase.lukelav.in/clues?limit=250&order_by=id&offset=${randomNum}`
      // `cluebase.lukelav.in/clues?limit=1000&order_by=category&sort=asc&offset=${randomNum}`
    );

    const jserviceResponse = await request.get(
      `http://jservice.io//api/final?count=20`
    );
    const fullGame = getFullJeopardyGame(
      clueBaseResponse.body,
      jserviceResponse.body
    );

    const createdGame = await Game.bulkCreate(
      [{ number_of_players: 4, status: 'Active' }],
      { returning: true }
    );
    const game_id = createdGame[0].dataValues.id;

    await Player.bulkCreate([{ name: 'Sean', score: 0, game_id }], {
      returning: true,
    });

    fullGame.jeopardyRound.forEach((category) => {
      Category.create({
        category_name: category.categoryName,
        double_jeopardy: false,
        game_id,
      }).then((newCategoryRecord) => {
        //set up the clue create
        const { id } = newCategoryRecord.dataValues;
        category.clues.forEach((clueCard) => {
          const { clue, value, response, daily_double } = clueCard;
          Clue.create({
            clue,
            value,
            daily_double,
            answer: response,
            has_been_answered: false,
            category_id: id,
          });
        });
      });
    });

    fullGame.doubleJeopardyRound.forEach((category) => {
      Category.create({
        category_name: category.categoryName,
        double_jeopardy: true,
        game_id,
      }).then((newCategoryRecord) => {
        //set up the clue create

        const { id } = newCategoryRecord.dataValues;
        category.clues.forEach((clueCard) => {
          const { clue, value, response, daily_double } = clueCard;
          Clue.create({
            clue,
            value,
            daily_double,
            answer: response,
            has_been_answered: false,
            category_id: id,
          });
        });
      });
    });

    res.json({ ...fullGame, gameId: game_id });
  } catch (error) {
    console.error(error);
    res.json(
      getFullJeopardyGame(fallbackJeopardyData, fallbackFinalJeopardyData)
    );
  }
});

const PORT = process.env['PORT'] || 8999;

const wsServer = new WebSocket.Server({ server });

wsServer.on('connection', (socket) => {
  socket.send('Welcome to the internet');
  console.log('Connection in back end');
  socket.on('message', (data) => {
    socket.send('message received: ' + data);
    broadcast(data, socket);
  });
});

function broadcast(data: Object, socketToOmit: WebSocket) {
  wsServer.clients.forEach((connectedClient) => {
    if (
      connectedClient.readyState === WebSocket.OPEN &&
      connectedClient !== socketToOmit
    ) {
      connectedClient.send(JSON.stringify(data));
    }
  });
}
//start our server
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT} :)`);
});

//http://jservice.io//api/final?count=100
