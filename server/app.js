require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const pino = require('express-pino-logger')();

const LeagueJS = require('leaguejs');
const leagueJS = new LeagueJS(process.env.LOL_API_KEY, {
  useV4: true,
  apiVersionOverrides: {
    Match: 'v4',
    Summoner: 'v4'
  }
});

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(pino);

app.get('/api/summoner', async (req, res) => {
  const { name } = req.query;
  try {
    const { accountId } = await leagueJS.Summoner.gettingByName(name);
    const matches = await leagueJS.Match.gettingListByAccount(accountId);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(matches));
  } catch (e) {
    console.log(e);
  }
});

app.listen(3001, () =>
  console.log('Express server is running on localhost:3001')
);
