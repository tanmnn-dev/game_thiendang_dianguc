# Thiên Đàng & Địa Ngục Online (Heaven & Hell Online)

Web game multiplayer thời gian thực chủ đề luật hoa quả, nghiệp báo và cân bằng tam giới, phát triển theo chuẩn AIaC và triết lý Ponytail tối giản, hiệu năng cao, zero-dependency ngoài (Web Audio procedural synthesis, self-contained socket protocol, zero game-engine overhead).

---

## 🌟 Tính Năng Nổi Bật (Phiên Bản v1.6.0 — Faction War & Tug-of-War Recruitment)

### 1. Đại Chiến Phe Phái & Kéo Người Về Phe Mình (Faction War & Tug-of-War Recruitment)
- **Cơ Chế Chiêu Mộ / Cảm Hóa Liên Cõi Qua Cầu Nại Hà**:
  - **Phe Địa Ngục**: Dùng Xích Câu Hồn (`soul_chain`), Kéo Giò (`pull_leg`) hoặc Bom Khói / Bùa Chú để kéo Karma của đối thủ Thiên Đàng tụt xuống dưới 0 (`< 0`), lôi họ rớt đài văng qua Cầu Nại Hà xuống cõi âm thành đồng bọn ác quỷ.
  - **Phe Thiên Đàng**: Dùng Thánh Quang (`holy_purify`), Ban Phước Cảm Hóa (`bless`) để thanh tẩy ác ma, nâng Karma của đối thủ Địa Ngục vượt lên `>= 0`, cảm hóa họ thăng thiên qua Cầu Nại Hà lên cõi trời thành thiên sứ.
- **Hệ Thống Thưởng Chiến Công & Phát Sóng Realtime Toàn Server (`world:recruited`)**:
  - Khi chiêu mộ thành công một thành viên đổi phe: Người chiêu mộ nhận đại thưởng **+20 Công Đức** (cho Thiên Đàng) hoặc **-20 Ma Lực** (cho Địa Ngục).
  - Tăng bộ đếm chiến công `stats.recruited++`, lưu trữ trong RAM session và hiển thị trực tiếp trong Gương Chiếu Nghiệp.
  - Phát thanh Kill-feed nổi bật toàn server (`world:killfeed`) và kích hoạt âm thanh chiến công `playEvolutionUp` hoặc `playThunder`.

### 2. Dàn 14 Ambient Bots & Hệ Thống FSM Tác Chiến Tự Động
- **14 Bots Chia Đều 2 Phe Đại Diện Trọn Vẹn 14 Bậc Hình Thái**:
  - **7 Bots Thiên Đàng**: Hùng Hay Hứa (H1), Thảo Thánh Thiện (H2), Minh Mộng Mơ (H3), An An Nhiên (H4), Linh Lương Thiện (H5), Trí Thượng Tiên (H6), Đại Đế Giáng Trần (H7).
  - **7 Bots Địa Ngục**: Tuấn Trùm Bom Hàng (D1), Lan Lươn Lẹo (D2), Huy Hắc Ám (D3), Đạt Đổ Thừa (D4), Quang Quỵt Nợ (D5), My Mượn Tiền (D6), Bảo Bạo Chúa (D7).
- **Hệ Thống FSM Cơ Động & Chiến Thuật Thông Minh**:
  - 40% di chuyển tranh chấp cứ điểm Buff x2 (Cây Đào Tiên & Vạc Dầu Sôi).
  - 25% tuần tra ranh giới Cầu Nại Hà để chiêu mộ và kéo đối phương đổi cõi.
  - 35% tản bộ tự do.
  - Tự động tung chiêu theo cấp bậc (Xích Câu Hồn, Bùa Đi Ngược, Bùa Hóa Heo, Bom Khói, Thánh Quang, Hóa Ếch, Pháo Giấy).
  - Tự động đổi phe khi bị đối phương cảm hóa hoặc lôi kéo đổi cõi.

