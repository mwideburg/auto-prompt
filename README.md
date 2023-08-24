# Auto AI Blog Poster & Image Generator

Automate your blogging experience with the power of AI. This tool integrates OpenAI's capabilities with Medium to automatically draft and post blogs. Additionally, it can generate AI-driven images to accompany your articles, enhancing their visual appeal.

## 🚀 Live Blog Demonstration
Check out an actual blog post created using this tool: [Live Blog Example](https://medium.com/@shagandbigfoot)

## 🛠 Setup Instructions

### API Keys & .env Configuration
Before you begin, ensure you have API keys from both [OpenAI](https://openai.com/) and [Medium](https://medium.com/). Also, take note of your userID from your Medium account.

Here's a template of what your `.env` file should look like, based on the `.env-example`:

```env
OPENAI_API_KEY = YOUR_OPENAI_API_KEY
MEDIUM_API_KEY = YOUR_MEDIUM_API_KEY
USER_ID = YOUR_MEDIUM_USER_ID

## Running Application
First install the dependencies:

```console
npm i
```

To run the application run
```console
node main.js
```





