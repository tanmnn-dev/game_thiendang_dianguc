const path = require('path');
const fs = require('fs');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Thư mục lưu trữ database bền vững (Mount từ Docker volume /app/database)
const DB_DIR = path.join(__dirname, 'database');
const DB_FILE = path.join(DB_DIR, 'players.json');

if (!fs.existsSync(DB_DIR)) {
  try { fs.mkdirSync(DB_DIR, { recursive: true }); } catch (e) {}
}

// Bể lưu trữ hồ sơ người chơi vĩnh viễn: Map<token, profile>
const savedProfiles = new Map();

function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        for (const item of data) {
          if (item && item.token) {
            savedProfiles.set(item.token, item);
          }
        }
        console.log(`[DATABASE] Đã nạp thành công ${savedProfiles.size} hồ sơ nhân vật từ ${DB_FILE}`);
      }
    }
  } catch (err) {
    console.error('[DATABASE] Lỗi khi nạp players.json:', err.message);
  }
}

function saveDatabase() {
  try {
    const list = Array.from(savedProfiles.values());
    const tmpFile = DB_FILE + '.tmp';
    fs.writeFileSync(tmpFile, JSON.stringify(list, null, 2), 'utf8');
    fs.renameSync(tmpFile, DB_FILE);
  } catch (err) {
    console.error('[DATABASE] Lỗi khi lưu players.json:', err.message);
  }
}

// Nạp database ngay khi khởi chạy
loadDatabase();

// Định kỳ lưu snapshot mỗi 10 giây
setInterval(saveDatabase, 10000);

// Xử lý SIGTERM và SIGINT lưu an toàn trước khi dừng container
process.on('SIGTERM', () => {
  console.log('[SYSTEM] Nhận tín hiệu SIGTERM. Đang lưu database trước khi dừng...');
  saveDatabase();
  process.exit(0);
});
process.on('SIGINT', () => {
  console.log('[SYSTEM] Nhận tín hiệu SIGINT. Đang lưu database trước khi dừng...');
  saveDatabase();
  process.exit(0);
});

// Phục vụ thư mục tĩnh public/
app.use(express.static(path.join(__dirname, 'public')));

// =================================================================
// BẢNG TIẾN HÓA 14 CẤP HÌNH THÁI (7 THIÊN ĐÀNG + 7 ĐỊA NGỤC)
// =================================================================
const EVOLUTION_TIERS = {
  // --- THIÊN ĐÀNG (karma >= 0) ---
  H1: {
    id: 'H1', tier: 1, minKarma: 0, maxKarma: 49, realm: 'heaven',
    title: 'Người Thường Mới Lên', avatar: '🙂', scale: 1.0,
    perks: ['meditate', 'lantern', 'bless'], skill: null
  },
  H2: {
    id: 'H2', tier: 2, minKarma: 50, maxKarma: 149, realm: 'heaven',
    title: 'Tiểu Đồng Học Việc', avatar: '🧒', scale: 1.0,
    perks: ['confetti_dance'], skill: 'confetti_dance', skillName: '✨ Rắc Pháo Giấy', cd: 15
  },
  H3: {
    id: 'H3', tier: 3, minKarma: 150, maxKarma: 349, realm: 'heaven',
    title: 'Thiên Thần Tập Sự', avatar: '👼', scale: 1.05,
    perks: ['holy_banana'], skill: 'holy_banana', skillName: '🍌 Vỏ Chuối Thánh', cd: 25
  },
  H4: {
    id: 'H4', tier: 4, minKarma: 350, maxKarma: 699, realm: 'heaven',
    title: 'Thiên Thần Hộ Vệ', avatar: '🧚', scale: 1.1,
    perks: ['golden_lantern', 'frog_hex', 'holy_purify'],
    skill: 'holy_purify', skillName: '✨ Thánh Quang Trừng Phạt', cd: 20
  },
  H5: {
    id: 'H5', tier: 5, minKarma: 700, maxKarma: 1199, realm: 'heaven',
    title: 'Đại Thiên Sứ 6 Cánh', avatar: '🧝', scale: 1.16,
    perks: ['karma_mirror'], skill: 'karma_mirror', skillName: '🪞 Khiên Phản Nghiệp', cd: 45
  },
  H6: {
    id: 'H6', tier: 6, minKarma: 1200, maxKarma: 1999, realm: 'heaven',
    title: 'Thượng Tiên Cưỡi Mây', avatar: '🧙‍♂️', scale: 1.22,
    perks: ['polite_seal'], skill: 'polite_seal', skillName: '🤫 Bùa Ngoan Ngoãn', cd: 45
  },
  H7: {
    id: 'H7', tier: 7, minKarma: 2000, maxKarma: 3000, realm: 'heaven',
    title: 'Ngọc Hoàng Đại Đế', avatar: '👑', scale: 1.3,
    perks: ['grand_amnesty', 'heaven_rain'], skill: 'heaven_rain', skillName: '🌈 Mưa Lộc Trời', cd: 90
  },

  // --- ĐỊA NGỤC (karma < 0) ---
  D1: {
    id: 'D1', tier: 8, minKarma: -49, maxKarma: -1, realm: 'hell',
    title: 'Vong Hồn Lạc Lối', avatar: '👻', scale: 1.0,
    perks: ['wooden_fish', 'confess', 'pull_leg', 'self_sin'], skill: null
  },
  D2: {
    id: 'D2', tier: 9, minKarma: -149, maxKarma: -50, realm: 'hell',
    title: 'Tiểu Quỷ Sừng Nhú', avatar: '😈', scale: 1.0,
    perks: ['toxic_fart'], skill: 'toxic_fart', skillName: '💨 Bom Khói Độc', cd: 20
  },
  D3: {
    id: 'D3', tier: 10, minKarma: -349, maxKarma: -150, realm: 'hell',
    title: 'Quỷ Dạ Xoa', avatar: '👺', scale: 1.06,
    perks: ['pig_hex'], skill: 'pig_hex', skillName: '🐷 Bùa Hóa Heo', cd: 30
  },
  D4: {
    id: 'D4', tier: 11, minKarma: -699, maxKarma: -350, realm: 'hell',
    title: 'Ngưu Đầu Hộ Pháp', avatar: '👹', scale: 1.14,
    perks: ['double_pull', 'reverse_walk'], skill: 'reverse_walk', skillName: '🙃 Bùa Đi Ngược', cd: 35
  },
  D5: {
    id: 'D5', tier: 12, minKarma: -1199, maxKarma: -700, realm: 'hell',
    title: 'Hắc Bạch Vô Thường', avatar: '💀', scale: 1.2,
    perks: ['soul_chain'], skill: 'soul_chain', skillName: '⛓️ Xích Câu Hồn', cd: 20
  },
  D6: {
    id: 'D6', tier: 13, minKarma: -1999, maxKarma: -1200, realm: 'hell',
    title: 'Đại Ác Quỷ Vương', avatar: '🧛‍♂️', scale: 1.26,
    perks: ['black_hole'], skill: 'black_hole', skillName: '🕳️ Hố Đen Hút Nghiệp', cd: 50
  },
  D7: {
    id: 'D7', tier: 14, minKarma: -3000, maxKarma: -2000, realm: 'hell',
    title: 'Hỗn Thế Ma Tôn', avatar: '👿', scale: 1.34,
    perks: ['demon_eclipse'], skill: 'demon_eclipse', skillName: '🌑 Nhật Thực Ma Giới', cd: 90
  }
};

function getPlayerTier(karma) {
  if (karma >= 0) {
    if (karma >= 2000) return EVOLUTION_TIERS.H7;
    if (karma >= 1200) return EVOLUTION_TIERS.H6;
    if (karma >= 700) return EVOLUTION_TIERS.H5;
    if (karma >= 350) return EVOLUTION_TIERS.H4;
    if (karma >= 150) return EVOLUTION_TIERS.H3;
    if (karma >= 50) return EVOLUTION_TIERS.H2;
    return EVOLUTION_TIERS.H1;
  } else {
    if (karma <= -2000) return EVOLUTION_TIERS.D7;
    if (karma <= -1200) return EVOLUTION_TIERS.D6;
    if (karma <= -700) return EVOLUTION_TIERS.D5;
    if (karma <= -350) return EVOLUTION_TIERS.D4;
    if (karma <= -150) return EVOLUTION_TIERS.D3;
    if (karma <= -50) return EVOLUTION_TIERS.D2;
    return EVOLUTION_TIERS.D1;
  }
}

// Quản lý người chơi trong RAM
const players = new Map();

// Bể lưu sớ hối lỗi (tối đa 30 sớ)
const confessionPool = [
  { id: 'c_init_1', authorId: 'bot_hell_1', authorName: 'Tuấn Trùm Bom Hàng', text: 'Đặt 5 ly trà sữa trân châu rồi tắt máy đi ngủ để shipper đứng chờ dưới mưa.', createdAt: Date.now() - 60000 },
  { id: 'c_init_2', authorId: 'bot_hell_2', authorName: 'Đạt Đổ Thừa', text: 'Làm bể ly của mẹ nhưng đổ thừa cho con mèo mướp hàng xóm.', createdAt: Date.now() - 40000 },
  { id: 'c_init_3', authorId: 'bot_hell_3', authorName: 'My Mượn Tiền', text: 'Hứa qua tuần trả 500k mà tới giờ đã qua 52 cái tuần.', createdAt: Date.now() - 20000 }
];

// Danh sách vật phẩm đang bay trên trời (Hoa đăng & Sớ hối lỗi có thể thả tim)
const activeFloatingItems = new Map();

// Danh sách quả Đào Tiên đang rơi trên Thiên Đàng
let activePeaches = [];
let peachSpawnTimer = null;

// Bẫy vỏ chuối trên bản đồ: Map<bananaId, { id, x, y, ownerId, createdAt, expiresAt }>
const bananaTraps = new Map();

// Đám mây khói độc xì hơi: Map<fartId, { id, x, y, ownerId, expiresAt }>
const toxicFartClouds = new Map();

// Bao Lì Xì Tiên từ chiêu Mưa Lộc Ngọc Hoàng: Map<packetId, { id, x, y, karmaGain, expiresAt }>
const activeRedPackets = new Map();

// Hố đen hút nghiệp: Map<holeId, { id, x, y, ownerId, expiresAt, intervalId }>
const activeBlackHoles = new Map();

// Quản lý người chơi đang tắm vạc dầu
const boilingPlayers = new Map();

// Trạng thái Đài Phán Xét
let activeTrial = null;
let trialTimer = null;

// Từ khóa tục tĩu / khẩu nghiệp
const PROFANITY_REGEX = /(đm|dm|đkm|dkm|địt|dit|lồn|lon|cặc|cac|chó chết|buồi|buoi|đụ|du|mẹ mày|óc chó|súc vật|chết tiệt)/i;

// Danh sách câu nói nịnh hót khi bị dán Bùa Ngoan Ngoãn (H6)
const POLITE_MESSAGES = [
  'Dạ con xin lỗi các cụ ạ, con ngoan rồi ạ! 💖',
  'Dạ con yêu quý tất cả mọi người trong server ạ! 💖',
  'Ước gì ai cũng đẹp trai xinh gái và thánh thiện như các cụ trên này! 🌸',
  'Con xin sám hối, chúc cả server vạn sự như ý an khang! 🕊️',
  'Con thề từ nay ăn chay niệm phật không dám khẩu nghiệp nữa đâu ạ! 🙏'
];

// Danh sách lý do Tự Tạo Nghiệp vui nhộn ở Địa Ngục
const SELF_SIN_REASONS = [
  'Quỵt tiền trà sữa của đồng nghiệp',
  'Ăn vụng xôi gà trên mâm cúng tổ tiên',
  'Bom hàng shipper giữa trưa nắng 40 độ',
  'Xem chùa video không like không share',
  'Mượn bật lửa rồi đút túi đem về',
  'Giả vờ nghe điện thoại lúc nhân viên mang bill tới',
  'Cắm sạc điện thoại ké rồi lấy luôn cục sạc xịn'
];

// Gửi thông báo đến Nhật Ký Tam Giới (Live Kill-feed)
function broadcastKillFeed(text, icon = '📜') {
  io.emit('world:killfeed', {
    text,
    icon,
    time: Date.now()
  });
}

// Đồng bộ dữ liệu người chơi vào Map hồ sơ vĩnh viễn
function syncPlayerToProfile(player, saveNow = true) {
  if (!player || player.isBot || !player.token) return;
  savedProfiles.set(player.token, {
    token: player.token,
    name: player.name,
    karma: player.karma,
    realm: player.realm,
    x: Math.round(player.x),
    y: Math.round(player.y),
    stats: player.stats || { ascended: 0, descended: 0, smited: 0, pulled: 0, recruited: 0 },
    tier: player.tier,
    quest: player.quest,
    lastSeenAt: Date.now(),
    createdAt: player.createdAt || Date.now()
  });
  if (saveNow) {
    saveDatabase();
  }
}

// Cập nhật Karma an toàn và kiểm tra tiến hóa / chuyển cõi
function updateKarma(player, delta, reason = '', actor = null) {
  const oldTier = player.tier ? player.tier.id : getPlayerTier(player.karma).id;
  const oldRealm = player.realm;

  // Giới hạn điểm Karma [-3000, 3000]
  player.karma = Math.max(-3000, Math.min(3000, player.karma + delta));
  player.realm = player.karma >= 0 ? 'heaven' : 'hell';
  player.tier = getPlayerTier(player.karma);

  // 1. Kiểm tra Tiến Hóa Bậc Mới
  if (player.tier.id !== oldTier) {
    io.emit('player:evolved', {
      id: player.id,
      name: player.name,
      karma: player.karma,
      oldTierId: oldTier,
      newTier: player.tier
    });
    broadcastKillFeed(`✨ ${player.name} đã tiến hóa thành [${player.tier.title}] (${player.karma >= 0 ? '+' : ''}${player.karma})!`, '✨');
  }

  // 2. Chuyển cõi qua Cầu Nại Hà & Cơ Chế Chiêu Mộ Kéo Người Về Phe Mình
  if (oldRealm !== player.realm) {
    if (player.realm === 'heaven') {
      player.x = Math.max(15, Math.min(85, player.x));
      player.y = 38; // Bước qua cầu lên Thiên Đàng
      player.stats.ascended++;

      if (actor && actor.id !== player.id) {
        actor.stats.recruited = (actor.stats.recruited || 0) + 1;
        broadcastKillFeed(`✨ ${actor.name} đã cảm hóa thành công ${player.name} thăng thiên lên Thiên Đàng! Phe Thiên Đàng chiêu mộ thêm 1 thành viên!`, '🕊️');
        // Thưởng Công Đức cho người cảm hóa (+20 Karma)
        updateKarma(actor, 20, `Cảm hóa thành công ${player.name} về Thiên Đàng`);
        io.emit('world:recruited', {
          recruiterId: actor.id,
          recruiterName: actor.name,
          victimId: player.id,
          victimName: player.name,
          newRealm: 'heaven',
          reason: reason || 'Được cảm hóa thăng thiên'
        });
      } else {
        broadcastKillFeed(`🎉 ${player.name} đã tích đủ công đức thăng thiên qua Cầu Nại Hà!`, '🕊️');
      }
    } else {
      player.x = Math.max(15, Math.min(85, player.x));
      player.y = 62; // Rớt xuống Địa Ngục
      player.stats.descended++;

      if (actor && actor.id !== player.id) {
        actor.stats.recruited = (actor.stats.recruited || 0) + 1;
        broadcastKillFeed(`😈 ${actor.name} đã lôi kéo thành công ${player.name} sa ngã xuống Địa Ngục! Phe Địa Ngục chiêu mộ thêm 1 thành viên!`, '🔥');
        // Thưởng Ma Lực cho kẻ kéo (-20 Karma)
        updateKarma(actor, -20, `Lôi kéo thành công ${player.name} sa ngã xuống Địa Ngục`);
        io.emit('world:recruited', {
          recruiterId: actor.id,
          recruiterName: actor.name,
          victimId: player.id,
          victimName: player.name,
          newRealm: 'hell',
          reason: reason || 'Bị kéo sa ngã xuống cõi âm'
        });
      } else {
        broadcastKillFeed(`⚡ ${player.name} cạn sạch công đức, rớt thẳng xuống Địa Ngục!`, '🔥');
      }
    }

    io.emit('world:realm_change', {
      id: player.id,
      newRealm: player.realm,
      karma: player.karma,
      x: player.x,
      y: player.y,
      tier: player.tier
    });
    broadcastStats();
  }

  io.emit('player:updated', {
    id: player.id,
    karma: player.karma,
    realm: player.realm,
    x: player.x,
    y: player.y,
    stats: player.stats,
    tier: player.tier
  });

  // Tự động đồng bộ hồ sơ lưu trữ
  syncPlayerToProfile(player);
}