### 3. Cân Bằng Thông Số Tính Điểm Cõi Địa Ngục (Hell Farm Balancing)
- **Tích Lũy Ma Lực Nhanh Chóng**:
  - Phá Phách Địa Ngục: `-3 Karma` (-6 khi có Buff x2 Cứ Điểm).
  - Tắm Vạc Dầu Sôi: `-25 Karma` (-50 khi có Buff x2 Cứ Điểm) để tôi luyện ma thân.
  - Nhận Thưởng Nhiệm Vụ Ẩn: `-40..-60 Karma` khi ở cõi Địa Ngục.

### 4. Menu Tỏa Tròn Tương Tác Kỹ Năng Trực Tiếp (Radial Context Menu)
- Click vào bất kỳ người chơi hoặc bot nào trên bản đồ để mở menu tỏa tròn thi triển kỹ năng trực tiếp:
  - 🦀 Kéo Rớt Cõi (-8 Karma) / Kéo Giò (-8 Karma).
  - 🕊️ Cảm Hóa (+8 Karma) / Ban Phước.
  - ✨ Thánh Quang Trừng Phạt (-15 Karma) / Ban Phước (+15 Karma).
  - 🐷 Bùa Hóa Heo Hồng (`pig_hex`), 🐸 Bùa Hóa Ếch Xanh (`frog_hex`), 🙃 Bùa Đi Ngược (`reverse_walk`), 🎉 Rắc Pháo Giấy (`confetti_dance`), ⛓️ Xích Hút Hồn (`soul_chain`).

---

## 🌟 Tính Năng Nổi Bật (Phiên Bản v1.5.0 — Quest System & Control Points x2 Farm Speed)

### 1. Hệ Thống NPC Giao Nhiệm Vụ Ẩn (Quest System)
- **Bà Lão Mạnh Bà (`👵🍵`) — Trấn Giữ Quán Canh Tam Giới**:
  - Tọa lạc tại tọa độ `x: 22, y: 58` với hoạt ảnh nhún nhảy `npcBobbing` và bong bóng hội thoại `questGlow` nhấp nháy phát sáng trên đầu.
  - Tương tác mở hộp thoại bằng cách click trực tiếp vào NPC trên bản đồ hoặc bấm nút **"📜 Nhiệm Vụ"** trên thanh Header.
- **Hộp Thoại Nhiệm Vụ Dân Dã & Hài Hước**:
  - Giao diện trà quán cổ trang, hiển thị avatar Mạnh Bà, câu thoại độc quyền dí dỏm, thanh tiến trình `current / target` và đại hồng ân.
- **Bộ 6 Mẫu Nhiệm Vụ Luân Phiên Tự Động**:
  - `q_troll`: Cấu Véo & Chọc Ghẹo (Troll hoặc kéo giò/ném sét 3 lần, thưởng +50 Karma).
  - `q_farm`: Siêng Năng Cày Cuốc (Tụng kinh hoặc gõ mõ 8 lần, thưởng +45 Karma).
  - `q_soup`: Thưởng Trà Ranh Giới (Uống cạn 1 bát Canh Mạnh Bà quên sự đời, thưởng +40 Karma).
  - `q_boil`: Tắm Vạc Dầu Hoặc Hái Đào Tiên (Nhảy vạc dầu hoặc hái đào tiên 1 lần, thưởng +55 Karma).
  - `q_cross`: Tương Tác Chéo Cõi (Dùng Thánh Quang H4+ hoặc Xích Câu Hồn D5+ 2 lần, thưởng +60 Karma).
  - `q_confess_lantern`: Tâm Hồn Lương Thiện (Dâng 1 sớ hối lỗi hoặc thả 1 hoa đăng, thưởng +45 Karma).
- **Cơ Chế Nhận Thưởng Chuẩn 2 Cõi & Chống Gian Lận (Server-Side RAM Session)**:
  - **Thiên Đàng**: Thưởng Công Đức `+40..+60 Karma` để thăng thiên H2..H7.
  - **Địa Ngục**: Thưởng Ma Lực `-40..-60 Karma` để tích lũy oán khí, thăng cấp quỷ dữ D2..D7 và mở khóa kỹ năng troll.
  - Tiến trình theo dõi 100% trong RAM server (`player.quest`), tự động phát hiện hành động người chơi.
  - Nút **"🎁 Nhận Thưởng"** kích hoạt khi hoàn thành (`isCompleted === true`), cộng trực tiếp đại thưởng Karma theo đúng cõi, kích hoạt pháo hoa chúc mừng (`quest_complete`), phát âm thanh `playQuestComplete()` và tự động sinh nhiệm vụ mới.

