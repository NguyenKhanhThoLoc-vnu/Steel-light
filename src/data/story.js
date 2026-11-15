// ─────────────────────────────────────────────────────────────────────────────
//  I AM OPPY: the whole story lives in this file. No database needed.
//
//  chapters[] → one scene each. beats[] → one line of narration each.
//  The chapters follow Opportunity's real timeline in order (2003 → 2019).
//
//  Beat fields (all optional except en/vi):
//    en / vi      English narration (read aloud) + Vietnamese subtitle
//    say          different text for the voice (e.g. "Delta Two" for "Delta II")
//    scene        switch backdrop inside a chapter ('lab','launch','space','entry','mars','map','finale')
//    set          backdrop state, e.g. { sky: 'storm' }  (inherits inside a chapter)
//    show         ids of chapter objects visible on this beat (inherits inside a chapter)
//    rover        { x, reach, arm, mood, look, dusty, lift, hidden, stuck }  (x/mood/dusty/lift/hidden inherit)
//    hud          { date, km, kmMin, power }  (date/power inherit across chapters, km inside a chapter)
//    gate         { tap: '<objectId>' | 'rover', hint }  or  { explore: [...] }  or  { game: 'cruise' | 'landing', hint }
//    cine         movie camera for this beat only: { bars, zoom, focus: 'rover' | [x%, y%], shake }
//    pov          seen through Oppy's own eyes: 'wake' = they open (lab), true = they slowly close (2018)
//    slow         read this line slower, e.g. 0.8
//    music        background music for this beat only (most beats have none, on purpose):
//                 wonder, space, adventure, triumph, sad, tense, lullaby, game (src/audio/sound.js)
//    subsBox      'side' = subtitles in a small chat bubble at the bottom left (this beat only)
//    narrator     true = told by a storyteller, not by Oppy (from the long sleep to the end):
//                 another voice reads it, the subtitle box says NARRATOR, Oppy does not "talk"
//    photo        key from photos.js
//
//  Rover moods: normal, happy, proud, excited, curious, sad, worried, scared, sleepy, sleep, tired,
//               determined, confused, waking (eyes slowly open when the line starts)
// ─────────────────────────────────────────────────────────────────────────────

