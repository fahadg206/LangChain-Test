import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import * as dotenv from "dotenv";
import { LLMChain } from "langchain/chains";
dotenv.config();

const template = "what are the career stats for {player}?";

const promptTemplate = new PromptTemplate({
  template: template,
  inputVariables: ["player"],
});

const model = new OpenAI({
  temperature: 0.9,
});

//chaining the model and the prompt together
const chain = new LLMChain({
  llm: model,
  prompt: promptTemplate,
});

const response = await chain.call({
  player: "Lebron James",
});

console.log(response);
