"use strict";
exports.__esModule = true;
exports.Clue = exports.Category = exports.Player = exports.Game = exports.sequelize = void 0;
var sequelize_1 = require("sequelize");
var dotenv_1 = require("dotenv");
dotenv_1["default"].config();
var sequelize = new sequelize_1.Sequelize({
    dialect: 'mysql',
    dialectOptions: {
        ssl: { ca: process.env.CERT }
    },
    host: process.env.HOST,
    port: Number(process.env.SERVER_PORT),
    username: process.env.USER,
    password: process.env.SERVER_PASS,
    database: process.env.DATABASE
});
exports.sequelize = sequelize;
// Define the Game model
var Game = sequelize.define('game', {
    number_of_players: {
        type: sequelize_1.DataTypes.INTEGER
    },
    status: {
        type: sequelize_1.DataTypes.STRING
    }
});
exports.Game = Game;
// Define the Player model
var Player = sequelize.define('player', {
    //
    name: {
        type: sequelize_1.DataTypes.STRING
    },
    score: {
        type: sequelize_1.DataTypes.INTEGER
    }
});
exports.Player = Player;
// Define the Category model
var Category = sequelize.define('category', {
    category_name: {
        type: sequelize_1.DataTypes.STRING
    },
    double_jeopardy: {
        type: sequelize_1.DataTypes.BOOLEAN
    }
});
exports.Category = Category;
// Define the Clue model
var Clue = sequelize.define('clue', {
    clue: {
        type: sequelize_1.DataTypes.STRING
    },
    value: {
        type: sequelize_1.DataTypes.INTEGER
    },
    daily_double: {
        type: sequelize_1.DataTypes.BOOLEAN
    },
    answer: {
        type: sequelize_1.DataTypes.STRING
    },
    has_been_answered: {
        type: sequelize_1.DataTypes.BOOLEAN
    }
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
