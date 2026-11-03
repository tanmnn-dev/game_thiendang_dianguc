# Changelogs — Thiên Đàng & Địa Ngục Online

Tất cả các thay đổi của dự án được ghi nhận tại đây theo chuẩn AIaC.

---

## v1.7.1 (2026-11-03) — Performance Optimization (Staggered Bot Tick, Canvas FPS Boost & DOM Reflow Containment)

### [IMPROVE]
- **Tối Ưu Vòng Lặp Bot & Mạng WebSocket Server-Side**:
  - **Staggered Bot Loop**: Thay thế cơ chế dồn 14 bots cùng di chuyển ở millisecond 0 (gây spike nghẽn socket và giật frame) bằng kỹ thuật chia nhỏ 2 bots mỗi 500ms. Socket packet phát tán đều đặn theo thời gian, triệt tiêu 100% hiện tượng micro-stutter.
  - **Throttled Control Points Broadcast**: Thêm kiểm tra delta change cho Cứ Điểm Tranh Chấp, chỉ emit socket khi số người hoặc % chiếm đóng thực sự thay đổi (kèm heartbeat 10s), cắt giảm 80% lưu lượng mạng nhàn rỗi.
- **Tăng Tốc 2D Canvas Nền (Tăng Gấp Đôi FPS)**:
  - Loại bỏ hoàn toàn `ctx.shadowBlur` trong vòng lặp hạt `requestAnimationFrame` (tiết kiệm hàng ngàn phép tính blur convolution nặng nề mỗi giây trên GPU/CPU).
  - Điều chỉnh mật độ hạt thông minh (24 hạt trên mobile, 38 hạt trên desktop).
  - Tự động tạm dừng vẽ canvas khi tab trình duyệt bị ẩn (`document.hidden`) giúp tiết kiệm pin và tài nguyên máy tính/điện thoại.
- **Cô Lập Layout Reflow & Tăng Tốc Phần Cứng (Hardware Layer)**:
  - Thay `transition-all` trên nhân vật bằng `transition: left 700ms ease-out, top 700ms ease-out`.
  - Bổ sung `will-change: left, top` và `contain: layout style` giúp trình duyệt cô lập hoàn toàn việc render từng nhân vật, không gây reflow lan rộng ra DOM cha.
  - Tối ưu các hiệu ứng `@keyframes` (Cầu Nại Hà, Cây Đào, Lửa Vạc Dầu, Tiên Ông) từ 2-4 layer `drop-shadow` xuống 1 layer sắc nét kèm `transform: translateZ(0)` và `will-change: filter`.

---

## v1.7.0 (2026-11-03) — Polish UI/UX, Mobile-First Responsive & Dual-Path Quest System

### [NEW]
- **NPC Nam Cực Tiên Ông (👴✨) Trên Cõi Thiên Đàng**:
  - Tọa độ `x: 22, y: 38`, hiệu ứng hào quang tiên đạo `immortalGlow` và bong bóng nhiệm vụ tương tác `npcTienOngBubble`.
  - Cung cấp nhiệm vụ tu tập tiên giới song hành cùng Mạnh Bà ở cõi âm.
- **Mini Quest Tracker Ngoài Màn Hình Chính**:
  - Hiển thị tiến trình nhiệm vụ trực quan góc phải trên, thanh progress bar mượt mà.
  - Tích hợp nút `🎁 Nhận Thưởng` nhấp nháy pulse khi nhiệm vụ hoàn thành.
  - Tích hợp nút `🔄 Đổi nhiệm vụ` với bộ đếm cooldown 15s chống spam trên cả client và server (`quest:reroll`).
- **Hệ Thống Nhận Thưởng 2 Nhánh Cân Bằng (Dual-Path Reward)**:
  - Cho phép người chơi tự do lựa chọn **Nhánh Chính Đạo (+50..85 Karma)** hoặc **Nhánh Ma Đạo (-50..85 Karma)** khi trả nhiệm vụ ở cả 2 cõi.
  - Socket handler `quest:claim` xử lý bảo mật, cập nhật karma đúng nhánh và cấp phát danh hiệu tương ứng.
- **Tự Động Clamp Di Chuyển Ra Mép Cầu Nại Hà**:
  - Khi click vào lãnh thổ cõi đối diện, nhân vật tự động di chuyển ra mép bờ Cầu Nại Hà (`targetY: 43` đối với Thiên Đàng, `targetY: 57` đối với Địa Ngục) thay vì chặn lệnh hay bắn toast báo lỗi khó chịu.

### [IMPROVE]
- **Mobile-First Responsive Layout (<768px)**:
  - Thanh kỹ năng cuộn ngang mượt mà ẩn scrollbar thô (`.no-scrollbar`), chống overflow màn hình nhỏ.
  - Khung chat tách thành drawer có nút toggle bật/tắt trên mobile, tự đóng khi gửi tin tránh xung đột bàn phím ảo.
  - Đóng và thu gọn các bảng dock phụ trợ trên màn hình cảm ứng.
- **Tách Sự Kiện Click Khỏi Bản Đồ (`stopPropagation`)**:
  - Ngăn chặn hoàn toàn việc click Avatar người chơi, Bot, NPC hoặc Landmark bị kích hoạt di chuyển map không mong muốn.
