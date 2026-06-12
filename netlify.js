const serverless = require('serverless-http');
const express = require('express');

const app = express();
app.use(express.json());
app.use(express.static('.'));

// Stockage des parties
const games = new Map();

// Créer une partie
app.post('/api/create-game', (req, res) => {
    const gameId = Math.random().toString(36).substring(2, 8).toUpperCase();
    games.set(gameId, {
        id: gameId,
        players: [],
        gameState: {
            board: [5,5,5,5,5,5,5,5,5,5,5,5,5,5],
            scores: {1: 0, 2: 0},
            currentPlayer: 1,
            gameOver: false,
            winner: null
        }
    });
    res.json({ gameId });
});

// Rejoindre une partie
app.post('/api/join-game', (req, res) => {
    const { gameId } = req.body;
    const game = games.get(gameId);
    if (!game) return res.status(404).json({ error: "Partie inexistante" });
    if (game.players.length >= 2) return res.status(400).json({ error: "Partie pleine" });
    game.players.push({ id: Date.now() });
    res.json({ success: true });
});

// Statut d'une partie
app.get('/api/game-status', (req, res) => {
    const gameId = req.query.gameId;
    const game = games.get(gameId);
    res.json({ playerCount: game ? game.players.length : 0 });
});

// Récupérer l'état
app.get('/api/state', (req, res) => {
    const gameId = req.query.gameId;
    const game = games.get(gameId);
    if (!game) return res.status(404).json({ error: "Partie non trouvee" });
    res.json(game.gameState);
});

// Réinitialiser
app.post('/api/reset', (req, res) => {
    const { gameId } = req.body;
    const game = games.get(gameId);
    if (game) {
        game.gameState = {
            board: [5,5,5,5,5,5,5,5,5,5,5,5,5,5],
            scores: {1: 0, 2: 0},
            currentPlayer: 1,
            gameOver: false,
            winner: null
        };
    }
    res.json({ success: true });
});

// Jouer un coup
app.post('/api/move', (req, res) => {
    const { gameId, caseIndex, player } = req.body;
    const game = games.get(gameId);
    if (!game) return res.status(404).json({ error: "Partie non trouvee" });
    
    let state = game.gameState;
    
    if (state.gameOver) {
        return res.status(400).json({ error: "Partie terminee" });
    }
    if (player !== state.currentPlayer) {
        return res.status(400).json({ error: "Ce n'est pas ton tour" });
    }
    if (player === 1 && caseIndex >= 7) {
        return res.status(400).json({ error: "Choisis une case dans ta rangee" });
    }
    if (player === 2 && caseIndex < 7) {
        return res.status(400).json({ error: "Choisis une case dans ta rangee" });
    }
    if (state.board[caseIndex] === 0) {
        return res.status(400).json({ error: "Cette case est vide" });
    }
    
    let graines = state.board[caseIndex];
    state.board[caseIndex] = 0;
    let i = caseIndex;
    let derniereCase = caseIndex;
    
    while (graines > 0) {
        i = (i + 1) % 14;
        state.board[i]++;
        graines--;
        derniereCase = i;
    }
    
    let estAdverse = false;
    if (player === 1 && derniereCase >= 7) estAdverse = true;
    if (player === 2 && derniereCase <= 6) estAdverse = true;
    
    if (estAdverse && (state.board[derniereCase] === 2 || state.board[derniereCase] === 3)) {
        let capture = state.board[derniereCase];
        let totalAdv = 0;
        if (player === 1) {
            for (let j = 7; j <= 13; j++) totalAdv += state.board[j];
        } else {
            for (let j = 0; j <= 6; j++) totalAdv += state.board[j];
        }
        if (totalAdv - capture > 0) {
            state.board[derniereCase] = 0;
            state.scores[player] += capture;
        }
    }
    
    let j1Peut = false;
    for (let j = 0; j <= 6; j++) if (state.board[j] > 0) j1Peut = true;
    let j2Peut = false;
    for (let j = 7; j <= 13; j++) if (state.board[j] > 0) j2Peut = true;
    
    if (!j1Peut || !j2Peut) {
        state.gameOver = true;
        if (!j1Peut) {
            for (let j = 7; j <= 13; j++) {
                state.scores[2] += state.board[j];
                state.board[j] = 0;
            }
        }
        if (!j2Peut) {
            for (let j = 0; j <= 6; j++) {
                state.scores[1] += state.board[j];
                state.board[j] = 0;
            }
        }
        if (state.scores[1] > state.scores[2]) state.winner = 1;
        else if (state.scores[2] > state.scores[1]) state.winner = 2;
        else state.winner = 0;
    } else {
        state.currentPlayer = player === 1 ? 2 : 1;
    }
    
    res.json(state);
});

// Redirection vers lobby
app.get('/', (req, res) => {
    res.redirect('/lobby.html');
});

// Export pour Netlify
const handler = serverless(app);
module.exports.handler = handler;