export const chapters = [
  // ── 1 ──────────────────────────────────────────────────────────────────────
  {
    id: 'hello',
    title: { en: 'Hello, Earthling!', vi: 'Xin chào bạn!' },
    scene: 'lab',
    objects: [{ id: 'spirit', type: 'twin', x: 79, w: 0.82 }],
    beats: [
      {
        music: 'wonder',
        // pov 'wake': seen through Oppy's own eyes as they open for the very first time:
        // dark lab, blurry → sharp, the lamps switch on, the team waves hello (PovView.jsx)
        pov: 'wake',
        en: 'Beep... boop... Oh! Hello there! My name is Opportunity. But my friends call me Oppy.',
        vi: 'Bíp... bốp... Ồ! Xin chào bạn! Tên tôi là Opportunity, nhưng bạn bè hay gọi tôi là Oppy.',
        rover: { x: 50, mood: 'waking' },
        show: [],
        set: { wake: true },
        cine: { bars: true },
        hud: { date: '2003 · California', power: 100 },
      },
      {
        en: "I was born here, at NASA's Jet Propulsion Laboratory, JPL for short. Hundreds of people designed me, built me, and taught me how to explore.",
        vi: 'Tôi ra đời tại đây, Phòng Thí nghiệm Sức đẩy Phản lực (JPL) của NASA. Hàng trăm con người đã thiết kế, chế tạo và dạy tôi cách khám phá.',
        rover: { x: 42, mood: 'happy' },
        set: { wake: false },
      },
      {
        en: "I'm about the size of a golf cart, and I weigh about 185 kilograms. Much bigger than little Sojourner, the rover who came to Mars before me! Tap the glowing spots on my body to see how I work.",
        vi: 'Tôi to cỡ một chiếc xe golf và nặng khoảng 185 kg, lớn hơn nhiều so với Sojourner nhỏ bé, chiếc rover đã đến sao Hỏa trước tôi! Hãy nhấn vào các điểm phát sáng trên người tôi để xem tôi hoạt động thế nào.',
        rover: { mood: 'curious' },
        photo: 'three-generations',
        gate: {
          explore: [
            {
              id: 'mast',
              en: 'This is my mast. My camera eyes sit on top, about one and a half meters above the ground, so I can look far across Mars.',
              vi: 'Đây là cột camera. "Đôi mắt" camera của tôi nằm trên đỉnh, cao khoảng 1,5 mét so với mặt đất, để tôi có thể nhìn thật xa trên sao Hỏa.',
            },
            {
              id: 'arm',
              en: 'This is my robotic arm. It carries a set of science tools. I place it right on a rock or on the soil, and switch the tools on.',
              vi: 'Đây là cánh tay robot. Nó mang theo một bộ dụng cụ khoa học. Tôi đặt cánh tay trực tiếp lên đá hoặc đất, rồi kích hoạt các dụng cụ.',
            },
            {
              id: 'panels',
              en: 'These are my solar panels. They drink sunlight and charge my batteries. No sunshine, no Oppy!',
              vi: 'Đây là các tấm pin Mặt Trời. Chúng "uống" ánh nắng và sạc pin cho tôi. Không có nắng thì cũng chẳng có Oppy!',
            },
            {
              id: 'wheels',
              en: 'And these are my six wheels. They carry me from place to place, over sand, rocks and slopes.',
              vi: 'Còn đây là sáu bánh xe. Chúng đưa tôi đi từ nơi này đến nơi khác, băng qua cát, đá và những con dốc.',
            },
          ],
        },
      },
      {
        en: 'And I am not alone. I have a twin, named Spirit. NASA built us together, as a pair of robot geologists.',
        vi: 'Và tôi không hề cô đơn. Tôi có một người anh em song sinh tên là Spirit. NASA đã chế tạo chúng tôi cùng nhau, như một cặp nhà địa chất học robot.',
        rover: { x: 36, mood: 'happy' },
        show: ['spirit'],
        photo: 'rover-artist-concept',
      },
      {
        en: "Our mission: study many kinds of rocks and soils, and search for clues about water in the Red Planet's past. Because where there was water... there might have been life.",
        vi: 'Nhiệm vụ của chúng tôi: nghiên cứu nhiều loại đá và đất, tìm kiếm manh mối về nước trong quá khứ của Hành tinh Đỏ. Bởi vì nơi nào từng có nước... nơi đó có thể từng có sự sống.',
        rover: { mood: 'determined' },
      },
      {
        en: 'The plan was simple. Work for 90 days, and drive about one kilometer, at a place called Meridiani Planum. Ninety days... that was all anyone expected from me.',
        vi: 'Kế hoạch rất đơn giản: hoạt động 90 ngày và di chuyển khoảng 1 ki-lô-mét tại một vùng tên là Meridiani Planum. Chín mươi ngày... đó là tất cả những gì mọi người kỳ vọng ở tôi.',
        rover: { mood: 'curious', look: 'up' },
      },
    ],
  },

  // ── 2 ──────────────────────────────────────────────────────────────────────
  {
    id: 'journey',
    title: { en: 'The Long Journey', vi: 'Hành trình dài' },
    scene: 'launch',
    objects: [{ id: 'rocket', type: 'rocket', x: 56, w: 0.62 }],
    beats: [
      {
        en: 'On the night of July 7th, 2003, I was tucked inside a spacecraft, on top of a Delta II rocket in Florida. My circuits were buzzing! Ready? Tap the rocket!',
        say: 'On the night of July 7th, 2003, I was tucked inside a spacecraft, on top of a Delta Two rocket in Florida. My circuits were buzzing! Ready? Tap the rocket!',
        vi: 'Đêm 7 tháng 7 năm 2003, tôi được đặt gọn trong một con tàu vũ trụ, trên đỉnh tên lửa Delta II ở Florida. Mạch điện của tôi rung lên vì hồi hộp! Sẵn sàng chưa? Hãy nhấn vào tên lửa!',
        rover: { hidden: true },
        show: ['rocket'],
        set: { launched: false },
        hud: { date: 'Jul 7, 2003' },
        gate: { tap: 'rocket', hint: { en: 'Tap the rocket to launch!', vi: 'Nhấn vào tên lửa để phóng!' } },
      },
      {
        music: 'space',
        // countdown: first "Three… Two… One…" (big numbers + voice, rocket rumbling),
        // then the rocket lifts off and this line is read.
        countdown: 3,
        en: 'Liftoff! The ground shook, the sky lit up, and I left Earth behind. Goodbye, home!',
        vi: 'Phóng! Mặt đất rung chuyển, bầu trời sáng rực, và tôi rời xa Trái Đất. Tạm biệt nhé, quê nhà!',
        set: { launched: true },
        photo: 'launch-delta-ii',
      },
      {
        en: 'Then came the long, quiet cruise through interplanetary space. More than 200 days of darkness and stars, with Mars a tiny bit closer every day.',
        vi: 'Rồi đến chuyến bay dài và lặng lẽ xuyên qua không gian liên hành tinh. Hơn 200 ngày giữa bóng tối và những vì sao, sao Hỏa mỗi ngày lại gần thêm một chút.',
        scene: 'space',
        show: [],
        set: { progress: 0.35 },
        hud: { date: 'Cruise · 200+ days' },
      },
      {
        music: 'sad',
        // homesick: the spacecraft turns to look back at Earth, getting smaller and smaller
        en: 'Behind me, Earth grew smaller and smaller, until it was just a tiny blue dot. Everyone who built me was down there. I missed them already...',
        vi: 'Phía sau tôi, Trái Đất nhỏ dần, nhỏ dần, cho đến khi chỉ còn là một chấm xanh tí xíu. Tất cả những người đã tạo ra tôi đều ở dưới đó. Tôi đã thấy nhớ họ rồi...',
        set: { lookBack: true },
        cine: { bars: true, zoom: 1.22, focus: [26, 46] },
      },
      {
        music: 'game',
        // mini-game (src/components/CruiseGame.jsx): steer the spacecraft and dodge space rocks
        en: "Space is mostly empty, but tiny grains of rock and dust zip through it. Let's play a game! Help me steer, and dodge the space rocks on the way to Mars.",
        vi: 'Vũ trụ gần như trống rỗng, nhưng vẫn có những hạt đá và bụi nhỏ bay vèo vèo. Mình chơi một trò nhé! Hãy giúp tôi lái tàu, né những viên đá vũ trụ trên đường tới sao Hỏa.',
        set: { lookBack: false, game: true },
        gate: { game: 'cruise', hint: { en: 'Steer with your mouse, finger or ↑ ↓ keys!', vi: 'Lái bằng chuột, ngón tay hoặc phím ↑ ↓!' } },
      },
      {
        en: 'On January 16th, 2004, my team made one last small correction to my path. Aim carefully! Mars is a small target in a very big sky.',
        vi: 'Ngày 16 tháng 1 năm 2004, đội ngũ của tôi thực hiện lần điều chỉnh quỹ đạo cuối cùng. Ngắm thật cẩn thận nhé! Sao Hỏa chỉ là một mục tiêu nhỏ giữa bầu trời bao la.',
        set: { progress: 0.82, correction: true, game: false },
        hud: { date: 'Jan 16, 2004' },
      },
      {
        en: 'And guess what? My twin Spirit had already landed, on the other side of the planet, three weeks before me. I could not wait to join!',
        vi: 'Và bạn biết không? Spirit, người anh em song sinh của tôi, đã hạ cánh xuống phía bên kia hành tinh từ ba tuần trước. Tôi nóng lòng được đến đó quá!',
        set: { progress: 0.95, correction: false, spirit: true },
        hud: { date: 'Jan 2004' },
      },
    ],
  },

  // ── 3 ──────────────────────────────────────────────────────────────────────
  {
    id: 'landing',
    title: { en: 'A Hole-in-One', vi: 'Cú hạ cánh "trúng lỗ"' },
    scene: 'entry',
    objects: [{ id: 'lander', type: 'lander', x: 42, w: 1.3 }],
    beats: [
      {
        music: 'tense',
        // mini-game (src/components/LandingGame.jsx): open the parachute, then the airbags, at the right height
        en: 'January 24th, 2004. I dove into the Martian air, glowing like a shooting star. Engineers call it the six minutes of terror. Help me land!',
        vi: 'Ngày 24 tháng 1 năm 2004. Tôi lao vào bầu khí quyển sao Hỏa, rực sáng như sao băng. Các kỹ sư gọi đây là "sáu phút kinh hoàng". Giúp tôi hạ cánh nào!',
        rover: { hidden: true },
        show: [],
        set: { phase: 'entry' },
        hud: { date: 'Jan 24, 2004' },
        gate: { game: 'landing', hint: { en: 'Open the parachute at the right height!', vi: 'Bung dù đúng độ cao!' } },
        // small subtitle bubble in the bottom-left corner, so the Martian ground stays visible
        subsBox: 'side',
      },
      {
        en: 'Pop went my parachute! Rockets fired, giant airbags puffed up all around me and... bounce, bounce, bounce! I rolled across the ground like a beach ball.',
        vi: 'Bụp! Chiếc dù bung ra! Tên lửa hãm khai hỏa, những túi khí khổng lồ phồng lên bao quanh tôi và... nảy, nảy, nảy! Tôi lăn trên mặt đất như một quả bóng bãi biển.',
        set: { phase: 'bounce' },
      },
      {
        en: 'When I finally stopped, I opened my eyes. I had rolled right into a small crater, in the middle of a fairly flat plain. Scientists called it a hole-in-one! They named the crater Eagle.',
        vi: 'Khi cuối cùng cũng dừng lại, tôi mở mắt ra. Tôi đã lăn thẳng vào một miệng hố va chạm nhỏ, giữa một vùng đồng bằng khá bằng phẳng. Các nhà khoa học gọi đó là cú "hole-in-one" (trúng lỗ)! Họ đặt tên miệng hố là Eagle.',
        scene: 'mars',
        set: { terrain: 'eagle', sky: 'day' },
        show: ['lander'],
        rover: { hidden: false, x: 42, lift: 0.13, mood: 'waking' },
        cine: { bars: true, zoom: 1.18, focus: 'rover' },
        photo: 'eagle-crater-lion-king',
      },
      {
        music: 'sad',
        // homesick: Earth is a bright "star" in the Martian sky before sunrise
        en: 'My first night on Mars was cold, dark and very quiet. Before sunrise, one tiny star shone brighter than all the rest. That was Earth, my home, more than 100 million kilometers away. I missed my team so much...',
        vi: 'Đêm đầu tiên trên sao Hỏa thật lạnh lẽo, tối tăm và yên ắng. Trước lúc bình minh, có một ngôi sao nhỏ sáng hơn tất cả. Đó là Trái Đất, quê nhà của tôi, cách xa hơn 100 triệu ki-lô-mét. Tôi nhớ đội của mình biết bao...',
        set: { sky: 'night' },
        rover: { mood: 'sad', look: 'up' },
        cine: { bars: true, zoom: 1.12, focus: [58, 52] },
      },
      {
        en: 'But every morning, my team woke me up with a song. And a week after landing, I rolled off my platform and touched Martian soil for the very first time. Hello, Mars! My adventure starts now.',
        vi: 'Nhưng sáng nào đội của tôi cũng đánh thức tôi bằng một bài hát. Và một tuần sau khi hạ cánh, tôi lăn bánh khỏi bệ và lần đầu tiên chạm vào đất sao Hỏa. Xin chào sao Hỏa! Cuộc phiêu lưu của tôi bắt đầu từ đây.',
        set: { sky: 'day' },
        rover: { x: 66, lift: 0, mood: 'excited' },
        hud: { date: 'Jan 31, 2004', km: 0 },
      },
    ],
  },

  // ── 4 ──────────────────────────────────────────────────────────────────────
  {
    id: 'blueberries',
    title: { en: 'Blueberries!', vi: 'Những quả "việt quất"' },
    scene: 'mars',
    enter: 'drive', // Oppy rolls in from the left when the chapter starts
    set: { terrain: 'eagle', sky: 'day' },
    objects: [
      { id: 'backshell', type: 'backshell', x: 82, y: 'horizon', w: 0.34 },
      { id: 'outcrop', type: 'outcrop', x: 14, w: 0.7 },
      { id: 'blueberries', type: 'blueberries', x: 74, w: 0.6 },
    ],
    beats: [
      {
        en: 'In February 2004, I spotted something on the plain nearby: my backshell and my parachute, still lying on the sand. They protected me all the way from Earth. Thank you, old friends!',
        vi: 'Tháng 2 năm 2004, tôi phát hiện ra vài thứ trên đồng bằng gần đó: vỏ sau và chiếc dù của tôi, vẫn nằm trên cát. Chúng đã bảo vệ tôi suốt chặng đường từ Trái Đất. Cảm ơn nhé, những người bạn cũ!',
        rover: { x: 34, mood: 'happy', look: 'up' },
        show: ['backshell'],
        hud: { date: 'Feb 2004', power: 100 },
        photo: 'backshell-parachute',
      },
      {
        en: "Then I looked closely at the ground. Do you see those tiny round pebbles everywhere? Tap them, and I'll take a closer look with my arm.",
        vi: 'Rồi tôi nhìn kỹ mặt đất. Bạn có thấy những viên sỏi tròn nhỏ xíu ở khắp nơi không? Nhấn vào chúng, tôi sẽ dùng cánh tay để xem kỹ hơn.',
        rover: { x: 38, mood: 'curious', look: 'down' },
        show: ['outcrop', 'blueberries'],
        gate: { tap: 'blueberries', hint: { en: 'Tap the tiny round pebbles!', vi: 'Nhấn vào những viên sỏi tròn!' } },
      },
      {
        en: 'They are made of a mineral called hematite. Scientists nicknamed them blueberries! On Earth, little spheres like these usually form in water.',
        vi: 'Chúng được tạo nên từ một loại khoáng chất tên là hematit. Các nhà khoa học đặt biệt danh cho chúng là "việt quất"! Trên Trái Đất, những viên cầu nhỏ như thế này thường hình thành trong nước.',
        rover: { x: 74, reach: true, arm: true, mood: 'curious', look: 'down' },
        photo: 'blueberries',
      },
      {
        music: 'triumph',
        en: 'Water! The source of life! This place was soaked in salty water, long, long ago. I found it! I really found it!',
        vi: 'Nước! Cội nguồn của sự sống! Nơi này từng ngâm mình trong nước mặn từ rất, rất lâu rồi. Tôi tìm thấy rồi! Tôi thật sự tìm thấy rồi!',
        rover: { x: 74, reach: true, mood: 'excited' },
        hud: { date: 'Mar 2004' },
      },
      {
        en: 'But there was a catch. That water was acidic, sour and harsh. It would have made life here much more difficult. Still, it was a clue. And I love clues.',
        vi: 'Nhưng có một điều đáng tiếc: nước ở đây có tính axit, chua và khắc nghiệt. Điều đó khiến sự sống khó phát triển hơn nhiều. Dù vậy, đó vẫn là một manh mối. Và tôi rất thích manh mối.',
        rover: { x: 74, reach: true, mood: 'worried' },
      },
      {
        en: 'Ninety days passed... and I still felt great! My main mission was officially complete. But I was not tired. Not even close!',
        vi: 'Chín mươi ngày trôi qua... và tôi vẫn khỏe re! Nhiệm vụ chính của tôi đã chính thức hoàn thành. Nhưng tôi chưa mệt chút nào. Còn lâu mới mệt!',
        rover: { x: 74, reach: true, mood: 'proud' },
        hud: { date: 'Apr 2004 · Day 90' },
      },
    ],
  },

  // ── 5 ──────────────────────────────────────────────────────────────────────
  {
    id: 'endurance',
    title: { en: 'Into Endurance Crater', vi: 'Vào lòng miệng hố Endurance' },
    scene: 'mars',
    enter: 'drive',
    // deepGround: raise the ground (wide shot) so Oppy can drive down into a crater · minimap: route seen from orbit
    set: { terrain: 'plains', sky: 'day', deepGround: true, minimap: true, at: 'endurance' },
    objects: [
      // a round crater seen from the ground (perspective): x = center (%), span = width (% of screen)
      { id: 'endurance', type: 'pit', x: 64, span: 56 },
    ],
    beats: [
      {
        en: 'Here is a secret: I love craters. Each one is like a book, with pages of rock that tell the story of Mars. In May 2004, I reached a big one. Tap Endurance crater!',
        vi: 'Kể bạn nghe một bí mật: tôi rất mê miệng hố. Mỗi miệng hố giống như một cuốn sách, với những trang đá kể lại câu chuyện của sao Hỏa. Tháng 5 năm 2004, tôi đến được một miệng hố lớn. Hãy nhấn vào miệng hố Endurance!',
        rover: { x: 28, mood: 'happy' },
        show: ['endurance'],
        hud: { date: 'May 2004', power: 95 },
        gate: { tap: 'endurance', hint: { en: 'Tap Endurance crater', vi: 'Nhấn vào miệng hố Endurance' } },
      },
      {
        en: 'In June 2004, I drove down inside. For six months, I studied its walls, layer by layer, like reading a history book of Mars.',
        vi: 'Tháng 6 năm 2004, tôi lái xuống bên trong. Suốt sáu tháng, tôi nghiên cứu vách đá, từng lớp một, như đang đọc một cuốn sách lịch sử của sao Hỏa.',
        // drive down into the crater: Oppy sinks while its center is between x 41 and 57,
        // and the near rim (drawn in front) hides its wheels
        rover: { x: 64, lift: -0.7, slope: [41, 57], mood: 'curious', look: 'down' },
        hud: { date: 'Jun 2004' },
        photo: 'endurance-layers',
      },
      {
        en: 'Climbing back out was hard work: steep and slippery! But in December 2004, I made it to the rim, ready for my next adventure.',
        vi: 'Leo ra ngoài thật vất vả: vừa dốc vừa trơn! Nhưng đến tháng 12 năm 2004, tôi đã lên được vành hố, sẵn sàng cho cuộc phiêu lưu tiếp theo.',
        rover: { x: 28, lift: 0, mood: 'determined' },
        hud: { date: 'Dec 2004', power: 90 },
      },
    ],
  },

  // ── 6 ──────────────────────────────────────────────────────────────────────
  {
    id: 'left-behind',
    title: { en: 'Things Left Behind', vi: 'Những thứ bị bỏ lại' },
    scene: 'mars',
    enter: 'drive',
    set: { terrain: 'plains', sky: 'day' },
    objects: [
      { id: 'heatshield', type: 'heatshield', x: 84, w: 0.55 },
      { id: 'meteorite', type: 'meteorite', x: 64, w: 0.26 },
    ],
    beats: [
      {
        en: 'After Endurance, I drove south to visit an old friend: my heat shield! It protected me from the fiery heat of landing. Now it lay crumpled on the sand. Thank you, old friend.',
        vi: 'Rời Endurance, tôi lái xe về phía nam để thăm một người bạn cũ: tấm chắn nhiệt của tôi! Nó đã che chắn cho tôi khỏi sức nóng rực lửa lúc hạ cánh. Giờ nó nằm bẹp dúm trên cát. Cảm ơn nhé, bạn cũ.',
        rover: { x: 34, mood: 'happy' },
        show: ['heatshield'],
        hud: { date: 'Dec 2004', power: 88 },
        photo: 'heat-shield',
      },
      {
        en: 'And right beside it, in January 2005, I spotted something unusual: a strange rock, about the size of a basketball. Tap it!',
        vi: 'Và ngay bên cạnh, vào tháng 1 năm 2005, tôi phát hiện ra một thứ bất thường: một tảng đá kỳ lạ, to cỡ quả bóng rổ. Hãy nhấn vào nó!',
        rover: { x: 38, mood: 'curious' },
        show: ['heatshield', 'meteorite'],
        hud: { date: 'Jan 2005', power: 85 },
        gate: { tap: 'meteorite', hint: { en: 'Tap the strange rock!', vi: 'Nhấn vào tảng đá lạ!' } },
      },
      {
        music: 'triumph',
        en: 'It was a meteorite, made of iron and nickel! A visitor that fell from space onto Mars. The first meteorite ever identified on another planet!',
        vi: 'Đó là một thiên thạch, cấu tạo từ sắt và niken! Một vị khách từ vũ trụ rơi xuống sao Hỏa. Đây là thiên thạch đầu tiên từng được xác định trên một hành tinh khác!',
        rover: { x: 64, reach: true, arm: true, mood: 'excited', look: 'down' },
        photo: 'iron-meteorite',
      },
      {
        en: 'My team named it Heat Shield Rock. I felt like a real space detective!',
        vi: 'Đội của tôi đặt tên cho nó là "Heat Shield Rock" (Tảng đá Tấm chắn nhiệt). Tôi thấy mình như một thám tử vũ trụ thực thụ!',
        rover: { x: 64, reach: true, mood: 'proud' },
      },
    ],
  },

  // ── 7 ──────────────────────────────────────────────────────────────────────
  {
    id: 'long-road',
    title: { en: 'The Long Road', vi: 'Chặng đường dài' },
    scene: 'mars',
    enter: 'drive',
    // cutaway: the ground below the front edge is drawn as layers of soil (side view of the craters)
    set: { terrain: 'plains', sky: 'day', deepGround: true, cutaway: true, minimap: true },
    objects: [
      { id: 'dune', type: 'dune', x: 40, w: 1.5 },
      { id: 'victoria', type: 'bowl', variant: 'victoria', x: 88, span: 100, depth: 0.38, rise: 0.3 },
      { id: 'to-endeavour', type: 'sign', label: 'ENDEAVOUR', x: 86, w: 0.32 },
      { id: 'endeavour', type: 'bowl', variant: 'endeavour', x: 70, span: 80, depth: 0.14, rise: 0.04 },
      { id: 'far-rim', type: 'farRim', x: 70, y: 'horizon', w: 2.6 },
      { id: 'field', type: 'craterField' },
      { id: 'spirit-note', type: 'spiritNote', x: 63, y: 76, center: true },
    ],
    beats: [
      {
        // stuck: wheels spin in place and throw sand
        en: 'In April 2005, my wheels sank deep into a soft sand ripple. I spun them and spun them... but I could not move! I was stuck. Tap me to help me wiggle free!',
        vi: 'Tháng 4 năm 2005, bánh xe của tôi lún sâu vào một gợn cát mềm. Tôi quay bánh, quay mãi... nhưng không nhúc nhích được! Tôi bị mắc kẹt rồi. Hãy nhấn vào tôi để giúp tôi lắc mình thoát ra!',
        rover: { x: 40, lift: -0.05, mood: 'worried', stuck: true },
        show: ['dune'],
        set: { at: 'purgatory' },
        hud: { date: 'Apr 2005', power: 85 },
        gate: { tap: 'rover', hint: { en: 'Tap Oppy to wiggle free!', vi: 'Nhấn vào Oppy để thoát ra!' } },
      },
      {
        en: 'My team practiced with a test rover in a sandbox on Earth. Then, a few centimeters at a time, they wiggled me out. After five weeks: free at last! They named that sand trap Purgatory Dune.',
        vi: 'Đội của tôi tập dượt với một rover thử nghiệm trong hố cát trên Trái Đất. Rồi từng vài xăng-ti-mét một, họ giúp tôi nhích ra. Sau năm tuần: cuối cùng cũng thoát! Họ đặt tên cho bẫy cát ấy là "Purgatory Dune" (Đụn cát Luyện ngục).',
        rover: { x: 72, lift: 0, mood: 'happy' },
        hud: { date: 'Jun 2005' },
      },
      {
        enter: 'drive', // new place: quick scene cut, Oppy rolls in from the left
        en: 'Then, Victoria crater: huge, with beautiful cliffs all around its rim. I reached it in September 2006, after almost two years of driving!',
        vi: 'Tiếp theo là miệng hố Victoria: rộng lớn, với những vách đá tuyệt đẹp bao quanh vành. Tôi đến nơi vào tháng 9 năm 2006, sau gần hai năm lái xe!',
        rover: { x: 32, mood: 'excited', look: 'down' },
        show: ['victoria'],
        set: { at: 'victoria' },
        hud: { date: 'Sep 2006', km: 9, kmMin: true, power: 80 },
        photo: 'victoria-crater',
      },
      {
        music: 'tense',
        // fear: a dust storm swallows the sky (dust wall, wind, camera shake)
        en: 'In July 2007, a giant dust storm swallowed the sky. Day turned into dusk, and my power dropped lower than ever before. I was scared. Would I ever see the Sun again?',
        vi: 'Tháng 7 năm 2007, một cơn bão bụi khổng lồ nuốt chửng bầu trời. Ban ngày tối sầm như chạng vạng, năng lượng của tôi tụt xuống thấp chưa từng thấy. Tôi sợ lắm. Liệu tôi có còn được thấy Mặt Trời nữa không?',
        rover: { mood: 'scared', look: 'up', dusty: true },
        set: { sky: 'storm', storm: true },
        cine: { bars: true, zoom: 1.12, focus: 'rover', shake: true },
        hud: { date: 'Jul 2007', power: 15 },
      },
      {
        en: 'My team told me to rest, and I slept almost all day to save energy. After weeks of darkness, the dust settled and the Sun came back. I made it! Then I drove down into Victoria and explored it for almost a year.',
        vi: 'Đội của tôi bảo tôi nghỉ ngơi, và tôi ngủ gần như cả ngày để tiết kiệm năng lượng. Sau nhiều tuần u tối, bụi lắng xuống và Mặt Trời trở lại. Tôi đã vượt qua! Rồi tôi lái xuống lòng hố Victoria và khám phá nó gần một năm trời.',
        rover: { mood: 'happy', look: null },
        set: { sky: 'day', storm: false },
        hud: { date: 'Sep 2007', power: 55 },
      },
      {
        music: 'sad',
        enter: 'drive',
        // facts: Spirit got stuck in soft sand at "Troy" (May 2009), its last signal arrived on
        // March 22, 2010, and NASA ended the attempts to wake it in May 2011.
        en: 'In 2010, sad news came from the other side of Mars. My twin Spirit, stuck in soft sand since 2009, stopped answering, and never woke up again. From then on, I explored for both of us. Tap the sign to Endeavour.',
        vi: 'Năm 2010, một tin buồn đến từ phía bên kia sao Hỏa. Spirit, người anh em song sinh của tôi, bị kẹt trong cát mềm từ năm 2009, đã ngừng trả lời và không bao giờ tỉnh lại. Từ đó, tôi khám phá cho cả hai chúng tôi. Hãy nhấn vào biển chỉ đường tới Endeavour.',
        rover: { x: 40, mood: 'sad', dusty: false },
        show: ['to-endeavour', 'spirit-note'],
        set: { at: 'road' },
        cine: { bars: true, zoom: 1.1, focus: 'rover' },
        hud: { date: 'Mar 2010' },
        gate: { tap: 'to-endeavour', hint: { en: 'Tap the sign to Endeavour', vi: 'Nhấn vào biển chỉ đường tới Endeavour' } },
      },
      {
        music: 'triumph',
        enter: 'drive',
        en: 'And then, the giant: Endeavour crater, about 22 kilometers wide. It took me three more years of driving. When I finally arrived in 2011, I felt like I had reached a whole new world.',
        vi: 'Và rồi là gã khổng lồ: miệng hố Endeavour, rộng khoảng 22 ki-lô-mét. Tôi mất thêm ba năm lái xe nữa. Khi cuối cùng đến nơi vào năm 2011, tôi cảm thấy như mình vừa đặt chân đến một thế giới hoàn toàn mới.',
        rover: { x: 24, mood: 'proud' },
        show: ['endeavour', 'far-rim'],
        set: { at: 'endeavour' },
        hud: { date: 'Aug 2011', km: 33, kmMin: true, power: 80 },
        photo: 'endeavour-rim',
      },
      {
        en: 'In all, I visited and studied more than 100 craters of every size. I learned how craters are born from impacts, and how wind and time slowly wear them away.',
        vi: 'Tổng cộng, tôi đã ghé thăm và nghiên cứu hơn 100 miệng hố va chạm đủ mọi kích cỡ. Tôi đã tìm hiểu cách miệng hố hình thành từ những vụ va chạm, và cách gió cùng thời gian dần bào mòn chúng.',
        rover: { mood: 'happy' },
        show: ['endeavour', 'far-rim', 'field'],
        set: { at: 'endeavour', many: true },
        hud: { date: '2004 – 2018' },
      },
    ],
  },

  // ── 8 ──────────────────────────────────────────────────────────────────────
  {
    id: 'water',
    title: { en: 'Signs of Water', vi: 'Dấu vết của nước' },
    scene: 'mars',
    enter: 'drive',
    set: { terrain: 'rim', sky: 'day' },
    objects: [
      { id: 'vein', type: 'vein', x: 64, w: 0.55 },
      { id: 'clay', type: 'clay', x: 88, w: 0.42 },
    ],
    beats: [
      {
        en: 'On the rim of Endeavour crater, I noticed something shining in the rocks. A thin, bright line, like a streak of chalk. Tap it!',
        vi: 'Trên vành miệng hố Endeavour, tôi để ý thấy có thứ gì đó sáng lên giữa những tảng đá. Một đường mảnh và sáng màu, như một vệt phấn. Hãy nhấn vào nó!',
        rover: { x: 30, mood: 'curious', look: 'down' },
        show: ['vein', 'clay'],
        hud: { date: 'Dec 2011', km: 33, kmMin: true, power: 75 },
        gate: { tap: 'vein', hint: { en: 'Tap the bright line in the rock!', vi: 'Nhấn vào đường sáng trên đá!' } },
      },
      {
        en: 'It was a vein of gypsum! Long ago, water flowed through cracks under the ground here and left calcium behind. Clear proof that water really flowed on Mars!',
        vi: 'Đó là một mạch thạch cao! Ngày xưa, nước từng chảy qua những khe nứt ngầm dưới lòng đất ở đây và để lại canxi. Bằng chứng rõ ràng rằng nước đã thật sự chảy trên sao Hỏa!',
        rover: { x: 64, reach: true, arm: true, mood: 'excited', look: 'down' },
        photo: 'homestake-vein',
      },
      {
        en: 'Slam dunk! Mars once had better conditions for life than it has today. My wheels wanted to dance!',
        vi: 'Ghi điểm tuyệt đối! Sao Hỏa từng có điều kiện thuận lợi cho sự sống hơn bây giờ rất nhiều. Bánh xe của tôi như muốn nhảy múa!',
        rover: { x: 64, reach: true, mood: 'happy' },
      },
      {
        en: 'But the best surprise was still waiting for me. Tap that rock over there.',
        vi: 'Nhưng điều bất ngờ tuyệt vời nhất vẫn đang chờ tôi. Hãy nhấn vào tảng đá đằng kia.',
        rover: { x: 64, reach: true, mood: 'curious' },
        hud: { date: '2013' },
        gate: { tap: 'clay', hint: { en: 'Tap the rock on the right', vi: 'Nhấn vào tảng đá bên phải' } },
      },
      {
        en: 'Clay minerals! They formed in water that was neutral: not acidic, not harsh. Gentle water... the kind that tiny microbes might have loved.',
        vi: 'Khoáng chất sét! Chúng hình thành trong nước có độ pH trung tính: không có tính axit, không khắc nghiệt. Một dòng nước dịu nhẹ... loại nước mà những vi sinh vật nhỏ bé có thể đã rất yêu thích.',
        rover: { x: 88, reach: true, arm: true, mood: 'excited', look: 'down' },
        photo: 'clay-pillinger-point',
      },
      {
        music: 'triumph',
        en: 'Of all the places I explored, Endeavour crater had the friendliest conditions for ancient microbial life. Mars may once have been able to support life! That is my greatest discovery.',
        vi: 'Trong tất cả những nơi tôi đã khám phá, miệng hố Endeavour từng có điều kiện thuận lợi nhất cho sự sống vi sinh vật cổ đại. Sao Hỏa có thể đã từng có khả năng duy trì sự sống! Đó là phát hiện vĩ đại nhất của tôi.',
        rover: { x: 88, reach: true, mood: 'proud' },
      },
    ],
  },

  // ── 9 ──────────────────────────────────────────────────────────────────────
  {
    id: 'years',
    title: { en: 'Through Dust and Winters', vi: 'Vượt qua bụi bão và mùa đông' },
    scene: 'mars',
    enter: 'drive',
    set: { terrain: 'plains', sky: 'day' },
    objects: [
      { id: 'dustdevil', type: 'dustdevil', x: 82, w: 0.42 },
      { id: 'finish', type: 'finish', x: 62, w: 0.55 },
    ],
    beats: [
      {
        en: 'By early 2014, dust had covered my solar panels again, and more dust means less power. Can you call the wind for me? Tap the swirl!',
        vi: 'Đến đầu năm 2014, bụi lại phủ kín các tấm pin Mặt Trời của tôi, mà bụi càng nhiều thì năng lượng càng ít. Bạn gọi gió giúp tôi được không? Hãy nhấn vào cơn lốc!',
        rover: { x: 34, mood: 'tired', dusty: true },
        show: ['dustdevil'],
        hud: { date: 'Jan 2014', km: 38, kmMin: true, power: 40 },
        gate: { tap: 'dustdevil', hint: { en: 'Tap the dust swirl!', vi: 'Nhấn vào cơn lốc bụi!' } },
      },
      {
        en: 'Whoosh! In March 2014, gusts of Martian wind blew my panels clean. Ahh, I could feel the sunshine again! Every single day, I charge my batteries with energy from the Sun.',
        vi: 'Vù! Tháng 3 năm 2014, những cơn gió sao Hỏa đã thổi sạch các tấm pin của tôi. A, tôi lại cảm nhận được ánh nắng rồi! Ngày nào tôi cũng sạc pin bằng năng lượng Mặt Trời.',
        rover: { mood: 'happy', dusty: false },
        show: [],
        set: { wind: true },
        hud: { date: 'Mar 2014', power: 95 },
        photo: 'dusty-vs-clean-panels',
      },
      {
        en: 'Every day, I also watched the sky: the clouds, the dust, and how hazy the air was. Scientists call that haze "tau". My sky reports help every Mars mission that comes after me.',
        vi: 'Ngày nào tôi cũng quan sát bầu trời: mây, bụi, và độ mờ đục của khí quyển. Các nhà khoa học gọi độ mờ đó là chỉ số "tau". Những bản tin bầu trời của tôi giúp ích cho mọi sứ mệnh sao Hỏa đến sau tôi.',
        rover: { mood: 'curious', look: 'up' },
        set: { wind: false },
        hud: { date: '2014', power: 80 },
      },
      {
        music: 'triumph',
        en: 'In March 2015, my odometer passed 42.195 kilometers. That is the length of a marathon! The first marathon ever on another world, and it took me about eleven years.',
        vi: 'Tháng 3 năm 2015, đồng hồ quãng đường của tôi vượt mốc 42,195 ki-lô-mét, đúng bằng chiều dài một cuộc thi marathon! Cuộc marathon đầu tiên trên một thế giới khác, và tôi mất khoảng mười một năm để hoàn thành.',
        rover: { x: 80, mood: 'excited' },
        show: ['finish'],
        set: { confetti: true },
        hud: { date: 'Mar 24, 2015', km: 42.195, kmMin: false },
        photo: 'marathon-map',
      },
      {
        en: 'Getting older was hard sometimes. In May 2015, my memory started having trouble, so my engineers set me up to work using only my RAM, a short-term memory. I forgot things every night... but I kept working every day.',
        vi: 'Già đi đôi khi thật khó khăn. Tháng 5 năm 2015, bộ nhớ của tôi bắt đầu trục trặc, nên các kỹ sư đã cấu hình lại để tôi chỉ hoạt động bằng bộ nhớ RAM, một loại trí nhớ ngắn hạn. Mỗi đêm tôi lại quên đi vài thứ... nhưng ngày nào tôi cũng tiếp tục làm việc.',
        rover: { mood: 'confused' },
        show: [],
        set: { confetti: false, glitch: true },
        hud: { date: 'May 2015', power: 65 },
      },
      {
        music: 'sad',
        en: 'In June 2015, my conversations with Earth were cut short for a while. It felt lonely... but I knew my team was still there, waiting for me.',
        vi: 'Tháng 6 năm 2015, những cuộc trò chuyện của tôi với Trái Đất bị gián đoạn một thời gian. Thật cô đơn... nhưng tôi biết đội ngũ của mình vẫn ở đó, chờ đợi tôi.',
        rover: { mood: 'sad' },
        set: { glitch: false, signal: 'broken' },
        cine: { bars: true, zoom: 1.1, focus: 'rover' },
        hud: { date: 'Jun 2015' },
      },
      {
        en: 'During my seventh Martian winter, the sunlight was weak, and I lived on minimum energy. But I did not stop. I stayed active, little by little.',
        vi: 'Trong mùa đông thứ bảy trên sao Hỏa, ánh nắng yếu ớt và tôi chỉ duy trì ở mức năng lượng tối thiểu. Nhưng tôi không dừng lại. Tôi vẫn hoạt động tích cực, từng chút một.',
        rover: { mood: 'determined' },
        set: { signal: null, sky: 'winter' },
        hud: { date: 'Winter 2016 – 17', power: 25 },
      },
    ],
  },

  // ── 10 ─────────────────────────────────────────────────────────────────────
  {
    id: 'storm',
    title: { en: 'The Last Storm', vi: 'Cơn bão cuối cùng' },
    scene: 'mars',
    enter: 'drive',
    set: { terrain: 'valley', sky: 'day' },
    beats: [
      {
        en: 'By 2018, I was exploring a place called Perseverance Valley, on the rim of Endeavour crater. Perseverance means never giving up. What a perfect name for me.',
        vi: 'Đến năm 2018, tôi đang khám phá một nơi tên là Thung lũng Perseverance, trên vành miệng hố Endeavour. Perseverance nghĩa là kiên trì, không bao giờ bỏ cuộc. Một cái tên thật hợp với tôi.',
        rover: { x: 42, mood: 'happy' },
        hud: { date: '2018', km: 45.16, power: 70 },
        photo: 'perseverance-valley',
      },
      {
        music: 'tense',
        en: 'Then, in June 2018, a wall of dust rose on the horizon. It grew, and grew, until the storm wrapped around the whole planet. I was frightened.',
        vi: 'Rồi vào tháng 6 năm 2018, một bức tường bụi nổi lên phía chân trời. Nó lớn dần, lớn dần, cho đến khi cơn bão bao trùm toàn bộ hành tinh. Tôi thấy sợ hãi.',
        rover: { mood: 'scared', look: 'up' },
        set: { sky: 'storm', storm: true },
        cine: { bars: true, zoom: 1.1, focus: 'rover', shake: true },
        hud: { date: 'Jun 2018', power: 35 },
        photo: 'shades-of-darkness',
      },
      {
        en: 'The Sun faded to a tiny dot. My solar panels could barely catch any light. My power dropped... lower... and lower. Tap me, to help me send one last message home.',
        vi: 'Mặt Trời mờ dần chỉ còn là một chấm nhỏ. Các tấm pin gần như không còn đón được chút ánh sáng nào. Năng lượng của tôi giảm dần... giảm dần... và giảm dần. Hãy nhấn vào tôi, giúp tôi gửi tin nhắn cuối cùng về nhà.',
        rover: { mood: 'sleepy', look: null, dusty: true },
        set: { sky: 'dark' },
        cine: { bars: true },
        hud: { power: 8 },
        gate: { tap: 'rover', hint: { en: 'Tap Oppy to send a message home', vi: 'Nhấn vào Oppy để gửi tin về nhà' } },
      },
      {
        music: 'sad',
        en: 'On June 10th, 2018, I sent my last signal home. It said my power was very low, and the sky was almost black.',
        vi: 'Ngày 10 tháng 6 năm 2018, tôi gửi tín hiệu cuối cùng về nhà. Nó cho biết năng lượng của tôi đã rất yếu, và bầu trời gần như đen kịt.',
        rover: { mood: 'sleepy' },
        set: { beam: true },
        cine: { bars: true, zoom: 1.18, focus: 'rover' },
        hud: { date: 'Jun 10, 2018', power: 2 },
        photo: 'last-message',
      },
      {
        music: 'lullaby',
        // pov: seen through Oppy's own camera eyes, which slowly close (src/components/PovView.jsx).
        // The famous words are a reporter's poetic summary of the last data (noted on screen).
        pov: true,
        slow: 0.8, // read this line more slowly
        en: "My battery is low... and it's getting dark... So I closed my eyes, and went to sleep.",
        vi: 'Pin của tôi yếu rồi... và trời đang tối dần... Thế là tôi nhắm mắt lại, và chìm vào giấc ngủ.',
        rover: { mood: 'sleep' },
        set: { beam: false },
        cine: { bars: true },
        hud: { power: 1 },
      },
      {
        music: 'sad',
        // from here to the end, a storyteller speaks: Oppy is asleep. CALL_MESSAGES float around.
        narrator: true,
        en: 'For months, the team on Earth called Oppy again and again, more than a thousand times. Every day they listened, and hoped. But Oppy was in a deep, deep sleep, and could not answer.',
        vi: 'Suốt nhiều tháng, đội ngũ trên Trái Đất gọi Oppy hết lần này đến lần khác, hơn một nghìn lần. Ngày nào họ cũng lắng nghe và hy vọng. Nhưng Oppy đã chìm vào giấc ngủ sâu, rất sâu, và không thể trả lời.',
        set: { beam: false, calls: true, storm: false },
        cine: { bars: true },
        hud: { date: 'Jun 2018 – Feb 2019', power: 0 },
      },
    ],
  },

  // ── 11 ─────────────────────────────────────────────────────────────────────
  {
    id: 'legacy',
    title: { en: 'Mission Complete', vi: 'Nhiệm vụ hoàn thành' },
    scene: 'finale',
    beats: [
      {
        narrator: true,
        en: "On the last night, the team played Oppy one final wake-up song: I'll Be Seeing You. The next day, February 13th, 2019, NASA announced that Opportunity's mission was complete.",
        vi: 'Đêm cuối cùng, đội ngũ gửi tới Oppy bài hát đánh thức sau cùng: "I\'ll Be Seeing You" (Hẹn ngày gặp lại). Ngày hôm sau, 13 tháng 2 năm 2019, NASA tuyên bố nhiệm vụ của Opportunity đã hoàn thành.',
        rover: { x: 20, mood: 'sleep' },
        hud: { date: 'Feb 13, 2019', km: 45.16, power: 0 },
      },
      {
        narrator: true,
        en: 'The team had planned for 90 days. Oppy worked for almost 15 years, about 60 times longer. They hoped the little rover would drive one kilometer. Oppy drove 45.16 kilometers!',
        vi: 'Đội ngũ dự tính Oppy hoạt động 90 ngày. Oppy đã làm việc gần 15 năm, lâu hơn khoảng 60 lần. Họ mong chú robot nhỏ đi được 1 ki-lô-mét. Oppy đã đi được 45,16 ki-lô-mét!',
        set: { stats: 'compare' },
        photo: 'final-traverse-map',
      },
      {
        narrator: true,
        en: 'Oppy found blueberries, gypsum veins and gentle clays, visited Eagle, Endurance, Victoria and Endeavour, and even found a meteorite. Together, these clues told us that Mars was once wet, and may once have supported tiny life.',
        vi: 'Oppy đã tìm thấy "việt quất", mạch thạch cao và đất sét dịu nhẹ, ghé thăm Eagle, Endurance, Victoria và Endeavour, và còn tìm thấy một thiên thạch. Tất cả những manh mối ấy cho thấy sao Hỏa từng có nước, và có thể đã từng duy trì sự sống nhỏ bé.',
        set: { stats: 'discoveries' },
      },
      {
        music: 'triumph',
        narrator: true,
        en: 'For twelve years, Oppy held the record for the longest drive on another world. In October 2026, a younger rover named Perseverance finally drove farther. Oppy would be so proud. Keep going, little one!',
        vi: 'Suốt mười hai năm, Oppy giữ kỷ lục quãng đường dài nhất từng được lái trên một thế giới khác. Tháng 10 năm 2026, một rover trẻ hơn tên là Perseverance cuối cùng đã đi xa hơn. Hẳn Oppy sẽ tự hào lắm. Cố lên nhé, em nhỏ!',
        set: { stats: 'record' },
        hud: { date: 'Oct 2026' },
      },
      {
        music: 'wonder',
        narrator: true,
        en: "Today, Oppy rests in Perseverance Valley, under the Martian stars. But Oppy's story is not over. It lives on in every explorer who refuses to give up. Maybe... in you.",
        vi: 'Giờ đây Oppy yên nghỉ ở Thung lũng Perseverance, dưới bầu trời sao của sao Hỏa. Nhưng câu chuyện của Oppy chưa kết thúc. Nó tiếp tục sống trong mỗi nhà thám hiểm không bao giờ bỏ cuộc. Có lẽ... là trong bạn.',
        rover: { mood: 'happy' },
        set: { stats: null, shooting: true },
        hud: { date: 'Today' },
      },
    ],
  },
];

