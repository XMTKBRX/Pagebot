const config = require("./config.json");
const utils = require("./modules/utils");
const fs = require("fs");

let messagesCache = config.clearData ? {} : JSON.parse(fs.readFileSync("./page/data.json", "utf8"));

const messagesFilePath = "./page/data.json";
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

function writeToFile() {
  try {
    const dataToWrite = JSON.stringify(messagesCache, null, 2);
    const fileStats = fs.existsSync(messagesFilePath) ? fs.statSync(messagesFilePath) : null;

    if (fileStats && fileStats.size > MAX_FILE_SIZE) {
      pruneMessagesCache();
    }

    fs.writeFileSync(messagesFilePath, dataToWrite, "utf8");
  } catch (error) {
    console.error("❌ Error writing to file:", error);
  }
}

function pruneMessagesCache() {
  const keys = Object.keys(messagesCache);
  if (keys.length > 1000) {
    delete messagesCache[keys[0]];
    pruneMessagesCache();
  }
}

module.exports.listen = function (req, res) {
  try {
    let event = req.body;
    if (event.object === "page") {
      event.entry.forEach((entry) => {
        entry.messaging.forEach(async (event) => {
          event.type = await utils.getEventType(event);
          global.PAGE_ACCESS_TOKEN = config.PAGE_ACCESS_TOKEN;

          if (["message", "message_reply", "attachments", "message_reaction"].includes(event.type)) {
            const mid = event.message?.mid || event.reaction?.mid;

            if (event.type === "message" || event.type === "attachments" || event.type === "message_reply") {
              const text = event.message.text;
              const attachments = event.message.attachments;

              if (mid && text) messagesCache[mid] = { text };
              if (mid && attachments) messagesCache[mid] = { ...messagesCache[mid], attachments };
            }

            if (event.type === "message_reply") {
              const messageID = event.message.reply_to?.mid;
              if (messageID && messagesCache[messageID]) {
                event.message.reply_to.text = messagesCache[messageID].text || null;
                event.message.reply_to.attachments = messagesCache[messageID].attachments || null;
              }
            }

            if (event.type === "message_reaction") {
              if (messagesCache[mid]) {
                event.reaction.text = messagesCache[mid].text || null;
                event.reaction.attachments = messagesCache[mid].attachments || null;
              }
            }
          }

          if (config.selfListen && event?.message?.is_echo) return;
          writeToFile();
          utils.log(event);

          require("./page/main")(event);
        });
      });
    }
    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Webhook error:", error);
    res.sendStatus(500);
  }
};