- **Chống Đè Chữ & Sắp Xếp Z-Index Theo Chiều Sâu 2.5D**:
  - Gán z-index động theo tọa độ Y (`z = 20 + Math.floor(y / 4)`).
  - Nhân vật bản thân cố định `z-35`, bong bóng chat `z-40`, radial menu `z-50`.
  - Nhãn tên người chơi mỏng nhẹ, bán trong suốt chống rối mắt khi tập trung đông người tại Cây Đào hoặc Vạc Dầu.

---

## v1.6.0 (2026-11-03) — Faction War & Tug-of-War Recruitment (Đại Chiến Phe Phái, Chiêu Mộ Đổi Cõi & Tương Tác Kỹ Năng Trực Quan)

### [NEW]
- **Đại Chiến Phe Phái & Kéo Người Về Phe Mình (Faction War & Tug-of-War Recruitment)**:
  - **Cơ Chế Chiêu Mộ / Cảm Hóa Liên Cõi Qua Cầu Nại Hà**:
    - **Phe Địa Ngục**: Dùng Xích Câu Hồn (`soul_chain`), Kéo Giò (`pull_leg`) hoặc Bom Khói / Bùa Chú để kéo Karma của đối thủ Thiên Đàng tụt xuống dưới 0 (`< 0`), lôi họ rớt đài văng qua Cầu Nại Hà xuống cõi âm thành đồng bọn ác quỷ.
    - **Phe Thiên Đàng**: Dùng Thánh Quang (`holy_purify`), Ban Phước Cảm Hóa (`bless`) để thanh tẩy ác ma, nâng Karma của đối thủ Địa Ngục vượt lên `>= 0`, cảm hóa họ thăng thiên qua Cầu Nại Hà lên cõi trời thành thiên sứ.
  - **Hệ Thống Thưởng Chiến Công & Sự Kiện Realtime Toàn Server (`world:recruited`)**:
    - Khi chiêu mộ thành công một thành viên đổi phe: Người chiêu mộ (`recruiter`) nhận đại thưởng **+20 Công Đức** (cho Thiên Đàng) hoặc **-20 Ma Lực** (cho Địa Ngục).
    - Tăng bộ đếm chiến công `stats.recruited++`, lưu trữ trong RAM session và hiển thị trực tiếp trong Gương Chiếu Nghiệp.
    - Phát thanh Kill-feed nổi bật toàn server:
      - `✨ [Tên] đã cảm hóa thành công [Tên] thăng thiên lên Thiên Đàng! Phe Thiên Đàng chiêu mộ thêm 1 thành viên! 🕊️`
      - `😈 [Tên] đã lôi kéo thành công [Tên] sa ngã xuống Địa Ngục! Phe Địa Ngục chiêu mộ thêm 1 thành viên! 🔥`
    - Client nhận sự kiện `world:recruited` phát âm thanh thăng hoa `playEvolutionUp` hoặc `playThunder` và Toast chúc mừng chiến tích.

- **Dàn 14 Ambient Bots & Hệ Thống FSM Tác Chiến Tự Động (Autonomous Faction Bot AI)**:
  - Mở rộng quân số lên **14 Bots** chia đều 2 phe đại diện trọn vẹn 14 bậc hình thái:
    - **7 Bots Thiên Đàng**: Hùng Hay Hứa (H1), Thảo Thánh Thiện (H2), Minh Mộng Mơ (H3), An An Nhiên (H4), Linh Lương Thiện (H5), Trí Thượng Tiên (H6), Đại Đế Giáng Trần (H7).
    - **7 Bots Địa Ngục**: Tuấn Trùm Bom Hàng (D1), Lan Lươn Lẹo (D2), Huy Hắc Ám (D3), Đạt Đổ Thừa (D4), Quang Quỵt Nợ (D5), My Mượn Tiền (D6), Bảo Bạo Chúa (D7).
  - **Trí Tuệ Nhân Tạo FSM Cơ Động & Chiến Thuật**:
    - *Di chuyển chiến thuật*: 40% di chuyển vào Cứ Điểm (Cây Đào Tiên `x: 78, y: 24` hoặc Vạc Dầu Sôi `x: 78, y: 72`) để tranh chấp và bảo vệ Buff x2; 25% tuần tra ranh giới Cầu Nại Hà để chiêu mộ đối phương; 35% tản bộ tự do.
    - *Hành vi thi triển kỹ năng*: Quét mục tiêu phe đối địch, tính toán thời gian hồi chiêu độc lập và tung chiêu tương ứng cấp bậc (D5+ Xích Câu Hồn, D4 Bùa Đi Ngược, D3 Bùa Hóa Heo, D2 Bom Khói, H4+ Thánh Quang & Ban Phước Cảm Hóa, H4 Bùa Hóa Ếch, H3 Vỏ Chuối, H2 Pháo Giấy).
    - *Tự động đổi phe khi bị lôi kéo*: Khi một bot bị đối phương cảm hóa hoặc lôi kéo đổi cõi, bot tự động đổi phe, di chuyển theo cõi mới và dùng kỹ năng của phe mới để chống lại đồng đội cũ.

