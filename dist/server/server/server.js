"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const superagent_1 = __importDefault(require("superagent"));
const http = __importStar(require("http"));
const ws_1 = __importDefault(require("ws"));
const helpers_1 = require("./helpers");
const questions_json_1 = __importDefault(require("../data/questions.json"));
const finalJeopardy_json_1 = __importDefault(require("../data/finalJeopardy.json"));
const db_1 = require("./db/db");
const app = express();
//initialize a simple http server
const server = http.createServer(app);
app.get('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const games = yield db_1.Clue.findAll();
        res.json(games);
    }
    catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
}));
app.get('/game/:gameId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const gameId = Number(req.params.gameId);
    // const test = await Clue.findAll();
    // console.log('SEAN: ', test);
    const game = yield db_1.Game.findByPk(gameId, {
        include: [
            {
                model: db_1.Player,
                attributes: ['name', 'score'],
            },
            {
                model: db_1.Category,
                attributes: ['category_name'],
            },
        ],
    });
    console.log('SEAN!!!!', game);
}));
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const randomNum = (0, helpers_1.generateRandom)(360000);
    try {
        const clueBaseResponse = yield superagent_1.default.get(`cluebase.lukelav.in/clues?limit=250&order_by=id&offset=${randomNum}`
        // `cluebase.lukelav.in/clues?limit=1000&order_by=category&sort=asc&offset=${randomNum}`
        );
        const jserviceResponse = yield superagent_1.default.get(`http://jservice.io//api/final?count=20`);
        const fullGame = (0, helpers_1.getFullJeopardyGame)(clueBaseResponse.body, jserviceResponse.body);
        const createdGame = yield db_1.Game.bulkCreate([{ number_of_players: 4, status: 'Active' }], { returning: true });
        const game_id = createdGame[0].dataValues.id;
        yield db_1.Player.bulkCreate([{ name: 'Sean', score: 0, game_id }], {
            returning: true,
        });
        fullGame.jeopardyRound.forEach((category) => {
            db_1.Category.create({
                category_name: category.categoryName,
                double_jeopardy: false,
                game_id,
            }).then((newCategoryRecord) => {
                //set up the clue create
                const { id } = newCategoryRecord.dataValues;
                category.clues.forEach((clueCard) => {
                    const { clue, value, response, daily_double } = clueCard;
                    db_1.Clue.create({
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
            db_1.Category.create({
                category_name: category.categoryName,
                double_jeopardy: true,
                game_id,
            }).then((newCategoryRecord) => {
                //set up the clue create
                const { id } = newCategoryRecord.dataValues;
                category.clues.forEach((clueCard) => {
                    const { clue, value, response, daily_double } = clueCard;
                    db_1.Clue.create({
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
        res.json(Object.assign(Object.assign({}, fullGame), { gameId: game_id }));
    }
    catch (error) {
        console.error(error);
        res.json((0, helpers_1.getFullJeopardyGame)(questions_json_1.default, finalJeopardy_json_1.default));
    }
}));
const PORT = process.env['PORT'] || 8999;
const wsServer = new ws_1.default.Server({ server });
wsServer.on('connection', (socket) => {
    socket.send('Welcome to the internet');
    console.log('Connection in back end');
    socket.on('message', (data) => {
        socket.send('message received: ' + data);
        broadcast(data, socket);
    });
});
function broadcast(data, socketToOmit) {
    wsServer.clients.forEach((connectedClient) => {
        if (connectedClient.readyState === ws_1.default.OPEN &&
            connectedClient !== socketToOmit) {
            connectedClient.send(JSON.stringify(data));
        }
    });
}
//start our server
server.listen(PORT, () => {
    console.log(`Server started on port ${PORT} :)`);
});
//http://jservice.io//api/final?count=100
//# sourceMappingURL=server.js.map