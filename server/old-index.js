// NON socket.io && NON express version
const http = require("http");
const path = require("path");
// needle is our http client for requests
const needle = require("needle");
// .env file needs this
const config = require("dotenv").config();
const TOKEN = process.env.TWITTER_BEARER_TOKEN;

const rulesURL = "https://api.twitter.com/2/tweets/search/stream/rules";
const streamURL =
  "https://api.twitter.com/2/tweets/search/stream?tweet.fields=public_metrics&expansions=author_id";

// keyword we are looking for
const rules = [{ value: "Basingstoke" }];

// Get stream rules
async function getRules() {
  const repsonse = await needle("get", rulesURL, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });
  return response.body;
}

// Set stream rules
async function setRules() {
  const data = {
    add: rules,
  };
  const repsonse = await needle("post", rulesURL, data, {
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
  });
  return response.body;
}

// Delete stream rules
async function deleteRules(rules) {
  if (!Array.isArray(rules.data)) {
    return null;
  }

  const ids = rules.data.map((rule) => rule.id);

  const data = {
    delete: {
      ids: ids,
    },
  };
  const repsonse = await needle("post", rulesURL, data, {
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
  });
  return response.body;
}

function streamTweets() {
  const stream = needle.get(streamURL, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });
  stream.on("data", (data) => {
    try {
      const json = JSON.parse(data);
    } catch (error) {
      // the empty catch will keep the stream open even if there are no tweets
    }
  });
}

(async () => {
  let currentRules;

  try {
    // Get all stream rules
    currentRules = await getRules();
    // Delete all stream rules (wipe it clean)
    await deleteRules(currentRules);
    // Set rules based on the array above
    await setRules();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  streamTweets();
})();
