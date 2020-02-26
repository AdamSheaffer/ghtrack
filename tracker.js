const axios = require("axios");
const fs = require("fs");
const { exec } = require("child_process");
const { format, isToday } = require("date-fns");
const [cohort, openFile] = process.argv.slice(2);

if (!cohort) {
  console.error("Error: You must provide a cohort number");
  return;
}

if (openFile) {
  const path = `${__dirname}/cohorts/${cohort}.txt`;
  const cmd = `open ${path}`;
  exec(cmd, error => {
    if (error) {
      console.error(
        `There was an error opening ${path}. Check to see that the file exists`,
        error
      );
    }
  });
  return;
}

const students = fs
  .readFileSync(`${__dirname}/cohorts/${cohort}.txt`)
  .toString()
  .split("\n")
  .filter(t => !!t)
  .map(h => h.replace("https://github.com/", ""));

const getRecentStudentGithubActivity = handle => {
  const url = `https://api.github.com/users/${handle}/events?page=1&per_page=15`;
  return axios
    .get(url)
    .then(({ data }) => {
      const pushOrCreateEvents = data
        .filter(ev => {
          const { type } = ev;
          return type === "PushEvent" || type === "CreateEvent";
        })
        .sort((a, b) => a.created_at - b.created_at);

      const lastActivity = pushOrCreateEvents.length
        ? format(
            new Date(pushOrCreateEvents[0].created_at),
            "MMM d, YYY hh:mm bb"
          )
        : "Unknown";

      const repo = pushOrCreateEvents.length
        ? pushOrCreateEvents[0].repo.name
        : "Unknown";

      const pushedToday = pushOrCreateEvents.length
        ? isToday(new Date(pushOrCreateEvents[0].created_at))
        : false;

      return {
        handle,
        lastActivity,
        repo,
        pushedToday: pushedToday ? "Yes" : "No"
      };
    })
    .catch(_err => {
      console.error(`There was an error fetching data for ${handle}`);
      return {
        handle,
        lastActivity: "Unknown",
        repo: "Unknown",
        pushedToday: "Unknown"
      };
    });
};

const requests = students.map(getRecentStudentGithubActivity);

Promise.all(requests).then(results => {
  console.log("👍👍 COMMIT LIST:");
  console.table(results.filter(s => s.pushedToday === "Yes"));

  console.log("\n\n👎👎 NON-COMMIT LIST:");
  console.table(results.filter(s => s.pushedToday === "No"));
});
