import React from 'react';
import axios from 'axios';
import classNames from 'classnames';

import { Context } from 'App';
import summonerSpells from 'static/summoner.json';
import runesReforged from 'static/runesReforged.json';
import champion from 'static/champion.json';
import item from 'static/item.json';
import victory from 'assets/victory.png';
import defeat from 'assets/defeat.png';

const apiPath = '/api/match';
const staticRoot = require.context('../static', true);
const spells = require.context('../static/summoner', true);
const items = require.context('../static/item', true);

const Placeholder = () => (
  <div className="match placeholder">
    <span>Loading...</span>
  </div>
);

const MatchContent = props => {
  const { summoner, championId, participants, gameDuration } = props;
  const { spell1Id, spell2Id, stats } = participants.find(
    player => player.championId === championId
  );
  const {
    win,
    kills,
    deaths,
    assists,
    totalMinionsKilled,
    neutralMinionsKilled,
    perkPrimaryStyle,
    perkSubStyle,
    champLevel
  } = stats;

  const spellList = Object.values(summonerSpells.data);
  const spell1 = spellList.find(spell => spell.key === spell1Id.toString());
  const spell2 = spellList.find(spell => spell.key === spell2Id.toString());

  const runeIds = Array.from({ length: 6 }).map((_, i) => stats[`perk${i}`]);
  const perks = runesReforged.reduce((acc, style) => {
    const { id, slots, key, icon } = style;
    if ([perkPrimaryStyle, perkSubStyle].includes(id)) {
      const runes = slots
        .flatMap(slot => slot.runes)
        .filter(rune => runeIds.includes(rune.id));
      acc[key] = { icon, runes };
    }
    return acc;
  }, {});

  const champ = Object.values(champion.data).find(
    c => c.key === championId.toString()
  );

  const cs = totalMinionsKilled + neutralMinionsKilled;
  const cspm = cs / (gameDuration / 60);
  const seconds = gameDuration % 60;

  return (
    <div className={classNames('match', { win: win })}>
      <div className="matchInfo">
        <span className="result">
          {win ? <img src={victory} alt="" /> : <img src={defeat} alt="" />}
        </span>
        <span className="duration">
          {`${(gameDuration - seconds) / 60}m
          ${seconds < 10 ? '0' : ''}${seconds}s`}
        </span>
      </div>
      <div className="kda">
        <span>
          {summoner} as {champ.name}
        </span>
        <h3>KDA</h3>
        <span>
          {kills} / {deaths} / {assists}
        </span>
      </div>
      <div className="championInfo">
        <div className="spells">
          {[spell1, spell2].map(({ id, image, name }) => (
            <img
              key={id}
              src={spells(`./${image.full}`)}
              alt={name}
              title={name}
              className="icon"
            />
          ))}
        </div>
        <div className="runes">
          {Object.entries(perks).map(([name, style]) => {
            const { icon, runes } = style;
            return (
              <div key={name}>
                <img
                  src={staticRoot(`./${icon}`)}
                  alt={name}
                  title={name}
                  className="icon"
                />
                {runes.map(rune => (
                  <img
                    key={rune.id}
                    src={staticRoot(`./${rune.icon}`)}
                    alt={rune.name}
                    title={rune.name}
                    className="icon"
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
      <div className="levelInfo">
        <span className="level">Level {champLevel}</span>
        <span className="cs" title="creep score">
          CS: {cs}
        </span>
        <span className="cspm" title="creep score per minute">
          CS/Minute: {cspm.toFixed(1)}
        </span>
      </div>
      <div className="summonerItems">
        {Array.from({ length: 7 }).map((_, i) => {
          const itemId = stats[`item${i}`];
          if (!itemId) return null;
          const { name, image } = item.data[itemId];
          return (
            <img
              key={itemId}
              src={items(`./${image.full}`)}
              alt={name}
              title={name}
              className="icon"
            />
          );
        })}
      </div>
    </div>
  );
};

export default ({ matchId }) => {
  const [content, setContent] = React.useState({});
  const [error, setError] = React.useState(null);
  const { matches, summoner } = React.useContext(Context);
  const { champion: championId } = matches.find(
    match => match.gameId === matchId
  );

  const fetchMatchDetails = async () => {
    try {
      const { data } = await axios.get(`${apiPath}?id=${matchId}`);
      setContent(data);
    } catch (e) {
      console.log(e);
      setError(e);
    }
  };

  React.useEffect(() => {
    fetchMatchDetails();
  }, []);

  const details = {
    summoner,
    championId,
    ...content
  };

  return error ? null : (
    <>{content.gameId ? <MatchContent {...details} /> : <Placeholder />}</>
  );
};
