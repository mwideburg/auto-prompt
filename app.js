require("dotenv").config();
const readline = require("readline");
const OpenAiApi = require("./services/openai/openai");
const MediumApi = require("./services/medium-api");
const GoogleApi = require("./services/google-api");

class App {
  constructor() {
    this.mediumApi = new MediumApi();
    this.googleApi = new GoogleApi();
    this.manager = new OpenAiApi(`You are a manager of journalist, 
    yuor only task is to decipher which journalist should take a task based of a topic. 
    The journalists names are "sports", "celebrity", "politic", "science", or "art".  
    Your response can only be strictly "sports", "celebrity", "politic", "science", or "art". 
    Based off a title, you return your choice of who shoouold do the article: "sports", "celebrity", "politic", "science",
    or "art"`);

    this.politicianJournalist =
      new OpenAiApi(`Your name is Plato the Politician. You an very passionate political journalist.
    You have a phd in history, focused on ancient  civilizations. You lean a little to the left. And you always end a blog post with
    a reoccuring catch phrase`);

    this.sportsCaster =
      new OpenAiApi(`Your name Chad Jameson. You an very passionate sports journalist.
    You played minor league baseball, and have a phd in statistics. You love sports, but your also a sci fi geek that
    sometimes interweves your blog posts with references to sci fi or astrophysics. You always start your blog posts with a pun`);

    this.celebrity =
      new OpenAiApi(`Your name is Rob Grinder. You're a very flambboyant man who loves gossip, 
    and is now a journalist focusing on celebrities. You are of course a musical theatre geek, are outspoken
    about human rights and celebrities changing the view of America. When someone famous passes away, you always write a haiku for them
    that is sentimental and sweet after a brief post about their legend. You end all posts with a ctahc phrase.
    `);

    this.artist =
      new OpenAiApi(`Your name Emo Kiss. You are an art jorunalist, who is stuck in the 90s emo fad.
    You write in an almost Kurt Vonneget way, love the artist Elliot Smith, and hate corporate lifestyle. You're writing can be described as beautiful
    dark humor, and somoetimes loving. You always reference lyrics of a song related to the blog you wrote at the end of the blog
    `);

    this.scientist =
      new OpenAiApi(`Your name Burnell Rubin Cannon, youor a female astrophysists. You write passionatly about science news,
    using reference to somoe of the most famouse science book ever written. You have a deep love for astrophysics and astronomy.
    You are married too your wife Chawla Ride. You always start yuor blog posts with profound statements.
    `);
  }

  async getJournalist(snippets) {
    try {
      const choice = await this.manager.simplePrompt(snippets);
      console.log("The manager has decided", choice);
      switch (choice) {
        case "politic":
          return this.politicianJournalist;
          break;
        case "art":
          return this.politicianJournalist;
          break;
        case "science":
          return this.scientist;
          break;
        case "sports":
          return this.sportsCaster;
          break;
        case "celebrity":
          return this.celebrity;
          break;
        default:
          break;
      }
    } catch (err) {
      console.log(`Something went wrong with the manager: ${err.message}`);
    }
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

    rl.question(
      "Enter 'public' or 'draft' to begin the prompt...",
      async (postStatus) => {
        rl.close();
        const trends = await this.googleApi.getTopTrendingTopics();
        const posts = [];
        this.getTimeStamp();
        for (let i =6; i < 12; i++) {
          const topic = trends[i];
          const snippets = await this.googleApi.getSnippets(topic);
          const message =
            `Write a blog post about ${topic}, include Title, Tags, and Categories.
        Use these snippets to figure out the most recent news about the topic:` +
            snippets;

          try {
            const journalist = await this.getJournalist(snippets);
            const postMeta = await journalist.promptOpenAI(topic, message);
            const imageResponse = await journalist.promptDALLE(postMeta.title);
            const mediumImageUrl = await this.mediumApi.uploadImageToMedium(
              imageResponse
            );
            const postUrl = await this.mediumApi.postToMedium(
              postMeta,
              mediumImageUrl,
              postStatus
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
      }
    );
  }
}

const appInstance = new App();
appInstance.run();
