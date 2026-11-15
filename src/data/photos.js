// Real NASA photos shown as "polaroids" during the story.
// Files live in /public/images/nasa. NASA imagery is generally not copyrighted;
// credits follow NASA's own captions.

const base = `${import.meta.env.BASE_URL}images/nasa/`;
const details = (id) => `https://images.nasa.gov/details/${id}`;
const HIGHLIGHTS =
  'https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/science-highlights/';

export const photos = {
  'three-generations': {
    src: base + 'three-generations.jpg',
    title: { en: 'Three generations of Mars rovers', vi: 'Ba thế hệ xe tự hành sao Hỏa' },
    caption: {
      en: 'Full-scale models: little Sojourner (front), a Spirit/Opportunity twin (left) and Curiosity (right).',
      vi: 'Mô hình kích thước thật: Sojourner nhỏ bé (phía trước), một rover song sinh Spirit/Opportunity (bên trái) và Curiosity (bên phải).',
    },
    credit: 'NASA/JPL-Caltech',
    link: details('PIA11431'),
  },
  'rover-artist-concept': {
    src: base + 'rover-artist-concept.jpg',
    title: { en: 'A robot geologist', vi: 'Một nhà địa chất học robot' },
    caption: {
      en: "Artist's concept of a Mars Exploration Rover at work on Mars (2003).",
      vi: 'Tranh minh họa một xe thám hiểm sao Hỏa (MER) đang làm việc (2003).',
    },
    credit: 'NASA/JPL',
    link: details('PIA04928'),
  },
  'launch-delta-ii': {
    src: base + 'launch-delta-ii.jpg',
    title: { en: 'Liftoff! July 7, 2003', vi: 'Rời bệ phóng! Ngày 7/7/2003' },
    caption: {
      en: 'A Delta II Heavy rocket carrying Opportunity launches from Cape Canaveral, Florida, at 11:18 p.m. EDT.',
      vi: 'Tên lửa Delta II Heavy mang theo Opportunity rời bệ phóng tại Mũi Canaveral, Florida, lúc 23:18 (giờ miền Đông nước Mỹ).',
    },
    credit: 'NASA/KSC',
    link: details('KSC-03pd2090'),
  },
  'eagle-crater-lion-king': {
    src: base + 'eagle-crater-lion-king.jpg',
    title: { en: 'Eagle crater & Meridiani Planum', vi: 'Miệng hố Eagle và đồng bằng Meridiani' },
    caption: {
      en: 'Part of the "Lion King" panorama Opportunity took on sols 58 and 60 (March 2004), just after climbing out of Eagle crater.',
      vi: 'Một phần ảnh toàn cảnh "Lion King" do Opportunity chụp vào ngày sao Hỏa thứ 58 và 60 (tháng 3/2004), ngay sau khi leo ra khỏi miệng hố Eagle.',
    },
    credit: 'NASA/JPL/Cornell',
    link: details('PIA05755'),
  },
  blueberries: {
    src: base + 'blueberries.jpg',
    title: { en: '"Blueberries" (hematite spherules)', vi: '"Việt quất" (các viên cầu hematit)' },
    caption: {
      en: 'Small hematite spherules photographed by Opportunity in April 2004. Spheres like these usually form in water.',
      vi: 'Những viên cầu hematit nhỏ do Opportunity chụp vào tháng 4/2004. Các viên cầu như thế này thường hình thành trong nước.',
    },
    credit: 'NASA/JPL-Caltech/Cornell/USGS',
    link: HIGHLIGHTS,
  },
  'backshell-parachute': {
    src: base + 'backshell-parachute.jpg',
    title: { en: 'My backshell and parachute', vi: 'Vỏ sau và chiếc dù của tôi' },
    caption: {
      en: 'Opportunity spots its discarded backshell and parachute lying on the plains (February 2004).',
      vi: 'Opportunity nhìn thấy vỏ sau và chiếc dù đã bị bỏ lại trên đồng bằng (tháng 2/2004).',
    },
    credit: 'NASA/JPL/Cornell',
    link: details('PIA05233'),
  },
  'landing-hardware-orbit': {
    src: base + 'landing-hardware-orbit.jpg',
    title: { en: 'My landing platform, seen from orbit', vi: 'Bệ hạ cánh nhìn từ quỹ đạo' },
    caption: {
      en: 'In 2017, Mars Reconnaissance Orbiter photographed the bright landing platform Opportunity left inside Eagle crater.',
      vi: 'Năm 2017, tàu quỹ đạo Mars Reconnaissance Orbiter đã chụp được bệ hạ cánh sáng màu mà Opportunity để lại trong miệng hố Eagle.',
    },
    credit: 'NASA/JPL-Caltech/Univ. of Arizona',
    link: details('PIA21494'),
  },
  'heat-shield': {
    src: base + 'heat-shield.jpg',
    title: { en: 'My old heat shield', vi: 'Tấm chắn nhiệt cũ của tôi' },
    caption: {
      en: "Opportunity's discarded heat shield, photographed on sol 325 (January 2005).",
      vi: 'Tấm chắn nhiệt đã bị bỏ lại của Opportunity, chụp vào ngày sao Hỏa thứ 325 (tháng 1/2005).',
    },
    credit: 'NASA/JPL/Cornell',
    link: details('PIA07223'),
  },
  'iron-meteorite': {
    src: base + 'iron-meteorite.jpg',
    title: { en: '"Heat Shield Rock": an iron meteorite', vi: '"Heat Shield Rock": thiên thạch sắt' },
    caption: {
      en: 'The basketball-sized iron-nickel meteorite Opportunity found near its heat shield in January 2005: the first meteorite identified on another planet.',
      vi: 'Thiên thạch sắt-niken to cỡ quả bóng rổ mà Opportunity tìm thấy gần tấm chắn nhiệt vào tháng 1/2005, thiên thạch đầu tiên được xác định trên một hành tinh khác.',
    },
    credit: 'NASA/JPL/Cornell',
    link: details('PIA07269'),
  },
  'endurance-layers': {
    src: base + 'endurance-layers.jpg',
    title: { en: 'Rock layers inside Endurance crater', vi: 'Các lớp đá trong miệng hố Endurance' },
    caption: {
      en: 'Layers on the inner slope of Endurance crater, seen from inside the crater on sol 134 (June 2004).',
      vi: 'Các lớp đá trên sườn trong của miệng hố Endurance, chụp từ bên trong miệng hố vào ngày sao Hỏa thứ 134 (tháng 6/2004).',
    },
    credit: 'NASA/JPL',
    link: details('PIA06263'),
  },
  'victoria-crater': {
    src: base + 'victoria-crater.jpg',
    title: { en: 'Me at Victoria crater, seen from orbit', vi: 'Tôi ở miệng hố Victoria, nhìn từ quỹ đạo' },
    caption: {
      en: "Mars Reconnaissance Orbiter's view of Victoria crater's scalloped cliffs, with Opportunity perched on the rim (October 2006).",
      vi: 'Ảnh của tàu quỹ đạo Mars Reconnaissance Orbiter chụp những vách đá lượn sóng của miệng hố Victoria, với Opportunity đứng trên vành (tháng 10/2006).',
    },
    credit: 'NASA/JPL-Caltech/Univ. of Arizona',
    link: details('PIA08812'),
  },
  'endeavour-rim': {
    src: base + 'endeavour-rim.jpg',
    title: { en: 'Endeavour crater on the horizon', vi: 'Miệng hố Endeavour phía chân trời' },
    caption: {
      en: 'The far rim of Endeavour crater rises over the Meridiani plain (Pancam, sol 2407, December 2010).',
      vi: 'Vành xa của miệng hố Endeavour nhô lên trên đồng bằng Meridiani (camera Pancam, ngày sao Hỏa thứ 2407, tháng 12/2010).',
    },
    credit: 'NASA/JPL-Caltech/Cornell/ASU',
    link: details('PIA13667'),
  },
  'homestake-vein': {
    src: base + 'homestake-vein.jpg',
    title: { en: '"Homestake": a gypsum vein', vi: '"Homestake": một mạch thạch cao' },
    caption: {
      en: 'A bright mineral vein near the rim of Endeavour crater, left behind when water flowed through underground cracks (2011).',
      vi: 'Một mạch khoáng sáng màu gần vành miệng hố Endeavour, được để lại khi nước chảy qua các khe nứt ngầm (2011).',
    },
    credit: 'NASA/JPL-Caltech/Cornell/ASU',
    link: HIGHLIGHTS,
  },
  'clay-pillinger-point': {
    src: base + 'clay-pillinger-point.jpg',
    title: { en: 'Clay country: Endeavour\'s rim', vi: 'Vùng đất sét: vành miệng hố Endeavour' },
    caption: {
      en: '"Pillinger Point" on the western rim of Endeavour crater, the region where Opportunity found clay minerals formed in neutral water.',
      vi: '"Pillinger Point" trên vành phía tây miệng hố Endeavour, khu vực Opportunity tìm thấy khoáng chất sét hình thành trong nước trung tính.',
    },
    credit: 'NASA/JPL-Caltech/Cornell Univ./Arizona State Univ.',
    link: details('PIA18393'),
  },
  'dusty-vs-clean-panels': {
    src: base + 'dusty-vs-clean-panels.jpg',
    title: { en: 'Dusty… then clean!', vi: 'Bám bụi… rồi sạch bong!' },
    caption: {
      en: "Opportunity's self-portraits from January 2014 (dusty) and March 2014, after the wind cleaned its solar panels.",
      vi: 'Ảnh tự chụp của Opportunity vào tháng 1/2014 (bám bụi) và tháng 3/2014, sau khi gió thổi sạch các tấm pin Mặt Trời.',
    },
    credit: 'NASA/JPL-Caltech/Cornell Univ./Arizona State Univ.',
    link: HIGHLIGHTS,
  },
  'marathon-map': {
    src: base + 'marathon-map.jpg',
    title: { en: 'A marathon on Mars', vi: 'Một cuộc marathon trên sao Hỏa' },
    caption: {
      en: "Opportunity's path as its total driving passed marathon distance, 42.195 km, on March 24, 2015 (sol 3968).",
      vi: 'Lộ trình của Opportunity khi tổng quãng đường vượt mốc marathon 42,195 km vào ngày 24/3/2015 (ngày sao Hỏa thứ 3968).',
    },
    credit: 'NASA/JPL-Caltech/MSSS/NMMNHS',
    link: details('PIA19157'),
  },
  'perseverance-valley': {
    src: base + 'perseverance-valley.jpg',
    title: { en: 'Perseverance Valley', vi: 'Thung lũng Perseverance' },
    caption: {
      en: "Inside Perseverance Valley on Endeavour crater's western rim, with Opportunity's own wheel tracks (Sept–Oct 2017).",
      vi: 'Bên trong Thung lũng Perseverance trên vành phía tây miệng hố Endeavour, có cả vết bánh xe của chính Opportunity (tháng 9–10/2017).',
    },
    credit: 'NASA/JPL-Caltech/Cornell/ASU',
    link: details('PIA22074'),
  },
  'shades-of-darkness': {
    src: base + 'shades-of-darkness.jpg',
    title: { en: 'The sky goes dark', vi: 'Bầu trời tối dần' },
    caption: {
      en: "Simulated views of the Martian sky from Opportunity's point of view as the 2018 dust storm grew: the Sun shrinks to a pinprick.",
      vi: 'Mô phỏng bầu trời sao Hỏa từ góc nhìn của Opportunity khi cơn bão bụi năm 2018 mạnh dần: Mặt Trời chỉ còn là một chấm nhỏ.',
    },
    credit: 'NASA/JPL-Caltech/TAMU',
    link: details('PIA22521'),
  },
  'last-message': {
    src: base + 'last-message.jpg',
    title: { en: 'My last picture', vi: 'Bức ảnh cuối cùng của tôi' },
    caption: {
      en: 'The noisy, incomplete image Opportunity sent on June 10, 2018 (sol 5111): its last data. Fun fact: the famous words "My battery is low and it\'s getting dark" were a journalist\'s poetic translation, not a real message.',
      vi: 'Bức ảnh nhiễu, chưa trọn vẹn mà Opportunity gửi về ngày 10/6/2018 (ngày sao Hỏa thứ 5111), dữ liệu cuối cùng của nó. Thú vị: câu nói nổi tiếng "Pin tôi yếu và trời đang tối dần" là lời diễn giải đầy chất thơ của một nhà báo, không phải tin nhắn thật.',
    },
    credit: 'NASA/JPL-Caltech/Cornell/ASU',
    link: details('PIA22929'),
  },
  'final-traverse-map': {
    src: base + 'final-traverse-map.jpg',
    title: { en: '45.16 km: my whole journey', vi: '45,16 km: toàn bộ hành trình của tôi' },
    caption: {
      en: "Opportunity's final traverse map: from Eagle crater to its last stop in Perseverance Valley on the rim of Endeavour crater.",
      vi: 'Bản đồ hành trình cuối cùng của Opportunity: từ miệng hố Eagle đến điểm dừng cuối ở Thung lũng Perseverance trên vành miệng hố Endeavour.',
    },
    credit: 'NASA/JPL-Caltech/Univ. of Arizona',
    link: details('PIA23178'),
  },
  'dusty-selfie': {
    src: base + 'dusty-selfie.jpg',
    title: { en: 'Selfie after 10 years on Mars', vi: 'Ảnh tự chụp sau 10 năm trên sao Hỏa' },
    caption: {
      en: "Opportunity's self-portrait, January 2014: a little dusty, still exploring.",
      vi: 'Ảnh tự chụp của Opportunity, tháng 1/2014: hơi bám bụi một chút, nhưng vẫn đang khám phá.',
    },
    credit: 'NASA/JPL-Caltech/Cornell/Arizona State Univ.',
    link: HIGHLIGHTS,
  },
};
