// Attendance Bot – listens on /shift (custom path) ------------------
require("dotenv").config();
const { App, ExpressReceiver } = require("@slack/bolt");

// 1️⃣ Custom receiver that ONLY listens on /shift
const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  endpoints: "/shift"
});

// 2️⃣ Main Bolt app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver               // <-- plugs the custom receiver in
});

const ACTIONS = {
  start: (userId, ts) => ({
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `:arrow_forward: <@${userId}> *started their shift* at <!date^${ts}^{time} ({date_short})|now>.`
        }
      }
    ]
  }),

  break: (userId, ts) => ({
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `:coffee: <@${userId}> *is taking a break* as of <!date^${ts}^{time} ({date_short})|now>.`
        }
      }
    ]
  }),

  lunch: (userId, ts) => ({
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `:sandwich: <@${userId}> *is on lunch* starting at <!date^${ts}^{time} ({date_short})|now>.`
        }
      }
    ]
  }),

  end: (userId, ts) => ({
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `:stop_button: <@${userId}> *ended their shift* at <!date^${ts}^{time} ({date_short})|now>.`
        }
      }
    ]
  })
};


app.command("/shift", async ({ command, ack, client }) => {
  await ack();
  const keyword = (command.text || "").trim().toLowerCase();
  const ts = Math.floor(Date.now() / 1000);
  const message = ACTIONS[keyword]?.(command.user_id, ts);

  if (!message) {
    await client.chat.postEphemeral({
      channel: command.channel_id,
      user: command.user_id,
      text: "❗ Usage: `/shift start|break|lunch|end`"
    });
    return;
  }

  await client.chat.postMessage({
    channel: command.channel_id,
    ...message
  });
});


// 5️⃣ Start web server
(async () => {
  const port = process.env.PORT || 3000;
  await app.start(port);
  console.log(`⚡️ Attendance bot running on port ${port}`);
})();
