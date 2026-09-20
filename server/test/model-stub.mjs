import { createServer } from 'http'

const MODE = process.env.STUB_MODE ?? 'valid'

const PLANS = {
  valid: {
    targetId: 'n_fd8f8a',
    confidence: 0.81,
    alternatives: ['n_1fd17c'],
    steps: [
      { level: 1, attr: 'family', edge: 'e_8821' },
      { level: 2, attr: 'generation', edge: 'e_8822' },
      { level: 3, attr: 'city', edge: 'e_9104' }
    ]
  },
  ghostEdge: {
    targetId: 'n_fd8f8a',
    confidence: 0.94,
    alternatives: [],
    steps: [
      { level: 1, attr: 'family', edge: 'e_NAO_EXISTE' },
      { level: 2, attr: 'generation', edge: 'e_8822' }
    ]
  },
  ghostAttr: {
    targetId: 'n_fd8f8a',
    confidence: 0.94,
    alternatives: [],
    steps: [{ level: 1, attr: 'inventado', edge: 'e_8821' }]
  },
  foreignEdge: {
    targetId: 'n_fd8f8a',
    confidence: 0.94,
    alternatives: [],
    steps: [{ level: 1, attr: 'family', edge: 'e_6604' }]
  }
}

let received = null

createServer((req, res) => {
  if (req.url === '/__received') {
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(JSON.stringify(received))
    return
  }

  let body = ''
  req.on('data', chunk => (body += chunk))
  req.on('end', () => {
    received = JSON.parse(body || '{}')

    if (MODE === 'timeout') return
    if (MODE === 'error') {
      res.writeHead(500)
      res.end('boom')
      return
    }

    const plan = PLANS[MODE] ?? PLANS.valid
    const whole = JSON.stringify(plan)

    res.writeHead(200, { 'content-type': 'application/json' })

    if (req.url?.includes('/chat/completions')) {
      res.end(JSON.stringify({ choices: [{ message: { content: whole } }] }))
      return
    }

    res.end(JSON.stringify({ content: [{ type: 'text', text: whole.slice(1) }] }))
  })
}).listen(4444, () => console.log(`stub em :4444 modo=${MODE}`))
