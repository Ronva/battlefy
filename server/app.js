require('dotenv').config();

// const path = require('path');
const express = require('express');
const serverless = require('serverless-http');
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
// leagueJS.StaticData.setup('../static');

// const DataDragonHelper = require('leaguejs/lib/DataDragon/DataDragonHelper');
// DataDragonHelper.storageRoot = path.resolve(__dirname, '../static');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(pino);

app.get('/api/summoner', async (req, res) => {
  const { name } = req.query;
  try {
    const { accountId } = await leagueJS.Summoner.gettingByName(name);
    const matches = await leagueJS.Match.gettingListByAccount(
      accountId,
      'na1',
      { endIndex: 5 }
    );
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(matches));
  } catch (e) {
    console.log(e);
  }
});

app.get('/api/match', async (req, res) => {
  const { id } = req.query;
  try {
    const match = await leagueJS.Match.gettingById(id);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(match));
  } catch (e) {
    console.log(e);
  }
});

app.listen(3001, () => console.log('Express server is running on port 3001'));

module.exports.handler = serverless(app);
