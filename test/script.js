/* =========================================================
   TRUY TÌM KHO BÁU LỊCH SỬ — v5.0
   Có khóa vùng tuần tự + hệ số vùng + đội 1–5
   ========================================================= */
'use strict';

const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[c]));
const rnd = n => Math.floor(Math.random() * n);
const pick = a => a[rnd(a.length)];
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const uid = () => 'id_' + Math.random().toString(36).slice(2, 9);

/* ===== ÂM THANH ===== */
const Sfx = (() => {
  let ctx = null, enabled = true;
  function ac(){
    if(!ctx){ try{ ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch(e){ enabled = false; } }
    return ctx;
  }
  function tone(f, dur=.16, type='sine', vol=.15, delay=0){
    if(!enabled) return;
    const c = ac(); if(!c) return;
    const t = c.currentTime + delay;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + .012);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + dur + .02);
  }
  function chord(list, dur=.5, vol=.12){
    list.forEach((f,i) => tone(f, dur, 'triangle', vol, i * .06));
  }
  return {
    set(v){ enabled = v; if(v) ac(); },
    get(){ return enabled; },
    click(){ tone(660, .06, 'square', .06); },
    correct(){ chord([523, 659, 784, 1047], .5, .13); },
    wrong(){ tone(196, .28, 'sawtooth', .13); tone(146, .36, 'sawtooth', .12, .1); },
    chest(){ [392, 523, 659, 880].forEach((f,i) => tone(f, .24, 'triangle', .14, i * .09)); },
    key(){ [880, 1175, 1568].forEach((f,i) => tone(f, .2, 'sine', .13, i * .07)); },
    trap(){ tone(120, .4, 'square', .14); tone(90, .5, 'square', .12, .12); },
    win(){ [523, 659, 784, 1047, 1319, 1568].forEach((f,i) => tone(f, .42, 'triangle', .15, i * .13)); },
    turn(){ tone(440, .1, 'sine', .09); tone(660, .12, 'sine', .08, .08); }
  };
})();

