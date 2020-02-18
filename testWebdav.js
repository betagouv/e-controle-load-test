import { check, group, sleep, fail } from 'k6'
import { Counter, Rate } from 'k6/metrics'
import { login } from './utils.js'
import { visitPage } from './utils.js'
import http from 'k6/http'


const webdavUrl = `${__ENV.K6_WEBDAV_URL}`


export default function(data) {
  let response = visitPage(webdavUrl)
  const PAGE_KEYWORD = 'WsgiDAV'
  let thisIsTheControlPage = response.body.includes(PAGE_KEYWORD)
  if (!thisIsTheControlPage) {
    fail(`Test is probably not in the expected page. Keyword "${PAGE_KEYWORD}" not found in page content.`)

  }
}