- **Cân Bằng Tốc Độ Cày Nghiệp Cõi Địa Ngục (Hell Farm Balancing)**:
  - Nâng cấp **"🔥 Phá Phách Địa Ngục"** lên `-3 Karma` (nhân đôi thành `-6 Karma` khi có Buff x2 Cứ Điểm), cày điểm âm siêu tốc.
  - **Tôi Luyện Ma Thân (Vạc Dầu Sôi)**: Tắm vạc dầu 10s nhận `-25 Karma` (nhân đôi thành `-50 Karma` khi có Buff x2 Cứ Điểm).
  - Phân định rõ 2 hướng: Tu Ma Đạo (farm điểm âm thăng cấp quỷ) và Hoàn Lương (gõ mõ sám hối về Thiên Đàng).

### 2. Khu Vực Tranh Chấp (Control Points) — Buff Nhân Đôi Tốc Độ Farm (x2 Karma Buff)
- **2 Cứ Điểm Chiến Lược**:
  - 🍑 **Cây Đào Tiên** (Thiên Đàng, `x: 78, y: 24`, bán kính ảnh hưởng 14%).
  - 🔥 **Vạc Dầu Sôi** (Địa Ngục, `x: 78, y: 72`, bán kính ảnh hưởng 14%).
- **Vòng Lặp Kéo Co Theo Thời Gian Thực (Proximity Capture Loop 2s)**:
  - Server tự động tính khoảng cách Euclid `Math.hypot(p.x - cp.x, p.y - cp.y) <= cp.radius` mỗi 2000ms.
  - Tiến trình chiếm đóng kéo co từ -100% (Địa Ngục) đến +100% (Thiên Đàng) theo chênh lệch quân số có mặt `Math.min(50, (heavenCount - hellCount) * 25)`.
  - Phát thông báo Kill-feed toàn server và âm thanh kèn lệnh `playControlCapture()` khi chiếm đóng thành công.
- **Buff x2 Tốc Độ Farm Toàn Phe (Faction-Wide Multiplier)**:
  - Phe chiếm giữ bất kỳ cứ điểm nào tự động nhận hệ số nhân đôi `delta * 2` cho các hành động cày Karma (Tọa thiền, Tụng kinh gấp đôi, Gõ mõ, Phá phách địa ngục, Hái đào, Tắm vạc dầu).
  - Hiệu ứng text nổi `⚡ BUFF x2 CỨ ĐIỂM!` màu vàng kim hổ phách tỏa ra từ nhân vật khi nhận buff.
- **HUD Cứ Điểm Trực Quan (Control Points Top-Right HUD)**:
  - Bảng thông số góc trên bên phải hiển thị icon, tên cứ điểm, số người mỗi phe (`🕊️ / 😈`), thanh tiến trình kéo co, và huy hiệu `⚡ BUFF x2` phát sáng nhấp nháy cho phe đang kiểm soát.
  - Vòng tròn bán kính phát sáng trên mặt đất (`zonePeachTree`, `zoneCauldron`) hiển thị ranh giới tranh chấp đổi màu động theo phe chiếm đóng.

### 3. Kỹ Năng Tương Tác Chéo Cõi & Cân Bằng Nghiệp Báo
- **Cõi Địa Ngục — Hắc Bạch Vô Thường (D5, -700 đến -1199 Karma)**:
  - ⛓️ **Xích Câu Hồn (`soul_chain`, Cooldown 20s)**: Cho phép click chọn bất kỳ người chơi nào ở Thiên Đàng để hút trực tiếp 15 Karma của họ cộng thẳng vào tài khoản quỷ của mình. Nếu nạn nhân bị hút khiến Karma âm (< 0), họ sẽ bị kéo văng qua Cầu Nại Hà rớt thẳng xuống cõi âm.
  - Broadcast Kill-feed toàn server: `⚡ Hắc Bạch Vô Thường [Tên] vừa hút 15 Karma từ thiên thần [Tên]!`.
