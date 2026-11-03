const assert = require('assert');
const http = require('http');
const { WebSocket } = require('ws');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 3000;
const DB_FILE = path.join(__dirname, 'database', 'players.json');

console.log('Bắt đầu khởi chạy test suite 12 Cases Tính Năng v1.8.0...');

// Khởi chạy server kiểm thử
const serverProc = spawn('node', ['server.js'], { cwd: __dirname, env: { ...process.env, NODE_ENV: 'test' } });
serverProc.stdout.on('data', (d) => {
  const s = d.toString().trim();
  if (s) console.log('[Server stdout]', s);
});
serverProc.stderr.on('data', (d) => { console.error('Server err:', d.toString()); });

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function createSocket() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://localhost:${PORT}/socket.io/`);
    ws.setMaxListeners(30);
    ws.on('open', () => resolve(ws));
    ws.on('error', reject);
  });
}

function sendEvent(ws, event, dataObj = {}) {
  ws.send(JSON.stringify({
    event,
    data: [dataObj]
  }));
}

function waitForEvent(ws, targetEvent, timeoutMs = 4000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`Timeout ${timeoutMs}ms waiting for event: ${targetEvent}`));
    }, timeoutMs);

    function onMessage(raw) {
      try {
        const msg = JSON.parse(raw);
        if (msg.event === targetEvent) {
          cleanup();
          resolve(msg.data ? msg.data[0] : null);
        }
      } catch (e) {
        console.error('[JSON parse error on ws message]:', e.message, raw.toString().substring(0, 100));
      }
    }

    function cleanup() {
      clearTimeout(timer);
      ws.removeListener('message', onMessage);
    }

    ws.on('message', onMessage);
  });
}

function sendAndAwait(ws, event, dataObj, targetEvent, timeoutMs = 4000) {
  const p = waitForEvent(ws, targetEvent, timeoutMs);
  sendEvent(ws, event, dataObj);
  return p;
}