// Kiểm tra Khiên Phản Nghiệp (H5): phản ngược chiêu xấu về kẻ tung
function checkMirrorReflect(attacker, target, skillLabel, penalty = 0) {
  if (target && target.shieldUntil && Date.now() < target.shieldUntil) {
    if (penalty > 0) {
      updateKarma(attacker, -penalty, `Bị Khiên Phản Nghiệp của ${target.name} phản đòn`);
    }
    io.emit('world:effect', {
      type: 'mirror_reflect',
      sourceId: target.id,
      targetId: attacker.id,
      skillName: skillLabel
    });
    broadcastKillFeed(`🪞 ${target.name} kích hoạt Khiên Phản Nghiệp, phản ngược chiêu [${skillLabel}] về mặt ${attacker.name}!`, '🪞');
    return true; // Đã phản đòn
  }
  return false;
}

// Broadcast thống kê cân bằng thế giới
function broadcastStats() {
  let heavenCount = 0;
  let hellCount = 0;

  for (const p of players.values()) {
    if (p.realm === 'heaven') heavenCount++;
    else hellCount++;
  }

  io.emit('world:stats', {
    heavenCount,
    hellCount,
    total: players.size
  });
}

// Sinh quả Đào Tiên trên Thiên Đàng (mỗi 50s)
function spawnPeaches() {
  activePeaches = [];
  const count = 3;
  for (let i = 0; i < count; i++) {
    activePeaches.push({
      id: `peach_${Date.now()}_${i + 1}`,
      x: Math.round(70 + Math.random() * 16),
      y: Math.round(18 + Math.random() * 16)
    });
  }
  io.emit('landmark:peaches_spawned', { peaches: activePeaches });
}

// =================================================================
// NPC TAM GIỚI: BÀ LÃO MẠNH BÀ & NAM CỰC TIÊN ÔNG
// =================================================================
const NPC_MANH_BA = {
  id: 'npc_manh_ba',
  name: 'Bà Lão Mạnh Bà',
  title: 'Trấn Giữ Quán Canh Tam Giới',
  avatar: '👵🍵',
  realm: 'hell',
  x: 22,
  y: 58,
  quote: 'Canh mới nấu còn nóng hổi đây! Mau làm vài việc lặt vặt giúp ta rồi ta ban thưởng giải nghiệp cho!'
};

const NPC_TIEN_ONG = {
  id: 'npc_tien_ong',
  name: 'Nam Cực Tiên Ông',
  title: 'Chưởng Quản Tiên Đơn Thăng Thiên',
  avatar: '👴✨',
  realm: 'heaven',
  x: 22,
  y: 38,
  quote: 'Đạo hữu chí tại thanh hư, chăm chỉ tích lũy công đức để sớm cưỡi mây đạp gió thăng thiên!'
};

const QUEST_TEMPLATES = [
  {
    id: 'q_troll',
    title: 'Cấu Véo & Chọc Ghẹo',
    desc: 'Thi triển 3 lần kỹ năng troll hoặc kéo giò/ném sét/cảm hóa người khác hoặc Bots',
    targetType: 'troll',
    target: 3,
    reward: 65,
    quote: 'Mấy đứa trên trần hay dưới âm cãi nhau nhức đầu quá, mày đi chọc ghẹo 3 đứa cho vui cửa vui nhà đi con!'
  },
  {
    id: 'q_farm',
    title: 'Siêng Năng Cày Cuốc',
    desc: 'Tụng kinh hoặc Gõ mõ 8 lần để tích lũy công đức sám hối',
    targetType: 'farm',
    target: 8,
    reward: 60,
    quote: 'Ngồi không riết rỉ sét tay chân! Mau tụng kinh hoặc gõ mõ 8 lần rửa nghiệp giùm ta!'
  },
  {
    id: 'q_soup',
    title: 'Thưởng Trà Ranh Giới',
    desc: 'Đến Quán Canh uống cạn 1 bát Canh Mạnh Bà quên sự đời',
    targetType: 'soup',
    target: 1,
    reward: 50,
    quote: 'Mẻ canh mới nấu thơm lừng lựng! Mau uống thử một bát rồi quên hết phiền não trần gian đi con!'
  },
  {
    id: 'q_boil',
    title: 'Tắm Vạc Dầu Hoặc Hái Đào Tiên',
    desc: 'Nhảy vào Vạc Dầu Sôi hoặc Hái Đào Tiên trải nghiệm đặc trưng cõi 1 lần',
    targetType: 'boil',
    target: 1,
    reward: 75,
    quote: 'Người ngợm toàn mùi trần tục, mau tới công trình cõi mình (Vạc Dầu hoặc Cây Đào Tiên) thử sức một chút đi con!'
  },
  {
    id: 'q_cross',
    title: 'Tương Tác Chéo Cõi',
    desc: 'Dùng Thánh Quang (H4+) hoặc Xích Câu Hồn (D5+) tương tác chéo cõi 2 lần',
    targetType: 'cross',
    target: 2,
    reward: 85,
    quote: 'Hai cõi Thiên Đàng - Địa Ngục dạo này im ắng quá! Dùng chiêu chéo cõi khuấy đảo 2 lần xem nào!'
  },
  {
    id: 'q_confess_lantern',
    title: 'Tâm Hồn Lương Thiện',
    desc: 'Dâng 1 sớ hối lỗi chân thành hoặc thả 1 hoa đăng cầu phước',
    targetType: 'confess_lantern',
    target: 1,
    reward: 55,
    quote: 'Viết cho ta xem một câu hối lỗi chân thành, hoặc thả hoa đăng cầu an cho cõi này đi con!'
  }
];

function createRandomQuest(excludeId = null) {
  const pool = excludeId ? QUEST_TEMPLATES.filter(q => q.id !== excludeId) : QUEST_TEMPLATES;
  const tpl = pool[Math.floor(Math.random() * pool.length)] || QUEST_TEMPLATES[0];
  return {
    id: tpl.id,
    title: tpl.title,
    desc: tpl.desc,
    targetType: tpl.targetType,
    target: tpl.target,
    current: 0,
    reward: tpl.reward,
    quote: tpl.quote,
    isCompleted: false,
    isClaimed: false
  };
}

function getSocketById(id) {
  if (io.sockets && io.sockets.sockets && typeof io.sockets.sockets.get === 'function') {
    return io.sockets.sockets.get(id);
  }
  if (io.sockets && typeof io.sockets.get === 'function') {
    return io.sockets.get(id);
  }
  return null;
}

function updateQuestProgress(player, actionType, amount = 1) {
  if (!player || !player.quest || player.quest.isCompleted || player.quest.isClaimed) return;
  if (player.quest.targetType !== actionType) return;

  player.quest.current = Math.min(player.quest.target, player.quest.current + amount);
  if (player.quest.current >= player.quest.target) {
    player.quest.isCompleted = true;
    const socket = getSocketById(player.id);
    if (socket) {
      socket.emit('quest:updated', { quest: player.quest, completedNow: true });
      socket.emit('quest:completed', { quest: player.quest });
      socket.emit('system:toast', {
        message: `🎉 Đã hoàn thành nhiệm vụ [${player.quest.title}]! Mau đến gặp Bà Lão Mạnh Bà nhận thưởng!`
      });
    }
  } else {
    const socket = getSocketById(player.id);
    if (socket) {
      socket.emit('quest:updated', { quest: player.quest, completedNow: false });
    }
  }
}

// =================================================================
// KHU VỰC TRANH CHẤP (CONTROL POINTS) — BUFF X2 TỐC ĐỘ FARM
// =================================================================
const CONTROL_POINTS = {
  peach_tree: {
    id: 'peach_tree',
    name: 'Cây Đào Tiên',
    icon: '🍑',
    realm: 'heaven', // vị trí gốc thuộc cõi Thiên Đàng
    x: 78,
    y: 24,
    radius: 14, // bán kính vùng ảnh hưởng 14%
    controlledBy: 'neutral', // 'heaven' | 'hell' | 'neutral'
    heavenCount: 0,
    hellCount: 0,
    progress: 0 // -100 (Địa Ngục chiếm) đến +100 (Thiên Đàng chiếm)
  },
  boiling_cauldron: {
    id: 'boiling_cauldron',
    name: 'Vạc Dầu Sôi',
    icon: '🔥',
    realm: 'hell', // vị trí gốc thuộc cõi Địa Ngục
    x: 78,
    y: 72,
    radius: 14,
    controlledBy: 'neutral',
    heavenCount: 0,
    hellCount: 0,
    progress: 0
  }
};

function getKarmaMultiplier(player) {
  if (!player) return 1;
  // Phe player có đang kiểm soát ít nhất 1 Control Point không?
  const hasControl = Object.values(CONTROL_POINTS).some(cp => cp.controlledBy === player.realm);
  return hasControl ? 2 : 1;
}

let lastControlPointsPayload = '';
let lastControlPointsBroadcast = 0;

function updateControlPoints() {
  const now = Date.now();
  for (const cp of Object.values(CONTROL_POINTS)) {
    let heavenCount = 0;
    let hellCount = 0;

    for (const p of players.values()) {
      const dist = Math.hypot(p.x - cp.x, p.y - cp.y);
      if (dist <= cp.radius) {
        if (p.realm === 'heaven') heavenCount++;
        else hellCount++;
      }
    }

    cp.heavenCount = heavenCount;
    cp.hellCount = hellCount;

    if (heavenCount > hellCount) {
      const step = Math.min(50, (heavenCount - hellCount) * 25);
      cp.progress = Math.min(100, cp.progress + step);
      if (cp.progress >= 100 && cp.controlledBy !== 'heaven') {
        cp.controlledBy = 'heaven';
        broadcastKillFeed(`✨ Phe Thiên Đàng vừa chiếm lĩnh [${cp.name}]! Cả phe nhận Buff x2 Tốc Độ Farm!`, '✨');
        io.emit('control_point:captured', { pointId: cp.id, controlledBy: 'heaven', name: cp.name });
      }
    } else if (hellCount > heavenCount) {
      const step = Math.min(50, (hellCount - heavenCount) * 25);
      cp.progress = Math.max(-100, cp.progress - step);
      if (cp.progress <= -100 && cp.controlledBy !== 'hell') {
        cp.controlledBy = 'hell';
        broadcastKillFeed(`🔥 Phe Địa Ngục vừa chiếm đoạt thành công [${cp.name}]! Cả phe nhận Buff x2 Tốc Độ Farm!`, '🔥');
        io.emit('control_point:captured', { pointId: cp.id, controlledBy: 'hell', name: cp.name });
      }
    }
  }

  // Tối ưu hiệu năng: Chỉ broadcast socket khi điểm tiến trình hoặc số người thay đổi,
  // hoặc gửi heartbeat định kỳ mỗi 10s để tránh spam network
  const currentPayload = `${CONTROL_POINTS.peach_tree.progress}_${CONTROL_POINTS.peach_tree.heavenCount}_${CONTROL_POINTS.peach_tree.hellCount}_${CONTROL_POINTS.boiling_cauldron.progress}_${CONTROL_POINTS.boiling_cauldron.heavenCount}_${CONTROL_POINTS.boiling_cauldron.hellCount}`;
  if (currentPayload !== lastControlPointsPayload || (now - lastControlPointsBroadcast >= 10000)) {
    lastControlPointsPayload = currentPayload;
    lastControlPointsBroadcast = now;
    io.emit('control_points:update', {
      peach_tree: CONTROL_POINTS.peach_tree,
      boiling_cauldron: CONTROL_POINTS.boiling_cauldron
    });
  }
}

// =================================================================
// 14 NPC AMBIENT BOTS (7 THIÊN ĐÀNG & 7 ĐỊA NGỤC ĐỐI ĐẦU TRANH CHẤP)
// =================================================================
const BOTS = [
  // Cõi Thiên Đàng (7 Bots đại diện 7 bậc H1 -> H7)
  { id: 'bot_heaven_1', name: 'Hùng Hay Hứa', karma: 35, realm: 'heaven', x: 22, y: 22 }, // H1: Người Thường
  { id: 'bot_heaven_2', name: 'Thảo Thánh Thiện', karma: 95, realm: 'heaven', x: 38, y: 26 }, // H2: Tiểu Đồng
  { id: 'bot_heaven_3', name: 'Minh Mộng Mơ', karma: 220, realm: 'heaven', x: 55, y: 32 }, // H3: Thiên Thần Tập Sự
  { id: 'bot_heaven_4', name: 'An An Nhiên', karma: 480, realm: 'heaven', x: 74, y: 26 }, // H4: Thiên Thần Hộ Vệ (bảo vệ Cây Đào Tiên)
  { id: 'bot_heaven_5', name: 'Linh Lương Thiện', karma: 850, realm: 'heaven', x: 82, y: 22 }, // H5: Đại Thiên Sứ 6 Cánh
  { id: 'bot_heaven_6', name: 'Trí Thượng Tiên', karma: 1550, realm: 'heaven', x: 48, y: 18 }, // H6: Thượng Tiên Cưỡi Mây
  { id: 'bot_heaven_7', name: 'Đại Đế Giáng Trần', karma: 2400, realm: 'heaven', x: 50, y: 22 }, // H7: Ngọc Hoàng Đại Đế

  // Cõi Địa Ngục (7 Bots đại diện 7 bậc D1 -> D7)
  { id: 'bot_hell_1', name: 'Tuấn Trùm Bom Hàng', karma: -35, realm: 'hell', x: 25, y: 65 }, // D1: Vong Hồn Lạc Lối
  { id: 'bot_hell_2', name: 'Lan Lươn Lẹo', karma: -90, realm: 'hell', x: 38, y: 72 }, // D2: Tiểu Quỷ Sừng Nhú
  { id: 'bot_hell_3', name: 'Huy Hắc Ám', karma: -260, realm: 'hell', x: 55, y: 78 }, // D3: Quỷ Dạ Xoa
  { id: 'bot_hell_4', name: 'Đạt Đổ Thừa', karma: -520, realm: 'hell', x: 74, y: 70 }, // D4: Ngưu Đầu Hộ Pháp (bảo vệ Vạc Dầu Sôi)
  { id: 'bot_hell_5', name: 'Quang Quỵt Nợ', karma: -850, realm: 'hell', x: 80, y: 74 }, // D5: Hắc Bạch Vô Thường
  { id: 'bot_hell_6', name: 'My Mượn Tiền', karma: -1450, realm: 'hell', x: 62, y: 82 }, // D6: Đại Ác Quỷ Vương
  { id: 'bot_hell_7', name: 'Bảo Bạo Chúa', karma: -2300, realm: 'hell', x: 48, y: 75 } // D7: Hỗn Thế Ma Tôn
];

function initBots() {
  const activeBots = getActiveBotList();
  for (const b of activeBots) {
    const tier = getPlayerTier(b.karma);
    players.set(b.id, {
      id: b.id,
      name: b.name,
      karma: b.karma,
      realm: b.realm,
      x: b.x,
      y: b.y,
      isBot: true,
      lastActionAt: Date.now(),
      lastPullAt: 0,
      lastLanternAt: 0,
      lastConfessAt: 0,
      lastSoupAt: 0,
      lastAmnestyAt: 0,
      lastChainAt: 0,
      lastWoodenFishAt: 0,
      fishCombo: 1,
      drunkUntil: 0,
      speedBoostUntil: 0,
      shieldUntil: 0,
      politeUntil: 0,
      reverseMoveUntil: 0,
      danceUntil: 0,
      polymorph: null,
      cooldowns: {},
      stats: { ascended: 0, descended: 0, smited: 0, pulled: 0, recruited: 0 },
      tier
    });
  }
}

