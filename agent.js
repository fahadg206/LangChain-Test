import * as dotenv from "dotenv";
dotenv.config();
import fetch from "node-fetch";

import { OpenAI } from "langchain/llms/openai";
import { SerpAPI } from "langchain/tools";
import { Calculator } from "langchain/tools/calculator";
import { initializeAgentExecutorWithOptions } from "langchain/agents";

const model = new OpenAI({
  temperature: 0,
});

const tools = [
  new SerpAPI(process.env.SERPAPI_API_KEY, {
    hl: "en",
    gl: "us",
  }),
  new Calculator(),
];

const executor = await initializeAgentExecutorWithOptions(tools, model, {
  agentType: "zero-shot-react-description",
  verbose: true,
});
console.log("loaded the agent...");

const res = await executor.call({
  input: "Who is Deshaun Watson's college coach and multiply his age by 3",
});

console.log(res.output);
