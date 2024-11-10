const express = require('express');
const axios = require("axios");
const path = require('path');
const cors = require('cors');


const app = express();
const port = 8081;

// Middleware для работы с JSON
app.use(express.json());

// Middleware для сервирования статических файлов
app.use(express.static(path.join(__dirname, 'public/dictionary')))
// app.use(express.static(path.join(__dirname, 'public/dictionary/forms/add-word')));
// app.use(express.static(path.join(__dirname, 'public/dictionary/forms/add-folder')));
// app.use(express.static(path.join(__dirname, 'public/dictionary/refact-folder')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/dictionary', 'word_suggestion.html'));
});
// app.get('/add-word.html', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public/dictionary/forms/add-word', 'add-word.html'));
// });
// app.get('/add-folder.html', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public/dictionary/forms/add-folder', 'add-folder.html'));
// });
// app.get('/refact-folder.html', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public/dictionary/refact-folder', 'refact-folder.html'));
// });


// Запуск сервера
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