// Cơ chế co giãn Bots tự động (Adaptive Bots) theo số người thật online
function getActiveBotList() {
  const realCount = Array.from(players.values()).filter(p => !p.isBot).length;
  if (realCount >= 8) {
    // Khi có từ 8 người thật trở lên: Cho toàn bộ bots đi ngủ nhường sân khấu
    return [];
  } else if (realCount >= 4) {
    // Khi có từ 4 đến 7 người thật: Giữ 6 bots nòng cốt (3 Thiên Đàng, 3 Địa Ngục)
    return [BOTS[0], BOTS[1], BOTS[2], BOTS[7], BOTS[8], BOTS[9]];
  }
  // Dưới 4 người thật: Kích hoạt đầy đủ 14 bots để bản đồ luôn nhộn nhịp
  return BOTS;
}

function adjustBotsForPlayerCount() {
  const targetBots = getActiveBotList();
  const targetIds = new Set(targetBots.map(b => b.id));

  for (const b of BOTS) {
    const isOnline = players.has(b.id);
    const shouldBeOnline = targetIds.has(b.id);

    if (shouldBeOnline && !isOnline) {
      // Đánh thức bot
      const tier = getPlayerTier(b.karma);
      const botPlayer = {
        id: b.id,
        name: b.name,
        karma: b.karma,
        realm: b.realm,
        x: b.x,
        y: b.y,
        isBot: true,
        lastActionAt: Date.now(),
        lastPullAt: 0,
        lastLanternAt: 0,
        lastConfessAt: 0,
        lastSoupAt: 0,
        lastAmnestyAt: 0,
        lastChainAt: 0,
        lastWoodenFishAt: 0,
        fishCombo: 1,
        drunkUntil: 0,
        speedBoostUntil: 0,
        shieldUntil: 0,
        politeUntil: 0,
        reverseMoveUntil: 0,
        danceUntil: 0,
        polymorph: null,
        cooldowns: {},
        stats: { ascended: 0, descended: 0, smited: 0, pulled: 0, recruited: 0 },
        tier
      };
      players.set(b.id, botPlayer);
      io.emit('player:joined', botPlayer);
    } else if (!shouldBeOnline && isOnline) {
      // Cho bot tạm nghỉ
      players.delete(b.id);
      io.emit('player:left', { id: b.id });
    }
  }
}

// Vòng lặp hành vi tự động của Bots: Chiến đấu, Tranh chấp Cứ Điểm & Kéo người về phe
// Tối ưu hiệu năng: Stagger 2 bots mỗi 500ms thay vì dồn dập 14 bots cùng millisecond 0 gây giật lag
let botCursor = 0;
function startBotLoop() {
  setInterval(() => {
    const now = Date.now();
    const activeBots = getActiveBotList();
    if (activeBots.length === 0) return;

    const batchSize = Math.min(2, activeBots.length);

    for (let i = 0; i < batchSize; i++) {
      const b = activeBots[(botCursor + i) % activeBots.length];
      if (!b) continue;
      const p = players.get(b.id);
      if (!p) continue;

      // Đồng bộ realm nếu bot bị kéo chuyển cõi
      if (p.realm !== b.realm) {
        b.realm = p.realm;
      }

      // =============================================================
      // 1. DI CHUYỂN CHIẾN THUẬT (TRANH CHẤP CỨ ĐIỂM & TUẦN TRA RANH GIỚI)
      // =============================================================
      const randMove = Math.random();
      let targetX = p.x;
      let targetY = p.y;

      if (p.realm === 'heaven') {
        if (randMove < 0.40) {
          // 40% di chuyển bảo vệ hoặc chiếm đóng Cây Đào Tiên (x: 78, y: 24)
          targetX = 74 + Math.random() * 8;
          targetY = 20 + Math.random() * 8;
        } else if (randMove < 0.65) {
          // 25% tuần tra ranh giới Cầu Nại Hà để cảm hóa người Địa Ngục (y: 36 - 42)
          targetX = 35 + Math.random() * 30;
          targetY = 36 + Math.random() * 6;
        } else {
          // 35% tản bộ tự do thanh tịnh
          targetX = p.x + (Math.random() - 0.5) * 8;
          targetY = p.y + (Math.random() - 0.5) * 6;
        }
        p.x = Math.max(12, Math.min(88, targetX));
        p.y = Math.max(14, Math.min(42, targetY));
      } else {
        if (randMove < 0.40) {
          // 40% di chuyển bảo vệ hoặc chiếm đóng Vạc Dầu Sôi (x: 78, y: 72)
          targetX = 74 + Math.random() * 8;
          targetY = 68 + Math.random() * 8;
        } else if (randMove < 0.65) {
          // 25% rình rập ở ranh giới Cầu Nại Hà để kéo giò người Thiên Đàng (y: 58 - 64)
          targetX = 35 + Math.random() * 30;
          targetY = 58 + Math.random() * 6;
        } else {
          // 35% tản bộ tự do quấy nhiễu
          targetX = p.x + (Math.random() - 0.5) * 8;
          targetY = p.y + (Math.random() - 0.5) * 6;
        }
        p.x = Math.max(12, Math.min(88, targetX));
        p.y = Math.max(58, Math.min(86, targetY));
      }

      io.emit('player:moved', { id: p.id, x: Math.round(p.x), y: Math.round(p.y) });

      // Kiểm tra dẫm phải bẫy vỏ chuối
      checkTrapsOnMove(p);

      // =============================================================
      // 2. GIAO TRANH, DÙNG KỸ NĂNG & KÉO NGƯỜI VỀ PHE MÌNH
      // =============================================================
      p.cooldowns = p.cooldowns || {};

      // Xác suất 30% mỗi nhịp bot sẽ tung chiêu hoặc tương tác
      if (Math.random() < 0.32) {
        if (p.realm === 'hell') {
          // -----------------------------------------------------------
          // CHIẾN ĐẤU PHE ĐỊA NGỤC: LÔI KÉO SA NGÃ, HÚT HỒN, TROLL
          // -----------------------------------------------------------
          const isTestMode = process.env.NODE_ENV === 'test';
          const heavenTargets = Array.from(players.values()).filter(other => other.id !== p.id && other.realm === 'heaven' && (!isTestMode || other.isBot));
          const allNearTargets = Array.from(players.values()).filter(other => other.id !== p.id && Math.hypot(other.x - p.x, other.y - p.y) <= 28 && (!isTestMode || other.isBot));

          // A. Chiêu mộ cấp cao: D5+ dùng Xích Câu Hồn kéo người Thiên Đàng
          if (p.tier.tier >= 12 && heavenTargets.length > 0 && (now - (p.cooldowns.soul_chain || 0) >= 20000)) {
            // Ưu tiên người chơi thật hoặc mục tiêu có Karma thấp gần ranh giới
            const target = heavenTargets.sort((a, b) => a.karma - b.karma)[0];
            p.cooldowns.soul_chain = now;

            if (!checkMirrorReflect(p, target, 'Xích Câu Hồn', 15)) {
              updateKarma(target, -15, `Bị Hắc Bạch Vô Thường ${p.name} hút 15 Karma`, p);
              updateKarma(p, -15, `Hút 15 Karma từ thiên thần ${target.name}`);

              let pulledDirectly = false;
              if (target.karma < 0) {
                pulledDirectly = true;
                target.x = Math.max(12, Math.min(88, p.x + 4));
                target.y = Math.max(58, Math.min(86, p.y));
                io.emit('player:moved', { id: target.id, x: target.x, y: target.y });
              }

              io.emit('world:effect', {
                type: 'soul_chain',
                sourceId: p.id,
                targetId: target.id,
                sourceX: p.x,
                sourceY: p.y,
                targetX: target.x,
                targetY: target.y,
                pulledDirectly
              });
              broadcastKillFeed(`⚡ Hắc Bạch Vô Thường ${p.name} quăng Xích Câu Hồn hút 15 Karma từ thiên thần ${target.name}!`, '⚡');

              io.emit('player:chatted', {
                id: p.id,
                message: `Dưới này ấm áp lắm, theo ta xuống Địa Ngục nào ${target.name}! ⛓️😈`,
                isPenalty: false
              });
            }
          }
          // B. D4: Bùa Đi Ngược hoặc Kéo Giò
          else if (p.tier.tier >= 11 && allNearTargets.length > 0 && (now - (p.cooldowns.reverse_walk || 0) >= 35000)) {
            const target = allNearTargets[Math.floor(Math.random() * allNearTargets.length)];
            p.cooldowns.reverse_walk = now;

            if (!checkMirrorReflect(p, target, 'Bùa Đi Ngược Lú Lẫn', 0)) {
              target.reverseMoveUntil = now + 10000;
              io.emit('world:effect', {
                type: 'reverse_walk',
                sourceId: p.id,
                targetId: target.id,
                until: target.reverseMoveUntil
              });
              broadcastKillFeed(`🙃 ${p.name} ếm Bùa Lú Lẫn lên ${target.name}, click đi đâu chạy ngược lại đó 10s!`, '🙃');
            }
          }
          // C. D3: Bùa Hóa Heo Hồng
          else if (p.tier.tier >= 10 && allNearTargets.length > 0 && (now - (p.cooldowns.pig_hex || 0) >= 30000)) {
            const target = allNearTargets[Math.floor(Math.random() * allNearTargets.length)];
            p.cooldowns.pig_hex = now;

            if (!checkMirrorReflect(p, target, 'Bùa Hóa Heo', 0)) {
              target.polymorph = { type: 'pig', until: now + 8000 };
              io.emit('player:polymorphed', { id: target.id, type: 'pig', until: target.polymorph.until });
              broadcastKillFeed(`🐷 ${p.name} dán bùa biến ${target.name} thành Chú Heo Hồng 8s!`, '🐷');
              io.emit('player:chatted', {
                id: p.id,
                message: `Biến thành heo hồng lon ton sám hối đi ${target.name}! 🐷`,
                isPenalty: false
              });
            }
          }
          // D. D2: Bom Khói Độc hoặc Kéo Giò
          else if (p.tier.tier >= 9 && (now - (p.cooldowns.toxic_fart || 0) >= 20000)) {
            p.cooldowns.toxic_fart = now;
            const fartId = 'fart_' + now + '_' + p.id;
            toxicFartClouds.set(fartId, { id: fartId, x: p.x, y: p.y, ownerId: p.id, expiresAt: now + 10000 });
            io.emit('fart:spawned', { id: fartId, x: p.x, y: p.y });
            broadcastKillFeed(`💨 ${p.name} xì một đám mây khói độc xanh lè bốc mùi nồng nặc!`, '💨');
          }
          // E. Cơ bản: Kéo Giò mục tiêu gần
          else if (allNearTargets.length > 0 && (now - p.lastPullAt >= 2000)) {
            const target = allNearTargets[0];
            p.lastPullAt = now;
            const penalty = p.tier.perks.includes('double_pull') ? 8 : 4;
            if (!checkMirrorReflect(p, target, 'Kéo Giò', penalty)) {
              target.stats.pulled++;
              updateKarma(target, -penalty, `Bị ${p.name} kéo giò`, p);
              io.emit('world:effect', {
                type: 'pull_leg',
                sourceId: p.id,
                targetId: target.id,
                targetX: target.x,
                targetY: target.y,
                penalty
              });
              broadcastKillFeed(`🦀 ${p.name} kéo giò ${target.name} (-${penalty} Karma)!`, '🦀');
            }
          }
        } else {
          // -----------------------------------------------------------
          // CHIẾN ĐẤU PHE THIÊN ĐÀNG: CẢM HÓA THĂNG THIÊN, BAN PHƯỚC, BẢO HỘ
          // -----------------------------------------------------------
          const isTestMode = process.env.NODE_ENV === 'test';
          const hellTargets = Array.from(players.values()).filter(other => other.id !== p.id && other.realm === 'hell' && (!isTestMode || other.isBot));
          const allNearTargets = Array.from(players.values()).filter(other => other.id !== p.id && Math.hypot(other.x - p.x, other.y - p.y) <= 28 && (!isTestMode || other.isBot));

          // A. Chiêu mộ & Cảm hóa cấp cao: H4+ dùng Thánh Quang hoặc Ban Phước kéo người Địa Ngục lên Thiên Đàng
          if (p.tier.tier >= 4 && hellTargets.length > 0 && (now - (p.cooldowns.holy_purify || 0) >= 20000)) {
            // Ưu tiên mục tiêu có Karma âm nhẹ nhất (gần 0 nhất) để dễ cảm hóa thăng thiên
            const target = hellTargets.sort((a, b) => b.karma - a.karma)[0];
            p.cooldowns.holy_purify = now;

            // 50% cơ hội dùng Ban Phước cảm hóa tăng Karma cho họ
            if (Math.random() < 0.5) {
              updateKarma(target, 8, `Được ${p.name} ban phước cảm hóa`, p);
              updateKarma(p, 3, 'Ban phước cảm hóa chúng sinh');
              io.emit('world:effect', {
                type: 'bless',
                sourceId: p.id,
                targetId: target.id,
                targetX: target.x,
                targetY: target.y
              });
              broadcastKillFeed(`✨ ${p.name} đã ban phước cảm hóa ${target.name} (+8 Karma)!`, '✨');
              io.emit('player:chatted', {
                id: p.id,
                message: `Quay đầu là bờ! Ánh sáng từ bi đón ngươi về cõi lành ${target.name}! ✨🪷`,
                isPenalty: false
              });
            } else {
              // 50% giáng Thánh Quang trừng phạt hút 15 Karma
              if (!checkMirrorReflect(p, target, 'Thánh Quang Trừng Phạt', 15)) {
                updateKarma(target, -15, `Bị ${p.name} giáng Thánh Quang trừng phạt`, p);
                updateKarma(p, 15, `Thanh tẩy kẻ ác ${target.name}`);
                io.emit('world:effect', {
                  type: 'holy_purify',
                  sourceId: p.id,
                  targetId: target.id,
                  sourceX: p.x,
                  sourceY: p.y,
                  targetX: target.x,
                  targetY: target.y,
                  mode: 'punish'
                });
                broadcastKillFeed(`✨ Thiên Thần ${p.name} vừa dùng Thánh Quang trừng phạt hút 15 Karma từ ác quỷ ${target.name}!`, '✨');
              }
            }
          }
          // B. H4: Bùa Hóa Ếch Xanh
          else if (p.tier.tier >= 4 && hellTargets.length > 0 && (now - (p.cooldowns.frog_hex || 0) >= 35000)) {
            const target = hellTargets[0];
            p.cooldowns.frog_hex = now;
            if (!checkMirrorReflect(p, target, 'Hóa Ếch Xanh', 0)) {
              target.polymorph = { type: 'frog', until: now + 8000 };
              io.emit('player:polymorphed', { id: target.id, type: 'frog', until: target.polymorph.until });
              broadcastKillFeed(`🐸 ${p.name} niệm phép biến ${target.name} thành Con Ếch Xanh trong 8s!`, '🐸');
              io.emit('player:chatted', {
                id: p.id,
                message: `Ộp ộp ngồi sám hối đi con! 🐸✨`,
                isPenalty: false
              });
            }
          }
          // C. H3: Đặt Bẫy Vỏ Chuối Thánh
          else if (p.tier.tier >= 3 && (now - (p.cooldowns.holy_banana || 0) >= 25000)) {
            p.cooldowns.holy_banana = now;
            const bananaId = 'banana_' + now + '_' + p.id;
            bananaTraps.set(bananaId, { id: bananaId, x: p.x, y: p.y, ownerId: p.id, createdAt: now, expiresAt: now + 20000 });
            io.emit('banana:spawned', { id: bananaId, x: p.x, y: p.y });
            broadcastKillFeed(`🍌 ${p.name} vừa đặt một Vỏ Chuối Thánh Thiện lấp lánh trên đất!`, '🍌');
          }
          // D. H2: Pháo Giấy Vui Vẻ
          else if (p.tier.tier >= 2 && allNearTargets.length > 0 && (now - (p.cooldowns.confetti_dance || 0) >= 15000)) {
            const target = allNearTargets[0];
            p.cooldowns.confetti_dance = now;
            target.danceUntil = now + 3000;
            updateKarma(p, 3, 'Rắc pháo giấy chúc mừng');
            updateKarma(target, 3, 'Nhận pháo giấy may mắn');
            io.emit('world:effect', {
              type: 'confetti_dance',
              sourceId: p.id,
              targetId: target.id,
              targetX: target.x,
              targetY: target.y
            });
            broadcastKillFeed(`✨ ${p.name} bắn pháo hoa giấy khiến ${target.name} nhảy múa lắc lư 3s (+3 Karma)!`, '✨');
          }
          // E. Cơ bản: Ban phước cho người Địa Ngục gần Cầu Nại Hà
          else if (hellTargets.length > 0 && (now - p.lastActionAt >= 2000)) {
            const target = hellTargets[0];
            p.lastActionAt = now;
            updateKarma(target, 5, `Được ${p.name} ban phước`, p);
            updateKarma(p, 2, 'Ban phước cho chúng sinh');
            io.emit('world:effect', {
              type: 'bless',
              sourceId: p.id,
              targetId: target.id,
              targetX: target.x,
              targetY: target.y
            });
            broadcastKillFeed(`✨ ${p.name} đã ban phước cho ${target.name} (+5 Karma)!`, '✨');
          }
        }
      }

      // =============================================================
      // 3. THỈNH THOẢNG BOT CHAT CÂU THOẠI CHIẾN TRANH HÀI HƯỚC
      // =============================================================
      if (Math.random() < 0.07) {
        let text = '';
        if (p.realm === 'heaven') {
          const quotes = [
            'Hôm nay trời đẹp, mau mau thăng thiên về phe Thiên Đàng đi các bạn ơi! 🪷',
            'Ai ở cõi âm muốn hoàn lương cứ qua đây ta ban phước cho! ✨',
            'Cây Đào Tiên là của phe Thiên Đàng, ai cấm cản ta ném sét ráng chịu! 🍑⚡',
            'Sống lương thiện đời tự khắc nở hoa 😇',
            'Ta sẽ cảm hóa hết lũ quỷ cõi âm lên đây ăn đào tiên! 🍑🕊️'
          ];
          text = quotes[Math.floor(Math.random() * quotes.length)];
        } else {
          const quotes = [
            'Dưới này ấm áp ghê, vạc dầu sôi sùng sục đã cái nư! 🔥😈',
            'Mấy đứa trên trần xuống đây quậy với tụi tao cho vui, sống chi đạo đức giả! 🦀',
            'Xích Câu Hồn của ta sẵn sàng rồi, đứa nào bước gần Cầu Nại Hà là ta lôi cổ xuống! ⛓️',
            'Chiếm Vạc Dầu nhận Buff x2 Ma Lực mau anh em Địa Ngục ơi! 🌋',
            'Tu Ma Đạo mới là chân lý, quậy tưng bừng tam giới luôn! 👺🔥'
          ];
          text = quotes[Math.floor(Math.random() * quotes.length)];
        }
        io.emit('player:chatted', { id: p.id, message: text, isPenalty: false });
      }
    }
    botCursor = (botCursor + batchSize) % BOTS.length;
  }, 500);
}