- **Cõi Thiên Đàng — Thiên Thần Hộ Vệ & Đại Thiên Sứ (H4/H5+, +350 Karma trở lên)**:
  - ✨ **Thánh Quang (`holy_purify`, Cooldown 20s)**:
    - *Trừng phạt ác quỷ* (`realm === 'hell'`): Giáng sấm sét hoàng kim thanh tẩy kẻ ác, trừ -15 Karma của họ và cộng +15 Karma vào bản thân.
    - *Ban phước đồng đội* (`realm === 'heaven'`): Ban phước hào quang tăng +15 Karma cho đồng đội, người thi triển nhận +5 Karma tiếp sức.
  - Broadcast Kill-feed toàn server: `✨ Thiên Thần [Tên] vừa dùng Thánh Quang trừng phạt hút 15 Karma từ ác quỷ [Tên]!`.

### 2. Cơ Chế Farm Karma Chủ Động (Nhanh & Chống Chán)
- **Thiên Đàng**: Nút **"🧘 Tụng Kinh Gấp Đôi (+1)"** (`fast_chant`) với bộ đếm cooldown độc lập 1.5s, giúp cày điểm công đức liên tục không bị nghẽn bởi các thao tác khác.
- **Địa Ngục**: Nút **"🔥 Phá Phách Địa Ngục (-1)"** (`fast_chaos`) với bộ đếm cooldown độc lập 1.5s, giúp các vong hồn và tiểu quỷ spam phá phách tích điểm quỷ nhanh chóng để thăng cấp.

### 3. Cải Thiện UI/UX Trực Quan & Hiệu Ứng Trạng Thái Kỹ Năng
- **Thanh Kỹ Năng RPG Đáy Màn Hình 2 Tầng**:
  - Khi chưa đủ điểm: Hiển thị icon ổ khóa `🔒` kèm số điểm Karma còn thiếu (VD: `🔒 Hắc Bạch Vô Thường (-700)` kèm badge `Thiếu 250`).
  - Khi đủ điểm: Tự động sáng rực rỡ với viền vàng hổ phách và hiệu ứng nhấp nháy phát sáng (`ring-2 ring-amber-300 animate-pulse`).
  - Toast cảnh báo thông minh: Nhắc nhở cụ thể số điểm còn thiếu khi click vào chiêu chưa mở khóa hoặc số giây đếm ngược chính xác khi chiêu đang trong thời gian hồi (Cooldown).
- **Menu Tỏa Tròn (Radial Context Menu)**:
  - Tự động gắn các nút hành động chéo cõi `✨ Thánh Quang (-15 / +15)` cho H4+ và `⛓️ Hút Hồn (-15)` cho D5+ khi click chọn người chơi trên bản đồ.

---

## 🎭 Hệ Thống Tiến Hóa 14 Bậc Hình Thái (Karma [-3000 .. +3000])
- **7 Bậc Cõi Thiên Đàng (0 .. +3000)**:
  - 🕊️ **H1: Người Thường Mới Lên** (0..49 Karma, avatar `🙂`, scale 1.0): Mới bước qua Cầu Nại Hà.
  - ✨ **H2: Tiểu Đồng Học Việc** (50..149 Karma, avatar `🧒`, scale 1.0): Mở khóa kỹ năng *Rắc Pháo Giấy*.
  - 👼 **H3: Thiên Thần Tập Sự** (150..349 Karma, avatar `👼`, scale 1.05): Đôi cánh thiên thần nhỏ vỗ nhịp `wing-flap`, mở khóa *Vỏ Chuối Thánh*.
  - 🧚 **H4: Thiên Thần Hộ Vệ** (350..699 Karma, avatar `🧚`, scale 1.1): Hào quang hoàng kim, mở khóa *Hóa Ếch Xanh* và *Hoa Đăng Hoàng Kim (+8)*.
  - 🧝 **H5: Đại Thiên Sứ 6 Cánh** (700..1199 Karma, avatar `🧝`, scale 1.16): 6 cánh thiên thần SVG xòe rộng lấp lánh, mở khóa *Khiên Phản Nghiệp*.
  - 🧙‍♂️ **H6: Thượng Tiên Cưỡi Mây** (1200..1999 Karma, avatar `🧙‍♂️`, scale 1.22): Đám mây ngũ sắc bềnh bồng `rainbow-cloud`, mở khóa *Bùa Ngoan Ngoãn*.
  - 👑 **H7: Ngọc Hoàng Đại Đế** (2000..3000 Karma, avatar `👑`, scale 1.3): Rồng vàng hoàng kim uốn lượn bay quanh `dragon-orbit`, kỹ năng tối thượng *Mưa Lộc Trời*.