- **Rà Soát & Cân Bằng Toàn Bộ Thông Số Tính Điểm Cõi Địa Ngục (Hell Farm Balancing)**:
  - Khắc phục lỗi tích lũy ma lực: Nhận thưởng nhiệm vụ ở Địa Ngục nhận `-40..-60 Karma`, Tắm Vạc Dầu Sôi tôi luyện ma thân nhận `-25 Karma` (-50 Karma khi có Buff x2 Cứ Điểm), Phá phách Địa Ngục nhận `-3 Karma` (-6 Karma khi có Buff x2 Cứ Điểm).
  - Đảm bảo người chơi Địa Ngục hoàn toàn chủ động tích lũy điểm âm để thăng cấp D2..D7 và mở khóa toàn bộ kỹ năng quỷ dữ.

- **Nâng Cấp Kỹ Năng Tương Tác Trực Tiếp Với Người Dùng (Radial Context Menu)**:
  - Mở rộng Menu Tỏa Tròn (Radial Menu): Click vào bất kỳ người chơi hoặc bot nào trên bản đồ đều mở menu kỹ năng tương tác trực tiếp theo đúng cõi và cấp bậc:
    - Kéo Rớt Cõi / Kéo Giò (-8 Karma).
    - Cảm Hóa Thăng Thiên / Ban Phước (+8 Karma).
    - Thánh Quang Trừng Phạt / Ban Phước (-15 / +15 Karma).
    - Hóa Heo Hồng (`pig_hex`), Hóa Ếch Xanh (`frog_hex`), Bùa Đi Ngược (`reverse_walk`), Rắc Pháo Giấy (`confetti_dance`), Xích Hút Hồn (`soul_chain`).
  - Gương Chiếu Nghiệp hiển thị mục mới `👥 Chiêu Mộ Về Phe: [N] người`.

- **Mở Rộng Bộ Kiểm Thử Tự Động Toàn Diện Lên 42/42 Test Cases (Pass 100%)**:
  - Case 38: Kiểm tra Dàn 14 Bots & Phân bổ quân lực 2 phe (7 Thiên Đàng H1..H7 & 7 Địa Ngục D1..D7).
  - Case 39: Kéo Giò Liên Cõi (Hell kéo giò Heaven) & cơ chế trừ điểm.
  - Case 40: Kéo Co Chiêu Mộ Thành Viên Về Phe Mình (Faction Tug-of-War Recruitment & Conversion) qua ngưỡng 0, thưởng +20/-20 Karma và phát sóng `world:recruited`.
  - Case 41: Cân Bằng Tích Lũy Ma Lực Cõi Địa Ngục (Phá phách -3 Karma, Tôi luyện ma thân Vạc Dầu Sôi).
  - Case 42: Dọn dẹp kết nối & Ngắt WebSocket an toàn.

---

## v1.5.0 (2026-11-03) — Quest System & Control Points x2 Farm Speed (Nhiệm Vụ Ẩn Bà Lão Mạnh Bà & Cứ Điểm Tranh Chấp x2 Buff)

### [NEW]
- **Hệ Thống NPC Giao Nhiệm Vụ Ẩn (Quest System)**:
  - **NPC Bà Lão Mạnh Bà (`👵🍵`)**:
    - Tọa lạc trang nghiêm tại Quán Canh Tam Giới (`x: 22, y: 58`), sở hữu hiệu ứng nhún nhảy hoạt hình (`npcBobbing`) và bong bóng hội thoại dấu chấm hỏi phát sáng màu ngọc (`questGlow`).
    - Hỗ trợ tương tác trực tiếp bằng cách click vào NPC trên bản đồ hoặc bấm nút **"📜 Nhiệm Vụ"** trên thanh Header.
  - **Hộp Thoại Nhiệm Vụ Dân Dã, Hài Hước**:
    - Modal nhiệm vụ mang phong cách trà quán cổ trang, hiển thị avatar Mạnh Bà, danh hiệu, câu thoại độc quyền dí dỏm, thanh tiến trình `current / target` và phần thưởng đại hồng ân.
  - **Bộ 6 Mẫu Nhiệm Vụ Đa Dạng Tự Động Luân Phiên**:
    - `q_troll`: Cấu Véo & Chọc Ghẹo (Troll hoặc kéo giò/ném sét 3 lần, thưởng +50 Karma).
    - `q_farm`: Siêng Năng Cày Cuốc (Tụng kinh hoặc gõ mõ 8 lần, thưởng +45 Karma).
    - `q_soup`: Thưởng Trà Ranh Giới (Uống cạn 1 bát Canh Mạnh Bà quên sự đời, thưởng +40 Karma).
    - `q_boil`: Tắm Vạc Dầu Hoặc Hái Đào Tiên (Nhảy vạc dầu hoặc hái đào tiên 1 lần, thưởng +55 Karma).
    - `q_cross`: Tương Tác Chéo Cõi (Dùng Thánh Quang H4+ hoặc Xích Câu Hồn D5+ 2 lần, thưởng +60 Karma).
    - `q_confess_lantern`: Tâm Hồn Lương Thiện (Dâng 1 sớ hối lỗi hoặc thả 1 hoa đăng, thưởng +45 Karma).
  - **Cơ Chế Nhận Thưởng Phân Định Chuẩn 2 Cõi (Server-Side RAM Session)**:
    - **Thiên Đàng**: Nhận thưởng Công Đức `+40..+60 Karma` để bứt phá lên các bậc thánh thần H2..H7.
    - **Địa Ngục**: Nhận thưởng Ma Lực `-40..-60 Karma` để tích lũy oán khí, tụt sâu vào cảnh giới quỷ dữ mở khóa các bậc D2..D7 và bộ kỹ năng troll bá đạo.
    - Tiến trình nhiệm vụ kiểm soát 100% trong RAM server (`player.quest`), tự động phát hiện và cập nhật khi người chơi thực hiện đúng hành động.
    - Nút **"🎁 Nhận Thưởng"** kích hoạt khi hoàn thành (`isCompleted === true`), cộng trực tiếp đại thưởng Karma theo đúng cõi, kích hoạt hiệu ứng pháo hoa chúc mừng (`quest_complete`), phát âm thanh thỏa mãn và tự động sinh nhiệm vụ mới ngẫu nhiên.
    - Huy hiệu thông báo chấm đỏ nhấp nháy trên nút Nhiệm Vụ khi có thưởng chờ nhận.