// Kiểm tra nhân vật đi ngang qua bẫy vỏ chuối
function checkTrapsOnMove(player) {
  const now = Date.now();
  for (const [bananaId, trap] of bananaTraps.entries()) {
    if (now > trap.expiresAt) {
      bananaTraps.delete(bananaId);
      continue;
    }

    // Miễn nhiễm với người đặt trong 2 giây đầu
    if (player.id === trap.ownerId && now - trap.createdAt < 2000) {
      continue;
    }

    const dist = Math.hypot(player.x - trap.x, player.y - trap.y);
    if (dist <= 6.0) {
      // TRƯỢT VỎ CHUỐI!
      bananaTraps.delete(bananaId);
      io.emit('banana:triggered', {
        bananaId,
        victimId: player.id,
        victimName: player.name,
        victimX: player.x,
        victimY: player.y
      });

      // Văng lệch tọa độ ngẫu nhiên
      player.x = Math.max(10, Math.min(90, player.x + (Math.random() - 0.5) * 16));
      if (player.realm === 'heaven') {
        player.y = Math.max(14, Math.min(42, player.y + (Math.random() - 0.5) * 8));
      } else {
        player.y = Math.max(58, Math.min(86, player.y + (Math.random() - 0.5) * 8));
      }
      io.emit('player:moved', { id: player.id, x: Math.round(player.x), y: Math.round(player.y) });

      // Nạn nhân tự hét lên
      io.emit('player:chatted', {
        id: player.id,
        message: 'Á đù vỏ chuối của ai vậy!! 🍌💫',
        isPenalty: false
      });
      broadcastKillFeed(`🍌 ${player.name} giẫm phải vỏ chuối thánh thiện trượt té quay 720 độ văng ra xa!`, '🍌');
      break;
    }
  }
}

// =================================================================
// ĐÀI PHÁN XÉT CÔNG CỘNG (MINI-EVENT CHU KỲ MỖI 90s)
// =================================================================
function startTrialCycle() {
  setInterval(() => {
    if (activeTrial) return; // Đang có phiên xử
    if (confessionPool.length === 0) return;

    // Chọn ngẫu nhiên 1 sớ trong bể
    const confession = confessionPool[Math.floor(Math.random() * confessionPool.length)];

    activeTrial = {
      id: 'trial_' + Date.now(),
      confessionId: confession.id,
      authorId: confession.authorId,
      authorName: confession.authorName,
      text: confession.text,
      forgiveVotes: new Set(),
      punishVotes: new Set(),
      startedAt: Date.now(),
      endsAt: Date.now() + 20000 // 20 giây bỏ phiếu
    };

    io.emit('trial:start', {
      id: activeTrial.id,
      authorName: activeTrial.authorName,
      text: activeTrial.text,
      endsAt: activeTrial.endsAt
    });

    broadcastKillFeed(`⚖️ ĐÀI PHÁN XÉT đã mở cho tội nhân [${activeTrial.authorName}]! Mau bỏ phiếu trong 20s!`, '⚖️');

    trialTimer = setTimeout(() => {
      resolveTrial();
    }, 20000);
  }, 90000); // 90 giây một lần
}

function resolveTrial() {
  if (!activeTrial) return;

  const forgiveCount = activeTrial.forgiveVotes.size;
  const punishCount = activeTrial.punishVotes.size;
  const author = players.get(activeTrial.authorId);

  let result = 'punish';
  if (forgiveCount > punishCount) {
    result = 'forgive';
    if (author) {
      updateKarma(author, 20, 'Được chúng sinh đại xá tại Đài Phán Xét');
    }
  } else {
    result = 'punish';
    if (author) {
      updateKarma(author, -15, 'Bị chúng sinh kết tội tại Đài Phán Xét');
    }
  }

  io.emit('trial:end', {
    id: activeTrial.id,
    result,
    forgiveCount,
    punishCount,
    authorName: activeTrial.authorName
  });

  activeTrial = null;
  trialTimer = null;
}

// Dọn dẹp định kỳ các vật phẩm / hiệu ứng hết hạn để tránh rò rỉ RAM
setInterval(() => {
  const now = Date.now();

  // Dọn bẫy chuối
  for (const [id, trap] of bananaTraps.entries()) {
    if (now > trap.expiresAt) bananaTraps.delete(id);
  }

  // Dọn khói độc
  for (const [id, fart] of toxicFartClouds.entries()) {
    if (now > fart.expiresAt) toxicFartClouds.delete(id);
  }

  // Dọn lì xì
  for (const [id, pkt] of activeRedPackets.entries()) {
    if (now > pkt.expiresAt) activeRedPackets.delete(id);
  }

  // Dọn hố đen
  for (const [id, hole] of activeBlackHoles.entries()) {
    if (now > hole.expiresAt) {
      if (hole.intervalId) clearInterval(hole.intervalId);
      activeBlackHoles.delete(id);
    }
  }

  // Dọn trạng thái tạm của người chơi
  for (const p of players.values()) {
    if (p.polymorph && now > p.polymorph.until) p.polymorph = null;
    if (p.shieldUntil && now > p.shieldUntil) p.shieldUntil = 0;
    if (p.politeUntil && now > p.politeUntil) p.politeUntil = 0;
    if (p.reverseMoveUntil && now > p.reverseMoveUntil) p.reverseMoveUntil = 0;
    if (p.danceUntil && now > p.danceUntil) p.danceUntil = 0;
  }
}, 5000);

// Quản lý số kết nối trên mỗi IP (Chống Spam Đa Tab / Treo máy)
const ipConnections = new Map();

function getClientIp(socket) {
  const headers = socket.handshake?.headers || {};
  const cfIp = headers['cf-connecting-ip'];
  if (cfIp) return cfIp.trim();
  const xForwarded = headers['x-forwarded-for'];
  if (xForwarded) {
    const first = xForwarded.split(',')[0].trim();
    if (first) return first;
  }
  return socket.handshake?.address || 'unknown';
}

// Khởi chạy bots & chu kỳ đào tiên & khu vực tranh chấp
initBots();
startBotLoop();
startTrialCycle();
spawnPeaches();
peachSpawnTimer = setInterval(spawnPeaches, 50000);
const controlPointsTimer = setInterval(updateControlPoints, 2000);

