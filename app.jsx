import 'dotenv/config';
import express from 'express';
import { DateTime } from 'luxon';
import axios from 'axios';
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
      // Send a message into the channel where command was triggered from
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
          content: 'hello world <a href="https://strava.com>Link to Join</a>',
        },
      });
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





setInterval(() => {

    axios.get('https://www.strava.com/api/v3/clubs/1100648/activities?page=1&per_page=1', {
        headers: {
            'Authorization': 'Bearer '+process.env.STRAVA_KEY
        }
    }).then((response) => {

      const data = response.data

      const activityName = data[0].name
      const athlete = data[0].athlete.firstname+' '+data[0].athlete.lastname
      const dist = (data[0].distance/1600).toFixed(2)
      const activity = data[0].type

      const message = (
        <>
        <em>{activityName}</em>
        <br />
        {athlete} just completed a {dist} mile {activity}!
        </>

      )
      console.log(response.data);
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Sends activity message in channel
          content: message,
        },
      });

        
    }).catch((error) => {
        console.error(error);
    });
}, 60000);