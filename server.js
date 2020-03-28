// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();
let latesturl = "unknown";
let jsonresponse = {};
let downloadcount = 0;
const request = require("request");
const bodyParser = require("body-parser");

const GithubRepo = "GewoonJaap/ZBLauncherDownload";

UpdateReleases();

function UpdateReleases() {
  console.log("Updaten van launcher versie....");
  var options = {
    method: "GET",
    url: `https://api.github.com/repos/${GithubRepo}/releases/latest`,
    headers: {
      "User-Agent": "nodejs request"
    }
  };
  request(options, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      let json = JSON.parse(body);
      jsonresponse = json;
      for (let i = 0; i < json.assets.length; i++) {
        if (
          json.assets[i].browser_download_url.toString().includes(".exe") &&
          !json.assets[i].browser_download_url.toString().includes(".blockmap")
        ) {
          latesturl = json.assets[i].browser_download_url;
          downloadcount = json.assets[i].download_count;
          console.log(
            `Nieuwe launcher versie: ${latesturl} met ${downloadcount} downloads`
          );
          return;
        }
      }
    } else {
      console.log(Error);
    }
  });
}

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(bodyParser.json());
let jsonParser = bodyParser.json();
let urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(bodyParser.json({ type: "application/*+json" }));
const rateLimit = require("express-rate-limit");
const apiLimiterWebhook = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: "Too many requests, please calm down :P"
});
const apiLimiterGlobal = rateLimit({
  windowMs: 60 * 1000, // 1 minutes
  max: 10,
  message: "Too many requests, please calm down ;)"
});
app.use("/download", apiLimiterGlobal);
app.use("/version", apiLimiterGlobal);
app.use("/webhook", apiLimiterWebhook);

// https://expressjs.com/en/starter/basic-routing.html
app.get("/download", (request, response) => {
  response.redirect(latesturl);
});
app.get("/", (request, response) => {
  response.send(
    "Beschikbare URL's:<br>/version om de laatste versie info te zien.<br>/download om de laatste versie te downloaden"
  );
});
app.post("/webhook", (request, response) => {
  let json = request.body;
  console.log("Got a webhook!");
  try {
    console.log(JSON.stringify(request.body));
    if (json.repository.full_name == GithubRepo) {
      UpdateReleases();
      response.send("Got it!");
    } else {
      console.log(json.hook.config.secret);
      console.log("Invalid Repo name!");
      response.send("Invalid Repo Name!");
    }
  } catch (error) {
    response.send("Cannot POST /webhook");
  }
});
app.get("/version", (request, response) => {
  let json = {
    latestversion: jsonresponse.tag_name,
    updated_on: jsonresponse.published_at,
    publisher: jsonresponse.author.login,
    downloadcount: downloadcount
  };
  response.send(json);
});

// send the default array of dreams to the webpage

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
