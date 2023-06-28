require("dotenv").config();
const readline = require("readline");
const OpenAiApi = require("./services/openai-api");
const MediumApi = require("./services/medium-api");
const GoogleApi = require("./services/google-api");

class App {
  constructor() {
    this.openAiApi = new OpenAiApi();
    this.mediumApi = new MediumApi();
    this.googleApi = new GoogleApi();
  }

  getTimeStamp() {
    const timestamp = Date.now();

    const date = new Date(timestamp);

    // Formatting the date components
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    // Constructing the date string
    const dateString = `${year}-${month}-${day} ${hours}:${minutes}`;
    console.log(dateString); // Output: YYYY-MM-DD HH:MM (e.g., 2023-06-07 15:30)
    return dateString;
  }

  async run() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question("Press Enter to begin the prompt...", async () => {
      rl.close();
      const trends = await this.googleApi.getTopTrendingTopics();
      const posts = [];
      this.getTimeStamp();
      for (let i = 3; i < 5; i++) {
        const topic = trends[i];
        const snippets = await this.googleApi.getSnippets(topic);
        const message =
          `Write a blog post about ${topic}, include Title, Tags, and Categories.
        Use these snippets to figure out the most recent news about the topic:` +
          snippets;

        try {
          const postMeta = await this.openAiApi.promptOpenAI(topic, message);
          const imageResponse = await this.openAiApi.promptDALLE(
            postMeta.title
          );
          const mediumImageUrl = await this.mediumApi.uploadImageToMedium(
            imageResponse
          );
          const postUrl = await this.mediumApi.postToMedium(
            postMeta,
            mediumImageUrl
          );
          const timestamp = this.getTimeStamp();
          console.log(timestamp);
          console.log(`Blog post published on Medium: ${postUrl}`);
        } catch (err) {
          console.log(`Something went wrong: ${err.message}`);
          continue;
        }
      }
      this.run();
    });
  }
}

const appInstance = new App();
appInstance.run();
