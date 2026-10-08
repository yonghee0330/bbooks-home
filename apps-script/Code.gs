/**
 * 비북스의 미래 — 포스트잇 벽 백엔드 (Google Apps Script 웹 앱)
 *
 * 시트 '미래' 열: 시각 | ID | 내용 | 이름 | 색 | 숨김
 *  - 숨김 칸에 Y를 적으면 벽에서 내려갑니다 (검수용).
 *
 * 설치: SETUP.md 참고. 배포 후 웹 앱 URL을 index.html의 FUTURE_API에 넣습니다.
 */
var SHEET = '미래';
var COLORS = ['y', 'p', 'o', 'g', 'b', 'v'];
var MAX_LIST = 300;

/** @OnlyCurrentDoc */
function setup() { return sheet_(); }

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET) || ss.insertSheet(SHEET);
  if (sh.getLastRow() === 0) {
    sh.appendRow(['시각', 'ID', '내용', '이름', '색', '숨김']);
    sh.setFrozenRows(1);
    sh.setColumnWidth(3, 420);
  }
  return sh;
}

function doGet(e) {
  return json_(list_());
}

function doPost(e) {
  var body = {};
  try { body = JSON.parse(e.postData.contents || '{}'); } catch (err) { return json_({ ok: false, error: 'bad' }); }
  if (body.action !== 'add') return json_({ ok: false, error: 'bad' });
  if (body.hp) return json_({ ok: true, id: 'x' }); // 봇이 채운 숨은 칸

  var text = String(body.text || '').replace(/\s+/g, ' ').trim().slice(0, 80);
  var name = String(body.name || '').replace(/\s+/g, ' ').trim().slice(0, 12);
  var color = COLORS.indexOf(body.color) > -1 ? body.color : 'y';
  if (text.length < 2) return json_({ ok: false, error: 'short' });
  if (/https?:\/\/|www\./i.test(text + name)) return json_({ ok: false, error: 'link' });

  var cache = CacheService.getScriptCache();
  var dupKey = 'd_' + Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, text));
  if (cache.get(dupKey)) return json_({ ok: false, error: 'busy' });
  var burst = Number(cache.get('burst') || 0);
  if (burst > 40) return json_({ ok: false, error: 'busy' }); // 10분에 40장 넘게 몰리면 잠시 막음

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sh = sheet_();
    var id = Utilities.getUuid().slice(0, 8);
    sh.appendRow([new Date(), id, text, name, color, '']);
    cache.put(dupKey, '1', 600);
    cache.put('burst', String(burst + 1), 600);
    return json_({ ok: true, id: id });
  } finally {
    lock.releaseLock();
  }
}

function list_() {
  var sh = sheet_();
  var rows = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 6).getValues() : [];
  var notes = rows
    .filter(function (r) { return r[2] && String(r[5]).toUpperCase() !== 'Y'; })
    .map(function (r) { return { ts: new Date(r[0]).toISOString(), id: String(r[1]), text: String(r[2]), name: String(r[3]), color: String(r[4]) }; })
    .reverse();
  return { ok: true, count: notes.length, notes: notes.slice(0, MAX_LIST) };
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
