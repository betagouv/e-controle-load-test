import { check, group, sleep, fail } from 'k6'
import { Counter, Rate } from 'k6/metrics'
import { login } from './utils.js'
import { visitPage } from './utils.js'
import http from 'k6/http'


const serverUrl = `${__ENV.K6_HOST}`
const questionnaireId = `${__ENV.K6_TARGET_EDIT_QUESTIONNAIRE_ID}`


export function setup() {
  console.log('Running setup')
  group('login', () => {
      login()
  })
  // We need to send the cookieJar to keep a copy in order to maintained
  // it from setup function to main function.
  return { cookies: http.cookieJar().cookiesForURL(serverUrl) };
}


export default function(data) {
  // Using the setup() cookie jar as the starting point for all VUs
  if (__ITER === 0) {
    let jar = http.cookieJar()
    Object.keys(data.cookies).forEach(key => {
        jar.set(serverUrl, key, data.cookies[key][0])
    })
  }
  let response = visitPage(serverUrl + 'questionnaire/modifier/' + questionnaireId + '/')
  const PAGE_KEYWORD = 'questionnaire-create'
  let thisIsTheControlPage = response.body.includes(PAGE_KEYWORD)
  if (!thisIsTheControlPage) {
    fail(`Test is probably not in the expected page. Keyword "${PAGE_KEYWORD}" not found in page content.`)

  }
}
