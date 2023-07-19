import * as dotenv from "dotenv";
dotenv.config();
import { OpenAI } from "langchain/llms/openai";
import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";

const model = new OpenAI({});

const memory = new BufferMemory();
const chain = new ConversationChain({
  llm: model,
  memory: memory,
});

const resp1 = await chain.call({
  input: "Hey Im Fahad",
});

const resp2 = await chain.call({
  input: "What's my name?",
});
console.log(resp2);