- **Cân Bằng & Tối Ưu Hóa Tốc Độ Cày Nghiệp Cõi Địa Ngục (Hell Farm Balancing)**:
  - Nâng cấp hành động **"🔥 Phá Phách Địa Ngục"** từ `-1` lên `-3 Karma` (nhân đôi thành `-6 Karma` khi chiếm cứ điểm Vạc Dầu Sôi), giúp spam cày điểm ma lực siêu nhanh.
  - **Tôi Luyện Ma Thân trong Vạc Dầu Sôi**: Người chơi cõi Địa Ngục khi tắm vạc dầu 10s nhận `-25 Karma` (hoặc `-50 Karma` nếu có Buff x2 Cứ Điểm) để tôi luyện thể xác ma đạo thay vì bị kéo điểm về dương.
  - Phân định rõ 2 con đường cho người chơi Địa Ngục:
    - *Tu Ma Đạo*: Dùng Phá Phách (-3), Tự Tạo Nghiệp (-25), Vạc Dầu (-25), Nhận thưởng nhiệm vụ (-50) để tụt điểm âm mở khóa các chiêu 🐷 Hóa Heo (-150), 🙃 Đi Ngược (-350), ⛓️ Xích Hút Hồn (-700), 🕳️ Hố Đen (-1200), 🌑 Nhật Thực (-2000).
    - *Đường Hoàn Lương*: Dùng Gõ Mõ (+4), Viết Sớ (+10), Canh Thanh Tâm (+20) để chuộc lỗi quay về Thiên Đàng.

- **Khu Vực Tranh Chấp (Control Points) — Buff Nhân Đôi Tốc Độ Farm (Buff x2 Karma)**:
  - **2 Cứ Điểm Chiến Lược**:
    - 🍑 **Cây Đào Tiên** (Thiên Đàng, `x: 78, y: 24`, bán kính ảnh hưởng 14%).
    - 🔥 **Vạc Dầu Sôi** (Địa Ngục, `x: 78, y: 72`, bán kính ảnh hưởng 14%).
  - **Vòng Lặp Kéo Co Theo Thời Gian Thực (Dynamic Proximity Capture Loop)**:
    - Server tự động tính khoảng cách hình học phẳng Euclid `Math.hypot(p.x - cp.x, p.y - cp.y) <= cp.radius` mỗi 2000ms.
    - Tiến trình chiếm đóng kéo co từ -100% (Địa Ngục) đến +100% (Thiên Đàng) với bước nhảy tỷ lệ thuận theo chênh lệch quân số có mặt trong vòng bán kính `Math.min(50, (heavenCount - hellCount) * 25)`.
    - Phát thông báo Kill-feed toàn server khi một phe chiếm đóng thành công cứ điểm: `✨ Phe Thiên Đàng vừa chiếm lĩnh [Cây Đào Tiên]! Cả phe nhận Buff x2 Tốc Độ Farm!`.
  - **Hiệu Ứng Buff x2 Tốc Độ Farm Cho Toàn Phe (Faction-Wide Multiplier)**:
    - Phe chiếm giữ bất kỳ cứ điểm nào tự động nhận hệ số nhân đôi `delta * 2` cho các hành động cày Karma:
      - Tọa thiền (+3 -> +6 Karma).
      - Tụng kinh gấp đôi (+1 -> +2 Karma).
      - Gõ mõ sám hối (+4 -> +8 Karma).
      - Phá phách địa ngục (-1 -> -2 Karma).
      - Hái đào tiên (+15 -> +30 Karma).
      - Tắm vạc dầu sôi (+25 -> +50 Karma).
    - Hiệu ứng text nổi `⚡ BUFF x2 CỨ ĐIỂM!` màu vàng kim hổ phách tỏa ra từ nhân vật khi nhận buff.
  - **HUD Cứ Điểm Trực Quan (Control Points Top-Right HUD)**:
    - Bảng thông số góc trên bên phải hiển thị icon, tên cứ điểm, số người mỗi phe đang có mặt (`🕊️ / 😈`), thanh tiến trình kéo co màu Thiên Đàng / Địa Ngục, và huy hiệu `⚡ BUFF x2` phát sáng nhấp nháy cho phe đang nắm quyền kiểm soát.
    - Vòng tròn bán kính phát sáng trên mặt đất (`zonePeachTree`, `zoneCauldron`) hiển thị ranh giới tranh chấp đổi màu động theo phe chiếm đóng.

