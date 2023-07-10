const axios = require("axios");
require("dotenv").config();

class OpenAiApi {
  constructor(baseSystemMessage) {
    this.openAiKey = process.env.OPENAI_API_KEY;

    this.TOPICS = [
      "science, science fiction, cult movies, and astrophysics",
      "Harry Potter",
      "Star Trek TNG",
      "Astrophysics",
      "Sports",
      "Cult Movies",
      "James Bond",
    ];
    this.baseSystemMessage = baseSystemMessage;
    this.conversation = [
      {
        role: "system",
        content: this.baseSystemMessage,
      },
    ];
  }

  async simplePrompt(message) {
    const postEndpoint = "https://api.openai.com/v1/chat/completions";

    // Add the user message to the conversation.
    this.conversation.push({ role: "user", content: message });

    const postData = {
      model: "gpt-3.5-turbo",
      messages: this.conversation,
      max_tokens: 1000,
    };

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.openAiKey}`,
    };

    const response = await axios
      .post(postEndpoint, postData, { headers })
      .then((res) => {
        console.log("Success getting decision");
        return res;
      })
      .catch((error) => {
        console.log(`Error getting prompt: ${error.message}`);
      });

    // Add the model's message to the conversation.
    const modelMessage = response.data.choices[0].message.content;
    return modelMessage
    
  }

  async promptOpenAI(topic, message) {
    const postEndpoint = "https://api.openai.com/v1/chat/completions";

    // Add the user message to the conversation.
    this.conversation.push({ role: "user", content: message });

    const postData = {
      model: "gpt-3.5-turbo",
      messages: this.conversation,
      max_tokens: 1000,
    };

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.openAiKey}`,
    };

    console.log(`Getting prompt for: ${topic}`);
    const response = await axios
      .post(postEndpoint, postData, { headers })
      .then((res) => {
        console.log("Success getting prompt");
        return res;
      })
      .catch((error) => {
        console.log(`Error getting prompt: ${error.message}`);
      });

    // Add the model's message to the conversation.
    const modelMessage = response.data.choices[0].message.content;
    this.conversation.push({ role: "assistant", content: modelMessage });

    // Parse the response
    const dataResponse = response.data.choices[0].message.content;
    const split = dataResponse.split("\n\n");

    const title = split[0].split("/n")[0].split("Title: ")[1];
    const tags = split[1].split("/n")[0].split(": ")[1].split(", ");
    const categories = split[2].split("/n")[0].split(": ")[1];
    const post = split.slice(3, split.length - 1).join("<br><br>");
    const meta = {
      title,
      tags,
      categories,
      post,
    };

    return meta;
  }

  async promptDALLE(title) {
    console.log(`Prompting DALLE-E for: ${title}`);
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.openAiKey}`,
    };
    const dalleEndpoint = "https://api.openai.com/v1/images/generations";
    const dalleData = {
      prompt: `pixel art about ${title}`,
      n: 1,
      size: "512x512",
    };
    //   terminalAnimation();
    const dalleResponse = await axios
      .post(dalleEndpoint, dalleData, {
        headers,
      })
      .then((res) => {
        //   stopAnimation();
        console.log("Success prompting DALL-E");
        return res;
      })
      .catch((error) => {
        console.log(`Error prompting DALLE: ${error}`);
      });

    const dalle = dalleResponse.data.data;

    const response = await axios({
      url: dalle[0].url,
      responseType: "stream",
    })
      .then((res) => {
        console.log("Success generating image");
        return res;
      })
      .catch((error) => {
        console.log(`Error generating image: ${error.message}`);
      });

    return response;
  }
}

module.exports = OpenAiApi;
