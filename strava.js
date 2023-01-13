const getAccessToken = async () => {
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
        method: 'POST',
        headers,
        body,
    })

    return reauthorizeResponse.json()
}


export const getActivity = async () => {
    
    const { access_token: accessToken } = await getAccessToken()
    return accessToken
    
    
}