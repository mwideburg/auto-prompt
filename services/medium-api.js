const axios = require("axios");
const FormData = require("form-data");
require("dotenv").config();

class MediumApi {
  constructor() {
    this.mediumApiKey = process.env.MEDIUM_API_KEY;
    this.userId = process.env.USER_ID;
  }

  async postToMedium(meta, imageUrl, postStatus) {
  const { title, tags, post } = meta;
  const mediumEndpoint = `https://api.medium.com/v1/users/${this.userId}/posts`;
  const mediumHeaders = {
    Authorization: `Bearer ${this.mediumApiKey}`,
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
        publishStatus: postStatus,
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

  async uploadImageToMedium(response) {
    console.log("Uploading image to Medium...");

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
        Authorization: `Bearer ${this.mediumApiKey}`,
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
    const mediumImageUrl = mediumImagerespone.data.data.url;

    return mediumImageUrl;
  }
}

module.exports = MediumApi;
