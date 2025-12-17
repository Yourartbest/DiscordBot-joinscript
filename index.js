require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildInvites
  ]
});

const token = process.env.BOT_TOKEN;

// Cache invites
const invitesCache = new Map();

client.once('clientReady', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.guilds.cache.forEach(async guild => {
    const invites = await guild.invites.fetch();
    invitesCache.set(guild.id, new Map(invites.map(inv => [inv.code, inv.uses])));
  });
});

client.on('guildMemberAdd', async member => {
  const invites = await member.guild.invites.fetch();
  const cachedInvites = invitesCache.get(member.guild.id);
  const usedInvite = invites.find(inv => cachedInvites.get(inv.code) < inv.uses);

  if (usedInvite) {
    console.log(`${member.user.tag} joined using ${usedInvite.code}`);

    // Map invite codes to role IDs
    const roleMap = {
      "5t64muTcXf": "1450692769734721558",
      "cPnsDw6Tnc": "1450130167388180660"
    };

    const roleId = roleMap[usedInvite.code];
    if (roleId) {
      const role = member.guild.roles.cache.get(roleId);
      if (role) await member.roles.add(role);
    }
  }

  // Update cache
  invitesCache.set(member.guild.id, new Map(invites.map(inv => [inv.code, inv.uses])));

  // Send welcome message
  const channel = member.guild.channels.cache.find(ch => ch.name === "welcome-and-rules");
  if (channel) {
    channel.send(`Welcome ${member.user}, you've been assigned your role! 🎉`);
  }
});

client.login(token);

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot is running'));
app.listen(PORT, () => console.log(`Web server listening on port ${PORT}`));
