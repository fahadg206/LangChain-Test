import axios from "axios";

const map = new Map();

const users = await axios.get(
  "https://api.sleeper.app/v1/league/864448469199347712/users"
);

const rosters = await axios.get(
  "https://api.sleeper.app/v1/league/864448469199347712/rosters"
);

const matchups = await axios.get(
  "https://api.sleeper.app/v1/league/864448469199347712/matchups/1"
);

console.log(users.data);
