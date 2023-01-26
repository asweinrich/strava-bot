import 'dotenv/config';
import express from 'express';
import { DateTime } from 'luxon';
import axios from 'axios';
import crypto from 'crypto';
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
  RIDETHEWAVE_COMMAND,
  HasGuildCommands,
} from './commands.js';
import { getAccessToken } from './strava.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

let channel = null

client.once(Events.ClientReady, c => {
  channel = client.channels.cache.get('1058121514404282428');
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

    // "ridethewave" guild command
    if (name === 'ridethewave') {
      const exampleEmbed = new EmbedBuilder()
        .setColor('#5563fa')
        .setTitle('MLC Wave Runners')
        .setAuthor({ name: 'Strava' })
        .setURL('https://strava.com/clubs/mlc-wave-runners/')
        .setThumbnail('https://asweinrich.dev/media/WAVERUNNERS.png')
        .setDescription('Join the club and run with the best')         
        .setTimestamp()
        .setFooter({ text: 'MLC Wave Runners', iconURL: 'https://asweinrich.dev/media/WAVERUNNERS.png' });
      // Send a message into the channel where command was triggered from
      return res.send({ 
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [exampleEmbed] 
        }
      });
    }
    // additional guild commands go here: 
  }

});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);

  // Check if guild commands from commands.js are installed (if not, install them)
  HasGuildCommands(process.env.APP_ID, process.env.GUILD_ID, [
    RIDETHEWAVE_COMMAND,
  ]);
});

let lastActivity = null;
let accessToken = null;

setInterval(() => {

    getAccessToken()
      .then(token => {
          accessToken = token

      })
      .catch(error => {
          console.error(error)
      })

    axios.get('https://www.strava.com/api/v3/clubs/1100648/activities?page=1&per_page=1', {
        headers: {
            'Authorization': 'Bearer '+accessToken
        }
    }).then((response) => {

      const data = response.data

      const activityName = data[0].name
      const athlete = data[0].athlete.firstname+' '+data[0].athlete.lastname
      const dist = Number((data[0].distance/1600).toFixed(2))
      const seconds = data[0].moving_time
      let duration = 0
      if(seconds > 3600) {
        const hours = (seconds/3600).toFixed(0)
        const minutes = ((seconds%3600)/60).toFixed(0)
        duration = hours+' Hr '+minutes+' Min'
      } else {
        const minutes =(seconds/60).toFixed(0)
        duration = minutes+' Min'
      }

      const activityID = generateHash(athlete+activityName+seconds)
      if(lastActivity === activityID) {
        console.log('Last Activity Hash: '+lastActivity);
        console.log('No New Activites');
      } else {
        const speed = (dist/(seconds/3600)).toFixed(1)
        const paceRaw = (seconds/dist)
        const paceMin = Math.trunc(paceRaw/60)
        let paceSec = (((paceRaw/60)%paceMin)*60).toFixed(0)
        if(paceSec < 10) {
          paceSec = paceSec.toString().padStart(2, '0')
        }
        const pace = paceMin+':'+paceSec

        const activity = data[0].sport_type

        const message = athlete+' just completed a '+dist+' mile '+activity.toLowerCase()+'!'

        console.log(response.data);

        if(activity === 'Ride') {

          // inside a command, event listener, etc.
          const exampleEmbed = new EmbedBuilder()
            .setColor('#5563fa')
            .setTitle(activityName)
            .setDescription(message)
            .addFields(
              { name: 'Distance', value: dist+' Miles', inline: true },
              { name: 'Time', value: duration, inline: true },
              { name: 'Avg Speed', value: speed+' MPH', inline: true },
            )
            .setThumbnail('https://asweinrich.dev/media/WAVERUNNERS.png')         
            .setTimestamp()
            .setFooter({ text: 'MLC Wave Runners' , iconURL: 'https://asweinrich.dev/media/WAVERUNNERS.png'});
          channel.send({ embeds: [exampleEmbed] });

        } else if(activity === 'Run') {

          // inside a command, event listener, etc.
          const exampleEmbed = new EmbedBuilder()
            .setColor('#77c471')
            .setTitle(activityName)
            .setDescription(message)
            .addFields(
              { name: 'Distance', value: dist+' Miles', inline: true },
              { name: 'Time', value: duration, inline: true },
              { name: 'Avg Pace', value: pace+' per mile', inline: true },
            )
            .setThumbnail('https://asweinrich.dev/media/WAVERUNNERS.png')          
            .setTimestamp()
            .setFooter({ text: 'MLC Wave Runners' , iconURL: 'https://asweinrich.dev/media/WAVERUNNERS.png' });
          channel.send({ embeds: [exampleEmbed] });

        } else {

          // inside a command, event listener, etc.
          const exampleEmbed = new EmbedBuilder()
            .setColor('#aa0000')
            .setTitle(activityName)
            .setDescription(message)
            .addFields(
              { name: 'Distance', value: dist+' Miles', inline: true },
              { name: 'Time', value: duration, inline: true },
            )
            .setThumbnail('https://asweinrich.dev/media/WAVERUNNERS.png')          
            .setTimestamp()
            .setFooter({ text: 'MLC Wave Runners' , iconURL: 'https://asweinrich.dev/media/WAVERUNNERS.png' });
          channel.send({ embeds: [exampleEmbed] });

        }

        lastActivity = activityID
      
      }      

        
    }).catch((error) => {
        console.error(error);
    });
}, 120000);