// =================================================================
// XỬ LÝ KẾT NỐI SOCKET.IO MULTIPLAYER
// =================================================================
io.on('connection', (socket) => {
  const clientIp = getClientIp(socket);
  const isLocalIp = process.env.NODE_ENV === 'test' || clientIp === '127.0.0.1' || clientIp === '::1' || clientIp === 'localhost' || clientIp.includes('127.0.0.1') || clientIp === 'unknown';
  const currentIpCount = (ipConnections.get(clientIp) || 0) + 1;
  ipConnections.set(clientIp, currentIpCount);
  // console.log('[DEBUG IP]', clientIp, 'isLocal:', isLocalIp, 'count:', currentIpCount);

  // Giới hạn tối đa 4 tab/thiết bị từ cùng một IP (trừ localhost)
  if (!isLocalIp && currentIpCount > 4) {
    socket.emit('system:toast', { message: 'Đã đạt giới hạn tối đa 4 kết nối từ cùng một địa chỉ mạng!' });
    socket.disconnect(true);
    return;
  }

  // 1.1 TỰ ĐỘNG KHÔI PHỤC PHIÊN CHƠI (SILENT RECONNECT - KHÔNG CẦN ĐĂNG KÝ)
  socket.on('player:resume', (data = {}) => {
    const token = data && typeof data.token === 'string' ? data.token.trim() : null;
    if (!token || !savedProfiles.has(token)) {
      socket.emit('player:resume_failed', { reason: 'not_found' });
      return;
    }

    const saved = savedProfiles.get(token);
    const tier = getPlayerTier(saved.karma);
    const realm = saved.karma >= 0 ? 'heaven' : 'hell';

    const player = {
      id: socket.id,
      token: saved.token,
      name: saved.name || 'Linh Hồn',
      karma: saved.karma,
      realm,
      x: typeof saved.x === 'number' ? saved.x : (realm === 'heaven' ? 40 : 40),
      y: typeof saved.y === 'number' ? saved.y : (realm === 'heaven' ? 25 : 70),
      lastActionAt: 0,
      lastPullAt: 0,
      lastLanternAt: 0,
      lastConfessAt: 0,
      lastSoupAt: 0,
      lastAmnestyAt: 0,
      lastChainAt: 0,
      lastWoodenFishAt: 0,
      fishCombo: 1,
      drunkUntil: 0,
      speedBoostUntil: 0,
      shieldUntil: 0,
      politeUntil: 0,
      reverseMoveUntil: 0,
      danceUntil: 0,
      polymorph: null,
      cooldowns: {},
      stats: saved.stats || { ascended: 0, descended: 0, smited: 0, pulled: 0, recruited: 0 },
      isBot: false,
      tier,
      quest: saved.quest || createRandomQuest(),
      createdAt: saved.createdAt || Date.now()
    };

    players.set(socket.id, player);
    syncPlayerToProfile(player);

    socket.emit('world:init', {
      selfId: socket.id,
      token: player.token,
      resumed: true,
      player,
      players: Array.from(players.values()),
      stats: {
        heavenCount: Array.from(players.values()).filter(p => p.realm === 'heaven').length,
        hellCount: Array.from(players.values()).filter(p => p.realm === 'hell').length,
        total: players.size
      },
      peaches: activePeaches,
      bananas: Array.from(bananaTraps.values()),
      redPackets: Array.from(activeRedPackets.values()),
      floatingItems: Array.from(activeFloatingItems.values()),
      npcManhBa: NPC_MANH_BA,
      npcTienOng: NPC_TIEN_ONG,
      npcs: [NPC_MANH_BA, NPC_TIEN_ONG],
      quest: player.quest,
      controlPoints: {
        peach_tree: CONTROL_POINTS.peach_tree,
        boiling_cauldron: CONTROL_POINTS.boiling_cauldron
      },
      activeTrial: activeTrial ? {
        id: activeTrial.id,
        authorName: activeTrial.authorName,
        text: activeTrial.text,
        endsAt: activeTrial.endsAt,
        forgiveCount: activeTrial.forgiveVotes.size,
        punishCount: activeTrial.punishVotes.size
      } : null
    });

    socket.broadcast.emit('player:joined', player);
    broadcastStats();
    broadcastKillFeed(`⚡ ${player.name} vừa trở lại cõi [${player.tier.title}]!`, '⚡');
    adjustBotsForPlayerCount();
  });

  // 1.2 NGƯỜI CHƠI MỚI THAM GIA PHÒNG
  socket.on('player:join', (data = {}) => {
    try {
    const rawName = (data && data.name) ? String(data.name).trim() : 'Linh Hồn';
    const cleanName = rawName.substring(0, 20) || 'Linh Hồn Vô Danh';
    const initKarma = typeof data.initialKarma === 'number' ? Math.max(-3000, Math.min(3000, data.initialKarma)) : 0;
    const realm = initKarma >= 0 ? 'heaven' : 'hell';
    const tier = getPlayerTier(initKarma);

    // Tạo token vĩnh viễn không cần đăng ký tài khoản (Zero-Friction Token Persistence)
    const token = (data && data.token && typeof data.token === 'string' && data.token.startsWith('usr_'))
      ? data.token
      : 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);

    let spawnX = realm === 'heaven' ? Math.round(20 + Math.random() * 60) : Math.round(20 + Math.random() * 60);
    let spawnY = realm === 'heaven' ? Math.round(20 + Math.random() * 20) : Math.round(60 + Math.random() * 20);

    const player = {
      id: socket.id,
      token,
      name: cleanName,
      karma: initKarma,
      realm,
      x: spawnX,
      y: spawnY,
      lastActionAt: 0,
      lastPullAt: 0,
      lastLanternAt: 0,
      lastConfessAt: 0,
      lastSoupAt: 0,
      lastAmnestyAt: 0,
      lastChainAt: 0,
      lastWoodenFishAt: 0,
      fishCombo: 1,
      drunkUntil: 0,
      speedBoostUntil: 0,
      shieldUntil: 0,
      politeUntil: 0,
      reverseMoveUntil: 0,
      danceUntil: 0,
      polymorph: null,
      cooldowns: {}, // { skillName: timestamp }
      stats: { ascended: 0, descended: 0, smited: 0, pulled: 0, recruited: 0 },
      isBot: false,
      tier,
      quest: createRandomQuest(),
      createdAt: Date.now()
    };

    // Xử lý Lan Truyền (Viral Loop): Triệu hồi qua Link ?ref=
    const refToken = data && typeof data.refToken === 'string' ? data.refToken.trim() : null;
    if (refToken && refToken !== token) {
      // 1. Tìm người mời đang online
      let inviter = null;
      for (const p of players.values()) {
        if (!p.isBot && p.token === refToken) {
          inviter = p;
          break;
        }
      }

      if (inviter) {
        // Thưởng nóng 30 Karma cho người mời
        updateKarma(inviter, 30, `Triệu hồi tri kỷ [${player.name}] gia nhập cõi (+30 Karma)`);
        inviter.stats.recruited = (inviter.stats.recruited || 0) + 1;
        const inviterSocket = getSocketById(inviter.id);
        if (inviterSocket) {
          inviterSocket.emit('system:toast', {
            message: `🎉 Bạn vừa triệu hồi thành công [${player.name}], được thưởng nóng +30 Karma!`
          });
        }

        // Spawn người mới ngay cạnh người mời để cùng quậy
        player.realm = inviter.realm;
        player.x = Math.max(10, Math.min(90, Math.round(inviter.x + (Math.random() > 0.5 ? 5 : -5))));
        if (inviter.realm === 'heaven') {
          player.y = Math.max(16, Math.min(40, Math.round(inviter.y + (Math.random() > 0.5 ? 3 : -3))));
          if (player.karma < 0) player.karma = 20;
        } else {
          player.y = Math.max(60, Math.min(84, Math.round(inviter.y + (Math.random() > 0.5 ? 3 : -3))));
          if (player.karma >= 0) player.karma = -20;
        }
        player.tier = getPlayerTier(player.karma);

        broadcastKillFeed(`🤝 ${inviter.name} đã triệu hồi tri kỷ ${player.name} cùng gia nhập cõi [${player.tier.title}]!`, '🤝');
      } else if (savedProfiles.has(refToken)) {
        // Người mời đang offline: cộng điểm vào file profile lưu trữ
        const inviterProfile = savedProfiles.get(refToken);
        inviterProfile.karma += 30;
        if (!inviterProfile.stats) inviterProfile.stats = { ascended: 0, descended: 0, smited: 0, pulled: 0, recruited: 0 };
        inviterProfile.stats.recruited = (inviterProfile.stats.recruited || 0) + 1;
        savedProfiles.set(refToken, inviterProfile);
        saveDatabase();
      }
    }

    players.set(socket.id, player);
    syncPlayerToProfile(player);

    // Gửi thông tin thế giới hiện tại cho người chơi mới
    socket.emit('world:init', {
      selfId: socket.id,
      token: player.token,
      players: Array.from(players.values()),
      stats: {
        heavenCount: Array.from(players.values()).filter(p => p.realm === 'heaven').length,
        hellCount: Array.from(players.values()).filter(p => p.realm === 'hell').length,
        total: players.size
      },
      peaches: activePeaches,
      bananas: Array.from(bananaTraps.values()),
      redPackets: Array.from(activeRedPackets.values()),
      floatingItems: Array.from(activeFloatingItems.values()),
      npcManhBa: NPC_MANH_BA,
      npcTienOng: NPC_TIEN_ONG,
      npcs: [NPC_MANH_BA, NPC_TIEN_ONG],
      quest: player.quest,
      controlPoints: {
        peach_tree: CONTROL_POINTS.peach_tree,
        boiling_cauldron: CONTROL_POINTS.boiling_cauldron
      },
      activeTrial: activeTrial ? {
        id: activeTrial.id,
        authorName: activeTrial.authorName,
        text: activeTrial.text,
        endsAt: activeTrial.endsAt,
        forgiveCount: activeTrial.forgiveVotes.size,
        punishCount: activeTrial.punishVotes.size
      } : null
    });

    // Báo cho toàn phòng biết có người mới vào
    socket.broadcast.emit('player:joined', player);
    broadcastStats();
    broadcastKillFeed(`${player.name} vừa giáng sinh vào cõi [${player.tier.title}]`, '🌟');

    // Tự động điều chỉnh số lượng bots
    adjustBotsForPlayerCount();
    } catch (err) {
      console.error('[CRITICAL ERROR IN PLAYER:JOIN]:', err);
    }
  });

  // 2. DI CHUYỂN NHÂN VẬT (BẢO VỆ RANH GIỚI CÕI & HIỆU ỨNG TROLL)
  socket.on('player:move', (data) => {
    const player = players.get(socket.id);
    if (!player) return;

    // Nếu đang bị nhảy Zombie do Nhật Thực hoặc Confetti Dance: không thể tự di chuyển
    if (player.danceUntil && Date.now() < player.danceUntil) {
      socket.emit('system:toast', { message: 'Bạn đang bị điều khiển nhảy múa! Không thể di chuyển!' });
      return;
    }

    // Nếu đang tắm vạc dầu mà di chuyển -> Hủy tắm vạc!
    if (boilingPlayers.has(socket.id)) {
      clearTimeout(boilingPlayers.get(socket.id).timer);
      boilingPlayers.delete(socket.id);
      io.emit('landmark:boil_cancel', { playerId: socket.id });
      socket.emit('system:toast', { message: 'Bạn đã rời vạc dầu! Nghiệp chưa kịp rửa!' });
    }

    let clickX = Number(data.x);
    let clickY = Number(data.y);

    // Hiệu ứng Bùa Đi Ngược Lú Lẫn (D4)
    if (player.reverseMoveUntil && Date.now() < player.reverseMoveUntil) {
      clickX = 2 * player.x - clickX;
      clickY = 2 * player.y - clickY;
    }

    // Hiệu ứng say xỉn Canh Mạnh Bà
    if (player.drunkUntil && Date.now() < player.drunkUntil) {
      clickX += (Math.random() - 0.5) * 15;
      clickY += (Math.random() - 0.5) * 10;
    }

    // Giới hạn tọa độ theo cõi để không ai vượt Cầu Nại Hà trái phép
    const targetX = Math.max(8, Math.min(92, clickX));
    let targetY = clickY;

    if (player.realm === 'heaven') {
      targetY = Math.max(12, Math.min(44, clickY));
    } else {
      targetY = Math.max(56, Math.min(88, clickY));
    }

    player.x = Math.round(targetX);
    player.y = Math.round(targetY);

    io.emit('player:moved', { id: socket.id, x: player.x, y: player.y });

    // Kiểm tra dẫm phải bẫy chuối
    checkTrapsOnMove(player);
  });

  // 3. HÀNH ĐỘNG CƠ BẢN THEO CÕI
  socket.on('player:action', (data) => {
    const player = players.get(socket.id);
    if (!player) return;

    const now = Date.now();
    const type = data.type;

    // 3.1. TỌA THIỀN (+3 Karma, Buff x2 nếu chiếm đài)
    if (type === 'meditate') {
      if (player.realm !== 'heaven') {
        socket.emit('system:toast', { message: 'Chỉ người ở Thiên Đàng mới được Tọa Thiền!' });
        return;
      }
      if (now - player.lastActionAt < 700) return; // Chống spam 700ms
      player.lastActionAt = now;

      const multiplier = getKarmaMultiplier(player);
      const karmaGain = 3 * multiplier;
      updateKarma(player, karmaGain, multiplier > 1 ? 'Tọa thiền thanh tịnh (Buff x2 Tranh Chấp)' : 'Tọa thiền thanh tịnh');
      updateQuestProgress(player, 'farm');

      io.emit('world:effect', {
        type: 'meditate',
        sourceId: socket.id,
        x: player.x,
        y: player.y,
        karmaDelta: karmaGain,
        isBuffed: multiplier > 1
      });
      return;
    }

    // 3.2. THẢ HOA ĐĂNG (+5 hoặc +8 Karma nếu có perk)
    if (type === 'lantern') {
      if (player.realm !== 'heaven') {
        socket.emit('system:toast', { message: 'Chỉ người ở Thiên Đàng mới được Thả Hoa Đăng!' });
        return;
      }
      if (now - player.lastLanternAt < 20000) {
        const waitSec = Math.ceil((20000 - (now - player.lastLanternAt)) / 1000);
        socket.emit('system:toast', { message: `Vui lòng chờ ${waitSec}s nữa mới được thả hoa đăng tiếp!` });
        return;
      }

      const rawText = String(data.text || '').trim();
      if (rawText.length < 8) {
        socket.emit('system:toast', { message: 'Lời chúc hoa đăng phải từ 8 ký tự trở lên!' });
        return;
      }

      player.lastLanternAt = now;
      const isGolden = player.tier.perks.includes('golden_lantern');
      const karmaGain = isGolden ? 8 : 5;
      updateKarma(player, karmaGain, 'Thả hoa đăng cầu phước');
      updateQuestProgress(player, 'confess_lantern');

      const itemId = 'lantern_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
      const itemData = {
        id: itemId,
        itemId,
        type: 'lantern',
        authorId: socket.id,
        authorName: player.name,
        playerName: player.name,
        text: rawText,
        isGolden,
        likes: 0,
        likedBy: new Set(),
        y: player.y,
        createdAt: now
      };
      activeFloatingItems.set(itemId, itemData);
      setTimeout(() => activeFloatingItems.delete(itemId), 15000);

      io.emit('world:effect', {
        type: 'lantern',
        itemId,
        sourceId: socket.id,
        playerName: player.name,
        text: rawText,
        isGolden,
        y: player.y,
        karmaDelta: karmaGain
      });
      broadcastKillFeed(`🏮 ${player.name} vừa thả Hoa Đăng ${isGolden ? 'Hoàng Kim (+8)' : '(+5)'}: "${rawText}"`, '🏮');
      return;
    }

    // 3.3. GÕ MÕ SÁM HỐI (+4 Karma, Nhịp điệu Combo Fever)
    if (type === 'wooden_fish') {
      if (player.realm !== 'hell') {
        socket.emit('system:toast', { message: 'Chỉ người ở Địa Ngục mới được Gõ Mõ!' });
        return;
      }

      const deltaMs = now - player.lastWoodenFishAt;
      if (deltaMs < 500) return; // Chống spam quá nhanh

      if (deltaMs >= 750 && deltaMs <= 1500) {
        player.fishCombo = Math.min(15, (player.fishCombo || 1) + 1);
      } else {
        player.fishCombo = 1;
      }
      player.lastWoodenFishAt = now;

      let multiplier = 1;
      let comboTier = 1;
      if (player.fishCombo >= 10) {
        multiplier = 3;
        comboTier = 3; // FEVER
      } else if (player.fishCombo >= 5) {
        multiplier = 2;
        comboTier = 2;
      }

      const cpMultiplier = getKarmaMultiplier(player);
      const karmaGain = 4 * multiplier * cpMultiplier;
      updateKarma(player, karmaGain, cpMultiplier > 1 ? `Gõ mõ sám hối (Combo x${player.fishCombo}, Buff x2 Tranh Chấp)` : `Gõ mõ sám hối (Combo x${player.fishCombo})`);
      updateQuestProgress(player, 'farm');

      io.emit('world:effect', {
        type: 'wooden_fish',
        sourceId: socket.id,
        x: player.x,
        y: player.y,
        combo: player.fishCombo,
        comboTier,
        karmaDelta: karmaGain,
        isBuffed: cpMultiplier > 1
      });
      return;
    }

    // 3.4. VIẾT SỚ HỐI LỖI (+10 Karma)
    if (type === 'confess') {
      if (player.realm !== 'hell') {
        socket.emit('system:toast', { message: 'Chỉ người ở Địa Ngục mới được Viết Sớ Hối Lỗi!' });
        return;
      }
      if (now - player.lastConfessAt < 20000) {
        const waitSec = Math.ceil((20000 - (now - player.lastConfessAt)) / 1000);
        socket.emit('system:toast', { message: `Vui lòng chờ ${waitSec}s nữa mới được dâng sớ tiếp!` });
        return;
      }

      const rawText = String(data.text || '').trim();
      if (rawText.length < 8) {
        socket.emit('system:toast', { message: 'Sớ sám hối phải từ 8 ký tự trở lên!' });
        return;
      }

      player.lastConfessAt = now;
      updateKarma(player, 10, 'Dâng sớ hối lỗi chân thành');
      updateQuestProgress(player, 'confess_lantern');

      const confessId = 'c_' + Date.now();
      confessionPool.push({
        id: confessId,
        authorId: socket.id,
        authorName: player.name,
        text: rawText,
        createdAt: now
      });
      if (confessionPool.length > 30) confessionPool.shift();

      const itemId = 'confess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
      const itemData = {
        id: itemId,
        itemId,
        type: 'confess',
        authorId: socket.id,
        authorName: player.name,
        playerName: player.name,
        text: rawText,
        likes: 0,
        likedBy: new Set(),
        y: player.y,
        createdAt: now
      };
      activeFloatingItems.set(itemId, itemData);
      setTimeout(() => activeFloatingItems.delete(itemId), 15000);

      io.emit('world:effect', {
        type: 'confess',
        itemId,
        sourceId: socket.id,
        playerName: player.name,
        text: rawText,
        y: player.y,
        karmaDelta: 10
      });
      broadcastKillFeed(`📜 ${player.name} vừa dâng Sớ Hối Lỗi (+10): "${rawText}"`, '📜');
      return;
    }

    // 3.5. NÉM SÉT CÀ KHÍA (-15 Karma cho bản thân)
    if (type === 'smite') {
      if (player.realm !== 'heaven') {
        socket.emit('system:toast', { message: 'Chỉ người ở Thiên Đàng mới có quyền năng ném sét!' });
        return;
      }
      if (now - player.lastActionAt < 700) return;
      player.lastActionAt = now;

      let target = null;
      if (data.targetId) {
        target = players.get(data.targetId);
      }

      // Kiểm tra Khiên Phản Nghiệp
      if (target && checkMirrorReflect(player, target, 'Ném Sét Cà Khịa', 15)) {
        return;
      }

      const targetX = target ? target.x : Math.round(20 + Math.random() * 60);
      const targetY = target ? target.y : Math.round(60 + Math.random() * 20);

      updateKarma(player, -15, 'Ném sét cà khịa tạo nghiệp');
      updateQuestProgress(player, 'troll');

      if (target) {
        target.stats.smited++;
        updateKarma(target, -15, `Bị ${player.name} ném sét trừng phạt`, player);
      }

      io.emit('world:effect', {
        type: 'smite',
        sourceId: socket.id,
        targetId: target ? target.id : null,
        targetX,
        targetY
      });
      broadcastKillFeed(`⚡ ${player.name} ném sét cà khịa trừng phạt ${target ? target.name : 'Địa Ngục'} (-15 Karma)!`, '⚡');
      return;
    }

    // 3.6. BAN PHƯỚC (+5 cho mục tiêu Địa Ngục, +2 cho bản thân)
    if (type === 'bless') {
      if (player.realm !== 'heaven') return;
      const target = players.get(data.targetId);
      if (!target || target.realm !== 'hell') return;

      if (now - player.lastActionAt < 1000) return;
      player.lastActionAt = now;

      updateKarma(target, 5, `Được ${player.name} ban phước`, player);
      updateKarma(player, 2, 'Ban phước cho chúng sinh');
      updateQuestProgress(player, 'troll');

      io.emit('world:effect', {
        type: 'bless',
        sourceId: socket.id,
        targetId: target.id,
        targetX: target.x,
        targetY: target.y
      });
      broadcastKillFeed(`✨ ${player.name} đã ban phước cho ${target.name} (+5 Karma)!`, '✨');
      return;
    }

    // 3.7. KÉO GIÒ (-4 hoặc -8 Karma cho mục tiêu Địa Ngục hoặc Thiên Đàng)
    if (type === 'pull_leg') {
      if (player.realm !== 'hell') return;
      const target = players.get(data.targetId);
      if (!target) return; // Cho phép kéo giò cả người cùng cõi lẫn người cõi trên

      if (now - player.lastPullAt < 800) return;
      player.lastPullAt = now;

      // Kiểm tra Khiên Phản Nghiệp
      const isDouble = player.tier.perks.includes('double_pull');
      const penalty = isDouble ? 8 : 4;

      if (checkMirrorReflect(player, target, 'Kéo Giò', penalty)) {
        return;
      }

      // Nếu mục tiêu đang tắm vạc dầu -> Bị gián đoạn!
      if (boilingPlayers.has(target.id)) {
        clearTimeout(boilingPlayers.get(target.id).timer);
        boilingPlayers.delete(target.id);
        io.emit('landmark:boil_cancel', { playerId: target.id });
        broadcastKillFeed(`🦀 ${player.name} đã kéo giò phá bĩnh ${target.name} khi đang tắm vạc dầu!`, '🦀');
      }

      target.stats.pulled++;
      updateKarma(target, -penalty, `Bị ${player.name} kéo giò`, player);
      updateQuestProgress(player, 'troll');

      io.emit('world:effect', {
        type: 'pull_leg',
        sourceId: socket.id,
        targetId: target.id,
        targetX: target.x,
        targetY: target.y,
        penalty
      });
      broadcastKillFeed(`🦀 ${player.name} kéo giò ${target.name} làm tụt -${penalty} Karma!`, '🦀');
      return;
    }

    // 3.8. TỰ TẠO NGHIỆP (-25 Karma, Cơ bản Địa Ngục)
    if (type === 'self_sin') {
      if (player.realm !== 'hell') {
        socket.emit('system:toast', { message: 'Chỉ người ở Địa Ngục mới được Tự Tạo Nghiệp!' });
        return;
      }
      if (now - player.lastActionAt < 3000) {
        socket.emit('system:toast', { message: 'Tạo nghiệp cũng phải từ từ chứ! Chờ 3s nhé!' });
        return;
      }
      player.lastActionAt = now;

      const reason = SELF_SIN_REASONS[Math.floor(Math.random() * SELF_SIN_REASONS.length)];
      updateKarma(player, -25, reason);

      io.emit('world:effect', {
        type: 'self_sin',
        sourceId: socket.id,
        x: player.x,
        y: player.y,
        reason,
        karmaDelta: -25
      });
      broadcastKillFeed(`😈 ${player.name} tự tạo nghiệp: ${reason} (-25 Karma)!`, '😈');
      return;
    }

    // 3.9. TỤNG KINH GẤP ĐÔI (+1 Karma, farm nhanh 1.5s - Thiên Đàng, Buff x2 nếu chiếm đài)
    if (type === 'fast_chant') {
      if (player.realm !== 'heaven') {
        socket.emit('system:toast', { message: 'Chỉ người ở Thiên Đàng mới được Tụng Kinh Gấp Đôi!' });
        return;
      }
      if (now - (player.lastFastChantAt || 0) < 1500) {
        const left = ((1500 - (now - (player.lastFastChantAt || 0))) / 1000).toFixed(1);
        socket.emit('system:toast', { message: `Đang tĩnh tâm! Chờ ${left}s nữa!` });
        return;
      }
      player.lastFastChantAt = now;

      const multiplier = getKarmaMultiplier(player);
      const karmaGain = 1 * multiplier;
      updateKarma(player, karmaGain, multiplier > 1 ? 'Tụng kinh gấp đôi (Buff x2 Tranh Chấp)' : 'Tụng kinh gấp đôi');
      updateQuestProgress(player, 'farm');

      io.emit('world:effect', {
        type: 'fast_chant',
        sourceId: socket.id,
        x: player.x,
        y: player.y,
        karmaDelta: karmaGain,
        isBuffed: multiplier > 1
      });
      return;
    }

    // 3.10. PHÁ PHÁCH ĐỊA NGỤC (-1 Karma, cày cấp quỷ nhanh 1.5s - Địa Ngục, Buff x2 nếu chiếm đài)
    if (type === 'fast_chaos') {
      if (player.realm !== 'hell') {
        socket.emit('system:toast', { message: 'Chỉ người ở Địa Ngục mới được Phá Phách!' });
        return;
      }
      if (now - (player.lastFastChaosAt || 0) < 1500) {
        const left = ((1500 - (now - (player.lastFastChaosAt || 0))) / 1000).toFixed(1);
        socket.emit('system:toast', { message: `Phá phách cũng cần lấy hơi! Chờ ${left}s nữa!` });
        return;
      }
      player.lastFastChaosAt = now;

      const cpMultiplier = getKarmaMultiplier(player);
      const karmaGain = -3 * cpMultiplier;
      updateKarma(player, karmaGain, cpMultiplier > 1 ? 'Phá phách quấy nhiễu địa ngục (Buff x2 Tranh Chấp)' : 'Phá phách quấy nhiễu địa ngục');
      updateQuestProgress(player, 'farm');

      io.emit('world:effect', {
        type: 'fast_chaos',
        sourceId: socket.id,
        x: player.x,
        y: player.y,
        karmaDelta: karmaGain,
        isBuffed: cpMultiplier > 1
      });
      return;
    }
  });

  // =================================================================
  // 4. BỘ KỸ NĂNG TROLL MỞ KHÓA THEO 14 CẤP TIẾN HÓA
  // =================================================================
  socket.on('player:cast_skill', (data = {}) => {
    const player = players.get(socket.id);
    if (!player) return;

    const skill = data.skill;
    const now = Date.now();
    player.cooldowns = player.cooldowns || {};

    // ---------------------------------------------------------------
    // A. KỸ NĂNG THIÊN ĐÀNG
    // ---------------------------------------------------------------

    // H2: RẮC PHÁO GIẤY (confetti_dance - CD 15s)
    if (skill === 'confetti_dance') {
      if (player.tier.tier < 2 || player.realm !== 'heaven') {
        socket.emit('system:toast', { message: 'Cần đạt cấp [Tiểu Đồng Học Việc] (+50 Karma) để mở khóa!' });
        return;
      }
      if (now - (player.cooldowns.confetti_dance || 0) < 15000) {
        const left = Math.ceil((15000 - (now - player.cooldowns.confetti_dance)) / 1000);
        socket.emit('system:toast', { message: `Kỹ năng đang hồi! Chờ ${left}s nữa!` });
        return;
      }

      const target = players.get(data.targetId);
      if (!target) {
        socket.emit('system:toast', { message: 'Hãy chọn 1 mục tiêu để rắc pháo giấy!' });
        return;
      }

      player.cooldowns.confetti_dance = now;

      // Kiểm tra khiên phản nghiệp
      if (checkMirrorReflect(player, target, 'Rắc Pháo Giấy', 0)) {
        player.danceUntil = now + 3000;
        return;
      }

      target.danceUntil = now + 3000; // Ép nhảy múa 3 giây
      updateKarma(player, 3, 'Rắc pháo giấy chúc mừng');
      updateKarma(target, 3, 'Nhận pháo giấy may mắn');
      updateQuestProgress(player, 'troll');

      io.emit('world:effect', {
        type: 'confetti_dance',
        sourceId: socket.id,
        targetId: target.id,
        targetX: target.x,
        targetY: target.y
      });
      broadcastKillFeed(`✨ ${player.name} bắn pháo hoa giấy khiến ${target.name} nhảy múa lắc lư 3s (+3 Karma cả hai)!`, '✨');
      return;
    }

    // H3: VỎ CHUỐI THÁNH THIỆN (holy_banana - CD 25s)
    if (skill === 'holy_banana') {
      if (player.tier.tier < 3 || player.realm !== 'heaven') {
        socket.emit('system:toast', { message: 'Cần đạt cấp [Thiên Thần Tập Sự] (+150 Karma) để mở khóa!' });
        return;
      }
      if (now - (player.cooldowns.holy_banana || 0) < 25000) {
        const left = Math.ceil((25000 - (now - player.cooldowns.holy_banana)) / 1000);
        socket.emit('system:toast', { message: `Vỏ chuối đang hồi! Chờ ${left}s nữa!` });
        return;
      }

      player.cooldowns.holy_banana = now;
      updateQuestProgress(player, 'troll');
      const bananaId = 'banana_' + now + '_' + Math.random().toString(36).substr(2, 4);

      bananaTraps.set(bananaId, {
        id: bananaId,
        x: player.x,
        y: player.y,
        ownerId: socket.id,
        createdAt: now,
        expiresAt: now + 20000 // Tồn tại 20 giây
      });

      io.emit('banana:spawned', {
        id: bananaId,
        x: player.x,
        y: player.y
      });
      broadcastKillFeed(`🍌 ${player.name} vừa đặt một Vỏ Chuối Thánh Thiện lấp lánh trên đất! Coi chừng té!`, '🍌');
      return;
    }

    // H4: THÁNH QUANG TRỪNG PHẠT & BAN PHƯỚC (holy_purify - CD 20s)
    if (skill === 'holy_purify') {
      if (player.tier.tier < 4 || player.realm !== 'heaven') {
        socket.emit('system:toast', { message: 'Cần đạt cấp [Thiên Thần Hộ Vệ] (+350 Karma) để mở khóa!' });
        return;
      }
      if (now - (player.cooldowns.holy_purify || 0) < 20000) {
        const left = Math.ceil((20000 - (now - player.cooldowns.holy_purify)) / 1000);
        socket.emit('system:toast', { message: `Thánh Quang đang hồi! Chờ ${left}s nữa!` });
        return;
      }

      const target = players.get(data.targetId);
      if (!target) {
        socket.emit('system:toast', { message: 'Hãy chọn 1 mục tiêu để thi triển Thánh Quang!' });
        return;
      }

      player.cooldowns.holy_purify = now;
      updateQuestProgress(player, 'cross');

      // Nếu mục tiêu ở Địa Ngục: Trừng phạt kẻ ác, thanh tẩy lấy 15 Karma
      if (target.realm === 'hell') {
        // Khiên phản nghiệp
        if (checkMirrorReflect(player, target, 'Thánh Quang Trừng Phạt', 15)) {
          return;
        }

        updateKarma(target, -15, `Bị ${player.name} giáng Thánh Quang trừng phạt`, player);
        updateKarma(player, 15, `Thanh tẩy kẻ ác ${target.name}`);

        io.emit('world:effect', {
          type: 'holy_purify',
          sourceId: socket.id,
          targetId: target.id,
          sourceX: player.x,
          sourceY: player.y,
          targetX: target.x,
          targetY: target.y,
          mode: 'punish'
        });
        broadcastKillFeed(`✨ Thiên Thần ${player.name} vừa dùng Thánh Quang trừng phạt hút 15 Karma từ ác quỷ ${target.name}!`, '✨');
        return;
      } else {
        // Nếu mục tiêu ở Thiên Đàng: Ban phước buff 15 Karma cho đồng đội
        updateKarma(target, 15, `Được ${player.name} ban phước Thánh Quang`);
        updateKarma(player, 5, 'Dùng Thánh Quang tiếp sức đồng đội');

        io.emit('world:effect', {
          type: 'holy_purify',
          sourceId: socket.id,
          targetId: target.id,
          sourceX: player.x,
          sourceY: player.y,
          targetX: target.x,
          targetY: target.y,
          mode: 'buff'
        });
        broadcastKillFeed(`✨ Thiên Thần ${player.name} đã dùng Thánh Quang ban phước buff 15 Karma cho đồng đội ${target.name}!`, '✨');
        return;
      }
    }

    // H4 PHỤ: HÓA ẾCH XANH (frog_hex - CD 35s)
    if (skill === 'frog_hex') {
      if (player.tier.tier < 4 || player.realm !== 'heaven') {
        socket.emit('system:toast', { message: 'Cần đạt cấp [Thiên Thần Hộ Vệ] (+350 Karma) để mở khóa!' });
        return;
      }
      if (now - (player.cooldowns.frog_hex || 0) < 35000) {
        const left = Math.ceil((35000 - (now - player.cooldowns.frog_hex)) / 1000);
        socket.emit('system:toast', { message: `Phép Hóa Ếch đang hồi! Chờ ${left}s nữa!` });
        return;
      }

      const target = players.get(data.targetId);
      if (!target) {
        socket.emit('system:toast', { message: 'Hãy chọn 1 mục tiêu để hóa ếch!' });
        return;
      }

      player.cooldowns.frog_hex = now;
      updateQuestProgress(player, 'troll');

      // Khiên phản nghiệp
      if (checkMirrorReflect(player, target, 'Hóa Ếch Xanh', 0)) {
        player.polymorph = { type: 'frog', until: now + 8000 };
        io.emit('player:polymorphed', { id: player.id, type: 'frog', until: player.polymorph.until });
        return;
      }

      target.polymorph = { type: 'frog', until: now + 8000 };
      io.emit('player:polymorphed', { id: target.id, type: 'frog', until: target.polymorph.until });
      broadcastKillFeed(`🐸 ${player.name} niệm phép Winx biến ${target.name} thành Con Ếch Xanh trong 8s!`, '🐸');
      return;
    }

    // H5: KHIÊN PHẢN NGHIỆP (karma_mirror - CD 45s)
    if (skill === 'karma_mirror') {
      if (player.tier.tier < 5 || player.realm !== 'heaven') {
        socket.emit('system:toast', { message: 'Cần đạt cấp [Đại Thiên Sứ 6 Cánh] (+700 Karma) để mở khóa!' });
        return;
      }
      if (now - (player.cooldowns.karma_mirror || 0) < 45000) {
        const left = Math.ceil((45000 - (now - player.cooldowns.karma_mirror)) / 1000);
        socket.emit('system:toast', { message: `Khiên đang hồi! Chờ ${left}s nữa!` });
        return;
      }

      player.cooldowns.karma_mirror = now;
      player.shieldUntil = now + 12000; // Bảo hộ 12 giây

      io.emit('world:effect', {
        type: 'shield_activate',
        playerId: socket.id,
        until: player.shieldUntil
      });
      broadcastKillFeed(`🪞 ${player.name} đã dựng Khiên Phản Nghiệp 12s! Kẻ nào dám troll là gậy ông đập lưng ông!`, '🪞');
      return;
    }

    // H6: BÙA NGOAN NGOÃN (polite_seal - CD 45s)
    if (skill === 'polite_seal') {
      if (player.tier.tier < 6 || player.realm !== 'heaven') {
        socket.emit('system:toast', { message: 'Cần đạt cấp [Thượng Tiên Cưỡi Mây] (+1200 Karma) để mở khóa!' });
        return;
      }
      if (now - (player.cooldowns.polite_seal || 0) < 45000) {
        const left = Math.ceil((45000 - (now - player.cooldowns.polite_seal)) / 1000);
        socket.emit('system:toast', { message: `Bùa Ngoan Ngoãn đang hồi! Chờ ${left}s nữa!` });
        return;
      }

      const target = players.get(data.targetId);
      if (!target) {
        socket.emit('system:toast', { message: 'Hãy chọn 1 mục tiêu để dán bùa ngoan ngoãn!' });
        return;
      }

      player.cooldowns.polite_seal = now;
      updateQuestProgress(player, 'troll');

      // Khiên phản nghiệp
      if (checkMirrorReflect(player, target, 'Bùa Ngoan Ngoãn', 0)) {
        player.politeUntil = now + 12000;
        return;
      }

      target.politeUntil = now + 12000;
      io.emit('world:effect', {
        type: 'polite_seal',
        sourceId: socket.id,
        targetId: target.id,
        until: target.politeUntil
      });
      broadcastKillFeed(`🤫 ${player.name} dán Bùa Ngoan Ngoãn lên miệng ${target.name} trong 12s! Nói gì cũng ngọt ngào!`, '🤫');
      return;
    }

    // H7: MƯA LỘC NGỌC HOÀNG (heaven_rain - CD 90s)
    if (skill === 'heaven_rain') {
      if (player.tier.tier < 7 || player.realm !== 'heaven') {
        socket.emit('system:toast', { message: 'Chỉ [Ngọc Hoàng Đại Đế] (+2000 Karma) mới được kích hoạt Mưa Lộc Trời!' });
        return;
      }
      if (now - (player.cooldowns.heaven_rain || 0) < 90000) {
        const left = Math.ceil((90000 - (now - player.cooldowns.heaven_rain)) / 1000);
        socket.emit('system:toast', { message: `Đại Hồng Ân đang hồi! Chờ ${left}s nữa!` });
        return;
      }

      player.cooldowns.heaven_rain = now;
      updateKarma(player, 10, 'Ban Đại Hồng Ân toàn cõi');

      // Rải 8 bao Lì Xì Tiên (4 Thiên Đàng + 4 Địa Ngục)
      activeRedPackets.clear();
      for (let i = 0; i < 4; i++) {
        const hId = 'packet_h_' + now + '_' + i;
        activeRedPackets.set(hId, {
          id: hId,
          x: Math.round(15 + Math.random() * 70),
          y: Math.round(18 + Math.random() * 22),
          karmaGain: Math.round(15 + Math.random() * 15),
          expiresAt: now + 18000
        });
      }
      for (let i = 0; i < 4; i++) {
        const dId = 'packet_d_' + now + '_' + i;
        activeRedPackets.set(dId, {
          id: dId,
          x: Math.round(15 + Math.random() * 70),
          y: Math.round(60 + Math.random() * 24),
          karmaGain: Math.round(15 + Math.random() * 15),
          expiresAt: now + 18000
        });
      }

      io.emit('heaven:rain_start', {
        packets: Array.from(activeRedPackets.values()),
        casterName: player.name
      });
      broadcastKillFeed(`🌈 NGỌC HOÀNG ĐẠI ĐẾ ${player.name} ban Đại Hồng Ân! Rải 8 bao Lì Xì Tiên khắp tam giới! Mau nhặt!`, '🌈');
      return;
    }

    // ---------------------------------------------------------------
    // B. KỸ NĂNG ĐỊA NGỤC
    // ---------------------------------------------------------------

    // D2: BOM KHÓI ĐỘC (toxic_fart - CD 20s)
    if (skill === 'toxic_fart') {
      if (player.tier.tier < 9 || player.realm !== 'hell') {
        socket.emit('system:toast', { message: 'Cần đạt cấp [Tiểu Quỷ Sừng Nhú] (-50 Karma) để mở khóa!' });
        return;
      }
      if (now - (player.cooldowns.toxic_fart || 0) < 20000) {
        const left = Math.ceil((20000 - (now - player.cooldowns.toxic_fart)) / 1000);
        socket.emit('system:toast', { message: `Bom khói đang nén! Chờ ${left}s nữa!` });
        return;
      }

      player.cooldowns.toxic_fart = now;
      updateQuestProgress(player, 'troll');
      const fartId = 'fart_' + now + '_' + Math.random().toString(36).substr(2, 4);

      toxicFartClouds.set(fartId, {
        id: fartId,
        x: player.x,
        y: player.y,
        ownerId: socket.id,
        expiresAt: now + 10000
      });

      // Tác động lên những người đứng gần trong bán kính 10%
      for (const other of players.values()) {
        if (other.id === socket.id) continue;
        const dist = Math.hypot(other.x - player.x, other.y - player.y);
        if (dist <= 10.0) {
          // Bị dạt nhẹ ra ngoài
          const angle = Math.atan2(other.y - player.y, other.x - player.x);
          other.x = Math.max(8, Math.min(92, other.x + Math.cos(angle) * 8));
          io.emit('player:moved', { id: other.id, x: Math.round(other.x), y: Math.round(other.y) });
          io.emit('player:chatted', {
            id: other.id,
            message: 'Khụ khụ ai xì hơi thối quá vậy trời!! 🤢',
            isPenalty: false
          });
        }
      }

      io.emit('fart:spawned', {
        id: fartId,
        x: player.x,
        y: player.y
      });
      broadcastKillFeed(`💨 ${player.name} xì một đám mây khói độc xanh lè bốc mùi nồng nặc trong 10s!`, '💨');
      return;
    }

    // D3: BÙA HÓA HEO QUAY (pig_hex - CD 30s)
    if (skill === 'pig_hex') {
      if (player.tier.tier < 10 || player.realm !== 'hell') {
        socket.emit('system:toast', { message: 'Cần đạt cấp [Quỷ Dạ Xoa] (-150 Karma) để mở khóa!' });
        return;
      }
      if (now - (player.cooldowns.pig_hex || 0) < 30000) {
        const left = Math.ceil((30000 - (now - player.cooldowns.pig_hex)) / 1000);
        socket.emit('system:toast', { message: `Bùa Hóa Heo đang hồi! Chờ ${left}s nữa!` });
        return;
      }

      const target = players.get(data.targetId);
      if (!target) {
        socket.emit('system:toast', { message: 'Hãy chọn 1 mục tiêu để hóa heo!' });
        return;
      }

      player.cooldowns.pig_hex = now;
      updateQuestProgress(player, 'troll');

      // Khiên phản nghiệp
      if (checkMirrorReflect(player, target, 'Bùa Hóa Heo', 0)) {
        player.polymorph = { type: 'pig', until: now + 8000 };
        io.emit('player:polymorphed', { id: player.id, type: 'pig', until: player.polymorph.until });
        return;
      }

      target.polymorph = { type: 'pig', until: now + 8000 };
      io.emit('player:polymorphed', { id: target.id, type: 'pig', until: target.polymorph.until });
      broadcastKillFeed(`🐷 ${player.name} dán bùa biến ${target.name} thành Chú Heo Hồng lon ton trong 8s!`, '🐷');
      return;
    }

    // D4: BÙA ĐI NGƯỢC LÚ LẪN (reverse_walk - CD 35s)
    if (skill === 'reverse_walk') {
      if (player.tier.tier < 11 || player.realm !== 'hell') {
        socket.emit('system:toast', { message: 'Cần đạt cấp [Ngưu Đầu Hộ Pháp] (-350 Karma) để mở khóa!' });
        return;
      }
      if (now - (player.cooldowns.reverse_walk || 0) < 35000) {
        const left = Math.ceil((35000 - (now - player.cooldowns.reverse_walk)) / 1000);
        socket.emit('system:toast', { message: `Bùa Đi Ngược đang hồi! Chờ ${left}s nữa!` });
        return;
      }

      const target = players.get(data.targetId);
      if (!target) {
        socket.emit('system:toast', { message: 'Hãy chọn 1 mục tiêu để ếm bùa lú lẫn!' });
        return;
      }

      player.cooldowns.reverse_walk = now;
      updateQuestProgress(player, 'troll');

      // Khiên phản nghiệp
      if (checkMirrorReflect(player, target, 'Bùa Đi Ngược Lú Lẫn', 0)) {
        player.reverseMoveUntil = now + 10000;
        return;
      }

      target.reverseMoveUntil = now + 10000; // 10 giây đảo hướng chuột
      io.emit('world:effect', {
        type: 'reverse_walk',
        sourceId: socket.id,
        targetId: target.id,
        until: target.reverseMoveUntil
      });
      broadcastKillFeed(`🙃 ${player.name} ếm Bùa Lú Lẫn lên ${target.name}, click đi đâu là chạy ngược lại đó 10s!`, '🙃');
      return;
    }

    // D5: XÍCH CÂU HỒN (soul_chain - CD 20s, Hút trực tiếp 15 Karma từ Thiên Đàng)
    if (skill === 'soul_chain') {
      if (player.tier.tier < 12 || player.realm !== 'hell') {
        socket.emit('system:toast', { message: 'Cần đạt cấp [Hắc Bạch Vô Thường] (-700 Karma) để mở khóa!' });
        return;
      }
      if (now - (player.cooldowns.soul_chain || 0) < 20000) {
        const left = Math.ceil((20000 - (now - player.cooldowns.soul_chain)) / 1000);
        socket.emit('system:toast', { message: `Xích Câu Hồn đang thu lại! Chờ ${left}s nữa!` });
        return;
      }

      const target = players.get(data.targetId);
      if (!target || target.realm !== 'heaven') {
        socket.emit('system:toast', { message: 'Hãy chọn một mục tiêu ở cõi Thiên Đàng để câu hồn hút điểm!' });
        return;
      }

      player.cooldowns.soul_chain = now;
      updateQuestProgress(player, 'cross');

      // Khiên phản nghiệp
      if (checkMirrorReflect(player, target, 'Xích Câu Hồn', 15)) {
        return;
      }

      // Rút trực tiếp 15 Karma của họ cộng thẳng vào tài khoản của mình
      updateKarma(target, -15, `Bị Hắc Bạch Vô Thường ${player.name} hút 15 Karma`, player);
      updateKarma(player, -15, `Hút 15 Karma từ thiên thần ${target.name}`);

      // Nếu tụt xuống cõi âm -> Kéo văng về cạnh Hắc Bạch Vô Thường
      let pulledDirectly = false;
      if (target.karma < 0) {
        pulledDirectly = true;
        target.x = Math.max(10, Math.min(90, player.x + 4));
        target.y = Math.max(58, Math.min(86, player.y));
        io.emit('player:moved', { id: target.id, x: target.x, y: target.y });
      }

      io.emit('world:effect', {
        type: 'soul_chain',
        sourceId: socket.id,
        targetId: target.id,
        sourceX: player.x,
        sourceY: player.y,
        targetX: target.x,
        targetY: target.y,
        pulledDirectly
      });
      broadcastKillFeed(`⚡ Hắc Bạch Vô Thường ${player.name} vừa hút 15 Karma từ thiên thần ${target.name}!`, '⚡');
      return;
    }

    // D6: HỐ ĐEN HÚT NGHIỆP (black_hole - CD 50s)
    if (skill === 'black_hole') {
      if (player.tier.tier < 13 || player.realm !== 'hell') {
        socket.emit('system:toast', { message: 'Cần đạt cấp [Đại Ác Quỷ Vương] (-1200 Karma) để mở khóa!' });
        return;
      }
      if (now - (player.cooldowns.black_hole || 0) < 50000) {
        const left = Math.ceil((50000 - (now - player.cooldowns.black_hole)) / 1000);
        socket.emit('system:toast', { message: `Hố đen đang tích năng lượng! Chờ ${left}s nữa!` });
        return;
      }

      player.cooldowns.black_hole = now;
      const holeId = 'hole_' + now;
      const holeX = player.x;
      const holeY = player.y;

      io.emit('blackhole:spawned', {
        id: holeId,
        x: holeX,
        y: holeY,
        duration: 5000
      });
      broadcastKillFeed(`🕳️ Đại Ác Quỷ Vương ${player.name} mở Hố Đen Hút Nghiệp xoáy tít trong 5s!`, '🕳️');

      // Hút mỗi giây trong 5 giây
      let tick = 0;
      const intervalId = setInterval(() => {
        tick++;
        for (const other of players.values()) {
          if (other.id === socket.id || other.realm !== 'hell') continue;
          const dist = Math.hypot(other.x - holeX, other.y - holeY);
          if (dist <= 22.0) {
            // Hút vào tâm
            other.x = Math.round(other.x + (holeX - other.x) * 0.4);
            other.y = Math.round(other.y + (holeY - other.y) * 0.4);
            io.emit('player:moved', { id: other.id, x: other.x, y: other.y });

            // Chôm 4 Karma
            updateKarma(other, -4, `Bị Hố Đen của ${player.name} hút nghiệp`);
          }
        }

        if (tick >= 5) {
          clearInterval(intervalId);
          activeBlackHoles.delete(holeId);
        }
      }, 1000);

      activeBlackHoles.set(holeId, {
        id: holeId,
        x: holeX,
        y: holeY,
        ownerId: socket.id,
        expiresAt: now + 5000,
        intervalId
      });
      return;
    }

    // D7: NHẬT THỰC MA GIỚI (demon_eclipse - CD 90s)
    if (skill === 'demon_eclipse') {
      if (player.tier.tier < 14 || player.realm !== 'hell') {
        socket.emit('system:toast', { message: 'Chỉ [Hỗn Thế Ma Tôn] (-2000 Karma) mới được kích hoạt Nhật Thực Ma Giới!' });
        return;
      }
      if (now - (player.cooldowns.demon_eclipse || 0) < 90000) {
        const left = Math.ceil((90000 - (now - player.cooldowns.demon_eclipse)) / 1000);
        socket.emit('system:toast', { message: `Nhật Thực đang hồi! Chờ ${left}s nữa!` });
        return;
      }

      player.cooldowns.demon_eclipse = now;

      // Toàn server bị ép nhảy Zombie trong 8 giây
      for (const p of players.values()) {
        if (p.id !== socket.id) {
          p.danceUntil = now + 8000;
        }
      }

      io.emit('demon:eclipse', {
        casterName: player.name,
        duration: 8000
      });
      broadcastKillFeed(`🌑 HỖN THẾ MA TÔN ${player.name} ĐANG THỐNG TRỊ TAM GIỚI! Toàn server nhảy Zombie 8s!`, '🌑');
      return;
    }
  });

  // NHẶT BAO LÌ XÌ TIÊN (Mưa Lộc Ngọc Hoàng)
  socket.on('landmark:pick_packet', (data = {}) => {
    const player = players.get(socket.id);
    if (!player) return;

    const packet = activeRedPackets.get(data.packetId);
    if (!packet) {
      socket.emit('system:toast', { message: 'Bao lì xì đã có người nhặt mất rồi!' });
      return;
    }

    activeRedPackets.delete(data.packetId);
    updateKarma(player, packet.karmaGain, 'Nhặt Bao Lì Xì Tiên');

    io.emit('packet_picked', {
      packetId: packet.id,
      pickerId: socket.id,
      pickerName: player.name,
      karmaGain: packet.karmaGain
    });
    broadcastKillFeed(`🧧 ${player.name} nhanh tay nhặt được Bao Lì Xì Tiên (+${packet.karmaGain} Karma)!`, '🧧');
  });

  // =================================================================
  // 5. CÔNG TRÌNH VẬT LÝ TRÊN BẢN ĐỒ (LANDMARKS)
  // =================================================================

  // 5.1. QUÁN CANH MẠNH BÀ (x: 22, y: 58)
  socket.on('landmark:drink_soup', () => {
    const player = players.get(socket.id);
    if (!player) return;

    const now = Date.now();
    if (now - player.lastSoupAt < 40000) {
      const waitSec = Math.ceil((40000 - (now - player.lastSoupAt)) / 1000);
      socket.emit('system:toast', { message: `Quán đang nấu mẻ canh mới! Chờ ${waitSec}s nữa nhé!` });
      return;
    }

    player.lastSoupAt = now;
    updateQuestProgress(player, 'soup');
    const roll = Math.random();

    if (roll < 0.5) {
      // 50% Canh Thanh Tâm: +20 Karma
      updateKarma(player, 20, 'Uống Canh Mạnh Bà thanh tâm');
      io.emit('world:effect', {
        type: 'soup_clearmind',
        sourceId: socket.id,
        x: player.x,
        y: player.y,
        karmaDelta: 20
      });
      broadcastKillFeed(`🍵 ${player.name} uống trúng Canh Thanh Tâm, thanh lọc tâm hồn (+20 Karma)!`, '🍵');
    } else if (roll < 0.8) {
      // 30% Canh Quá Đát: Say xỉn 10s
      player.drunkUntil = now + 10000;
      io.emit('world:effect', {
        type: 'soup_drunk',
        sourceId: socket.id,
        x: player.x,
        y: player.y,
        duration: 10
      });
      broadcastKillFeed(`🥴 ${player.name} uống nhầm Canh Mạnh Bà quá đát! Say xỉn đi đứng loạng choạng 10s!`, '🥴');
    } else {
      // 20% Canh Pha Ớt: -15 Karma
      updateKarma(player, -15, 'Canh Mạnh Bà pha nhầm ớt hiểm');
      io.emit('world:effect', {
        type: 'soup_spicy',
        sourceId: socket.id,
        x: player.x,
        y: player.y,
        karmaDelta: -15
      });
      broadcastKillFeed(`🌶️ ${player.name} bị sặc ớt hiểm trong Canh Mạnh Bà, tụt -15 Karma!`, '🌶️');
    }
  });

  // 5.2. VẠC DẦU SÔI (x: 78, y: 74)
  socket.on('landmark:enter_cauldron', () => {
    const player = players.get(socket.id);
    if (!player || player.realm !== 'hell') {
      socket.emit('system:toast', { message: 'Chỉ người ở Địa Ngục mới được nhảy vào Vạc Dầu!' });
      return;
    }

    if (boilingPlayers.has(socket.id)) return;

    // Đưa nhân vật vào tâm vạc dầu
    player.x = 78;
    player.y = 74;
    io.emit('player:moved', { id: socket.id, x: player.x, y: player.y });
    updateQuestProgress(player, 'boil');

    const finishAt = Date.now() + 10000;
    const timer = setTimeout(() => {
      // Tôi luyện Ma Thân (Địa Ngục) hoặc tẩy trần (Thiên Đàng) sau 10 giây
      boilingPlayers.delete(socket.id);
      const cpMultiplier = getKarmaMultiplier(player);
      const isHell = player.realm === 'hell';
      const karmaGain = isHell ? -25 * cpMultiplier : 25 * cpMultiplier;
      updateKarma(player, karmaGain, cpMultiplier > 1
        ? (isHell ? 'Tôi luyện Ma Thân trong Vạc Dầu (Buff x2 Cứ Điểm)' : 'Tắm vạc dầu tẩy trần (Buff x2 Cứ Điểm)')
        : (isHell ? 'Tôi luyện Ma Thân trong Vạc Dầu' : 'Tắm vạc dầu tẩy trần')
      );
      io.emit('landmark:boil_success', { playerId: socket.id, playerName: player.name, karmaGain, isBuffed: cpMultiplier > 1 });
      broadcastKillFeed(`🔥 ${player.name} đã chịu đựng 10s trong Vạc Dầu thành công, tăng cường ${karmaGain > 0 ? '+' : ''}${karmaGain} Karma!`, '🔥');
    }, 10000);

    boilingPlayers.set(socket.id, { finishAt, timer });
    io.emit('landmark:boil_start', { playerId: socket.id, finishAt });
    broadcastKillFeed(`🔥 ${player.name} đã nhảy vào Vạc Dầu Sôi Sùng Sục để tẩy trần! Ai kéo giò kìa!`, '🔥');
  });

  // 5.3. CÂY ĐÀO TIÊN (Hái Đào)
  socket.on('landmark:pick_peach', (data = {}) => {
    const player = players.get(socket.id);
    if (!player || player.realm !== 'heaven') {
      socket.emit('system:toast', { message: 'Chỉ người ở Thiên Đàng mới hái được Đào Tiên!' });
      return;
    }

    const peachIndex = activePeaches.findIndex(p => p.id === data.peachId);
    if (peachIndex === -1) {
      socket.emit('system:toast', { message: 'Quả đào này đã bị người khác hái mất rồi!' });
      return;
    }

    const peach = activePeaches.splice(peachIndex, 1)[0];
    const cpMultiplier = getKarmaMultiplier(player);
    const karmaGain = 15 * cpMultiplier;
    player.speedBoostUntil = Date.now() + 20000;
    updateKarma(player, karmaGain, cpMultiplier > 1 ? 'Hái Đào Tiên Ngàn Năm (Buff x2 Tranh Chấp)' : 'Hái Đào Tiên Ngàn Năm');
    updateQuestProgress(player, 'boil');

    io.emit('landmark:peach_picked', {
      peachId: peach.id,
      pickerId: socket.id,
      pickerName: player.name,
      karmaGain,
      isBuffed: cpMultiplier > 1
    });
    broadcastKillFeed(`🍑 ${player.name} nhanh tay hái được Đào Tiên (+${karmaGain} Karma & Tốc Hành 20s)!`, '🍑');
  });

  // =================================================================
  // 6. THẢ TIM CHO VẬT PHẨM BAY (HOA ĐĂNG & SỚ HỐI LỖI)
  // =================================================================
  socket.on('world:like_item', (data = {}) => {
    const player = players.get(socket.id);
    if (!player) return;

    const item = activeFloatingItems.get(data.itemId);
    if (!item) {
      socket.emit('system:toast', { message: 'Vật phẩm đã bay mất rồi!' });
      return;
    }

    // Không tự like bài mình
    if (item.authorId === socket.id) {
      socket.emit('system:toast', { message: 'Không thể tự thả tim cho chính mình!' });
      return;
    }

    if (item.likedBy.has(socket.id)) {
      socket.emit('system:toast', { message: 'Bạn đã thả tim vật phẩm này rồi!' });
      return;
    }

    item.likedBy.add(socket.id);
    item.likes++;

    // Tặng +3 Karma cho tác giả
    const author = players.get(item.authorId);
    if (author) {
      updateKarma(author, 3, 'Nhận tim đồng cảm từ người khác');
      io.emit('world:effect', {
        type: 'author_liked',
        sourceId: socket.id,
        targetId: author.id,
        targetX: author.x,
        targetY: author.y
      });
    }

    io.emit('world:item_liked', {
      itemId: item.itemId,
      likes: item.likes,
      likerName: player.name
    });
  });

  // =================================================================
  // 7. CHAT BONG BÓNG & BỘ LỌC KHẨU NGHIỆP / BÙA HÓA THÂN
  // =================================================================
  socket.on('player:chat', (rawMessage) => {
    const player = players.get(socket.id);
    if (!player) return;

    const now = Date.now();
    if (now - player.lastActionAt < 500) return; // Chống spam 500ms
    player.lastActionAt = now;

    let text = String(rawMessage || '').trim();
    if (!text) return;

    // Nếu đang bị hóa Ếch (H4)
    if (player.polymorph && player.polymorph.type === 'frog' && now < player.polymorph.until) {
      text = 'Ộp ộp... ai hôn tui giải lời nguyền với ộp ộp! 🐸';
      io.emit('player:chatted', { id: socket.id, message: text, isPenalty: false });
      return;
    }

    // Nếu đang bị hóa Heo (D3)
    if (player.polymorph && player.polymorph.type === 'pig' && now < player.polymorph.until) {
      text = 'Éc éc... cho xin ly trà sữa full topping éc éc! 🐷';
      io.emit('player:chatted', { id: socket.id, message: text, isPenalty: false });
      return;
    }

    // Nếu đang bị dán Bùa Ngoan Ngoãn (H6)
    if (player.politeUntil && now < player.politeUntil) {
      text = POLITE_MESSAGES[Math.floor(Math.random() * POLITE_MESSAGES.length)];
      io.emit('player:chatted', { id: socket.id, message: text, isPenalty: false });
      return;
    }

    // Kiểm tra chửi thề / khẩu nghiệp
    if (PROFANITY_REGEX.test(text)) {
      updateKarma(player, -20, 'Khẩu nghiệp tục tĩu');
      const penaltyText = '⚠️ Khẩu nghiệp bị giáng phạt (-20 Karma)!';
      io.emit('player:chatted', { id: socket.id, message: penaltyText, isPenalty: true });
      broadcastKillFeed(`⚡ ${player.name} khẩu nghiệp xúc phạm tam giới, bị Thiên Lôi giáng phạt -20 Karma!`, '⚡');
      return;
    }

    // Chat bình thường
    const cleanText = text.substring(0, 70);
    io.emit('player:chatted', { id: socket.id, message: cleanText, isPenalty: false });
  });

  // =================================================================
  // 8. BỎ PHIẾU ĐÀI PHÁN XÉT
  // =================================================================
  socket.on('trial:vote', (data) => {
    if (!activeTrial) {
      socket.emit('system:toast', { message: 'Hiện không có phiên xử nào!' });
      return;
    }

    const vote = data ? data.vote : null;
    activeTrial.forgiveVotes.delete(socket.id);
    activeTrial.punishVotes.delete(socket.id);

    if (vote === 'forgive') {
      activeTrial.forgiveVotes.add(socket.id);
    } else if (vote === 'punish') {
      activeTrial.punishVotes.add(socket.id);
    }

    io.emit('trial:update', {
      forgiveCount: activeTrial.forgiveVotes.size,
      punishCount: activeTrial.punishVotes.size
    });
  });

  // =================================================================
  // 9. BẢNG PHONG THẦN (LEADERBOARD)
  // =================================================================
  socket.on('world:get_leaderboard', () => {
    const all = Array.from(players.values());
    const saints = all
      .filter(p => p.karma > 0)
      .sort((a, b) => b.karma - a.karma)
      .slice(0, 5)
      .map(p => ({ name: p.name, karma: p.karma, tier: p.tier.title }));

    const sinners = all
      .filter(p => p.karma < 0)
      .sort((a, b) => a.karma - b.karma)
      .slice(0, 5)
      .map(p => ({ name: p.name, karma: p.karma, tier: p.tier.title }));

    socket.emit('world:leaderboard', { saints, sinners });
  });

  // =================================================================
  // 10. DEV SHORTCUT: PHÍM TẮT TEST NHANH TRÊN LOCALHOST
  // =================================================================
  socket.on('dev:set_karma', (data = {}) => {
    const host = socket.handshake?.headers?.host || '';
    const addr = socket.handshake?.address || '';
    const isLocal = !host || host.includes('localhost') || host.includes('127.0.0.1') || addr.includes('127.0.0.1') || addr.includes('::1') || addr.includes('127.0.0.1');

    if (!isLocal) {
      socket.emit('system:toast', { message: 'Phím tắt Dev chỉ được bật trên localhost!' });
      return;
    }

    const player = players.get(socket.id);
    if (!player) return;

    if (data.resetCooldowns) {
      player.lastActionAt = 0;
      player.lastPullAt = 0;
      player.lastLanternAt = 0;
      player.lastConfessAt = 0;
      player.lastSoupAt = 0;
      player.lastAmnestyAt = 0;
      player.lastChainAt = 0;
      player.lastWoodenFishAt = 0;
      player.lastFastChantAt = 0;
      player.lastFastChaosAt = 0;
      player.cooldowns = {};
    }

    if (data.newQuest) {
      player.quest = createRandomQuest();
    }

    if (data.completeQuest && player.quest) {
      player.quest.current = player.quest.target;
      player.quest.isCompleted = true;
    }

    if (data.resetControlPoints) {
      CONTROL_POINTS.peach_tree.controlledBy = 'neutral';
      CONTROL_POINTS.peach_tree.progress = 0;
      CONTROL_POINTS.boiling_cauldron.controlledBy = 'neutral';
      CONTROL_POINTS.boiling_cauldron.progress = 0;
    }

    if (data.exactKarma !== undefined) {
      const diff = Number(data.exactKarma) - player.karma;
      updateKarma(player, diff, 'Dev fast-test set exact karma');
    } else {
      const delta = Number(data.delta) || 0;
      updateKarma(player, delta, 'Dev fast-test shortcut');
    }
    socket.emit('system:toast', {
      message: `[DEV] Karma: ${player.karma} [${player.tier.title}]`
    });
  });

  // =================================================================
  // 11. NHIỆM VỤ ẨN TAM GIỚI: BÀ LÃO MẠNH BÀ & NAM CỰC TIÊN ÔNG
  // =================================================================
  socket.on('quest:get', (data = {}) => {
    const player = players.get(socket.id);
    if (!player) return;
    const requestedNpcId = data.npcId;
    let npc = player.realm === 'heaven' ? NPC_TIEN_ONG : NPC_MANH_BA;
    if (requestedNpcId === 'npc_tien_ong') npc = NPC_TIEN_ONG;
    if (requestedNpcId === 'npc_manh_ba') npc = NPC_MANH_BA;

    socket.emit('quest:data', {
      quest: player.quest,
      npc,
      npcManhBa: NPC_MANH_BA,
      npcTienOng: NPC_TIEN_ONG
    });
  });

  socket.on('quest:reroll', () => {
    const player = players.get(socket.id);
    if (!player) return;
    const now = Date.now();
    if (player.lastQuestRerollAt && (now - player.lastQuestRerollAt < 15000)) {
      const remaining = Math.ceil((15000 - (now - player.lastQuestRerollAt)) / 1000);
      socket.emit('system:toast', { message: `Vui lòng chờ ${remaining}s nữa để đổi nhiệm vụ khác!` });
      return;
    }
    player.lastQuestRerollAt = now;
    const oldId = player.quest ? player.quest.id : null;
    player.quest = createRandomQuest(oldId);
    socket.emit('quest:updated', { quest: player.quest, completedNow: false });
    socket.emit('system:toast', { message: `Đã đổi sang nhiệm vụ mới: [${player.quest.title}]!` });
  });

  socket.on('quest:claim', (data = {}) => {
    const player = players.get(socket.id);
    if (!player) return;

    if (!player.quest) {
      player.quest = createRandomQuest();
      socket.emit('quest:data', { quest: player.quest, npc: player.realm === 'heaven' ? NPC_TIEN_ONG : NPC_MANH_BA });
      return;
    }

    if (!player.quest.isCompleted) {
      socket.emit('system:toast', { message: 'Nhiệm vụ chưa hoàn thành! Mau đi hoàn thành tiếp đi!' });
      return;
    }

    if (player.quest.isClaimed) {
      socket.emit('system:toast', { message: 'Phần thưởng này đã nhận rồi!' });
      return;
    }

    player.quest.isClaimed = true;
    const baseReward = player.quest.reward;

    // Hỗ trợ 2 nhánh rõ ràng:
    // 'demonic' (Ma Đạo): Trừ điểm âm (-50..-90) để cày Ma Tôn / Vô Thường
    // 'righteous' (Chính Đạo): Cộng điểm dương (+50..+90) để thăng Tiên
    let isDemonic = false;
    if (data && data.path === 'demonic') {
      isDemonic = true;
    } else if (data && data.path === 'righteous') {
      isDemonic = false;
    } else {
      isDemonic = player.realm === 'hell';
    }

    const actualDelta = isDemonic ? -baseReward : baseReward;
    const completedTitle = player.quest.title;
    const giverName = player.realm === 'heaven' ? 'Nam Cực Tiên Ông' : 'Bà Lão Mạnh Bà';

    // Phân định phần thưởng chuẩn 2 nhánh
    updateKarma(player, actualDelta, `Hoàn thành nhiệm vụ [${completedTitle}] (${isDemonic ? 'Nhánh Ma Đạo' : 'Nhánh Chính Đạo'}) từ ${giverName}`);

    // Hiệu ứng pháo hoa chúc mừng
    io.emit('world:effect', {
      type: 'quest_complete',
      sourceId: socket.id,
      x: player.x,
      y: player.y,
      rewardKarma: actualDelta
    });

    const rewardLabel = isDemonic
      ? `-${baseReward} Ma Lực để tôi luyện ma thân`
      : `+${baseReward} Công Đức để thăng thiên`;
    broadcastKillFeed(`🎉 ${player.name} vừa hoàn thành nhiệm vụ [${completedTitle}], nhận ${rewardLabel} từ ${giverName}!`, '🎁');

    // Tự động cấp nhiệm vụ mới ngẫu nhiên
    const newQuest = createRandomQuest();
    player.quest = newQuest;

    socket.emit('quest:claimed', {
      reward: actualDelta,
      baseReward,
      isHell: isDemonic,
      path: isDemonic ? 'demonic' : 'righteous',
      title: completedTitle,
      newQuest
    });
  });

  // =================================================================
  // 12. NGẮT KẾT NỐI
  // =================================================================
  socket.on('disconnect', () => {
    // Giảm bộ đếm kết nối IP
    const count = ipConnections.get(clientIp) || 1;
    if (count <= 1) {
      ipConnections.delete(clientIp);
    } else {
      ipConnections.set(clientIp, count - 1);
    }

    if (boilingPlayers.has(socket.id)) {
      clearTimeout(boilingPlayers.get(socket.id).timer);
      boilingPlayers.delete(socket.id);
    }

    const player = players.get(socket.id);
    if (player) {
      // Lưu trữ trạng thái nhân vật vĩnh viễn (Zero-Friction Persistence)
      syncPlayerToProfile(player);
      players.delete(socket.id);
      socket.broadcast.emit('player:left', { id: socket.id });
      broadcastStats();
      // Tự động điều chỉnh lại số lượng bots
      adjustBotsForPlayerCount();
    }
  });
});

// Khởi động server
server.listen(PORT, () => {
  console.log(`[Thiên Đàng & Địa Ngục Online] Server đang chạy tại http://localhost:${PORT}`);
});
