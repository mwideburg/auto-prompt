const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
require("dotenv").config();

const openAiKey = process.env.OPENAI_API_KEY;
const mediumApiKey = process.env.MEDIUM_API_KEY;
const userId = process.env.USER_ID;

async function getTopTrendingTopics() {
  const endpoint =
    "https://trends.google.com/trends/hottrends/visualize/internal/data";
  return axios
    .get(endpoint)
    .then((response) => {
      console.log("Trends receieved");
      const trends = response.data["united_states"];
      return trends;
    })
    .catch((error) => {
      console.log(`Error retrieving trends: ${error.message}`);
    });
}

async function promptOpenAI(topic, message) {
  const postEndpoint = "https://api.openai.com/v1/chat/completions";

  const postData = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are a journalist who writes about popular topics but with references science, science fiction, cult movies, and astrophysics",
      },
      { role: "user", content: message },
    ],
    max_tokens: 1000,
  };

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${openAiKey}`,
  };

  console.log("Getting prompt");

  const response = await axios
    .post(postEndpoint, postData, { headers })
    .then((res) => {
      console.log("Success gettting prompt");
      return res;
    })
    .catch((error) => {
      console.log(`Error getting prompt: ${error.message}`);
    });

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

async function promptDALLE(title) {
  console.log("Prompting DALLE-E");
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${openAiKey}`,
  };
  const dalleEndpoint = "https://api.openai.com/v1/images/generations";
  const dalleData = {
    prompt: `pixel art about ${title}`,
    n: 1,
    size: "512x512",
  };

  const dalleResponse = await axios
    .post(dalleEndpoint, dalleData, {
      headers,
    })
    .then((res) => {
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

  let data = new FormData();
  data.append(
    "Content-Disposition",
    'form-data; name="image"; filename=`testing.png`'
  );
  data.append("Content-Type", "image/png");
  data.append("image", response.data);

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.medium.com/v1/images",
    headers: {
      Authorization: `Bearer ${mediumApiKey}`,
      "Content-Type": "multipart/form-data; boundary=FormBoundaryXYZ",
      Accept: "application/json",
      "Accept-Charset": "utf-8",
      ...data.getHeaders(),
    },
    data: data,
  };

  const mediumImagerespone = await axios
    .request(config)
    .then((response) => {
      console.log("Success posting image to medium");
      return response;
    })
    .catch((error) => {
      console.log("Error posting image", error.message);
    });
  const imageUrl = mediumImagerespone.data.data.url;

  return imageUrl;
}

async function postToMedium(meta, imageUrl, topic) {
  const { title, tags, post } = meta;
  const mediumEndpoint = `https://api.medium.com/v1/users/${userId}/posts`;
  const mediumHeaders = {
    Authorization: `Bearer ${mediumApiKey}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    "Accept-Charset": "utf-8",
  };
  const mediumResponse = await axios
    .post(
      mediumEndpoint,
      {
        title,
        tags,
        contentFormat: "html",
        content:
          "<h1>" + title + "</h1>" + "<img src=" + imageUrl + " />" + post,
        publishStatus: "public",
      },
      { headers: mediumHeaders }
    )
    .then(async (res) => {
      console.log("Medium posted successfully");
    })
    .catch((err) => {
      console.log(`Error posting to medium, ${err.message}`);
    });

  return mediumResponse;
}

async function app() {
  const trends = await getTopTrendingTopics();
  const posts = [];
  for (let i = 0; i < 3; i++) {
    const topic = trends[i];
    const message = `Write a blog post about ${topic}, 
      extrapolate the reason this would be the current most trending topic. 
      Include Title, Tags, and Categories.`;

    try {
      const postMeta = await promptOpenAI(topic, message);
      const imageURL = await promptDALLE(postMeta.title);
      await postToMedium(postMeta, imageURL, topic);
    } catch (err) {
      console.log(`Something went wrong: ${err.message}`);
      continue;
    }
  }
}

app();