/* ===== NGÂN HÀNG CÂU HỎI ===== */
const DEFAULT_QUESTIONS = [
 {id:'q1',topic:'Thành lập Đảng',difficulty:'easy',points:100,
  q:'Đảng Cộng sản Việt Nam được thành lập vào ngày tháng năm nào?',
  options:['3/2/1930','2/3/1930','3/2/1931','19/5/1930'],answer:0,
  explain:'Hội nghị hợp nhất các tổ chức cộng sản họp tại Cửu Long (Hương Cảng, Trung Quốc); ngày 3/2/1930, Đảng Cộng sản Việt Nam chính thức ra đời.'},
 {id:'q2',topic:'Thành lập Đảng',difficulty:'easy',points:100,
  q:'Hội nghị thành lập Đảng Cộng sản Việt Nam diễn ra tại đâu?',
  options:['Pác Bó, Cao Bằng','Cửu Long, Hương Cảng (Trung Quốc)','Tân Trào, Tuyên Quang','Ma Cao (Trung Quốc)'],answer:1,
  explain:'Hội nghị hợp nhất do Nguyễn Ái Quốc triệu tập và chủ trì tại Cửu Long (Hương Cảng).'},
 {id:'q3',topic:'Thành lập Đảng',difficulty:'easy',points:100,
  q:'Ai chủ trì Hội nghị hợp nhất thành lập Đảng Cộng sản Việt Nam?',
  options:['Trần Phú','Lê Hồng Phong','Nguyễn Ái Quốc','Nguyễn Văn Cừ'],answer:2,
  explain:'Nguyễn Ái Quốc (Hồ Chí Minh) triệu tập và chủ trì Hội nghị hợp nhất tháng 1–2/1930.'},
 {id:'q4',topic:'Con đường cứu nước',difficulty:'mid',points:150,
  q:'Nguyễn Ái Quốc đọc Luận cương của Lênin vào năm nào?',
  options:['1917','1919','1920','1923'],answer:2,
  explain:'Tháng 7/1920, Nguyễn Ái Quốc đọc Luận cương Lênin trên báo Nhân đạo, tìm ra con đường cứu nước vô sản.'},
 {id:'q5',topic:'Chuẩn bị thành lập Đảng',difficulty:'mid',points:150,
  q:'Tác phẩm "Đường Kách mệnh" của Nguyễn Ái Quốc xuất bản năm nào?',
  options:['1925','1927','1929','1930'],answer:1,
  explain:'"Đường Kách mệnh" xuất bản năm 1927 tại Quảng Châu.'},
 {id:'q6',topic:'Chuẩn bị thành lập Đảng',difficulty:'mid',points:150,
  q:'Hội Việt Nam Cách mạng Thanh niên thành lập năm nào, ở đâu?',
  options:['1925 tại Quảng Châu','1927 tại Hương Cảng','1929 tại Sài Gòn','1924 tại Mát-xcơ-va'],answer:0,
  explain:'Tháng 6/1925, Nguyễn Ái Quốc thành lập Hội Việt Nam Cách mạng Thanh niên tại Quảng Châu.'},
 {id:'q7',topic:'Cương lĩnh đầu tiên',difficulty:'mid',points:150,
  q:'Luận cương chính trị tháng 10/1930 của Đảng do ai soạn thảo?',
  options:['Nguyễn Ái Quốc','Trần Phú','Lê Duẩn','Hà Huy Tập'],answer:1,
  explain:'Trần Phú – Tổng Bí thư đầu tiên – soạn thảo Luận cương chính trị, thông qua tại Hội nghị TW lần thứ nhất (10/1930).'},
 {id:'q8',topic:'Thành lập Đảng',difficulty:'mid',points:150,
  q:'Tại Hội nghị TW lần thứ nhất (10/1930), Đảng đổi tên thành gì?',
  options:['Đảng Cộng sản Việt Nam','Đảng Lao động Việt Nam','Đảng Cộng sản Đông Dương','Đảng Nhân dân Cách mạng'],answer:2,
  explain:'Tháng 10/1930, Đảng đổi tên thành Đảng Cộng sản Đông Dương theo đề nghị của Quốc tế Cộng sản.'},
 {id:'q9',topic:'Cao trào 1930–1931',difficulty:'mid',points:150,
  q:'Đỉnh cao của cao trào cách mạng 1930–1931 là gì?',
  options:['Phong trào Xô viết Nghệ – Tĩnh','Khởi nghĩa Yên Bái','Phong trào Đông Dương Đại hội','Khởi nghĩa Nam Kỳ'],answer:0,
  explain:'Phong trào Xô viết Nghệ – Tĩnh là đỉnh cao của cao trào 1930–1931.'},
 {id:'q10',topic:'Đại hội I',difficulty:'hard',points:200,
  q:'Đại hội đại biểu toàn quốc lần thứ nhất của Đảng (3/1935) họp ở đâu?',
  options:['Hà Nội','Ma Cao (Trung Quốc)','Chiêm Hóa, Tuyên Quang','Pác Bó, Cao Bằng'],answer:1,
  explain:'Đại hội I họp tại Ma Cao (Trung Quốc) tháng 3/1935, đánh dấu sự phục hồi hệ thống tổ chức Đảng.'},
 {id:'q11',topic:'Mặt trận Việt Minh',difficulty:'easy',points:100,
  q:'Mặt trận Việt Minh thành lập vào ngày nào?',
  options:['19/5/1940','19/5/1941','3/2/1941','22/12/1944'],answer:1,
  explain:'Ngày 19/5/1941, Mặt trận Việt Minh ra đời theo Nghị quyết Hội nghị Trung ương 8.'},
 {id:'q12',topic:'Hội nghị TW 8',difficulty:'mid',points:150,
  q:'Hội nghị Ban Chấp hành Trung ương lần thứ 8 (5/1941) chủ trương gì?',
  options:['Đặt nhiệm vụ giải phóng dân tộc lên hàng đầu','Thành lập chính quyền Xô viết','Phát động cải cách ruộng đất','Thành lập Đảng Cộng sản Đông Dương'],answer:0,
  explain:'Hội nghị TW 8 (5/1941) tại Pác Bó đặt nhiệm vụ giải phóng dân tộc lên hàng đầu.'},
 {id:'q13',topic:'Chuẩn bị Tổng khởi nghĩa',difficulty:'mid',points:150,
  q:'Nguyễn Ái Quốc về nước trực tiếp lãnh đạo cách mạng vào ngày nào?',
  options:['28/1/1941','19/5/1941','3/2/1940','22/12/1944'],answer:0,
  explain:'Ngày 28/1/1941, Nguyễn Ái Quốc về Pác Bó (Cao Bằng) sau 30 năm bôn ba tìm đường cứu nước.'},
 {id:'q14',topic:'Chuẩn bị Tổng khởi nghĩa',difficulty:'mid',points:150,
  q:'Đội Việt Nam Tuyên truyền Giải phóng quân thành lập ngày nào?',
  options:['22/12/1944','19/5/1941','3/2/1945','19/8/1945'],answer:0,
  explain:'Ngày 22/12/1944, Đội Việt Nam Tuyên truyền Giải phóng quân thành lập tại Cao Bằng.'},
 {id:'q15',topic:'Cách mạng Tháng Tám',difficulty:'easy',points:100,
  q:'Ngày 19/8/1945, khởi nghĩa giành chính quyền thắng lợi ở đâu?',
  options:['Huế','Sài Gòn','Hà Nội','Đà Nẵng'],answer:2,
  explain:'Ngày 19/8/1945, khởi nghĩa giành chính quyền thắng lợi hoàn toàn ở Hà Nội.'},
 {id:'q16',topic:'Cách mạng Tháng Tám',difficulty:'easy',points:100,
  q:'Chủ tịch Hồ Chí Minh đọc Tuyên ngôn Độc lập vào ngày nào?',
  options:['19/8/1945','2/9/1945','2/9/1946','25/8/1945'],answer:1,
  explain:'Ngày 2/9/1945, tại Quảng trường Ba Đình, Chủ tịch Hồ Chí Minh đọc Tuyên ngôn Độc lập.'},
 {id:'q17',topic:'Kháng chiến chống Pháp',difficulty:'mid',points:150,
  q:'Chủ tịch Hồ Chí Minh ra "Lời kêu gọi toàn quốc kháng chiến" ngày nào?',
  options:['19/12/1946','6/3/1946','23/9/1945','20/12/1946'],answer:0,
  explain:'Đêm 19/12/1946, Chủ tịch Hồ Chí Minh ra Lời kêu gọi toàn quốc kháng chiến.'},
 {id:'q18',topic:'Kháng chiến chống Pháp',difficulty:'hard',points:200,
  q:'Chiến dịch Biên giới Thu – Đông 1950 nhằm mục đích chính gì?',
  options:['Giải phóng Điện Biên Phủ','Khai thông biên giới Việt – Trung','Giải phóng Hà Nội','Đánh chiếm các đô thị lớn'],answer:1,
  explain:'Chiến dịch Biên giới 1950 phá vỡ thế bao vây, khai thông biên giới Việt – Trung.'},
 {id:'q19',topic:'Kháng chiến chống Pháp',difficulty:'easy',points:100,
  q:'Chiến dịch Điện Biên Phủ toàn thắng ngày nào?',
  options:['7/5/1954','30/4/1954','8/5/1954','20/7/1954'],answer:0,
  explain:'Chiều 7/5/1954, chiến dịch Điện Biên Phủ toàn thắng sau 56 ngày đêm.'},
 {id:'q20',topic:'Kháng chiến chống Pháp',difficulty:'mid',points:150,
  q:'Chiến dịch Điện Biên Phủ diễn ra bao nhiêu ngày đêm?',
  options:['40 ngày đêm','56 ngày đêm','60 ngày đêm','75 ngày đêm'],answer:1,
  explain:'Từ 13/3/1954 đến 7/5/1954, tổng cộng 56 ngày đêm.'},
 {id:'q21',topic:'Kháng chiến chống Pháp',difficulty:'mid',points:150,
  q:'Hiệp định Genève về Đông Dương ký kết năm nào?',
  options:['1954','1955','1953','1956'],answer:0,
  explain:'Hiệp định Genève ký ngày 21/7/1954.'},
 {id:'q22',topic:'Đại hội II',difficulty:'hard',points:200,
  q:'Đại hội đại biểu toàn quốc lần thứ II của Đảng (2/1951) họp ở đâu?',
  options:['Hà Nội','Chiêm Hóa, Tuyên Quang','Cao Bằng','Ma Cao (Trung Quốc)'],answer:1,
  explain:'Đại hội II họp tại Chiêm Hóa (Tuyên Quang) tháng 2/1951, đưa Đảng ra hoạt động công khai.'},
 {id:'q23',topic:'Đại hội II',difficulty:'hard',points:200,
  q:'Đại hội II (1951) đưa Đảng ra hoạt động công khai với tên gọi nào?',
  options:['Đảng Cộng sản Việt Nam','Đảng Lao động Việt Nam','Đảng Cộng sản Đông Dương','Đảng Nhân dân Việt Nam'],answer:1,
  explain:'Tại Đại hội II, Đảng lấy tên là Đảng Lao động Việt Nam.'},
 {id:'q24',topic:'Đại hội III',difficulty:'mid',points:150,
  q:'Đại hội III (9/1960) xác định nhiệm vụ chiến lược nào?',
  options:['Xây dựng CNXH ở miền Bắc, đấu tranh giải phóng miền Nam','Đổi mới toàn diện đất nước','Công nghiệp hóa, hiện đại hóa','Xóa bỏ cơ chế bao cấp'],answer:0,
  explain:'Đại hội III đề ra hai nhiệm vụ chiến lược: cách mạng XHCN ở miền Bắc và cách mạng dân tộc dân chủ nhân dân ở miền Nam.'},
 {id:'q25',topic:'Kháng chiến chống Mỹ',difficulty:'easy',points:100,
  q:'Phong trào "Đồng khởi" bùng nổ mạnh mẽ ở Bến Tre năm nào?',
  options:['1959','1960','1961','1962'],answer:1,
  explain:'Đầu năm 1960, phong trào Đồng khởi nổ ra ở Bến Tre, lan rộng khắp miền Nam.'},
 {id:'q26',topic:'Kháng chiến chống Mỹ',difficulty:'mid',points:150,
  q:'Mặt trận Dân tộc Giải phóng miền Nam Việt Nam thành lập ngày nào?',
  options:['20/12/1960','19/5/1960','2/9/1960','22/12/1960'],answer:0,
  explain:'Ngày 20/12/1960, Mặt trận Dân tộc Giải phóng miền Nam Việt Nam ra đời.'},
 {id:'q27',topic:'Kháng chiến chống Mỹ',difficulty:'mid',points:150,
  q:'Cuộc Tổng tiến công và nổi dậy Tết Mậu Thân diễn ra năm nào?',
  options:['1965','1968','1972','1975'],answer:1,
  explain:'Tết Mậu Thân 1968, quân và dân ta đồng loạt tổng tiến công và nổi dậy ở nhiều đô thị miền Nam.'},
 {id:'q28',topic:'Kháng chiến chống Mỹ',difficulty:'mid',points:150,
  q:'Hiệp định Paris về Việt Nam được ký ngày nào?',
  options:['27/1/1973','30/4/1973','27/1/1972','2/9/1973'],answer:0,
  explain:'Ngày 27/1/1973, Hiệp định Paris được ký kết; Mỹ buộc phải rút quân khỏi Việt Nam.'},
 {id:'q29',topic:'Đại thắng mùa Xuân',difficulty:'easy',points:100,
  q:'Chiến dịch Hồ Chí Minh toàn thắng ngày nào?',
  options:['30/4/1975','29/4/1975','1/5/1975','26/4/1975'],answer:0,
  explain:'11h30 ngày 30/4/1975, Chiến dịch Hồ Chí Minh toàn thắng, đất nước hoàn toàn thống nhất.'},
 {id:'q30',topic:'Đại hội IV',difficulty:'hard',points:200,
  q:'Đại hội IV (12/1976) quyết định đổi tên Đảng thành gì?',
  options:['Đảng Lao động Việt Nam','Đảng Cộng sản Việt Nam','Đảng Cộng sản Đông Dương','Đảng Xã hội Việt Nam'],answer:1,
  explain:'Đại hội IV đổi tên Đảng Lao động Việt Nam thành Đảng Cộng sản Việt Nam.'},
 {id:'q31',topic:'Đường lối Đổi mới',difficulty:'easy',points:100,
  q:'Đại hội VI (12/1986) đề ra đường lối gì?',
  options:['Đường lối Đổi mới','Đường lối công nghiệp hóa','Đường lối đối ngoại hòa bình','Đường lối xây dựng nông thôn mới'],answer:0,
  explain:'Đại hội VI (12/1986) khởi xướng đường lối Đổi mới toàn diện.'},
 {id:'q32',topic:'Đường lối Đổi mới',difficulty:'mid',points:150,
  q:'Đại hội VII (6/1991) thông qua văn kiện quan trọng nào?',
  options:['Cương lĩnh xây dựng đất nước trong thời kỳ quá độ lên CNXH','Báo cáo chính trị','Điều lệ Đảng sửa đổi','Chiến lược ổn định kinh tế'],answer:0,
  explain:'Đại hội VII thông qua Cương lĩnh xây dựng đất nước trong thời kỳ quá độ lên CNXH.'},
 {id:'q33',topic:'Đối ngoại',difficulty:'mid',points:150,
  q:'Việt Nam chính thức gia nhập ASEAN năm nào?',
  options:['1995','1997','2000','2007'],answer:0,
  explain:'Ngày 28/7/1995, Việt Nam trở thành thành viên thứ 7 của ASEAN.'},
 {id:'q34',topic:'Đối ngoại',difficulty:'mid',points:150,
  q:'Việt Nam trở thành thành viên WTO năm nào?',
  options:['2005','2006','2007','2008'],answer:2,
  explain:'Ngày 11/1/2007, Việt Nam là thành viên thứ 150 của WTO.'},
 {id:'q35',topic:'Đại hội XIII',difficulty:'hard',points:200,
  q:'Đại hội XIII (1/2021) xác định mục tiêu đến năm 2030 là gì?',
  options:['Trở thành nước đang phát triển có công nghiệp hiện đại, thu nhập trung bình cao','Trở thành nước công nghiệp hóa hoàn toàn','Trở thành nước phát triển','Trở thành nước có thu nhập cao'],answer:0,
  explain:'Đại hội XIII xác định đến năm 2030, Việt Nam trở thành nước đang phát triển có công nghiệp hiện đại, thu nhập trung bình cao.'},
 {id:'q36',topic:'Xây dựng Đảng',difficulty:'mid',points:150,
  q:'Hội nghị TW 4 khóa XII (2016) bàn về nội dung trọng tâm nào?',
  options:['Tăng cường xây dựng, chỉnh đốn Đảng; ngăn chặn suy thoái','Cải cách tiền lương','Phát triển kinh tế tư nhân','Đổi mới giáo dục'],answer:0,
  explain:'Nghị quyết TW 4 khóa XII về tăng cường xây dựng, chỉnh đốn Đảng; ngăn chặn, đẩy lùi suy thoái.'},
 {id:'q37',topic:'Đại hội X',difficulty:'mid',points:150,
  q:'Đại hội X (4/2006) đề ra chủ trương gì?',
  options:['Đẩy mạnh toàn diện công cuộc đổi mới','Đổi mới toàn diện đất nước','Xây dựng nông thôn mới','Cải cách tư pháp'],answer:0,
  explain:'Đại hội X chủ trương đẩy mạnh toàn diện công cuộc đổi mới, sớm đưa nước ta ra khỏi tình trạng kém phát triển.'},
 {id:'q38',topic:'Cương lĩnh 2011',difficulty:'hard',points:200,
  q:'Đại hội XI (1/2011) thông qua văn kiện nào?',
  options:['Cương lĩnh xây dựng đất nước trong thời kỳ quá độ lên CNXH (bổ sung, phát triển năm 2011)','Hiến pháp mới','Chiến lược phát triển kinh tế 2011–2020','Điều lệ Đảng sửa đổi'],answer:0,
  explain:'Đại hội XI thông qua Cương lĩnh xây dựng đất nước trong thời kỳ quá độ lên CNXH (bổ sung, phát triển năm 2011).'},
 {id:'q39',topic:'Đại hội IX',difficulty:'mid',points:150,
  q:'Đại hội IX (4/2001) xác định mục tiêu trọng tâm là gì?',
  options:['Đẩy mạnh công nghiệp hóa, hiện đại hóa đất nước','Đổi mới giáo dục','Cải cách hành chính','Hội nhập kinh tế quốc tế'],answer:0,
  explain:'Đại hội IX xác định đẩy mạnh công nghiệp hóa, hiện đại hóa là nhiệm vụ trung tâm.'},
 {id:'q40',topic:'Xây dựng Đảng',difficulty:'mid',points:150,
  q:'Đảng lấy chủ nghĩa Mác – Lênin và tư tưởng Hồ Chí Minh làm nền tảng tư tưởng, kim chỉ nam được khẳng định rõ tại Đại hội nào?',
  options:['Đại hội VI (1986)','Đại hội VII (1991)','Đại hội VIII (1996)','Đại hội IX (2001)'],answer:1,
  explain:'Đại hội VII (6/1991) khẳng định Đảng lấy chủ nghĩa Mác – Lênin và tư tưởng Hồ Chí Minh làm nền tảng tư tưởng.'},
 {id:'q41',topic:'Cách mạng Tháng Tám',difficulty:'hard',points:200,
  q:'Hội nghị toàn quốc của Đảng và Quốc dân Đại hội Tân Trào (8/1945) quyết định gì?',
  options:['Tổng khởi nghĩa giành chính quyền trong cả nước','Thành lập Mặt trận Việt Minh','Ký Hiệp định với Pháp','Thành lập Quân đội nhân dân'],answer:0,
  explain:'Hội nghị toàn quốc của Đảng (14–15/8/1945) và Quốc dân Đại hội Tân Trào (16/8/1945) quyết định phát động Tổng khởi nghĩa.'},
 {id:'q42',topic:'Con đường cứu nước',difficulty:'mid',points:150,
  q:'Nguyễn Ái Quốc gửi "Yêu sách của nhân dân An Nam" tới Hội nghị Véc-xây năm nào?',
  options:['1917','1919','1920','1921'],answer:1,
  explain:'Tháng 6/1919, Nguyễn Ái Quốc gửi bản Yêu sách tới Hội nghị Véc-xây.'},
 {id:'q43',topic:'Kháng chiến chống Pháp',difficulty:'hard',points:200,
  q:'Chiến dịch Việt Bắc Thu – Đông diễn ra năm nào?',
  options:['1946','1947','1948','1950'],answer:1,
  explain:'Thu – Đông 1947, quân và dân ta đánh bại cuộc tiến công lên Việt Bắc của thực dân Pháp.'},
 {id:'q44',topic:'Kháng chiến chống Mỹ',difficulty:'hard',points:200,
  q:'Chiến dịch Đường 9 – Khe Sanh diễn ra năm nào?',
  options:['1965','1968','1972','1975'],answer:1,
  explain:'Năm 1968, ta mở Chiến dịch Đường 9 – Khe Sanh, phối hợp với Tổng tiến công Tết Mậu Thân.'},
 {id:'q45',topic:'Đại hội VIII',difficulty:'hard',points:200,
  q:'Đại hội VIII (6/1996) khẳng định nước ta ra khỏi khủng hoảng kinh tế – xã hội từ năm nào?',
  options:['1995','1996','1997','2000'],answer:1,
  explain:'Đại hội VIII khẳng định đến năm 1996, nước ta đã ra khỏi khủng hoảng kinh tế – xã hội.'},
 {id:'q46',topic:'Văn hóa – Xã hội',difficulty:'hard',points:200,
  q:'Hội nghị TW 5 khóa VIII (7/1998) bàn về nội dung gì?',
  options:['Xây dựng nền văn hóa Việt Nam tiên tiến, đậm đà bản sắc dân tộc','Cải cách hành chính quốc gia','Phát triển kinh tế biển','Xóa đói giảm nghèo'],answer:0,
  explain:'Hội nghị TW 5 khóa VIII ra Nghị quyết về xây dựng và phát triển nền văn hóa Việt Nam tiên tiến, đậm đà bản sắc dân tộc.'},
 {id:'q47',topic:'Kháng chiến chống Mỹ',difficulty:'hard',points:200,
  q:'Câu nói "Không có gì quý hơn độc lập, tự do" được Chủ tịch Hồ Chí Minh nêu trong Lời kêu gọi năm nào?',
  options:['1965','1966','1968','1969'],answer:1,
  explain:'Ngày 17/7/1966, Chủ tịch Hồ Chí Minh ra Lời kêu gọi, trong đó có câu nói bất hủ này.'},
 {id:'q48',topic:'Đại hội XIII',difficulty:'hard',points:200,
  q:'Đại hội XIII (1/2021) xác định tầm nhìn đến năm 2045 là gì?',
  options:['Trở thành nước phát triển, thu nhập cao','Trở thành nước công nghiệp hóa','Trở thành nước có thu nhập trung bình cao','Trở thành trung tâm kinh tế khu vực'],answer:0,
  explain:'Đại hội XIII xác định đến năm 2045 (100 năm thành lập nước), Việt Nam trở thành nước phát triển, thu nhập cao.'}
];

