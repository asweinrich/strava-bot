import axios from 'axios';

export default async (req, res) => {
    const headers = {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
    }

    const body = JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        refresh_token: process.env.STRAVA_REFRESH_TOKEN,
        grant_type: 'refresh_token',
    })

    const reauthorizeResponse = await fetch('https://www.strava.com/oauth/token', {
        method: 'post',
        "headers": headers,
        "body": body
    })

    const reAuthJson = await reauthorizeResponse.json()

    axios.get('https://www.strava.com/api/v3/clubs/1100648/activities?page=1&per_page=1', {
        headers: {
            'Authorization': 'Bearer '+reAuthJson.access_token
        }
    }).then((response) => {
        const data = response.data[0]

        const activityName = data[0].name
        const athlete = data[0].athlete.firstname+' '+data[0].athlete.lastname
        const dist = (data[0].distance/1600).toFixed(2)
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

        return res.status(200).json({
            activityName,
            athlete,
            dist
        })
    }
}