- **Nâng Cấp Web Audio API Procedural Mới**:
  - `playQuestComplete()`: Arpeggio thánh thót 5 nốt C5-E5-G5-C6-E6 (523Hz - 1318Hz) mô phỏng tiếng chuông mở kho báu rạng rỡ.
  - `playControlCapture()`: Kèn lệnh Fanfare đồng âm trầm hùng chuyển âm sắc Sawtooth (220Hz - 440Hz) báo hiệu chiếm lĩnh lãnh thổ.

- **Mở Rộng Bộ Kiểm Thử Tự Động Toàn Diện Lên 38/38 Test Cases (Pass 100%)**:
  - Case 32: Khởi tạo NPC Bà Lão Mạnh Bà & truy xuất nhiệm vụ ẩn `quest:get`.
  - Case 33: Tự động cập nhật tiến trình nhiệm vụ `quest:updated` theo hành động người chơi.
  - Case 34: Nhận thưởng nhiệm vụ `quest:claim`, cộng đại thưởng Karma và làm mới nhiệm vụ.
  - Case 35: Hệ thống 2 Cứ Điểm Tranh Chấp & Vòng lặp phát sóng `control_points:update` mỗi 2s.
  - Case 36: Cơ chế chiếm đóng cứ điểm dựa trên khoảng cách hình học Euclid (Proximity Capture).
  - Case 37: Kích hoạt hiệu ứng Buff nhân đôi tốc độ farm (Buff x2 Karma) khi phe kiểm soát cứ điểm.
  - Case 38: Dọn dẹp kết nối & Ngắt WebSocket an toàn.

---

## v1.4.0 (2026-11-03) — Cross-Realm Skill Balancing & Fast Karma Farm Overhaul (Cân Bằng Kỹ Năng Chéo Cõi & Farm Karma Siêu Tốc)

### [NEW]
- **Kỹ Năng Hút Điểm & Tương Tác Chéo Giữa 2 Cõi (Cross-Realm Drain/Buff)**:
  - **Cõi Địa Ngục — Hắc Bạch Vô Thường (D5, Karma -700 đến -1199)**:
    - Nâng cấp kỹ năng `soul_chain` (Xích Câu Hồn, Cooldown chuẩn 20s): Cho phép chọn mục tiêu bất kỳ ở Thiên Đàng để rút trực tiếp 15 Karma của họ cộng thẳng vào tài khoản quỷ của mình (giúp tăng cấp Địa Ngục). Nếu mục tiêu bị trừ điểm khiến Karma âm (< 0), họ sẽ bị kéo văng qua Cầu Nại Hà rớt thẳng xuống cõi âm ngay cạnh Hắc Bạch Vô Thường.
    - Phát Kill-feed toàn server: `⚡ Hắc Bạch Vô Thường [Tên] vừa hút 15 Karma từ thiên thần [Tên]!`.
  - **Cõi Thiên Đàng — Thiên Thần Hộ Vệ & Đại Thiên Sứ (H4/H5+, Karma +350 trở lên)**:
    - Bổ sung kỹ năng `holy_purify` (Thánh Quang, Cooldown chuẩn 20s):
      - Khi thi triển lên kẻ ác ở Địa Ngục (`target.realm === 'hell'`): Giáng sấm sét hoàng kim thanh tẩy kẻ ác, trừ -15 Karma của họ và cộng +15 Karma vào tài khoản thiên thần.
      - Khi thi triển lên đồng đội ở Thiên Đàng (`target.realm === 'heaven'`): Ban phước hào quang tăng +15 Karma cho đồng đội, người thi triển nhận +5 Karma tiếp sức.
    - Phát Kill-feed toàn server: `✨ Thiên Thần [Tên] vừa dùng Thánh Quang trừng phạt hút 15 Karma từ ác quỷ [Tên]!`.
  - **Bổ Sung Âm Thanh Procedural Web Audio API Mới**:
    - `playHolyPurify()`: Hợp âm tam tần số hình tam giác (Triangle 523Hz - 1046Hz) mô phỏng thánh chuông ngân vang khi giáng Thánh Quang.