/* ===== AVATAR ===== */
const SKIN = '#f2c9a0', SKIN2 = '#e0b086', DARK = '#2a2118';
function avatarSVG(t){
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g${t.id}" cx="50%" cy="30%" r="80%">
      <stop offset="0%" stop-color="${t.bg1}"/><stop offset="100%" stop-color="${t.bg2}"/>
    </radialGradient>
    <linearGradient id="c${t.id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${t.cloth1}"/><stop offset="100%" stop-color="${t.cloth2}"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" fill="url(#g${t.id})"/>
  <circle cx="12" cy="14" r="1.4" fill="#ffe9a8" opacity=".7"/>
  <circle cx="86" cy="20" r="1.1" fill="#ffe9a8" opacity=".6"/>
  <circle cx="78" cy="10" r="1" fill="#ffe9a8" opacity=".5"/>
  <path d="M14 100 Q16 74 50 71 Q84 74 86 100 Z" fill="url(#c${t.id})"/>
  <path d="M42 71 L50 84 L58 71 Q50 76 42 71 Z" fill="${t.cloth1}" opacity=".55"/>
  <rect x="43" y="59" width="14" height="14" rx="4" fill="${SKIN2}"/>
  <ellipse cx="50" cy="43" rx="21" ry="22" fill="${SKIN}"/>
  <circle cx="29" cy="45" r="4" fill="${SKIN2}"/>
  <circle cx="71" cy="45" r="4" fill="${SKIN2}"/>
  <path d="M29 39 Q30 20 50 19 Q70 20 71 39 Q66 28 50 27 Q34 28 29 39 Z" fill="${t.hair}"/>
  ${t.hat}
  <ellipse cx="42" cy="44" rx="3.4" ry="3.9" fill="#fff"/>
  <ellipse cx="58" cy="44" rx="3.4" ry="3.9" fill="#fff"/>
  <circle cx="42.6" cy="44.6" r="1.9" fill="${DARK}"/>
  <circle cx="58.6" cy="44.6" r="1.9" fill="${DARK}"/>
  <circle cx="43.3" cy="43.7" r=".7" fill="#fff"/>
  <circle cx="59.3" cy="43.7" r=".7" fill="#fff"/>
  <path d="M38 38 Q42 36.4 45.5 38" stroke="${t.hair}" stroke-width="1.7" fill="none" stroke-linecap="round"/>
  <path d="M54.5 38 Q58 36.4 62 38" stroke="${t.hair}" stroke-width="1.7" fill="none" stroke-linecap="round"/>
  <path d="M50 47 Q52 51 49.6 51.6" stroke="${SKIN2}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  <path d="M43 54.5 Q50 59.5 57 54.5" stroke="#a35a4a" stroke-width="2" fill="none" stroke-linecap="round"/>
  <ellipse cx="36" cy="51" rx="3.4" ry="2.2" fill="#ef9d84" opacity=".45"/>
  <ellipse cx="64" cy="51" rx="3.4" ry="2.2" fill="#ef9d84" opacity=".45"/>
  ${t.extra || ''}
</svg>`;
}
const TEAM_THEMES = [
  { id:'red', name:'Đội 1', color:'#e05a48', bg1:'#4a1512', bg2:'#1d0805',
    cloth1:'#d94a35', cloth2:'#8f2a1c', hair:'#3b2415',
    hat:`<path d="M27 34 Q28 15 50 14 Q72 15 73 34 Q73 30 50 29 Q27 30 27 34 Z" fill="#c33b28"/>
         <path d="M24 33 Q50 24 76 33 Q76 37 50 36 Q24 37 24 33 Z" fill="#e8563d"/>
         <circle cx="50" cy="16" r="3.4" fill="#ffd45f"/>` },
  { id:'blue', name:'Đội 2', color:'#4a90e2', bg1:'#122a48', bg2:'#06111f',
    cloth1:'#3f80d6', cloth2:'#22507f', hair:'#2b1c10',
    hat:`<path d="M26 32 Q30 12 50 11 Q70 12 74 32 Q70 27 50 26 Q30 27 26 32 Z" fill="#2b5f9e"/>
         <path d="M22 31 Q50 21 78 31 Q78 35.5 50 34.5 Q22 35.5 22 31 Z" fill="#4a90e2"/>
         <rect x="44" y="13" width="12" height="7" rx="2" fill="#f5c451"/>` },
  { id:'gold', name:'Đội 3', color:'#f5c451', bg1:'#4a3a10', bg2:'#1d1606',
    cloth1:'#e8b93f', cloth2:'#9c7613', hair:'#1f1710',
    hat:`<path d="M27 33 Q28 13 50 12 Q72 13 73 33 Z" fill="#d9a017"/>
         <path d="M23 32 Q50 22 77 32 Q77 36.5 50 35.5 Q23 36.5 23 32 Z" fill="#f5c451"/>
         <rect x="46" y="6" width="8" height="9" rx="3" fill="#5a4a20"/>
         <circle cx="50" cy="11" r="4.2" fill="#fff2b8"/>
         <circle cx="50" cy="11" r="2.1" fill="#ffd75e"/>` },
  { id:'green', name:'Đội 4', color:'#3fb37f', bg1:'#0f3a26', bg2:'#051710',
    cloth1:'#2f9d6a', cloth2:'#1a6644', hair:'#2e2013',
    hat:`<path d="M26 33 Q29 12 50 11 Q71 12 74 33 Z" fill="#2a7a52"/>
         <path d="M21 32 Q50 20 79 32 Q79 37 50 36 Q21 37 21 32 Z" fill="#3fb37f"/>
         <path d="M50 8 Q54 13 50 18 Q46 13 50 8 Z" fill="#8ef0b8"/>` },
  { id:'violet', name:'Đội 5', color:'#a06be0', bg1:'#331c4d', bg2:'#150a22',
    cloth1:'#8e5bd8', cloth2:'#5b3691', hair:'#241738',
    hat:`<path d="M25 31 Q28 10 50 9 Q72 10 75 31 Q72 26 50 25 Q28 26 25 31 Z" fill="#5b3691"/>
         <path d="M20 30 Q50 19 80 30 Q80 35 50 34 Q20 35 20 30 Z" fill="#a06be0"/>
         <circle cx="50" cy="12" r="3" fill="#e8c8ff"/>`,
    extra:`<circle cx="38" cy="44.5" r="6.6" fill="none" stroke="#e8c8ff" stroke-width="1.6"/>
           <circle cx="62" cy="44.5" r="6.6" fill="none" stroke="#e8c8ff" stroke-width="1.6"/>
           <path d="M44.6 44.5 L55.4 44.5" stroke="#e8c8ff" stroke-width="1.6"/>` }
];

/* ===== BẢN ĐỒ ===== */
const ZONES = [
  {id:1, name:'Khu rừng bí ẩn',      icon:'🌳', cls:'z1'},
  {id:2, name:'Ngôi đền cổ',         icon:'🏛️', cls:'z2'},
  {id:3, name:'Hang động thử thách', icon:'🕳️', cls:'z3'},
  {id:4, name:'Hòn đảo thất lạc',    icon:'🏴‍☠️', cls:'z4'},
  {id:5, name:'Kho báu cuối cùng',   icon:'💎', cls:'z5'}
];
const CELL_TYPE = {
  normal:  { icon:'📦', name:'Rương thường' },
  gold:    { icon:'🏆', name:'Rương vàng' },
  secret:  { icon:'🎁', name:'Rương bí mật' },
  trap:    { icon:'💀', name:'Bẫy' },
  key:     { icon:'🗝️', name:'Chìa khóa' },
  special: { icon:'⚔️', name:'Tranh đoạt' },
  big:     { icon:'💎', name:'Kho báu lớn' }
};
const CELL_LAYOUT = [
  ['normal','normal','key','normal','trap'],
  ['normal','gold','key','normal','trap'],
  ['trap','secret','trap','key','secret'],
  ['gold','gold','secret','special','gold'],
  ['gold','secret','gold','secret','big']
];
const CELL_NAMES = [
  ['Suối Vàng','Bụi Rậm','Cây Cổ Thụ','Hang Dơi','Bãi Lầy'],
  ['Cổng Đền','Sân Đá','Chính Điện','Hậu Cung','Tháp Cổ'],
  ['Miệng Hang','Hành Lang','Vực Sâu','Mật Thất','Lối Thoát'],
  ['Xác Tàu Đắm','Hang Hải Tặc','Rương Cướp Biển','Đấu Trường','Hố Vàng'],
  ['Cổng Vàng','Đại Sảnh','Phòng Báu','Két Sắt','Ngai Vàng']
];
const ZONE_MULT      = [1.0, 1.0, 1.0, 1.3, 1.5];
const ZONE_GOLD_MULT = [1.0, 1.0, 1.0, 1.5, 1.0];

/* ===== VẬT PHẨM ===== */
const ITEMS = {
  compass:  { icon:'🧭', name:'La bàn',              desc:'Đánh dấu 1 ô có thưởng lớn' },
  shield:   { icon:'🛡️', name:'Khiên bảo vệ',       desc:'Chặn 1 lần bị trừ điểm' },
  masterKey:{ icon:'🔑', name:'Chìa khóa vạn năng', desc:'Mở kho báu lớn không cần đủ 3 chìa' },
  secretMap:{ icon:'🗺️', name:'Bản đồ bí mật',      desc:'Đổi địa điểm sau khi xem câu hỏi' },
  pickaxe:  { icon:'⛏️', name:'Cuốc khai quật',     desc:'Thêm 1 lượt khám phá miễn phí' },
  lucky:    { icon:'🍀', name:'Bùa may mắn',         desc:'Nhân đôi điểm câu hỏi rương tiếp theo' }
};
const ITEM_KEYS = Object.keys(ITEMS);

/* ===== STATE ===== */
const LS_STATE = 'ttkb_state_v5';
const LS_Q     = 'ttkb_questions_v5';
let S = null;
let QUESTIONS = [];
let currentQuestion = null;
let currentCellIdx = null;
let selectedAnswer = -1;
let questionPhase = 'idle';
let extraTurn = false;
let luckyActive = false;
let shieldPending = false;
let confirmCb = null;
let editingIdx = -1;
let toastTimer = null;

function buildCells(){
  const cells = [];
  for(let z = 0; z < 5; z++){
    for(let i = 0; i < 5; i++){
      cells.push({
        id: `c${z}_${i}`, zone: z, idx: i,
        name: CELL_NAMES[z][i], type: CELL_LAYOUT[z][i],
        opened: false, reward: null, clue: null
      });
    }
  }
  return cells;
}
function defaultState(){
  return {
    started: false, ended: false, phase: 1, currentTeam: 0,
    teams: TEAM_THEMES.map(t => ({
      id: t.id, name: t.name, points: 500,
      keys: 0, treasures: 0, itemsUsed: 0, items: []
    })),
    cells: buildCells(),
    history: [],
    settings: { sound: true, fx: true },
    stealEnabled: true,
    finalOpened: false
  };
}
function save(){
  try {
    localStorage.setItem(LS_STATE, JSON.stringify(S));
    localStorage.setItem(LS_Q, JSON.stringify(QUESTIONS));
  } catch(e){}
}
function load(){
  try {
    const s = localStorage.getItem(LS_STATE);
    const q = localStorage.getItem(LS_Q);
    if(s && q){
      S = JSON.parse(s);
      QUESTIONS = JSON.parse(q);
      if(!S.teams || !S.cells) throw new Error('bad state');
      return true;
    }
  } catch(e){ S = null; }
  return false;
}
function pushHistory(){
  try {
    S.history.push(JSON.stringify({
      teams: S.teams, cells: S.cells, currentTeam: S.currentTeam,
      phase: S.phase, ended: S.ended, finalOpened: S.finalOpened
    }));
    if(S.history.length > 80) S.history.shift();
  } catch(e){}
}
function undo(){
  if(!S.history.length){ toast('Không có thao tác để quay lại'); return; }
  try {
    const h = JSON.parse(S.history.pop());
    Object.assign(S, h);
    save(); render();
    toast('↩️ Đã quay lại bước trước');
  } catch(e){ toast('Không thể quay lại'); }
}

/* ===== TOAST / CONFETTI ===== */
function toast(msg, ms=2400){
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), ms);
}
function confetti(n=120){
  if(!S.settings.fx) return;
  const box = $('#confetti');
  const colors = ['#f5c451','#d99a1f','#e05a48','#4a90e2','#3fb37f','#a06be0','#ffffff','#e0a84a'];
  for(let i = 0; i < n; i++){
    const d = document.createElement('div');
    d.className = 'conf';
    d.style.left = Math.random() * 100 + 'vw';
    d.style.top = '-20px';
    d.style.background = pick(colors);
    d.style.animationDuration = (2 + Math.random() * 2.5) + 's';
    d.style.animationDelay = (Math.random() * .8) + 's';
    d.style.transform = `rotate(${rnd(360)}deg)`;
    box.appendChild(d);
    setTimeout(() => d.remove(), 5200);
  }
}

/* ===== ZONE LOCK HELPERS ===== */
function isZoneUnlocked(z){
  if(z === 0) return true;
  const prevCells = S.cells.filter(c => c.zone === z - 1);
  return prevCells.every(c => c.opened);
}
function countOpenedInZone(z){
  return S.cells.filter(c => c.zone === z && c.opened).length;
}

/* ===== RENDER ===== */
function currentTeam(){ return S.teams[S.currentTeam]; }

function render(){
  if(S.ended || S.phase === 5){
    $('#startView').classList.add('hidden');
    $('#mapView').classList.add('hidden');
    $('#endView').classList.remove('hidden');
    renderEnd();
  } else if(!S.started){
    $('#mapView').classList.add('hidden');
    $('#endView').classList.add('hidden');
    $('#startView').classList.remove('hidden');
    renderStart();
  } else {
    $('#startView').classList.add('hidden');
    $('#endView').classList.add('hidden');
    $('#mapView').classList.remove('hidden');
    renderMap();
  }
  renderSidebar();
  renderTopbar();
  renderBottomBar();
}

function renderTopbar(){
  const labels = ['KHỞI HÀNH','KHÁM PHÁ','TRANH ĐOẠT','KHO BÁU CUỐI','CÔNG BỐ'];
  $('#phaseChip').textContent = `GIAI ĐOẠN ${S.phase} · ${labels[S.phase-1] || ''}`;
  $('#btnSound').classList.toggle('on', S.settings.sound);
  $('#btnSound').textContent = S.settings.sound ? '🔊' : '🔇';
  $('#btnFx').classList.toggle('on', S.settings.fx);
  $('#btnFx').textContent = S.settings.fx ? '✨' : '🚫';
}

function renderBottomBar(){
  $('#btnStart').disabled = S.started;

  const hasQualified = S.teams.some(t =>
    t.keys >= 3 || t.items.includes('masterKey')
  );
  const finalDisabled = !S.started || S.phase >= 4 || !hasQualified;
  $('#btnFinalPhase').disabled = finalDisabled;

  if(finalDisabled && S.started && S.phase < 4){
    const status = S.teams.map(t => {
      const k = t.keys + (t.items.includes('masterKey') ? 3 : 0);
      return `${t.name}: ${k}/3`;
    }).join(' · ');
    $('#btnFinalPhase').title = 'Chưa có đội nào đủ 3 chìa → ' + status;
  } else {
    $('#btnFinalPhase').title = 'Mở khu kho báu cuối cùng';
  }

  $('#btnEndGame').disabled = !S.started || S.ended;
}

function renderStart(){
  const box = $('#teamSetup');
  box.innerHTML = S.teams.map((t, i) => {
    const theme = TEAM_THEMES[i];
    return `
      <div class="ts">
        <div class="av">${avatarSVG(theme)}</div>
        <input data-team="${i}" value="${esc(t.name)}" maxlength="22">
        <div class="note" style="margin-top:6px">500 điểm</div>
      </div>`;
  }).join('');
  box.querySelectorAll('input').forEach(inp => {
    inp.addEventListener('input', e => {
      const i = +e.target.dataset.team;
      S.teams[i].name = e.target.value.trim() || TEAM_THEMES[i].name;
      save();
    });
  });
}

function renderMap(){
  const wrap = $('#mapWrap');
  let html = '';
  for(let z = 0; z < 5; z++){
    const zInfo = ZONES[z];
    const isPirate = z === 3;
    const unlocked = isZoneUnlocked(z);
    const openedCount = countOpenedInZone(z);

    html += `<div class="zone-row">`;
    html += `<div class="zone-label ${isPirate ? 'pirate' : ''} ${unlocked ? '' : 'locked'}">
      <b>${unlocked ? zInfo.icon : '🔒'} ${esc(zInfo.name)}</b>
      <span>Vùng ${z+1} · ${openedCount}/5 · ×${ZONE_MULT[z]}</span>
    </div>`;

    for(let i = 0; i < 5; i++){
      const cell = S.cells[z*5 + i];
      const t = CELL_TYPE[cell.type];
      const cls = ['cell', zInfo.cls];
      if(cell.opened) cls.push('opened');
      if(cell.clue && unlocked) cls.push('hint');
      if(!unlocked) cls.push('locked');

      let inner = '';
      if(!unlocked){
        inner = `<div class="ico">🔒</div><div class="nm">${esc(cell.name)}</div>`;
      } else if(cell.opened){
        inner = `<div class="ico">${t.icon}</div><div class="nm">${esc(cell.name)}</div>`;
      } else {
        inner = `<div class="qi">?</div><div class="nm">${esc(cell.name)}</div>`;
      }

      const titleText = !unlocked
        ? `Khóa – cần hoàn thành ${ZONES[z-1] ? ZONES[z-1].name : ''} trước`
        : `${cell.name} – ${t.name}`;

      html += `<div class="${cls.join(' ')}" data-cell="${z*5 + i}" title="${esc(titleText)}">${inner}</div>`;
    }
    html += `</div>`;
  }
  wrap.innerHTML = html;
  wrap.querySelectorAll('.cell').forEach(el => {
    el.addEventListener('click', () => onCellClick(+el.dataset.cell));
  });

  // Note động
  const note = $('#zoneNote');
  let currentZone = 0;
  for(let z = 0; z < 5; z++){
    if(!isZoneUnlocked(z)){ currentZone = z - 1; break; }
    currentZone = z;
  }
  const cz = ZONES[currentZone];
  const czOpened = countOpenedInZone(currentZone);
  const nextZone = currentZone < 4 ? ZONES[currentZone + 1] : null;

  let statusHtml = `🔓 <b>ĐANG KHÁM PHÁ:</b> ${cz.icon} ${esc(cz.name)} — ${czOpened}/5 ô đã mở.`;

  if(nextZone){
    const need = 5 - czOpened;
    statusHtml += ` Cần mở thêm <b>${need} ô</b> ở vùng này để mở khóa <b>${esc(nextZone.name)}</b>.`;
  } else {
    statusHtml += ` 🎉 Đã tới vùng cuối!`;
  }

  if(currentZone === 3){
    statusHtml += `<br>🏴‍☠️ <b>HÒN ĐẢO THẤT LẠC</b> — 3 rương vàng, điểm câu hỏi ×1.3, phần thưởng rương ×1.5.`;
  }
  note.innerHTML = statusHtml;
}

function renderSidebar(){
  const lb = $('#leaderboard');
  const sorted = [...S.teams].map((t, i) => ({...t, idx:i}))
    .sort((a, b) => b.points - a.points);
  lb.innerHTML = sorted.map((t, rank) => {
    const theme = TEAM_THEMES[t.idx];
    const active = t.idx === S.currentTeam ? 'active' : '';
    const medal = rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : `#${rank+1}`;
    return `
      <div class="team-mini ${active}" data-team="${t.idx}">
        <div class="av">${avatarSVG(theme)}</div>
        <div class="info">
          <div class="nm">${medal} ${esc(t.name)}</div>
          <div class="st">🗝️ ${t.keys} · 💎 ${t.treasures} · 🎁 ${t.itemsUsed}</div>
        </div>
        <div class="pt">${t.points}</div>
      </div>`;
  }).join('');
  lb.querySelectorAll('.team-mini').forEach(el => {
    el.addEventListener('click', () => {
      S.currentTeam = +el.dataset.team;
      Sfx.click();
      save(); render();
    });
  });

  $('#curTeamName').textContent = currentTeam().name;

  const bag = $('#bagArea');
  const t = currentTeam();
  if(t.items.length === 0){
    bag.innerHTML = `<div class="empty">Túi đồ trống — hãy mở rương để nhận vật phẩm!</div>`;
  } else {
    bag.innerHTML = `<div class="bag">${t.items.map((k, i) => {
      const it = ITEMS[k] || {icon:'❓', name:'???'};
      return `<div class="item">
        <span class="ic">${it.icon}</span>
        <span class="nn">${esc(it.name)}</span>
        <button class="use" data-use="${i}">Dùng</button>
      </div>`;
    }).join('')}</div>`;
    bag.querySelectorAll('[data-use]').forEach(el => {
      el.addEventListener('click', () => useItem(+el.dataset.use));
    });
  }
}

