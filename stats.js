import * as dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import * as fs from "fs";

const map = new Map();
const duplicateMatchup = new Map();

//user info
const getUsers = async () => {
  const response = await axios.get(
    "https://api.sleeper.app/v1/league/864448469199347712/users"
  );
  //users info
  for (let i = 0; i < response.data.length; i++) {
    map.set(response.data[i].user_id, {
      team_name: response.data[i].display_name,
      avatar: response.data[i].avatar,
      roster_id: map.has(response.data[i].user_id)
        ? map.get(response.data[i].user_id).roster_id
        : "loading",
      starters: "",
      team_points: "",
      matchup_id: "",
    });
  }
  console.log("users completed");
};

//roster info
const getRosters = async () => {
  const response = await axios.get(
    "https://api.sleeper.app/v1/league/864448469199347712/rosters"
  );
  for (let i = 0; i < response.data.length; i++) {
    map.set(response.data[i].owner_id, {
      team_name: map.has(response.data[i].owner_id)
        ? map.get(response.data[i].owner_id).team_name
        : "loading",
      avatar: map.has(response.data[i].owner_id)
        ? map.get(response.data[i].owner_id).avatar
        : "loading",
      roster_id: response.data[i].roster_id,
      starters: "",
      team_points: "",
      matchup_id: "",
      opponent: "",
    });
  }
  console.log("rosters completed");
};

//matchup info
let week;
const getMatchups = async () => {
  const response = await axios.get(
    "https://api.sleeper.app/v1/league/864448469199347712/matchups/1"
  );
  week = response.data;
};

getUsers()
  .then(getRosters)
  .then(getMatchups)
  .then(async () => {
    console.log("All promises resolved");

    //when map is populated with name, avatar, and roster_id now we can access matchups like we are doing below
    [...map.values()].map((player) => {
      for (let playerInfo of week) {
        //console.log(playerInfo);
        if (
          player.roster_id === playerInfo.roster_id &&
          //1) refrain from any duplicate matchups being logged
          !duplicateMatchup.has(playerInfo.matchup_id)
        ) {
          let matchup = week.filter(
            (team) => team.matchup_id === playerInfo.matchup_id
          );

          let team1 = [...map.values()].find(
            (team) => team.roster_id === matchup[0].roster_id
          );
          let team2 = [...map.values()].find(
            (team) => team.roster_id === matchup[1].roster_id
          );

          if (player.roster_id === matchup[0].roster_id) {
            player.matchup_id = matchup[0].matchup_id;
            player.team_points = matchup[0].points;
            player.starters = matchup[0].starters;
            player.opponent = team2.team_name;
          } else if (player.roster_id === matchup[1].roster_id) {
            player.matchup_id = matchup[1].matchup_id;
            player.team_points = matchup[1].points;
            player.starters = matchup[1].starters;
            player.opponent = team1.team_name;
          }
        }
      }
    });
    //langchain AI work

    let obj = Object.fromEntries(map);

    //reading in data from leagueData
    const data = fs.readFileSync("leagueData.json");
    //parsing that league data into JSON
    const jsonData = JSON.parse(data);

    // UNCOMMENT THIS TO LOAD INFO INTO JSON, ONLY NEED TO RUN THIS ONCE
    //jsonData.push(obj);

    //Convert the JavaScript object back into a JSON string
    const jsonString = JSON.stringify(jsonData);

    //adding league info to the leagueData file
    fs.writeFileSync("leagueData.json", jsonString, "utf-8", (err) => {
      if (err) throw err;
      console.log("Data added to file");
    });

    fs.writeFile("leagueDataPrompt.txt", jsonString, (err) => {
      // In case of a error throw err.
      if (err) throw err;
    });
  })
  .catch((error) => {
    console.error("At least one promise was rejected:", error);
  });