- **7 Bậc Cõi Địa Ngục (-1 .. -3000)**:
  - 👻 **D1: Vong Hồn Lạc Lối** (-1..-49 Karma, avatar `👻`, scale 1.0): Sám hối nơi cõi âm, mở khóa *Tự Tạo Nghiệp*.
  - 😈 **D2: Tiểu Quỷ Sừng Nhú** (-50..-149 Karma, avatar `😈`, scale 1.0): Sừng quỷ nhú nhấp nhô, mở khóa *Bom Khói Độc*.
  - 👺 **D3: Quỷ Dạ Xoa** (-150..-349 Karma, avatar `👺`, scale 1.06): Quầng khói đen bay quanh, mở khóa *Bùa Hóa Heo*.
  - 👹 **D4: Ngưu Đầu Hộ Pháp** (-350..-699 Karma, avatar `👹`, scale 1.14): Sừng trâu to đỏ rực, mở khóa *Bùa Đi Ngược* và *Kéo Giò Ngưu Đầu (-8)*.
  - 💀 **D5: Hắc Bạch Vô Thường** (-700..-1199 Karma, avatar `💀`, scale 1.2): Quỷ hỏa xanh lè lượn lờ, mở khóa *Xích Câu Hồn*.
  - 🧛‍♂️ **D6: Đại Ác Quỷ Vương** (-1200..-1999 Karma, avatar `🧛‍♂️`, scale 1.26): Đôi cánh dơi khổng lồ vỗ nhịp, mở khóa *Hố Đen Hút Nghiệp*.
  - 👿 **D7: Hỗn Thế Ma Tôn** (-2000..-3000 Karma, avatar `👿`, scale 1.34): Hào quang hắc lôi tia sét tím đỏ cuồn cuộn `demon-glow`, kỹ năng tối thượng *Nhật Thực Ma Giới*.

---

### 2. Bộ 12 Kỹ Năng Troll Mở Khóa Theo Bậc

| Cõi | Bậc | Kỹ Năng | Hiệu Ứng | Cooldown |
|---|---|---|---|---|
| Thiên Đàng | H2 | ✨ Rắc Pháo Giấy | Ép mục tiêu nhảy múa 3 giây | 15s |
| Thiên Đàng | H3 | 🍌 Vỏ Chuối Thánh | Đặt bẫy vỏ chuối trên đất, ai dẫm phải trượt té văng xa | 25s |
| Thiên Đàng | H4 | ✨ Thánh Quang | Trừng phạt kẻ ác (-15 Karma) / Ban phước đồng đội (+15 Karma) | 20s |
| Thiên Đàng | H5 | 🪞 Khiên Phản Nghiệp | Dựng khiên 12s phản 100% chiêu xấu và điểm phạt về kẻ tung | 45s |
| Thiên Đàng | H6 | 🤫 Bùa Ngoan Ngoãn | Dán bùa 12s ép mục tiêu chat các câu nịnh hót thảo mai | 45s |
| Thiên Đàng | H7 | 🌈 Mưa Lộc Trời | Rải 8 bao lì xì tiên khắp 2 cõi, ai nhặt được nhận +15..30 Karma | 90s |
| Địa Ngục | D2 | 💨 Bom Khói Độc | Xì hơi tạo khói độc 10s dạt người đứng gần ra ngoài | 20s |
| Địa Ngục | D3 | 🐷 Bùa Hóa Heo | Biến mục tiêu thành Heo Hồng 8s, chat bị đổi thành "Éc éc..." | 30s |
| Địa Ngục | D4 | 🙃 Bùa Đi Ngược | Ém bùa lú lẫn 10s đảo ngược hướng di chuyển chuột | 35s |
| Địa Ngục | D5 | ⛓️ Xích Câu Hồn | Hút trực tiếp 15 Karma từ người chơi Thiên Đàng, < 0 kéo rớt cõi | 20s |
| Địa Ngục | D6 | 🕳️ Hố Đen Hút Nghiệp | Hố đen 5s hút người xung quanh vào tâm, chôm -4 Karma/s | 50s |
| Địa Ngục | D7 | 🌑 Nhật Thực Ma Giới | Màn hình tối sầm 8s, ép toàn bộ người chơi server nhảy Zombie | 90s |

