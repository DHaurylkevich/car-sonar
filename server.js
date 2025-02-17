const express = require('express')
const app = express()
const Manager = require("./src/index")
const bot = require("./src/bot");
const port = process.env.PORT || 4000;

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/cars', async (req, res) => {
    res.send("Get Cars!");
    await Manager.run(bot);
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})