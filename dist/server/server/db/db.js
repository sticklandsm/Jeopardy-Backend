"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Clue = exports.Category = exports.Player = exports.Game = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const sequelize = new sequelize_1.Sequelize({
    logging: false,
    dialect: 'mysql',
    dialectOptions: {
        ssl: { ca: process.env.CERT, rejectUnauthorized: false },
    },
    host: process.env.HOST,
    port: Number(process.env.SERVER_PORT),
    username: process.env.USER,
    password: process.env.SERVER_PASS,
    database: process.env.DATABASE,
});
exports.sequelize = sequelize;
//Comment this if it's a local db
// const sequelize = new Sequelize({
//   logging: false,
//   dialect: 'mysql',
//   host: 'localhost',
//   port: 3306,
//   username: 'root',
//   password: 'password',
//   database: process.env.DATABASE,
// })
// Define the Game model
const Game = sequelize.define('game', {
    number_of_players: {
        type: sequelize_1.DataTypes.INTEGER,
    },
    status: {
        type: sequelize_1.DataTypes.STRING,
    },
});
exports.Game = Game;
// Define the Player model
const Player = sequelize.define('player', {
    //
    name: {
        type: sequelize_1.DataTypes.STRING,
    },
    score: {
        type: sequelize_1.DataTypes.INTEGER,
    },
});
exports.Player = Player;
// Define the Category model
const Category = sequelize.define('category', {
    category_name: {
        type: sequelize_1.DataTypes.STRING,
    },
    double_jeopardy: {
        type: sequelize_1.DataTypes.BOOLEAN,
    },
});
exports.Category = Category;
// Define the Clue model
const Clue = sequelize.define('clue', {
    clue: {
        type: sequelize_1.DataTypes.STRING,
    },
    value: {
        type: sequelize_1.DataTypes.INTEGER,
    },
    daily_double: {
        type: sequelize_1.DataTypes.BOOLEAN,
    },
    response: {
        type: sequelize_1.DataTypes.STRING,
    },
    has_been_answered: {
        type: sequelize_1.DataTypes.BOOLEAN,
    },
});
exports.Clue = Clue;
// Associations
Game.hasMany(Player, { foreignKey: 'game_id' });
Player.belongsTo(Game, { foreignKey: 'game_id' });
Category.belongsTo(Game, { foreignKey: 'game_id' });
Game.hasMany(Category, { foreignKey: 'game_id' });
Category.hasMany(Clue, { foreignKey: 'category_id' });
Clue.belongsTo(Category, { foreignKey: 'category_id' });
sequelize.sync();
//# sourceMappingURL=db.js.map