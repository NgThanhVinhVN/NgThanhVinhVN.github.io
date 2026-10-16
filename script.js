/* =========================================================
   ĐƯỜNG ĐUA LỊCH SỬ – HISTORY GRAND PRIX
   JavaScript thuần – không thư viện ngoài
   ========================================================= */
(function(){
"use strict";

/* ---------- HẰNG SỐ ---------- */
const TOTAL_CELLS = 30;
const QUESTIONS_PER_TEAM = 10;
const NUM_TEAMS = 5;
const STORAGE_KEY = "duong_dua_lich_su_5_doi_v1";

const TEAM_COLORS = [
  {name:"Đội 1", color:"#ff3b3b", text:"#fff", icon:"🔴"},
  {name:"Đội 2", color:"#3b82f6", text:"#fff", icon:"🔵"},
  {name:"Đội 3", color:"#22c55e", text:"#08101f", icon:"🟢"},
  {name:"Đội 4", color:"#a855f7", text:"#fff", icon:"🟣"},
  {name:"Đội 5", color:"#fbbf24", text:"#08101f", icon:"🟡"}
];

const SPECIAL_CELLS = {
  0:{type:"start", icon:"🏁", label:"Xuất phát"},
  3:{type:"bonus", icon:"💰", label:"Thưởng"},
  5:{type:"boost", icon:"🚀", label:"Tăng tốc"},
  7:{type:"obstacle", icon:"⛔", label:"Chướng ngại"},
  9:{type:"lucky", icon:"🍀", label:"May mắn"},
  11:{type:"magic", icon:"🔮", label:"Bùa phép"},
  13:{type:"bonus", icon:"💰", label:"Thưởng"},
  15:{type:"obstacle", icon:"⛔", label:"Chướng ngại"},
  17:{type:"boost", icon:"🚀", label:"Tăng tốc"},
  19:{type:"lucky", icon:"🍀", label:"May mắn"},
  21:{type:"magic", icon:"🔮", label:"Bùa phép"},
  23:{type:"bonus", icon:"💰", label:"Thưởng"},
  25:{type:"obstacle", icon:"⛔", label:"Chướng ngại"},
  27:{type:"boost", icon:"🚀", label:"Tăng tốc"},
  29:{type:"lucky", icon:"🍀", label:"May mắn"},
  30:{type:"finish", icon:"🏆", label:"Đích"}
};

const SPELLS = {
  boost:{icon:"🚀", name:"Tăng tốc", desc:"+2 ô vào lần gieo kế tiếp"},
  shield:{icon:"🛡️", name:"Khiên", desc:"Chặn một lần bị lùi"},
  jump:{icon:"💥", name:"Bước nhảy", desc:"Tiến thêm 4 ô ngay lập tức"},
  luck:{icon:"🍀", name:"May mắn", desc:"Nhận 200 điểm"},
  ticket:{icon:"🎟️", name:"Vé bổ sung", desc:"Nhận thêm 1 vé gieo"}
};

/* ---------- BỘ CÂU HỎI MẪU (50 CÂU) ---------- */
/* Bộ câu hỏi tham khảo – MC kiểm tra trước khi dùng. */
function buildDefaultQuestions(){
  return [
    /* ĐỘI 1 */
    [
      {question:"Đảng Cộng sản Việt Nam được thành lập vào ngày nào?", answer:"Ngày 3/2/1930, tại Cửu Long (Hương Cảng, Trung Quốc)."},
      {question:"Hội nghị thành lập Đảng đầu năm 1930 do ai chủ trì?", answer:"Nguyễn Ái Quốc (Hồ Chí Minh) chủ trì, với sự tham gia của đại diện các tổ chức cộng sản."},
      {question:"Tên gọi đầu tiên của Đảng khi thành lập là gì?", answer:"Đảng Cộng sản Việt Nam."},
      {question:"Cương lĩnh chính trị đầu tiên của Đảng do ai soạn thảo?", answer:"Nguyễn Ái Quốc soạn thảo, được thông qua tại Hội nghị thành lập Đảng (3/2/1930)."},
      {question:"Cương lĩnh chính trị đầu tiên xác định nhiệm vụ chiến lược của cách mạng Việt Nam là gì?", answer:"Làm cách mạng tư sản dân quyền và cách mạng thổ địa để đi tới xã hội cộng sản."},
      {question:"Cương lĩnh chính trị đầu tiên xác định lực lượng cách mạng gồm những giai cấp nào?", answer:"Công nhân, nông dân, tiểu tư sản, trí thức; lôi kéo hoặc trung lập phú nông, trung nông, tiểu địa chủ và tư sản dân tộc."},
      {question:"Cương lĩnh chính trị đầu tiên khẳng định vai trò lãnh đạo của giai cấp nào?", answer:"Giai cấp công nhân thông qua Đảng Cộng sản."},
      {question:"Phong trào cách mạng 1930–1931 đạt đỉnh cao với sự kiện nào?", answer:"Phong trào Xô viết Nghệ – Tĩnh, đỉnh cao là các cuộc đấu tranh của công nhân, nông dân Nghệ An và Hà Tĩnh."},
      {question:"Chính quyền Xô viết Nghệ – Tĩnh tồn tại trong khoảng thời gian nào?", answer:"Từ cuối năm 1930 đến giữa năm 1931."},
      {question:"Hội nghị Trung ương 8 (tháng 5/1941) do ai chủ trì?", answer:"Nguyễn Ái Quốc chủ trì, tại Pác Bó (Cao Bằng)."}
    ],
    /* ĐỘI 2 */
    [
      {question:"Hội nghị Trung ương 8 (5/1941) quyết định thành lập mặt trận nào?", answer:"Mặt trận Việt Minh (Việt Nam Độc lập Đồng minh)."},
      {question:"Mặt trận Việt Minh ra đời nhằm mục đích gì?", answer:"Đoàn kết toàn dân tộc chống đế quốc Pháp – phát xít Nhật, giành độc lập dân tộc."},
      {question:"Cách mạng Tháng Tám năm 1945 nổ ra và giành thắng lợi trong khoảng thời gian nào?", answer:"Từ ngày 14/8/1945 đến ngày 25/8/1945; Tổng khởi nghĩa giành chính quyền trong cả nước."},
      {question:"Ngày 2/9/1945 tại Quảng trường Ba Đình, Chủ tịch Hồ Chí Minh đọc văn bản gì?", answer:"Tuyên ngôn Độc lập, khai sinh nước Việt Nam Dân chủ Cộng hòa."},
      {question:"Kháng chiến toàn quốc chống thực dân Pháp bùng nổ vào ngày nào?", answer:"Ngày 19/12/1946, sau Lời kêu gọi toàn quốc kháng chiến của Chủ tịch Hồ Chí Minh."},
      {question:"Chiến dịch nào kết thúc thắng lợi cuộc kháng chiến chống Pháp (1946–1954)?", answer:"Chiến dịch Điện Biên Phủ (13/3 – 7/5/1954)."},
      {question:"Chiến thắng Điện Biên Phủ diễn ra vào ngày nào?", answer:"Ngày 7/5/1954, quân đội ta giành thắng lợi hoàn toàn."},
      {question:"Hiệp định nào được ký kết năm 1954 chấm dứt chiến tranh ở Đông Dương?", answer:"Hiệp định Genève (21/7/1954)."},
      {question:"Sau Hiệp định Genève 1954, đất nước Việt Nam tạm thời bị chia cắt tại vĩ tuyến nào?", answer:"Vĩ tuyến 17 (sông Bến Hải, Quảng Trị)."},
      {question:"Đại hội lần thứ III của Đảng (9/1960) xác định nhiệm vụ cách mạng Việt Nam như thế nào?", answer:"Cách mạng xã hội chủ nghĩa ở miền Bắc và cách mạng dân tộc dân chủ nhân dân ở miền Nam, tiến tới thống nhất đất nước."}
    ],
    /* ĐỘI 3 */
    [
      {question:"Đường lối cách mạng Việt Nam giai đoạn 1954–1975 được Đại hội III (1960) xác định gồm mấy nhiệm vụ chiến lược?", answer:"Hai nhiệm vụ chiến lược: cách mạng XHCN ở miền Bắc và cách mạng dân tộc dân chủ nhân dân ở miền Nam."},
      {question:"Phong trào Đồng khởi nổ ra mạnh mẽ nhất ở tỉnh nào năm 1960?", answer:"Bến Tre (17/1/1960), sau đó lan rộng khắp miền Nam."},
      {question:"Mặt trận Dân tộc Giải phóng miền Nam Việt Nam được thành lập vào ngày nào?", answer:"Ngày 20/12/1960."},
      {question:"Chiến thắng Ấp Bắc (1/1963) có ý nghĩa gì?", answer:"Đánh bại chiến thuật “trực thăng vận”, “thiết xa vận” của Mỹ – ngụy, mở đầu phong trào “thi đua Ấp Bắc, giết giặc lập công”."},
      {question:"Tổng tiến công và nổi dậy Tết Mậu Thân diễn ra vào năm nào?", answer:"Năm 1968."},
      {question:"Chiến thắng “Điện Biên Phủ trên không” diễn ra vào năm nào?", answer:"Tháng 12/1972, đánh bại cuộc tập kích chiến lược bằng B-52 của Mỹ vào Hà Nội, Hải Phòng."},
      {question:"Hiệp định Paris về chấm dứt chiến tranh, lập lại hòa bình ở Việt Nam được ký ngày nào?", answer:"Ngày 27/1/1973."},
      {question:"Đại thắng mùa Xuân năm 1975 đỉnh cao là chiến dịch nào?", answer:"Chiến dịch Hồ Chí Minh (26/4 – 30/4/1975)."},
      {question:"Ngày giải phóng miền Nam, thống nhất đất nước là ngày nào?", answer:"Ngày 30/4/1975."},
      {question:"Đại hội lần thứ IV của Đảng (12/1976) có ý nghĩa gì?", answer:"Đại hội đầu tiên sau khi đất nước thống nhất, đề ra đường lối xây dựng CNXH trên phạm vi cả nước."}
    ],
    /* ĐỘI 4 */
    [
      {question:"Đại hội lần thứ VI của Đảng (12/1986) đề ra đường lối gì?", answer:"Đường lối đổi mới toàn diện, đánh dấu bước ngoặt trong sự nghiệp xây dựng CNXH ở Việt Nam."},
      {question:"Đại hội VI (1986) xác định nhiệm vụ trọng tâm trước mắt là gì?", answer:"Thực hiện ba chương trình kinh tế: lương thực – thực phẩm, hàng tiêu dùng và hàng xuất khẩu."},
      {question:"Đại hội lần thứ VII của Đảng diễn ra năm nào?", answer:"Năm 1991."},
      {question:"Đại hội VII (1991) thông qua văn kiện quan trọng nào?", answer:"Cương lĩnh xây dựng đất nước trong thời kỳ quá độ lên CNXH và Chiến lược ổn định và phát triển kinh tế – xã hội đến năm 2000."},
      {question:"Đại hội lần thứ VIII của Đảng diễn ra năm nào?", answer:"Năm 1996."},
      {question:"Đại hội VIII (1996) khẳng định nước ta đã ra khỏi khủng hoảng kinh tế – xã hội chưa?", answer:"Khẳng định đã ra khỏi khủng hoảng kinh tế – xã hội, bước vào thời kỳ đẩy mạnh CNH – HĐH đất nước."},
      {question:"Đại hội lần thứ IX của Đảng diễn ra năm nào?", answer:"Năm 2001."},
      {question:"Đại hội IX (2001) xác định mục tiêu tổng quát là gì?", answer:"Đẩy mạnh CNH – HĐH, xây dựng và bảo vệ Tổ quốc Việt Nam XHCN, vì mục tiêu dân giàu, nước mạnh, xã hội công bằng, dân chủ, văn minh."},
      {question:"Đại hội lần thứ X của Đảng diễn ra năm nào?", answer:"Năm 2006."},
      {question:"Đại hội X (2006) đề ra chủ trương gì nổi bật về kinh tế?", answer:"Chủ trương phát triển nền kinh tế thị trường định hướng XHCN, đẩy mạnh CNH – HĐH và hội nhập kinh tế quốc tế."}
    ],
    /* ĐỘI 5 */
    [
      {question:"Đại hội lần thứ XI của Đảng diễn ra năm nào?", answer:"Năm 2011."},
      {question:"Đại hội XI (2011) thông qua văn kiện quan trọng nào?", answer:"Cương lĩnh xây dựng đất nước trong thời kỳ quá độ lên CNXH (bổ sung, phát triển năm 2011) và Chiến lược phát triển kinh tế – xã hội 2011–2020."},
      {question:"Đại hội lần thứ XII của Đảng diễn ra năm nào?", answer:"Năm 2016."},
      {question:"Đại hội XII (2016) nhấn mạnh nhiệm vụ gì?", answer:"Tăng cường xây dựng, chỉnh đốn Đảng; ngăn chặn, đẩy lùi sự suy thoái về tư tưởng chính trị, đạo đức, lối sống, biểu hiện “tự diễn biến”, “tự chuyển hóa”."},
      {question:"Đại hội lần thứ XIII của Đảng diễn ra năm nào?", answer:"Năm 2021."},
      {question:"Đại hội XIII (2021) xác định mục tiêu đến năm 2030 là gì?", answer:"Trở thành nước đang phát triển có công nghiệp hiện đại, thu nhập trung bình cao."},
      {question:"Đại hội XIII (2021) xác định mục tiêu đến năm 2045 là gì?", answer:"Trở thành nước phát triển, thu nhập cao."},
      {question:"Đảng Cộng sản Việt Nam lấy chủ nghĩa nào làm nền tảng tư tưởng?", answer:"Chủ nghĩa Mác – Lênin và tư tưởng Hồ Chí Minh."},
      {question:"Nguyên tắc tổ chức cơ bản của Đảng Cộng sản Việt Nam là gì?", answer:"Tập trung dân chủ."},
      {question:"Đảng Cộng sản Việt Nam là đội tiên phong của giai cấp nào?", answer:"Giai cấp công nhân, đồng thời là đội tiên phong của nhân dân lao động và của dân tộc Việt Nam."}
    ]
  ];
}

/* ---------- TRẠNG THÁI ---------- */
let state = null;

function createInitialState(questions){
  return {
    questions: questions || buildDefaultQuestions(),
    teams: TEAM_COLORS.map((c,i)=>({
      id:i,
      name:c.name,
      color:c.color,
      text:c.text,
      icon:c.icon,
      pos:0,
      score:0,
      used:0,          /* số câu đã dùng */
      dice:0,          /* vé gieo xúc xắc */
      spells:[],       /* mảng key bùa */
      finished:false,
      currentQ:-1,     /* index câu đang hỏi */
      qAnswered:false  /* câu hiện tại đã chấm chưa */
    })),
    activeTeam:0,
    log:[],
    winner:null,
    raceOver:false
  };
}

/* ---------- TIỆN ÍCH ---------- */
function $(id){return document.getElementById(id);}
function esc(s){
  return String(s==null?"":s)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}
function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
function rand(min,max){return Math.floor(Math.random()*(max-min+1))+min;}
function deepClone(o){return JSON.parse(JSON.stringify(o));}

/* ---------- THÔNG BÁO ---------- */
let flashTimer=null;
function flash(msg,bad){
  const el=$("flash");
  el.textContent=msg;
  el.classList.toggle("bad",!!bad);
  el.classList.add("show");
  if(flashTimer)clearTimeout(flashTimer);
  flashTimer=setTimeout(()=>el.classList.remove("show"),2200);
}

/* ---------- NHẬT KÝ ---------- */
function addLog(msg,kind){
  if(!state)return;
  const time=new Date().toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"});
  state.log.unshift({msg,kind:kind||"",time});
  if(state.log.length>60)state.log.length=60;
}

/* ---------- LƯU / TẢI ---------- */
let saveOk=true;
function save(){
  if(!state)return;
  try{
    localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
    saveOk=true;
    const tag=$("saveTag");
    tag.textContent="💾 Đã lưu";
    tag.style.color="";
  }catch(e){
    saveOk=false;
    const tag=$("saveTag");
    tag.textContent="⚠️ Không lưu được";
    tag.style.color="#f87171";
  }
}
function load(){
  try{
    const raw=localStorage.getItem(STORAGE_KEY);
    if(!raw)return null;
    const data=JSON.parse(raw);
    if(!data||!Array.isArray(data.teams)||data.teams.length!==NUM_TEAMS)return null;
    if(!Array.isArray(data.questions)||data.questions.length!==NUM_TEAMS)return null;
    for(let i=0;i<NUM_TEAMS;i++){
      if(!Array.isArray(data.questions[i])||data.questions[i].length!==QUESTIONS_PER_TEAM)return null;
    }
    /* chuẩn hóa */
    data.teams.forEach((t,i)=>{
      t.id=i;
      t.pos=clamp(Number(t.pos)||0,0,TOTAL_CELLS);
      t.score=Number(t.score)||0;
      t.used=Number(t.used)||0;
      t.dice=Number(t.dice)||0;
      t.finished=!!t.finished;
      t.spells=Array.isArray(t.spells)?t.spells:[];
      t.currentQ=Number.isInteger(t.currentQ)?t.currentQ:-1;
      t.qAnswered=!!t.qAnswered;
      if(!t.color)t.color=TEAM_COLORS[i].color;
      if(!t.text)t.text=TEAM_COLORS[i].text;
      if(!t.icon)t.icon=TEAM_COLORS[i].icon;
      if(!t.name)t.name=TEAM_COLORS[i].name;
    });
    if(!Array.isArray(data.log))data.log=[];
    if(typeof data.activeTeam!=="number"||data.activeTeam<0||data.activeTeam>=NUM_TEAMS)data.activeTeam=0;
    return data;
  }catch(e){
    return null;
  }
}

/* ---------- RENDER BÀN ĐUA ---------- */
function renderBoard(){
  const board=$("board");
  board.innerHTML="";
  for(let i=0;i<=TOTAL_CELLS;i++){
    const special=SPECIAL_CELLS[i];
    const cell=document.createElement("div");
    cell.className="cell";
    cell.dataset.pos=i;
    if(special){
      cell.classList.add(special.type);
    }
    const num=document.createElement("div");
    num.className="num";
    num.textContent=i;
    cell.appendChild(num);

    if(special){
      const ic=document.createElement("div");
      ic.className="icon";
      ic.textContent=special.icon;
      cell.appendChild(ic);
    }

    const tokens=document.createElement("div");
    tokens.className="tokens";
    tokens.id="tokens-"+i;
    cell.appendChild(tokens);

    if(special){
      const lb=document.createElement("div");
      lb.className="label";
      lb.textContent=special.label;
      cell.appendChild(lb);
    }

    board.appendChild(cell);
  }
  renderTokens();
}

function renderTokens(){
  /* clear */
  for(let i=0;i<=TOTAL_CELLS;i++){
    const c=$("tokens-"+i);
    if(c)c.innerHTML="";
  }
  if(!state)return;
  /* nhóm đội theo vị trí để xếp chồng đẹp */
  const groups={};
  state.teams.forEach(t=>{
    if(!groups[t.pos])groups[t.pos]=[];
    groups[t.pos].push(t);
  });
  Object.keys(groups).forEach(pos=>{
    const container=$("tokens-"+pos);
    if(!container)return;
    groups[pos].forEach(t=>{
      const tk=document.createElement("div");
      tk.className="token";
      tk.style.background=t.color;
      tk.style.color=t.color;
      tk.style.borderColor=t.color;
      tk.textContent=t.icon;
      tk.title=t.name+" – Ô "+t.pos;
      tk.dataset.team=t.id;
      container.appendChild(tk);
    });
  });
}

/* ---------- RENDER ĐỘI ---------- */
function renderTeams(){
  const wrap=$("teams");
  wrap.innerHTML="";
  state.teams.forEach(t=>{
    const card=document.createElement("div");
    card.className="team-card";
    if(state.activeTeam===t.id)card.classList.add("active");
    if(t.finished)card.classList.add("done");
    card.dataset.team=t.id;

    const head=document.createElement("div");
    head.className="team-head";

    const dot=document.createElement("div");
    dot.className="team-dot";
    dot.style.background=t.color;
    dot.style.color=t.color;
    dot.textContent=t.icon;
    head.appendChild(dot);

    const nameWrap=document.createElement("div");
    nameWrap.style.flex="1";
    nameWrap.style.minWidth="0";
    const nameInput=document.createElement("input");
    nameInput.className="team-name";
    nameInput.value=t.name;
    nameInput.dataset.team=t.id;
    nameInput.maxLength=30;
    nameInput.addEventListener("click",e=>e.stopPropagation());
    nameInput.addEventListener("change",e=>{
      const v=e.target.value.trim()||TEAM_COLORS[t.id].name;
      t.name=v;
      e.target.value=v;
      save();renderAll();
    });
    nameWrap.appendChild(nameInput);
    head.appendChild(nameWrap);

    card.appendChild(head);

    if(t.finished){
      const crown=document.createElement("div");
      crown.className="champ-crown";
      crown.textContent="👑";
      card.appendChild(crown);
    }

    const stats=document.createElement("div");
    stats.className="team-stats";
    stats.innerHTML=
      "<span>📍 Vị trí: <b>"+t.pos+"</b>/"+TOTAL_CELLS+"</span>"+
      "<span>⭐ Điểm: <b>"+t.score+"</b></span>"+
      "<span>📚 Câu đã dùng: <b>"+t.used+"</b>/10</span>"+
      "<span>🎟️ Vé gieo: <b>"+t.dice+"</b></span>";
    card.appendChild(stats);

    const spells=document.createElement("div");
    if(t.spells.length){
      t.spells.forEach(k=>{
        const b=document.createElement("span");
        b.className="badge";
        b.textContent=SPELLS[k].icon+" "+SPELLS[k].name;
        spells.appendChild(b);
      });
    }else{
      const b=document.createElement("span");
      b.className="badge";
      b.style.opacity=".55";
      b.textContent="Không có bùa";
      spells.appendChild(b);
    }
    card.appendChild(spells);

    card.addEventListener("click",()=>{
      if(state.raceOver && !t.finished && state.winner!=null){
        /* vẫn cho chọn xem, không sao */
      }
      state.activeTeam=t.id;
      save();renderAll();
    });

    wrap.appendChild(card);
  });
}

/* ---------- RENDER CÂU HỎI ---------- */
function renderQuestion(){
  const t=state.teams[state.activeTeam];
  const qText=$("qText");
  const qAnswer=$("qAnswer");
  const qTeamTag=$("qTeamTag");
  const qIndexTag=$("qIndexTag");
  const qDiceTag=$("qDiceTag");
  const qScoreTag=$("qScoreTag");
  const qPosTag=$("qPosTag");

  qTeamTag.textContent="Đang chọn: "+t.name;
  qDiceTag.textContent="🎟️ Vé gieo: "+t.dice;
  qScoreTag.textContent="⭐ Điểm: "+t.score;
  qPosTag.textContent="📍 Vị trí: "+t.pos;

  const btnOpen=$("btnOpenQ");
  const btnShow=$("btnShowA");
  const btnCorrect=$("btnCorrect");
  const btnWrong=$("btnWrong");
  const btnSkip=$("btnSkip");

  qAnswer.classList.remove("show");
  qAnswer.textContent="";

  if(state.raceOver){
    qText.textContent="🏁 Cuộc đua đã kết thúc. Nhấn “Chơi lại” để bắt đầu mùa giải mới.";
    btnOpen.disabled=true;
    btnShow.disabled=true;
    btnCorrect.disabled=true;
    btnWrong.disabled=true;
    btnSkip.disabled=true;
    qIndexTag.textContent="Câu: —/10";
    return;
  }

  if(t.finished){
    qText.textContent="🏆 "+t.name+" đã về đích. Không thể trả lời thêm câu hỏi.";
    btnOpen.disabled=true;
    btnShow.disabled=true;
    btnCorrect.disabled=true;
    btnWrong.disabled=true;
    btnSkip.disabled=true;
    qIndexTag.textContent="Câu: —/10";
    return;
  }

  if(t.currentQ<0){
    qText.textContent="Hãy chọn một đội, sau đó nhấn “Mở câu hỏi” để bắt đầu.";
    qIndexTag.textContent="Câu: —/10";
    btnOpen.disabled=false;
    btnShow.disabled=true;
    btnCorrect.disabled=true;
    btnWrong.disabled=true;
    btnSkip.disabled=true;
    return;
  }

  const q=state.questions[t.id][t.currentQ];
  if(!q){
    qText.textContent="Không tìm thấy câu hỏi. Vui lòng kiểm tra lại bộ câu hỏi.";
    btnOpen.disabled=true;
    btnShow.disabled=true;
    btnCorrect.disabled=true;
    btnWrong.disabled=true;
    btnSkip.disabled=true;
    return;
  }

  qIndexTag.textContent="Câu: "+(t.currentQ+1)+"/10";
  qText.textContent=q.question;

  if(t.qAnswered){
    qAnswer.textContent="Đáp án: "+q.answer;
    qAnswer.classList.add("show");
    btnOpen.disabled=true;
    btnShow.disabled=true;
    btnCorrect.disabled=true;
    btnWrong.disabled=true;
    btnSkip.disabled=true;
    qText.textContent=q.question+"\n\n✅ Câu này đã được chấm.";
  }else{
    btnOpen.disabled=true;
    btnShow.disabled=false;
    btnCorrect.disabled=false;
    btnWrong.disabled=false;
    btnSkip.disabled=false;
  }
}

/* ---------- RENDER XÚC XẮC & BÙA ---------- */
function renderDice(){
  const t=state.teams[state.activeTeam];
  const info=$("diceInfo");
  const btnRoll=$("btnRoll");
  const spellsWrap=$("spells");

  if(state.raceOver){
    info.textContent="🏁 Cuộc đua đã kết thúc";
    btnRoll.disabled=true;
  }else if(t.finished){
    info.textContent="🏆 "+t.name+" đã về đích";
    btnRoll.disabled=true;
  }else if(t.dice<=0){
    info.textContent=t.name+": hết vé gieo";
    btnRoll.disabled=true;
  }else{
    info.textContent=t.name+": còn "+t.dice+" vé";
    btnRoll.disabled=false;
  }

  spellsWrap.innerHTML="";
  Object.keys(SPELLS).forEach(key=>{
    const sp=SPELLS[key];
    const count=t.spells.filter(k=>k===key).length;
    const btn=document.createElement("button");
    btn.className="spell-btn";
    btn.dataset.spell=key;
    btn.innerHTML=sp.icon+" "+sp.name+(count>1?" ×"+count:"")+
      " <span style='color:var(--muted);font-weight:500;font-size:11px'>("+sp.desc+")</span>";
    btn.disabled=count<=0 || state.raceOver || t.finished;
    btn.addEventListener("click",()=>useSpell(key));
    spellsWrap.appendChild(btn);
  });
}

/* ---------- RENDER BẢNG XẾP HẠNG ---------- */
function renderLeaderboard(){
  const wrap=$("leaderboard");
  const sorted=[...state.teams].sort((a,b)=>{
    if(b.pos!==a.pos)return b.pos-a.pos;
    if(b.score!==a.score)return b.score-a.score;
    if(b.dice!==a.dice)return b.dice-a.dice;
    return a.id-b.id;
  });
  wrap.innerHTML="";
  sorted.forEach((t,i)=>{
    const row=document.createElement("div");
    row.className="lb-row";

    const rank=document.createElement("div");
    rank.className="lb-rank"+(i===0?" top":"");
    rank.textContent=(i+1);
    row.appendChild(rank);

    const dot=document.createElement("span");
    dot.style.width="14px";dot.style.height="14px";dot.style.borderRadius="50%";
    dot.style.background=t.color;dot.style.display="inline-block";
    dot.style.border="1.5px solid rgba(255,255,255,.7)";
    row.appendChild(dot);

    const name=document.createElement("div");
    name.className="lb-name";
    name.textContent=t.name+(t.finished?" 👑":"");
    row.appendChild(name);

    const vals=document.createElement("div");
    vals.className="lb-vals";
    vals.innerHTML="<span>📍"+t.pos+"</span><span>⭐"+t.score+"</span><span>📚"+t.used+"</span><span>🎟️"+t.dice+"</span>";
    row.appendChild(vals);

    wrap.appendChild(row);
  });
}

/* ---------- RENDER NHẬT KÝ ---------- */
function renderLog(){
  const wrap=$("log");
  wrap.innerHTML="";
  if(!state.log.length){
    const empty=document.createElement("div");
    empty.className="log-item";
    empty.style.opacity=".6";
    empty.textContent="Chưa có sự kiện nào.";
    wrap.appendChild(empty);
    return;
  }
  state.log.forEach(item=>{
    const el=document.createElement("div");
    el.className="log-item"+(item.kind?" "+item.kind:"");
    el.textContent="["+item.time+"] "+item.msg;
    wrap.appendChild(el);
  });
}

/* ---------- RENDER HEADER ---------- */
function renderHeader(){
  $("statTeams").textContent=state.teams.length;
  const used=state.teams.reduce((s,t)=>s+t.used,0);
  $("statUsed").textContent=used;
  const sr=$("statRace");
  if(state.raceOver){
    sr.textContent="🏁 Đã kết thúc";
  }else{
    sr.textContent="⏱️ Đang đua";
  }
}

/* ---------- RENDER ALL ---------- */
function renderAll(){
  if(!state)return;
  renderHeader();
  renderBoard();
  renderTeams();
  renderQuestion();
  renderDice();
  renderLeaderboard();
  renderLog();
}

/* ---------- CHỌN CÂU HỎI CHƯA DÙNG ---------- */
function pickUnusedQuestion(team){
  const usedIdx=[];
  for(let i=0;i<QUESTIONS_PER_TEAM;i++){
    if(state.questions[team.id][i] && state.questions[team.id][i].__used)usedIdx.push(i);
  }
  /* Dùng thuộc tính tạm __used lưu trên state? Không – thay bằng mảng usedList */
  return -1;
}

/* Thay vào đó, lưu danh sách câu đã dùng vào team.usedList */
function ensureUsedList(t){
  if(!Array.isArray(t.usedList))t.usedList=[];
}

function openQuestion(){
  const t=state.teams[state.activeTeam];
  if(state.raceOver){flash("Cuộc đua đã kết thúc.",true);return;}
  if(t.finished){flash(t.name+" đã về đích.",true);return;}
  ensureUsedList(t);
  if(t.used>=QUESTIONS_PER_TEAM){
    flash(t.name+" đã hết câu hỏi.",true);
    return;
  }
  /* chọn câu chưa dùng */
  const unused=[];
  for(let i=0;i<QUESTIONS_PER_TEAM;i++){
    if(!t.usedList.includes(i))unused.push(i);
  }
  if(!unused.length){
    flash(t.name+" đã hết câu hỏi.",true);
    return;
  }
  const idx=unused[rand(0,unused.length-1)];
  t.currentQ=idx;
  t.qAnswered=false;
  addLog(t.name+" mở câu hỏi số "+(idx+1)+".","");
  save();
  renderAll();
}

/* ---------- CHẤM ĐÚNG / SAI ---------- */
function answerCorrect(){
  const t=state.teams[state.activeTeam];
  if(state.raceOver)return;
  if(t.finished)return;
  if(t.currentQ<0||t.qAnswered)return;
  ensureUsedList(t);
  t.qAnswered=true;
  t.used++;
  if(!t.usedList.includes(t.currentQ))t.usedList.push(t.currentQ);
  t.score+=100;
  t.dice+=1;
  addLog("✅ "+t.name+" trả lời đúng câu "+(t.currentQ+1)+": +100 điểm, +1 vé gieo.","good");
  flash("✅ Chính xác! +100 điểm, +1 vé gieo 🎟️");
  save();
  renderAll();
  /* kiểm tra chiến thắng? Chưa về đích – chỉ khi di chuyển mới về đích */
}

function answerWrong(){
  const t=state.teams[state.activeTeam];
  if(state.raceOver)return;
  if(t.finished)return;
  if(t.currentQ<0||t.qAnswered)return;
  ensureUsedList(t);
  t.qAnswered=true;
  t.used++;
  if(!t.usedList.includes(t.currentQ))t.usedList.push(t.currentQ);
  addLog("❌ "+t.name+" trả lời sai câu "+(t.currentQ+1)+". Không nhận vé gieo.","bad");
  flash("❌ Sai rồi! Không có vé gieo.",true);
  save();
  renderAll();
}

function skipQuestion(){
  const t=state.teams[state.activeTeam];
  if(state.raceOver)return;
  if(t.finished)return;
  if(t.currentQ<0)return;
  if(t.qAnswered){
    flash("Câu này đã được chấm.",true);
    return;
  }
  ensureUsedList(t);
  if(!t.usedList.includes(t.currentQ))t.usedList.push(t.currentQ);
  t.used++;
  t.qAnswered=true;
  addLog("⏭️ "+t.name+" bỏ qua câu "+(t.currentQ+1)+".","");
  flash("Đã bỏ qua câu hỏi.");
  save();
  renderAll();
}

/* ---------- GIEO XÚC XẮC ---------- */
let rolling=false;
function rollDice(){
  if(rolling)return;
  const t=state.teams[state.activeTeam];
  if(state.raceOver){flash("Cuộc đua đã kết thúc.",true);return;}
  if(t.finished){flash(t.name+" đã về đích.",true);return;}
  if(t.dice<=0){flash(t.name+" không có vé gieo.",true);return;}

  rolling=true;
  const dice=$("dice");
  const btn=$("btnRoll");
  btn.disabled=true;
  dice.classList.add("rolling");

  let ticks=0;
  const interval=setInterval(()=>{
    dice.textContent=rand(1,6);
    ticks++;
    if(ticks>12){
      clearInterval(interval);
      dice.classList.remove("rolling");
      const value=rand(1,6);
      dice.textContent=value;
      finishRoll(t,value);
    }
  },70);
}

function finishRoll(t,value){
  rolling=false;
  t.dice--;
  let steps=value;
  /* bùa tăng tốc */
  if(t.spells.includes("boost")){
    t.spells.splice(t.spells.indexOf("boost"),1);
    steps+=2;
    addLog("🚀 "+t.name+" dùng bùa Tăng tốc: +2 ô.","magic");
    flash("🚀 Bùa Tăng tốc kích hoạt! +2 ô");
  }
  addLog("🎲 "+t.name+" gieo được "+value+" điểm"+(steps>value?" (+2 bùa)":"")+".","");
  moveTeam(t,steps);
}

/* ---------- DI CHUYỂN ---------- */
function moveTeam(t,steps){
  let from=t.pos;
  let target=clamp(t.pos+steps,0,TOTAL_CELLS);
  /* nếu vượt 30 thì dừng ở 30 */
  if(target>=TOTAL_CELLS){
    target=TOTAL_CELLS;
  }

  /* di chuyển từng bước */
  let current=from;
  const stepFn=()=>{
    if(current<target){
      current++;
    }else if(current>target){
      current--;
    }else{
      /* đến nơi */
      afterMove(t,from,target);
      return;
    }
    t.pos=current;
    t.score+=10; /* mỗi ô +10 điểm */
    renderBoard();
    renderTeams();
    renderLeaderboard();
    renderQuestion();
    setTimeout(stepFn,180);
  };
  stepFn();
}

function afterMove(t,from,to){
  addLog("🏎️ "+t.name+" di chuyển từ ô "+from+" đến ô "+to+". Mỗi ô +10 điểm.","");
  /* xử lý ô đặc biệt */
  handleSpecialCell(t,to);
  save();
  renderAll();
  checkWinner(t);
}

function handleSpecialCell(t,pos){
  const sp=SPECIAL_CELLS[pos];
  if(!sp)return;
  if(sp.type==="start"||sp.type==="finish")return;

  if(sp.type==="bonus"){
    const gain=rand(100,300);
    t.score+=gain;
    addLog("💰 "+t.name+" nhận thưởng "+gain+" điểm tại ô "+pos+".","good");
    flash("💰 Thưởng "+gain+" điểm!");
    return;
  }
  if(sp.type==="boost"){
    const extra=rand(2,4);
    addLog("🚀 "+t.name+" gặp ô Tăng tốc: tiến thêm "+extra+" ô.","good");
    flash("🚀 Tăng tốc! Tiến thêm "+extra+" ô");
    /* di chuyển thêm */
    const newPos=clamp(t.pos+extra,0,TOTAL_CELLS);
    const old=t.pos;
    t.pos=newPos;
    t.score+=10*extra;
    addLog("→ "+t.name+" tiến từ ô "+old+" đến ô "+newPos+".","");
    handleSpecialCell(t,newPos);
    return;
  }
  if(sp.type==="obstacle"){
    /* nếu có khiên thì chặn */
    if(t.spells.includes("shield")){
      t.spells.splice(t.spells.indexOf("shield"),1);
      addLog("🛡️ "+t.name+" dùng Khiên chặn hiệu ứng lùi tại ô "+pos+".","magic");
      flash("🛡️ Khiên đã chặn hiệu ứng lùi!");
      return;
    }
    const back=rand(1,3);
    const old=t.pos;
    t.pos=clamp(t.pos-back,0,TOTAL_CELLS);
    addLog("⛔ "+t.name+" gặp chướng ngại: lùi "+back+" ô (từ "+old+" về "+t.pos+").","bad");
    flash("⛔ Chướng ngại! Lùi "+back+" ô",true);
    handleSpecialCell(t,t.pos);
    return;
  }
  if(sp.type==="lucky"){
    const roll=rand(0,1);
    if(roll===0){
      const gain=200;
      t.score+=gain;
      addLog("🍀 "+t.name+" may mắn nhận "+gain+" điểm.","good");
      flash("🍀 May mắn! +200 điểm");
    }else{
      t.dice+=1;
      addLog("🍀 "+t.name+" may mắn nhận thêm 1 vé gieo.","good");
      flash("🍀 May mắn! +1 vé gieo 🎟️");
    }
    return;
  }
  if(sp.type==="magic"){
    const keys=Object.keys(SPELLS);
    const key=keys[rand(0,keys.length-1)];
    t.spells.push(key);
    addLog("🔮 "+t.name+" nhận bùa "+SPELLS[key].icon+" "+SPELLS[key].name+".","magic");
    flash("🔮 Nhận bùa: "+SPELLS[key].icon+" "+SPELLS[key].name);
    return;
  }
}

/* ---------- DÙNG BÙA ---------- */
function useSpell(key){
  const t=state.teams[state.activeTeam];
  if(state.raceOver){flash("Cuộc đua đã kết thúc.",true);return;}
  if(t.finished){flash(t.name+" đã về đích.",true);return;}
  const idx=t.spells.indexOf(key);
  if(idx<0){flash("Không sở hữu bùa này.",true);return;}

  const sp=SPELLS[key];
  if(key==="boost"){
    /* chỉ kích hoạt – tiêu hao ngay, áp dụng vào lần gieo kế tiếp */
    t.spells.splice(idx,1);
    addLog("🚀 "+t.name+" kích hoạt bùa Tăng tốc.","magic");
    flash("🚀 Bùa Tăng tốc đã sẵn sàng cho lần gieo kế tiếp!");
  }else if(key==="shield"){
    t.spells.splice(idx,1);
    /* thêm lại dưới dạng khiên đang bật – dùng chính spells với key shield */
    t.spells.push("shield");
    addLog("🛡️ "+t.name+" kích hoạt Khiên.","magic");
    flash("🛡️ Khiên đã bật, chặn lần lùi kế tiếp!");
  }else if(key==="jump"){
    t.spells.splice(idx,1);
    addLog("💥 "+t.name+" dùng bùa Bước nhảy: tiến 4 ô.","magic");
    flash("💥 Bước nhảy! Tiến 4 ô");
    moveTeam(t,4);
    return;
  }else if(key==="luck"){
    t.spells.splice(idx,1);
    t.score+=200;
    addLog("🍀 "+t.name+" dùng bùa May mắn: +200 điểm.","magic");
    flash("🍀 +200 điểm!");
  }else if(key==="ticket"){
    t.spells.splice(idx,1);
    t.dice+=1;
    addLog("🎟️ "+t.name+" dùng Vé bổ sung: +1 vé gieo.","magic");
    flash("🎟️ +1 vé gieo!");
  }
  save();
  renderAll();
}

/* ---------- KIỂM TRA VÔ ĐỊCH ---------- */
function checkWinner(t){
  if(state.winner!=null)return;
  if(t.pos>=TOTAL_CELLS){
    t.finished=true;
    state.winner=t.id;
    state.raceOver=true;
    addLog("🏆 "+t.name+" về đích đầu tiên và trở thành nhà vô địch!","good");
    save();
    renderAll();
    showWinner(t);
  }
}

/* ---------- HIỆU ỨNG PHÁO GIẤY ---------- */
function showWinner(t){
  const modal=$("winnerModal");
  $("winnerName").textContent=t.name;
  $("winnerSub").textContent="Đã chạm ô 30 và giành chiến thắng! Tổng điểm: "+t.score;
  modal.classList.add("show");
  launchConfetti();
}
function launchConfetti(){
  const wrap=$("confetti");
  wrap.innerHTML="";
  const colors=["#ffd54a","#ff8a2b","#39e6ff","#ff3b3b","#3b82f6","#22c55e","#a855f7","#fbbf24"];
  for(let i=0;i<120;i++){
    const p=document.createElement("i");
    p.style.left=Math.random()*100+"vw";
    p.style.background=colors[rand(0,colors.length-1)];
    p.style.animationDuration=(2+Math.random()*2.5)+"s";
    p.style.animationDelay=(Math.random()*0.6)+"s";
    p.style.transform="rotate("+rand(0,360)+"deg)";
    p.style.borderRadius=Math.random()<0.3?"50%":"2px";
    wrap.appendChild(p);
  }
  setTimeout(()=>{wrap.innerHTML="";},5200);
}

/* ---------- TRÌNH CHỈNH SỬA ---------- */
let edTeam=0, edIndex=0;
function openEditor(){
  edTeam=state.activeTeam;
  edIndex=0;
  fillEditorSelects();
  loadEditorQuestion();
  $("editorModal").classList.add("show");
}
function fillEditorSelects(){
  const teamSel=$("edTeam");
  teamSel.innerHTML="";
  state.teams.forEach((t,i)=>{
    const o=document.createElement("option");
    o.value=i;
    o.textContent=t.name;
    teamSel.appendChild(o);
  });
  teamSel.value=edTeam;
  const idxSel=$("edIndex");
  idxSel.innerHTML="";
  for(let i=0;i<QUESTIONS_PER_TEAM;i++){
    const o=document.createElement("option");
    o.value=i;
    o.textContent="Câu "+(i+1);
    idxSel.appendChild(o);
  }
  idxSel.value=edIndex;
}
function loadEditorQuestion(){
  const q=state.questions[edTeam] && state.questions[edTeam][edIndex];
  $("edQuestion").value=q?q.question:"";
  $("edAnswer").value=q?q.answer:"";
}
function saveEditorQuestion(){
  const qText=$("edQuestion").value.trim();
  const aText=$("edAnswer").value.trim();
  if(!qText){
    flash("Nội dung câu hỏi không được để trống.",true);
    return;
  }
  if(!state.questions[edTeam])state.questions[edTeam]=[];
  state.questions[edTeam][edIndex]={question:qText,answer:aText||"(Chưa có đáp án tham khảo)"};
  addLog("✏️ Cập nhật câu "+(edIndex+1)+" của "+state.teams[edTeam].name+".","");
  save();
  flash("💾 Đã lưu câu hỏi.");
  renderAll();
}

/* ---------- IMPORT / EXPORT ---------- */
function exportJSON(){
  const data={questions:state.questions};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;
  a.download="bo_cau_hoi_duong_dua_lich_su.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  flash("📤 Đã xuất file JSON.");
}
function importJSON(){
  const raw=$("importText").value.trim();
  if(!raw){
    flash("Vui lòng dán nội dung JSON.",true);
    return;
  }
  let data;
  try{
    data=JSON.parse(raw);
  }catch(e){
    flash("❌ JSON sai định dạng.",true);
    return;
  }
  if(!data || !Array.isArray(data.questions)){
    flash("❌ Thiếu trường 'questions'.",true);
    return;
  }
  if(data.questions.length!==NUM_TEAMS){
    flash("❌ Phải có đúng 5 nhóm câu hỏi.",true);
    return;
  }
  for(let i=0;i<NUM_TEAMS;i++){
    if(!Array.isArray(data.questions[i]) || data.questions[i].length!==QUESTIONS_PER_TEAM){
      flash("❌ Nhóm "+(i+1)+" phải có đúng 10 câu.",true);
      return;
    }
    for(let j=0;j<QUESTIONS_PER_TEAM;j++){
      const q=data.questions[i][j];
      if(!q || typeof q.question!=="string" || typeof q.answer!=="string"){
        flash("❌ Câu "+(j+1)+" nhóm "+(i+1)+" thiếu 'question' hoặc 'answer'.",true);
        return;
      }
    }
  }
  /* hợp lệ */
  state.questions=data.questions.map(g=>g.map(q=>({question:String(q.question),answer:String(q.answer)})));
  /* reset tiến trình câu hỏi của các đội */
  state.teams.forEach(t=>{
    t.used=0;
    t.usedList=[];
    t.currentQ=-1;
    t.qAnswered=false;
  });
  addLog("📥 Nhập bộ câu hỏi mới từ JSON.","");
  save();
  flash("📥 Nhập bộ câu hỏi thành công!");
  $("importModal").classList.remove("show");
  renderAll();
}

/* ---------- CHƠI LẠI / XÓA ---------- */
function resetRace(){
  if(!confirm("Chơi lại sẽ đặt lại vị trí, điểm, vé và tiến trình câu hỏi. Bộ câu hỏi đã chỉnh sửa vẫn được giữ. Tiếp tục?"))return;
  const qs=deepClone(state.questions);
  state=createInitialState(qs);
  addLog("🔄 Bắt đầu mùa giải mới.","");
  save();
  renderAll();
  flash("🔄 Đã chơi lại!");
}
function clearProgress(){
  if(!confirm("Xóa toàn bộ tiến trình và bộ câu hỏi đã chỉnh sửa? Hành động này không thể hoàn tác."))return;
  try{localStorage.removeItem(STORAGE_KEY);}catch(e){}
  state=createInitialState(buildDefaultQuestions());
  addLog("🗑️ Đã xóa tiến trình, khôi phục bộ câu hỏi mặc định.","");
  save();
  renderAll();
  flash("🗑️ Đã xóa tiến trình.");
}

/* ---------- GẮN SỰ KIỆN ---------- */
function bindEvents(){
  $("btnOpenQ").addEventListener("click",openQuestion);
  $("btnShowA").addEventListener("click",()=>{
    const t=state.teams[state.activeTeam];
    if(t.currentQ<0)return;
    const q=state.questions[t.id][t.currentQ];
    if(!q)return;
    $("qAnswer").textContent="Đáp án: "+q.answer;
    $("qAnswer").classList.add("show");
  });
  $("btnCorrect").addEventListener("click",answerCorrect);
  $("btnWrong").addEventListener("click",answerWrong);
  $("btnSkip").addEventListener("click",skipQuestion);
  $("btnRoll").addEventListener("click",rollDice);

  $("btnEditor").addEventListener("click",openEditor);
  $("btnImport").addEventListener("click",()=>{
    $("importText").value="";
    $("importModal").classList.add("show");
  });
  $("btnExport").addEventListener("click",exportJSON);
  $("btnReset").addEventListener("click",resetRace);
  $("btnClear").addEventListener("click",clearProgress);

  /* EDITOR */
  $("edTeam").addEventListener("change",e=>{
    edTeam=Number(e.target.value);
    loadEditorQuestion();
  });
  $("edIndex").addEventListener("change",e=>{
    edIndex=Number(e.target.value);
    loadEditorQuestion();
  });
  $("edPrev").addEventListener("click",()=>{
    edIndex=(edIndex-1+QUESTIONS_PER_TEAM)%QUESTIONS_PER_TEAM;
    $("edIndex").value=edIndex;
    loadEditorQuestion();
  });
  $("edNext").addEventListener("click",()=>{
    edIndex=(edIndex+1)%QUESTIONS_PER_TEAM;
    $("edIndex").value=edIndex;
    loadEditorQuestion();
  });
  $("edSave").addEventListener("click",saveEditorQuestion);
  $("edClose").addEventListener("click",()=>$("editorModal").classList.remove("show"));

  /* IMPORT */
  $("importDo").addEventListener("click",importJSON);
  $("importClose").addEventListener("click",()=>$("importModal").classList.remove("show"));

  /* WINNER */
  $("winnerLB").addEventListener("click",()=>{
    $("winnerModal").classList.remove("show");
    document.querySelector(".side-col").scrollIntoView({behavior:"smooth"});
  });
  $("winnerReplay").addEventListener("click",()=>{
    $("winnerModal").classList.remove("show");
    resetRace();
  });

  /* Đóng modal khi click nền */
  document.querySelectorAll(".modal-backdrop").forEach(bd=>{
    bd.addEventListener("click",e=>{
      if(e.target===bd)bd.classList.remove("show");
    });
  });

  /* Phím tắt tiện dụng */
  document.addEventListener("keydown",e=>{
    if(e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA"||e.target.tagName==="SELECT")return;
    if(e.key==="1"||e.key==="2"||e.key==="3"||e.key==="4"||e.key==="5"){
      const idx=Number(e.key)-1;
      if(idx>=0&&idx<NUM_TEAMS){
        state.activeTeam=idx;
        save();renderAll();
      }
    }
    if(e.key==="r"||e.key==="R"){rollDice();}
    if(e.key==="o"||e.key==="O"){openQuestion();}
  });
}

/* ---------- KHỞI TẠO ---------- */
function init(){
  const saved=load();
  if(saved){
    state=saved;
    /* bổ sung trường có thể thiếu */
    state.teams.forEach(t=>{
      if(!Array.isArray(t.usedList)){
        /* tái tạo usedList từ used + currentQ nếu có */
        t.usedList=[];
        if(t.qAnswered && t.currentQ>=0)t.usedList.push(t.currentQ);
      }
    });
    if(typeof state.raceOver!=="boolean")state.raceOver=state.winner!=null;
    addLog("💾 Khôi phục tiến trình đã lưu.","");
  }else{
    state=createInitialState(buildDefaultQuestions());
    addLog("🎬 Bắt đầu cuộc đua mới với 5 đội và 50 câu hỏi.","");
  }
  bindEvents();
  renderAll();
  save();
}

document.addEventListener("DOMContentLoaded",init);

})();
