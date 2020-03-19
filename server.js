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

const GithubRepo = "GewoonJaap/ZBLauncherDownload";

UpdateReleases();

const interval = setInterval(UpdateReleases, 60000);

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
app.use(express.static("public"));

// https://expressjs.com/en/starter/basic-routing.html
app.get("/download", (request, response) => {
  response.redirect(latesturl);
});
app.get("/", (request, response) => {
  response.send(
    "Beschikbare URL's:<br>/version om de laatste versie info te zien.<br>/download om de laatste versie te downloaden"
  );
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
