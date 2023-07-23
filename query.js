import * as dotenv from "dotenv";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { FaissStore } from "langchain/vectorstores/faiss";
import { RetrievalQAChain } from "langchain/chains";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { BufferMemory } from "langchain/memory";
import { memoryUsage } from "process";
dotenv.config();

//loading league data so AI can read
const leagueDataLoader = new TextLoader("leagueDataPrompt.txt");
const leagueDoc = await leagueDataLoader.load();

//vector ducaan
const vectorStore = await FaissStore.fromDocuments(
  leagueDoc,
  new OpenAIEmbeddings()
);

//if you want to add another document to the vector store
//await vectorStore.addDocuments(docs2);

await vectorStore.save("leagueData");

const model = new ChatOpenAI({
  temperature: 0.9,
});

const question = "give me a summary of kaboweyne and his opponent matchup ";

//linking AI Model and league data
const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

const res = await chain.call({ query: question });

console.log(res);