- **Hành động cơ bản cày Karma siêu tốc**:
  - `🧘 Tụng Kinh Gấp Đôi (+1)` (Thiên Đàng, CD 1.5s): Farm nhanh công đức chống chán.
  - `🔥 Phá Phách Địa Ngục (-1)` (Địa Ngục, CD 1.5s): Farm nhanh điểm quỷ tích lũy thăng cấp.
  - `😈 Tự Tạo Nghiệp (-25)` (Địa Ngục): Tự giảm Karma với 7 lý do hài hước đời thực.

---

### 3. Giao Diện Người Dùng & Âm Thanh Trực Quan

1. **Thanh Kỹ Năng RPG Đáy Màn Hình (Dual-layer Skill Bar)**:
   - Hiển thị động 6 kỹ năng tương ứng với cõi hiện tại.
   - Khi chưa đủ điều kiện, nút hiển thị icon ổ khóa `🔒` kèm số điểm Karma còn thiếu thời gian thực.
   - Khi đủ điều kiện, nút tự động phát sáng rực rỡ với hiệu ứng `ring-2 ring-amber-300 animate-pulse` sẵn sàng thi triển.
   - Toast cảnh báo thông minh khi bấm chiêu chưa đủ bậc hoặc đang trong thời gian hồi chiêu.

2. **Sổ Tay Tiến Hóa (Modal 📖)**:
   - Nút bấm trực quan trên Top Bar mở bách khoa toàn thư tra cứu chi tiết 14 hình thái và 12 kỹ năng troll.

3. **14 SFX Procedural Web Audio API (Zero External Audio Files)**:
   - Âm thanh nhạc cụ Thiên Đàng (Pentatonic Harp), Drone Địa Ngục, Gõ Mõ Đa Tần Số Combo Fever, Vạc Dầu Sôi, Canh Mạnh Bà, Quăng Xích Sắt, Thả Tim.
   - **9 SFX Kỹ năng, Thăng cấp, Nhiệm vụ & Cứ điểm**: Thánh Quang Trừng Phạt (`playHolyPurify`), Thăng Cấp (`playEvolutionUp`), Trượt Vỏ Chuối (`playBoingSlip`), Biến Hình Phép Thuật (`playPolymorph`), Bom Khói Xì Hơi (`playFartCloud`), Khiên Phản Nghiệp (`playMirrorReflect`), Kèn Lệnh Tối Thượng (`playUltimateHorn`), Hoàn Thành Nhiệm Vụ Mạnh Bà (`playQuestComplete`), Kèn Chiếm Cứ Điểm (`playControlCapture`).

4. **Phím Tắt Dev Test Nhanh (Localhost Only)**:
   - `Shift + ArrowUp`: Tăng nhanh +150 Karma.
   - `Shift + ArrowDown`: Giảm nhanh -150 Karma.
   - Phím số `1 .. 6`: Thi triển kỹ năng nhanh trên thanh Hotbar.

---

## 🚀 Hướng Dẫn Khởi Chạy

```bash
cd /media/tanma/DATA/thien-dang-dia-nguc-online
npm start
```
Mở trình duyệt truy cập: `http://localhost:3000`

## 🧪 Kiểm Thử Tự Động Toàn Diện (42 Test Cases)