/* ===== ACTIONS ===== */
function startGame(){
  S.started = true;
  S.phase = 1;
  pushHistory();
  Sfx.turn();
  toast('🚀 Khởi hành! Chúc các đội may mắn.');
  save(); render();
  setTimeout(() => { S.phase = 2; save(); render(); }, 1200);
}
function nextTurn(){
  pushHistory();
  S.currentTeam = (S.currentTeam + 1) % 5;
  extraTurn = false;
  luckyActive = false;
  Sfx.turn();
  save(); render();
  toast(`🎯 Đến lượt: ${currentTeam().name}`);
}
function prevTeam(){
  pushHistory();
  S.currentTeam = (S.currentTeam + 4) % 5;
  Sfx.click();
  save(); render();
}

function onCellClick(idx){
  const cell = S.cells[idx];
  if(!S.started){ toast('Hãy bắt đầu game trước'); return; }
  if(cell.opened){ toast('Ô này đã được khám phá rồi'); return; }

  // === KHÓA VÙNG ===
  if(!isZoneUnlocked(cell.zone)){
    const prev = ZONES[cell.zone - 1];
    toast(`🔒 Phải hoàn thành ${prev.name} trước khi vào vùng này!`);
    return;
  }

  // Vùng 5 cần phase 4
  if(cell.zone === 4 && S.phase < 4){
    toast('💎 Khu kho báu cuối chưa được mở. Cần ít nhất 1 đội đủ 3 chìa khóa!');
    return;
  }

  if(cell.type === 'big'){
    const t = currentTeam();
    if(t.keys < 3 && !t.items.includes('masterKey')){
      toast('💎 Cần đủ 3 chìa khóa để mở kho báu lớn!');
      return;
    }
  }

  const q = pickQuestion(cell.type);
  if(!q){ toast('Không có câu hỏi phù hợp'); return; }

  currentQuestion = q;
  currentCellIdx = idx;
  selectedAnswer = -1;
  questionPhase = 'idle';
  openQuestionModal();
}

