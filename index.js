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

// 3️⃣ Messages for each keyword
const ACTIONS = {
  start: "started their shift 🏁",
  break: "is taking a break 🍎",
  lunch: "is on lunch 🍱",
  end:   "ended their shift 🚶‍♂️", 
  back:   "is back from lunch/break 🔙"
};

// 4️⃣ Slash-command handler
app.command("/shift", async ({ command, ack, respond }) => {
  await ack();
  const keyword = (command.text || "").trim().toLowerCase();
  const phrase  = ACTIONS[keyword];
  if (!phrase) {
    await respond("❗ Usage: `/shift start|break|lunch|end`");
    return;
  }
  await respond(
    `<@${command.user_id}> ${phrase} at <!date^${Math.floor(Date.now()/1000)}^{time} ({date_short})|now>.`
  );
});

// 5️⃣ Start web server
(async () => {
  const port = process.env.PORT || 3000;
  await app.start(port);
  console.log(`⚡️ Attendance bot running on port ${port}`);
})();
