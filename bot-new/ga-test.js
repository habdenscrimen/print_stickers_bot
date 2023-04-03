const fetch = require('node-fetch')

const measurement_id = `G-V1BSH2PGXM`
const api_secret = `m5ODmkGeT2u-g9-voE6RNA`

fetch(
  `https://www.google-analytics.com/mp/collect?measurement_id=${measurement_id}&api_secret=${api_secret}`,
  {
    method: 'POST',
    body: JSON.stringify({
      client_id: 'tg',
      events: [
        {
          name: 'purchase',
          // params: {},
        },
      ],
    }),
  },
).catch((error) => {
  console.error(`error is`, error)
})