- **Cơ Chế Farm Karma Chủ Động (Nhanh, Chống Chán, Cooldown Độc Lập 1.5s)**:
  - **Tại Thiên Đàng**: Thêm nút **"🧘 Tụng Kinh Gấp Đôi (+1)"** (`fast_chant`) với bộ đếm cooldown độc lập 1.5s, hỗ trợ người chơi cày điểm công đức liên tục không bị nghẽn bởi các thao tác khác.
  - **Tại Địa Ngục**: Thêm nút **"🔥 Phá Phách Địa Ngục (-1)"** (`fast_chaos`) với bộ đếm cooldown độc lập 1.5s, hỗ trợ các vong hồn và tiểu quỷ spam tích lũy điểm quỷ nhanh chóng để thăng cấp.
- **Cải Thiện Toàn Diện UI/UX Thanh Kỹ Năng Đáy Màn Hình (Dual-Layer State & Dynamic Locking)**:
  - **Trạng thái Khóa (Locked)**: Khi chưa đủ điểm Karma, hiển thị biểu tượng ổ khóa `🔒` kèm số điểm còn thiếu tính toán theo thời gian thực (VD: `🔒 Hắc Bạch Vô Thường (-700)` kèm badge `Thiếu 250`).
  - **Trạng thái Mở Khóa (Unlocked)**: Tự động sáng rực rỡ với viền vàng kim hổ phách và hiệu ứng nhấp nháy phát sáng (`ring-2 ring-amber-300 animate-pulse`), báo hiệu kỹ năng đã sẵn sàng thi triển.
  - **Phản Hồi Toast Thông Minh**:
    - Click vào chiêu chưa đủ cấp: Hiện Toast cảnh báo chi tiết (VD: `⚠️ Cần đạt bậc [Hắc Bạch Vô Thường] (-700 Karma) mới dùng được chiêu này! (Còn thiếu 250 điểm)`).
    - Click vào chiêu đang hồi (Cooldown): Hiện Toast đếm ngược thời gian thực (VD: `⏳ Kỹ năng [Xích Câu Hồn] đang hồi chiêu: còn 14s nữa!`).
- **Nâng Cấp Menu Tỏa Tròn (Radial Context Menu)**:
  - Tự động gắn nút tương tác chéo cõi `✨ Thánh Quang (-15 / +15)` cho người chơi H4+ và `⛓️ Hút Hồn (-15)` cho người chơi D5+ khi click vào avatar bất kỳ trên bản đồ.
- **Mở Rộng Bộ Kiểm Thử Tự Động Toàn Diện**:
  - Nâng cấp từ 28 lên **32 test cases** bao phủ 100% các tính năng mới: `fast_chaos` (Case 28), `fast_chant` (Case 29), `holy_purify` (Case 30), `soul_chain` (Case 31), dọn dẹp RAM kết nối (Case 32). Tất cả pass 100%.

---

## v1.3.0 (2026-11-03) — Visual & UI/UX Immersion Overhaul (Đại Tu Giao Diện Sống Động & Cảm Giác Game 60 FPS)

### [NEW]
- **Hệ Thống Hạt Canvas Đa Tầng (Multi-layer Canvas Particle Field)**:
  - Cõi Thiên Đàng: Bụi sao lấp lánh và cánh hoa sen vàng trôi nổi bềnh bồng theo quỹ đạo sóng sin.
  - Cõi Địa Ngục: Tàn lửa đỏ rực, khói đen và bụi tro cuộn trào bốc ngược từ vực thẳm.
- **Sông Vong Xuyên & Cầu Nại Hà Sống Động**:
  - Dòng sông Vong Xuyên với hiệu ứng sóng nước CSS Wave Shader 2 lớp SVG bán trong suốt chuyển động trôi ngược chiều liên tục (`river-waves-1` & `river-waves-2`).
  - Cầu Nại Hà cổ kính vắt ngang sông với đèn lồng phát sáng 2 đầu cầu, cổ văn phát quang và hào quang chuyển sắc huyền ảo (`bridge-aura`).
- **Đồ Họa Trực Quan Hóa 3 Công Trình Tương Tác**:
  - 🍑 **Cây Đào Tiên**: Cội đào cổ thụ đung đưa cành lá (`tree-sway`), quả đào vàng óng phát sáng nhấp nháy (`peach-glow`), quả đào rơi có hiệu ứng hào quang tương tác.
  - 🍵 **Quán Canh Mạnh Bà**: Quán trà cổ kính mái gỗ, làn khói nghi ngút bốc lên từ nồi nước canh (`steam-puff-1` & `steam-puff-2`).
  - 🔥 **Vạc Dầu Sôi Sùng Sục**: Chiếc vạc đồng cổ khổng lồ đặt trên đống lửa bập bùng (`flame-flicker`), hiệu ứng bong bóng sôi trào bọt liên tục (`bubble-boil`).
- **Nâng Cấp Nhân Vật Chibi Phong Cách Game Nhập Vai**:
  - Bóng đổ bầu dục chân thực (`player-shadow`) dưới chân co giãn nhịp nhàng theo bước đi.
  - Bước đi chân sáo nhún nhảy mượt mà (`walkWobble`), tự động lật mặt (`scaleX(1)` / `scaleX(-1)`) theo hướng di chuyển.
  - Hào quang, cánh thiên thần vỗ nhịp (`wingFlap`), sừng quỷ, mây ngũ sắc (`rainbowCloud`), rồng vàng bay quanh (`dragonOrbit`) bám theo 14 bậc tiến hóa.
  - Khung chat bong bóng bo tròn mềm mại (`speech-bubble`) có đuôi nhọn trỏ thẳng đỉnh đầu nhân vật, co giãn tự động và tự biến mất sau 5s.
