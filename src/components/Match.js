import React from 'react';
import axios from 'axios';
import classNames from 'classnames';

import { Context } from 'App';
import victory from 'assets/victory.png';
import defeat from 'assets/defeat.png';

const apiPath = '/api/match';

const Placeholder = () => (
  <div className="match placeholder">
    <span>Loading...</span>
  </div>
);

const MatchContent = props => {
  const { summoner, champion, participants, gameDuration } = props;
  const { championId, spell1Id, spell2Id, stats } = participants.find(
    player => player.championId === champion
  );
  const {
    win,
    kills,
    deaths,
    assists,
    totalMinionsKilled,
    neutralMinionsKilled,
    champLevel
  } = stats;
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
      <div className="championInfo">
        <span className="summoner">{summoner}</span>
        <div className="spells">
          {spell1Id} {spell2Id}
        </div>
        <div className="runes">
          {Array.from({ length: 6 }).map((_, i) => (
            <span>{stats[`perk${i}`]}</span>
          ))}
        </div>
        <span className="name">{championId}</span>
      </div>
      <div className="kda">
        <h3>KDA</h3>
        <span>
          {kills} / {deaths} / {assists}
        </span>
      </div>
      <div className="levelInfo">
        <span className="level">Level {champLevel}</span>
        <span className="cs">CS {cs}</span>
        <span className="cspm">CS/Minute {cspm.toFixed(1)}</span>
      </div>
      <div className="summonerItems">
        {Array.from({ length: 7 }).map((_, i) => (
          <span>{stats[`item${i}`]}</span>
        ))}
      </div>
    </div>
  );
};

export default ({ matchId }) => {
  const [content, setContent] = React.useState({});
  const { matches, summoner } = React.useContext(Context);
  const { champion } = matches.find(match => match.gameId === matchId);

  const fetchMatchDetails = async () => {
    const { data } = await axios.get(`${apiPath}?id=${matchId}`);
    setContent(data);
  };

  React.useEffect(() => {
    fetchMatchDetails();
  }, []);

  const details = {
    summoner,
    champion,
    ...content
  };

  return (
    <>{content.gameId ? <MatchContent {...details} /> : <Placeholder />}</>
  );
};
