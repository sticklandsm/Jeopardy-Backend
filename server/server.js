"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var express = require("express");
var superagent_1 = require("superagent");
var http = require("http");
var ws_1 = require("ws");
var helpers_1 = require("./helpers");
var questions_json_1 = require("../data/questions.json");
var finalJeopardy_json_1 = require("../data/finalJeopardy.json");
var db_1 = require("./db/db");
var app = express();
//initialize a simple http server
var server = http.createServer(app);
app.get('/users', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var games, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, db_1.Clue.findAll()];
            case 1:
                games = _a.sent();
                res.json(games);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                res.status(500).json({ error: 'Database error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get('/game/:gameId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var gameId, game;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                gameId = Number(req.params.gameId);
                return [4 /*yield*/, db_1.Game.findByPk(gameId, {
                        include: [
                            {
                                model: db_1.Player,
                                attributes: ['name', 'score']
                            },
                            {
                                model: db_1.Category,
                                attributes: ['category_name']
                            },
                        ]
                    })];
            case 1:
                game = _a.sent();
                console.log('SEAN!!!!', game);
                return [2 /*return*/];
        }
    });
}); });
app.get('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var randomNum, clueBaseResponse, jserviceResponse, fullGame, createdGame, game_id_1, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                randomNum = (0, helpers_1.generateRandom)(360000);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 6, , 7]);
                return [4 /*yield*/, superagent_1["default"].get("cluebase.lukelav.in/clues?limit=250&order_by=id&offset=".concat(randomNum)
                    // `cluebase.lukelav.in/clues?limit=1000&order_by=category&sort=asc&offset=${randomNum}`
                    )];
            case 2:
                clueBaseResponse = _a.sent();
                return [4 /*yield*/, superagent_1["default"].get("http://jservice.io//api/final?count=20")];
            case 3:
                jserviceResponse = _a.sent();
                fullGame = (0, helpers_1.getFullJeopardyGame)(clueBaseResponse.body, jserviceResponse.body);
                return [4 /*yield*/, db_1.Game.bulkCreate([{ number_of_players: 4, status: 'Active' }], { returning: true })];
            case 4:
                createdGame = _a.sent();
                game_id_1 = createdGame[0].dataValues.id;
                return [4 /*yield*/, db_1.Player.bulkCreate([{ name: 'Sean', score: 0, game_id: game_id_1 }], {
                        returning: true
                    })];
            case 5:
                _a.sent();
                fullGame.jeopardyRound.forEach(function (category) {
                    db_1.Category.create({
                        category_name: category.categoryName,
                        double_jeopardy: false,
                        game_id: game_id_1
                    }).then(function (newCategoryRecord) {
                        //set up the clue create
                        var id = newCategoryRecord.dataValues.id;
                        category.clues.forEach(function (clueCard) {
                            var clue = clueCard.clue, value = clueCard.value, response = clueCard.response, daily_double = clueCard.daily_double;
                            db_1.Clue.create({
                                clue: clue,
                                value: value,
                                daily_double: daily_double,
                                answer: response,
                                has_been_answered: false,
                                category_id: id
                            });
                        });
                    });
                });
                fullGame.doubleJeopardyRound.forEach(function (category) {
                    db_1.Category.create({
                        category_name: category.categoryName,
                        double_jeopardy: true,
                        game_id: game_id_1
                    }).then(function (newCategoryRecord) {
                        //set up the clue create
                        var id = newCategoryRecord.dataValues.id;
                        category.clues.forEach(function (clueCard) {
                            var clue = clueCard.clue, value = clueCard.value, response = clueCard.response, daily_double = clueCard.daily_double;
                            db_1.Clue.create({
                                clue: clue,
                                value: value,
                                daily_double: daily_double,
                                answer: response,
                                has_been_answered: false,
                                category_id: id
                            });
                        });
                    });
                });
                res.json(__assign(__assign({}, fullGame), { gameId: game_id_1 }));
                return [3 /*break*/, 7];
            case 6:
                error_2 = _a.sent();
                console.error(error_2);
                res.json((0, helpers_1.getFullJeopardyGame)(questions_json_1["default"], finalJeopardy_json_1["default"]));
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
var PORT = process.env['PORT'] || 8999;
var wsServer = new ws_1["default"].Server({ server: server });
wsServer.on('connection', function (socket) {
    socket.send('Welcome to the internet');
    console.log('Connection in back end');
    socket.on('message', function (data) {
        socket.send('message received: ' + data);
        broadcast(data, socket);
    });
});
function broadcast(data, socketToOmit) {
    wsServer.clients.forEach(function (connectedClient) {
        if (connectedClient.readyState === ws_1["default"].OPEN &&
            connectedClient !== socketToOmit) {
            connectedClient.send(JSON.stringify(data));
        }
    });
}
//start our server
server.listen(PORT, function () {
    console.log("Server started on port ".concat(PORT, " :)"));
});
//http://jservice.io//api/final?count=100
