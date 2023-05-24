# Auto AI Blog Poster and Image Generater
This is a very basic example using OpenAI and Medium to create an automatic posting application leveraging AI to create blog posts with ai generated images of the top 10 trending topics of google.


## Live Blog Example
[Blog Example](https://medium.com/@shagandbigfoot)

## Setup .env
You will need API keys for [openAI](https://openai.com/), [medium](https://medium.com/), and your userID associated with your medium account.

Look at the example .env-example. You will need to replace replace the variables, and rename it .env

```
OPENAI_API_KEY = <OPENAI API KEY>
MEDIUM_API_KEY = <MEDIUM API KEY>
USER_ID= <MEDIUM USER ID>
```

## Running Application
First install the dependancies:

```console
npm i
```

To run the application run
```
node main.js
```