function pickQuestion(cellType){
  let allow;
  if(cellType === 'big') allow = ['hard'];
  else if(cellType === 'gold' || cellType === 'key') allow = ['mid','hard'];
  else allow = ['easy','mid'];
  let pool = QUESTIONS.filter(q => allow.includes(q.difficulty));
  if(pool.length === 0) pool = QUESTIONS;
  if(pool.length === 0) return null;
  return {...pick(pool)};
}

function openQuestionModal(){
  const q = currentQuestion;
  const cell = S.cells[currentCellIdx];
  const zone = ZONES[cell.zone];
  const zMult = ZONE_MULT[cell.zone];

  $('#qTopic').textContent = q.topic;
  $('#qDiff').className = 'tag ' + q.difficulty;
  $('#qDiff').textContent = q.difficulty === 'easy' ? 'Dễ' : q.difficulty === 'mid' ? 'Trung bình' : 'Khó';
  $('#qPts').textContent = `+${q.points || 100} điểm`;
  const zoneTag = $('#qZone');
  if(zMult > 1){
    zoneTag.style.display = '';
    zoneTag.textContent = `×${zMult} hệ số vùng`;
  } else {
    zoneTag.style.display = 'none';
  }
  $('#qTeam').textContent = '👥 ' + currentTeam().name;
  $('#qLoc').textContent = `${zone.icon} ${cell.name}`;
  $('#qText').textContent = q.q;
  $('#qExplain').classList.remove('show');
  $('#qExplain').innerHTML = '';
  $('#btnContinueQ').classList.add('hidden');
  $('#btnConfirmAns').classList.remove('hidden');
  $('#btnConfirmAns').disabled = true;
  $('#btnSkipQ').classList.remove('hidden');

  const opts = $('#qOpts');
  opts.innerHTML = q.options.map((o, i) => `
    <button class="opt" data-opt="${i}">
      <span class="ltr">${'ABCD'[i]}</span>
      <span>${esc(o)}</span>
    </button>`).join('');
  opts.querySelectorAll('.opt').forEach(el => {
    el.addEventListener('click', () => selectAnswer(+el.dataset.opt));
  });

  $('#ovQuestion').classList.add('show');
}