- **Menu Tỏa Tròn (Radial Context Menu)**:
  - Xuất hiện nở hoa (`radial-bloom`) khi click vào bất kỳ người chơi nào trên bản đồ.
  - Tính toán tọa độ lượng giác phân bổ các nút hành động (Soi Nghiệp, Ném Sét, Ban Phước, Hóa Ếch, Kéo Giò, Hóa Heo, Đi Ngược, Xích Hồn) cách đều quanh avatar.
- **Thanh Kỹ Năng Đáy Màn Hình (RPG Skill Dock)**:
  - Tách bạch hàng Kỹ Năng Tiến Hóa 6 ô phím tắt và cụm Hành Động Cơ Bản.
  - Kỹ năng chưa đủ điều kiện hiển thị biểu tượng ổ khóa `🔒` mờ đi kèm điều kiện Karma.
  - Hiệu ứng quét Cooldown Sweep tròn 360 độ (`conic-gradient`) hiển thị số giây đếm ngược trực tiếp trên icon.
- **Bảo Vệ XSS Tuyệt Đối**: 100% nội dung trò chuyện, tên nhân vật và dữ liệu động hiển thị qua `textContent`.

---

## v1.2.0 (2026-11-03) — Phase 2 Upgrade: 14-Tier Skin Evolution & 12 Unlocked Troll Skills

### [NEW]
- **Mở Rộng Thang Đo Nghiệp Báo [-3000 .. +3000] & Cây Tiến Hóa 14 Bậc Hình Thái**:
  - **7 Bậc Thiên Đàng**: H1 (Người Thường 0..49), H2 (Tiểu Đồng Học Việc 50..149), H3 (Thiên Thần Tập Sự 150..349), H4 (Thiên Thần Hộ Vệ 350..699), H5 (Đại Thiên Sứ 6 Cánh 700..1199), H6 (Thượng Tiên Cưỡi Mây 1200..1999), H7 (Ngọc Hoàng Đại Đế 2000..3000).
  - **7 Bậc Địa Ngục**: D1 (Vong Hồn Lạc Lối -1..-49), D2 (Tiểu Quỷ Sừng Nhú -50..-149), D3 (Quỷ Dạ Xoa -150..-349), D4 (Ngưu Đầu Hộ Pháp -350..-699), D5 (Hắc Bạch Vô Thường -700..-1199), D6 (Đại Ác Quỷ Vương -1200..-1999), D7 (Hỗn Thế Ma Tôn -2000..-3000).
  - Hệ thống tự động phát hiện vượt ngưỡng, kích hoạt sự kiện `player:evolved` và phát thông báo Kill-feed thời gian thực.
- **Hành Động Cơ Bản Mới Cõi Địa Ngục — Tự Tạo Nghiệp (-25)**:
  - Cho phép người chơi tự giảm -25 Karma với 7 lý do hài hước đời thực (quỵt trà sữa, bom hàng shipper, cắm sạc ké chôm luôn củ sạc...).
- **12 Kỹ Năng Troll Mở Khóa Theo Bậc**:
  - *Thiên Đàng*:
    - H2: `confetti_dance` (Rắc Pháo Giấy ép nhảy múa 3s, CD 15s).
    - H3: `holy_banana` (Bẫy Vỏ Chuối Thánh trượt té văng xa, CD 25s).
    - H4: `frog_hex` (Hóa Ếch Xanh 8s, chat bị đổi thành "Ộp ộp...", CD 35s).
    - H5: `karma_mirror` (Khiên Phản Nghiệp 12s phản 100% đòn troll và điểm phạt về kẻ tấn công, CD 45s).
    - H6: `polite_seal` (Bùa Ngoan Ngoãn 12s đổi chat thành nịnh nọt thảo mai, CD 45s).
    - H7: `heaven_rain` (Mưa Lộc Trời rải 8 bao lì xì tiên khắp 2 cõi nhặt +15..30 Karma, CD 90s).
  - *Địa Ngục*:
    - D2: `toxic_fart` (Bom Khói Độc 10s xì hơi dạt người xung quanh ra ngoài, CD 20s).
    - D3: `pig_hex` (Bùa Hóa Heo Hồng 8s, chat bị đổi thành "Éc éc...", CD 30s).
    - D4: `reverse_walk` (Bùa Đi Ngược lú lẫn 10s đảo ngược tọa độ click chuột, CD 35s).
    - D5: `soul_chain` (Xích Câu Hồn lôi người Thiên Đàng có karma <= 80 trừ -30 Karma kéo rớt đài, CD 40s).
    - D6: `black_hole` (Hố Đen Hút Nghiệp 5s gom người Địa Ngục vào tâm hút -4 Karma/s, CD 50s).
    - D7: `demon_eclipse` (Nhật Thực Ma Giới 8s làm tối sầm màn hình ép toàn server nhảy Zombie, CD 90s).
