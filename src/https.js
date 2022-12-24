const { request } = require(`https`)

function generic(method, url = ``, options = {}, data = ``) {
    options.method = method 
    return new Promise(resolve => {
        const req = request(url, options, resp => {
            const response = {
                body: ``,
                headers: resp.headers,
                status: resp.statusCode,
                native: resp
            }

            resp.on(`data`, c => response.body += c)
            resp.on(`end`, () => resolve(response))
        })

        // 'deprecated'
        req.on(`error`, e => resolve({ status: `ERROR`, body: e }))
        req.on(`timeout`, e => {
            req.destroy(true)
            resolve({ status: `ERROR`, body: e })
        })

        if (data !== ``) { req.write(data) }
        req.end()
    })
}

function build_query(url, query) {
    url += `?`
    const keys = Object.keys(query)
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        url += `${key}=${query[key]}`
        if (i < keys.length - 1) {
            url += `&`
        }
    }
    return url
}

module.exports = {
    get: (url, options) => generic(`GET`, url, options),
    post: (url, options, body) => generic(`POST`, url, options, body),
    delete: (url, options) => generic(`DELETE`, url, options),

    build_query: build_query
}