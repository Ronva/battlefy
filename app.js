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
  const { name, page = 1 } = req.query;
  const matchesPerPage = 5;

  res.setHeader('Content-Type', 'application/json');
  try {
    const { accountId } = await leagueJS.Summoner.gettingByName(name);
    const matches = await leagueJS.Match.gettingListByAccount(
      accountId,
      'na1',
      {
        startIndex: (page - 1) * matchesPerPage,
        endIndex: page * matchesPerPage
      }
    );
    res.send(JSON.stringify(matches));
  } catch (e) {
    const { statusCode } = e;
    res.status(statusCode).send(e);
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

if (process.env.NODE_ENV === 'production') {
  // Exprees will serve up production assets
  app.use(express.static('client/build'));

  // Express serve up index.html file if it doesn't recognize route
  const path = require('path');
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

app.listen(process.env.PORT || 3001, () => console.log('Express server is running on port 3001'));