```bash
node test_game.js
```
Bộ kiểm thử tích hợp sẵn 42 test cases độc lập bao phủ 100% tính năng 14 cấp hình thái, 12 kỹ năng troll, đại chiến phe phái, chiêu mộ liên cõi kéo co, NPC nhiệm vụ ẩn Mạnh Bà, cứ điểm tranh chấp x2 buff farm, bẫy vật lý, bảo vệ XSS và multiplayer realtime:
- ✓ Case 1..3: HTTP Server & WebSocket kết nối thành công.
- ✓ Case 4..5: `player:join`, `world:init` và thống kê nhân vật bots.
- ✓ Case 6..8: Khóa biên tọa độ, Tọa thiền (+3), chống spam 700ms.
- ✓ Case 9..10: Bộ lọc khẩu nghiệp (-20), chuyển cõi tự động qua Cầu Nại Hà.
- ✓ Case 11..12: Gõ mõ Combo Fever, bỏ phiếu Đài Phán Xét công cộng.
- ✓ Case 13: XSS immunity 100% với `textContent`.
- ✓ Case 14..16: 3 Công trình (Canh Mạnh Bà, Vạc Dầu Sôi, Cây Đào Tiên).
- ✓ Case 17..18: Thả tim vật phẩm bay và Nhật Ký Tam Giới (Kill-feed).
- ✓ Case 19..20: Dev shortcut `dev:set_karma` & sự kiện tiến hóa `player:evolved`.
- ✓ Case 21..24: Kỹ năng troll Thiên Đàng (Pháo Giấy, Chuối Thánh, Hóa Ếch & Intercept Chat, Khiên Phản).
- ✓ Case 25..27: Tự Tạo Nghiệp (-25), Bom Khói Độc, Nhật Thực Ma Giới D7.
- ✓ Case 28: Cơ chế Phá Phách Địa Ngục farm nhanh -1 Karma & cooldown 1.5s.
- ✓ Case 29: Cơ chế Tụng Kinh Gấp Đôi farm nhanh +1 Karma & cooldown 1.5s.
- ✓ Case 30: Kỹ năng Thánh Quang Trừng Phạt (H4) hút 15 Karma & Kill-feed toàn server.
- ✓ Case 31: Kỹ năng Xích Câu Hồn (D5) hút 15 Karma từ Thiên Đàng & Kill-feed toàn server.
- ✓ Case 32: Khởi tạo NPC Bà Lão Mạnh Bà & truy xuất nhiệm vụ ẩn `quest:get`.
- ✓ Case 33: Tự động cập nhật tiến trình nhiệm vụ `quest:updated` theo hành động người chơi.
- ✓ Case 34: Nhận thưởng nhiệm vụ `quest:claim`, cộng đại thưởng Karma và làm mới nhiệm vụ.
- ✓ Case 35: Hệ thống 2 Cứ Điểm Tranh Chấp & Vòng lặp phát sóng `control_points:update` mỗi 2s.
- ✓ Case 36: Cơ chế chiếm đóng cứ điểm dựa trên khoảng cách hình học Euclid (Proximity Capture).
- ✓ Case 37: Kích hoạt hiệu ứng Buff nhân đôi tốc độ farm (Buff x2 Karma) khi phe kiểm soát cứ điểm.
- ✓ Case 38: Kiểm tra Dàn 14 Bots & Phân bổ quân lực 2 phe (7 Thiên Đàng H1..H7 & 7 Địa Ngục D1..D7).
- ✓ Case 39: Kéo Giò Liên Cõi (Hell kéo giò Heaven) & cơ chế trừ điểm.
- ✓ Case 40: Kéo Co Chiêu Mộ Thành Viên Về Phe Mình (Faction Tug-of-War Recruitment & Conversion) qua ngưỡng 0, thưởng +20/-20 Karma và phát sóng `world:recruited`.
- ✓ Case 41: Cân Bằng Tích Lũy Ma Lực Cõi Địa Ngục (Phá phách -3 Karma, Tôi luyện ma thân Vạc Dầu Sôi).
- ✓ Case 42: Dọn dẹp kết nối & Ngắt WebSocket an toàn.
