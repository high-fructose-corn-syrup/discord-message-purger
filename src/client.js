const https = require(`./https.js`)

const pack = json => JSON.stringify(json)
const unpack = str => JSON.parse(str)
const to_base64 = str => Buffer.from(str).toString(`base64`)

// take an arbitrary request and ensure all request headers exist
async function discord_request(authorization, method, url, body = ``) {
    const headers = {
        "authorization": authorization,
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) discord/1.0.48 Chrome/91.0.4472.164 Electron/13.6.6 Safari/537.36",
        "x-super-properties": to_base64(pack({
            "os": "Windows",
            "browser": "Discord Client",
            "release_channel": "canary",
            "client_version": "1.0.48",
            "os_version": "10.0.19041",
            "os_arch": "x64",
            "system_locale": "en-US",
            "client_build_number": 140672,
            "client_event_source": null
        }))
    }

    return https[method](url, { timeout: 10000, headers }, body)
}

class client {
    constructor(authorization) {
        this.authorization = authorization
    }

    async search(guild_id, queries) {
        let url = https.build_query(`https://canary.discord.com/api/v9/guilds/${guild_id}/messages/search`, queries)
        const result = await discord_request(this.authorization, `get`, url)
        switch (result.status) {
            case 200:     return [ "OK", unpack(result.body)]
            case 429:     return [ "TIMEOUT", unpack(result.body)]
            // case `ERROR`: return [ "ERROR" ]
            default:      return [ "ERROR", result.body ]
        }
    }

    async delete_message({ id, channel_id }) {
        let url = `https://canary.discord.com/api/v9/channels/${channel_id}/messages/${id}`
        const result = await discord_request(this.authorization, `delete`, url)
        switch (result.status) {
            case 204:     return [ "OK" ]
            case 429:     return [ "TIMEOUT", unpack(result.body) ]
            // case `ERROR`: return [ "ERROR" ]
            default:      return [ "ERROR", result.body ]
        }
    }
}

module.exports = client