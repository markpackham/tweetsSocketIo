const http = require("http");
const path = require("path");
const express = require("express");
const socketIo = require("socket.io");
// needle is our http client for requests
const needle = require("needle");
// .env file needs this
const config = require("dotenv").config();
const TOKEN = process.env.TWITTER_BEARER_TOKEN;
const PORT = process.env.PORT || 3000;

const app = express();

const server = http.createServer(app);
const io = socketIo(server);

const rulesURL = "https://api.twitter.com/2/tweets/search/stream/rules";
const streamURL =
  "https://api.twitter.com/2/tweets/search/stream?tweet.fields=public_metrics&expansions=author_id";

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
})();
