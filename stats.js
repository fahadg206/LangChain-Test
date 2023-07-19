import * as dotenv from "dotenv";
dotenv.config();
import fetch from "node-fetch";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import axios from "axios";

const map = new Map();

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

let matchupData;
const getMatchups = async () => {
  const response = await axios.get(
    "https://api.sleeper.app/v1/league/864448469199347712/matchups/1"
  );
  matchupData = response.data;
};

getUsers()
  .then(getRosters)
  .then(getMatchups)
  .then(() => {
    console.log("All promises resolved");
    console.log(map);
    [...map.values()].map((player) => {
      for (let week of matchupData) {
        if (player.roster_id === week.roster_id) {
          let matchup = matchupData.filter(
            (team) => team.matchup_id === player.matchup_id
          );
          console.log(matchup);
        }
      }
    });
  })
  .catch((error) => {
    console.error("At least one promise was rejected:", error);
  });

// const model = new OpenAI({
//   temperature: 0,
// });

// const template = "give me only 1 user that starts with the letter a {users} ";

// const promptTemplate = new PromptTemplate({
//   template: template,
//   inputVariables: ["users", "rosters", "matchups"],
// });

// const chain = new LLMChain({
//   llm: model,
//   prompt: promptTemplate,
// });

// const response = await chain.call({
//   users: usersRes,
//   rosters: rostersRes,
//   matchups: matchupRes,
// });
