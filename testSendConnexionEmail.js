import { Counter, Rate } from 'k6/metrics'
import { getCsrf } from './utils.js'
import { sleep, check } from 'k6'
import http from 'k6/http'


const serverUrl = `${__ENV.K6_HOST}`
const sendEmailTo = `${__ENV.K6_SEND_EMAIL_TO}`

const errorCounter200 = new Counter('errors_status_200_OK')
const rateStatus200 = new Rate('rate_status_200_OK')
const errorCounterDuration = new Counter('errors_transaction_time_OK')

export let options = {
  vus: 150,
  duration: '5m',
}

export default function() {
  let res = http.get(serverUrl)
  let formCsrf = getCsrf(serverUrl)
  res = res.submitForm({ 
    fields: { 
      email: sendEmailTo,
      csrfmiddlewaretoken: formCsrf,
    },
    submitSelector: "submit" 
  })
  sleep(150) // Pause for 2.5'min
}