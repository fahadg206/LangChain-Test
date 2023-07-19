import * as dotenv from "dotenv";
dotenv.config();
import fetch from "node-fetch";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import axios from "axios";
import { match } from "assert";

const map = new Map();
const duplicateMatchup = new Map();

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

const getRosters = async () => {
  const response = await axios.get(
    "https://api.sleeper.app/v1/league/864448469199347712/rosters"
  );
  //roster info
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
    });
  }
  console.log("rosters completed");
};

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
    //console.log(map);
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
          //2) refrain from any duplicate matchups being logged.
          // duplicateMatchup.set(matchup[0].matchup_id, team1);

          if (player.roster_id === matchup[0].roster_id) {
            player.matchup_id = matchup[0].matchup_id;
            player.team_points = matchup[0].points;
            player.starters = matchup[0].starters;
          } else if (player.roster_id === matchup[1].roster_id) {
            player.matchup_id = matchup[1].matchup_id;
            player.team_points = matchup[1].points;
            player.starters = matchup[1].starters;
          }
        }
      }
    });
    //langchain AI work
    const model = new OpenAI({
      temperature: 0,
    });

    const template =
      "give me only 1 user that starts with the letter a {data} ";

    const promptTemplate = new PromptTemplate({
      template: template,
      inputVariables: ["data"],
    });

    const chain = new LLMChain({
      llm: model,
      prompt: promptTemplate,
    });

    const obj = Object.fromEntries(map);
    const jsonString = JSON.stringify(obj);

    const response = await chain.call({
      data: map,
    });

    console.log(response);
  })
  .catch((error) => {
    console.error("At least one promise was rejected:", error);
  });