function selectAnswer(i){
  if(questionPhase !== 'idle') return;
  selectedAnswer = i;
  Sfx.click();
  $$('#qOpts .opt').forEach((el, k) => el.classList.toggle('sel', k === i));
  $('#btnConfirmAns').disabled = false;
}

function confirmAnswer(){
  if(questionPhase !== 'idle') return;
  if(selectedAnswer < 0){ toast('Chưa chọn đáp án'); return; }
  questionPhase = 'answered';
  const q = currentQuestion;
  const correct = selectedAnswer === q.answer;
  $$('#qOpts .opt').forEach((el, k) => {
    el.disabled = true;
    if(k === q.answer) el.classList.add('correct');
    else if(k === selectedAnswer) el.classList.add('wrong');
    el.classList.remove('sel');
  });
  const ex = $('#qExplain');
  ex.innerHTML = `<b>${correct ? '✅ Chính xác!' : '❌ Chưa đúng.'}</b> Đáp án đúng: <b>${'ABCD'[q.answer]}. ${esc(q.options[q.answer])}</b><br>${esc(q.explain||'')}`;
  ex.classList.add('show');
  $('#btnConfirmAns').classList.add('hidden');
  $('#btnSkipQ').classList.add('hidden');
  $('#btnContinueQ').classList.remove('hidden');

  if(correct){
    Sfx.correct();
    setTimeout(() => applyCorrectReward(), 550);
  } else {
    Sfx.wrong();
    setTimeout(() => applyWrongPenalty(), 550);
  }
}

function applyWrongPenalty(){
  const cell = S.cells[currentCellIdx];
  const team = currentTeam();
  let msg = '';
  if(cell.type === 'trap'){
    if(shieldPending){
      shieldPending = false;
      msg = '🛡️ Khiên bảo vệ đã chặn bẫy!';
    } else {
      const r = Math.random() * 100;
      if(r < 40){ team.points = Math.max(0, team.points - 50); msg = '💀 Bẫy: −50 điểm'; Sfx.trap(); }
      else if(r < 70){ team.points = Math.max(0, team.points - 100); msg = '💀 Bẫy: −100 điểm'; Sfx.trap(); }
      else if(r < 90){ team.keys = Math.max(0, team.keys - 1); msg = '💀 Bẫy: −1 chìa khóa'; Sfx.trap(); }
      else { msg = '🍀 Thoát nạn! Không bị phạt.'; }
    }
    cell.opened = true;
    cell.reward = msg;
  } else {
    cell.opened = true;
    cell.reward = 'Trả lời sai – mất cơ hội';
    msg = 'Không nhận được phần thưởng ở ô này.';
  }
  save(); render();
  toast(msg, 3000);
}

function closeQuestionAndContinue(){
  $('#ovQuestion').classList.remove('show');
  if(!extraTurn) nextTurn();
  else { extraTurn = false; save(); render(); }
}

function applyCorrectReward(){
  const cell = S.cells[currentCellIdx];
  const team = currentTeam();

  const zoneMult = ZONE_MULT[cell.zone];
  let basePts = Math.round((currentQuestion.points || 100) * zoneMult);
  if(luckyActive){ basePts *= 2; luckyActive = false; }

  team.points += basePts;

  let reward;
  if(cell.type === 'big'){
    reward = {type:'big', text:`💎 KHO BÁU LỚN! +1000 điểm`};
    team.points += 1000;
    team.treasures += 1;
    if(team.keys >= 3){
      team.keys -= 3;
    } else if(team.items.includes('masterKey')){
      team.items.splice(team.items.indexOf('masterKey'), 1);
    }
    S.finalOpened = true;
    cell.opened = true;
    cell.reward = reward.text;
    Sfx.win();
    confetti(180);
    showReward(reward);
    return;
  }

  if(cell.type === 'trap'){
    team.points += 30;
    reward = {type:'safe', text:'🛡️ Vượt qua bẫy an toàn! +30 điểm'};
  } else if(cell.type === 'key'){
    team.keys += 1;
    reward = {type:'key', text:'🗝️ Nhận được 1 chìa khóa!'};
    Sfx.key();
  } else {
    reward = rollReward(cell.type, cell.zone);
    applyRewardToTeam(team, reward);
  }

  const baseText = `+${basePts}đ từ câu hỏi`;
  reward.text = `${reward.text}  (${baseText})`;

  cell.opened = true;
  cell.reward = reward.text;

  if(reward.type !== 'key') Sfx.chest();

  save(); render();
  showReward(reward);
}

function rollReward(cellType, zone = 0){
  const r = Math.random() * 100;
  const gMult = ZONE_GOLD_MULT[zone] || 1;

  if(cellType === 'normal'){
    if(r < 40) return {type:'points', amount:Math.round(100*gMult), text:`+${Math.round(100*gMult)} điểm`};
    if(r < 65) return {type:'points', amount:Math.round(200*gMult), text:`+${Math.round(200*gMult)} điểm`};
    if(r < 80) return {type:'points', amount:Math.round(300*gMult), text:`+${Math.round(300*gMult)} điểm`};
    if(r < 90) return {type:'key', text:'🗝️ +1 chìa khóa'};
    return {type:'item', text:'🎁 Nhận vật phẩm'};
  }
  if(cellType === 'gold'){
    if(r < 30) return {type:'points', amount:Math.round(300*gMult), text:`+${Math.round(300*gMult)} điểm`};
    if(r < 50) return {type:'points', amount:Math.round(500*gMult), text:`+${Math.round(500*gMult)} điểm`};
    if(r < 65) return {type:'double', text:'✖️ Nhân đôi điểm câu hỏi'};
    if(r < 80) return {type:'key', text:'🗝️ +1 chìa khóa'};
    if(r < 90) return {type:'item', text:'🎁 Nhận vật phẩm'};
    return {type:'hint', text:'🗺️ Bản đồ chỉ dẫn rương vàng'};
  }
  if(cellType === 'secret'){
    if(r < 45) return {type:'item', text:'🎁 Nhận vật phẩm'};
    if(r < 70) return {type:'key', text:'🗝️ +1 chìa khóa'};
    if(r < 90) return {type:'points', amount:Math.round(400*gMult), text:`+${Math.round(400*gMult)} điểm`};
    return {type:'extra', text:'⛏️ Mở thêm 1 ô miễn phí'};
  }
  return {type:'points', amount:100, text:'+100 điểm'};
}

function applyRewardToTeam(team, reward){
  switch(reward.type){
    case 'points': team.points += reward.amount; break;
    case 'key': team.keys += 1; Sfx.key(); break;
    case 'item': grantRandomItem(team); break;
    case 'double': luckyActive = true; break;
    case 'hint': revealHint(); break;
    case 'extra': extraTurn = true; break;
  }
}

function grantRandomItem(team){
  if(team.items.length >= 3){
    toast('Túi đồ đã đầy (3/3) — bỏ qua vật phẩm');
    return;
  }
  const k = pick(ITEM_KEYS);
  team.items.push(k);
  toast(`🎁 Nhận vật phẩm: ${ITEMS[k].name}`);
}

