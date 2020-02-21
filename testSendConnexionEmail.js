import { Counter, Rate } from 'k6/metrics'
import { getCsrf } from './utils.js'
import { sleep, check } from 'k6'
import http from 'k6/http'


const serverUrl = `${__ENV.K6_HOST}`
const sendEmailTo = `${__ENV.K6_SEND_EMAIL_TO}`

const errorCounter200 = new Counter('errors_status_200_OK')
const errorCounterTransactionTime = new Counter('errors_transaction_time_OK')
const rateStatus200 = new Rate('rate_status_200_OK')
const rateTransactionTime = new Rate('rate_transaction_time_OK')


export default function() {
  let response = http.get(serverUrl)
  let formCsrf = getCsrf(response)
  response = response.submitForm({ 
    fields: { 
      email: sendEmailTo,
      csrfmiddlewaretoken: formCsrf,
    },
    params: {
      headers: {
        Referer: serverUrl,
      },
    },
  })
  let success = check(response, { 'status 200 OK': (r) => r.status === 200 })
  rateStatus200.add(success)
  if (!success) {
    errorCounter200.add(1)
  }
  success = check(response, { 'transaction time OK': (r) => r.timings.duration < 1000 })
  rateTransactionTime.add(success)
  if (!success) {
    errorCounterTransactionTime.add(1)
  }
  sleep(1) // Pause for 2.5'min
}