const axios = require("axios");
require("dotenv").config();

class GoogleApi {
  constructor() {
    this.googleApiKey = process.env.GOOGLE_API_KEY;
    this.googleSearchEngine = process.env.GOOGLE_SEARCH_ENGINE;
  }

  async getTopTrendingTopics() {
    const endpoint =
      "https://trends.google.com/trends/hottrends/visualize/internal/data";
    return axios
      .get(endpoint)
      .then((response) => {
        console.log("Trends received");
        const trends = response.data["united_states"];
        return trends;
      })
      .catch((error) => {
        console.log(`Error retrieving trends: ${error.message}`);
      });
  }

  async getSnippets(searchQuery) {
    console.log("Getting Snippets");
    const url = `https://www.googleapis.com/customsearch/v1?key=${this.googleApiKey}&cx=${this.googleSearchEngine}&q=${searchQuery}`;
    return axios
      .get(url)
      .then((response) => {
        const data = response.data;
        // Handle the API response here
        const searchResults = data.items; // Extract the search results
        let snippets = "";
        for (let item of searchResults) {
          snippets += item.snippet + "\n\n";
        }
        console.log("Snippets received");
        return snippets;
        // Continue with generating summaries using ChatGPT
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
}

module.exports = GoogleApi;
