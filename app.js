import 'dotenv/config';
import express from 'express';
import { DateTime } from 'luxon';
import axios from 'axios';
import { Client, Events, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from 'discord-interactions';
import { VerifyDiscordRequest, getRandomEmoji, DiscordRequest } from './utils.js';
import {
  JOIN_COMMAND,
  HasGuildCommands,
} from './commands.js';
import { StravaAccess } from './strava.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

let channel = null

client.once(Events.ClientReady, c => {
  channel = client.channels.cache.get('942115367935967264');
  console.log('Ready! Logged in as '+c.user.tag);
  console.log('Currently sending updates in :'+channel)
});

client.login(process.env.DISCORD_TOKEN);

function generateHash(string) {
    var hash = 0;
    if (string.length == 0)
        return hash;
    for (let i = 0; i < string.length; i++) {
        var charCode = string.charCodeAt(i);
        hash = ((hash << 7) - hash) + charCode;
        hash = hash & hash;
    }
    return hash;
}


// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

// Store for in-progress games. In production, you'd want to use a DB
const activeGames = {};

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post('/interactions', async function (req, res) {
  // Interaction type and data
  const { type, id, data } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    // "join" guild command
    if (name === 'join') {
      const exampleEmbed = new EmbedBuilder()
        .setColor('#77c471')
        .setTitle('Join MLC Wave Runners')
        .setURL('https://strava.com/clubs/mlc-wave-runners/')
        .setDescription('Request to join the Strava club for MLC. The Wave Runners Swim, Bike, Run, and everything in between.')         
        .setTimestamp()
        .setFooter({ text: 'MLC Wave Runners' });
      // Send a message into the channel where command was triggered from
      channel.send({ embeds: [exampleEmbed] });
    }
    // additional guild commands go here: 
  }

});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);

  // Check if guild commands from commands.js are installed (if not, install them)
  HasGuildCommands(process.env.APP_ID, process.env.GUILD_ID, [
    JOIN_COMMAND,
  ]);
});

let lastActivity = null;


setInterval(() => {

    const strava_access = StravaAccess()
    console.log(strava_access)
    
}, 30000);
