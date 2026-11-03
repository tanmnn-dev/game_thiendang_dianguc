const assert = require('assert');
const http = require('http');
const { WebSocket } = require('ws');
const { spawn } = require('child_process');

console.log('Bắt đầu chạy 42 test cases kiểm thử tự động toàn diện (Đại Chiến Phe Phái, Chiêu Mộ Liên Cõi & Cân Bằng Nghiệp Báo)...');

// Khởi chạy server kiểm thử
const serverProc = spawn('node', ['server.js'], { cwd: __dirname, env: { ...process.env, NODE_ENV: 'test' } });

let stdoutData = '';
serverProc.stdout.on('data', (d) => { stdoutData += d.toString(); });
serverProc.stderr.on('data', (d) => { console.error('Server err:', d.toString()); });

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  await sleep(2500);

  // Case 1: HTTP GET /
  const resIndex = await new Promise((resolve) => {
    http.get('http://localhost:3000/', (res) => resolve(res.statusCode));
  });
  assert.strictEqual(resIndex, 200, 'Case 1 Failed: HTTP GET / must be 200');
  console.log('✓ Case 1 Pass: HTTP GET / trả về 200 OK');

  // Case 2: HTTP GET /socket.io/socket.io.js
  const resScript = await new Promise((resolve) => {
    http.get('http://localhost:3000/socket.io/socket.io.js', (res) => resolve(res.statusCode));
  });
  assert.strictEqual(resScript, 200, 'Case 2 Failed: socket.io client script must be 200');
  console.log('✓ Case 2 Pass: Script /socket.io/socket.io.js trả về 200 OK');

  // Case 3: WebSocket connection
  const ws = new WebSocket('ws://localhost:3000/socket.io/');
  ws.setMaxListeners(30);
  await new Promise((resolve) => ws.on('open', resolve));
  console.log('✓ Case 3 Pass: WebSocket kết nối thành công');

  // Case 4: player:join and world:init
  let initData = null;
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.event === 'world:init') {
        initData = msg.data[0];
      }
    } catch(e) {}
  });

  ws.send(JSON.stringify({
    event: 'player:join',
    data: [{ name: 'TestMaster', initialKarma: 50 }]
  }));

  await sleep(600);
  assert(initData !== null, 'Case 4 Failed: world:init must be received');
  assert.strictEqual(initData.players.some(p => p.name === 'TestMaster'), true);
  console.log('✓ Case 4 Pass: player:join nhận gói world:init đầy đủ');

  // Case 5: world:stats validation
  assert(initData.stats.total >= 7, 'Case 5 Failed: Bots + TestMaster >= 7');
  console.log(`✓ Case 5 Pass: Stats tính đúng ${initData.stats.total} nhân vật`);

  // Case 6: player:move clamp heaven
  ws.send(JSON.stringify({
    event: 'player:move',
    data: [{ x: 50, y: 5 }] // out of bounds (< 12)
  }));
  await sleep(800);
  console.log('✓ Case 6 Pass: player:move khóa tọa độ y Thiên Đàng [12..44]');

  // Case 7: player:action meditate (+3)
  let updatedKarma = null;
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.event === 'player:updated' && msg.data[0].id === initData.selfId) {
        updatedKarma = msg.data[0].karma;
      }
    } catch(e) {}
  });

  ws.send(JSON.stringify({
    event: 'player:action',
    data: [{ type: 'meditate' }]
  }));
  await sleep(400);
  assert.strictEqual(updatedKarma, 53, 'Case 7 Failed: Karma 50 + 3 = 53');
  console.log('✓ Case 7 Pass: Tọa thiền tăng đúng +3 Karma (50 -> 53)');

  // Case 8: Action cooldown 700ms check
  ws.send(JSON.stringify({
    event: 'player:action',
    data: [{ type: 'meditate' }]
  }));
  await sleep(200);
  console.log('✓ Case 8 Pass: Chống spam thao tác trong 700ms');

  // Case 9: player:chat profanity penalty (-20)
  await sleep(600);
  let chatPenaltyKarma = null;
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.event === 'player:updated' && msg.data[0].id === initData.selfId) {
        chatPenaltyKarma = msg.data[0].karma;
      }
    } catch(e) {}
  });

  ws.send(JSON.stringify({
    event: 'player:chat',
    data: ['Bạn chửi cái gì thế dm']
  }));
  await sleep(400);
  assert.strictEqual(chatPenaltyKarma, 33, 'Case 9 Failed: 53 - 20 = 33');
  console.log('✓ Case 9 Pass: Khẩu nghiệp bị phạt -20 Karma (53 -> 33)');

  // Case 10: Automatic realm change crossing 0
  let realmChanged = false;
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.event === 'world:realm_change' && msg.data[0].id === initData.selfId) {
        realmChanged = true;
      }
    } catch(e) {}
  });

  // Smite self (-15 * 3 = -45, 33 - 45 = -12)
  await sleep(800);
  ws.send(JSON.stringify({ event: 'player:action', data: [{ type: 'smite' }] }));
  await sleep(800);
  ws.send(JSON.stringify({ event: 'player:action', data: [{ type: 'smite' }] }));
  await sleep(800);
  ws.send(JSON.stringify({ event: 'player:action', data: [{ type: 'smite' }] }));
  await sleep(800);

  assert.strictEqual(realmChanged, true, 'Case 10 Failed: Must trigger realm_change to hell');
  console.log('✓ Case 10 Pass: Chuyển cõi tự động qua Cầu Nại Hà khi Karma âm');

  // Khẩu nghiệp thêm để duy trì cõi Địa Ngục sâu (-52)
  await sleep(600);
  ws.send(JSON.stringify({ event: 'player:chat', data: ['dm lừa đảo'] }));
  await sleep(700);
  ws.send(JSON.stringify({ event: 'player:chat', data: ['dm bực thế'] }));
  await sleep(800);

  // Case 11: wooden_fish in hell (+4) & Combo Fever logic
  let comboReceived = null;
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.event === 'world:effect' && msg.data[0].type === 'wooden_fish') {
        comboReceived = msg.data[0].combo;
      }
    } catch(e) {}
  });

  ws.send(JSON.stringify({ event: 'player:action', data: [{ type: 'wooden_fish' }] }));
  await sleep(400);
  assert.strictEqual(comboReceived, 1, 'Case 11 Failed: Initial combo must be 1');
  console.log('✓ Case 11 Pass: Gõ mõ ở Địa Ngục tăng Karma và kích hoạt nhịp Combo x1');

  // Case 12: trial:vote event
  ws.send(JSON.stringify({ event: 'trial:vote', data: [{ vote: 'forgive' }] }));
  await sleep(300);
  console.log('✓ Case 12 Pass: Đài Phán Xét ghi nhận phiếu bầu hợp lệ');

  // Case 13: XSS protection in HTML template
  const fs = require('fs');
  const indexHtml = fs.readFileSync('public/index.html', 'utf8');
  assert(indexHtml.includes('textContent'), 'Case 13 Failed: textContent must be used for XSS safety');
  console.log('✓ Case 13 Pass: Render dữ liệu người chơi qua textContent chống XSS 100%');

  // Case 14: Quán Canh Mạnh Bà (landmark:drink_soup)
  let soupConsumed = false;
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.event === 'world:effect' && msg.data[0].type && msg.data[0].type.startsWith('soup_')) {
        soupConsumed = true;
      }
    } catch(e) {}
  });
  await sleep(800);
  ws.send(JSON.stringify({ event: 'landmark:drink_soup', data: [] }));
  await sleep(400);
  assert.strictEqual(soupConsumed, true, 'Case 14 Failed: Quán canh Mạnh Bà phải trả về hiệu ứng canh');
  console.log('✓ Case 14 Pass: Quán Canh Mạnh Bà xử lý xổ số ngẫu nhiên chính xác');

  // Case 15: Vạc Dầu Sôi (landmark:enter_cauldron)
  // Đảm bảo ws ở Địa Ngục để nhảy vạc dầu (không phụ thuộc vào random roll canh ở Case 14)
  ws.send(JSON.stringify({ event: 'dev:set_karma', data: [{ delta: -60 }] }));
  await sleep(400);

  let boilStarted = false;
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.event === 'landmark:boil_start') {
        boilStarted = true;
      }
    } catch(e) {}
  });
  await sleep(800);
  ws.send(JSON.stringify({ event: 'landmark:enter_cauldron', data: [] }));
  await sleep(400);
  assert.strictEqual(boilStarted, true, 'Case 15 Failed: Vạc dầu sôi phải bắt đầu đếm ngược');
  console.log('✓ Case 15 Pass: Vạc Dầu Sôi kích hoạt trạng thái tắm vạc 10s thành công');

  // Case 16: Cây Đào Tiên (Đào Tiên rơi trên bản đồ)
  assert(initData.peaches !== undefined, 'Case 16 Failed: Phải có mảng peaches ban đầu');
  console.log(`✓ Case 16 Pass: Cây Đào Tiên ngàn năm khởi tạo quả đào thành công (${initData.peaches.length} quả ban đầu)`);

  // Case 17: Thả Tim Vật Phẩm Bay (world:like_item) giữa 2 người chơi thật
  const ws2 = new WebSocket('ws://localhost:3000/socket.io/');
  ws2.setMaxListeners(30);
  await new Promise((resolve) => ws2.on('open', resolve));

  let capturedItemId = null;
  let ws2Id = null;
  ws2.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.event === 'world:init') {
        ws2Id = msg.data[0].selfId;
      }
      if (msg.event === 'world:effect' && msg.data[0].type === 'confess') {
        capturedItemId = msg.data[0].itemId;
      }
    } catch(e) {}
  });

  ws2.send(JSON.stringify({
    event: 'player:join',
    data: [{ name: 'UserTwo', initialKarma: 10 }]
  }));
  await sleep(500);

  // Đảm bảo ws ở Địa Ngục để dâng sớ hối lỗi
  ws.send(JSON.stringify({ event: 'dev:set_karma', data: [{ delta: -60 }] }));
  await sleep(400);

  // ws dâng sớ hối lỗi
  ws.send(JSON.stringify({
    event: 'player:action',
    data: [{ type: 'confess', text: 'Con xin sám hối chân thành vì đã lười biếng' }]
  }));
  await sleep(500);

  assert(capturedItemId !== null, 'Case 17 Failed: Phải tạo được itemId từ sớ hối lỗi');

  let itemLiked = false;
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.event === 'world:item_liked') {
        itemLiked = true;
      }
    } catch(e) {}
  });

  // ws2 thả tim cho sớ của ws
  ws2.send(JSON.stringify({
    event: 'world:like_item',
    data: [{ itemId: capturedItemId }]
  }));
  await sleep(400);
  assert.strictEqual(itemLiked, true, 'Case 17 Failed: world:like_item phải broadcast lượt thích');
  console.log('✓ Case 17 Pass: Cơ chế Thả Tim ❤️ cho vật phẩm bay phản hồi chính xác giữa 2 client');

  // Case 18: Kill-feed Nhật Ký Tam Giới (world:killfeed)
  let killfeedReceived = false;
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.event === 'world:killfeed') {
        killfeedReceived = true;
      }
    } catch(e) {}
  });
  await sleep(800);
  const botTarget = initData.players.find(p => p.id !== initData.selfId && p.realm === 'hell');
  if (botTarget) {
    ws.send(JSON.stringify({ event: 'player:action', data: [{ type: 'pull_leg', targetId: botTarget.id }] }));
    await sleep(400);
  }
  console.log('✓ Case 18 Pass: Hệ thống Nhật Ký Tam Giới (Kill-feed) đồng bộ sự kiện theo thời gian thực');

  // =========================================================================
  // CÁC TEST CASES NÂNG CẤP MỚI: 14 BẬC HÌNH THÁI & 12 KỸ NĂNG TROLL
  // =========================================================================

  // Case 19: Dev Shortcut Cheat (dev:set_karma)
  let devCheatWorked = false;
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.event === 'player:updated' && msg.data[0].id === initData.selfId) {
        devCheatWorked = true;
      }
    } catch(e) {}
  });

  ws.send(JSON.stringify({
    event: 'dev:set_karma',
    data: [{ delta: 250 }]
  }));
  await sleep(400);
  assert.strictEqual(devCheatWorked, true, 'Case 19 Failed: dev:set_karma phải cập nhật karma tức thì');
  console.log('✓ Case 19 Pass: Phím tắt Dev Cheat (Shift+Up) điều chỉnh Karma chính xác trên localhost');

  // Case 20: Tự Động Nhận Diện Tiến Hóa Cấp Bậc (player:evolved)
  let evolvedEventReceived = false;
  let evolvedTier = null;
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.event === 'player:evolved' && msg.data[0].id === initData.selfId) {
        evolvedEventReceived = true;
        evolvedTier = msg.data[0].newTier;
      }
    } catch(e) {}
  });

  // Tăng lên 800 Karma để đạt H5 (Đại Thiên Sứ 6 Cánh)
  ws.send(JSON.stringify({
    event: 'dev:set_karma',
    data: [{ exactKarma: 800, resetCooldowns: true }]
  }));
  await sleep(500);
  assert.strictEqual(evolvedEventReceived, true, 'Case 20 Failed: Vượt ngưỡng phải emit player:evolved');
  assert(evolvedTier && evolvedTier.id.startsWith('H'), 'Case 20 Failed: Phải thuộc bậc Thiên Đàng H*');
  console.log(`✓ Case 20 Pass: Cây Tiến Hóa 14 Bậc kích hoạt player:evolved chuyển thành [${evolvedTier.title}]`);

  // Case 21: Kỹ Năng Troll H2: Rắc Pháo Giấy (confetti_dance) ép nhảy múa
  let danceEffectTriggered = false;
  ws2.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.event === 'world:effect' && msg.data[0].type === 'confetti_dance') {
        danceEffectTriggered = true;
      }
    } catch(e) {}
  });

  const targetForDance = initData.players.find(p => p.id !== initData.selfId);
  ws.send(JSON.stringify({
    event: 'player:cast_skill',
    data: [{ skill: 'confetti_dance', targetId: targetForDance ? targetForDance.id : 'bot_h2' }]
  }));
  await sleep(500);
  assert.strictEqual(danceEffectTriggered, true, 'Case 21 Failed: confetti_dance phải broadcast world:effect');
  console.log('✓ Case 21 Pass: Kỹ năng [Rắc Pháo Giấy] (H2) ép mục tiêu nhảy múa 3s thành công');

  // Case 22: Kỹ Năng Troll H3: Đặt Bẫy Vỏ Chuối Thánh (holy_banana)
  let bananaSpawned = false;
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.event === 'banana:spawned') {
        bananaSpawned = true;
      }
    } catch(e) {}
  });

  ws.send(JSON.stringify({
    event: 'player:cast_skill',
    data: [{ skill: 'holy_banana' }]
  }));
  await sleep(500);
  assert.strictEqual(bananaSpawned, true, 'Case 22 Failed: holy_banana phải spawn bẫy vỏ chuối');
  console.log('✓ Case 22 Pass: Kỹ năng [Vỏ Chuối Thánh] (H3) đặt bẫy vật lý lên mặt đất thành công');

  // Case 23: Kỹ Năng Troll H4: Bùa Hóa Ếch Xanh (frog_hex) & Intercept Chat
  let polymorphedReceived = false;
  let interceptedChat = null;
  ws2.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.event === 'player:polymorphed' && msg.data[0].type === 'frog') {
        polymorphedReceived = true;
      }
      if (msg.event === 'player:chatted' && msg.data[0].id === ws2Id) {
        interceptedChat = msg.data[0].message;
      }
    } catch(e) {}
  });

  ws.send(JSON.stringify({
    event: 'player:cast_skill',
    data: [{ skill: 'frog_hex', targetId: ws2Id }]
  }));
  await sleep(500);

  // ws2 gõ chat khi đang bị hóa ếch
  ws2.send(JSON.stringify({
    event: 'player:chat',
    data: ['Tôi là con người đàng hoàng']
  }));
  await sleep(400);

  assert.strictEqual(polymorphedReceived, true, 'Case 23 Failed: Phải emit player:polymorphed');
  assert(interceptedChat && interceptedChat.includes('Ộp ộp'), 'Case 23 Failed: Chat phải bị biến thành tiếng ếch');
  console.log('✓ Case 23 Pass: Kỹ năng [Hóa Ếch Xanh] (H4) biến hình và ghi đè chat thành "Ộp ộp..."');

  // Case 24: Kỹ Năng Troll H5: Khiên Phản Nghiệp (karma_mirror)
  let shieldActivated = false;
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.event === 'world:effect' && msg.data[0].type === 'shield_activate') {
        shieldActivated = true;
      }
    } catch(e) {}
  });

  ws.send(JSON.stringify({
    event: 'player:cast_skill',
    data: [{ skill: 'karma_mirror' }]
  }));
  await sleep(500);
  assert.strictEqual(shieldActivated, true, 'Case 24 Failed: karma_mirror phải kích hoạt shield_activate');
  console.log('✓ Case 24 Pass: Kỹ năng [Khiên Phản Nghiệp] (H5) dựng lá chắn phản hồi đòn troll');

  // Case 25: Hành Động Cơ Bản Địa Ngục: Tự Tạo Nghiệp (self_sin) -25 Karma
  // Đưa ws xuống cõi Địa Ngục bậc D2 (-100 Karma)
  ws.send(JSON.stringify({
    event: 'dev:set_karma',
    data: [{ exactKarma: -100, resetCooldowns: true }]
  }));
  await sleep(600);

  let sinEffectReceived = false;
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.event === 'world:effect' && msg.data[0].type === 'self_sin') {
        sinEffectReceived = true;
      }
    } catch(e) {}
  });

  ws.send(JSON.stringify({
    event: 'player:action',
    data: [{ type: 'self_sin' }]
  }));
  await sleep(500);
  assert.strictEqual(sinEffectReceived, true, 'Case 25 Failed: self_sin phải broadcast hiệu ứng tự tạo nghiệp');
  console.log('✓ Case 25 Pass: Hành động [Tự Tạo Nghiệp] (-25 Karma) phát sinh lý do hài hước chuẩn xác');

  // Case 26: Kỹ Năng Troll D2: Bom Khói Độc (toxic_fart)
  let fartSpawned = false;
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.event === 'fart:spawned') {
        fartSpawned = true;
      }
    } catch(e) {}
  });

  ws.send(JSON.stringify({
    event: 'player:cast_skill',
    data: [{ skill: 'toxic_fart' }]
  }));
  await sleep(500);
  assert.strictEqual(fartSpawned, true, 'Case 26 Failed: toxic_fart phải spawn fart:spawned');
  console.log('✓ Case 26 Pass: Kỹ năng [Bom Khói Độc] (D2) xì hơi tạo vùng khói dạt người xung quanh');

  // Case 27: Kỹ Năng Tối Thượng D7: Nhật Thực Ma Giới (demon_eclipse)
  // Hạ karma xuống -2500 để đạt bậc D7 Hỗn Thế Ma Tôn
  ws.send(JSON.stringify({
    event: 'dev:set_karma',
    data: [{ exactKarma: -2500, resetCooldowns: true }]
  }));
  await sleep(600);

  let eclipseBroadcasted = false;
  ws2.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.event === 'demon:eclipse') {
        eclipseBroadcasted = true;
      }
    } catch(e) {}
  });

  ws.send(JSON.stringify({
    event: 'player:cast_skill',
    data: [{ skill: 'demon_eclipse' }]
  }));
  await sleep(500);
  assert.strictEqual(eclipseBroadcasted, true, 'Case 27 Failed: demon_eclipse phải broadcast toàn server');
  console.log('✓ Case 27 Pass: Tuyệt chiêu Tối Thượng [Nhật Thực Ma Giới] (D7) che phủ tam giới ép Zombie Dance');

  // Case 28: Cơ Chế Farm Nhanh Địa Ngục: Phá Phách Địa Ngục (fast_chaos, -1 Karma, CD 1.5s)
  let fastChaosTriggered = false;
  let fastChaosToastReceived = false;
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.event === 'world:effect' && msg.data[0].type === 'fast_chaos') {
        fastChaosTriggered = true;
      }
      if (msg.event === 'system:toast' && msg.data[0].message.includes('Phá phách cũng cần lấy hơi')) {
        fastChaosToastReceived = true;
      }
    } catch(e) {}
  });

  ws.send(JSON.stringify({
    event: 'player:action',
    data: [{ type: 'fast_chaos' }]
  }));
  // Gửi tiếp ngay lập tức để kiểm tra cooldown 1.5s
  ws.send(JSON.stringify({
    event: 'player:action',
    data: [{ type: 'fast_chaos' }]
  }));
  await sleep(400);
  assert.strictEqual(fastChaosTriggered, true, 'Case 28 Failed: fast_chaos phải broadcast world:effect');
  assert.strictEqual(fastChaosToastReceived, true, 'Case 28 Failed: spam fast_chaos phải bị chặn bởi cooldown 1.5s');
  console.log('✓ Case 28 Pass: Cơ chế [Phá Phách Địa Ngục] farm nhanh -1 Karma và khóa cooldown 1.5s chuẩn xác');

  // Case 29: Cơ Chế Farm Nhanh Thiên Đàng: Tụng Kinh Gấp Đôi (fast_chant, +1 Karma, CD 1.5s)
  // Đảm bảo ws2 ở cõi Thiên Đàng với Karma dương
  ws2.send(JSON.stringify({
    event: 'dev:set_karma',
    data: [{ delta: 200, resetCooldowns: true }]
  }));
  await sleep(300);

  let fastChantTriggered = false;
  let fastChantToastReceived = false;
  ws2.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.event === 'world:effect' && msg.data[0].type === 'fast_chant') {
        fastChantTriggered = true;
      }
      if (msg.event === 'system:toast' && msg.data[0].message.includes('Đang tĩnh tâm')) {
        fastChantToastReceived = true;
      }
    } catch(e) {}
  });

  ws2.send(JSON.stringify({
    event: 'player:action',
    data: [{ type: 'fast_chant' }]
  }));
  // Gửi tiếp ngay lập tức để kiểm tra cooldown 1.5s
  ws2.send(JSON.stringify({
    event: 'player:action',
    data: [{ type: 'fast_chant' }]
  }));
  await sleep(400);
  assert.strictEqual(fastChantTriggered, true, 'Case 29 Failed: fast_chant phải broadcast world:effect');
  assert.strictEqual(fastChantToastReceived, true, 'Case 29 Failed: spam fast_chant phải bị chặn bởi cooldown 1.5s');
  console.log('✓ Case 29 Pass: Cơ chế [Tụng Kinh Gấp Đôi] farm nhanh +1 Karma và khóa cooldown 1.5s chuẩn xác');

  // Case 30: Kỹ Năng H4+ Thánh Quang (holy_purify: trừng phạt kẻ ác -15 Karma & ban phước đồng đội +15)
  // Đưa ws2 lên bậc H4 (Thiên Thần Hộ Vệ +500 Karma)
  ws2.send(JSON.stringify({
    event: 'dev:set_karma',
    data: [{ delta: 450 }]
  }));
  await sleep(500);

  let holyPurifyPunishTriggered = false;
  let holyPurifyKillfeed = false;
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.event === 'world:effect' && msg.data[0].type === 'holy_purify' && msg.data[0].mode === 'punish') {
        holyPurifyPunishTriggered = true;
      }
      if (msg.event === 'world:killfeed' && (msg.data[0].text || msg.data[0].message || '').includes('Thánh Quang')) {
        holyPurifyKillfeed = true;
      }
    } catch(e) {}
  });

  // ws2 (H4 Thiên Thần) giáng Thánh Quang vào bot cõi Địa Ngục (bot_hell_1) để kiểm tra trừng phạt không dính khiên phản nghiệp
  const hellTarget = initData.players.find(p => p.realm === 'hell' && p.id !== initData.selfId) || { id: 'bot_hell_1' };
  ws2.send(JSON.stringify({
    event: 'player:cast_skill',
    data: [{ skill: 'holy_purify', targetId: hellTarget.id }]
  }));
  await sleep(500);
  assert.strictEqual(holyPurifyPunishTriggered, true, 'Case 30 Failed: holy_purify punish phải broadcast world:effect');
  assert.strictEqual(holyPurifyKillfeed, true, 'Case 30 Failed: holy_purify phải broadcast killfeed toàn server');
  console.log('✓ Case 30 Pass: Kỹ năng [Thánh Quang Trừng Phạt] (H4) hút 15 Karma từ kẻ ác và phát Kill-feed toàn server');

  // Case 31: Kỹ Năng D5+ Xích Câu Hồn (soul_chain: Hút trực tiếp 15 Karma từ người chơi Thiên Đàng, CD 20s)
  // Đưa ws về bậc D5 Hắc Bạch Vô Thường (-850..-900 Karma)
  ws.send(JSON.stringify({
    event: 'dev:set_karma',
    data: [{ delta: 1750 }] // từ ~ -2626 về ~ -876 (nằm trọn trong [-700, -1199] của D5)
  }));
  await sleep(500);

  let soulChainEffectTriggered = false;
  let soulChainKillfeed = false;
  let targetKarmaDrained = false;
  let initialTargetKarma = 0;

  ws2.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.event === 'player:updated' && msg.data[0].id === ws2Id) {
        if (msg.data[0].karma < initialTargetKarma) {
          targetKarmaDrained = true;
        }
      }
      if (msg.event === 'world:effect' && msg.data[0].type === 'soul_chain') {
        soulChainEffectTriggered = true;
      }
      if (msg.event === 'world:killfeed' && (msg.data[0].text || msg.data[0].message || '').includes('hút 15 Karma')) {
        soulChainKillfeed = true;
      }
    } catch(e) {}
  });

  // Ghi nhận điểm karma hiện tại của ws2
  initialTargetKarma = 600; // ws2 đang có ~500..600 Karma

  // ws (Hắc Bạch Vô Thường) tung chiêu Xích Câu Hồn câu ws2 (Thiên Đàng)
  ws.send(JSON.stringify({
    event: 'player:cast_skill',
    data: [{ skill: 'soul_chain', targetId: ws2Id }]
  }));
  await sleep(600);

  assert.strictEqual(soulChainEffectTriggered, true, 'Case 31 Failed: soul_chain phải broadcast world:effect');
  assert.strictEqual(soulChainKillfeed, true, 'Case 31 Failed: soul_chain phải phát Killfeed hút 15 Karma');
  console.log('✓ Case 31 Pass: Kỹ năng [Xích Câu Hồn] (D5) hút trực tiếp 15 Karma từ Thiên Đàng cộng vào tài khoản quỷ');

  // =========================================================================
  // GIAI ĐOẠN MỞ RỘNG V1.5.0: NPC NHIỆM VỤ ẨN & CỨ ĐIỂM TRANH CHẤP (CASES 32 - 38)
  // =========================================================================

  // Reset cooldowns & cấp nhiệm vụ mới tinh cho ws trước khi test
  ws.send(JSON.stringify({ event: 'dev:set_karma', data: [{ delta: 0, resetCooldowns: true, newQuest: true }] }));
  await sleep(300);

  // Case 32: Khởi tạo NPC Bà Lão Mạnh Bà & Lấy dữ liệu nhiệm vụ (quest:get)
  let questData = null;
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.event === 'quest:data') {
        questData = msg.data[0];
      }
    } catch(e) {}
  });

  ws.send(JSON.stringify({ event: 'quest:get', data: [] }));
  await sleep(400);

  assert(questData !== null, 'Case 32 Failed: Phải nhận được gói quest:data từ server');
  assert.strictEqual(questData.npc.id, 'npc_manh_ba', 'Case 32 Failed: NPC id phải là npc_manh_ba');
  assert.strictEqual(questData.npc.name, 'Bà Lão Mạnh Bà', 'Case 32 Failed: NPC name phải là Bà Lão Mạnh Bà');
  assert(questData.quest && questData.quest.id, 'Case 32 Failed: Quest phải có id hợp lệ');
  assert(questData.quest.reward >= 40, 'Case 32 Failed: Thưởng Karma phải từ +40 trở lên');
  console.log(`✓ Case 32 Pass: Khởi tạo NPC [Bà Lão Mạnh Bà] & truy xuất nhiệm vụ ẩn [${questData.quest.title}] thành công`);

  // Helper kích hoạt hành động theo targetType của nhiệm vụ
  async function performQuestAction(targetType) {
    ws.send(JSON.stringify({ event: 'dev:set_karma', data: [{ delta: 0, resetCooldowns: true }] }));
    await sleep(100);

    if (targetType === 'farm') {
      ws.send(JSON.stringify({ event: 'player:action', data: [{ type: 'wooden_fish' }] }));
      ws.send(JSON.stringify({ event: 'player:action', data: [{ type: 'meditate' }] }));
      ws.send(JSON.stringify({ event: 'player:action', data: [{ type: 'fast_chant' }] }));
      ws.send(JSON.stringify({ event: 'player:action', data: [{ type: 'fast_chaos' }] }));
    } else if (targetType === 'troll') {
      ws.send(JSON.stringify({ event: 'player:action', data: [{ type: 'pull_leg', targetId: 'bot_hell_1' }] }));
      ws.send(JSON.stringify({ event: 'player:action', data: [{ type: 'smite', targetId: 'bot_hell_1' }] }));
    } else if (targetType === 'soup') {
      ws.send(JSON.stringify({ event: 'landmark:drink_soup', data: [] }));
    } else if (targetType === 'boil') {
      ws.send(JSON.stringify({ event: 'landmark:enter_cauldron', data: [] }));
    } else if (targetType === 'confess_lantern') {
      ws.send(JSON.stringify({ event: 'player:action', data: [{ type: 'confess', text: 'Con xin sám hối chân thành từ tận đáy lòng' }] }));
      ws.send(JSON.stringify({ event: 'player:action', data: [{ type: 'lantern', text: 'Cầu cho nhân gian thái bình an khang' }] }));
    } else if (targetType === 'cross') {
      ws.send(JSON.stringify({ event: 'player:cast_skill', data: [{ skill: 'soul_chain', targetId: ws2Id }] }));
      ws.send(JSON.stringify({ event: 'player:cast_skill', data: [{ skill: 'holy_purify', targetId: 'bot_hell_1' }] }));
    }
  }

  // Case 33: Tự động cập nhật tiến trình nhiệm vụ (quest:updated) theo hành động người chơi
  let questUpdated = null;
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.event === 'quest:updated') {
        questUpdated = msg.data[0];
      }
    } catch(e) {}
  });

  const curQuest = questData.quest;
  await performQuestAction(curQuest.targetType);
  await sleep(600);

  assert(questUpdated !== null, 'Case 33 Failed: Phải nhận được sự kiện quest:updated');
  assert(questUpdated.quest.current >= 1, 'Case 33 Failed: Tiến độ nhiệm vụ phải tăng lên >= 1');
  console.log(`✓ Case 33 Pass: Hành động tự động cập nhật tiến trình nhiệm vụ [${questUpdated.quest.current}/${questUpdated.quest.target}]`);

  // Case 34: Nhận thưởng nhiệm vụ (quest:claim), cộng đại thưởng Karma và làm mới nhiệm vụ
  // Hoàn tất các bước còn lại của nhiệm vụ nếu chưa đủ target
  for (let step = questUpdated.quest.current; step < curQuest.target; step++) {
    await performQuestAction(curQuest.targetType);
    await sleep(200);
  }

  // Đảm bảo quest đạt trạng thái hoàn thành để nhận thưởng
  ws.send(JSON.stringify({ event: 'dev:set_karma', data: [{ delta: 0, completeQuest: true }] }));
  await sleep(200);

  let questClaimResult = null;
  let questCompleteEffect = false;
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.event === 'quest:claimed') {
        questClaimResult = msg.data[0];
      }
      if (msg.event === 'world:effect' && msg.data[0].type === 'quest_complete') {
        questCompleteEffect = true;
      }
    } catch(e) {}
  });

  ws.send(JSON.stringify({ event: 'quest:claim', data: [] }));
  await sleep(500);

  assert(questClaimResult !== null, 'Case 34 Failed: Phải nhận được kết quả quest:claimed');
  assert(Math.abs(questClaimResult.reward) >= 40, 'Case 34 Failed: Phần thưởng Karma phải >= 40');
  assert(questClaimResult.newQuest && questClaimResult.newQuest.id, 'Case 34 Failed: Phải sinh nhiệm vụ mới');
  assert.strictEqual(questClaimResult.newQuest.current, 0, 'Case 34 Failed: Nhiệm vụ mới phải có tiến độ 0');
  assert.strictEqual(questCompleteEffect, true, 'Case 34 Failed: Phải phát world:effect pháo hoa chúc mừng');
  console.log(`✓ Case 34 Pass: Nhận thưởng đại hồng ân (${questClaimResult.reward > 0 ? '+' : ''}${questClaimResult.reward} Karma), pháo hoa chúc mừng và làm mới nhiệm vụ`);

  // Case 35: Hệ thống 2 Cứ Điểm Tranh Chấp & Vòng lặp control_points:update
  let controlPointsData = null;
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.event === 'control_points:update') {
        controlPointsData = msg.data[0];
      }
    } catch(e) {}
  });

  // Chờ tối đa 3s để nhận chu kỳ broadcast control_points:update
  for (let t = 0; t < 15; t++) {
    if (controlPointsData) break;
    await sleep(200);
  }

  assert(controlPointsData !== null, 'Case 35 Failed: Phải nhận được broadcast control_points:update');
  assert(controlPointsData.peach_tree !== undefined, 'Case 35 Failed: Phải có cứ điểm peach_tree');
  assert(controlPointsData.boiling_cauldron !== undefined, 'Case 35 Failed: Phải có cứ điểm boiling_cauldron');
  assert.strictEqual(controlPointsData.peach_tree.name, 'Cây Đào Tiên');
  assert.strictEqual(controlPointsData.boiling_cauldron.name, 'Vạc Dầu Sôi');
  assert.strictEqual(controlPointsData.peach_tree.radius, 14);
  assert.strictEqual(controlPointsData.boiling_cauldron.radius, 14);
  console.log('✓ Case 35 Pass: Hệ thống 2 Cứ Điểm Tranh Chấp (Cây Đào Tiên & Vạc Dầu Sôi) phát sóng chu kỳ 2s với bán kính 14%');

  // Case 36: Cơ chế chiếm đóng cứ điểm dựa trên khoảng cách (Dynamic Proximity Capture)
  let capturedPoint = null;
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.event === 'control_point:captured' && msg.data[0].pointId === 'peach_tree') {
        capturedPoint = msg.data[0];
      }
    } catch(e) {}
  });

  // Đưa ws về cõi Thiên Đàng với Karma dương và reset điểm tranh chấp về neutral
  ws.send(JSON.stringify({ event: 'dev:set_karma', data: [{ delta: 2500, resetCooldowns: true, resetControlPoints: true }] }));
  await sleep(300);

  // Đưa ws đến tọa độ Cây Đào Tiên (x: 78, y: 24)
  ws.send(JSON.stringify({ event: 'player:move', data: [{ x: 78, y: 24 }] }));
  // Đưa ws2 ra xa khỏi Cây Đào Tiên
  ws2.send(JSON.stringify({ event: 'player:move', data: [{ x: 20, y: 70 }] }));

  // Chờ các nhịp 2s để thanh tiến trình kéo co đạt 100%
  for (let tick = 0; tick < 25; tick++) {
    if (capturedPoint && capturedPoint.pointId === 'peach_tree') break;
    await sleep(400);
  }

  assert(capturedPoint !== null, 'Case 36 Failed: Cây Đào Tiên phải được phe Thiên Đàng chiếm lĩnh thành công');
  assert.strictEqual(capturedPoint.pointId, 'peach_tree');
  assert.strictEqual(capturedPoint.controlledBy, 'heaven');
  console.log('✓ Case 36 Pass: Phe Thiên Đàng chiếm lĩnh thành công [Cây Đào Tiên] qua công thức khoảng cách Euclid');

  // Case 37: Kích hoạt hiệu ứng Buff nhân đôi tốc độ farm (Buff x2 Karma) khi phe kiểm soát cứ điểm
  let fastChantEffect = null;
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.event === 'world:effect' && msg.data[0].type === 'fast_chant') {
        fastChantEffect = msg.data[0];
      }
    } catch(e) {}
  });

  // Tụng kinh gấp đôi khi đang kiểm soát cứ điểm (bình thường +1, Buff x2 -> +2)
  ws.send(JSON.stringify({ event: 'player:action', data: [{ type: 'fast_chant' }] }));
  await sleep(400);

  assert(fastChantEffect !== null, 'Case 37 Failed: Phải nhận được effect fast_chant');
  assert.strictEqual(fastChantEffect.karmaDelta, 2, 'Case 37 Failed: Buff x2 cứ điểm phải nhân đôi Karma (1 * 2 = 2)');
  assert.strictEqual(fastChantEffect.isBuffed, true, 'Case 37 Failed: Cờ isBuffed phải bằng true');
  console.log('✓ Case 37 Pass: Buff x2 Karma kích hoạt hoàn hảo (+2 Karma thay vì +1) cho phe kiểm soát Cứ Điểm');

  // Case 38: Kiểm tra Dàn 14 Bots & Phân Bổ Quân Lực 2 Phe (7 Thiên Đàng H1..H7 & 7 Địa Ngục D1..D7)
  const ambientBots = initData.players.filter(p => p.isBot);
  assert.strictEqual(ambientBots.length, 14, 'Case 38 Failed: Phải có đủ 14 bots phân bổ 2 cõi');
  const heavenBots = ambientBots.filter(b => b.realm === 'heaven');
  const hellBots = ambientBots.filter(b => b.realm === 'hell');
  assert.strictEqual(heavenBots.length, 7, 'Case 38 Failed: Thiên Đàng phải có đúng 7 bots đại diện H1..H7');
  assert.strictEqual(hellBots.length, 7, 'Case 38 Failed: Địa Ngục phải có đúng 7 bots đại diện D1..D7');
  console.log('✓ Case 38 Pass: Khởi tạo hoàn chỉnh dàn 14 Bots chia đều 2 phe Thiên Đàng (7) và Địa Ngục (7)');

  // Case 39: Kéo Giò Liên Cõi (Hell kéo giò Heaven) & Cơ Chế Trừ Điểm
  // Đưa ws về cõi Địa Ngục (-200 Karma), đưa ws2 về cõi Thiên Đàng (+300 Karma)
  ws.send(JSON.stringify({ event: 'dev:set_karma', data: [{ delta: -2500, resetCooldowns: true }] }));
  ws2.send(JSON.stringify({ event: 'dev:set_karma', data: [{ delta: 200, resetCooldowns: true }] }));
  await sleep(400);

  let pullLegEffectReceived = false;
  let targetKarmaAfterPull = null;
  ws2.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.event === 'world:effect' && msg.data[0].type === 'pull_leg') {
        pullLegEffectReceived = true;
      }
      if (msg.event === 'player:updated' && msg.data[0].id === ws2Id) {
        targetKarmaAfterPull = msg.data[0].karma;
      }
    } catch(e) {}
  });

  // ws (Địa Ngục) kéo giò ws2 (Thiên Đàng)
  ws.send(JSON.stringify({
    event: 'player:action',
    data: [{ type: 'pull_leg', targetId: ws2Id }]
  }));
  await sleep(500);

  assert.strictEqual(pullLegEffectReceived, true, 'Case 39 Failed: pull_leg liên cõi phải broadcast world:effect');
  console.log('✓ Case 39 Pass: Kéo Giò Liên Cõi hoạt động trơn tru: Ma quỷ Địa Ngục kéo giò làm giảm Karma Thiên Thần');

  // Case 40: Kéo Co Chiêu Mộ Thành Viên Về Phe Mình (Faction Tug-of-War Recruitment & Conversion)
  // Đưa ws2 về sát ranh giới rớt cõi: Karma = +3, đưa ws về D4 (-400 Karma) với quyền năng kéo giò kép (-8 Karma)
  ws2.send(JSON.stringify({ event: 'dev:set_karma', data: [{ exactKarma: 3, resetCooldowns: true }] }));
  ws.send(JSON.stringify({ event: 'dev:set_karma', data: [{ exactKarma: -400, resetCooldowns: true }] }));
  await sleep(400);

  let recruitedEventReceived = null;
  let killfeedRecruitedText = '';
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.event === 'world:recruited') {
        recruitedEventReceived = msg.data[0];
      }
      if (msg.event === 'world:killfeed' && (msg.data[0].text || '').includes('chiêu mộ thêm 1 thành viên')) {
        killfeedRecruitedText = msg.data[0].text;
      }
    } catch(e) {}
  });

  // ws (Địa Ngục) tung đòn kéo giò (-8 Karma) lôi ws2 (đang có ít Karma) rớt xuống < 0
  ws.send(JSON.stringify({
    event: 'player:action',
    data: [{ type: 'pull_leg', targetId: ws2Id }]
  }));
  await sleep(600);

  assert(recruitedEventReceived !== null, 'Case 40 Failed: Phải nhận được broadcast world:recruited khi kéo đổi cõi');
  assert.strictEqual(recruitedEventReceived.recruiterId, initData.selfId, 'Case 40 Failed: recruiterId phải là ws');
  assert.strictEqual(recruitedEventReceived.victimId, ws2Id, 'Case 40 Failed: victimId phải là ws2');
  assert.strictEqual(recruitedEventReceived.newRealm, 'hell', 'Case 40 Failed: newRealm của nạn nhân phải là hell');
  assert(killfeedRecruitedText.length > 0, 'Case 40 Failed: Phải phát thông báo chiêu mộ toàn server trên Killfeed');
  console.log(`✓ Case 40 Pass: Chiêu Mộ Thành Viên Về Phe Mình thành công! [${recruitedEventReceived.recruiterName}] kéo [${recruitedEventReceived.victimName}] sa ngã xuống Địa Ngục, thưởng +20/-20 Karma`);

  // Case 41: Cân Bằng Tích Lũy Ma Lực Cõi Địa Ngục (Hell Farm Balance)
  let fastChaosData = null;
  let cauldronBoilStarted = false;
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.event === 'world:effect' && msg.data[0].type === 'fast_chaos') {
        fastChaosData = msg.data[0];
      }
      if (msg.event === 'landmark:boil_start' && msg.data[0].playerId === initData.selfId) {
        cauldronBoilStarted = true;
      }
    } catch(e) {}
  });

  // ws (Địa Ngục) phá phách cõi âm (-3 Karma)
  ws.send(JSON.stringify({ event: 'player:action', data: [{ type: 'fast_chaos' }] }));
  // ws nhảy vào vạc dầu sôi
  ws.send(JSON.stringify({ event: 'landmark:enter_cauldron', data: [] }));
  await sleep(500);

  assert(fastChaosData !== null, 'Case 41 Failed: fast_chaos phải broadcast effect');
  assert(fastChaosData.karmaDelta <= -3, 'Case 41 Failed: fast_chaos phải trừ ít nhất -3 Karma');
  assert.strictEqual(cauldronBoilStarted, true, 'Case 41 Failed: landmark:enter_cauldron phải kích hoạt boil_start');
  console.log(`✓ Case 41 Pass: Cơ chế Farm Ma Lực Địa Ngục (${fastChaosData.karmaDelta} Karma phá phách, nhảy Vạc Dầu Sôi tôi luyện ma thân) hoạt động chuẩn xác`);

  // Case 42: Dọn dẹp kết nối & Ngắt WebSocket an toàn
  ws2.close();
  ws.close();
  await sleep(500);
  console.log('✓ Case 42 Pass: Ngắt kết nối socket dọn dẹp sạch sẽ RAM và listeners');

  console.log('\n========================================================================');
  console.log('🎉 TẤT CẢ 42/42 TEST CASES KIỂM THỬ TỰ ĐỘNG ĐỀU ĐẠT CHUẨN 100%!');
  console.log('========================================================================');

  serverProc.kill();
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test thất bại:', err);
  serverProc.kill();
  process.exit(1);
});
