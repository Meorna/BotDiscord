require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();
const axios = require('axios');
const replace = require('replace-in-file');
var prefix = process.env.PREFIX;
console.log(prefix)
const TOKEN = process.env.TOKEN;


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('error', console.error);

client.on('message', async msg => {
    // joke, jokeCount et jokeCategories
    if (msg.content === prefix + "joke" || msg.content === prefix + "jokeCount" || msg.content === prefix + "jokeCategories") {
        // Base de l'URL de l'API
        var url = "http://api.icndb.com/";
        if (msg.content === prefix + 'joke'){
            // Une blague aléatoire de l'API
            url = url + "jokes/random";
        } else if (msg.content === prefix + 'jokeCount') {
            // Nombre de blague de l'API
            url = url + "jokes/count";
        } else if (msg.content === prefix + 'jokeCategories') {
            // Catégories de l'API
            url = url + "categories";
        }
        // Requête API 
        axios.get(url)
            .then(res => {
                if(msg.content === prefix + "joke") {
                    msg.reply(res.data.value.joke);
                } else {
                    msg.reply(res.data.value);
                }})
            .catch(error => msg.reply(error));
    // joke [id] et joke [category]
    } else if (msg.content.substr(0, prefix.length + 6) === prefix + "joke [" && msg.content[msg.content.length - 1] === ']'){
        // Transformer la chaîne de caractère entre crochet en entier
        const parsed = parseInt(msg.content.substr(prefix.length + 6, (msg.content.length - (prefix.length + 7))), 10);
        // La chaine n'est pas un entier (joke [category])
        if (isNaN(parsed)) {
            // Récupérer le tableau des catégories
            const res = await axios.get("http://api.icndb.com/categories");
            var i = 0;
            var find = false;
            while (i < res.data.value.length && !find) {
                if (msg.content.substr(prefix.length + 6, (msg.content.length - (prefix.length + 7))) === res.data.value[i]) {
                    axios.get("http://api.icndb.com/jokes/random?limitTo=" + msg.content.substr(prefix.length + 5))
                        .then(res => {
                            // Une blague en fonction de sa catégorie de l'API
                            msg.reply(res.data.value.joke);
                        })
                        .catch(error => msg.reply(error));
                    find = true;
                }
                i++;
            }
            if (!find) {
                msg.reply("Invalid category");
            }    
        // La chaîne est un entier (joke [id])
        } else {
            var url = "http://api.icndb.com/jokes/" + parsed;
            axios.get(url)
            .then(res => {
                if(res.data.type === "success") {
                    // Une blague en fonction de son id de l'API
                    msg.reply(res.data.value.joke);
                } else {
                    msg.reply("Invalid id");
                }})
            .catch(error => msg.reply(error));
        }
    // ping
    } else if (msg.content === prefix + 'ping') {
        let latency = Date.now() - msg.createdTimestamp;
        msg.reply("Pong ! " + "Latency : " + latency + " ms");
    // prefix [prefix]
    } else if (msg.content.substr(0, prefix.length + 8) === prefix + "prefix [" && msg.content[msg.content.length - 1] === ']') {
        var testPrefix = msg.content.substr(prefix.length + 8, msg.content.length - (prefix.length + 9));
        if (testPrefix == "%" || testPrefix == "?" || testPrefix == "!" || testPrefix == "$" || testPrefix == "#" || testPrefix == "*" || testPrefix == "//"){
            replace.sync({
                files: '.env',
                from: prefix,
                to: testPrefix,
              });
            prefix = testPrefix;
        	msg.reply("Prefix changed : " + prefix);
        } else {
            msg.reply("Invalid prefix. Valid prefix : %, ?, !, $, #, *, //");
        }
    }
});

// Se connecter au bot grâce au TOKEN
client.login(TOKEN);