function revealHint(){
  const candidates = S.cells.filter(c => !c.opened && (c.type === 'gold' || c.type === 'secret'));
  if(candidates.length === 0) return;
  const c = pick(candidates);
  c.clue = 'gold';
  toast('🗺️ Có một ô được đánh dấu trên bản đồ!');
}

function showReward(reward){
  const box = $('#rewardBox');
  let icon = '📦';
  if(reward.type === 'big') icon = '💎';
  else if(reward.type === 'key') icon = '🗝️';
  else if(reward.type === 'item') icon = '🎁';
  else if(reward.type === 'safe') icon = '🛡️';
  else if(reward.type === 'points') icon = '💰';
  else if(reward.type === 'hint') icon = '🗺️';
  else if(reward.type === 'double') icon = '✖️';
  else if(reward.type === 'extra') icon = '⛏️';

  box.innerHTML = `
    <div class="big">${icon}</div>
    <h2>${esc(reward.text)}</h2>
    <p>Đội <b style="color:var(--gold)">${esc(currentTeam().name)}</b> đã được ghi nhận phần thưởng.</p>
  `;
  $('#ovReward').classList.add('show');
  if(reward.type === 'big') confetti(240);
}

function closeReward(){
  $('#ovReward').classList.remove('show');
  const cell = S.cells[currentCellIdx];
  if(cell.type === 'special'){
    setTimeout(() => openStealModal(), 100);
  } else {
    setTimeout(() => closeQuestionAndContinue(), 100);
  }
}

/* ===== STEAL ===== */
function openStealModal(){
  if(!S.stealEnabled){
    setTimeout(() => closeQuestionAndContinue(), 50);
    return;
  }
  const cur = currentTeam();
  const others = S.teams.map((t, i) => ({...t, idx:i}))
    .filter(t => t.idx !== S.currentTeam);
  $('#stealDesc').textContent = `${cur.name} đã trả lời đúng ô tranh đoạt! Chọn một đội để cướp 100 điểm.`;
  $('#stealList').innerHTML = others.map(t => `
    <div class="steal-item" data-steal="${t.idx}">
      <div class="av">${avatarSVG(TEAM_THEMES[t.idx])}</div>
      <div class="nm">${esc(t.name)}</div>
      <div class="pt">${t.points} điểm</div>
    </div>`).join('');
  $('#stealList').querySelectorAll('[data-steal]').forEach(el => {
    el.addEventListener('click', () => doSteal(+el.dataset.steal));
  });
  $('#ovSteal').classList.add('show');
}

function doSteal(targetIdx){
  const cur = currentTeam();
  const tgt = S.teams[targetIdx];
  const amount = Math.min(100, Math.max(0, tgt.points));
  tgt.points -= amount;
  cur.points += amount;
  $('#ovSteal').classList.remove('show');
  Sfx.chest();
  toast(`⚔️ ${cur.name} cướp ${amount} điểm từ ${tgt.name}!`);
  save(); render();
  setTimeout(() => closeQuestionAndContinue(), 900);
}

/* ===== ITEMS ===== */
function useItem(idx){
  const t = currentTeam();
  const k = t.items[idx];
  if(!k) return;
  const it = ITEMS[k];
  confirmDialog(`Sử dụng <b>${esc(it.name)}</b>?<br>${esc(it.desc)}`, () => {
    performItem(k, idx);
  });
}
function performItem(k, idx){
  const t = currentTeam();
  switch(k){
    case 'shield':
      shieldPending = true;
      toast('🛡️ Khiên đã bật, chặn lần trừ điểm tới.');
      break;
    case 'lucky':
      luckyActive = true;
      toast('🍀 Bùa may mắn: nhân đôi điểm câu hỏi rương tiếp theo!');
      break;
    case 'pickaxe':
      extraTurn = true;
      toast('⛏️ Bạn có thêm 1 lượt khám phá.');
      break;
    case 'compass': {
      const cands = S.cells.filter(c => !c.opened && (c.type === 'gold' || c.type === 'secret'));
      if(cands.length === 0){ toast('Không còn ô tiềm năng'); return; }
      cands.forEach(c => c.clue = 'gold');
      toast('🧭 Đã đánh dấu các ô có khả năng chứa thưởng lớn!');
      break;
    }
    case 'masterKey':
      toast('🔑 Chìa khóa vạn năng: đủ điều kiện mở kho báu cuối.');
      break;
    case 'secretMap':
      toast('🗺️ Bản đồ bí mật: khi xem câu hỏi, bấm "Đổi địa điểm".');
      break;
  }
  t.itemsUsed += 1;
  t.items.splice(idx, 1);
  Sfx.click();
  save(); render();
}

/* ===== CONFIRM ===== */
function confirmDialog(html, cb){
  $('#cfText').innerHTML = html;
  $('#cfTitle').textContent = 'Xác nhận';
  confirmCb = cb;
  $('#ovConfirm').classList.add('show');
}

/* ===== CONTROLS ===== */
function skipQuestion(){
  $('#ovQuestion').classList.remove('show');
  toast('⏭️ Đã bỏ qua câu hỏi');
  if(!extraTurn) nextTurn();
  else { extraTurn = false; save(); render(); }
}
function manualAdjust(delta){
  pushHistory();
  const t = currentTeam();
  if(delta === 'key') t.keys += 1;
  else if(delta === '-key') t.keys = Math.max(0, t.keys - 1);
  else t.points = Math.max(0, t.points + delta);
  Sfx.click();
  save(); render();
}
function extraTurnFn(){
  extraTurn = true;
  toast('⛏️ Đã kích hoạt lượt thêm cho đội hiện tại.');
  save(); render();
}
function bonusMission(){
  pushHistory();
  const t = currentTeam();
  const lowest = [...S.teams].sort((a, b) => a.points - b.points)[0];
  if(t === lowest){ t.points += 80; toast(`🌟 Nhiệm vụ phụ: ${t.name} +80 điểm`); }
  else { t.points += 40; toast(`🌟 Nhiệm vụ phụ: ${t.name} +40 điểm`); }
  save(); render();
}

/* ===== PHASES ===== */
function openFinalPhase(){
  const qualified = S.teams.filter(t =>
    t.keys >= 3 || t.items.includes('masterKey')
  );
  if(qualified.length === 0){
    const status = S.teams.map(t => {
      const k = t.keys + (t.items.includes('masterKey') ? 3 : 0);
      return `${t.name}: ${k}/3`;
    }).join(' · ');
    toast(`❌ Chưa có đội nào đủ 3 chìa khóa!\n${status}`, 3500);
    return;
  }
  // Kiểm tra vùng 4 đã mở chưa
  if(!isZoneUnlocked(4)){
    toast('🔒 Phải hoàn thành Hòn đảo thất lạc (Vùng 4) trước khi mở kho báu cuối!', 3200);
    return;
  }
  pushHistory();
  S.phase = 4;
  const names = qualified.map(t => t.name).join(', ');
  toast(`💎 Khu kho báu cuối đã mở! Đủ điều kiện: ${names}`, 3200);
  Sfx.win();
  save(); render();
}

function endGame(){
  confirmDialog('Kết thúc game và công bố kết quả?', () => {
    pushHistory();
    S.phase = 5;
    S.ended = true;
    Sfx.win();
    confetti(260);
    save(); render();
  });
}

function renderEnd(){
  const sorted = [...S.teams].map((t, i) => ({...t, idx:i}))
    .sort((a, b) => b.points - a.points);
  const mostKeys = [...sorted].sort((a, b) => b.keys - a.keys)[0];
  const mostTreasure = [...sorted].sort((a, b) => b.treasures - a.treasures)[0];
  const champion = sorted[0];

  let html = `<div class="hero">
    <h1>🏆 KẾT QUẢ CUỘC HÀNH TRÌNH</h1>
    <p>Chúc mừng tất cả nhà thám hiểm đã hoàn thành chuyến phiêu lưu!</p>
  </div>`;

  html += `<div class="podium">`;
  sorted.forEach((t, i) => {
    const theme = TEAM_THEMES[t.idx];
    const crown = i === 0 ? '<div class="crown">👑</div>' : '<div class="crown"></div>';
    html += `<div class="pod ${i === 0 ? 'p1' : ''}">
      ${crown}
      <div class="av">${avatarSVG(theme)}</div>
      <div class="nm">${esc(t.name)}</div>
      <div class="pt">${t.points}</div>
      <div class="dt">🗝️ ${t.keys} · 💎 ${t.treasures} · 🎁 ${t.itemsUsed}</div>
    </div>`;
  });
  html += `</div>`;

  html += `<div class="titles">
    <div class="title-card"><span class="ic">🏅</span><b>Nhà thám hiểm xuất sắc nhất</b><span>${esc(champion.name)} — ${champion.points} điểm</span></div>
    <div class="title-card"><span class="ic">💰</span><b>Đội giàu điểm nhất</b><span>${esc(champion.name)} — ${champion.points} điểm</span></div>
    <div class="title-card"><span class="ic">🗝️</span><b>Đội nhiều chìa khóa nhất</b><span>${esc(mostKeys.name)} — ${mostKeys.keys} chìa</span></div>
    <div class="title-card"><span class="ic">🍀</span><b>Đội may mắn nhất</b><span>${esc(mostTreasure.name)} — ${mostTreasure.treasures} kho báu</span></div>
  </div>`;

  html += `<div class="center" style="margin-top:18px">
    <button class="btn gold" id="btnReplay">🔁 CHƠI LẠI TỪ ĐẦU</button>
  </div>`;

  $('#endView').innerHTML = html;
  $('#btnReplay').addEventListener('click', resetGame);
}

