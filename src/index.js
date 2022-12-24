const fs = require(`fs`)
const client = require(`./client.js`)

const SEARCH_GLOBAL_TIMEOUT_MS = 1000
const DELETE_GLOBAL_TIMEOUT_MS = 1000

const yield = ms => new Promise(r => setTimeout(r, ms))

async function exhaust_delete(authorization, parameters) {
    const agent = new client(authorization)

    const trimmed_parameters = { ...parameters }

    const guild_id = trimmed_parameters.guild_id
    trimmed_parameters.guild_id = undefined

    let messages
    let offset = 0
    let deletes = 0
    
    let total_results

    if (trimmed_parameters.offset == undefined) {
        trimmed_parameters.offset = 0
    }

    do {
        const [ search_status, search_results ] = await agent.search(guild_id, trimmed_parameters)
        
        if (search_status == `OK`) {
            if (!total_results) {
                total_results = search_results.total_results
            }
            
            messages = search_results.messages
            // offset += 25 // we shouldnt be using this, but instead we will change offset randomly to fix weird bugs
            const new_offset = Math.floor(Math.random() * 3) * 25
            console.log(`UPDATING OFFSET -- ${trimmed_parameters.offset} to ${new_offset}`)
            trimmed_parameters.offset = new_offset

            for (const [ message ] of messages) {
                const [ delete_status, delete_result ] = await agent.delete_message(message)

                // doesnt matter because it will be recollected in next message batch...? lets wait anyway...😾

                if (delete_status == "OK") {
                    deletes++
                    console.log(`DELETED ${message.id} (${deletes} of ${total_results})`)
                } else if (delete_status == `TIMEOUT`) {
                    console.log(`DELETE TIMEOUT (${delete_result.retry_after * 1000 + 50} ms)`)
                    await yield(delete_result.retry_after * 1000 + 50)
                }

                await yield(DELETE_GLOBAL_TIMEOUT_MS)
            }
        } else if (search_status == `TIMEOUT`) {
            console.log(`SEARCH TIMEOUT (${search_results.retry_after * 1000 + 50} ms)`)
            await yield(search_results.retry_after * 1000 + 50)
        }

        await yield(SEARCH_GLOBAL_TIMEOUT_MS)
    } while (messages.length > 0)
}

const [ , , token_file, ...queries ] = process.argv

const search_parameters = {} 
for (const query of queries) {
    const [ name, value ] = query.split(`=`)
    search_parameters[name] = value
}

const authorization = fs
    .readFileSync(token_file)
    .toString()

console.log(`CURRENT PARAMETERS: `, search_parameters)
/*
SEARCH PARAMETERS: 
guild_id=GUILD_SNOWFLAKE
channel_id=CHANNEL_SNOWFLAKE
author_id=USER_SNOWFLAKE
has=file/image/...
sort_order=asc // leave empty for descending
max_id=MESSAGE_SNOWFLAKE // you can convert the date into a snowflake to limit the timeframe you are searching; same for min_id
*/
exhaust_delete(authorization, search_parameters)
    .then(() => console.log(`EXHAUSTED DELETE`))