// Radio messages from Earth that float around the sleeping rover (set.calls, chapter 10).
// 6 places on screen, 2 messages take turns in each place (order: place 1..6, then again).
export const CALL_MESSAGES = [
  { en: 'Opportunity, can you hear us?', vi: 'Opportunity ơi, bạn có nghe thấy không?' },
  { en: 'We miss you, Oppy.', vi: 'Chúng tôi nhớ bạn lắm, Oppy.' },
  { en: 'The storm is over. The Sun is back!', vi: 'Bão tan rồi. Mặt Trời đã trở lại!' },
  { en: 'Please call home.', vi: 'Hãy gọi về nhà nhé.' },
  { en: 'Wake up, little rover!', vi: 'Dậy đi nào, robot nhỏ!' },
  { en: 'We love you, Oppy. ♥', vi: 'Chúng tôi thương bạn lắm, Oppy. ♥' },
  { en: 'Good morning, Oppy! Time to wake up.', vi: 'Chào buổi sáng, Oppy! Dậy thôi nào.' },
  { en: 'Just one little beep... please?', vi: 'Chỉ một tiếng bíp nhỏ thôi... nhé?' },
  { en: 'Your team is still here.', vi: 'Cả đội vẫn ở đây chờ bạn.' },
  { en: 'We are listening, every single day.', vi: 'Ngày nào chúng tôi cũng lắng nghe.' },
  { en: 'We will wait for you, as long as it takes.', vi: 'Chúng tôi sẽ chờ bạn, bao lâu cũng được.' },
  { en: 'Are you okay out there?', vi: 'Ngoài đó bạn có ổn không?' },
];