function resetGame(){
  confirmDialog('Xóa toàn bộ tiến trình và chơi lại từ đầu?', () => {
    localStorage.removeItem(LS_STATE);
    localStorage.removeItem(LS_Q);
    S = defaultState();
    QUESTIONS = DEFAULT_QUESTIONS.map(q => ({...q}));
    S.settings.sound = Sfx.get();
    extraTurn = false;
    luckyActive = false;
    shieldPending = false;
    save(); render();
    toast('🔄 Đã chơi lại từ đầu!');
  });
}

/* ===== EDITOR ===== */
function openEditor(){
  $('#ovEditor').classList.add('show');
  renderEditor();
}
function renderEditor(){
  const list = $('#qList');
  $('#qCount').textContent = `${QUESTIONS.length} câu hỏi`;
  list.innerHTML = QUESTIONS.map((q, i) => {
    const dc = q.difficulty === 'easy' ? 'tag easy' : q.difficulty === 'mid' ? 'tag mid' : 'tag hard';
    const dl = q.difficulty === 'easy' ? 'Dễ' : q.difficulty === 'mid' ? 'TB' : 'Khó';
    return `<div class="qrow">
      <span class="${dc} mini">${dl}</span>
      <span class="qt">${esc(q.q)}</span>
      <button class="btn sm" data-edit="${i}">✏️</button>
      <button class="btn sm red" data-del="${i}">🗑️</button>
    </div>`;
  }).join('');
  list.querySelectorAll('[data-edit]').forEach(el => el.addEventListener('click', () => editQ(+el.dataset.edit)));
  list.querySelectorAll('[data-del]').forEach(el => el.addEventListener('click', () => {
    QUESTIONS.splice(+el.dataset.del, 1);
    save(); renderEditor();
  }));
}
function showQForm(q, idx){
  editingIdx = idx;
  $('#fQ').value = q.q || '';
  $('#fTopic').value = q.topic || '';
  $('#fA').value = q.options?.[0] || '';
  $('#fB').value = q.options?.[1] || '';
  $('#fC').value = q.options?.[2] || '';
  $('#fD').value = q.options?.[3] || '';
  $('#fAns').value = String(q.answer ?? 0);
  $('#fDiff').value = q.difficulty || 'easy';
  $('#fPts').value = q.points || 100;
  $('#fExp').value = q.explain || '';
  $('#qForm').style.display = 'block';
}
function editQ(i){ showQForm(QUESTIONS[i], i); }
function addQ(){ showQForm({options:['','','',''],answer:0,difficulty:'easy',points:100}, -1); }
function saveQ(){
  const q = {
    id: editingIdx >= 0 ? QUESTIONS[editingIdx].id : uid(),
    topic: $('#fTopic').value.trim() || 'Khác',
    difficulty: $('#fDiff').value,
    points: parseInt($('#fPts').value) || 100,
    q: $('#fQ').value.trim(),
    options: [$('#fA').value.trim(), $('#fB').value.trim(), $('#fC').value.trim(), $('#fD').value.trim()],
    answer: parseInt($('#fAns').value),
    explain: $('#fExp').value.trim()
  };
  if(!q.q){ toast('Chưa nhập câu hỏi'); return; }
  if(q.options.some(o => !o)){ toast('Điền đủ 4 đáp án'); return; }
  if(editingIdx >= 0) QUESTIONS[editingIdx] = q;
  else QUESTIONS.push(q);
  $('#qForm').style.display = 'none';
  editingIdx = -1;
  save(); renderEditor();
  toast('💾 Đã lưu câu hỏi');
}

/* ===== BIND ===== */
function bind(){
  $('#btnStart').addEventListener('click', startGame);
  $('#btnTurn').addEventListener('click', nextTurn);
  $('#btnUndo').addEventListener('click', undo);
  $('#btnFinalPhase').addEventListener('click', openFinalPhase);
  $('#btnEndGame').addEventListener('click', endGame);
  $('#btnSave').addEventListener('click', () => { save(); toast('💾 Đã lưu tiến trình'); });
  $('#btnReset').addEventListener('click', resetGame);
  $('#btnPrevTeam').addEventListener('click', prevTeam);
  $('#btnNextTeam').addEventListener('click', nextTurn);
  $('#btnExtra').addEventListener('click', extraTurnFn);
  $('#btnBonus').addEventListener('click', bonusMission);

  $$('[data-adj]').forEach(el => {
    el.addEventListener('click', () => manualAdjust(el.dataset.adj === 'key' ? 'key'
      : el.dataset.adj === '-key' ? '-key' : parseInt(el.dataset.adj)));
  });

  $('#btnSound').addEventListener('click', () => {
    S.settings.sound = !S.settings.sound;
    Sfx.set(S.settings.sound);
    save(); renderTopbar();
  });
  $('#btnFx').addEventListener('click', () => {
    S.settings.fx = !S.settings.fx;
    save(); renderTopbar();
  });
  $('#btnFull').addEventListener('click', () => {
    if(!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  });
  $('#btnEditor').addEventListener('click', openEditor);
  $('#btnCloseEditor').addEventListener('click', () => $('#ovEditor').classList.remove('show'));
  $('#btnAddQ').addEventListener('click', addQ);
  $('#btnSaveQ').addEventListener('click', saveQ);
  $('#btnCancelQ').addEventListener('click', () => { $('#qForm').style.display = 'none'; editingIdx = -1; });
  $('#btnRestoreQ').addEventListener('click', () => {
    confirmDialog('Khôi phục bộ câu hỏi mặc định?', () => {
      QUESTIONS = DEFAULT_QUESTIONS.map(q => ({...q}));
      save(); renderEditor();
      toast('♻️ Đã khôi phục');
    });
  });
  $('#btnDelAllQ').addEventListener('click', () => {
    confirmDialog('Xóa tất cả câu hỏi?', () => {
      QUESTIONS = []; save(); renderEditor();
    });
  });
  $('#btnExportQ').addEventListener('click', () => {
    const data = JSON.stringify(QUESTIONS, null, 2);
    const blob = new Blob([data], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'cau_hoi_kho_bau.json';
    a.click();
    toast('⬇️ Đã xuất JSON');
  });
  $('#btnImportQ').addEventListener('click', () => {
    const ta = $('#jsonArea');
    ta.style.display = 'block';
    ta.focus();
    toast('Dán JSON vào ô rồi bấm "NHẬP JSON" lần nữa');
    $('#btnImportQ').textContent = '✔️ NHẬP JSON';
    $('#btnImportQ').onclick = () => {
      try {
        const data = JSON.parse(ta.value);
        if(!Array.isArray(data)) throw new Error('not array');
        QUESTIONS = data.map(q => ({
          id: q.id || uid(),
          topic: q.topic || 'Khác',
          difficulty: ['easy','mid','hard'].includes(q.difficulty) ? q.difficulty : 'easy',
          points: q.points || 100,
          q: String(q.q || ''),
          options: Array.isArray(q.options) && q.options.length === 4 ? q.options.map(String) : ['','','',''],
          answer: clamp(parseInt(q.answer) || 0, 0, 3),
          explain: String(q.explain || '')
        }));
        save();
        toast(`✅ Đã nhập ${QUESTIONS.length} câu hỏi`);
        location.reload();
      } catch(e){ toast('❌ JSON không hợp lệ'); }
    };
  });

  $('#btnConfirmAns').addEventListener('click', confirmAnswer);
  $('#btnSkipQ').addEventListener('click', skipQuestion);
  $('#btnContinueQ').addEventListener('click', () => {
    if(S.cells[currentCellIdx] && S.cells[currentCellIdx].type === 'special'
       && selectedAnswer === currentQuestion.answer){
      $('#ovQuestion').classList.remove('show');
      setTimeout(() => openStealModal(), 100);
    } else {
      closeQuestionAndContinue();
    }
  });
  $('#btnSecretMap').addEventListener('click', () => {
    if(questionPhase !== 'idle'){ toast('Không thể đổi lúc này'); return; }
    const t = currentTeam();
    const idx = t.items.indexOf('secretMap');
    if(idx < 0){ toast('Bạn không có Bản đồ bí mật'); return; }
    t.items.splice(idx, 1);
    t.itemsUsed += 1;
    $('#ovQuestion').classList.remove('show');
    toast('🗺️ Hãy chọn địa điểm khác!');
    save(); render();
  });

  $('#btnCloseReward').addEventListener('click', closeReward);
  $('#btnCancelSteal').addEventListener('click', () => {
    $('#ovSteal').classList.remove('show');
    setTimeout(() => closeQuestionAndContinue(), 100);
  });
  $('#cfYes').addEventListener('click', () => {
    const cb = confirmCb; confirmCb = null;
    $('#ovConfirm').classList.remove('show');
    if(cb) cb();
  });
  $('#cfNo').addEventListener('click', () => {
    confirmCb = null;
    $('#ovConfirm').classList.remove('show');
  });

  document.addEventListener('keydown', e => {
    if(e.key === 'Escape'){
      ['ovQuestion','ovReward','ovSteal','ovConfirm'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.classList.remove('show');
      });
    }
    if(['1','2','3','4'].includes(e.key)){
      if($('#ovQuestion').classList.contains('show') && questionPhase === 'idle'){
        selectAnswer(parseInt(e.key) - 1);
      }
    }
    if(e.key === 'Enter'){
      if($('#ovQuestion').classList.contains('show') && questionPhase === 'idle' && selectedAnswer >= 0){
        confirmAnswer();
      } else if($('#ovQuestion').classList.contains('show') && questionPhase === 'answered'){
        $('#btnContinueQ').click();
      }
    }
  });
}

/* ===== INIT ===== */
function init(){
  if(!load()){
    S = defaultState();
    QUESTIONS = DEFAULT_QUESTIONS.map(q => ({...q}));
  }
  S.settings.sound = true;
  Sfx.set(true);
  bind();
  render();
}
document.addEventListener('DOMContentLoaded', init);