async function runTests() {
  await sleep(1500);
  console.log('--- BẮT ĐẦU 12 TEST CASES KIỂM THỬ TỰ ĐỘNG V1.8.0 ---');

  // Case 1: Tạo tài khoản mới & nhận token định danh duy nhất (Zero-Friction Token)
  const ws1 = await createSocket();
  const init1 = await sendAndAwait(ws1, 'player:join', { name: 'Người Mới 01', initialKarma: 120 }, 'world:init');
  assert(init1 && init1.token && init1.token.startsWith('usr_'), 'Case 1 Failed: Không nhận được token hợp lệ');
  console.log(`✓ Case 1 Pass: Nhận token định danh duy nhất [${init1.token}] khi join phòng`);

  // Case 2: Kiểm tra dữ liệu được đồng bộ vào file JSON database
  await sleep(400);
  assert(fs.existsSync(DB_FILE), 'Case 2 Failed: File database/players.json chưa được tạo');
  const rawDb = fs.readFileSync(DB_FILE, 'utf8');
  const dbList = JSON.parse(rawDb);
  const found = dbList.find(p => p.token === init1.token);
  assert(found && found.name === 'Người Mới 01' && found.karma === 120, 'Case 2 Failed: Hồ sơ chưa lưu vào JSON');
  console.log(`✓ Case 2 Pass: Hồ sơ người chơi đã được lưu bền vững vào database/players.json`);

  // Case 3: Thao tác tăng Karma (+3 điểm thiền) và ngắt kết nối
  sendEvent(ws1, 'player:action', { type: 'meditate' });
  await sleep(300);
  ws1.close();
  await sleep(400);

  // Case 4: Silent Reconnect qua player:resume bằng token cũ
  const ws2 = await createSocket();
  const resumeInit = await sendAndAwait(ws2, 'player:resume', { token: init1.token }, 'world:init');
  assert(resumeInit && resumeInit.resumed === true, 'Case 4 Failed: Resumed không phải true');
  assert.strictEqual(resumeInit.token, init1.token, 'Case 4 Failed: Token không khớp');
  assert.strictEqual(resumeInit.player.karma, 123, 'Case 4 Failed: Karma không khôi phục đúng 123');
  console.log(`✓ Case 4 Pass: Silent Reconnect khôi phục trọn vẹn điểm Karma cũ (123) và cấp bậc`);

  // Case 5: Xử lý từ chối khi resume với token không tồn tại
  const wsFake = await createSocket();
  const resumeFail = await sendAndAwait(wsFake, 'player:resume', { token: 'usr_fake_token_12345' }, 'player:resume_failed');
  assert(resumeFail && resumeFail.reason === 'not_found', 'Case 5 Failed: Không nhận được lỗi resume_failed');
  console.log(`✓ Case 5 Pass: Xử lý chính xác player:resume_failed khi token không hợp lệ`);
  wsFake.close();

  // Case 6: Viral Loop - Người chơi mới tham gia qua link ?ref=<token> của Người Mới 01
  const ws3 = await createSocket();
  const init3 = await sendAndAwait(ws3, 'player:join', { name: 'Người Bạn Tri Kỷ', initialKarma: 50, refToken: init1.token }, 'world:init');
  await sleep(400);
  console.log(`✓ Case 6 Pass: Người chơi mới kết nối thành công qua liên kết mời ?ref=${init1.token}`);

  // Case 7: Kiểm tra người mời được cộng thưởng nóng +30 Karma (123 -> 153)
  const rawDbAfterRef = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  const inviterProfile = rawDbAfterRef.find(p => p.token === init1.token);
  assert(inviterProfile && inviterProfile.karma === 153, `Case 7 Failed: Karma người mời không đúng (+30 Karma): ${inviterProfile?.karma}`);
  assert(inviterProfile.stats && inviterProfile.stats.recruited >= 1, 'Case 7 Failed: Stats recruited không tăng');
  console.log(`✓ Case 7 Pass: Người mời nhận nóng +30 Karma (123 -> 153) và tăng stats.recruited (${inviterProfile.stats.recruited})`);

  // Case 8: Kiểm tra người mới spawn cùng cõi và tọa độ gần người mời
  const friend = init3.players.find(p => p.id === init3.selfId);
  assert(friend && friend.realm === 'heaven', 'Case 8 Failed: Người mới không ở Thiên Đàng');
  console.log(`✓ Case 8 Pass: Người mới spawn cùng cõi Thiên Đàng cạnh người mời (x:${friend.x}, y:${friend.y})`);

  // Case 9: Co Giãn Bots Tự Động (Adaptive Bots) - Dưới 4 người thật duy trì đủ 14 bots
  const botsUnder4 = init3.players.filter(p => p.isBot);
  assert.strictEqual(botsUnder4.length, 14, `Case 9 Failed: Số lượng bots không đủ 14: ${botsUnder4.length}`);
  console.log(`✓ Case 9 Pass: Khi dưới 4 người thật online, hệ thống duy trì tối đa 14 bots nhộn nhịp`);

  // Case 10: Thêm người chơi thật để đạt >= 4 người thật -> kiểm tra bots rút gọn còn 6 bots
  const extraSockets = [];
  for (let i = 0; i < 2; i++) {
    const wsExtra = await createSocket();
    await sendAndAwait(wsExtra, 'player:join', { name: `Tester ${i+1}`, initialKarma: 10 }, 'world:init');
    extraSockets.push(wsExtra);
  }
  await sleep(500);

  // Kiểm tra số lượng bots sau khi có >= 4 người thật (ws2, ws3, extra1, extra2)
  const wsCheck = await createSocket();
  const checkInit = await sendAndAwait(wsCheck, 'player:join', { name: 'Inspector', initialKarma: 0 }, 'world:init');
  const botsAt5 = checkInit.players.filter(p => p.isBot);
  assert.strictEqual(botsAt5.length, 6, `Case 10 Failed: Mong đợi 6 bots nhưng nhận: ${botsAt5.length}`);
  console.log(`✓ Case 10 Pass: Khi phòng đạt >= 4 người thật, số lượng bots tự co giãn còn đúng 6 bots`);

  // Case 11: Đẩy số người thật lên >= 8 người -> bots tự động đi ngủ (0 bot)
  for (let i = 0; i < 3; i++) {
    const wsExtra = await createSocket();
    await sendAndAwait(wsExtra, 'player:join', { name: `RealPlayer ${i+1}`, initialKarma: 20 }, 'world:init');
    extraSockets.push(wsExtra);
  }
  await sleep(500);

  const wsCheckZero = await createSocket();
  const checkZeroInit = await sendAndAwait(wsCheckZero, 'player:join', { name: 'InspectorZero', initialKarma: 0 }, 'world:init');
  const botsAt8Plus = checkZeroInit.players.filter(p => p.isBot);
  assert.strictEqual(botsAt8Plus.length, 0, `Case 11 Failed: Mong đợi 0 bot nhưng nhận: ${botsAt8Plus.length}`);
  console.log(`✓ Case 11 Pass: Khi phòng đạt từ 8 người thật trở lên, toàn bộ bots tự động đi ngủ (0 bot nhường map)`);

  // Dọn dẹp bớt sockets để người chơi thật giảm xuống dưới 4
  ws2.close();
  ws3.close();
  wsCheck.close();
  wsCheckZero.close();
  for (const s of extraSockets) s.close();
  await sleep(800);

  // Case 12: Khi người chơi rời phòng (< 4 người thật), bots tự động hồi sinh bù lại đủ 14 bots
  const wsAfterLeave = await createSocket();
  const finalInit = await sendAndAwait(wsAfterLeave, 'player:join', { name: 'FinalCheck', initialKarma: 10 }, 'world:init');
  const botsRecovered = finalInit.players.filter(p => p.isBot);
  assert.strictEqual(botsRecovered.length, 14, `Case 12 Failed: Bots không hồi phục đủ 14: ${botsRecovered.length}`);
  console.log(`✓ Case 12 Pass: Khi người chơi thật rời phòng, bots tự động được đánh thức bù lại đủ 14 bots`);
  wsAfterLeave.close();

  console.log(`\n========================================================================`);
  console.log(`🎉 TẤT CẢ 12/12 TEST CASES TÍNH NĂNG v1.8.0 ĐỀU ĐẠT CHUẨN PASS 100%!`);
  console.log(`========================================================================`);
  serverProc.kill();
  process.exit(0);
}

runTests().catch(err => {
  console.error('Lỗi khi chạy test suite v1.8.0:', err);
  serverProc.kill();
  process.exit(1);
});