// Where the little rover marker sits on the crater map (chapter 6), in % of the stage.
export const MAP_POINTS = {
  eagle: { x: 13, y: 78 },
  endurance: { x: 20, y: 69 },
  victoria: { x: 30, y: 55 },
  road: { x: 40, y: 50 },
  endeavour: { x: 51.5, y: 46 },
};

// Flatten chapters into "frames", resolving inheritance, so the app can step 0..N.
export function buildTimeline(list = chapters) {
  const frames = [];
  let hud = { date: '', power: 100 };
  list.forEach((ch, ci) => {
    let rover = { x: 50, mood: 'normal', hidden: false, dusty: false, lift: 0 };
    let scene = ch.scene;
    let set = { ...(ch.set || {}) };
    let show = (ch.objects || []).map((o) => o.id);
    let km;
    let kmMin = false;
    ch.beats.forEach((b, bi) => {
      rover = { ...rover, reach: false, arm: false, look: null, stuck: false, ...(b.rover || {}) };
      if (b.scene) scene = b.scene;
      if (b.set) set = { ...set, ...b.set };
      if (b.show) show = b.show;
      const { km: bKm, kmMin: bKmMin, ...restHud } = b.hud || {};
      hud = { ...hud, ...restHud };
      if (bKm !== undefined) {
        km = bKm;
        kmMin = !!bKmMin;
      } else if (bKmMin !== undefined) kmMin = bKmMin;
      frames.push({
        key: `${ch.id}-${bi}`,
        ci,
        bi,
        chapter: ch,
        beat: b,
        scene,
        set,
        show,
        rover,
        music: b.music || null, // no inheritance: music only where a beat asks for it
        hud: { ...hud, km, kmMin },
      });
    });
  });
  return frames;
}
