import http from 'k6/http'
import { sleep, check } from 'k6'
import { Counter, Rate } from 'k6/metrics'

const serverUrl = `${__ENV.K6_HOST}`

const errorCounter200 = new Counter('errors_status_200_OK')
const rateStatus200 = new Rate('rate_status_200_OK')
const errorCounterDuration = new Counter('errors_transaction_time_OK')

export let options = {
  vus: 300,
  duration: '5m',
}

export default function() {
  const res = http.get(serverUrl)
  let success = check(res, { 'status 200 OK': (r) => r.status === 200 })
  rateStatus200.add(success)
  if (!success) {
    errorCounter200.add(1)
  }
  success = check(res, { 'transaction time OK': (r) => r.timings.duration < 1000 })
  if (!success) {
    errorCounterDuration.add(1)
  }
  sleep(2)
}
