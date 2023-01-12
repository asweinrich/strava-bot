# strava-discord-bot

Listens for new Activities in Strava and sends embedded Discord messages with Activity details. 

This repository contains the code for a JavaScript-based bot that listens for new activities in a specified Strava club and sends an embedded message to a specified Discord channel when a club member completes a new activity. This bot is hosted on Heroku and makes use of the following packages:

- **[discord.js](https://discord.js.org)** - A powerful JavaScript library for interacting with the Discord API
- **[axios](https://axios-http.com/docs/api_intro)** - A popular library for making HTTP requests
- **[luxon](https://moment.github.io/luxon/#/)** - A library for working with dates and times
- **[express](https://expressjs.com/)** - A minimal and flexible Node.js web application framework
- **[discord-interactions](https://github.com/discord/discord-interactions-js)** - A library for creating interactive message menus in Discord

## Setting up the bot
To set up the bot, you will need to do the following:

1. Create a new application and bot account on the Discord Developer Portal and invite the bot to your server
2. Create a new Strava API application and obtain your API key from the Strava API website
3. Create a new Heroku application and link it to this repository
4. Set the following environment variables on your Heroku application:
  - 'DISCORD_TOKEN': The token for your Discord bot
  - 'DISCORD_CHANNEL_ID': The ID of the Discord channel where the bot should post messages
  - 'STRAVA_CLUB_ID': The ID of the Strava club that the bot should listen to
  - 'STRAVA_API_KEY': Your Strava API key
5. Deploy the code to Heroku and start the bot

## Using the bot
Once the bot is set up and running, it will automatically listen for new activities in the specified Strava club and post an embedded message to the specified Discord channel when a new activity is completed.

In addition to the above functionality, this bot can be used for other uses based on Strava's API.

## Contributing
If you are interested in contributing to this project, please feel free to fork this repository and submit a pull request with your changes. Please make sure that your code follows the existing style and includes appropriate tests.

## License
This project is licensed under the MIT License.

## Note
The final version of the ReadMe file can be worked on and improved upon after discussing with the developers working on the project.