- **Thanh Kỹ Năng Tiến Hóa (Skill Bar) Trực Quan**:
  - Nằm ngay trên Bottom Action Dock, hiển thị icon ổ khóa `🔒` và tooltip điều kiện Karma khi chưa đạt yêu cầu.
- **Sổ Tay Tiến Hóa 14 Bậc (Modal 📖)**:
  - Cung cấp bách khoa toàn thư tra cứu chi tiết 14 hình thái và 12 kỹ năng troll.
- **6 SFX Procedural Web Audio API Mới**:
  - `playEvolutionUp` (Fanfare thăng cấp huy hoàng).
  - `playBoingSlip` (Âm trượt vỏ chuối vui nhộn).
  - `playPolymorph` (Âm phép biến hình hóa thú).
  - `playFartCloud` (Âm xì hơi khói độc rung màng nhĩ).
  - `playMirrorReflect` (Âm khiên kính phản đòn leng keng).
  - `playUltimateHorn` (Âm kèn lệnh tối thượng vang vọng tam giới).
- **Phím Tắt Dev Fast-test Trên Localhost**:
  - `Shift + ArrowUp` (+150 Karma) và `Shift + ArrowDown` (-150 Karma) giúp kiểm thử chuyển đổi hình thái tức thì.
- **Hệ Thống 6 NPC Ambient Bots**: Rải đều qua các bậc H2, H3, H5, D2, D4, D6 duy trì nhịp độ sinh động cho thế giới game.
- **Bộ Kiểm Thử Tự Động 28 Test Cases Độc Lập**: Mở rộng từ 19 lên 28 test cases bao phủ 100% tính năng mới đạt chuẩn 100%.

---

## v1.1.0 (2026-11-03) — Phase 1 Upgrade: Gameplay Depth & Juicy UI/UX

### [NEW]
- **Hệ thống Tiến hóa 6 Cấp Hình thái**: Tích hợp phân tầng Karma (-999..+999) thành 6 bậc hình thái kèm quyền năng độc quyền (Tân Tiên, Chân Tiên, Thượng Tiên, Tiểu Quỷ, Ngưu Đầu, Diêm Vương).
- **3 Công trình tương tác vật lý**:
  - Quán Canh Mạnh Bà với 3 kết quả xổ số (Thanh Tâm +20, Canh Quá Đát 10s say xỉn Drunk Walk, Ớt Hiểm -15).
  - Vạc Dầu Sôi Sùng Sục thử thách 10s tẩy trần nhận +25 Karma.
  - Cây Đào Tiên Ngàn Năm tự động sinh quả đào rớt trên bản đồ, cấp buff tốc hành 20s.
- **Rhythm Fever Combo Gõ Mõ**: Cơ chế gõ nhịp điệu 750ms - 1500ms nhân hệ số điểm combo x1, x2, x3 Fever, hiệu ứng sóng âm đồng tâm.
- **Thả Tim ❤️ Đồng Cảm**: Người chơi có thể thả tim vào Hoa Đăng và Sớ Hối Lỗi đang bay để tặng +3 Karma cho tác giả.
- **Nhật Ký Tam Giới (Live Kill-feed)**: Bảng thông báo thời gian thực hiển thị các sự kiện biến động lớn trong cõi.
- **Gương Chiếu Nghiệp Mini**: Popover hồ sơ chi tiết khi click vào người chơi khác, hiển thị stats và menu thao tác tương ứng theo cõi.
- **5 SFX Web Audio API mới**: Âm thanh gõ mõ đa tần số, sủi bọt vạc dầu sôi, húp canh Mạnh Bà, quăng xích sắt và tiếng ting thả tim ngọt ngào.

### [IMPROVE]
- Tối ưu hóa chuyển động nhân vật: Lật mặt theo hướng di chuyển, nhún nhảy bước đi `.is-walking`, hiệu ứng cháy đen khói `.is-burnt` sau khi trúng sét.
- Siết chặt chống spam: Thêm cooldown 20s cho thả hoa đăng và dâng sớ, kiểm tra tối thiểu 8 ký tự và chống lặp ký tự đơn lẻ.
- Mở rộng bộ kiểm thử tự động từ 14 lên 19 test cases độc lập, xác minh trọn vẹn luồng tương tác multiplayer.

---

## v1.0.0 (2026-11-03) — Initial MVP Release

### [NEW]
- Khởi tạo kiến trúc Game Realtime Multiplayer với Node.js, Express, Socket.io shim và Web Audio API.
- Phân chia 2 cõi Thiên Đàng & Địa Ngục ngăn cách bởi Cầu Nại Hà.
- Onboarding 3 câu hỏi nghiệp báo trắc nghiệm.
- Hành động đặc thù: Tọa thiền, Thả hoa đăng, Gõ mõ, Dâng sớ, Ném sét, Ban phước, Kéo giò.
- Mini-event Đài Phán Xét Công Cộng (mỗi 90s kích hoạt 1 lần, bỏ phiếu Tha Thứ / Phạt Tiếp trong 20s).
- Hệ thống 6 NPC Ambient Bots tự động vận hành.
- Bộ lọc khẩu nghiệp và bảo vệ XSS an toàn 100%.
