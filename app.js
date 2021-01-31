const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require("fs");
const { resolve } = require('path');
const config = JSON.parse(fs.readFileSync("./config.json"));
const request = require('request');
const terms = ["だめだね", "ダメだね"];
const cron = require("node-cron");


class cache {
    constructor() {
        this.cached = false;
        this.cache = []
    }
}
let cacheData = new cache();

Array.prototype.sample = function () {
    return this[Math.floor(Math.random() * this.length)];
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async (msg) => {
    if (terms.some(term => (msg.content.indexOf(term) !== -1))) {
        if (!cacheData.cached) {
            msg.channel.startTyping();
            const requestData = await new Promise((resolve, reject) => {
                console.log("Request occurred!");
                request.get(`https://api.tenor.com/v1/search?key=${config.token.tenor}&q=bakamitai&limit=50`, (error, response, body) => {
                    if (error !== null) {
                        console.log(error);
                        reject(error);
                        return;
                    }
                    resolve(JSON.parse(body).results)
                })
            })
            cacheData.cache = requestData;
            cacheData.cached = true;
            msg.channel.stopTyping();
        }
        const result = cacheData.cache.sample().url;
        msg.reply(result)

    } else {
    }
});

cron.schedule("*/5 * * * *", () => {
    cacheData.cached = false;
})

client.login(config.token.discord);