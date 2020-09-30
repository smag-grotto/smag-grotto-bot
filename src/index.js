const { Client } = require('discord.js');
const client = new Client();

const fetch = require('node-fetch');

require('dotenv').config(({ path: '../.env' }));

client.on('ready', () => console.log('Ready'));

client.on('message', message => {
  if (message.author.bot || !message.content.startsWith('.smag')) return;

  const args = message.content.slice(5).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if (command === 'register') {
    const name = message.author.username;
    const picture = message.author.avatarURL({ format: 'png', size: 128 });

    fetch(`http://${process.env.API_HOST}:${process.env.API_PORT}/members`, {
      method: 'POST',
      body: JSON.stringify({ name, picture }),
      headers: { 'Content-Type': 'application/json' }
    })
      .then(async res => [res, await res.json()])
      .then(([res, json]) => {
        if (res.status === 400) return message.channel.send('**Error:** You are already registered');

        return message.channel.send(`You are now registered. Check yourself out here: http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/members`);
      })
      .catch(err => message.channel.send(`Failed to connect to the API.\n\`\`\`${err.message}\`\`\``));
  }

  if (command === 'info') {
    const name = message.author.username;

    fetch(`http://${process.env.API_HOST}:${process.env.API_PORT}/members/${name}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(async res => [res, await res.json()])
      .then(([res, json]) => {
        if (res.status === 404) return message.channel.send('**Error:** You need to register with \`.smag register\`');

        return message.channel.send(`**Username:** ${json.name}\n**Picture:** <${json.picture}>\n**Bio:** ${json.bio}`);
      })
      .catch(err => message.channel.send(`Failed to connect to the API.\n\`\`\`${err.message}\`\`\``));
  }
});

process.on('unhandledRejection', console.error);

client.login(process.env.TOKEN);