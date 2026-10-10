import { useState, useRef, useEffect } from "react";
import { supabase, isCloud } from "./supabase.js";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  ::-webkit-scrollbar { width:3px; }
  ::-webkit-scrollbar-track { background:#0D0A06; }
  ::-webkit-scrollbar-thumb { background:#4A3A20; border-radius:2px; }
  @keyframes fadeUp    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
  @keyframes flicker   { 0%,100%{opacity:1} 40%{opacity:.78} 60%{opacity:.94} 85%{opacity:.82} }
  @keyframes twinkle   { 0%,100%{opacity:.1;transform:scale(.8)} 50%{opacity:1;transform:scale(1.4)} }
  @keyframes twinkle2  { 0%,100%{opacity:.3;transform:scale(1)} 30%{opacity:.9;transform:scale(1.2)} 70%{opacity:.1;transform:scale(.85)} }
  @keyframes twinkle3  { 0%,100%{opacity:.6;transform:scale(1.1)} 50%{opacity:.08;transform:scale(.7)} }
  @keyframes orbitAnim { from{transform:rotate(0deg) translateX(38px) rotate(0deg)} to{transform:rotate(360deg) translateX(38px) rotate(-360deg)} }
  @keyframes orbitSlow { from{transform:rotate(0deg) translateX(55px) rotate(0deg)} to{transform:rotate(360deg) translateX(55px) rotate(-360deg)} }
  @keyframes shimmer   { from{background-position:-250% center} to{background-position:250% center} }
  @keyframes shimmerW  { from{background-position:-400% center} to{background-position:400% center} }
  @keyframes pulse     { 0%,100%{box-shadow:0 0 0 0 #C4870044} 70%{box-shadow:0 0 0 12px #C4870000} }
  @keyframes ping      { 0%{transform:scale(1);opacity:1} 100%{transform:scale(2.2);opacity:0} }
  @keyframes float1    { 0%,100%{transform:translateY(0px) rotate(0deg)} 33%{transform:translateY(-18px) rotate(4deg)} 66%{transform:translateY(-8px) rotate(-3deg)} }
  @keyframes float2    { 0%,100%{transform:translateY(0px) rotate(0deg)} 50%{transform:translateY(-24px) rotate(-5deg)} }
  @keyframes float3    { 0%,100%{transform:translateY(0px) rotate(0deg)} 25%{transform:translateY(-12px) rotate(3deg)} 75%{transform:translateY(-22px) rotate(-4deg)} }
  @keyframes drift     { 0%{transform:translateX(0) translateY(0) scale(1)} 25%{transform:translateX(10px) translateY(-14px) scale(1.05)} 50%{transform:translateX(-6px) translateY(-22px) scale(.97)} 75%{transform:translateX(-12px) translateY(-10px) scale(1.02)} 100%{transform:translateX(0) translateY(0) scale(1)} }
  @keyframes nebula    { 0%,100%{opacity:.05;transform:scale(1) rotate(0deg)} 50%{opacity:.10;transform:scale(1.1) rotate(4deg)} }
  @keyframes starPulse { 0%,100%{filter:brightness(1)} 50%{filter:brightness(1.8)} }
  @keyframes slideUp   { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
  @keyframes popIn     { 0%{opacity:0;transform:scale(.7)} 70%{transform:scale(1.08)} 100%{opacity:1;transform:scale(1)} }
  @keyframes reactionPop { 0%{transform:scale(0) translateY(10px);opacity:0} 70%{transform:scale(1.2) translateY(-2px)} 100%{transform:scale(1) translateY(0);opacity:1} }
  @keyframes memeSlide { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

  .fade-up  { animation:fadeUp .38s ease both; }
  .fade-in  { animation:fadeIn .45s ease both; }
  .flicker  { animation:flicker 5s ease-in-out infinite; }
  .pop-in   { animation:popIn .3s cubic-bezier(.34,1.56,.64,1) both; }
  .gold-text {
    background:linear-gradient(90deg,#C48700,#F0C96A,#E8A830,#FDE68A,#C48700);
    background-size:250% auto;
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
    animation:shimmer 4s linear infinite;
  }
  .gold-text-wide {
    background:linear-gradient(90deg,#8A5A00,#C48700,#F0C96A,#FDE68A,#E8A830,#C48700,#8A5A00);
    background-size:400% auto;
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
    animation:shimmerW 6s linear infinite;
  }
  input,button,textarea,select { font-family:'Crimson Text',Georgia,serif; }
  input:focus,textarea:focus,select:focus { outline:none; }
  button:active { opacity:.82; }
  .chapter-slider { -webkit-appearance:none; appearance:none; width:100%; height:4px; border-radius:2px; outline:none; cursor:pointer; background:transparent; }
  .chapter-slider::-webkit-slider-thumb { -webkit-appearance:none; width:18px; height:18px; border-radius:50%; cursor:pointer; margin-top:-7px; }
  .meme-card:hover { transform:scale(1.04); transition:transform 0.2s; }
  .reaction-btn:hover { transform:scale(1.3); transition:transform 0.15s; }
  .msg-bubble:hover .reaction-trigger { opacity:1; }
  .reaction-trigger { opacity:0; transition:opacity 0.2s; }
  .msg-bubble:hover .delete-trigger { opacity:1; }
  .delete-trigger { opacity:0; transition:opacity 0.2s; }
  @keyframes bellJiggle { 0%,100%{transform:rotate(0);} 20%{transform:rotate(14deg);} 40%{transform:rotate(-12deg);} 60%{transform:rotate(8deg);} 80%{transform:rotate(-6deg);} }
`;

// ── Cosmic background ─────────────────────────────────────────────
const COSMOS=[
  {emoji:"🪐",size:52,top:"8%", left:"78%",anim:"float1",dur:"14s",delay:"0s",  opacity:.18},
  {emoji:"🌌",size:80,top:"22%",left:"5%", anim:"drift", dur:"22s",delay:"2s",  opacity:.09},
  {emoji:"⭐",size:28,top:"35%",left:"88%",anim:"float2",dur:"10s",delay:"1s",  opacity:.22},
  {emoji:"🌙",size:38,top:"55%",left:"4%", anim:"float3",dur:"16s",delay:"3s",  opacity:.16},
  {emoji:"☄️",size:34,top:"70%",left:"82%",anim:"float1",dur:"12s",delay:"4s",  opacity:.14},
  {emoji:"🔭",size:30,top:"82%",left:"12%",anim:"float2",dur:"18s",delay:"0.5s",opacity:.12},
  {emoji:"💫",size:24,top:"15%",left:"45%",anim:"float3",dur:"9s", delay:"2.5s",opacity:.18},
  {emoji:"🌠",size:32,top:"45%",left:"55%",anim:"drift", dur:"20s",delay:"5s",  opacity:.10},
  {emoji:"🌌",size:70,top:"75%",left:"40%",anim:"nebula",dur:"25s",delay:"0s",  opacity:.06},
];
function CosmicBackground(){
  return(
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
      <div style={{position:"absolute",top:"10%",left:"20%",width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle,#C4870009,transparent 70%)",animation:"nebula 18s ease-in-out infinite"}}/>
      <div style={{position:"absolute",top:"55%",left:"60%",width:250,height:250,borderRadius:"50%",background:"radial-gradient(circle,#7A3A8A09,transparent 70%)",animation:"nebula 22s ease-in-out infinite",animationDelay:"4s"}}/>
      {COSMOS.map((c,i)=>(
        <div key={i} style={{position:"absolute",top:c.top,left:c.left,fontSize:c.size,opacity:c.opacity,animation:`${c.anim} ${c.dur} ease-in-out infinite`,animationDelay:c.delay,userSelect:"none",filter:"blur(0.3px)"}}>{c.emoji}</div>
      ))}
    </div>
  );
}
function Stars({count=55}){
  const stars=useRef(Array.from({length:count},()=>({
    top:`${Math.random()*100}%`,left:`${Math.random()*100}%`,
    size:Math.random()*2.4+0.6,
    anim:["twinkle","twinkle2","twinkle3"][Math.floor(Math.random()*3)],
    d:`${Math.random()*5+2}s`,dl:`${Math.random()*6}s`,
    color:Math.random()>.7?"#FDE68A":Math.random()>.5?"#C4B8FF":"#ffffff",
  }))).current;
  return(
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
      {stars.map((s,i)=>(
        <div key={i} style={{position:"absolute",top:s.top,left:s.left,width:s.size,height:s.size,borderRadius:"50%",background:s.color,boxShadow:`0 0 ${s.size*2}px ${s.color}`,animation:`${s.anim} ${s.d} ease-in-out infinite`,animationDelay:s.dl}}/>
      ))}
    </div>
  );
}

// ── MEME STICKERS (book club culture, built-in, no external images needed) ──
const MEMES = [
  // Reading reactions
  { id:"m1",  emoji:"😭📖", top:"one more chapter", bottom:"narrator: it was not one more chapter", color:"#C2476A" },
  { id:"m2",  emoji:"🚩❤️", top:"saw ALL the red flags", bottom:"read it anyway. worth it.", color:"#8B2A2A" },
  { id:"m3",  emoji:"💀✍️", top:"the author said", bottom:"choose violence today", color:"#5A3A6A" },
  { id:"m4",  emoji:"😤📚", top:"i am normal about this book", bottom:"— narrator: she was not", color:"#A07830" },
  { id:"m5",  emoji:"🐺💨", top:"the mate bond said:", bottom:"you don't have a choice bestie", color:"#7A3A8A" },
  { id:"m6",  emoji:"🥀🖤", top:"dark romance reader starter pack:", bottom:"red flags are just confetti", color:"#8B2A2A" },
  { id:"m7",  emoji:"😭🌙", top:"me at 2am", bottom:"just one more chapter i promise", color:"#1A5276" },
  { id:"m8",  emoji:"📖🔥", top:"me throwing the book across the room", bottom:"because HOW DARE YOU", color:"#C48700" },
  { id:"m9",  emoji:"✨🐉", top:"fantasy romance reader be like:", bottom:"i need a fae man who hates me", color:"#D4950A" },
  { id:"m10", emoji:"🌸😭", top:"shojo manga really said", bottom:"feel ALL of this right now", color:"#D4608A" },
  { id:"m11", emoji:"📚🧠", top:"my tbr list:", bottom:"500 books. zero regrets.", color:"#4A8A7A" },
  { id:"m12", emoji:"💕🤌", top:"manga romance authors really said", bottom:"here are your feelings. deal with it.", color:"#C45A8A" },
  { id:"m13", emoji:"⚔️💀", top:"found family trope hits different", bottom:"every. single. time.", color:"#C47A20" },
  { id:"m14", emoji:"🌕🧛", top:"vampire romance readers:", bottom:"the red flags are the attraction", color:"#7A3A8A" },
  { id:"m15", emoji:"😤💬", top:"'it's just a book'", bottom:"— someone who has never read", color:"#6A8A50" },
  { id:"m16", emoji:"🔪🍵", top:"thriller readers enjoying their tea", bottom:"while the detective finds the body", color:"#4A8A7A" },
];

// ── Quick emoji reactions ──────────────────────────────────────────
const QUICK_REACTIONS = ["😭","🔥","💀","❤️","🐺","✨","📚","😤","🥺","💯","🌙","👏"];

// ── Data ──────────────────────────────────────────────────────────
const IDENTITIES=[
  {id:"she",  label:"She / Her",         star:"🌸",color:"#E8709A",desc:"Women's rooms available"},
  {id:"he",   label:"He / Him",          star:"🌟",color:"#C48700",desc:"Open rooms"},
  {id:"they", label:"They / Them",       star:"💜",color:"#9B59B6",desc:"Open rooms"},
  {id:"nb",   label:"Non-binary",        star:"🌊",color:"#5A9EBF",desc:"Open rooms"},
  {id:"skip", label:"Prefer not to say", star:"✨",color:"#E8B4CC",desc:"Open rooms"},
];

const GENRES=[
  {id:"fantasy",        label:"Fantasy",        icon:"🏰",color:"#A07830",members:142,totalChapters:92, progress:68,currentBook:"The Name of the Wind",      author:"Patrick Rothfuss",description:"Epic worlds, ancient magic, heroes who were never meant to be.",        tags:["Magic Systems","World-Building","Epic Fantasy"],nextMeeting:"Sunday 7:00 PM",  womenRoom:true},
  {id:"romance",        label:"Romance",         icon:"🌹",color:"#C2476A",members:98, totalChapters:24, progress:45,currentBook:"Beach Read",                 author:"Emily Henry",      description:"Love in all its chaos — sweet, steamy, and everything between.",      tags:["Contemporary","Enemies to Lovers","HEA"],      nextMeeting:"Saturday 3:00 PM",womenRoom:true},
  {id:"fantasy-romance",label:"Fantasy Romance", icon:"✨",color:"#D4950A",members:203,totalChapters:55, progress:82,currentBook:"A Court of Thorns and Roses",author:"Sarah J. Maas",    description:"Magic + longing + a slow burn that will ruin you completely.",          tags:["Fae","Slow Burn","Action"],                    nextMeeting:"Sunday 8:30 PM",  womenRoom:true},
  {id:"dark-romance",   label:"Dark Romance",    icon:"🥀",color:"#8B2A2A",members:167,totalChapters:48, progress:60,currentBook:"Haunting Adeline",           author:"H.D. Carlton",     description:"For readers who want love stories with teeth. Mature. Unapologetic.",  tags:["Dark Themes","Morally Grey","Obsession"],      nextMeeting:"Wednesday 6:00 PM",womenRoom:true,mature:true},
  {id:"mated",          label:"Mated",           icon:"🐺",color:"#7A3A8A",members:134,totalChapters:42, progress:35,currentBook:"Blood Oath",                 author:"Raven Kennedy",    description:"Wolves, vampires, and the mates who can't escape them. Primal heat.",  tags:["Shifters","Vampires","Fated Mates"],            nextMeeting:"Thursday 7:00 PM",womenRoom:true,mature:true},
  {id:"thriller",       label:"Thriller",        icon:"🔪",color:"#4A8A7A",members:77, totalChapters:52, progress:30,currentBook:"Gone Girl",                  author:"Gillian Flynn",    description:"Unreliable narrators, twists you didn't see coming, hauntings that last.",tags:["Psychological","Suspense","Mystery"],          nextMeeting:"Wednesday 6:00 PM",womenRoom:true},
  {id:"sci-fi",         label:"Sci-Fi",          icon:"🚀",color:"#5A7AAA",members:61, totalChapters:29, progress:55,currentBook:"Project Hail Mary",          author:"Andy Weir",        description:"The universe is vast and terrifying. These books go there anyway.",     tags:["Space","Hard Sci-Fi","First Contact"],          nextMeeting:"Friday 7:00 PM",  womenRoom:true},
  {id:"literary",       label:"Literary Fiction",icon:"📖",color:"#6A8A50",members:54, totalChapters:16, progress:90,currentBook:"Piranesi",                   author:"Susanna Clarke",   description:"Stories that crack something open in you and don't apologize for it.",  tags:["Character Study","Lyrical","Surreal"],          nextMeeting:"Tuesday 6:30 PM", womenRoom:true},
  {id:"shojo",          label:"Shojo",           icon:"🌸",color:"#D4608A",members:88, totalChapters:60, progress:42,currentBook:"Fruits Basket",             author:"Natsuki Takaya",   description:"Feelings, romance, slow burns in illustrated form. Pure heart.",         tags:["Romance Manga","Slice of Life","Emotions"],    nextMeeting:"Monday 7:00 PM",  womenRoom:true,manga:true},
  {id:"manga-romance",  label:"Manga Romance",   icon:"💕",color:"#C45A8A",members:95, totalChapters:50, progress:65,currentBook:"Kaguya-sama: Love is War",  author:"Aka Akasaka",      description:"For romance readers who found manga and never looked back.",            tags:["Romantic Comedy","Slow Burn","Drama"],         nextMeeting:"Saturday 7:00 PM",womenRoom:true,manga:true},
  {id:"isekai",         label:"Isekai",          icon:"🏯",color:"#7A6AAA",members:72, totalChapters:80, progress:28,currentBook:"That Time I Got Reincarnated as a Slime",author:"Fuse",description:"Another world, new rules, a protagonist who refuses to follow them.",  tags:["Isekai","Fantasy","Reincarnation"],             nextMeeting:"Tuesday 8:00 PM", womenRoom:true,manga:true},
  {id:"dark-manga",     label:"Dark Manga",      icon:"🌑",color:"#5A3A6A",members:61, totalChapters:45, progress:55,currentBook:"Berserk",                   author:"Kentaro Miura",    description:"Psychological horror, moral complexity, darkness drawn in ink.",         tags:["Horror","Psychological","Mature"],              nextMeeting:"Thursday 8:30 PM",womenRoom:true,manga:true,mature:true},
  {id:"shonen",         label:"Shonen / Action", icon:"⚔️",color:"#C47A20",members:54, totalChapters:100,progress:38,currentBook:"Demon Slayer",              author:"Koyoharu Gotouge", description:"Epic battles, found family, arcs that hit different in manga form.",     tags:["Action","Battle","Found Family"],               nextMeeting:"Sunday 9:00 PM",  womenRoom:true,manga:true},
];

const TIME_SLOTS=[
  {id:"morning",label:"Late Morning",range:"10:00 – 11:30 AM",icon:"☀️", desc:"Early risers & WFH readers"},
  {id:"midday", label:"Midday",      range:"12:00 – 1:00 PM", icon:"🌤️",desc:"Lunch break book talk"},
  {id:"evening",label:"After 5",    range:"6:00 – 7:30 PM",  icon:"🌙", desc:"Wind-down reads"},
];

const BOOK_COVERS={
  "fantasy":"linear-gradient(135deg,#2A1A0A,#A07830,#4A2A0A)","romance":"linear-gradient(135deg,#2A0A14,#C2476A,#8A1A30)",
  "fantasy-romance":"linear-gradient(135deg,#1A1200,#D4950A,#8A6000)","dark-romance":"linear-gradient(135deg,#0A0000,#8B2A2A,#2A0000)",
  "mated":"linear-gradient(135deg,#0D0014,#7A3A8A,#2A0040)","thriller":"linear-gradient(135deg,#001A18,#4A8A7A,#001210)",
  "sci-fi":"linear-gradient(135deg,#000A1A,#5A7AAA,#000A20)","literary":"linear-gradient(135deg,#0A1400,#6A8A50,#0A1000)",
  "shojo":"linear-gradient(135deg,#2A0A18,#D4608A,#8A1A40)","isekai":"linear-gradient(135deg,#0A0A1A,#7A6AAA,#1A1040)",
  "dark-manga":"linear-gradient(135deg,#050008,#5A3A6A,#0A0014)","manga-romance":"linear-gradient(135deg,#1A0A14,#C45A8A,#6A1A40)",
  "shonen":"linear-gradient(135deg,#1A0A00,#C47A20,#6A3A00)",
};

const USER_DB_INIT={"demo@orbit.app":{password:"orbit21",username:"bookish_introvert",city:"Raleigh",avatar:"🦋",timeSlot:"evening",joined:["fantasy-romance","fantasy","dark-romance","mated","shojo"],chapterProgress:{},identity:"she",joinDate:"March 2025"}};
const AVATARS=["🦋","🌙","🌹","⚔️","📚","🧙‍♀️","🌺","☕","🌅","🔮","🐉","🌿","🦉","🌊","✨","🐺","🌸","⭐","🥀","🧛","🌑","🌕","💕","🏯","🎌"];
const CITIES=["Raleigh","Durham","Chapel Hill","Cary","Apex","Morrisville","Carrboro","Hillsborough","Charlotte","Greensboro","Winston-Salem","Fayetteville","Wilmington","High Point","Concord","Asheville","Gastonia","Jacksonville","Burlington","Greenville","Huntersville","Rocky Mount"];
const US_STATES=["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

const NOTIF_INIT=[
  {id:1,type:"meeting",read:false,time:"2h ago", icon:"🕯️",title:"Fantasy Romance meeting starting",body:"Room A is open · 8 spots left"},
  {id:2,type:"nominate",read:false,time:"4h ago",icon:"📚",title:"Your nomination hit Top 3!",      body:"\"From Blood and Ash\" is now in the vote"},
  {id:3,type:"badge",  read:true, time:"1d ago", icon:"🌓",title:"Badge earned: Halfway!",           body:"You're 50% through The Name of the Wind"},
];

const DM_INIT={"moonreader_k":{avatar:"🌙",city:"Raleigh",messages:[{from:"moonreader_k",text:"That naming scene though 🌙",time:"8h ago",isMe:false,type:"text"},{from:"moonreader_k",text:"I had to put the book down for a minute",time:"8h ago",isMe:false,type:"text"}]},"page_witch":{avatar:"🧙‍♀️",city:"Durham",messages:[{from:"page_witch",text:"Are you coming to the Sunday Fantasy meeting?",time:"1d ago",isMe:false,type:"text"},{from:"you",text:"Yes!! Room A right?",time:"1d ago",isMe:true,type:"text"},{from:"page_witch",text:"Yep! See you there 🏰",time:"1d ago",isMe:false,type:"text"}]}};

const CHAT_INIT={
  "fantasy":[
    {id:"f1",user:"moonreader_k",avatar:"🌙",time:"2:14 PM",type:"text",text:"Kvothe's naming scene in ch.20 gave me absolute chills.",city:"Raleigh",spoiler:false,identity:"she",reactions:{}},
    {id:"f2",user:"page_witch",avatar:"🧙‍♀️",time:"2:31 PM",type:"text",text:"The magic system feels so lived in — not rules, but history.",city:"Durham",spoiler:false,identity:"she",reactions:{"🔥":["moonreader_k"]}},
    {id:"f3",user:"silent_chapters",avatar:"📚",time:"2:47 PM",type:"meme",memeId:"m4",city:"Cary",spoiler:false,identity:"she",reactions:{"😭":["page_witch","moonreader_k"],"💀":["feyre_girlie"]}},
  ],
  "fantasy-romance":[
    {id:"fr1",user:"thorns_and_starlight",avatar:"🌺",time:"11:05 AM",type:"text",text:"Chapter 15. That scene. I was NOT prepared.",city:"Chapel Hill",spoiler:true,identity:"she",reactions:{"😭":["feyre_girlie"]}},
    {id:"fr2",user:"feyre_girlie",avatar:"⚔️",time:"11:22 AM",type:"text",text:"The slow burn is destroying me in the best way.",city:"Durham",spoiler:false,identity:"she",reactions:{"🔥":["thorns_and_starlight","bookish_introvert"],"❤️":["moonreader_k"]}},
    {id:"fr3",user:"bookish_introvert",avatar:"🦋",time:"11:45 AM",type:"meme",memeId:"m9",city:"Raleigh",spoiler:false,identity:"she",reactions:{"💀":["feyre_girlie","thorns_and_starlight"],"😭":["page_witch"]}},
  ],
  "dark-romance":[
    {id:"dr1",user:"shadow_pages",avatar:"🥀",time:"9:10 AM",type:"text",text:"Carlton does NOT hold back. Sweating at work 💀",city:"Durham",spoiler:false,identity:"she",reactions:{"💀":["void_reader"]}},
    {id:"dr2",user:"void_reader",avatar:"🖤",time:"9:28 AM",type:"meme",memeId:"m6",city:"Raleigh",spoiler:false,identity:"she",reactions:{"🔥":["shadow_pages"],"❤️":["shadow_pages"]}},
  ],
  "mated":[
    {id:"ma1",user:"wolf_bound",avatar:"🐺",time:"8:00 PM",type:"text",text:"The mate bond in ch.6 hit me like a truck.",city:"Durham",spoiler:false,identity:"she",reactions:{"🐺":["fang_and_page"]}},
    {id:"ma2",user:"fang_and_page",avatar:"🧛",time:"8:22 PM",type:"meme",memeId:"m5",city:"Chapel Hill",spoiler:false,identity:"she",reactions:{"😭":["wolf_bound"],"🐺":["wolf_bound","nightblood_k"]}},
  ],
  "shojo":[
    {id:"sh1",user:"sakura_reads",avatar:"🌸",time:"3:00 PM",type:"text",text:"Tohru Honda is the most healing character ever written.",city:"Durham",spoiler:false,identity:"she",reactions:{"🌸":["petal_pages"]}},
    {id:"sh2",user:"petal_pages",avatar:"🌺",time:"3:18 PM",type:"meme",memeId:"m10",city:"Raleigh",spoiler:false,identity:"she",reactions:{"😭":["sakura_reads"],"💯":["sakura_reads"]}},
  ],
  "romance":[
    {id:"ro1",user:"sunset_reader",avatar:"🌅",time:"9:00 AM",type:"text",text:"Emily Henry really said enemies-to-lovers DONE RIGHT.",city:"Apex",spoiler:false,identity:"she",reactions:{"🔥":["cozy_pages"]}},
    {id:"ro2",user:"cozy_pages",avatar:"☕",time:"9:18 AM",type:"text",text:"Stayed up until 2am. Not one regret.",city:"Raleigh",spoiler:false,identity:"she",reactions:{"😭":["sunset_reader"],"💯":["sunset_reader"]}},
  ],
};

const NOMINATIONS_INIT={
  "fantasy":[{title:"The Way of Kings",count:18},{title:"Mistborn",count:14},{title:"The Priory of the Orange Tree",count:11}],
  "fantasy-romance":[{title:"Kingdom of the Wicked",count:22},{title:"From Blood and Ash",count:19},{title:"The Bridge Kingdom",count:10}],
  "dark-romance":[{title:"Twisted Love",count:24},{title:"Corrupt",count:18},{title:"Vicious",count:14}],
  "mated":[{title:"Alpha's Obsession",count:20},{title:"Feral Sins",count:17},{title:"Dark Wolf",count:12}],
  "romance":[{title:"People We Meet on Vacation",count:15},{title:"The Hating Game",count:13},{title:"Happy Place",count:9}],
  "shojo":[{title:"Sailor Moon",count:16},{title:"Cardcaptor Sakura",count:12},{title:"Clannad",count:9}],
  "manga-romance":[{title:"Horimiya",count:19},{title:"Ao Haru Ride",count:14},{title:"My Love Story",count:10}],
  "thriller":[{title:"The Silent Patient",count:11},{title:"The Woman in the Window",count:8}],
  "sci-fi":[{title:"Recursion",count:9},{title:"Dark Matter",count:7}],
};

const MONTHLY_Q={
  "fantasy":{q:"What trope next month?",opts:["Found Family","Chosen One","Dark Academia","Revenge Arc"]},
  "fantasy-romance":{q:"What dynamic should the romance center on?",opts:["Slow Burn","Enemies to Lovers","Fated Mates","Second Chance"]},
  "dark-romance":{q:"How dark do you want to go?",opts:["Psychological","Morally Grey Hero","Villain Romance","Dark Suspense"]},
  "mated":{q:"What kind of mate bond?",opts:["Wolf Shifters","Vampires","Dragon Shifters","Mixed Paranormal"]},
  "romance":{q:"What flavor of romance?",opts:["Contemporary","Historical","Small-Town","Holiday"]},
  "shojo":{q:"What kind of shojo next?",opts:["School Romance","Magical Girl","Slice of Life","Family Drama"]},
  "manga-romance":{q:"What manga romance vibe?",opts:["Slow Burn","Rivals to Lovers","Childhood Friends","Love Triangle"]},
  "thriller":{q:"Which thriller subgenre?",opts:["Psychological","Crime Procedural","Domestic Suspense","Legal Thriller"]},
  "sci-fi":{q:"What kind of sci-fi?",opts:["Hard Sci-Fi","Space Opera","Near-Future","Time Travel"]},
};

// City coordinates © GeoNames (CC-BY 4.0) — used only to compute "nearby" from the city you typed. No GPS, no tracking.
const US_CITIES=[["Raleigh","NC",35.7721,-78.63861],["Durham","NC",35.99403,-78.89862],["Chapel Hill","NC",35.9132,-79.05584],["Cary","NC",35.79154,-78.78112],["Apex","NC",35.73265,-78.85029],["Morrisville","NC",35.82348,-78.82556],["Carrboro","NC",35.91014,-79.07529],["Hillsborough","NC",36.07542,-79.09973],["Abilene","TX",32.44874,-99.73314],["Abington","PA",40.12067,-75.11795],["Ahwatukee Foothills","AZ",33.34171,-111.98403],["Akron","OH",41.08144,-81.51901],["Alafaya","FL",28.5641,-81.2114],["Alameda","CA",37.77099,-122.26087],["Albany Park","IL",41.96836,-87.72339],["Albany","GA",31.57851,-84.15574],["Albany","NY",42.65258,-73.75623],["Albany","OR",44.63651,-123.10593],["Albuquerque","NM",35.08449,-106.65114],["Alexandria","VA",38.80484,-77.04692],["Alhambra","AZ",33.49838,-112.13432],["Alhambra","CA",34.09529,-118.12701],["Alief","TX",29.71106,-95.59633],["Aliso Viejo","CA",33.56504,-117.72712],["Allapattah","FL",25.81454,-80.22394],["Allentown","PA",40.60843,-75.49018],["Allen","TX",33.10317,-96.67055],["Alpharetta","GA",34.07538,-84.29409],["Amarillo","TX",35.222,-101.8313],["Ames","IA",42.03471,-93.61994],["Amherst","NY",42.97839,-78.79976],["Anaheim","CA",33.83529,-117.9145],["Anchorage","AK",61.21806,-149.90028],["Anderson","IN",40.10532,-85.68025],["Ankeny","IA",41.72971,-93.60577],["Ann Arbor","MI",42.27756,-83.74088],["Antioch","CA",38.00492,-121.80579],["Apple Valley","CA",34.50083,-117.18588],["Apple Valley","MN",44.73191,-93.21772],["Appleton","WI",44.26193,-88.41538],["Arcadia","CA",34.13973,-118.03534],["Arden-Arcade","CA",38.6025,-121.37854],["Arlington Heights","IL",42.08836,-87.98063],["Arlington","TX",32.73569,-97.10807],["Arlington","VA",38.88101,-77.10428],["Arvada","CO",39.80276,-105.08748],["Asheville","NC",35.60095,-82.55402],["Astoria","NY",40.77205,-73.93014],["Atascocita","TX",29.99883,-95.1766],["Athens","GA",33.96095,-83.37794],["Atlanta","GA",33.749,-84.38798],["Auburn","AL",32.60986,-85.48078],["Auburn","WA",47.30732,-122.22845],["Aurora","CO",39.72943,-104.83192],["Aurora","IL",41.76058,-88.32007],["Austin","TX",30.26715,-97.74306],["Avondale","AZ",33.4356,-112.3496],["Bakersfield","CA",35.37329,-119.01871],["Baldwin Park","CA",34.08529,-117.9609],["Baltimore","MD",39.29038,-76.61219],["Bartlett","TN",35.20453,-89.87398],["Baton Rouge","LA",30.44332,-91.18747],["Battle Creek","MI",42.3173,-85.17816],["Bayonne","NJ",40.66871,-74.11431],["Bayside","NY",40.76844,-73.77708],["Baytown","TX",29.7355,-94.97743],["Beaumont","TX",30.08605,-94.10185],["Beaverton","OR",45.48706,-122.80371],["Bellevue","NE",41.13667,-95.89084],["Bellevue","WA",47.61038,-122.20068],["Bellflower","CA",33.88168,-118.11701],["Bellingham","WA",48.75955,-122.48822],["Belmont Cragin","IL",41.9317,-87.76867],["Bend","OR",44.05817,-121.31531],["Bensalem","PA",40.10455,-74.95128],["Bensonhurst","NY",40.60177,-73.99403],["Berkeley","CA",37.87159,-122.27275],["Berwyn","IL",41.85059,-87.79367],["Bethesda","MD",38.98067,-77.10026],["Bethlehem","PA",40.62593,-75.37046],["Billings","MT",45.78329,-108.50069],["Birmingham","AL",33.52066,-86.80249],["Bismarck","ND",46.80833,-100.78374],["Blaine","MN",45.1608,-93.23495],["Bloomington","IL",40.4842,-88.99369],["Bloomington","IN",39.16533,-86.52639],["Bloomington","MN",44.8408,-93.29828],["Blue Springs","MO",39.01695,-94.28161],["Boca Raton","FL",26.35869,-80.0831],["Boise","ID",43.6135,-116.20345],["Bolingbrook","IL",41.69864,-88.0684],["Bonita Springs","FL",26.33981,-81.7787],["Borough Park","NY",40.63399,-73.99681],["Bossier City","LA",32.51599,-93.73212],["Boston","MA",42.35843,-71.05977],["Boulder","CO",40.01499,-105.27055],["Bowie","MD",38.94278,-76.73028],["Bowling Green","KY",36.99032,-86.4436],["Boyle Heights","CA",34.0339,-118.20535],["Boynton Beach","FL",26.52535,-80.06643],["Bradenton","FL",27.49893,-82.57482],["Brandon","FL",27.9378,-82.28592],["Brentwood","CA",37.93187,-121.69579],["Brentwood","NY",40.78121,-73.24623],["Briarwood","NY",40.70935,-73.81529],["Brick","NJ",40.05928,-74.13708],["Bridgeport","CT",41.17923,-73.18945],["Bristol","CT",41.67176,-72.94927],["Brockton","MA",42.08343,-71.01838],["Broken Arrow","OK",36.0526,-95.79082],["Brookhaven","GA",33.85844,-84.3402],["Brookline","MA",42.33176,-71.12116],["Brooklyn Park","MN",45.09413,-93.35634],["Brooklyn","NY",40.6501,-73.94958],["Broomfield","CO",39.92054,-105.08665],["Brownsville","NY",40.66094,-73.92014],["Brownsville","TX",25.90175,-97.49748],["Bryan","TX",30.67436,-96.36996],["Buckeye","AZ",33.37032,-112.58378],["Buena Park","CA",33.86751,-117.99812],["Buffalo","NY",42.88645,-78.87837],["Burbank","CA",34.18084,-118.30897],["Burien","WA",47.47038,-122.34679],["Burlington","NC",36.09569,-79.4378],["Burnsville","MN",44.76774,-93.27772],["Bushwick","NY",40.69427,-73.91875],["Caldwell","ID",43.66294,-116.68736],["Camarillo","CA",34.21639,-119.0376],["Cambridge","MA",42.3751,-71.10561],["Camden","NJ",39.92595,-75.11962],["Canarsie","NY",40.64372,-73.90069],["Canoga Park","CA",34.20112,-118.59814],["Canton","MI",42.30865,-83.48216],["Canton","OH",40.79895,-81.37845],["Canyon Country","CA",34.42333,-118.47203],["Cape Coral","FL",26.56285,-81.94953],["Carlsbad","CA",33.15809,-117.35059],["Carmel","IN",39.97837,-86.11804],["Carmichael","CA",38.61713,-121.32828],["Carol City","FL",25.94065,-80.2456],["Carrollton","TX",32.95373,-96.89028],["Carson City","NV",39.1638,-119.7674],["Carson","CA",33.83141,-118.28202],["Casa Grande","AZ",32.8795,-111.75735],["Casas Adobes","AZ",32.32341,-110.9951],["Casper","WY",42.86663,-106.31308],["Castle Rock","CO",39.37221,-104.85609],["Castro Valley","CA",37.6941,-122.08635],["Catalina Foothills","AZ",32.29785,-110.9187],["Cathedral City","CA",33.77974,-116.46529],["Cedar Park","TX",30.5052,-97.82029],["Cedar Rapids","IA",42.00833,-91.64407],["Celina","TX",33.32456,-96.78444],["Centennial","CO",39.57916,-104.87692],["Center City","PA",39.9512,-75.15923],["Central City","AZ",33.44001,-112.05805],["Centreville","VA",38.84039,-77.42888],["Champaign","IL",40.11642,-88.24338],["Chandler","AZ",33.30616,-111.84125],["Charleston","SC",32.77632,-79.93275],["Charlotte","NC",35.22709,-80.84313],["Chattanooga","TN",35.04563,-85.30968],["Cheektowaga","NY",42.90339,-78.75475],["Cherry Hill","NJ",39.93484,-75.03073],["Chesapeake","VA",36.81904,-76.27494],["Cheyenne","WY",41.13998,-104.82025],["Chicago Lawn","IL",41.77503,-87.69644],["Chicago","IL",41.85003,-87.65005],["Chicopee","MA",42.1487,-72.60787],["Chico","CA",39.72849,-121.83748],["Chinatown","CA",37.7966,-122.40858],["Chinatown","NY",40.71649,-73.99625],["Chino Hills","CA",33.9938,-117.75888],["Chino","CA",34.01223,-117.68894],["Chula Vista","CA",32.64005,-117.0842],["Cicero","IL",41.84559,-87.75394],["Cincinnati","OH",39.12711,-84.51439],["Citrus Heights","CA",38.70712,-121.28106],["City of Milford (balance)","CT",41.22374,-73.06164],["Clarksville","TN",36.52977,-87.35945],["Clay","NY",43.1859,-76.17243],["Clearwater","FL",27.96585,-82.8001],["Cleveland","OH",41.4995,-81.69541],["Clifton","NJ",40.85843,-74.16376],["Clinton Township","MI",42.58698,-82.91992],["Clovis","CA",36.82523,-119.70292],["Coconut Creek","FL",26.25175,-80.17894],["College Station","TX",30.62798,-96.33441],["Colorado Springs","CO",38.83388,-104.82136],["Colton","CA",34.0739,-117.31365],["Columbia","MD",39.24038,-76.83942],["Columbia","MO",38.95171,-92.33407],["Columbia","SC",34.00071,-81.03481],["Columbus","GA",32.46098,-84.98771],["Columbus","OH",39.96118,-82.99879],["Commerce City","CO",39.80832,-104.93387],["Compton","CA",33.89585,-118.22007],["Concord","CA",37.97798,-122.03107],["Concord","NC",35.40888,-80.58158],["Coney Island","NY",40.57788,-73.99403],["Conroe","TX",30.31188,-95.45605],["Conway","AR",35.0887,-92.4421],["Coon Rapids","MN",45.11997,-93.28773],["Coral Gables","FL",25.72149,-80.26838],["Coral Springs","FL",26.27119,-80.2706],["Cordova","TN",35.15565,-89.7762],["Corona","CA",33.87529,-117.56644],["Corona","NY",40.74705,-73.86014],["Corpus Christi","TX",27.80058,-97.39638],["Corvallis","OR",44.56457,-123.26204],["Costa Mesa","CA",33.64113,-117.91867],["Council Bluffs","IA",41.26194,-95.86083],["Cranston","RI",41.77982,-71.43728],["Cupertino","CA",37.323,-122.03218],["Cypress Hills","NY",40.67705,-73.89125],["Cypress","TX",29.96911,-95.69717],["Dale City","VA",38.63706,-77.31109],["Dallas","TX",32.78306,-96.80667],["Daly City","CA",37.70577,-122.46192],["Danbury","CT",41.39482,-73.45401],["Davenport","IA",41.52364,-90.57764],["Davie","FL",26.06287,-80.2331],["Davis","CA",38.54491,-121.74052],["Daytona Beach","FL",29.21081,-81.02283],["Dayton","OH",39.75895,-84.19161],["DeSoto","TX",32.58986,-96.85695],["Dearborn Heights","MI",42.33698,-83.27326],["Dearborn","MI",42.32226,-83.17631],["Decatur","AL",34.60593,-86.98334],["Decatur","IL",39.84031,-88.9548],["Deer Valley","AZ",33.68393,-112.13488],["Deerfield Beach","FL",26.31841,-80.09977],["Delano","CA",35.76884,-119.24705],["Delray Beach","FL",26.46146,-80.07282],["Deltona","FL",28.90054,-81.26367],["Denton","TX",33.21484,-97.13307],["Denver","CO",39.73915,-104.9847],["Des Moines","IA",41.60054,-93.60911],["Des Plaines","IL",42.03336,-87.8834],["Detroit","MI",42.33143,-83.04575],["Diamond Bar","CA",34.02862,-117.81034],["Doral","FL",25.81954,-80.35533],["Dorchester","MA",42.29732,-71.0745],["Dothan","AL",31.22323,-85.39049],["Downey","CA",33.94001,-118.13257],["Downtown DC","DC",38.8935,-77.01991],["Dublin","CA",37.70215,-121.93579],["Dubuque","IA",42.50056,-90.66457],["Duluth","MN",46.78327,-92.10658],["Dundalk","MD",39.25066,-76.52052],["Eagan","MN",44.80413,-93.16689],["East Chattanooga","TN",35.06535,-85.24912],["East Flatbush","NY",40.65371,-73.93042],["East Hampton","VA",37.03737,-76.33161],["East Harlem","NY",40.79472,-73.9425],["East Hartford","CT",41.78232,-72.61203],["East Independence","MO",39.09556,-94.35523],["East Los Angeles","CA",34.0239,-118.17202],["East New York","NY",40.66677,-73.88236],["East Norwalk","CT",41.10565,-73.39845],["East Orange","NJ",40.76732,-74.20487],["East Pensacola Heights","FL",30.42881,-87.17997],["East Village","NY",40.72927,-73.98736],["Eastvale","CA",33.96358,-117.56418],["Eau Claire","WI",44.81135,-91.49849],["Eden Prairie","MN",44.85469,-93.47079],["Edgewater","IL",41.98337,-87.66395],["Edina","MN",44.88969,-93.34995],["Edinburg","TX",26.30174,-98.16334],["Edison","NJ",40.51872,-74.4121],["Edmond","OK",35.65283,-97.4781],["El Cajon","CA",32.79477,-116.96253],["El Monte","CA",34.06862,-118.02757],["El Paso","TX",31.75872,-106.48693],["Elgin","IL",42.03725,-88.28119],["Elizabeth","NJ",40.66399,-74.2107],["Elk Grove","CA",38.4088,-121.37162],["Elkhart","IN",41.68199,-85.97667],["Ellicott City","MD",39.26733,-76.79831],["Elmhurst","NY",40.73649,-73.87791],["Elyria","OH",41.36838,-82.10765],["Encanto","AZ",33.47937,-112.07823],["Enchanted Hills","NM",35.33676,-106.59296],["Encinitas","CA",33.03699,-117.29198],["Enid","OK",36.39559,-97.87839],["Enterprise","NV",36.02525,-115.24194],["Erie","PA",42.12922,-80.08506],["Escondido","CA",33.11921,-117.08642],["Eugene","OR",44.05207,-123.08675],["Euless","TX",32.83707,-97.08195],["Evanston","IL",42.04114,-87.69006],["Evansville","IN",37.97476,-87.55585],["Everett","WA",47.97898,-122.20208],["Fairfield","CA",38.24936,-122.03997],["Fairfield","CT",41.14121,-73.26373],["Fall River","MA",41.70149,-71.15505],["Fargo","ND",46.87719,-96.7898],["Farmington Hills","MI",42.48531,-83.37716],["Fayetteville","AR",36.06258,-94.15743],["Fayetteville","NC",35.05266,-78.87836],["Federal Way","WA",47.32232,-122.31262],["Financial District","NY",40.70789,-74.00857],["Fishers","IN",39.95559,-86.01387],["Flagami","FL",25.76232,-80.31616],["Flagstaff","AZ",35.19807,-111.65127],["Flatbush","NY",40.65205,-73.95903],["Flatlands","NY",40.62122,-73.93486],["Flint","MI",43.01253,-83.68746],["Florence-Graham","CA",33.96772,-118.24438],["Florissant","MO",38.78922,-90.32261],["Flower Mound","TX",33.01457,-97.09696],["Folsom","CA",38.67796,-121.17606],["Fontana","CA",34.09223,-117.43505],["Fordham","NY",40.85927,-73.89847],["Forest Hills","NY",40.71621,-73.85014],["Fort Collins","CO",40.58526,-105.08442],["Fort Lauderdale","FL",26.12231,-80.14338],["Fort Myers","FL",26.62168,-81.84059],["Fort Smith","AR",35.38592,-94.39855],["Fort Wayne","IN",41.1306,-85.12886],["Fort Worth","TX",32.72541,-97.32085],["Fountain Valley","CA",33.70918,-117.95367],["Fountainebleau","FL",25.77288,-80.34783],["Framingham Center","MA",42.29732,-71.43701],["Framingham","MA",42.27926,-71.41617],["Franklin","TN",35.92506,-86.86889],["Frederick","MD",39.41427,-77.41054],["Fremont","CA",37.54827,-121.98857],["Fresno","CA",36.74773,-119.77237],["Frisco","TX",33.15067,-96.82361],["Fullerton","CA",33.87029,-117.92534],["Gainesville","FL",29.65163,-82.32483],["Gaithersburg","MD",39.14344,-77.20137],["Galveston","TX",29.30135,-94.7977],["Garden Grove","CA",33.77391,-117.94145],["Gardena","CA",33.88835,-118.30896],["Garland","TX",32.91262,-96.63888],["Gary","IN",41.59337,-87.34643],["Gastonia","NC",35.26208,-81.1873],["Georgetown","TX",30.63269,-97.67723],["Germantown","MD",39.17316,-77.27165],["Gilbert","AZ",33.35283,-111.78903],["Gilroy","CA",37.00578,-121.56828],["Glen Burnie","MD",39.16261,-76.62469],["Glendale","AZ",33.53865,-112.18599],["Glendale","CA",34.14251,-118.25508],["Glendora","CA",34.13612,-117.86534],["Goodyear","AZ",33.43532,-112.35821],["Grand Forks","ND",47.92526,-97.03285],["Grand Island","NE",40.92501,-98.34201],["Grand Junction","CO",39.06387,-108.55065],["Grand Prairie","TX",32.74596,-96.99778],["Grand Rapids","MI",42.96336,-85.66809],["Grapevine","TX",32.93429,-97.07807],["Gravesend","NY",40.5976,-73.96514],["Great Falls","MT",47.50024,-111.30081],["Greeley","CO",40.42331,-104.70913],["Green Bay","WI",44.51916,-88.01983],["Greenburgh","NY",41.03287,-73.84291],["Greensboro","NC",36.07264,-79.79198],["Greenville","NC",35.61266,-77.36635],["Greenville","SC",34.85262,-82.39401],["Greenwood","IN",39.61366,-86.10665],["Gresham","OR",45.49818,-122.43148],["Gulfport","MS",30.36742,-89.09282],["Hacienda Heights","CA",33.99307,-117.96868],["Hamden","CT",41.39593,-72.89677],["Hamilton","OH",39.3995,-84.56134],["Hammond","IN",41.58337,-87.50004],["Hampton","VA",37.02987,-76.34522],["Hanford","CA",36.32745,-119.64568],["Harlem","NY",40.80788,-73.94542],["Harlingen","TX",26.19063,-97.6961],["Harrisburg","PA",40.2737,-76.88442],["Harrisonburg","VA",38.44957,-78.86892],["Hartford","CT",41.76371,-72.68509],["Haverhill","MA",42.7762,-71.07728],["Havertown","PA",39.98095,-75.30852],["Hawthorne","CA",33.9164,-118.35257],["Hayward","CA",37.66882,-122.0808],["Hemet","CA",33.74761,-116.97307],["Hempstead","NY",40.70621,-73.61874],["Hendersonville","TN",36.30477,-86.62],["Henderson","NV",36.0397,-114.98194],["Hesperia","CA",34.42639,-117.30088],["Hialeah","FL",25.8576,-80.27811],["High Point","NC",35.95569,-80.00532],["Highlands Ranch","CO",39.55388,-104.96943],["Highland","CA",34.12834,-117.20865],["Hillsboro","OR",45.52289,-122.98983],["Hoboken","NJ",40.74399,-74.03236],["Hoffman Estates","IL",42.04281,-88.0798],["Hollywood","CA",34.09834,-118.32674],["Hollywood","FL",26.0112,-80.14949],["Homestead","FL",25.46872,-80.47756],["Honolulu","HI",21.30694,-157.85833],["Hoover","AL",33.40539,-86.81138],["Houston","TX",29.76328,-95.36327],["Huntersville","NC",35.41069,-80.84285],["Huntington Beach","CA",33.6603,-117.99923],["Huntington Park","CA",33.98168,-118.22507],["Huntsville","AL",34.7304,-86.58594],["Idaho Falls","ID",43.46658,-112.03414],["Independence","MO",39.09112,-94.41551],["Indianapolis","IN",39.76838,-86.15804],["Indio","CA",33.7207,-116.21677],["Inglewood","CA",33.96168,-118.35313],["Iowa City","IA",41.66113,-91.53017],["Irondequoit","NY",43.2134,-77.57972],["Irvine","CA",33.66946,-117.82311],["Irving Park","IL",41.95336,-87.73645],["Irvington","NJ",40.73232,-74.23487],["Irving","TX",32.81402,-96.94889],["Jackson Heights","NY",40.75566,-73.88541],["Jacksonville","FL",30.33218,-81.65565],["Jacksonville","NC",34.75405,-77.43024],["Jackson","MS",32.29876,-90.18481],["Jackson","NJ",39.7765,-74.86238],["Jackson","TN",35.61452,-88.81395],["Jamaica","NY",40.69149,-73.80569],["Janesville","WI",42.68279,-89.01872],["Jersey City","NJ",40.72816,-74.07764],["Johns Creek","GA",34.02893,-84.19858],["Johnson City","TN",36.31344,-82.35347],["Joliet","IL",41.52519,-88.0834],["Jonesboro","AR",35.8423,-90.70428],["Joplin","MO",37.08423,-94.51328],["Jupiter","FL",26.93422,-80.09421],["Kalamazoo","MI",42.29171,-85.58723],["Kansas City","KS",39.11417,-94.62746],["Kansas City","MO",39.09973,-94.57857],["Kendale Lakes","FL",25.70816,-80.407],["Kendall","FL",25.67927,-80.31727],["Kenner","LA",29.99409,-90.24174],["Kennewick","WA",46.21125,-119.13723],["Kenosha","WI",42.58474,-87.82119],["Kentwood","MI",42.86947,-85.64475],["Kent","WA",47.38093,-122.23484],["Kettering","OH",39.6895,-84.16883],["Killeen","TX",31.11712,-97.7278],["Kings Bridge","NY",40.87871,-73.90514],["Kingsport","TN",36.54843,-82.56182],["Kirkland","WA",47.68149,-122.20874],["Kissimmee","FL",28.30468,-81.41667],["Knoxville","TN",35.96064,-83.92074],["Kokomo","IN",40.48643,-86.1336],["Koreatown","CA",34.05779,-118.30091],["La Crosse","WI",43.80136,-91.23958],["La Habra","CA",33.93196,-117.94617],["La Mesa","CA",32.76783,-117.02308],["Lafayette","IN",40.4167,-86.87529],["Lafayette","LA",30.22409,-92.01984],["Laguna Niguel","CA",33.52253,-117.70755],["Lake Charles","LA",30.21309,-93.2044],["Lake Elsinore","CA",33.66808,-117.32726],["Lake Forest","CA",33.64697,-117.68922],["Lake Havasu City","AZ",34.4839,-114.32245],["Lakeland","FL",28.03947,-81.9498],["Lakeville","MN",44.64969,-93.24272],["Lakewood","CA",33.85363,-118.13396],["Lakewood","CO",39.70471,-105.08137],["Lakewood","NJ",40.09789,-74.21764],["Lakewood","OH",41.48199,-81.79819],["Lakewood","WA",47.17176,-122.51846],["Lancaster","CA",34.69804,-118.13674],["Lancaster","PA",40.03788,-76.30551],["Lansing","MI",42.73253,-84.55553],["Laredo","TX",27.50641,-99.50754],["Largo","FL",27.90979,-82.78842],["Las Cruces","NM",32.31232,-106.77834],["Las Vegas","NV",36.17497,-115.13722],["Lauderhill","FL",26.14036,-80.21338],["Lawrence","KS",38.97167,-95.23525],["Lawrence","MA",42.70704,-71.16311],["Lawton","OK",34.60869,-98.39033],["Layton","UT",41.06022,-111.97105],["League City","TX",29.50745,-95.09493],["Leander","TX",30.57881,-97.85307],["Lee's Summit","MO",38.91084,-94.38217],["Leesburg","VA",39.11566,-77.5636],["Lehigh Acres","FL",26.62535,-81.6248],["Lehi","UT",40.39162,-111.85077],["Lenexa","KS",38.95362,-94.73357],["Levittown","NY",40.72593,-73.51429],["Levittown","PA",40.15511,-74.82877],["Lewisville","TX",33.04623,-96.99417],["Lexington-Fayette","KY",38.0498,-84.45855],["Lexington","KY",37.98869,-84.47772],["Lincoln Park","IL",41.9217,-87.64783],["Lincoln","NE",40.8,-96.66696],["Little Havana","FL",25.76806,-80.23306],["Little Rock","AR",34.74648,-92.28959],["Livermore","CA",37.68187,-121.76801],["Livonia","MI",42.36837,-83.35271],["Lodi","CA",38.1302,-121.27245],["Logan Square","IL",41.92337,-87.69922],["Logan","UT",41.73549,-111.83439],["Long Beach","CA",33.76696,-118.18923],["Longmont","CO",40.16721,-105.10193],["Longview","TX",32.5007,-94.74049],["Lorain","OH",41.45282,-82.18237],["Los Angeles","CA",34.05223,-118.24368],["Louisville","KY",38.25424,-85.75941],["Loveland","CO",40.39776,-105.07498],["Lowell","MA",42.63342,-71.31617],["Lubbock","TX",33.57786,-101.85517],["Lynchburg","VA",37.41375,-79.14225],["Lynn","MA",42.46676,-70.94949],["Lynwood","CA",33.93029,-118.21146],["Macon","GA",32.84069,-83.6324],["Madera","CA",36.96134,-120.06072],["Madison","WI",43.07305,-89.40123],["Malden","MA",42.4251,-71.06616],["Manchester","NH",42.99564,-71.45479],["Manhattan","KS",39.18361,-96.57167],["Manhattan","NY",40.78343,-73.96625],["Mansfield","TX",32.56319,-97.14168],["Manteca","CA",37.79743,-121.21605],["Maple Grove","MN",45.07246,-93.45579],["Margate","FL",26.24453,-80.20644],["Marietta","GA",33.9526,-84.54993],["Marysville","WA",48.05176,-122.17708],["Maryvale","AZ",33.50199,-112.17765],["McAllen","TX",26.20341,-98.23001],["McKinney","TX",33.19762,-96.61527],["Meads","KY",38.41258,-82.70905],["Medford","MA",42.41843,-71.10616],["Medford","OR",42.32652,-122.87559],["Melbourne","FL",28.08363,-80.60811],["Memphis","TN",35.14953,-90.04898],["Menifee","CA",33.72835,-117.14642],["Merced","CA",37.30216,-120.48297],["Meriden","CT",41.53815,-72.80704],["Meridian","ID",43.61211,-116.39151],["Mesa","AZ",33.42227,-111.82264],["Mesquite","TX",32.7668,-96.59916],["Metairie Terrace","LA",29.97854,-90.16396],["Metairie","LA",29.98409,-90.15285],["Methuen","MA",42.7262,-71.19089],["Miami Beach","FL",25.79065,-80.13005],["Miami Gardens","FL",25.94204,-80.2456],["Miami","FL",25.77427,-80.19366],["Mid-City","CA",34.04126,-118.36058],["Middletown","NJ",40.39428,-74.11709],["Midland","TX",31.99735,-102.07791],["Midwest City","OK",35.44951,-97.3967],["Milford","CT",41.22232,-73.0565],["Millcreek","UT",40.68689,-111.87549],["Milpitas","CA",37.42827,-121.90662],["Milwaukee","WI",43.0389,-87.90647],["Minneapolis","MN",44.97997,-93.26384],["Minnetonka Mills","MN",44.94107,-93.4419],["Minnetonka","MN",44.9133,-93.50329],["Mira Mesa","CA",32.9156,-117.14392],["Miramar","FL",25.98731,-80.23227],["Mission Viejo","CA",33.60002,-117.672],["Mission","TX",26.21591,-98.32529],["Missoula","MT",46.87215,-113.994],["Missouri City","TX",29.61857,-95.53772],["Mobile","AL",30.69436,-88.04305],["Modesto","CA",37.6391,-120.99688],["Montebello","CA",34.00946,-118.10535],["Monterey Park","CA",34.06251,-118.12285],["Montgomery","AL",32.36681,-86.29997],["Moore","OK",35.33951,-97.4867],["Moreno Valley","CA",33.93752,-117.23059],["Morningside Heights","NY",40.81,-73.9625],["Mott Haven","NY",40.80899,-73.92291],["Mount Pleasant","SC",32.79407,-79.86259],["Mount Prospect","IL",42.06642,-87.93729],["Mount Vernon","NY",40.9126,-73.83708],["Mountain View","CA",37.38605,-122.08385],["Muncie","IN",40.19338,-85.38636],["Murfreesboro","TN",35.84562,-86.39027],["Murrieta","CA",33.55391,-117.21392],["Nampa","ID",43.54072,-116.56346],["Napa","CA",38.29714,-122.28553],["Naperville","IL",41.78586,-88.14729],["Nashua","NH",42.76537,-71.46757],["Nashville","TN",36.16589,-86.78444],["National City","CA",32.67811,-117.0992],["Near North Side","IL",41.90003,-87.6345],["New Bedford","MA",41.63526,-70.92701],["New Braunfels","TX",29.703,-98.12445],["New Britain","CT",41.66121,-72.77954],["New Brunswick","NJ",40.48622,-74.45182],["New Haven","CT",41.30815,-72.92816],["New Orleans","LA",29.95465,-90.07507],["New Rochelle","NY",40.91149,-73.78235],["New South Memphis","TN",35.08676,-90.05676],["New York City","NY",40.71427,-74.00597],["Newark","NJ",40.73566,-74.17237],["Newport Beach","CA",33.61891,-117.92895],["Newport News","VA",36.98038,-76.42975],["Newton","MA",42.33704,-71.20922],["Noblesville","IN",40.04559,-86.0086],["Norfolk","VA",36.84681,-76.28522],["Normal","IL",40.5142,-88.99063],["Norman","OK",35.22257,-97.43948],["North Bergen","NJ",40.80427,-74.01208],["North Charleston","SC",32.85462,-79.97481],["North Chicopee","MA",42.18343,-72.59953],["North Hills","CA",34.23639,-118.48472],["North Hollywood","CA",34.17223,-118.37897],["North La Crosse","WI",43.84635,-91.24819],["North Las Vegas","NV",36.19886,-115.1175],["North Little Rock","AR",34.76954,-92.26709],["North Miami","FL",25.89009,-80.18671],["North Peoria","IL",40.71754,-89.58426],["North Port","FL",27.04422,-82.23593],["North Richland Hills","TX",32.8343,-97.2289],["North Stamford","CT",41.13815,-73.54346],["Northridge","CA",34.22834,-118.53675],["Norwalk","CA",33.90224,-118.08173],["Norwalk","CT",41.1176,-73.4079],["Novato","CA",38.10742,-122.5697],["Novi","MI",42.48059,-83.47549],["O'Fallon","MO",38.81061,-90.69985],["Oak Lawn","IL",41.71087,-87.75811],["Oak Park","IL",41.88503,-87.7845],["Oakland","CA",37.80437,-122.2708],["Ocala","FL",29.1872,-82.14009],["Oceanside","CA",33.19587,-117.37948],["Odessa","TX",31.84568,-102.36764],["Ogden","UT",41.223,-111.97383],["Oklahoma City","OK",35.46756,-97.51643],["Olathe","KS",38.8814,-94.81913],["Olympia","WA",47.04491,-122.90169],["Omaha","NE",41.25626,-95.94043],["Ontario","CA",34.06334,-117.65089],["Orange","CA",33.78779,-117.85311],["Orem","UT",40.2969,-111.69465],["Orland Park","IL",41.63031,-87.85394],["Orlando","FL",28.53834,-81.37924],["Oshkosh","WI",44.02471,-88.54261],["Overland Park","KS",38.98223,-94.67079],["Owensboro","KY",37.77422,-87.11333],["Oxnard","CA",34.1975,-119.17705],["Ozone Park","NY",40.67677,-73.84375],["Palatine","IL",42.1103,-88.03424],["Palm Bay","FL",28.03446,-80.58866],["Palm Beach Gardens","FL",26.82339,-80.13865],["Palm Coast","FL",29.58497,-81.20784],["Palm Desert","CA",33.72255,-116.37697],["Palm Harbor","FL",28.07807,-82.76371],["Palmdale","CA",34.57943,-118.11646],["Palo Alto","CA",37.44188,-122.14302],["Paradise","NV",36.09719,-115.14666],["Paramount","CA",33.88946,-118.15979],["Park Slope","NY",40.6701,-73.98597],["Parkchester","NY",40.83899,-73.86041],["Parma","OH",41.40477,-81.72291],["Parsippany","NJ",40.85788,-74.42599],["Pasadena","CA",34.14778,-118.14452],["Pasadena","TX",29.69106,-95.2091],["Pasco","WA",46.23958,-119.10057],["Passaic","NJ",40.85677,-74.12848],["Paterson","NJ",40.91677,-74.17181],["Pawtucket","RI",41.87871,-71.38256],["Peabody","MA",42.52787,-70.92866],["Pearland","TX",29.56357,-95.28605],["Pembroke Pines","FL",26.00315,-80.22394],["Pensacola","FL",30.42131,-87.21691],["Peoria","AZ",33.5806,-112.23738],["Peoria","IL",40.69365,-89.58899],["Perris","CA",33.78252,-117.22865],["Perth Amboy","NJ",40.50677,-74.26542],["Petaluma","CA",38.23242,-122.63665],["Pflugerville","TX",30.43937,-97.62],["Pharr","TX",26.1948,-98.18362],["Philadelphia","PA",39.95238,-75.16362],["Phoenix","AZ",33.44838,-112.07404],["Pico Rivera","CA",33.98307,-118.09673],["Pine Hills","FL",28.55778,-81.4534],["Pinellas Park","FL",27.8428,-82.69954],["Piscataway","NJ",40.49927,-74.39904],["Pittsburgh","PA",40.44062,-79.99589],["Pittsburg","CA",38.02798,-121.88468],["Placentia","CA",33.87224,-117.87034],["Plainfield","NJ",40.63371,-74.40737],["Plano","TX",33.01984,-96.69889],["Plantation","FL",26.13421,-80.23184],["Pleasanton","CA",37.66243,-121.87468],["Plymouth","MN",45.01052,-93.45551],["Pocatello","ID",42.8713,-112.44553],["Poinciana","FL",28.14029,-81.45841],["Pomona","CA",34.05529,-117.75228],["Pompano Beach","FL",26.23786,-80.12477],["Pontiac","MI",42.63892,-83.29105],["Port Arthur","TX",29.88519,-93.94233],["Port Charlotte","FL",26.97617,-82.09064],["Port Orange","FL",29.13832,-80.99561],["Port Saint Lucie","FL",27.29393,-80.35033],["Portage Park","IL",41.95781,-87.76506],["Porterville","CA",36.06523,-119.01677],["Portland","ME",43.65737,-70.2589],["Portland","OR",45.52345,-122.67621],["Portsmouth Heights","VA",36.82098,-76.36883],["Portsmouth","VA",36.83543,-76.29827],["Poway","CA",32.96282,-117.03586],["Providence","RI",41.82399,-71.41283],["Provo","UT",40.23384,-111.65853],["Pueblo","CO",38.25445,-104.60914],["Queens Village","NY",40.72677,-73.74152],["Queens","NY",40.68149,-73.83652],["Quincy","MA",42.25288,-71.00227],["Racine","WI",42.72613,-87.78285],["Rancho Cordova","CA",38.58907,-121.30273],["Rancho Cucamonga","CA",34.1064,-117.59311],["Rancho Penasquitos","CA",32.95949,-117.11531],["Rapid City","SD",44.08054,-103.23101],["Reading","PA",40.33565,-75.92687],["Redding","CA",40.58654,-122.39168],["Redlands","CA",34.05557,-117.18254],["Redmond","WA",47.67399,-122.12151],["Redondo Beach","CA",33.84918,-118.38841],["Redwood City","CA",37.48522,-122.23635],["Reno","NV",39.52963,-119.8138],["Renton","WA",47.48288,-122.21707],["Reseda","CA",34.20112,-118.53647],["Reston","VA",38.96872,-77.3411],["Revere","MA",42.40843,-71.01199],["Rialto","CA",34.1064,-117.37032],["Richardson","TX",32.94818,-96.72972],["Richland","WA",46.28569,-119.28446],["Richmond Hill","NY",40.69983,-73.83125],["Richmond","CA",37.93576,-122.34775],["Richmond","VA",37.55376,-77.46026],["Ridgewood","NY",40.7001,-73.90569],["Rio Rancho","NM",35.23338,-106.66447],["Riverside","CA",33.95335,-117.39616],["Riverview","FL",27.86614,-82.32648],["Roanoke","VA",37.27097,-79.94143],["Rochester Hills","MI",42.65837,-83.14993],["Rochester","MN",44.02163,-92.4699],["Rochester","NY",43.15478,-77.61556],["Rock Hill","SC",34.92487,-81.02508],["Rockford","IL",42.27113,-89.094],["Rocklin","CA",38.79073,-121.23578],["Rockville","MD",39.084,-77.15276],["Rocky Mount","NC",35.93821,-77.79053],["Rogers Park","IL",42.00864,-87.66672],["Rogers","AR",36.33202,-94.11854],["Rosemead","CA",34.08057,-118.07285],["Roseville","CA",38.75212,-121.28801],["Roswell","GA",34.02316,-84.36159],["Round Rock","TX",30.50826,-97.6789],["Rowlett","TX",32.9029,-96.56388],["Royal Oak","MI",42.48948,-83.14465],["Sacramento","CA",38.58157,-121.4944],["Saint Charles","MO",38.78394,-90.48123],["Saint Clair Shores","MI",42.49698,-82.88881],["Saint Cloud","MN",45.5608,-94.16249],["Saint George","UT",37.10415,-113.58412],["Saint Joseph","MO",39.76861,-94.84663],["Saint Paul","MN",44.94441,-93.09327],["Saint Peters","MO",38.80033,-90.62651],["Salem","OR",44.9429,-123.0351],["Salinas","CA",36.67774,-121.6555],["Salt Lake City","UT",40.76078,-111.89105],["Sammamish","WA",47.64177,-122.0804],["San Angelo","TX",31.46377,-100.43704],["San Antonio","TX",29.42412,-98.49363],["San Bernardino","CA",34.10834,-117.28977],["San Clemente","CA",33.42697,-117.61199],["San Diego","CA",32.71571,-117.16472],["San Francisco","CA",37.77493,-122.41942],["San Jose","CA",37.33939,-121.89496],["San Leandro","CA",37.72493,-122.15608],["San Marcos","CA",33.14337,-117.16614],["San Marcos","TX",29.88327,-97.94139],["San Mateo","CA",37.56299,-122.32553],["San Pedro","CA",33.73585,-118.29229],["San Rafael","CA",37.97353,-122.53109],["San Ramon","CA",37.77993,-121.97802],["San Tan Valley","AZ",33.1911,-111.528],["Sandy Hills","UT",40.58106,-111.85077],["Sandy Springs","GA",33.92427,-84.37854],["Sandy","UT",40.59161,-111.8841],["Sanford","FL",28.80055,-81.27312],["Santa Ana","CA",33.74557,-117.86783],["Santa Barbara","CA",34.42083,-119.69819],["Santa Clara","CA",37.35411,-121.95524],["Santa Clarita","CA",34.39166,-118.54259],["Santa Cruz","CA",36.97412,-122.0308],["Santa Fe","NM",35.68698,-105.9378],["Santa Maria","CA",34.95303,-120.43572],["Santa Monica","CA",34.01949,-118.49138],["Santa Rosa","CA",38.44047,-122.71443],["Santee","CA",32.83838,-116.97392],["Sarasota","FL",27.33643,-82.53065],["Savannah","GA",32.08354,-81.09983],["Schaumburg","IL",42.03336,-88.08341],["Schenectady","NY",42.81424,-73.93957],["Scottsdale","AZ",33.50921,-111.89903],["Scranton","PA",41.40916,-75.6649],["Seattle","WA",47.60621,-122.33207],["Shawnee","KS",39.04167,-94.72024],["Sheepshead Bay","NY",40.59122,-73.94458],["Shelby","MI",42.67087,-83.03298],["Sherman Oaks","CA",34.15112,-118.44925],["Shoreline","WA",47.75565,-122.34152],["Shreveport","LA",32.52515,-93.75018],["Silver Spring","MD",38.99067,-77.02609],["Simi Valley","CA",34.26945,-118.78148],["Sioux City","IA",42.49999,-96.40031],["Sioux Falls","SD",43.54369,-96.72796],["Skokie","IL",42.03336,-87.73339],["Smyrna","GA",33.88399,-84.51438],["Somerville","MA",42.3876,-71.0995],["South Bend","IN",41.68338,-86.25001],["South Boston","MA",42.33343,-71.04949],["South Fulton","GA",33.59259,-84.67294],["South Gate","CA",33.95474,-118.21202],["South Hill","WA",47.14121,-122.27012],["South Jordan","UT",40.56217,-111.92966],["South Lawndale","IL",41.84364,-87.71255],["South Ozone Park","NY",40.6701,-73.81902],["South Peabody","MA",42.50982,-70.94949],["South San Francisco","CA",37.65466,-122.40775],["South Shore","IL",41.76198,-87.57783],["South Suffolk","VA",36.71709,-76.59023],["South Vineland","NJ",39.44595,-75.02879],["South Whittier","CA",33.95015,-118.03917],["Southaven","MS",34.98898,-90.01259],["Southfield","MI",42.47337,-83.22187],["Sparks","NV",39.53491,-119.75269],["Spokane Valley","WA",47.67323,-117.23937],["Spokane","WA",47.65966,-117.42908],["Spring Hill","FL",28.47688,-82.52546],["Spring Valley","NV",36.10803,-115.245],["Springdale","AR",36.18674,-94.12881],["Springfield","IL",39.80172,-89.64371],["Springfield","MA",42.10148,-72.58981],["Springfield","MO",37.21533,-93.29824],["Springfield","OH",39.92423,-83.80882],["Springfield","OR",44.04624,-123.02203],["Spring","TX",30.07994,-95.41716],["St. Louis","MO",38.62727,-90.19789],["St. Petersburg","FL",27.77086,-82.67927],["Stamford","CT",41.05343,-73.53873],["Staten Island","NY",40.56233,-74.13986],["Sterling Heights","MI",42.58031,-83.0302],["Stockton","CA",37.9577,-121.29078],["Stratford","CT",41.18454,-73.13317],["Suffolk","VA",36.72836,-76.58496],["Sugar Land","TX",29.61968,-95.63495],["Sunnyvale","CA",37.36883,-122.03635],["Sunrise Manor","NV",36.21108,-115.07306],["Sunrise","FL",26.13397,-80.1131],["Sunset Park","NY",40.64548,-74.01241],["Surprise","AZ",33.63059,-112.33322],["Sylmar","CA",34.30778,-118.44925],["Syracuse","NY",43.04812,-76.14742],["Tacoma","WA",47.25288,-122.44429],["Tallahassee","FL",30.43826,-84.28073],["Tamarac","FL",26.21286,-80.24977],["Tamiami","FL",25.75871,-80.39839],["Tampa","FL",27.94752,-82.45843],["Taunton","MA",41.9001,-71.08977],["Taylorsville","UT",40.66772,-111.93883],["Taylor","MI",42.24087,-83.26965],["Temecula","CA",33.49364,-117.14836],["Tempe Junction","AZ",33.41421,-111.94348],["Tempe","AZ",33.41477,-111.90931],["Temple","TX",31.09823,-97.34278],["Terre Haute","IN",39.4667,-87.41391],["The Bronx","NY",40.84985,-73.86641],["The Hammocks","FL",25.67149,-80.4445],["The Trails of Frisco","TX",33.16087,-96.87182],["The Villages","FL",28.93408,-81.95994],["The Woodlands","TX",30.15799,-95.48938],["Thornton","CO",39.86804,-104.97192],["Thousand Oaks","CA",34.17056,-118.83759],["Tigard","OR",45.43123,-122.77149],["Tinley Park","IL",41.57337,-87.78449],["Toledo","OH",41.66394,-83.55521],["Toms River","NJ",39.95373,-74.19792],["Topeka","KS",39.04833,-95.67804],["Torrance","CA",33.83585,-118.34063],["Town 'n' Country","FL",28.01057,-82.57732],["Towson","MD",39.4015,-76.60191],["Tracy","CA",37.73987,-121.42618],["Trenton","NJ",40.21705,-74.74294],["Tri-Cities","WA",46.2454,-119.19617],["Troy","MI",42.60559,-83.14993],["Tucson","AZ",32.22174,-110.92648],["Tulare","CA",36.20773,-119.34734],["Tulsa","OK",36.15398,-95.99277],["Turlock","CA",37.49466,-120.84659],["Tuscaloosa","AL",33.20984,-87.56917],["Tustin","CA",33.74585,-117.82617],["Tyler","TX",32.35126,-95.30106],["Union City","CA",37.59577,-122.01913],["Union City","NJ",40.77955,-74.02375],["Union","NJ",40.6976,-74.2632],["Universal City","CA",34.1389,-118.35341],["University of Texas","TX",30.28604,-97.73889],["Upland","CA",34.09751,-117.64839],["Upper West Side","NY",40.78705,-73.97542],["Uptown","IL",41.9659,-87.65262],["Utica","NY",43.1009,-75.23266],["Vacaville","CA",38.35658,-121.98774],["Valdosta","GA",30.83334,-83.28032],["Valencia","CA",34.44361,-118.60953],["Vallejo","CA",38.10409,-122.25664],["Valley Glen","CA",34.18568,-118.42032],["Van Nuys","CA",34.18667,-118.44897],["Vancouver","WA",45.63873,-122.66149],["Ventura","CA",34.27834,-119.29317],["Victoria","TX",28.80527,-97.0036],["Victorville","CA",34.53611,-117.29116],["Vineland","NJ",39.48623,-75.02573],["Virginia Beach","VA",36.85293,-75.97799],["Visalia","CA",36.33023,-119.29206],["Vista","CA",33.20004,-117.24254],["Waco","TX",31.54933,-97.14667],["Wakefield","NY",40.89788,-73.85236],["Waldorf","MD",38.62456,-76.93914],["Walnut Creek","CA",37.90631,-122.06496],["Waltham","MA",42.37649,-71.23561],["Warner Robins","GA",32.61574,-83.62664],["Warren","MI",42.49044,-83.01304],["Warwick","RI",41.7001,-71.41617],["Washington Heights","NY",40.8501,-73.93541],["Washington","DC",38.89511,-77.03637],["Waterbury","CT",41.55815,-73.0515],["Waterford","MI",42.69303,-83.41181],["Waterloo","IA",42.49276,-92.34296],["Watsonville","CA",36.91023,-121.75689],["Waukegan","IL",42.36363,-87.84479],["Waukesha","WI",43.01168,-88.23148],["Wayne","NJ",40.92538,-74.27654],["Wellington","FL",26.65868,-80.24144],["West Albany","NY",42.68313,-73.77845],["West Allis","WI",43.01668,-88.00703],["West Bloomfield Township","MI",42.56891,-83.38356],["West Coon Rapids","MN",45.15969,-93.34967],["West Covina","CA",34.06862,-117.93895],["West Des Moines","IA",41.57721,-93.71133],["West Gulfport","MS",30.40409,-89.0942],["West Hartford","CT",41.76204,-72.74204],["West Haven","CT",41.27065,-72.94705],["West Hollywood","FL",26.02065,-80.18394],["West Jordan","UT",40.60967,-111.9391],["West Lynchburg","VA",37.4032,-79.17808],["West New York","NJ",40.78788,-74.01431],["West Palm Beach","FL",26.71534,-80.05337],["West Raleigh","NC",35.78682,-78.66389],["West Ridge","IL",41.99975,-87.69284],["West Sacramento","CA",38.58046,-121.53023],["West Town","IL",41.89381,-87.67493],["West Valley City","UT",40.69161,-112.00105],["Westland","MI",42.3242,-83.40021],["Westminster","CA",33.75918,-118.00673],["Westminster","CO",39.83665,-105.0372],["Weston","FL",26.10037,-80.39977],["Weymouth","MA",42.22093,-70.93977],["Wheaton","IL",41.86614,-88.10701],["White Plains","NY",41.03399,-73.76291],["Whittier","CA",33.97918,-118.03284],["Wichita Falls","TX",33.91371,-98.49339],["Wichita","KS",37.69224,-97.33754],["Wilmington","CA",33.78002,-118.26257],["Wilmington","DE",39.74595,-75.54659],["Wilmington","NC",34.23556,-77.94604],["Winston-Salem","NC",36.09986,-80.24422],["Woodbury","MN",44.92386,-92.95938],["Woodland Hills","CA",34.16834,-118.60592],["Woodland","CA",38.67852,-121.7733],["Worcester","MA",42.26259,-71.80229],["Wyoming","MI",42.91336,-85.70531],["Yakima","WA",46.60207,-120.5059],["Yonkers","NY",40.9304,-73.89789],["Yorba Linda","CA",33.88863,-117.81311],["Youngstown","OH",41.09978,-80.64952],["Yuba City","CA",39.14045,-121.61691],["Yucaipa","CA",34.03363,-117.04309],["Yuma","AZ",32.72532,-114.6244]];

// ── Nearby cities: 30-mile radius from the city typed at signup. No GPS, no tracking. ──
const normCity=s=>(s||"").trim().toLowerCase();
function cityCoords(city,state){
  const c=normCity(city),s=normCity(state);
  let hit=US_CITIES.find(e=>e[0].toLowerCase()===c&&e[1].toLowerCase()===s);
  if(!hit)hit=US_CITIES.find(e=>e[0].toLowerCase()===c);
  return hit||null;
}
function milesBetween(a,b){
  const R=3958.8,toR=d=>d*Math.PI/180;
  const dLa=toR(b[2]-a[2]),dLo=toR(b[3]-a[3]);
  const h=Math.sin(dLa/2)**2+Math.cos(toR(a[2]))*Math.cos(toR(b[2]))*Math.sin(dLo/2)**2;
  return 2*R*Math.asin(Math.sqrt(h));
}
const NEARBY_MILES=30;
const CITY_NAMES=[...new Set(US_CITIES.map(e=>e[0]))].sort();
const emptyRooms=()=>{const r={};GENRES.forEach(g=>{r[g.id]={};TIME_SLOTS.forEach(ts=>{const mk=()=>["A","B","C"].map(L=>({room:L,current:0,cap:15}));r[g.id][ts.id]={women:mk(),open:mk()};});});return r;};
const buildMeetingVotes=()=>{const mv={};GENRES.forEach(g=>{mv[g.id]={morning:Math.floor(Math.random()*30)+5,midday:Math.floor(Math.random()*25)+5,evening:Math.floor(Math.random()*40)+10};});return mv;};
function roomFillColor(pct){return pct>=90?"#C2476A":pct>=60?"#C48700":"#6A8A50";}
function roomLabel(pct){return pct>=90?"Almost Full":pct>=60?"Filling Up":"Open";}

function IdentityStar({identity,size=12}){
  const id=IDENTITIES.find(i=>i.id===identity);if(!id)return null;
  return <span style={{fontSize:size,animation:"starPulse 3s ease-in-out infinite",display:"inline-block"}} title={id.label}>{id.star}</span>;
}

function Field({label,type="text",value,onChange,placeholder}){
  return(
    <div style={{marginBottom:14}}>
      {label&&<div style={{fontSize:13,letterSpacing:3,color:"#E8B4CC",textTransform:"uppercase",marginBottom:6}}>{label}</div>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{width:"100%",background:"#1A1208",border:"1px solid #3A2A14",borderRadius:10,padding:"12px 16px",color:"#EDE0CE",fontSize:15}}/>
    </div>
  );
}

// ── Meme Card (styled book-club meme, no external images) ─────────
function MemeCard({memeId,compact=false}){
  const m=MEMES.find(x=>x.id===memeId);
  if(!m) return null;
  if(compact) return(
    <div className="meme-card" style={{background:`linear-gradient(135deg,${m.color}22,${m.color}11)`,border:`1px solid ${m.color}55`,borderRadius:10,padding:"8px 10px",cursor:"pointer",transition:"transform 0.2s",minWidth:0}}>
      <div style={{fontSize:22,marginBottom:4}}>{m.emoji}</div>
      <div style={{fontSize:13,color:"#EDE0CE",fontWeight:"600",lineHeight:1.3,marginBottom:2}}>{m.top}</div>
      <div style={{fontSize:14,color:m.color,lineHeight:1.3,fontStyle:"italic"}}>{m.bottom}</div>
    </div>
  );
  return(
    <div style={{background:`linear-gradient(135deg,${m.color}28,#1A1208)`,border:`1px solid ${m.color}66`,borderRadius:14,padding:"16px",maxWidth:260,animation:"memeSlide 0.3s ease both"}}>
      <div style={{fontSize:36,marginBottom:10,textAlign:"center"}}>{m.emoji}</div>
      <div style={{fontSize:14,color:"#F0D9B0",fontWeight:"600",textAlign:"center",lineHeight:1.4,marginBottom:6}}>{m.top}</div>
      <div style={{fontSize:13,color:m.color,textAlign:"center",fontStyle:"italic",lineHeight:1.4}}>{m.bottom}</div>
    </div>
  );
}

// ── Spoiler message ────────────────────────────────────────────────
function SpoilerMsg({msg,color}){
  const [open,setOpen]=useState(false);const isMe=msg.isMe;
  if(msg.type==="meme") return <MemeCard memeId={msg.memeId}/>;
  if(msg.type==="image") return(
    <div style={{borderRadius:12,overflow:"hidden",maxWidth:240,border:`1px solid ${color}44`}}>
      <img src={msg.imageUrl} alt="shared" style={{width:"100%",display:"block",maxHeight:200,objectFit:"cover"}} onError={e=>{e.target.style.display="none";}}/>
      {msg.caption&&<div style={{padding:"6px 10px",fontSize:14,color:"#EDE0CE",background:"#1A1208"}}>{msg.caption}</div>}
    </div>
  );
  if(msg.type==="passage") return(
    <div style={{background:`${color}18`,border:`2px solid ${color}55`,borderRadius:12,padding:"12px 14px",maxWidth:270,borderLeft:`4px solid ${color}`}}>
      <div style={{fontSize:13,color:color,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>📖 Book Passage</div>
      <div style={{fontSize:13,color:"#EDE0CE",fontStyle:"italic",lineHeight:1.7,marginBottom:8}}>"{msg.passage}"</div>
      {msg.chapter&&<div style={{fontSize:13,color:"#D4A0B8"}}>— Chapter {msg.chapter}</div>}
    </div>
  );
  return(
    <div onClick={()=>msg.spoiler&&setOpen(o=>!o)} style={{fontSize:14,lineHeight:1.65,whiteSpace:"pre-wrap",borderRadius:isMe?"14px 4px 14px 14px":"4px 14px 14px 14px",padding:"10px 14px",maxWidth:268,background:msg.spoiler?(open?"#3A1A0A":"#1E1608"):(isMe?color+"22":"#231A0E"),border:`1px solid ${msg.spoiler?(open?color+"88":"#4A3010"):(isMe?color+"44":"#3A2A14")}`,color:msg.spoiler&&!open?"#7A6040":"#EDE0CE",filter:msg.spoiler&&!open?"blur(3px)":"none",cursor:msg.spoiler?"pointer":"default",transition:"all 0.3s",userSelect:"none"}}>
      {msg.spoiler&&!open?"⚠️ Spoiler — tap to reveal":msg.text}
    </div>
  );
}

// ── Reaction display ───────────────────────────────────────────────
function ReactionBar({reactions,onReact,myUsername}){
  const entries=Object.entries(reactions||{}).filter(([,users])=>users.length>0);
  if(entries.length===0) return null;
  return(
    <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:4}}>
      {entries.map(([emoji,users])=>(
        <div key={emoji} onClick={()=>onReact(emoji)} style={{display:"flex",alignItems:"center",gap:3,background:users.includes(myUsername)?"#C4870022":"#1A1208",border:`1px solid ${users.includes(myUsername)?"#C48700":"#3A2A14"}`,borderRadius:20,padding:"2px 8px",cursor:"pointer",animation:"reactionPop 0.2s ease both",transition:"all 0.2s"}}>
          <span style={{fontSize:13}}>{emoji}</span>
          <span style={{fontSize:13,color:"#C4A060"}}>{users.length}</span>
        </div>
      ))}
    </div>
  );
}

// ── Reaction Picker ────────────────────────────────────────────────
function ReactionPicker({onPick,onClose}){
  return(
    <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div className="pop-in" onClick={e=>e.stopPropagation()} style={{background:"#1A1208",border:"1px solid #3A2A14",borderRadius:16,padding:"12px 14px",display:"flex",flexWrap:"wrap",gap:6,maxWidth:240,justifyContent:"center"}}>
        {QUICK_REACTIONS.map(e=>(
          <button key={e} className="reaction-btn" onClick={()=>onPick(e)} style={{width:38,height:38,borderRadius:"50%",background:"#231A0A",border:"1px solid #3A2A14",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"transform 0.15s"}}>{e}</button>
        ))}
      </div>
    </div>
  );
}

// ── Attachment Panel ───────────────────────────────────────────────
function AttachPanel({genreColor,onSendMeme,onSendImage,onSendPassage,onClose}){
  const [tab,setTab]=useState("memes");
  const [imgUrl,setImgUrl]=useState("");
  const [imgCap,setImgCap]=useState("");
  const [passage,setPassage]=useState("");
  const [chapter,setChapter]=useState("");

  return(
    <div style={{position:"fixed",inset:0,background:"#0D0A06f0",zIndex:100,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div className="fade-up" onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:430,background:"#1A1208",borderRadius:"20px 20px 0 0",border:"1px solid #3A2A14",padding:"20px 16px 36px",maxHeight:"80vh",display:"flex",flexDirection:"column"}}>
        <div style={{width:36,height:4,background:"#3A2A14",borderRadius:2,margin:"0 auto 16px"}}/>

        {/* Tabs */}
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          {[{id:"memes",icon:"😭",label:"Memes"},{ id:"image",icon:"🖼️",label:"Image"},{ id:"passage",icon:"📖",label:"Quote"}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"9px 6px",borderRadius:10,background:tab===t.id?genreColor+"22":"#0D0A06",border:`1.5px solid ${tab===t.id?genreColor:"#3A2A14"}`,color:tab===t.id?genreColor:"#7A6040",fontSize:14,cursor:"pointer",transition:"all 0.2s",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
              <span style={{fontSize:18}}>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        {/* Memes tab */}
        {tab==="memes"&&(
          <div style={{overflowY:"auto",flex:1}}>
            <div style={{fontSize:13,letterSpacing:2,color:"#E8B4CC",textTransform:"uppercase",marginBottom:10}}>Book Club Stickers — tap to send</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {MEMES.map(m=>(
                <div key={m.id} onClick={()=>onSendMeme(m.id)} style={{cursor:"pointer"}}>
                  <MemeCard memeId={m.id} compact/>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image tab */}
        {tab==="image"&&(
          <div style={{flex:1}}>
            <div style={{fontSize:13,letterSpacing:2,color:"#E8B4CC",textTransform:"uppercase",marginBottom:10}}>Share an Image</div>
            <div style={{fontSize:14,color:"#D4A0B8",marginBottom:14,lineHeight:1.6}}>Paste an image link from the web — a meme, book cover, reaction gif, anything you found online.</div>
            <input value={imgUrl} onChange={e=>setImgUrl(e.target.value)} placeholder="Paste image URL here..." style={{width:"100%",background:"#0D0A06",border:"1px solid #3A2A14",borderRadius:10,padding:"11px 14px",color:"#EDE0CE",fontSize:13,marginBottom:10}}/>
            <input value={imgCap} onChange={e=>setImgCap(e.target.value)} placeholder="Add a caption (optional)..." style={{width:"100%",background:"#0D0A06",border:"1px solid #3A2A14",borderRadius:10,padding:"11px 14px",color:"#EDE0CE",fontSize:13,marginBottom:14}}/>
            {imgUrl&&(
              <div style={{marginBottom:14,borderRadius:12,overflow:"hidden",border:`1px solid ${genreColor}44`}}>
                <img src={imgUrl} alt="preview" style={{width:"100%",maxHeight:160,objectFit:"cover",display:"block"}} onError={e=>{e.target.src="";e.target.style.display="none";}}/>
              </div>
            )}
            <button onClick={()=>{if(imgUrl.trim())onSendImage(imgUrl.trim(),imgCap.trim());}} style={{width:"100%",padding:"12px",borderRadius:20,background:imgUrl?`linear-gradient(135deg,#8A5A00,${genreColor})`:"#2A1E0E",border:"none",color:imgUrl?"#0D0A06":"#5A4030",fontSize:14,fontWeight:"600",cursor:imgUrl?"pointer":"default"}}>
              Send Image →
            </button>
          </div>
        )}

        {/* Passage tab */}
        {tab==="passage"&&(
          <div style={{flex:1}}>
            <div style={{fontSize:13,letterSpacing:2,color:"#E8B4CC",textTransform:"uppercase",marginBottom:10}}>Share a Book Passage</div>
            <div style={{fontSize:14,color:"#D4A0B8",marginBottom:14,lineHeight:1.6}}>Type or paste a line that hit you. It'll appear as a special quote bubble in chat.</div>
            <textarea value={passage} onChange={e=>setPassage(e.target.value)} placeholder="Type the passage that destroyed you..." rows={4} style={{width:"100%",background:"#0D0A06",border:"1px solid #3A2A14",borderRadius:10,padding:"11px 14px",color:"#EDE0CE",fontSize:13,marginBottom:10,resize:"none"}}/>
            <input value={chapter} onChange={e=>setChapter(e.target.value)} placeholder="Chapter number (optional)..." style={{width:"100%",background:"#0D0A06",border:"1px solid #3A2A14",borderRadius:10,padding:"11px 14px",color:"#EDE0CE",fontSize:13,marginBottom:14}}/>
            {passage&&(
              <div style={{background:`${genreColor}18`,border:`2px solid ${genreColor}55`,borderRadius:12,padding:"12px 14px",marginBottom:14,borderLeft:`4px solid ${genreColor}`}}>
                <div style={{fontSize:14,color:genreColor,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>📖 PREVIEW</div>
                <div style={{fontSize:13,color:"#EDE0CE",fontStyle:"italic",lineHeight:1.7}}>"{passage}"</div>
                {chapter&&<div style={{fontSize:13,color:"#D4A0B8",marginTop:4}}>— Chapter {chapter}</div>}
              </div>
            )}
            <button onClick={()=>{if(passage.trim())onSendPassage(passage.trim(),chapter.trim());}} style={{width:"100%",padding:"12px",borderRadius:20,background:passage?`linear-gradient(135deg,#8A5A00,${genreColor})`:"#2A1E0E",border:"none",color:passage?"#0D0A06":"#5A4030",fontSize:14,fontWeight:"600",cursor:passage?"pointer":"default"}}>
              Share Passage →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Room Picker ───────────────────────────────────────────────────
function RoomPicker({genre,timeSlot,rooms,identity,onJoin,onClose}){
  const [roomType,setRoomType]=useState(identity==="she"&&genre.womenRoom?"women":"open");
  const slotData=rooms[genre.id]?.[timeSlot]||{women:[],open:[]};
  const slotRooms=slotData[roomType]||[];
  const slot=TIME_SLOTS.find(t=>t.id===timeSlot);
  return(
    <div style={{position:"fixed",inset:0,background:"#0D0A06f0",zIndex:100,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div className="fade-up" onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:430,background:"#1A1208",borderRadius:"20px 20px 0 0",border:"1px solid #3A2A14",padding:"24px 20px 36px"}}>
        <div style={{width:36,height:4,background:"#3A2A14",borderRadius:2,margin:"0 auto 20px"}}/>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}><span style={{fontSize:22}}>{genre.icon}</span><div><div style={{fontWeight:"600",color:"#F0D9B0",fontSize:16}}>{genre.label} Meeting</div><div style={{fontSize:14,color:"#E8B4CC"}}>{slot?.icon} {slot?.label} · {slot?.range}</div></div></div>
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          {genre.womenRoom&&<button onClick={()=>setRoomType("women")} style={{flex:1,padding:"10px",borderRadius:10,background:roomType==="women"?"#E8709A22":"#1A1208",border:`2px solid ${roomType==="women"?"#E8709A":"#3A2A14"}`,color:roomType==="women"?"#E8709A":"#7A6040",fontSize:14,cursor:"pointer",transition:"all 0.2s"}}>🌸 Women's Room</button>}
          <button onClick={()=>setRoomType("open")} style={{flex:1,padding:"10px",borderRadius:10,background:roomType==="open"?"#C4870022":"#1A1208",border:`2px solid ${roomType==="open"?"#C48700":"#3A2A14"}`,color:roomType==="open"?"#C48700":"#7A6040",fontSize:14,cursor:"pointer",transition:"all 0.2s"}}>🌍 Open Room</button>
        </div>
        {slotRooms.map(r=>{const pct=Math.round((r.current/r.cap)*100);const fc=roomFillColor(pct);const isFull=r.current>=r.cap;return(
          <div key={r.room} style={{background:"#231A0A",borderRadius:14,padding:"14px 16px",marginBottom:10,border:`1px solid ${isFull?"#3A2A14":genre.color+"44"}`,opacity:isFull?0.5:1}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:40,height:40,borderRadius:"50%",background:genre.color+"22",border:`1px solid ${genre.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:"600",color:genre.color,flexShrink:0}}>{r.room}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}><span style={{fontSize:14,color:"#F0D9B0",fontWeight:"600"}}>Room {r.room}</span><span style={{fontSize:13,color:fc,background:fc+"18",border:`1px solid ${fc}44`,borderRadius:20,padding:"2px 8px"}}>{isFull?"🔴 Full":roomLabel(pct)}</span></div>
                <div style={{height:4,background:"#2A1E0E",borderRadius:2,marginBottom:4}}><div style={{width:`${pct}%`,height:"100%",background:`linear-gradient(90deg,${fc}66,${fc})`,borderRadius:2,transition:"width 0.4s"}}/></div>
                <div style={{fontSize:13,color:"#D4A0B8"}}>{r.current}/{r.cap} readers</div>
              </div>
              {!isFull&&<button onClick={()=>onJoin(r.room,roomType)} style={{background:genre.color,border:"none",borderRadius:10,padding:"8px 14px",color:"#0D0A06",fontSize:14,fontWeight:"600",cursor:"pointer",flexShrink:0}}>Join →</button>}
            </div>
          </div>
        );})}
      </div>
    </div>
  );
}

// ── Notifications ─────────────────────────────────────────────────
// ── Founder moderation: review reports, restrict accounts, ban emails ──
function ModerationList(){
  const [reports,setReports]=useState([]);
  const [busy,setBusy]=useState(null);
  const [note,setNote]=useState("");
  const load=async()=>{
    try{
      const {data}=await supabase.from("reports").select("id,reason,status,created_at,reporter_id,reported_user_id").eq("status","open").order("created_at",{ascending:false}).limit(50);
      const ids=[...new Set((data||[]).flatMap(r=>[r.reporter_id,r.reported_user_id]).filter(Boolean))];
      const uMap={};
      if(ids.length){
        const {data:us}=await supabase.from("users").select("id,username,is_restricted").in("id",ids);
        (us||[]).forEach(u=>{uMap[u.id]=u;});
      }
      setReports((data||[]).map(r=>({...r,
        reporterName:uMap[r.reporter_id]?uMap[r.reporter_id].username:"someone",
        reportedName:uMap[r.reported_user_id]?uMap[r.reported_user_id].username:"unknown",
        reportedRestricted:!!(uMap[r.reported_user_id]&&uMap[r.reported_user_id].is_restricted)})));
    }catch(e){}
  };
  useEffect(()=>{load();},[]);
  const run=async(id,fn,okMsg)=>{
    setBusy(id);setNote("");
    try{
      const extra=await fn();
      await supabase.from("reports").update({status:"actioned"}).eq("id",id);
      setNote(okMsg+(extra?" "+extra:""));
    }catch(e){setNote("Couldn't complete that — try again.");}
    setBusy(null);load();
  };
  const dismiss=async(id)=>{
    setBusy(id);
    try{await supabase.from("reports").update({status:"dismissed"}).eq("id",id);}catch(e){}
    setBusy(null);load();
  };
  const btn={padding:"8px 12px",borderRadius:20,border:"1px solid #3A2A14",background:"#1A1208",color:"#EDE0CE",fontSize:13,cursor:"pointer"};
  return(
    <div style={{background:"#C2476A10",border:"1px solid #C2476A44",borderRadius:14,padding:"14px",marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:13,letterSpacing:2,color:"#C2476A",textTransform:"uppercase"}}>🛡️ Moderation</div>
        <button onClick={load} style={{background:"none",border:"none",color:"#C490A8",fontSize:14,cursor:"pointer"}}>↻</button>
      </div>
      {note&&<div style={{fontSize:13,color:note.indexOf("Couldn't")===0?"#D06060":"#6A8A50",marginBottom:10}}>{note}</div>}
      {reports.length===0&&<div style={{fontSize:14,color:"#C490A8",fontStyle:"italic"}}>No open reports. All quiet. 🪐</div>}
      {reports.map(r=>(
        <div key={r.id} style={{background:"#0D0A06",border:"1px solid #3A2A14",borderRadius:12,padding:"12px",marginBottom:8}}>
          <div style={{fontSize:14,color:"#F0D9B0",marginBottom:2}}><span style={{fontWeight:"600"}}>{r.reportedName}</span> <span style={{color:"#C490A8"}}>reported by {r.reporterName}</span>{r.reportedRestricted&&<span style={{color:"#C2476A",fontSize:13}}> · restricted</span>}</div>
          <div style={{fontSize:13,color:"#E8B4CC",marginBottom:2}}>Reason: {r.reason}</div>
          <div style={{fontSize:13,color:"#C490A8",marginBottom:10}}>{new Date(r.created_at).toLocaleDateString([],{month:"short",day:"numeric"})}</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            <button disabled={busy===r.id} onClick={()=>run(r.id,()=>supabase.rpc("admin_restrict_user",{target_id:r.reported_user_id,restricted:!r.reportedRestricted}),r.reportedRestricted?"Account unrestricted.":"Account restricted — they can read but not send.")} style={btn}>{r.reportedRestricted?"Unrestrict":"Restrict"}</button>
            <button disabled={busy===r.id} onClick={()=>run(r.id,async()=>{const {data,error}=await supabase.rpc("admin_ban_email",{target_id:r.reported_user_id,reason:r.reason});if(error)throw error;return data;},"Email banned:")} style={btn}>Ban email</button>
            <button disabled={busy===r.id} onClick={()=>dismiss(r.id)} style={btn}>Dismiss</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function NotificationsPanel({notifs,announcements,isAdmin,onRead,onReadAll,onClose,onAnnounce,onEditAnnouncement,onDeleteAnnouncement}){
  const unread=notifs.filter(n=>!n.read).length;
  const [aTitle,setATitle]=useState("");const [aBody,setABody]=useState("");const [aSent,setASent]=useState(false);const [aErr,setAErr]=useState(false);
  const [editingId,setEditingId]=useState(null);const [eTitle,setETitle]=useState("");const [eBody,setEBody]=useState("");const [confirmDel,setConfirmDel]=useState(null);
  const sendA=async()=>{
    if(!aTitle.trim()||!aBody.trim())return;
    setAErr(false);
    const ok=await onAnnounce(aTitle,aBody);
    if(ok){setATitle("");setABody("");setASent(true);setTimeout(()=>setASent(false),3000);}
    else setAErr(true);
  };
  return(
    <div style={{position:"fixed",inset:0,background:"#0D0A06f0",zIndex:100,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div className="fade-up" onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:430,background:"#1A1208",borderRadius:"20px 20px 0 0",border:"1px solid #3A2A14",padding:"20px 18px 36px",maxHeight:"75vh",display:"flex",flexDirection:"column"}}>
        <div style={{width:36,height:4,background:"#3A2A14",borderRadius:2,margin:"0 auto 18px"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:300,color:"#F0D9B0"}}>Notifications</div>{unread>0&&<div style={{fontSize:13,color:"#C48700",marginTop:2}}>{unread} unread</div>}</div>
          {unread>0&&<button onClick={onReadAll} style={{background:"transparent",border:"1px solid #3A2A14",borderRadius:20,padding:"5px 12px",fontSize:13,color:"#E8B4CC",cursor:"pointer"}}>Mark all read</button>}
        </div>
        <div style={{overflowY:"auto",flex:1}}>
          {isAdmin&&(
            <div style={{background:"#C4870010",border:"1px solid #C4870044",borderRadius:14,padding:"14px",marginBottom:16}}>
              <div style={{fontSize:13,letterSpacing:2,color:"#C48700",textTransform:"uppercase",marginBottom:10}}>📢 Founder announcement</div>
              <input value={aTitle} onChange={e=>setATitle(e.target.value)} placeholder="Announcement title..." style={{width:"100%",background:"#0D0A06",border:"1px solid #3A2A14",borderRadius:10,padding:"10px 12px",color:"#EDE0CE",fontSize:13,marginBottom:8}}/>
              <textarea value={aBody} onChange={e=>setABody(e.target.value)} placeholder="Write your message to everyone..." rows={3} style={{width:"100%",background:"#0D0A06",border:"1px solid #3A2A14",borderRadius:10,padding:"10px 12px",color:"#EDE0CE",fontSize:13,marginBottom:10,resize:"none"}}/>
              <button onClick={sendA} style={{width:"100%",padding:"11px",borderRadius:20,background:(aTitle.trim()&&aBody.trim())?"linear-gradient(135deg,#8A5A00,#C48700)":"#2A1E0E",border:"none",color:(aTitle.trim()&&aBody.trim())?"#0D0A06":"#5A4030",fontSize:14,fontWeight:"600",cursor:(aTitle.trim()&&aBody.trim())?"pointer":"default"}}>Send to everyone →</button>
              {aSent&&<div style={{fontSize:13,color:"#6A8A50",marginTop:8,textAlign:"center"}}>Sent! Every member will see this. 🪐</div>}
              {aErr&&<div style={{fontSize:13,color:"#D06060",marginTop:8,textAlign:"center"}}>Couldn't send — try again.</div>}
            </div>
          )}
          {isAdmin&&<ModerationList/>}
          {announcements.length>0&&(
            <div style={{marginBottom:8}}>
              <div style={{fontSize:13,letterSpacing:2,color:"#E8B4CC",textTransform:"uppercase",marginBottom:6}}>From the founder</div>
              {announcements.map(a=>(
                <div key={a.id} style={{display:"flex",gap:12,padding:"12px 0",borderBottom:"1px solid #2A1E0E"}}>
                  <div style={{width:38,height:38,borderRadius:"50%",background:"#C4870018",border:"1px solid #C4870044",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>📢</div>
                  <div style={{flex:1,minWidth:0}}>
                    {isAdmin&&editingId===a.id?(
                      <div>
                        <input value={eTitle} onChange={e=>setETitle(e.target.value)} placeholder="Title..." style={{width:"100%",boxSizing:"border-box",background:"#0D0A06",border:"1px solid #3A2A14",borderRadius:10,padding:"9px 12px",color:"#EDE0CE",fontSize:13,marginBottom:8}}/>
                        <textarea value={eBody} onChange={e=>setEBody(e.target.value)} rows={3} style={{width:"100%",boxSizing:"border-box",background:"#0D0A06",border:"1px solid #3A2A14",borderRadius:10,padding:"9px 12px",color:"#EDE0CE",fontSize:13,marginBottom:8,resize:"none"}}/>
                        <div style={{display:"flex",gap:8}}>
                          <button onClick={async()=>{const ok=await onEditAnnouncement(editingId,eTitle,eBody);if(ok)setEditingId(null);}} style={{flex:1,padding:"9px",borderRadius:20,background:"linear-gradient(135deg,#8A5A00,#C48700)",border:"none",color:"#0D0A06",fontSize:14,fontWeight:"600",cursor:"pointer"}}>Save</button>
                          <button onClick={()=>setEditingId(null)} style={{padding:"9px 16px",borderRadius:20,background:"none",border:"1px solid #3A2A14",color:"#C490A8",fontSize:14,cursor:"pointer"}}>Cancel</button>
                        </div>
                      </div>
                    ):(
                      <div>
                        <div style={{fontSize:13,color:"#F0D9B0",fontWeight:"600",marginBottom:2}}>{a.title}</div>
                        <div style={{fontSize:14,color:"#D4A0B8",lineHeight:1.5}}>{a.body}</div>
                        <div style={{fontSize:13,color:"#C490A8",marginTop:4}}>{a.time}</div>
                        {isAdmin&&(
                          <div style={{display:"flex",gap:12,marginTop:6}}>
                            <button onClick={()=>{setEditingId(a.id);setETitle(a.title);setEBody(a.body);setConfirmDel(null);}} style={{background:"none",border:"none",color:"#C48700",fontSize:13,cursor:"pointer",padding:0}}>Edit</button>
                            <button onClick={()=>{if(confirmDel===a.id){onDeleteAnnouncement(a.id);setConfirmDel(null);}else setConfirmDel(a.id);}} style={{background:"none",border:"none",color:confirmDel===a.id?"#C2476A":"#C490A8",fontSize:13,cursor:"pointer",padding:0}}>{confirmDel===a.id?"Tap again to confirm":"Delete"}</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {notifs.length===0&&announcements.length===0&&(
            <div style={{textAlign:"center",padding:"36px 20px"}}>
              <div style={{fontSize:40,marginBottom:12}}>🪐</div>
              <div style={{fontSize:14,color:"#C490A8",lineHeight:1.7}}>You're all caught up.<br/>Announcements from the founder will appear here.</div>
            </div>
          )}
          {notifs.map(n=>(
            <div key={n.id} onClick={()=>onRead(n.id)} style={{display:"flex",gap:12,padding:"12px 0",borderBottom:"1px solid #2A1E0E",cursor:"pointer",opacity:n.read?0.55:1}}>
              <div style={{width:38,height:38,borderRadius:"50%",background:n.read?"#1A1208":"#C4870018",border:`1px solid ${n.read?"#3A2A14":"#C4870044"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,position:"relative"}}>
                {n.icon}{!n.read&&<div style={{position:"absolute",top:0,right:0,width:8,height:8,borderRadius:"50%",background:"#C48700",border:"2px solid #1A1208"}}/>}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,color:n.read?"#9A7040":"#F0D9B0",fontWeight:n.read?"400":"600",marginBottom:2}}>{n.title}</div>
                <div style={{fontSize:14,color:"#D4A0B8",lineHeight:1.5}}>{n.body}</div>
                <div style={{fontSize:13,color:"#C490A8",marginTop:4}}>{n.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── DMs ───────────────────────────────────────────────────────────
function DMThread({username,thread,myAvatar,onSend,onBack,myBlocks,blockedBy,onBlock,onUnblock,onReport}){
  const [txt,setTxt]=useState("");const endRef=useRef(null);const txtRef=useRef(null);
  const otherId=thread&&thread.user_id;
  const iBlocked=!!(otherId&&myBlocks&&myBlocks.includes(otherId));
  const blockedMe=!!(otherId&&blockedBy&&blockedBy.includes(otherId));
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[thread?.messages]);
  if(!thread) return(
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div style={{padding:"12px 14px",background:"#1A1208cc",borderBottom:"1px solid #2A1E0E",display:"flex",alignItems:"center",gap:10}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:"#E8B4CC",fontSize:22,cursor:"pointer",padding:0}}>‹</button>
        <div style={{fontWeight:"600",color:"#F0D9B0",fontSize:14}}>{username}</div>
      </div>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",color:"#C490A8",fontSize:14}}>Loading conversation... 🪐</div>
    </div>
  );
  const send=()=>{if(!txt.trim())return;onSend(username,txt.trim());setTxt("");if(txtRef.current)txtRef.current.style.height="auto";};
  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div style={{padding:"12px 14px",background:"#1A1208cc",borderBottom:"1px solid #2A1E0E",display:"flex",alignItems:"center",gap:10}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:"#E8B4CC",fontSize:22,cursor:"pointer",padding:0}}>‹</button>
        <div style={{width:36,height:36,borderRadius:"50%",background:"#231A0A",border:"1px solid #3A2A14",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{thread.avatar}</div>
        <div><div style={{fontWeight:"600",color:"#F0D9B0",fontSize:14}}>{username}</div><div style={{fontSize:13,color:"#E8B4CC"}}>📍 {thread.city}</div></div>
        <div style={{marginLeft:"auto",display:"flex",gap:2}}>
          <button onClick={()=>iBlocked?onUnblock(otherId):onBlock(otherId)} style={{background:"none",border:"none",fontSize:17,cursor:"pointer",padding:"4px"}} title={iBlocked?"Unblock":"Block"}>{iBlocked?"🔓":"🚫"}</button>
          <button onClick={()=>onReport(otherId,username)} style={{background:"none",border:"none",fontSize:17,cursor:"pointer",padding:"4px"}} title="Report">⚠️</button>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"14px 13px 6px"}}>
        {thread.messages.map((m,i)=>(
          <div key={i} style={{marginBottom:12,display:"flex",gap:10,alignItems:"flex-end",flexDirection:m.isMe?"row-reverse":"row"}}>
            <div style={{width:30,height:30,borderRadius:"50%",background:"#231A0A",border:"1px solid #3A2A14",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{m.isMe?myAvatar:thread.avatar}</div>
            <div style={{maxWidth:"72%"}}>
              <div style={{fontSize:14,lineHeight:1.6,whiteSpace:"pre-wrap",borderRadius:m.isMe?"14px 4px 14px 14px":"4px 14px 14px 14px",padding:"9px 13px",background:m.isMe?"#C4870022":"#231A0E",border:`1px solid ${m.isMe?"#C4870044":"#3A2A14"}`,color:"#EDE0CE"}}>{m.text}</div>
              <div style={{fontSize:13,color:"#B48098",marginTop:3,textAlign:m.isMe?"right":"left"}}>{m.time}</div>
            </div>
          </div>
        ))}
        <div ref={endRef}/>
      </div>
      {(iBlocked||blockedMe)?(
        <div style={{padding:"14px 12px 16px",borderTop:"1px solid #2A1E0E",background:"#0D0A06cc",textAlign:"center"}}>
          <div style={{fontSize:14,color:"#C490A8",fontStyle:"italic",marginBottom:iBlocked?8:0}}>{iBlocked?`You blocked ${username}.`:`You can't message this reader.`}</div>
          {iBlocked&&<button onClick={()=>onUnblock(otherId)} style={{background:"none",border:"1px solid #C48700",borderRadius:20,padding:"8px 18px",color:"#C48700",fontSize:14,fontWeight:"600",cursor:"pointer"}}>Unblock</button>}
        </div>
      ):(
      <div style={{padding:"8px 12px 10px",borderTop:"1px solid #2A1E0E",background:"#0D0A06cc",display:"flex",gap:8}}>
        <textarea value={txt} rows={1} ref={txtRef} onChange={e=>{setTxt(e.target.value);e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,110)+"px";}} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder={`Message ${username}...`} style={{flex:1,background:"#1A1208",border:"1px solid #3A2A14",borderRadius:20,padding:"10px 16px",color:"#EDE0CE",fontSize:14,resize:"none",overflowY:"auto",maxHeight:110}}/>
        <button onClick={send} style={{width:40,height:40,borderRadius:"50%",background:"#C48700",border:"none",color:"#0D0A06",fontSize:16,cursor:"pointer",flexShrink:0}}>↑</button>
      </div>)}
    </div>
  );
}
// ── Public reader profile card (tap a username in chat) ──────────
function UserCard({username,onMessage,onClose,myBlocks,onBlock,onUnblock,onReport}){
  const [u,setU]=useState(null);const [clubs,setClubs]=useState([]);
  const isBlocked=!!(u&&myBlocks&&myBlocks.includes(u.id));
  useEffect(()=>{
    let c=false;
    (async()=>{
      try{
        const {data:row}=await supabase.from("users").select("id,username,avatar,city,state,join_date").eq("username",username).single();
        if(c||!row)return;setU(row);
        const {data:mems}=await supabase.from("memberships").select("genre_id").eq("user_id",row.id);
        if(!c)setClubs((mems||[]).map(m=>m.genre_id));
      }catch(e){/* keep loading state */}
    })();
    return ()=>{c=true;};
  },[username]);
  return(
    <div style={{position:"fixed",inset:0,background:"#0D0A06f0",zIndex:100,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div className="fade-up" onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:430,background:"#1A1208",borderRadius:"20px 20px 0 0",border:"1px solid #3A2A14",padding:"24px 20px 36px"}}>
        <div style={{width:36,height:4,background:"#3A2A14",borderRadius:2,margin:"0 auto 20px"}}/>
        {!u?(
          <div style={{textAlign:"center",padding:"30px",color:"#C490A8",fontSize:14}}>Loading reader... 🪐</div>
        ):(
          <div style={{textAlign:"center"}}>
            <div style={{width:72,height:72,borderRadius:"50%",background:"#231A0A",border:"1px solid #C4870044",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,margin:"0 auto 12px"}}>{u.avatar}</div>
            <div style={{fontSize:20,fontWeight:"600",color:"#F0D9B0",marginBottom:4}}>{u.username}</div>
            <div style={{fontSize:14,color:"#D4A0B8",marginBottom:4}}>📍 {u.city}{u.state?", "+u.state:""}</div>
            <div style={{fontSize:13,color:"#C490A8",marginBottom:16}}>Member since {u.join_date?new Date(u.join_date).toLocaleDateString([],{month:"long",year:"numeric"}):"recently"}</div>
            {clubs.length>0&&(
              <div style={{marginBottom:20}}>
                <div style={{fontSize:13,letterSpacing:2,color:"#E8B4CC",textTransform:"uppercase",marginBottom:8}}>{clubs.length} club{clubs.length===1?"":"s"}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center"}}>
                  {clubs.map(gid=>{const g=GENRES.find(x=>x.id===gid);if(!g)return null;
                    return <span key={gid} style={{fontSize:13,background:g.color+"18",border:`1px solid ${g.color}44`,borderRadius:20,padding:"4px 10px",color:g.color}}>{g.icon} {g.label}</span>;})}
                </div>
              </div>
            )}
            <button onClick={()=>onMessage(u.username)} style={{width:"100%",padding:"13px",borderRadius:30,background:"linear-gradient(135deg,#8A5A00,#C48700)",border:"none",color:"#0D0A06",fontSize:15,fontWeight:"600",cursor:"pointer"}}>Message {u.username} →</button>
            <div style={{display:"flex",gap:8,marginTop:10}}>
              {isBlocked?(
                <button onClick={()=>onUnblock(u.id)} style={{flex:1,padding:"11px",borderRadius:30,background:"none",border:"1px solid #C48700",color:"#C48700",fontSize:14,fontWeight:"600",cursor:"pointer"}}>Unblock</button>
              ):(
                <button onClick={()=>onBlock(u.id)} style={{flex:1,padding:"11px",borderRadius:30,background:"none",border:"1px solid #C490A8",color:"#C490A8",fontSize:14,cursor:"pointer"}}>🚫 Block</button>
              )}
              <button onClick={()=>onReport(u.id,u.username)} style={{flex:1,padding:"11px",borderRadius:30,background:"none",border:"1px solid #C490A8",color:"#C490A8",fontSize:14,cursor:"pointer"}}>⚠️ Report</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Report a reader ─────────────────────────────────────────────
function ReportSheet({username,onSubmit,onClose}){
  const reasons=["Spam","Harassment or bullying","Inappropriate content","Breaking anonymity","Other"];
  return(
    <div style={{position:"fixed",inset:0,background:"#0D0A06f0",zIndex:110,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div className="fade-up" onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:430,background:"#1A1208",borderRadius:"20px 20px 0 0",border:"1px solid #3A2A14",padding:"24px 20px 36px"}}>
        <div style={{width:36,height:4,background:"#3A2A14",borderRadius:2,margin:"0 auto 20px"}}/>
        <div style={{fontSize:13,letterSpacing:3,color:"#E8B4CC",textTransform:"uppercase",marginBottom:6,textAlign:"center"}}>Report reader</div>
        <div style={{fontSize:14,color:"#D4A0B8",textAlign:"center",marginBottom:16}}>Why are you reporting <span style={{color:"#F0D9B0",fontWeight:"600"}}>{username}</span>?</div>
        {reasons.map(r=>(
          <button key={r} onClick={()=>onSubmit(r)} style={{width:"100%",textAlign:"left",padding:"13px 16px",borderRadius:12,background:"#0D0A06",border:"1px solid #3A2A14",color:"#EDE0CE",fontSize:14,marginBottom:8,cursor:"pointer"}}>{r}</button>
        ))}
        <button onClick={onClose} style={{width:"100%",padding:"12px",borderRadius:30,background:"none",border:"none",color:"#C490A8",fontSize:14,cursor:"pointer",marginTop:4}}>Cancel</button>
        <div style={{fontSize:13,color:"#C490A8",textAlign:"center",marginTop:8,fontStyle:"italic"}}>Reports go to the founder for review.</div>
      </div>
    </div>
  );
}

// ── Edit your profile (avatar + city) ─────────────────────────────
function EditProfile({profile,onSave,onClose}){
  const [avatar,setAvatar]=useState(profile.avatar||"🦋");
  const [city,setCity]=useState(profile.city||"Raleigh");
  const [state,setState]=useState(profile.state||"NC");
  const [saving,setSaving]=useState(false);
  const [err,setErr]=useState("");
  const save=async()=>{
    if(!city.trim()){setErr("Please enter your city.");return;}
    setSaving(true);setErr("");
    try{
      const c=city.trim();
      if(isCloud&&profile.uid){
        const {error}=await supabase.from("users").update({avatar,city:c,state}).eq("id",profile.uid);
        if(error)throw error;
      }
      onSave({avatar,city:c,state});
      onClose();
    }catch(e){setErr("Couldn't save — try again.");setSaving(false);}
  };
  return(
    <div style={{position:"fixed",inset:0,background:"#0D0A06f0",zIndex:100,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div className="fade-up" onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:430,background:"#1A1208",borderRadius:"20px 20px 0 0",border:"1px solid #3A2A14",padding:"24px 20px 36px",maxHeight:"85vh",overflowY:"auto"}}>
        <div style={{width:36,height:4,background:"#3A2A14",borderRadius:2,margin:"0 auto 20px"}}/>
        <div style={{fontSize:13,letterSpacing:3,color:"#E8B4CC",textTransform:"uppercase",marginBottom:12,textAlign:"center"}}>Edit Profile</div>
        <div style={{fontSize:14,color:"#D4A0B8",marginBottom:8}}>Avatar</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:18}}>
          {AVATARS.map(a=><button key={a} onClick={()=>setAvatar(a)} style={{width:44,height:44,borderRadius:"50%",fontSize:20,background:avatar===a?"#C4870022":"#1A1208",border:`2px solid ${avatar===a?"#C48700":"#3A2A14"}`,cursor:"pointer",transition:"all 0.2s"}}>{a}</button>)}
        </div>
        <div style={{fontSize:14,color:"#D4A0B8",marginBottom:8}}>City</div>
        <div style={{display:"flex",gap:8,marginBottom:6}}>
          <input value={city} onChange={e=>setCity(e.target.value)} list="orbit-cities-edit" placeholder="City" style={{flex:1,minWidth:0,background:"#0D0A06",border:"1px solid #3A2A14",borderRadius:10,padding:"12px 16px",color:"#EDE0CE",fontSize:15}}/>
          <datalist id="orbit-cities-edit">{CITY_NAMES.map(n=><option key={n} value={n}/>)}</datalist>
          <select value={state} onChange={e=>setState(e.target.value)} style={{width:88,flexShrink:0,background:"#0D0A06",border:"1px solid #3A2A14",borderRadius:10,padding:"12px 8px",color:"#EDE0CE",fontSize:15}}>
            {US_STATES.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div style={{fontSize:13,color:"#C490A8",fontStyle:"italic",marginBottom:18}}>City-level only — never your exact location.</div>
        {err&&<div style={{fontSize:13,color:"#D06060",marginBottom:12,textAlign:"center"}}>{err}</div>}
        <button onClick={save} disabled={saving} style={{width:"100%",padding:"13px",borderRadius:30,background:saving?"#6A5030":"linear-gradient(135deg,#8A5A00,#C48700)",border:"none",color:"#0D0A06",fontSize:15,fontWeight:"600",cursor:"pointer"}}>{saving?"Saving...":"Save Changes"}</button>
      </div>
    </div>
  );
}

function DMsList({dms,onOpenThread,onBack,myBlocks,blockedBy}){
  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div style={{padding:"12px 14px",background:"#1A1208cc",borderBottom:"1px solid #2A1E0E",display:"flex",alignItems:"center",gap:10}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:"#E8B4CC",fontSize:22,cursor:"pointer",padding:0}}>‹</button>
        <div style={{flex:1}}><div style={{fontWeight:"600",color:"#F0D9B0",fontSize:15}}>Direct Messages</div><div style={{fontSize:13,color:"#E8B4CC"}}>Private · just between readers</div></div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"8px 14px"}}>
        {Object.keys(dms).length===0&&(
          <div style={{textAlign:"center",padding:"40px 20px"}}>
            <div style={{fontSize:40,marginBottom:12}}>💬</div>
            <div style={{fontSize:14,color:"#C490A8",lineHeight:1.7}}>No conversations yet.<br/>Tap any reader's name in a club chat<br/>to view their profile and say hi 👋</div>
          </div>
        )}
        {Object.entries(dms).map(([username,thread])=>{const last=thread.messages[thread.messages.length-1];const bl=(myBlocks&&thread.user_id&&myBlocks.includes(thread.user_id))||(blockedBy&&thread.user_id&&blockedBy.includes(thread.user_id));return(
          <div key={username} onClick={()=>onOpenThread(username)} style={{display:"flex",gap:12,padding:"12px 0",borderBottom:"1px solid #2A1E0E",cursor:"pointer"}}>
            <div style={{width:44,height:44,borderRadius:"50%",background:"#231A0A",border:"1px solid #3A2A14",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{thread.avatar}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:14,fontWeight:"600",color:"#F0D9B0"}}>{bl?"🚫 ":""}{username}</span><span style={{fontSize:13,color:"#C490A8"}}>{last?.time}</span></div>
              <div style={{fontSize:14,color:"#D4A0B8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{last?.isMe?"You: ":""}{last?.text}</div>
            </div>
          </div>
        );})}
      </div>
    </div>
  );
}

// ── Book Page ─────────────────────────────────────────────────────
function BookPage({genre,pick,myChapter,onUpdateChapter,onBack}){
  const [chapter,setChapter]=useState(myChapter);
  const pct=Math.round((chapter/genre.totalChapters)*100);
  const milestones=[{pct:25,label:"¼ Through",icon:"🌱"},{pct:50,label:"Halfway",icon:"🌓"},{pct:75,label:"¾ Through",icon:"🌖"},{pct:100,label:"Finished!",icon:"⭐"}];
  const earned=milestones.filter(m=>pct>=m.pct);const next=milestones.find(m=>pct<m.pct);
  return(
    <div className="fade-up" style={{paddingBottom:20}}>
      <div style={{padding:"12px 14px 0",display:"flex",alignItems:"center",gap:8}}><button onClick={onBack} style={{background:"none",border:"none",color:"#E8B4CC",fontSize:22,cursor:"pointer",padding:0}}>‹</button><span style={{fontSize:14,color:"#D4A0B8"}}>Back</span></div>
      <div style={{margin:"12px 14px 0",borderRadius:16,overflow:"hidden",border:`1px solid ${genre.color}44`}}>
        <div style={{background:BOOK_COVERS[genre.id],height:180,display:"flex",alignItems:"flex-end",padding:"0 20px 20px",position:"relative"}}>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 30%,#0D0A06cc 100%)"}}/>
          <div style={{position:"absolute",top:20,right:20,fontSize:36,opacity:.6}}>{genre.icon}</div>
          <div style={{position:"relative",zIndex:1}}>
            {genre.mature&&<div style={{fontSize:14,color:"#C2476A",background:"#C2476A18",border:"1px solid #C2476A44",borderRadius:20,padding:"2px 8px",letterSpacing:2,textTransform:"uppercase",marginBottom:6,display:"inline-block"}}>Mature 18+</div>}
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:600,color:"#F0D9B0",lineHeight:1.2}}>{pick.title}</div>
            <div style={{fontSize:13,color:"#C4A060",marginTop:3}}>{pick.author||genre.author}</div>
          </div>
        </div>
      </div>
      <div style={{padding:"16px 14px 0"}}>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>{genre.tags.map(t=><span key={t} style={{fontSize:13,background:genre.color+"18",border:`1px solid ${genre.color}44`,color:genre.color,borderRadius:20,padding:"3px 10px"}}>{t}</span>)}</div>
        <div style={{background:"#1A1208",borderRadius:14,padding:16,marginBottom:14,border:`1px solid ${genre.color}33`}}>
          <div style={{fontSize:13,letterSpacing:3,color:"#E8B4CC",textTransform:"uppercase",marginBottom:12}}>📖 My Progress</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:8}}><div><span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:36,fontWeight:300,color:"#F0D9B0"}}>{chapter}</span><span style={{fontSize:13,color:"#D4A0B8"}}> / {genre.totalChapters}</span></div><div style={{fontSize:28,fontWeight:"bold",color:genre.color}}>{pct}%</div></div>
          <style>{`.cs-${genre.id}::-webkit-slider-thumb{background:${genre.color};} .cs-${genre.id}::-webkit-slider-runnable-track{background:linear-gradient(90deg,${genre.color} ${pct}%,#2A1E0E ${pct}%);}`}</style>
          <input type="range" min={0} max={genre.totalChapters} value={chapter} onChange={e=>setChapter(parseInt(e.target.value))} onMouseUp={()=>onUpdateChapter(chapter)} onTouchEnd={()=>onUpdateChapter(chapter)} className={`chapter-slider cs-${genre.id}`} style={{width:"100%",marginBottom:10}}/>
          {next&&<div style={{background:"#231A0A",borderRadius:10,padding:"10px 12px",border:"1px solid #3A2A14",display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:20}}>{next.icon}</span><div><div style={{fontSize:14,color:"#C4A060"}}>Next: {next.label}</div><div style={{fontSize:13,color:"#D4A0B8"}}>{next.pct-pct}% to go</div></div></div>}
        </div>
        {earned.length>0&&<div style={{background:"#1A1208",borderRadius:14,padding:16,border:`1px solid ${genre.color}33`}}>
          <div style={{fontSize:13,letterSpacing:3,color:"#E8B4CC",textTransform:"uppercase",marginBottom:12}}>🏅 Reading Badges</div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>{earned.map(m=><div key={m.pct} style={{background:genre.color+"18",border:`1px solid ${genre.color}44`,borderRadius:12,padding:"8px 14px",display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:18}}>{m.icon}</span><span style={{fontSize:14,color:genre.color}}>{m.label}</span></div>)}</div>
        </div>}
      </div>
    </div>
  );
}

// ── Profile Page ──────────────────────────────────────────────────
function ProfilePage({profile,joined,chapterProg,identity,onBack,onLogout,onEdit,pickTitle}){
  const jGenres=GENRES.filter(g=>(joined||[]).includes(g.id));
  const totalChRead=Object.values(chapterProg).reduce((s,c)=>s+c,0);
  const finishedBooks=Object.entries(chapterProg).filter(([gid,ch])=>{const g=GENRES.find(x=>x.id===gid);return g&&ch>=g.totalChapters;}).length;
  const allBadges=[];
  jGenres.forEach(g=>{const ch=chapterProg[g.id]||0;const pct=Math.round((ch/g.totalChapters)*100);
    if(pct>=25)allBadges.push({icon:"🌱",label:`${g.label} ¼ Through`,color:g.color});
    if(pct>=50)allBadges.push({icon:"🌓",label:`${g.label} Halfway`,color:g.color});
    if(pct>=100)allBadges.push({icon:"⭐",label:`${g.label} Finished!`,color:g.color});
  });
  if(joined.length>=3)allBadges.push({icon:"🌌",label:"Galaxy Brain — 3+ clubs",color:"#C48700"});
  if(joined.length>=5)allBadges.push({icon:"🪐",label:"In Orbit — 5+ clubs",color:"#C48700"});
  const idObj=IDENTITIES.find(i=>i.id===identity);
  return(
    <div className="fade-up" style={{paddingBottom:30}}>
      <div style={{padding:"12px 14px 0",display:"flex",alignItems:"center",gap:8}}><button onClick={onBack} style={{background:"none",border:"none",color:"#E8B4CC",fontSize:22,cursor:"pointer",padding:0}}>‹</button><span style={{fontSize:14,color:"#D4A0B8"}}>My Profile</span><div style={{flex:1}}/><button onClick={onEdit} style={{background:"none",border:"1px solid #3A2A14",borderRadius:20,padding:"6px 14px",color:"#C4A060",fontSize:13,cursor:"pointer"}}>Edit</button></div>
      <div style={{margin:"12px 14px 0",background:"linear-gradient(135deg,#1A1208,#231A0A)",borderRadius:16,padding:"24px 20px",border:"1px solid #3A2A14",textAlign:"center"}}>
        <div style={{width:70,height:70,borderRadius:"50%",background:"linear-gradient(135deg,#8A5A00,#C48700)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,margin:"0 auto 12px",boxShadow:"0 0 30px #C4870033"}}>{profile.avatar}</div>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:300,color:"#F0D9B0",marginBottom:4,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>{profile.username}{idObj&&<span style={{fontSize:18,animation:"starPulse 3s ease-in-out infinite"}}>{idObj.star}</span>}</div>
        {idObj&&<div style={{fontSize:13,color:idObj.color,marginBottom:6,background:idObj.color+"14",border:`1px solid ${idObj.color}33`,borderRadius:20,padding:"3px 12px",display:"inline-block"}}>{idObj.star} {idObj.label}</div>}
        <div style={{fontSize:14,color:"#E8B4CC",marginTop:6}}>📍 {profile.city}</div>
        <div style={{fontSize:13,color:"#C490A8",marginTop:4,fontStyle:"italic"}}>Member since {profile.joinDate||"2025"}</div>
      </div>
      <div style={{padding:"16px 14px 0",display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
        {[{label:"Clubs",value:joined.length,icon:"🪐"},{label:"Ch. Read",value:totalChRead,icon:"📖"},{label:"Finished",value:finishedBooks,icon:"⭐"}].map(s=>(
          <div key={s.label} style={{background:"#1A1208",borderRadius:12,padding:"14px 10px",border:"1px solid #3A2A14",textAlign:"center"}}>
            <div style={{fontSize:22,marginBottom:4}}>{s.icon}</div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:300,color:"#F0D9B0"}}>{s.value}</div>
            <div style={{fontSize:13,color:"#D4A0B8",letterSpacing:1,textTransform:"uppercase"}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{padding:"16px 14px 0"}}>
        <div style={{fontSize:13,letterSpacing:3,color:"#E8B4CC",textTransform:"uppercase",marginBottom:12}}>Currently Reading</div>
        {jGenres.map(g=>{const ch=chapterProg[g.id]||0;const pct=Math.round((ch/g.totalChapters)*100);return(
          <div key={g.id} style={{background:"#1A1208",borderRadius:12,padding:"12px 14px",marginBottom:10,border:`1px solid ${g.color}33`,display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:40,height:40,borderRadius:8,background:BOOK_COVERS[g.id],display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{g.icon}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,color:"#F0D9B0",fontWeight:"600",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{pickTitle(g)}</div>
              <div style={{marginTop:5,height:3,background:"#2A1E0E",borderRadius:2}}><div style={{width:`${pct}%`,height:"100%",background:`linear-gradient(90deg,${g.color}55,${g.color})`,borderRadius:2}}/></div>
              <div style={{fontSize:13,color:"#C490A8",marginTop:2}}>Ch. {ch}/{g.totalChapters} · {pct}%</div>
            </div>
          </div>
        );})}
      </div>
      {allBadges.length>0&&<div style={{padding:"4px 14px 0"}}>
        <div style={{fontSize:13,letterSpacing:3,color:"#E8B4CC",textTransform:"uppercase",marginBottom:12}}>🏅 Badges</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:14}}>{allBadges.map((b,i)=><div key={i} style={{background:b.color+"14",border:`1px solid ${b.color}44`,borderRadius:12,padding:"8px 12px",display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:16}}>{b.icon}</span><span style={{fontSize:13,color:b.color}}>{b.label}</span></div>)}</div>
        {/* Founding Member note */}
        <div style={{background:"#C4870010",border:"1px solid #C4870044",borderRadius:14,padding:"14px 16px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
            <span style={{fontSize:22}}>🌟</span>
            <div style={{fontWeight:"600",color:"#F0D9B0",fontSize:14}}>Founding Member Badge</div>
          </div>
          <p style={{fontSize:13,color:"#D4A0B8",lineHeight:1.7,fontStyle:"italic"}}>
            "Tip within the first 6 months of Orbit's launch and this badge is yours forever. No matter how big Orbit grows — you were here first. This badge never goes away."
          </p>
          <div style={{marginTop:10,fontSize:11,color:"#C48700",letterSpacing:1}}>🪐 Early supporters only · Limited window</div>
        </div>
      </div>}
      <div style={{padding:"24px 14px 0"}}><button onClick={onLogout} style={{width:"100%",padding:13,borderRadius:30,background:"transparent",border:"1px solid #3A2A14",color:"#D4A0B8",fontSize:14,cursor:"pointer"}}>Sign Out of Orbit</button></div>
    </div>
  );
}

// ── Landing Page ──────────────────────────────────────────────────
function LandingPage({onJoin,onSignIn,clubLine,pickTitle}){
  return(
    <div style={{background:"#0D0A06",minHeight:"100vh",fontFamily:"'Crimson Text',Georgia,serif",color:"#EDE0CE",overflowX:"hidden",position:"relative"}}>
      <Stars count={70}/><CosmicBackground/>
      <nav style={{position:"sticky",top:0,zIndex:20,background:"#0D0A06cc",backdropFilter:"blur(14px)",borderBottom:"1px solid #2A1E0E",padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:300,letterSpacing:1}}><span className="gold-text">Orbit</span></div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <div style={{fontSize:14,color:"#C48700",background:"#C4870018",border:"1px solid #C4870044",borderRadius:20,padding:"3px 9px",letterSpacing:2,textTransform:"uppercase"}}>21+</div>
          <button onClick={onSignIn} style={{background:"transparent",border:"1px solid #3A2A14",borderRadius:20,padding:"7px 16px",color:"#E8B4CC",fontSize:13,cursor:"pointer"}}>Sign In</button>
          <button onClick={onJoin} style={{background:"linear-gradient(135deg,#8A5A00,#C48700)",border:"none",borderRadius:20,padding:"7px 18px",color:"#0D0A06",fontSize:13,fontWeight:"600",cursor:"pointer"}}>Join Free</button>
        </div>
      </nav>
      <section style={{position:"relative",zIndex:1,textAlign:"center",padding:"70px 24px 60px",minHeight:"90vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <div style={{position:"relative",width:100,height:100,margin:"0 auto 28px",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{width:100,height:100,borderRadius:"50%",border:"1px solid #C4870022",position:"absolute"}}/>
          <div style={{width:70,height:70,borderRadius:"50%",border:"1px solid #C4870044",position:"absolute"}}/>
          <div style={{width:36,height:36,borderRadius:"50%",background:"radial-gradient(circle,#C48700,#8A5A00)",boxShadow:"0 0 30px #C4870077",position:"relative",zIndex:1}} className="flicker"/>
          <div style={{position:"absolute",width:10,height:10,borderRadius:"50%",background:"#FDE68A",boxShadow:"0 0 8px #FDE68A",top:6,left:"50%",transform:"translateX(-50%)",animation:"orbitAnim 6s linear infinite"}}/>
          <div style={{position:"absolute",width:7,height:7,borderRadius:"50%",background:"#C4B8FF",top:8,left:"50%",transform:"translateX(-50%)",animation:"orbitSlow 10s linear infinite reverse"}}/>
        </div>
        <div style={{fontSize:13,letterSpacing:6,color:"#E8B4CC",textTransform:"uppercase",marginBottom:12}}>21+ Book Community · Nationwide</div>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(52px,12vw,80px)",fontWeight:300,lineHeight:1.05,marginBottom:16}}><span className="gold-text-wide">Orbit</span></h1>
        <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(20px,5vw,28px)",fontWeight:300,fontStyle:"italic",color:"#C4A060",marginBottom:10}}>Find your people. Find your world.</p>
        <p style={{fontSize:15,color:"#D4A0B8",marginBottom:36,lineHeight:1.8,maxWidth:360,margin:"0 auto 36px"}}>A private book club for adults who read deeply, think freely, and deserve a community that actually feels like one.</p>
        <div style={{display:"flex",flexDirection:"column",gap:12,width:"100%",maxWidth:320}}>
          <button onClick={onJoin} style={{width:"100%",padding:"16px",borderRadius:30,background:"linear-gradient(135deg,#8A5A00,#C48700,#E8A830)",border:"none",color:"#0D0A06",fontSize:17,fontWeight:"600",cursor:"pointer",animation:"pulse 2.5s ease-in-out infinite"}}>Join Orbit — It's Free →</button>
          <button onClick={onSignIn} style={{width:"100%",padding:"14px",borderRadius:30,background:"transparent",border:"1px solid #3A2A14",color:"#C4A060",fontSize:15,cursor:"pointer"}}>Already a member? Sign in</button>
          <div style={{fontSize:13,color:"#D4A0B8",lineHeight:1.7}}>21+ only · No real name · No cameras · Free forever</div>
        </div>
      </section>
      <section style={{position:"relative",zIndex:1,padding:"40px 24px 60px",textAlign:"center"}}>
        <div style={{fontSize:13,letterSpacing:4,color:"#E8B4CC",textTransform:"uppercase",marginBottom:12}}>What is Orbit?</div>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:34,fontWeight:300,fontStyle:"italic",color:"#F0D9B0",marginBottom:24,lineHeight:1.3}}>Every book is a universe.<br/>We help you find yours.</h2>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,maxWidth:420,margin:"0 auto"}}>
          {[{icon:"🕯️",title:"No cameras",desc:"Text-only rooms. Show up in your pajamas."},{icon:"🌸",title:"Women's Rooms",desc:"Safe, candid spaces in every club."},{icon:"😭",title:"Memes + Reactions",desc:"Share memes, images, passages, and emoji reactions in chat."},{icon:"👥",title:"15 per room",desc:"Intimate by design. Real conversations."},{icon:"🗳️",title:"You decide",desc:"Community votes on every book. Automatically."},{icon:"🌍",title:"Your city",desc:"A brand-new community. Be one of the first to find your people."}].map((f,i)=>(
            <div key={i} style={{background:"#1A120888",border:"1px solid #2A1E0E",borderRadius:14,padding:"16px 14px",backdropFilter:"blur(8px)",textAlign:"left"}}>
              <div style={{fontSize:24,marginBottom:8}}>{f.icon}</div>
              <div style={{fontWeight:"600",color:"#F0D9B0",fontSize:14,marginBottom:4}}>{f.title}</div>
              <div style={{fontSize:14,color:"#D4A0B8",lineHeight:1.6}}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>
      <section style={{position:"relative",zIndex:1,padding:"40px 0 60px"}}>
        <div style={{textAlign:"center",padding:"0 24px",marginBottom:24}}><div style={{fontSize:13,letterSpacing:4,color:"#E8B4CC",textTransform:"uppercase",marginBottom:10}}>Genre Clubs</div><h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:30,fontWeight:300,fontStyle:"italic",color:"#F0D9B0"}}>13 clubs. One universe.</h2></div>
        <div style={{display:"flex",gap:12,padding:"8px 24px",overflowX:"auto",scrollbarWidth:"none"}}>
          {[...GENRES,...GENRES.slice(0,5)].map((g,i)=>(
            <div key={i} style={{flexShrink:0,width:160,background:"#1A120888",border:`1px solid ${g.color}44`,borderRadius:14,overflow:"hidden",backdropFilter:"blur(8px)",cursor:"pointer"}} onClick={onJoin}>
              <div style={{background:BOOK_COVERS[g.id],height:90,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,position:"relative"}}><div style={{position:"absolute",inset:0,background:"#00000033"}}/><span style={{position:"relative",zIndex:1}}>{g.icon}</span></div>
              <div style={{padding:"10px 12px"}}>
                <div style={{fontSize:13,fontWeight:"600",color:"#F0D9B0",marginBottom:3}}>{g.label}</div>
                <div style={{fontSize:13,color:"#C4A060",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontStyle:"italic"}}>{pickTitle(g)}</div>
                <div style={{fontSize:13,color:"#C490A8",marginTop:4}}>{clubLine(g)}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section style={{position:"relative",zIndex:1,padding:"40px 0 60px"}}>
        <div style={{textAlign:"center",padding:"0 24px",marginBottom:28}}><div style={{fontSize:13,letterSpacing:4,color:"#E8B4CC",textTransform:"uppercase",marginBottom:10}}>From the Founder</div><h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:30,fontWeight:300,fontStyle:"italic",color:"#F2B8D0"}}>Why Orbit Exists</h2></div>
        <div style={{maxWidth:560,margin:"0 auto",padding:"8px 24px"}}>
          <div style={{background:"#21121888",border:"1px solid #5A2E42",borderRadius:14,padding:"28px 24px",backdropFilter:"blur(8px)",boxShadow:"0 0 44px #E8B4CC26, inset 0 0 24px #E8B4CC11"}}>
            <p style={{fontSize:15,color:"#EEC6D8",fontStyle:"italic",lineHeight:1.9,marginBottom:16}}>Every book is its own universe — its own world, its own rules, its own magic, its own people who feel like home. And what readers do, what we've always done, is orbit: moving from universe to universe, carried by story.</p>
            <p style={{fontSize:15,color:"#EEC6D8",lineHeight:1.9,marginBottom:16}}>Orbit exists because not everyone has someone to text at 11pm about the chapter that just wrecked them. It's for everyone who ever wanted a book community but couldn't always show up — the busy ones, the quiet ones, the newly moved, the night shift workers, the parents. The people who love books deeply but haven't found their people yet.</p>
            <p style={{fontSize:15,color:"#EEC6D8",lineHeight:1.9,marginBottom:16}}>I built Orbit because I was still looking for my community too. I wanted local readers — people from my city who read what I read and didn't need me to explain why a book could change everything. I couldn't find that place. So I built it.</p>
            <p style={{fontSize:15,color:"#EEC6D8",lineHeight:1.9,marginBottom:20}}>My hope is that here, between one universe and the next, we find each other. Because that's what books do: they remind us we're not alone. And so does this community.</p>
            <div style={{fontSize:15,color:"#F2B8D0",fontWeight:"600"}}>— Founder of Orbit 🪐</div>
          </div>
        </div>
      </section>
      <section style={{position:"relative",zIndex:1,padding:"60px 24px 80px",textAlign:"center"}}>
        <div className="flicker" style={{fontSize:48,marginBottom:16}}>🪐</div>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:36,fontWeight:300,fontStyle:"italic",color:"#F0D9B0",marginBottom:8}}>Ready to drift in?</h2>
        <p style={{fontSize:14,color:"#D4A0B8",marginBottom:32,lineHeight:1.7}}>Your universe is waiting.<br/>Free forever. Always intimate. Always yours.</p>
        <button onClick={onJoin} style={{padding:"16px 44px",borderRadius:30,background:"linear-gradient(135deg,#8A5A00,#C48700,#E8A830)",border:"none",color:"#0D0A06",fontSize:17,fontWeight:"600",cursor:"pointer",animation:"pulse 2.5s ease-in-out infinite",display:"block",margin:"0 auto 14px"}}>Create Your Account →</button>
        <div style={{fontSize:13,color:"#D4A0B8",lineHeight:1.8}}>21+ · Free forever · No cameras · No real name required</div>
      </section>
      <footer style={{position:"relative",zIndex:1,borderTop:"1px solid #2A1E0E",padding:"24px",textAlign:"center"}}>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:300,marginBottom:6}}><span className="gold-text">Orbit</span></div>
        <div style={{fontSize:13,color:"#D4A0B8",lineHeight:1.8}}>A private 21+ book community · Find your people. Find your world.<br/>© 2025 Orbit · All rights reserved</div>
      </footer>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════
export default function App(){
  const [screen,setScreen]=useState("landing");
  const [authEmail,setAuthEmail]=useState("");const [authPass,setAuthPass]=useState("");const [authErr,setAuthErr]=useState("");
  const [users,setUsers]=useState(USER_DB_INIT);
  const [mm,setMm]=useState("");const [dd,setDd]=useState("");const [yyyy,setYyyy]=useState("");const [ageErr,setAgeErr]=useState("");
  const [signEmail,setSignEmail]=useState("");const [signPass,setSignPass]=useState("");const [signPass2,setSignPass2]=useState("");const [signErr,setSignErr]=useState("");
  const [pendingEmail,setPendingEmail]=useState("");
  const [obErr,setObErr]=useState("");
  const [obStep,setObStep]=useState(1);const [tUser,setTUser]=useState("");const [tCity,setTCity]=useState("Raleigh");const [tState,setTState]=useState("NC");
  const [tAvatar,setTAvatar]=useState("🦋");const [tSlot,setTSlot]=useState("evening");
  const [tJoined,setTJoined]=useState([]);const [tIdentity,setTIdentity]=useState("she");

  const [profile,setProfile]=useState(null);const [identity,setIdentity]=useState("she");
  const [joined,setJoined]=useState([]);const [timeSlot,setTimeSlot]=useState("evening");
  const [tab,setTab]=useState("home");const [club,setClub]=useState(null);
  const [bookPage,setBookPage]=useState(null);const [profileOpen,setProfileOpen]=useState(false);
  const [roomPicker,setRoomPicker]=useState(null);
  const [msgs,setMsgs]=useState({});const [msg,setMsg]=useState("");const [spoiler,setSpoiler]=useState(false);
  const msgRef=useRef(null);
  const [chatRoom,setChatRoom]=useState("discussion");const chatRoomRef=useRef("discussion");
  const setRoom=(r)=>{setChatRoom(r);chatRoomRef.current=r;};
  const ck=(g,r)=>g+"|"+(r||chatRoomRef.current);
  const [attachOpen,setAttachOpen]=useState(false);
  const [reactionTarget,setReactionTarget]=useState(null); // msgId
  const [noms,setNoms]=useState(isCloud?{}:NOMINATIONS_INIT);const [nomIn,setNomIn]=useState({});
  const [overrides,setOverrides]=useState({});const [pickForm,setPickForm]=useState(null);
  const [bookVote,setBookVote]=useState({});const [survVote,setSurvVote]=useState({});
  const [chapterProg,setChapterProg]=useState({});
  // ── Real room occupancy from the room_attendance table (honest counts, cap 15) ──
  const [rooms,setRooms]=useState(emptyRooms);
  const refreshRooms=async()=>{
    if(!isCloud) return;
    try{
      const {data}=await supabase.from("room_attendance").select("genre_id,time_slot,room_letter,room_type");
      const counts={};
      (data||[]).forEach(a=>{const k=a.genre_id+"|"+a.time_slot+"|"+a.room_type+"|"+a.room_letter;counts[k]=(counts[k]||0)+1;});
      const r={};
      GENRES.forEach(g=>{r[g.id]={};TIME_SLOTS.forEach(ts=>{
        const mk=rt=>["A","B","C"].map(L=>({room:L,current:counts[g.id+"|"+ts.id+"|"+rt+"|"+L]||0,cap:15}));
        r[g.id][ts.id]={women:mk("women"),open:mk("open")};
      });});
      setRooms(r);
    }catch(e){/* keep previous */}
  };
  useEffect(()=>{refreshRooms();},[isCloud]);
  const [notifs,setNotifs]=useState([]);const [notifsOpen,setNotifsOpen]=useState(false);
  const [announcements,setAnnouncements]=useState([]);
  const [dms,setDms]=useState({});const [dmOpen,setDmOpen]=useState(false);const [dmThread,setDmThread]=useState(null);
  const [userCard,setUserCard]=useState(null);
  const [editOpen,setEditOpen]=useState(false);
  const [exploreSection,setExploreSection]=useState("books");
  const endRef=useRef(null);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs,club]);

  // ── Web Push ──────────────────────────────────────────────
  const VAPID_PUBLIC="BK01fsfEXrR6SVw7i-Ou7dnEqmRMX8RaYYEPv8GUU1IrIq4yOgZl4PrO28699taSYRzo-AqjDB17Kc_W-ZvmA48";
  const pushDone=useRef(false);
  const setupPush=async(uid)=>{
    try{
      if(!("serviceWorker" in navigator)||!("PushManager" in window))return;
      const reg=await navigator.serviceWorker.register("/sw.js");
      if(Notification.permission==="default"){try{await Notification.requestPermission();}catch(e){}}
      if(Notification.permission!=="granted")return;
      let sub=await reg.pushManager.getSubscription();
      if(!sub){
        const key=(()=>{const pd="=".repeat((4-VAPID_PUBLIC.length%4)%4);const b=(VAPID_PUBLIC+pd).replace(/-/g,"+").replace(/_/g,"/");const r=atob(b);const o=new Uint8Array(r.length);for(let i=0;i<r.length;i++)o[i]=r.charCodeAt(i);return o;})();
        sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:key});
      }
      const j=sub.toJSON();
      if(j&&j.endpoint){await supabase.from("push_subscriptions").upsert({user_id:uid,endpoint:j.endpoint,p256dh:j.keys.p256dh,auth:j.keys.auth},{onConflict:"endpoint"});}
    }catch(e){/* push is optional */}
  };
  useEffect(()=>{if(isCloud&&profile&&profile.uid&&!pushDone.current){pushDone.current=true;setupPush(profile.uid);}},[profile&&profile.uid]);

  // Restore a saved Supabase session on load (cloud mode only)
  useEffect(()=>{
    if(!isCloud) return;
    let cancelled=false;
    (async()=>{
      try{
        const {data}=await supabase.auth.getSession();
        const session=data&&data.session;
        if(!session||cancelled) return;
        const uid=session.user.id;
        const {data:row}=await supabase.from("users").select("*").eq("id",uid).single();
        if(cancelled) return;
        if(row){
          setProfile({username:row.username,city:row.city,state:row.state,avatar:row.avatar,email:session.user.email,uid,
            is_admin:!!row.is_admin,is_restricted:!!row.is_restricted,
            joinDate:row.join_date?new Date(row.join_date).toLocaleDateString([],{month:"long",year:"numeric"}):"April 2025"});
          setIdentity(row.identity||"she");setTimeSlot(row.time_slot||"evening");
          const {data:mems}=await supabase.from("memberships").select("genre_id").eq("user_id",uid);
          if(!cancelled){setJoined((mems||[]).map(m=>m.genre_id));setScreen("app");}
        }
      }catch(e){/* stay on landing */}
    })();
    return ()=>{cancelled=true;};
  },[]);

  // ── Real club counts (city-level, honest numbers from Supabase) ──
  const [clubCounts,setClubCounts]=useState({nearby:{},total:{}});
  const scopeCity=((profile&&profile.city)||(screen==="onboard"?tCity:"")||"").trim();
  const scopeState=((profile&&profile.state)||(screen==="onboard"?tState:"")||"NC").trim();
  const [nearbyCities,setNearbyCities]=useState([]);
  useEffect(()=>{
    if(!isCloud) return;
    let cancelled=false;
    (async()=>{
      try{
        const [uRes,mRes]=await Promise.all([
          supabase.from("users").select("id, city, state"),
          supabase.from("memberships").select("user_id, genre_id")
        ]);
        if(cancelled) return;
        const myC=cityCoords(scopeCity,scopeState);
        const cityById={};
        (uRes.data||[]).forEach(u=>{cityById[u.id]={city:(u.city||"").trim(),state:(u.state||"").trim()};});
        const nearby={},total={};
        const cityAgg={};
        (mRes.data||[]).forEach(m=>{
          total[m.genre_id]=(total[m.genre_id]||0)+1;
          const mc=cityById[m.user_id];if(!mc||!mc.city)return;
          let inRadius=false,dist=0,label=mc.city;
          if(myC){
            const oc=cityCoords(mc.city,mc.state);
            if(oc){dist=milesBetween(myC,oc);inRadius=dist<=NEARBY_MILES;label=oc[0]+", "+oc[1];}
            else if(normCity(mc.city)===normCity(scopeCity)){inRadius=true;dist=0;}
          }else if(normCity(mc.city)===normCity(scopeCity)){inRadius=true;}
          if(inRadius){
            nearby[m.genre_id]=(nearby[m.genre_id]||0)+1;
            const k=label.toLowerCase();
            if(!cityAgg[k])cityAgg[k]={city:label,dist:Math.round(dist),seen:new Set()};
            cityAgg[k].seen.add(m.user_id);
            if(Math.round(dist)<cityAgg[k].dist)cityAgg[k].dist=Math.round(dist);
          }
        });
        if(!cancelled){
          setClubCounts({nearby,total});
          setNearbyCities(Object.values(cityAgg).map(c=>({city:c.city,dist:c.dist,count:c.seen.size})).sort((a,b)=>a.dist-b.dist));
        }
      }catch(e){/* leave counts empty — honest empty state shows instead */}
    })();
    return ()=>{cancelled=true;};
  },[isCloud,scopeCity,scopeState,joined]);
  const clubLine=(g)=>{
    if(scopeCity){
      const n=clubCounts.nearby[g.id]||0;
      return n>0?`${n} reader${n===1?"":"s"} near you`:`Be the first reader near ${scopeCity} 🪐`;
    }
    const t=clubCounts.total[g.id]||0;
    return t>0?`${t} reader${t===1?"":"s"}`:`Be the first to join 🪐`;
  };
  // Persist Explore join/leave so counts stay real
  const toggleJoin=async(g)=>{
    const isJ=joined.includes(g.id);
    setJoined(p=>isJ?p.filter(x=>x!==g.id):[...p,g.id]);
    if(!isCloud) return;
    try{
      const {data:{user}}=await supabase.auth.getUser();
      if(!user) return;
      if(isJ) await supabase.from("memberships").delete().eq("user_id",user.id).eq("genre_id",g.id);
      else await supabase.from("memberships").insert({user_id:user.id,genre_id:g.id});
    }catch(e){/* local state already updated */}
  };

  // ── Real club chat (messages + reactions from Supabase, live via realtime) ──
  const uidRef=useRef(null);
  useEffect(()=>{uidRef.current=profile&&profile.uid?profile.uid:null;},[profile]);
  const timeAgo=(iso)=>{
    const s=Math.floor((Date.now()-new Date(iso).getTime())/1000);
    if(s<60) return "just now";
    const m=Math.floor(s/60);if(m<60) return m+"m ago";
    const h=Math.floor(m/60);if(h<24) return h+"h ago";
    const d=Math.floor(h/24);if(d<7) return d+"d ago";
    return new Date(iso).toLocaleDateString([],{month:"short",day:"numeric"});
  };
  const notifIcon=(t)=>({meeting:"🕯️",vote_won:"🗳️",badge:"🌓",dm:"💬",nomination:"📚",nominate:"📚",announcement:"📢"}[t]||"🔔");
  const mapMsg=(row,rxnMap)=>{
    const rx={};
    ((rxnMap||{})[row.id]||[]).forEach(r=>{(rx[r.emoji]=rx[r.emoji]||[]).push(r.username);});
    return {id:row.id,user_id:row.user_id,user:row.username,avatar:row.avatar,city:row.city,identity:row.identity,
      isMe:!!(uidRef.current&&row.user_id===uidRef.current),
      time:new Date(row.created_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),
      type:row.type||"text",text:row.content||"",memeId:row.meme_id,imageUrl:row.image_url,caption:row.caption,
      passage:row.passage,chapter:row.chapter,spoiler:!!row.is_spoiler,reactions:rx};
  };
  const loadMsgs=async(genreId,room)=>{
    if(!isCloud||!genreId) return;
    try{
      const rm=room||"open";
      const {data:rows}=await supabase.from("messages").select("*").eq("genre_id",genreId).eq("room_type",rm).order("created_at",{ascending:true}).limit(200);
      const ids=(rows||[]).map(r=>r.id);
      const rxnMap={};
      if(ids.length){
        const {data:rxns}=await supabase.from("reactions").select("message_id,emoji,username").in("message_id",ids);
        (rxns||[]).forEach(r=>{(rxnMap[r.message_id]=rxnMap[r.message_id]||[]).push(r);});
      }
      setMsgs(p=>({...p,[ck(genreId,rm)]:(rows||[]).map(r=>mapMsg(r,rxnMap))}));
    }catch(e){/* keep previous */}
  };
  // Load messages + subscribe live when a club opens
  useEffect(()=>{
    if(!isCloud||!club) return;
    loadMsgs(club,chatRoomRef.current);
    const ch=supabase.channel("chat:"+club)
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"messages",filter:"genre_id=eq."+club},payload=>{
        if((payload.new.room_type||"open")!==chatRoomRef.current) return;
        const m=mapMsg(payload.new,{});
        setMsgs(p=>{const k=ck(club);const list=p[k]||[];if(list.some(x=>x.id===m.id))return p;return {...p,[k]:[...list,m]};});
      })
      .on("postgres_changes",{event:"DELETE",schema:"public",table:"messages",filter:"genre_id=eq."+club},payload=>{
        const delId=payload.old&&payload.old.id;if(!delId)return;
        setMsgs(p=>{const k=ck(club);const list=p[k]||[];if(!list.some(x=>x.id===delId))return p;return {...p,[k]:list.filter(x=>x.id!==delId)};});
      })
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"reactions"},payload=>{
        const r=payload.new;
        setMsgs(p=>{const k=ck(club);const list=p[k]||[];
          if(!list.some(x=>x.id===r.message_id))return p;
          const ml=list.map(x=>{if(x.id!==r.message_id)return x;
            const rx={...x.reactions};const us=[...(rx[r.emoji]||[])];
            if(!us.includes(r.username))us.push(r.username);rx[r.emoji]=us;return {...x,reactions:rx};});
          return {...p,[k]:ml};});
      })
      .on("postgres_changes",{event:"DELETE",schema:"public",table:"reactions"},()=>{loadMsgs(club,chatRoomRef.current);})
      .subscribe();
    return ()=>{supabase.removeChannel(ch);};
  },[isCloud,club,chatRoom]);

  // ── Real notifications + founder announcements ──
  const refreshNotifs=async()=>{
    if(!isCloud) return;
    try{
      const uid=uidRef.current;if(!uid)return;
      const {data:ns}=await supabase.from("notifications").select("*").eq("user_id",uid).order("created_at",{ascending:false}).limit(30);
      setNotifs((ns||[]).map(n=>({id:n.id,type:n.type,title:n.title,body:n.body,read:!!n.is_read,time:timeAgo(n.created_at),icon:notifIcon(n.type)})));
      const {data:as}=await supabase.from("announcements").select("*").eq("is_active",true).order("created_at",{ascending:false}).limit(10);
      setAnnouncements((as||[]).map(a=>({id:a.id,title:a.title,body:a.body,time:timeAgo(a.created_at)})));
    }catch(e){/* keep previous */}
  };
  useEffect(()=>{refreshNotifs();},[isCloud,profile]);
  useEffect(()=>{if(notifsOpen)refreshNotifs();},[notifsOpen]);
  const readNotif=async(id)=>{
    if(isCloud){try{await supabase.from("notifications").update({is_read:true}).eq("id",id);}catch(e){}}
    setNotifs(p=>p.map(n=>n.id===id?{...n,read:true}:n));
  };
  const readAllNotifs=async()=>{
    if(isCloud){try{const uid=uidRef.current;if(uid)await supabase.from("notifications").update({is_read:true}).eq("user_id",uid).eq("is_read",false);}catch(e){}}
    setNotifs(p=>p.map(n=>({...n,read:true})));
  };
  const sendAnnouncement=async(title,body)=>{
    if(!isCloud||!title.trim()||!body.trim())return false;
    try{
      const uid=uidRef.current;if(!uid)return false;
      const {error}=await supabase.from("announcements").insert({admin_id:uid,title:title.trim(),body:body.trim(),target_type:"all"});
      if(error)throw error;
      refreshNotifs();return true;
    }catch(e){return false;}
  };
  const editAnnouncement=async(id,title,body)=>{
    if(!isCloud||!title.trim()||!body.trim())return false;
    try{
      const {error}=await supabase.from("announcements").update({title:title.trim(),body:body.trim()}).eq("id",id);
      if(error)throw error;
      refreshNotifs();return true;
    }catch(e){return false;}
  };
  const deleteAnnouncement=async(id)=>{
    if(!isCloud)return false;
    try{
      const {error}=await supabase.from("announcements").delete().eq("id",id);
      if(error)throw error;
      refreshNotifs();return true;
    }catch(e){return false;}
  };

  const jGenres=GENRES.filter(g=>joined.includes(g.id));
  const aGenre=GENRES.find(g=>g.id===club);
  const bGenre=GENRES.find(g=>g.id===bookPage);
  const curSlot=TIME_SLOTS.find(t=>t.id===timeSlot);
  const unreadNotifs=notifs.filter(n=>!n.read).length;
  const idObj=IDENTITIES.find(i=>i.id===identity);

  const handleLogin=async()=>{
    setAuthErr("");
    if(!isCloud){
      const u=users[authEmail.toLowerCase()];
      if(!u){setAuthErr("No account found.");return;}
      if(u.password!==authPass){setAuthErr("Incorrect password.");return;}
      setProfile({username:u.username,city:u.city,avatar:u.avatar,email:authEmail,joinDate:u.joinDate||"March 2025"});
      setJoined(u.joined||[]);setTimeSlot(u.timeSlot||"evening");
      setChapterProg(u.chapterProgress||{});setIdentity(u.identity||"she");setScreen("app");
      return;
    }
    try{
      const {data,error}=await supabase.auth.signInWithPassword({email:authEmail.toLowerCase(),password:authPass});
      if(error) throw error;
      const uid=data.user.id;
      const {data:row,error:rowErr}=await supabase.from("users").select("*").eq("id",uid).single();
      if(rowErr) throw rowErr;
      setProfile({username:row.username,city:row.city,state:row.state,avatar:row.avatar,email:data.user.email,uid:data.user.id,
        is_admin:!!row.is_admin,is_restricted:!!row.is_restricted,
        joinDate:row.join_date?new Date(row.join_date).toLocaleDateString([],{month:"long",year:"numeric"}):"April 2025"});
      setIdentity(row.identity||"she");setTimeSlot(row.time_slot||"evening");
      const {data:mems}=await supabase.from("memberships").select("genre_id").eq("user_id",uid);
      setJoined((mems||[]).map(m=>m.genre_id));
      setChapterProg({});setScreen("app");
    }catch(e){
      setAuthErr(e.message||"Sign in failed. Please try again.");
    }
  };

  const handleSignupSubmit=async()=>{
    setSignErr("");
    if(!signEmail.includes("@")){setSignErr("Please enter a valid email.");return;}
    if(signPass.length<6){setSignErr("Password must be at least 6 characters.");return;}
    if(signPass!==signPass2){setSignErr("Passwords don't match.");return;}
    if(users[signEmail.toLowerCase()]){setSignErr("Account already exists.");return;}
    if(isCloud){
      try{
        const {data:banned}=await supabase.rpc("is_email_banned",{e:signEmail.toLowerCase()});
        if(banned){setSignErr("This email can't be used to join Orbit.");return;}
      }catch(e){/* fail open — don't block signup if the check fails */}
    }
    setPendingEmail(signEmail.toLowerCase());setScreen("age");
  };

  const checkAge=()=>{
    const y=parseInt(yyyy),m2=parseInt(mm),d=parseInt(dd);
    if(!y||!m2||!d||yyyy.length<4){setAgeErr("Please enter a complete date.");return;}
    const dob=new Date(y,m2-1,d);const now=new Date();
    let age=now.getFullYear()-dob.getFullYear();
    if(now<new Date(now.getFullYear(),dob.getMonth(),dob.getDate())) age--;
    if(age>=21){setObStep(1);setScreen("onboard");}
    else setAgeErr("You must be 21 or older to join Orbit.");
  };

  const finishOnboard=async()=>{
    if(!isCloud){
      const nu={password:signPass,username:tUser||"reader_"+Math.floor(Math.random()*9999),city:tCity,avatar:tAvatar,timeSlot:tSlot||"evening",joined:tJoined,chapterProgress:{},identity:tIdentity,joinDate:"April 2025"};
      setUsers(p=>({...p,[pendingEmail]:nu}));
      setProfile({username:nu.username,city:nu.city,avatar:nu.avatar,email:pendingEmail,joinDate:"April 2025"});
      setJoined(tJoined);setTimeSlot(tSlot||"evening");setIdentity(tIdentity);setScreen("app");
      return;
    }
    setObErr("");
    try{
      const {data,error}=await supabase.auth.signUp({email:pendingEmail,password:signPass});
      if(error) throw error;
      const uid=data.user&&data.user.id;
      if(!uid) throw new Error("Account created — please check your email to confirm, then sign in.");
      const username=tUser||"reader_"+Math.floor(Math.random()*9999);
      const {error:upErr}=await supabase.from("users").upsert(
        {id:uid,username,city:tCity.trim(),state:tState,avatar:tAvatar,identity:tIdentity,time_slot:tSlot||"evening"},
        {onConflict:"id"});
      if(upErr) throw upErr;
      if(tJoined.length){
        const {error:mErr}=await supabase.from("memberships")
          .insert(tJoined.map(g=>({user_id:uid,genre_id:g})));
        if(mErr) throw mErr;
      }
      setProfile({username,city:tCity.trim(),state:tState,avatar:tAvatar,email:pendingEmail,joinDate:"April 2025",uid,is_admin:false});
      setJoined(tJoined);setTimeSlot(tSlot||"evening");setIdentity(tIdentity);setScreen("app");
    }catch(e){
      setObErr(e.message||"Something went wrong creating your account. Please try again.");
    }
  };

  const logout=async()=>{
    if(isCloud){try{await supabase.auth.signOut();}catch(e){}}
    else{setUsers(p=>({...p,[profile.email]:{...p[profile.email],joined,timeSlot,chapterProgress:chapterProg,identity}}));}
    setProfile(null);setJoined([]);setTab("home");setClub(null);setBookPage(null);
    setProfileOpen(false);setDmOpen(false);setDmThread(null);
    setAuthEmail("");setAuthPass("");setAuthErr("");setScreen("landing");
  };

  // ── Chat message senders (real: Supabase messages table) ──
  const makeId=()=>"m"+Date.now()+Math.random().toString(36).slice(2,6);

  const sendCloudMsg=async(fields)=>{
    if(!isCloud||!club) return null;
    try{
      const uid=uidRef.current;if(!uid||!profile) return null;
      if(profile.is_restricted) return null;
      const {data,error}=await supabase.from("messages").insert({
        genre_id:club,room_type:chatRoomRef.current,user_id:uid,username:profile.username,avatar:profile.avatar,city:profile.city||"",
        identity:identity||"skip",type:fields.type,content:fields.content||null,meme_id:fields.memeId||null,
        image_url:fields.imageUrl||null,caption:fields.caption||null,passage:fields.passage||null,
        chapter:fields.chapter||null,is_spoiler:!!fields.spoiler}).select().single();
      if(error) throw error;
      const m=mapMsg(data,{});
      setMsgs(p=>{const k=ck(club);const list=p[k]||[];if(list.some(x=>x.id===m.id))return p;return {...p,[k]:[...list,m]};});
      return m;
    }catch(e){return null;}
  };

  const send=async()=>{
    if(!msg.trim()||!club)return;
    const text=msg.trim();const sp=spoiler;
    setMsg("");setSpoiler(false);if(msgRef.current)msgRef.current.style.height="auto";
    if(isCloud){await sendCloudMsg({type:"text",content:text,spoiler:sp});return;}
    const m2={id:makeId(),user:profile.username,avatar:profile.avatar,isMe:true,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),type:"text",text,city:profile.city,spoiler:sp,identity,reactions:{}};
    setMsgs(p=>{const k=ck(club);return {...p,[k]:[...(p[k]||[]),m2]};});
  };

  const deleteMsg=async(msgId)=>{
    if(!window.confirm("Delete this message?"))return;
    const k=ck(club);
    setMsgs(prev=>({...prev,[k]:(prev[k]||[]).filter(m=>m.id!==msgId)}));
    if(isCloud){try{await supabase.from("messages").delete().eq("id",msgId);}catch(e){}}
  };

  const sendMeme=async(memeId)=>{
    setAttachOpen(false);
    if(isCloud){await sendCloudMsg({type:"meme",memeId});return;}
    const m2={id:makeId(),user:profile.username,avatar:profile.avatar,isMe:true,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),type:"meme",memeId,city:profile.city,spoiler:false,identity,reactions:{}};
    setMsgs(p=>{const k=ck(club);return {...p,[k]:[...(p[k]||[]),m2]};});
  };

  const sendImage=async(imageUrl,caption)=>{
    setAttachOpen(false);
    if(isCloud){await sendCloudMsg({type:"image",imageUrl,caption});return;}
    const m2={id:makeId(),user:profile.username,avatar:profile.avatar,isMe:true,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),type:"image",imageUrl,caption,city:profile.city,spoiler:false,identity,reactions:{}};
    setMsgs(p=>{const k=ck(club);return {...p,[k]:[...(p[k]||[]),m2]};});
  };

  const sendPassage=async(passage,chapter)=>{
    setAttachOpen(false);
    if(isCloud){await sendCloudMsg({type:"passage",passage,chapter});return;}
    const m2={id:makeId(),user:profile.username,avatar:profile.avatar,isMe:true,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),type:"passage",passage,chapter,city:profile.city,spoiler:false,identity,reactions:{}};
    setMsgs(p=>{const k=ck(club);return {...p,[k]:[...(p[k]||[]),m2]};});
  };

  const addReaction=async(msgId,emoji)=>{
    if(isCloud){
      try{
        const uid=uidRef.current;if(!uid||!profile) return;
        const list=msgs[ck(club)]||[];const m=list.find(x=>x.id===msgId);
        const mine=m&&((m.reactions||{})[emoji]||[]).includes(profile.username);
        // optimistic local update
        setMsgs(p=>{const k=ck(club);const l=p[k]||[];const ix=l.findIndex(x=>x.id===msgId);if(ix<0)return p;
          const ml=l.map((x,i)=>{if(i!==ix)return x;const rx={...(x.reactions||{})};const us=[...((x.reactions||{})[emoji]||[])];
            if(mine){const nu=us.filter(u=>u!==profile.username);if(nu.length)rx[emoji]=nu;else delete rx[emoji];}
            else{if(!us.includes(profile.username))us.push(profile.username);rx[emoji]=us;}
            return {...x,reactions:rx};});
          return {...p,[k]:ml};});
        if(mine) await supabase.from("reactions").delete().eq("message_id",msgId).eq("user_id",uid).eq("emoji",emoji);
        else await supabase.from("reactions").insert({message_id:msgId,user_id:uid,username:profile.username,emoji});
      }catch(e){/* realtime will converge */}
      setReactionTarget(null);return;
    }
    setMsgs(p=>{
      const k2=ck(club);const list=[...(p[k2]||[])];
      const idx=list.findIndex(m=>m.id===msgId);
      if(idx<0) return p;
      const m={...list[idx]};
      const reactions={...m.reactions};
      const users=[...(reactions[emoji]||[])];
      const me=profile.username;
      if(users.includes(me)){reactions[emoji]=users.filter(u=>u!==me);if(reactions[emoji].length===0)delete reactions[emoji];}
      else{reactions[emoji]=[...users,me];}
      list[idx]={...m,reactions};
      return {...p,[k2]:list};
    });
    setReactionTarget(null);
  };

  // ── Real Next Pick: nominations + votes + survey from Supabase ──
  const MONTH_YR=()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");};
  const loadPicks=async()=>{
    if(!isCloud) return;
    try{
      const my=MONTH_YR();
      const {data:rows}=await supabase.from("nominations").select("genre_id,title,vote_count").eq("month_year",my).order("vote_count",{ascending:false});
      const grouped={};
      (rows||[]).forEach(r=>{(grouped[r.genre_id]=grouped[r.genre_id]||[]).push({title:r.title,count:r.vote_count});});
      setNoms(grouped);
      const uid=uidRef.current;
      if(uid){
        const {data:v}=await supabase.from("book_votes").select("genre_id,title").eq("user_id",uid).eq("month_year",my);
        const bv={};(v||[]).forEach(x=>{bv[x.genre_id]=x.title;});setBookVote(bv);
        const {data:sv}=await supabase.from("survey_votes").select("genre_id,answer").eq("user_id",uid).eq("month_year",my);
        const s2={};(sv||[]).forEach(x=>{s2[x.genre_id]=x.answer;});setSurvVote(s2);
      }
      const {data:ov}=await supabase.from("pick_overrides").select("genre_id,title,author").eq("month_year",my);
      const o2={};(ov||[]).forEach(x=>{o2[x.genre_id]={title:x.title,author:x.author};});setOverrides(o2);
    }catch(e){/* keep prior */}
  };
  useEffect(()=>{loadPicks();},[isCloud,profile]);
  useEffect(()=>{
    if(!isCloud) return;
    const ch=supabase.channel("picks-live")
      .on("postgres_changes",{event:"*",schema:"public",table:"nominations"},()=>loadPicks())
      .on("postgres_changes",{event:"*",schema:"public",table:"pick_overrides"},()=>loadPicks())
      .subscribe();
    return ()=>{supabase.removeChannel(ch);};
  },[isCloud]);
  const nominate=async(gid)=>{
    const t=(nomIn[gid]||"").trim();if(!t)return;
    setNomIn(p=>({...p,[gid]:""}));
    if(!isCloud){
      setNoms(p=>{const list=[...(p[gid]||[])];const ex=list.findIndex(n=>n.title.toLowerCase()===t.toLowerCase());
        if(ex>=0)list[ex]={...list[ex],count:list[ex].count+1};else list.push({title:t,count:1});
        list.sort((a,b)=>b.count-a.count);return {...p,[gid]:list};});
      return;
    }
    try{
      const uid=uidRef.current;if(!uid||!profile)return;
      const my=MONTH_YR();
      const {data:ex}=await supabase.from("nominations").select("id,vote_count").eq("genre_id",gid).eq("month_year",my).ilike("title",t).limit(1).maybeSingle();
      if(ex) await supabase.from("nominations").update({vote_count:ex.vote_count+1}).eq("id",ex.id);
      else await supabase.from("nominations").insert({genre_id:gid,title:t,nominated_by:uid,month_year:my});
      loadPicks();
    }catch(e){loadPicks();}
  };
  const voteBook=async(gid,title)=>{
    setBookVote(p=>({...p,[gid]:title}));
    if(!isCloud) return;
    try{
      const uid=uidRef.current;if(!uid)return;
      await supabase.from("book_votes").upsert({genre_id:gid,user_id:uid,title,month_year:MONTH_YR()},{onConflict:"genre_id,user_id,month_year"});
    }catch(e){/* optimistic vote stands */}
  };
  const castSurvey=async(gid,opt)=>{
    setSurvVote(p=>({...p,[gid]:opt}));
    if(!isCloud) return;
    try{
      const uid=uidRef.current;if(!uid)return;
      await supabase.from("survey_votes").upsert({genre_id:gid,user_id:uid,answer:opt,month_year:MONTH_YR()},{onConflict:"genre_id,user_id,month_year"});
    }catch(e){/* optimistic answer stands */}
  };

  // ── Current read: founder override → this month's top-voted → built-in default ──
  const pickFor=(g)=>{
    const ov=overrides[g.id];
    if(ov&&ov.title) return {title:ov.title,author:ov.author||null};
    const top=(noms[g.id]||[])[0];
    if(top) return {title:top.title,author:null};
    return {title:g.currentBook,author:g.author};
  };
  const pickTitle=(g)=>pickFor(g).title;
  const pickAuthor=(g)=>pickFor(g).author;
  const isAdmin=!!(profile&&profile.is_admin);
  const savePick=async()=>{
    if(!pickForm)return;
    const t=(pickForm.title||"").trim();if(!t)return;
    const a=(pickForm.author||"").trim()||null;
    if(!isCloud){setOverrides(p=>({...p,[pickForm.gid]:{title:t,author:a}}));setPickForm(null);return;}
    try{
      const uid=uidRef.current;if(!uid)return;
      await supabase.from("pick_overrides").upsert({genre_id:pickForm.gid,month_year:MONTH_YR(),title:t,author:a,set_by:uid},{onConflict:"genre_id,month_year"});
    }catch(e){}
    setPickForm(null);loadPicks();
  };
  const clearPick=async(gid)=>{
    if(!isCloud){setOverrides(p=>{const n={...p};delete n[gid];return n;});return;}
    try{await supabase.from("pick_overrides").delete().eq("genre_id",gid).eq("month_year",MONTH_YR());}catch(e){}
    loadPicks();
  };

  // ── Safety: blocks + reports ──
  const [myBlocks,setMyBlocks]=useState([]);
  const [blockedBy,setBlockedBy]=useState([]);
  const [reportTarget,setReportTarget]=useState(null);
  const loadBlocks=async()=>{
    if(!isCloud)return;
    try{
      const uid=uidRef.current;if(!uid)return;
      const {data}=await supabase.from("blocks").select("blocker_id,blocked_id").or("blocker_id.eq."+uid+",blocked_id.eq."+uid);
      const mine=[],by=[];
      (data||[]).forEach(b=>{if(b.blocker_id===uid)mine.push(b.blocked_id);else by.push(b.blocker_id);});
      setMyBlocks(mine);setBlockedBy(by);
    }catch(e){}
  };
  useEffect(()=>{loadBlocks();},[isCloud,profile]);
  useEffect(()=>{
    if(!isCloud)return;
    const ch=supabase.channel("blocks-live")
      .on("postgres_changes",{event:"*",schema:"public",table:"blocks"},()=>loadBlocks())
      .subscribe();
    return ()=>{supabase.removeChannel(ch);};
  },[isCloud]);
  const blockUser=async(userId)=>{
    if(!userId||!isCloud)return;
    try{await supabase.from("blocks").insert({blocker_id:uidRef.current,blocked_id:userId});}catch(e){}
    loadBlocks();
  };
  const unblockUser=async(userId)=>{
    if(!userId||!isCloud)return;
    try{await supabase.from("blocks").delete().eq("blocker_id",uidRef.current).eq("blocked_id",userId);}catch(e){}
    loadBlocks();
  };
  const submitReport=async(reason)=>{
    if(!reportTarget)return;
    if(!isCloud){setReportTarget(null);return;}
    try{
      await supabase.from("reports").insert({reporter_id:uidRef.current,reported_user_id:reportTarget.userId,reason:reason,status:"open"});
    }catch(e){}
    setReportTarget(null);
  };

  const joinRoom=async(genreId,roomLetter,roomType)=>{
    if(isCloud){
      try{
        const {data:{user}}=await supabase.auth.getUser();
        if(user){
          await supabase.from("room_attendance").upsert(
            {genre_id:genreId,time_slot:timeSlot,room_letter:roomLetter,room_type:roomType,user_id:user.id},
            {onConflict:"genre_id,time_slot,user_id"});
        }
      }catch(e){/* local state still updates below */}
    }
    setRooms(p=>{
      const updated={...p};const slotData=updated[genreId]?.[timeSlot]||{women:[],open:[]};
      const list=[...(slotData[roomType]||[])];const ri=list.findIndex(r=>r.room===roomLetter);
      if(ri>=0)list[ri]={...list[ri],current:Math.min(list[ri].current+1,list[ri].cap)};
      updated[genreId]={...updated[genreId],[timeSlot]:{...slotData,[roomType]:list}};return updated;
    });
    setRoomPicker(null);setRoom(roomType);setClub(genreId);setTab("home");
    refreshRooms();
  };

  // ── Real DMs (direct_messages table, live via realtime) ──
  const loadDMs=async()=>{
    if(!isCloud)return;
    try{
      const uid=uidRef.current;if(!uid||!profile)return;
      const {data:rows}=await supabase.from("direct_messages").select("*")
        .or("sender_id.eq."+uid+",receiver_id.eq."+uid).order("created_at",{ascending:true}).limit(200);
      const otherIds=[...new Set((rows||[]).map(r=>r.sender_id===uid?r.receiver_id:r.sender_id))];
      const uMap={};
      if(otherIds.length){
        const {data:us}=await supabase.from("users").select("id,username,avatar,city").in("id",otherIds);
        (us||[]).forEach(u=>{uMap[u.id]=u;});
      }
      const threads={};
      (rows||[]).forEach(r=>{
        const oid=r.sender_id===uid?r.receiver_id:r.sender_id;
        const oname=r.sender_id===uid?r.receiver_name:r.sender_name;
        const ou=uMap[oid]||{};
        if(!threads[oname])threads[oname]={user_id:oid,avatar:ou.avatar||"👤",city:ou.city||"",messages:[]};
        threads[oname].messages.push({id:r.id,text:r.content,time:new Date(r.created_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),isMe:r.sender_id===uid});
      });
      setDms(threads);
    }catch(e){/* keep previous */}
  };
  useEffect(()=>{loadDMs();},[isCloud,profile]);
  useEffect(()=>{
    if(!isCloud)return;
    const ch=supabase.channel("dms-live")
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"direct_messages"},payload=>{
        const r=payload.new;const me=uidRef.current;if(!me)return;
        if(r.sender_id!==me&&r.receiver_id!==me)return;
        const oname=r.sender_id===me?r.receiver_name:r.sender_name;
        let rebuild=false;
        setDms(p=>{
          const th=p[oname];
          if(!th){rebuild=true;return p;}
          if(th.messages.some(m=>m.id===r.id))return p;
          return {...p,[oname]:{...th,messages:[...th.messages,{id:r.id,text:r.content,time:"just now",isMe:r.sender_id===me}]}};
        });
        if(rebuild)loadDMs();
      }).subscribe();
    return ()=>{supabase.removeChannel(ch);};
  },[isCloud]);
  const openDM=async(username)=>{
    if(!username)return;
    setDmThread(username);setDmOpen(true);setUserCard(null);
    try{
      if(!isCloud){setDms(p=>p[username]?p:{...p,[username]:{user_id:null,avatar:"👤",city:"Local",messages:[]}});return;}
      const {data:u}=await supabase.from("users").select("id,username,avatar,city").eq("username",username).single();
      setDms(p=>p[username]?p:{...p,[username]:{user_id:u?u.id:null,avatar:u?u.avatar:"👤",city:u?u.city:"",messages:[]}});
    }catch(e){setDms(p=>p[username]?p:{...p,[username]:{user_id:null,avatar:"👤",city:"",messages:[]}});}
  };
  const sendDM=async(toUser,text)=>{
    if(!text.trim())return;
    if(isCloud){
      try{
        const uid=uidRef.current;if(!uid||!profile)return;
        if(profile.is_restricted)return;
        const th=dms[toUser];if(!th||!th.user_id)return;
        if(myBlocks.includes(th.user_id)||blockedBy.includes(th.user_id))return;
        const {data,error}=await supabase.from("direct_messages").insert({
          sender_id:uid,receiver_id:th.user_id,sender_name:profile.username,receiver_name:toUser,content:text.trim()}).select().single();
        if(error)throw error;
        const m={id:data.id,text:data.content,time:"just now",isMe:true};
        setDms(p=>{const t=p[toUser];if(!t||t.messages.some(x=>x.id===m.id))return p;
          return {...p,[toUser]:{...t,messages:[...t.messages,m]}};});
      }catch(e){/* realtime will converge */}
      return;
    }
    setDms(p=>({...p,[toUser]:{...(p[toUser]||{avatar:"👤",city:"Local",messages:[]}),messages:[...(p[toUser]?.messages||[]),{from:"you",text,time:"just now",isMe:true,type:"text"}]}}));
  };

  const bgStyle={background:"#0D0A06",minHeight:"100vh",fontFamily:"'Crimson Text',Georgia,serif",color:"#EDE0CE",position:"relative"};
  const cosmicBg=<><Stars count={55}/><CosmicBackground/><div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,background:"radial-gradient(ellipse at 50% 0%,#C4870010 0%,transparent 60%)"}}/></>;

  if(screen==="landing") return <><style>{css}</style><LandingPage onJoin={()=>setScreen("signup")} onSignIn={()=>setScreen("login")} clubLine={clubLine} pickTitle={pickTitle}/></>;

  if(screen==="login") return(
    <>
      <style>{css}</style>
      <div style={{...bgStyle,display:"flex",alignItems:"center",justifyContent:"center",padding:24,overflow:"hidden"}}>
        {cosmicBg}
        <div className="fade-up" style={{position:"relative",zIndex:1,width:"100%",maxWidth:370}}>
          <button onClick={()=>setScreen("landing")} style={{background:"none",border:"none",color:"#E8B4CC",fontSize:22,cursor:"pointer",marginBottom:20,padding:0}}>‹</button>
          <div style={{fontSize:13,letterSpacing:5,color:"#E8B4CC",textTransform:"uppercase",marginBottom:8}}>Welcome back</div>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:34,fontWeight:300,marginBottom:24}}><span className="gold-text">Sign In to Orbit</span></h2>
          <Field label="Email" type="email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} placeholder="your@email.com"/>
          <Field label="Password" type="password" value={authPass} onChange={e=>setAuthPass(e.target.value)} placeholder="••••••••"/>
          {authErr&&<div style={{fontSize:14,color:"#D06060",marginBottom:12,background:"#2A1010",border:"1px solid #5A2020",borderRadius:8,padding:"8px 12px"}}>{authErr}</div>}
          <button onClick={handleLogin} style={{width:"100%",padding:"13px",borderRadius:30,background:"linear-gradient(135deg,#8A5A00,#C48700)",border:"none",color:"#0D0A06",fontSize:16,fontWeight:"600",cursor:"pointer",marginBottom:14}}>Enter Orbit →</button>
          <div style={{textAlign:"center",fontSize:13,color:"#D4A0B8"}}>New here? <span onClick={()=>setScreen("signup")} style={{color:"#C4A060",cursor:"pointer",textDecoration:"underline"}}>Create an account</span></div>
          {!isCloud&&<div style={{fontSize:13,color:"#D4A0B8",textAlign:"center",marginTop:16,fontStyle:"italic"}}>Demo: demo@orbit.app / orbit21</div>}
        </div>
      </div>
    </>
  );

  if(screen==="signup") return(
    <>
      <style>{css}</style>
      <div style={{...bgStyle,display:"flex",alignItems:"center",justifyContent:"center",padding:24,overflow:"hidden"}}>
        {cosmicBg}
        <div className="fade-up" style={{position:"relative",zIndex:1,width:"100%",maxWidth:370}}>
          <button onClick={()=>setScreen("landing")} style={{background:"none",border:"none",color:"#E8B4CC",fontSize:22,cursor:"pointer",marginBottom:20,padding:0}}>‹</button>
          <div style={{fontSize:13,letterSpacing:5,color:"#E8B4CC",textTransform:"uppercase",marginBottom:8}}>Join the community</div>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:34,fontWeight:300,marginBottom:8}}><span className="gold-text">Create Account</span></h2>
          <p style={{fontSize:13,color:"#D4A0B8",fontStyle:"italic",marginBottom:24,lineHeight:1.6}}>Age verification on the next step.</p>
          <Field label="Email" type="email" value={signEmail} onChange={e=>setSignEmail(e.target.value)} placeholder="your@email.com"/>
          <Field label="Password" type="password" value={signPass} onChange={e=>setSignPass(e.target.value)} placeholder="At least 6 characters"/>
          <Field label="Confirm Password" type="password" value={signPass2} onChange={e=>setSignPass2(e.target.value)} placeholder="Repeat password"/>
          {signErr&&<div style={{fontSize:14,color:"#D06060",marginBottom:12,background:"#2A1010",border:"1px solid #5A2020",borderRadius:8,padding:"8px 12px"}}>{signErr}</div>}
          <button onClick={handleSignupSubmit} style={{width:"100%",padding:"13px",borderRadius:30,background:"linear-gradient(135deg,#8A5A00,#C48700)",border:"none",color:"#0D0A06",fontSize:16,fontWeight:"600",cursor:"pointer",marginBottom:14}}>Continue →</button>
          <div style={{textAlign:"center",fontSize:13,color:"#D4A0B8"}}>Already a member? <span onClick={()=>setScreen("login")} style={{color:"#C4A060",cursor:"pointer",textDecoration:"underline"}}>Sign in</span></div>
        </div>
      </div>
    </>
  );

  if(screen==="age") return(
    <>
      <style>{css}</style>
      <div style={{...bgStyle,display:"flex",alignItems:"center",justifyContent:"center",padding:24,textAlign:"center",overflow:"hidden"}}>
        {cosmicBg}
        <div className="fade-up" style={{position:"relative",zIndex:1,width:"100%",maxWidth:370}}>
          <div className="flicker" style={{fontSize:46,marginBottom:16}}>🪐</div>
          <div style={{fontSize:13,letterSpacing:5,color:"#E8B4CC",textTransform:"uppercase",marginBottom:10}}>Age Verification</div>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:32,fontWeight:300,marginBottom:8}}><span className="gold-text">21+ Only</span></h2>
          <p style={{fontSize:13,color:"#D4A0B8",fontStyle:"italic",marginBottom:26,lineHeight:1.7}}>Orbit is a private adult community.<br/>Please confirm your date of birth.</p>
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            {[{ph:"MM",v:mm,s:setMm,mx:2,ac:"bday-month"},{ph:"DD",v:dd,s:setDd,mx:2,ac:"bday-day"},{ph:"YYYY",v:yyyy,s:setYyyy,mx:4,ac:"bday-year"}].map((f,i)=>(
              <input key={i} placeholder={f.ph} value={f.v} maxLength={f.mx} inputMode="numeric" autoComplete={f.ac} onChange={e=>{if(/^\d*$/.test(e.target.value))f.s(e.target.value);}}
                style={{flex:f.ph==="YYYY"?2:1,minWidth:0,background:"#1A1208",border:"1px solid #3A2A14",borderRadius:8,padding:"12px 6px",color:"#EDE0CE",fontSize:17,textAlign:"center"}}/>
            ))}
          </div>
          {ageErr&&<div style={{fontSize:14,color:"#D06060",marginBottom:14,background:"#2A1010",border:"1px solid #5A2020",borderRadius:8,padding:"8px 12px"}}>{ageErr}</div>}
          <button onClick={checkAge} style={{width:"100%",padding:"13px",borderRadius:30,background:"linear-gradient(135deg,#8A5A00,#C48700)",border:"none",color:"#0D0A06",fontSize:16,fontWeight:"600",cursor:"pointer"}}>Confirm Age →</button>
          <div style={{fontSize:13,color:"#D4A0B8",marginTop:14,lineHeight:1.8}}>By continuing you confirm you are 21+.</div>
        </div>
      </div>
    </>
  );

  if(screen==="onboard") return(
    <>
      <style>{css}</style>
      <div style={{...bgStyle,display:"flex",alignItems:"center",justifyContent:"center",padding:20,overflow:"hidden"}}>
        {cosmicBg}
        <div style={{position:"relative",zIndex:1,width:"100%",maxWidth:400}}>
          <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:26}}>
            {[1,2,3,4].map(i=><div key={i} style={{width:i===obStep?22:8,height:8,borderRadius:4,background:i<=obStep?"#C48700":"#3A2A14",transition:"all 0.3s"}}/>)}
          </div>

          {obStep===1&&(
            <div className="fade-up">
              <div style={{fontSize:13,letterSpacing:4,color:"#E8B4CC",textTransform:"uppercase",marginBottom:8,textAlign:"center"}}>Step 1 of 4</div>
              <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:300,color:"#F0D9B0",textAlign:"center",fontStyle:"italic",marginBottom:6}}>Who are you, reader?</h2>
              <p style={{fontSize:13,color:"#D4A0B8",textAlign:"center",marginBottom:20,lineHeight:1.6}}>No real names needed.</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginBottom:18}}>
                {AVATARS.map(a=><button key={a} onClick={()=>setTAvatar(a)} style={{width:44,height:44,borderRadius:"50%",fontSize:20,background:tAvatar===a?"#C4870022":"#1A1208",border:`2px solid ${tAvatar===a?"#C48700":"#3A2A14"}`,cursor:"pointer",transition:"all 0.2s"}}>{a}</button>)}
              </div>
              <Field label="Reader Name" value={tUser} onChange={e=>setTUser(e.target.value)} placeholder="e.g. moonreader_k"/>
              <div style={{marginBottom:20}}>
                <div style={{fontSize:13,letterSpacing:3,color:"#E8B4CC",textTransform:"uppercase",marginBottom:6}}>Your City</div>
                <div style={{display:"flex",gap:8}}>
                  <input value={tCity} onChange={e=>setTCity(e.target.value)} list="orbit-cities" placeholder="City" style={{flex:1,minWidth:0,background:"#1A1208",border:"1px solid #3A2A14",borderRadius:10,padding:"12px 16px",color:"#EDE0CE",fontSize:15}}/>
                  <datalist id="orbit-cities">{CITY_NAMES.map(n=><option key={n} value={n}/>)}</datalist>
                  <select value={tState} onChange={e=>setTState(e.target.value)} style={{width:88,flexShrink:0,background:"#1A1208",border:"1px solid #3A2A14",borderRadius:10,padding:"12px 8px",color:"#EDE0CE",fontSize:15}}>
                    {US_STATES.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div style={{fontSize:13,color:"#C490A8",fontStyle:"italic",marginTop:6}}>City-level only — never your exact location.</div>
              </div>
              <button onClick={()=>{if(!tCity.trim()){setObErr("Please enter your city.");return;}setObErr("");setObStep(2);}} style={{width:"100%",padding:13,borderRadius:30,background:"linear-gradient(135deg,#8A5A00,#C48700)",border:"none",color:"#0D0A06",fontSize:16,fontWeight:"600",cursor:"pointer"}}>Next →</button>
              {obStep===1&&obErr&&<div style={{fontSize:14,color:"#D06060",marginTop:12,background:"#2A1010",border:"1px solid #5A2020",borderRadius:8,padding:"8px 12px",textAlign:"center"}}>{obErr}</div>}
            </div>
          )}

          {obStep===2&&(
            <div className="fade-up">
              <div style={{fontSize:13,letterSpacing:4,color:"#E8B4CC",textTransform:"uppercase",marginBottom:8,textAlign:"center"}}>Step 2 of 4</div>
              <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:300,color:"#F0D9B0",textAlign:"center",fontStyle:"italic",marginBottom:6}}>How do you identify?</h2>
              <p style={{fontSize:14,color:"#D4A0B8",textAlign:"center",marginBottom:6,lineHeight:1.6}}>Adds a colored star next to your name. Optional.</p>
              <p style={{fontSize:13,color:"#C490A8",textAlign:"center",fontStyle:"italic",marginBottom:18,lineHeight:1.6}}>She/Her readers unlock Women's Rooms in select clubs.</p>
              {IDENTITIES.map(id=>(
                <div key={id.id} onClick={()=>setTIdentity(id.id)} style={{background:tIdentity===id.id?"#231A0A":"#1A1208",border:`2px solid ${tIdentity===id.id?id.color:"#C490A8"}`,borderRadius:12,padding:"12px 16px",marginBottom:10,cursor:"pointer",display:"flex",alignItems:"center",gap:12,transition:"all 0.2s"}}>
                  <span style={{fontSize:24,animation:tIdentity===id.id?"starPulse 2s ease-in-out infinite":"none"}}>{id.star}</span>
                  <div style={{flex:1}}><div style={{fontWeight:"600",color:"#F0D9B0",fontSize:14}}>{id.label}</div><div style={{fontSize:13,color:tIdentity===id.id?id.color:"#D4A0B8",marginTop:2}}>{id.desc}</div></div>
                  {tIdentity===id.id&&<div style={{color:id.color,fontSize:16}}>✓</div>}
                </div>
              ))}
              <div style={{display:"flex",gap:10,marginTop:6}}>
                <button onClick={()=>setObStep(1)} style={{flex:1,padding:13,borderRadius:30,background:"transparent",border:"1px solid #3A2A14",color:"#E8B4CC",fontSize:14,cursor:"pointer"}}>← Back</button>
                <button onClick={()=>setObStep(3)} style={{flex:2,padding:13,borderRadius:30,background:"linear-gradient(135deg,#8A5A00,#C48700)",border:"none",color:"#0D0A06",fontSize:16,fontWeight:"600",cursor:"pointer"}}>Next →</button>
              </div>
            </div>
          )}

          {obStep===3&&(
            <div className="fade-up">
              <div style={{fontSize:13,letterSpacing:4,color:"#E8B4CC",textTransform:"uppercase",marginBottom:8,textAlign:"center"}}>Step 3 of 4</div>
              <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:300,color:"#F0D9B0",textAlign:"center",fontStyle:"italic",marginBottom:6}}>When do you read?</h2>
              {TIME_SLOTS.map(ts=>(
                <div key={ts.id} onClick={()=>setTSlot(ts.id)} style={{background:tSlot===ts.id?"#231A0A":"#1A1208",border:`2px solid ${tSlot===ts.id?"#C48700":"#3A2A14"}`,borderRadius:14,padding:"14px 16px",marginBottom:12,cursor:"pointer",display:"flex",alignItems:"center",gap:14,transition:"all 0.2s"}}>
                  <div style={{fontSize:26}}>{ts.icon}</div>
                  <div style={{flex:1}}><div style={{fontWeight:"600",color:"#F0D9B0",fontSize:15}}>{ts.label}</div><div style={{fontSize:13,color:"#C4A060"}}>{ts.range}</div></div>
                  {tSlot===ts.id&&<div style={{color:"#C48700",fontSize:18}}>✓</div>}
                </div>
              ))}
              <div style={{display:"flex",gap:10,marginTop:6}}>
                <button onClick={()=>setObStep(2)} style={{flex:1,padding:13,borderRadius:30,background:"transparent",border:"1px solid #3A2A14",color:"#E8B4CC",fontSize:14,cursor:"pointer"}}>← Back</button>
                <button onClick={()=>setObStep(4)} style={{flex:2,padding:13,borderRadius:30,background:"linear-gradient(135deg,#8A5A00,#C48700)",border:"none",color:"#0D0A06",fontSize:16,fontWeight:"600",cursor:"pointer"}}>Next →</button>
              </div>
            </div>
          )}

          {obStep===4&&(
            <div className="fade-up">
              <div style={{fontSize:13,letterSpacing:4,color:"#E8B4CC",textTransform:"uppercase",marginBottom:8,textAlign:"center"}}>Step 4 of 4</div>
              <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:300,color:"#F0D9B0",textAlign:"center",fontStyle:"italic",marginBottom:6}}>Pick your clubs</h2>
              <p style={{fontSize:14,color:"#D4A0B8",textAlign:"center",marginBottom:14,lineHeight:1.6}}>Join as many as you like.</p>
              <div style={{fontSize:13,letterSpacing:2,color:"#E8B4CC",textTransform:"uppercase",marginBottom:8}}>📚 Books</div>
              {GENRES.filter(g=>!g.manga).map(g=>{const sel=tJoined.includes(g.id);return(
                <div key={g.id} onClick={()=>setTJoined(p=>sel?p.filter(x=>x!==g.id):[...p,g.id])} style={{background:sel?"#231A0A":"#1A1208",border:`2px solid ${sel?g.color:"#C490A8"}`,borderRadius:12,padding:"10px 14px",marginBottom:8,cursor:"pointer",display:"flex",alignItems:"center",gap:10,transition:"all 0.2s"}}>
                  <span style={{fontSize:20}}>{g.icon}</span>
                  <div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontWeight:"600",color:"#F0D9B0",fontSize:13}}>{g.label}</span>{g.mature&&<span style={{fontSize:13,color:"#C2476A",background:"#C2476A18",border:"1px solid #C2476A33",borderRadius:20,padding:"1px 5px"}}>MATURE</span>}</div><div style={{fontSize:13,color:"#E8B4CC"}}>{clubLine(g)}</div></div>
                  {sel&&<div style={{color:g.color,fontSize:14}}>✓</div>}
                </div>
              );})}
              <div style={{fontSize:13,letterSpacing:2,color:"#D4608A",textTransform:"uppercase",marginBottom:8,marginTop:12}}>🎌 Manga / Anime</div>
              {GENRES.filter(g=>g.manga).map(g=>{const sel=tJoined.includes(g.id);return(
                <div key={g.id} onClick={()=>setTJoined(p=>sel?p.filter(x=>x!==g.id):[...p,g.id])} style={{background:sel?"#231A0A":"#1A1208",border:`2px solid ${sel?g.color:"#C490A8"}`,borderRadius:12,padding:"10px 14px",marginBottom:8,cursor:"pointer",display:"flex",alignItems:"center",gap:10,transition:"all 0.2s"}}>
                  <span style={{fontSize:20}}>{g.icon}</span>
                  <div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontWeight:"600",color:"#F0D9B0",fontSize:13}}>{g.label}</span>{g.mature&&<span style={{fontSize:13,color:"#C2476A",background:"#C2476A18",border:"1px solid #C2476A33",borderRadius:20,padding:"1px 5px"}}>MATURE</span>}</div><div style={{fontSize:13,color:"#E8B4CC"}}>{clubLine(g)}</div></div>
                  {sel&&<div style={{color:g.color,fontSize:14}}>✓</div>}
                </div>
              );})}
              <div style={{display:"flex",gap:10,marginTop:12}}>
                <button onClick={()=>setObStep(3)} style={{flex:1,padding:13,borderRadius:30,background:"transparent",border:"1px solid #3A2A14",color:"#E8B4CC",fontSize:14,cursor:"pointer"}}>← Back</button>
                <button onClick={finishOnboard} style={{flex:2,padding:13,borderRadius:30,background:"linear-gradient(135deg,#C2476A,#C48700)",border:"none",color:"white",fontSize:15,fontWeight:"600",cursor:"pointer"}}>Enter Orbit 🪐</button>
              </div>
              {obErr&&<div style={{fontSize:14,color:"#D06060",marginTop:12,background:"#2A1010",border:"1px solid #5A2020",borderRadius:8,padding:"8px 12px",textAlign:"center"}}>{obErr}</div>}
            </div>
          )}
        </div>
      </div>
    </>
  );

  // ── OVERLAYS ──
  if(profileOpen) return(<><style>{css}</style><div style={{...bgStyle,maxWidth:430,margin:"0 auto",overflowY:"auto",overflow:"hidden"}}>{cosmicBg}<div style={{position:"relative",zIndex:1}}><ProfilePage profile={profile} joined={joined} chapterProg={chapterProg} identity={identity} onBack={()=>setProfileOpen(false)} onLogout={logout} onEdit={()=>setEditOpen(true)} pickTitle={pickTitle}/></div>{editOpen&&<EditProfile profile={profile} onSave={(p)=>setProfile(prev=>({...prev,...p}))} onClose={()=>setEditOpen(false)}/>}</div></>);
  if(bookPage&&bGenre) return(<><style>{css}</style><div style={{...bgStyle,maxWidth:430,margin:"0 auto",overflowY:"auto",overflow:"hidden"}}>{cosmicBg}<div style={{position:"relative",zIndex:1}}><BookPage genre={bGenre} pick={pickFor(bGenre)} myChapter={chapterProg[bookPage]||0} onUpdateChapter={(ch)=>setChapterProg(p=>({...p,[bookPage]:ch}))} onBack={()=>setBookPage(null)}/></div></div></>);
  if(dmOpen) return(
    <>
      <style>{css}</style>
      <div style={{...bgStyle,maxWidth:430,margin:"0 auto",display:"flex",flexDirection:"column",height:"100vh",overflow:"hidden"}}>
        {cosmicBg}
        <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          {dmThread?<DMThread username={dmThread} thread={dms[dmThread]} myAvatar={profile?.avatar} onSend={sendDM} onBack={()=>setDmThread(null)} myBlocks={myBlocks} blockedBy={blockedBy} onBlock={blockUser} onUnblock={unblockUser} onReport={(id,name)=>setReportTarget({userId:id,username:name})}/>:<DMsList dms={dms} onOpenThread={u=>setDmThread(u)} onBack={()=>setDmOpen(false)} myBlocks={myBlocks} blockedBy={blockedBy}/>}
        </div>
      </div>
    </>
  );

  // ════ MAIN APP ════
  return(
    <>
      <style>{css}</style>
      <div style={{fontFamily:"'Crimson Text',Georgia,serif",background:"#0D0A06",minHeight:"100vh",color:"#EDE0CE",maxWidth:430,margin:"0 auto",position:"relative",overflow:"hidden"}}>
        {cosmicBg}
        {roomPicker&&<RoomPicker genre={GENRES.find(g=>g.id===roomPicker)} timeSlot={timeSlot} rooms={rooms} identity={identity} onJoin={(r,t)=>joinRoom(roomPicker,r,t)} onClose={()=>setRoomPicker(null)}/>}
        {userCard&&<UserCard username={userCard} onMessage={(u)=>openDM(u)} onClose={()=>setUserCard(null)} myBlocks={myBlocks} onBlock={blockUser} onUnblock={unblockUser} onReport={(id,name)=>setReportTarget({userId:id,username:name})}/>}
        {reportTarget&&<ReportSheet username={reportTarget.username} onSubmit={submitReport} onClose={()=>setReportTarget(null)}/>}
        {notifsOpen&&<NotificationsPanel notifs={notifs} announcements={announcements} isAdmin={!!(profile&&profile.is_admin)} onRead={readNotif} onReadAll={readAllNotifs} onClose={()=>setNotifsOpen(false)} onAnnounce={sendAnnouncement} onEditAnnouncement={editAnnouncement} onDeleteAnnouncement={deleteAnnouncement}/>}
        {attachOpen&&aGenre&&<AttachPanel genreColor={aGenre.color} onSendMeme={sendMeme} onSendImage={sendImage} onSendPassage={sendPassage} onClose={()=>setAttachOpen(false)}/>}
        {reactionTarget&&<ReactionPicker onPick={e=>addReaction(reactionTarget,e)} onClose={()=>setReactionTarget(null)}/>}

        {/* HEADER */}
        <header style={{padding:"14px 18px 11px",borderBottom:"1px solid #2A1E0E",background:"#0D0A06dd",backdropFilter:"blur(14px)",position:"sticky",top:0,zIndex:10,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:13,letterSpacing:4,color:"#E8B4CC",textTransform:"uppercase",marginBottom:1}}>📍 {profile?.city} · {curSlot?.label}</div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:300,letterSpacing:1}}><span className="gold-text">Orbit</span></div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{fontSize:14,color:"#C48700",background:"#C4870018",border:"1px solid #C4870044",borderRadius:20,padding:"3px 9px",letterSpacing:2,textTransform:"uppercase"}}>21+</div>
            <div onClick={()=>{setDmOpen(true);setDmThread(null);}} style={{position:"relative",cursor:"pointer",width:32,height:32,borderRadius:"50%",background:"#1A1208",border:"1px solid #3A2A14",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>💬</div>
            <div onClick={()=>setNotifsOpen(true)} style={{position:"relative",cursor:"pointer",width:32,height:32,borderRadius:"50%",background:unreadNotifs>0?"#C4870022":"#1A1208",border:`1px solid ${unreadNotifs>0?"#C48700":"#3A2A14"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,animation:unreadNotifs>0?"bellJiggle 1.2s ease-in-out infinite":"none",boxShadow:unreadNotifs>0?"0 0 12px #C4870066":"none"}}>
              🔔{unreadNotifs>0&&<><div style={{position:"absolute",top:0,right:0,width:8,height:8,borderRadius:"50%",background:"#C48700",border:"2px solid #0D0A06"}}/><div style={{position:"absolute",top:0,right:0,width:8,height:8,borderRadius:"50%",background:"#C48700",animation:"ping 1.5s ease-out infinite"}}/></>}
            </div>
            <div onClick={()=>setProfileOpen(true)} style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#8A5A00,#C48700)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,cursor:"pointer",position:"relative"}}>
              {profile?.avatar}
              {idObj&&<span style={{position:"absolute",bottom:-2,right:-2,fontSize:13,animation:"starPulse 3s ease-in-out infinite"}}>{idObj.star}</span>}
            </div>
          </div>
        </header>

        <div style={{paddingBottom:84,position:"relative",zIndex:1}}>

          {/* HOME */}
          {tab==="home"&&!club&&(
            <div className="fade-up">
              <div style={{padding:"14px 14px 0",display:"flex",gap:8}}>
                {TIME_SLOTS.map(ts=>(
                  <button key={ts.id} onClick={()=>setTimeSlot(ts.id)} style={{flex:1,padding:"8px 4px",borderRadius:10,fontSize:13,background:timeSlot===ts.id?"#C4870018":"#1A1208",border:`1px solid ${timeSlot===ts.id?"#C48700":"#3A2A14"}`,color:timeSlot===ts.id?"#C4A060":"#6A5030",cursor:"pointer",transition:"all 0.2s",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                    <span style={{fontSize:17}}>{ts.icon}</span><span>{ts.label}</span>
                  </button>
                ))}
              </div>
              <section style={{padding:"16px 14px 0"}}>
                <div style={{fontSize:13,letterSpacing:3,color:"#E8B4CC",textTransform:"uppercase",marginBottom:12}}>My Clubs</div>
                {jGenres.length===0&&<div style={{color:"#D4A0B8",fontSize:13,fontStyle:"italic",paddingBottom:10}}>Head to Explore to join a club →</div>}
                {jGenres.map(g=>(
                  <div key={g.id} style={{background:"#1A120888",border:`1px solid ${g.color}38`,borderRadius:14,padding:"14px 15px",marginBottom:12,display:"flex",alignItems:"center",gap:13,backdropFilter:"blur(8px)"}}>
                    <div onClick={()=>setBookPage(g.id)} style={{width:46,height:46,borderRadius:10,background:BOOK_COVERS[g.id],display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0,cursor:"pointer",position:"relative",overflow:"hidden"}}>
                      <div style={{position:"absolute",inset:0,background:"#00000033"}}/><span style={{position:"relative",zIndex:1}}>{g.icon}</span>
                    </div>
                    <div style={{flex:1,minWidth:0,cursor:"pointer"}} onClick={()=>{setRoom("discussion");setClub(g.id);}}>
                      <div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontWeight:"600",color:"#F0D9B0",fontSize:15}}>{g.label}</span>{g.manga&&<span style={{fontSize:13,color:"#D4608A",background:"#D4608A18",border:"1px solid #D4608A33",borderRadius:20,padding:"1px 5px"}}>MANGA</span>}{g.mature&&<span style={{fontSize:13,color:"#C2476A",background:"#C2476A18",border:"1px solid #C2476A33",borderRadius:20,padding:"1px 5px"}}>MATURE</span>}</div>
                      <div style={{fontSize:14,color:"#E8B4CC",marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{pickTitle(g)}</div>
                      <div style={{marginTop:5,height:3,background:"#2A1E0E",borderRadius:2}}><div style={{width:`${Math.round(((chapterProg[g.id]||0)/g.totalChapters)*100)}%`,height:"100%",background:`linear-gradient(90deg,${g.color}55,${g.color})`,borderRadius:2}}/></div>
                      <div style={{fontSize:13,color:"#C490A8",marginTop:2}}>Ch. {chapterProg[g.id]||0}/{g.totalChapters}</div>
                    </div>
                    <div onClick={()=>{setRoom("discussion");setClub(g.id);}} style={{color:"#B48098",fontSize:20,cursor:"pointer"}}>›</div>
                  </div>
                ))}
              </section>
              <section style={{padding:"4px 14px 0"}}>
                <div style={{fontSize:13,letterSpacing:3,color:"#E8B4CC",textTransform:"uppercase",marginBottom:12}}>{curSlot?.label} Meetings</div>
                {jGenres.length===0&&<div style={{color:"#D4A0B8",fontSize:13,fontStyle:"italic"}}>Join clubs to see your meetings.</div>}
                {jGenres.map(g=>{
                  const slotData=rooms[g.id]?.[timeSlot]||{women:[],open:[]};
                  return(
                    <div key={g.id} style={{background:"#1A120888",border:"1px solid #2A1E0E",borderRadius:12,padding:"12px 14px",marginBottom:10,backdropFilter:"blur(8px)"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                        <div><div style={{display:"flex",gap:6,alignItems:"center",marginBottom:2}}><span>{g.icon}</span><span style={{fontWeight:"600",color:"#F0D9B0",fontSize:13}}>{g.label}</span></div><div style={{fontSize:14,color:"#C4A060"}}>Mid-Book Discussion</div><div style={{fontSize:13,color:"#D4A0B8",marginTop:1}}>{curSlot?.range} · 💬 text-only</div></div>
                        <button onClick={()=>setRoomPicker(g.id)} style={{background:g.color+"18",border:`1px solid ${g.color}44`,borderRadius:8,padding:"7px 12px",fontSize:13,color:g.color,cursor:"pointer",whiteSpace:"nowrap"}}>Choose Room →</button>
                      </div>
                      <div style={{display:"flex",gap:6}}>
                        {identity==="she"&&g.womenRoom&&<div style={{flex:1,background:"#E8709A10",borderRadius:8,padding:"5px 8px",border:"1px solid #E8709A33"}}><div style={{fontSize:14,color:"#E8709A",marginBottom:2}}>🌸 Women's</div><div style={{fontSize:14,color:"#E8B4CC"}}>{(slotData.women||[]).filter(r=>r.current<r.cap).length} open</div></div>}
                        <div style={{flex:1,background:"#C4870010",borderRadius:8,padding:"5px 8px",border:"1px solid #C4870033"}}><div style={{fontSize:14,color:"#C48700",marginBottom:2}}>🌍 Open</div><div style={{fontSize:14,color:"#E8B4CC"}}>{(slotData.open||[]).filter(r=>r.current<r.cap).length} open</div></div>
                      </div>
                    </div>
                  );
                })}
              </section>
            </div>
          )}

          {/* ─── CHAT with image/meme/reactions ─── */}
          {tab==="home"&&club&&aGenre&&chatRoom==="women"&&identity!=="she"&&(
            <div style={{padding:"48px 24px",textAlign:"center"}}>
              <div style={{fontSize:44,marginBottom:14}}>🌸</div>
              <div style={{fontSize:14,color:"#C490A8",lineHeight:1.8}}>This room is for women only.<br/>The open room is waiting for you 💛</div>
            </div>
          )}
          {tab==="home"&&club&&aGenre&&!(chatRoom==="women"&&identity!=="she")&&(
            <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 118px)"}}>
              <div style={{padding:"11px 14px",background:"#1A1208cc",borderBottom:"1px solid #2A1E0E",display:"flex",alignItems:"center",gap:10,backdropFilter:"blur(10px)"}}>
                <button onClick={()=>setClub(null)} style={{background:"none",border:"none",color:"#E8B4CC",fontSize:22,cursor:"pointer",padding:0}}>‹</button>
                <span style={{fontSize:20}}>{aGenre.icon}</span>
                <div style={{flex:1}}><div style={{fontWeight:"600",color:"#F0D9B0",fontSize:14}}>{aGenre.label}{chatRoom==="women"&&<span style={{fontSize:11,color:"#E8709A",background:"#E8709A18",border:"1px solid #E8709A44",borderRadius:20,padding:"2px 8px",marginLeft:8,verticalAlign:"middle"}}>🌸 Women's Room</span>}{chatRoom==="open"&&<span style={{fontSize:11,color:"#C48700",background:"#C4870018",border:"1px solid #C4870044",borderRadius:20,padding:"2px 8px",marginLeft:8,verticalAlign:"middle"}}>🌍 Open Room</span>}</div><div style={{fontSize:13,color:"#E8B4CC"}}>{clubLine(aGenre)} · {pickTitle(aGenre)}</div></div>
                <button onClick={()=>setBookPage(aGenre.id)} style={{background:aGenre.color+"18",border:`1px solid ${aGenre.color}44`,borderRadius:8,padding:"5px 10px",fontSize:13,color:aGenre.color,cursor:"pointer"}}>📖 Book</button>
              </div>

              <div style={{flex:1,overflowY:"auto",padding:"14px 13px 6px"}}>
                {(msgs[ck(club)]||[]).length===0&&(
                  <div style={{textAlign:"center",padding:"48px 24px"}}>
                    <div style={{fontSize:44,marginBottom:14}}>🪐</div>
                    <div style={{fontSize:14,color:"#C490A8",lineHeight:1.8}}>No messages yet.<br/>Start the conversation — say hi! 👋</div>
                  </div>
                )}
                {(msgs[ck(club)]||[]).map((m2)=>(
                  <div key={m2.id} className="msg-bubble" style={{marginBottom:14,display:"flex",gap:10,alignItems:"flex-start",flexDirection:m2.isMe?"row-reverse":"row",position:"relative"}}>
                    <div style={{width:34,height:34,borderRadius:"50%",background:"#231A0A",border:`1px solid ${aGenre.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{m2.avatar}</div>
                    <div style={{maxWidth:"75%"}}>
                      {!m2.isMe&&(
                        <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:4,flexWrap:"wrap"}}>
                          <span style={{fontSize:14,fontWeight:"600",color:aGenre.color,cursor:"pointer"}} onClick={()=>setUserCard(m2.user)}>{m2.user}</span>
                          {m2.identity&&<IdentityStar identity={m2.identity} size={11}/>}
                          <span style={{fontSize:13,color:"#D4A0B8"}}>{m2.city}</span>
                          <span style={{fontSize:13,color:"#B48098"}}>{m2.time}</span>
                          {m2.spoiler&&<span style={{fontSize:14,background:"#3A1A0A",border:"1px solid #7A3A10",color:"#D09060",borderRadius:4,padding:"1px 5px"}}>⚠️ SPOILER</span>}
                        </div>
                      )}
                      {/* Message bubble with reaction trigger */}
                      <div style={{position:"relative",display:"inline-block"}}>
                        <SpoilerMsg msg={m2} color={aGenre.color}/>
                        {/* Reaction trigger button */}
                        {m2.isMe&&<button className="delete-trigger" title="Delete message" onClick={()=>deleteMsg(m2.id)} style={{position:"absolute",top:-8,right:-8,width:22,height:22,borderRadius:"50%",background:"#231A0A",border:"1px solid #3A2A14",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2}}>🗑️</button>}
                        <button className="reaction-trigger" onClick={()=>setReactionTarget(m2.id)} style={{position:"absolute",bottom:-6,right:-6,width:22,height:22,borderRadius:"50%",background:"#231A0A",border:"1px solid #3A2A14",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2}}>＋</button>
                      </div>
                      {/* Reactions bar */}
                      <ReactionBar reactions={m2.reactions} onReact={e=>addReaction(m2.id,e)} myUsername={profile?.username}/>
                      {m2.isMe&&<div style={{fontSize:13,color:"#B48098",marginTop:4,textAlign:"right"}}>{m2.time}</div>}
                    </div>
                  </div>
                ))}
                <div ref={endRef}/>
              </div>

              {/* Input bar with attachment button */}
              <div style={{padding:"8px 12px 10px",borderTop:"1px solid #2A1E0E",background:"#0D0A06cc",backdropFilter:"blur(10px)"}}>
                <div style={{display:"flex",gap:6,marginBottom:6,alignItems:"center"}}>
                  <button onClick={()=>setSpoiler(s=>!s)} style={{fontSize:13,background:spoiler?"#3A1A0A":"#1A1208",border:`1px solid ${spoiler?"#7A3A10":"#3A2A14"}`,color:spoiler?"#D09060":"#7A6040",borderRadius:20,padding:"3px 10px",cursor:"pointer"}}>
                    {spoiler?"⚠️ Spoiler ON":"Spoiler?"}
                  </button>
                  <div style={{fontSize:13,color:"#C490A8",fontStyle:"italic"}}>tap + to react · tap 📎 for memes</div>
                </div>
                {profile&&profile.is_restricted?(
                  <div style={{textAlign:"center",padding:"14px 8px",fontSize:14,color:"#C490A8",fontStyle:"italic"}}>Your account is restricted — you can read but not send messages. Contact the founder if you think this is a mistake.</div>
                ):(
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  {/* Attachment button */}
                  <button onClick={()=>setAttachOpen(true)} style={{width:40,height:40,borderRadius:"50%",background:"#1A1208",border:`1px solid ${aGenre.color}44`,color:aGenre.color,fontSize:18,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    📎
                  </button>
                  <textarea value={msg} rows={1} ref={msgRef} onChange={e=>{setMsg(e.target.value);e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,110)+"px";}} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder="Share your thoughts..." style={{flex:1,background:"#1A1208",border:"1px solid #3A2A14",borderRadius:20,padding:"10px 16px",color:"#EDE0CE",fontSize:14,resize:"none",overflowY:"auto",maxHeight:110}}/>
                  <button onClick={send} style={{width:40,height:40,borderRadius:"50%",background:aGenre.color,border:"none",color:"white",fontSize:16,cursor:"pointer",flexShrink:0}}>↑</button>
                </div>)}
              </div>
            </div>
          )}

          {/* EXPLORE */}
          {tab==="explore"&&(
            <div className="fade-up" style={{padding:14}}>
              <div style={{display:"flex",gap:8,marginBottom:16}}>
                <button onClick={()=>setExploreSection("books")} style={{flex:1,padding:"10px",borderRadius:10,background:exploreSection==="books"?"#C4870022":"#1A1208",border:`2px solid ${exploreSection==="books"?"#C48700":"#3A2A14"}`,color:exploreSection==="books"?"#C4A060":"#6A5030",fontSize:13,cursor:"pointer",transition:"all 0.2s"}}>📚 Books</button>
                <button onClick={()=>setExploreSection("manga")} style={{flex:1,padding:"10px",borderRadius:10,background:exploreSection==="manga"?"#D4608A22":"#1A1208",border:`2px solid ${exploreSection==="manga"?"#D4608A":"#3A2A14"}`,color:exploreSection==="manga"?"#D4608A":"#6A5030",fontSize:13,cursor:"pointer",transition:"all 0.2s"}}>🎌 Manga / Anime</button>
              </div>
              {scopeCity&&nearbyCities.length>0&&(
                <div style={{fontSize:13,color:"#C490A8",marginBottom:14,fontStyle:"italic",lineHeight:1.8}}>
                  📍 Readers near you: {nearbyCities.map(c=>c.dist===0?`${c.city} (${c.count})`:`${c.city}, ${c.dist} mi (${c.count})`).join(" · ")}
                </div>
              )}
              {GENRES.filter(g=>exploreSection==="manga"?g.manga:!g.manga).map(g=>{const isJ=joined.includes(g.id);return(
                <div key={g.id} style={{background:"#1A120888",borderRadius:14,padding:16,marginBottom:14,border:`1px solid ${isJ?g.color+"55":"#2A1E0E"}`,backdropFilter:"blur(8px)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                    <div style={{width:44,height:44,borderRadius:10,background:BOOK_COVERS[g.id],display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{g.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}><span style={{fontWeight:"600",color:"#F0D9B0",fontSize:15}}>{g.label}</span>{g.mature&&<span style={{fontSize:14,color:"#C2476A",background:"#C2476A18",border:"1px solid #C2476A44",borderRadius:20,padding:"1px 6px"}}>MATURE</span>}{g.womenRoom&&<span style={{fontSize:14,color:"#E8709A",background:"#E8709A18",border:"1px solid #E8709A44",borderRadius:20,padding:"1px 6px"}}>🌸 Women's Room</span>}</div>
                      <div style={{fontSize:13,color:"#E8B4CC"}}>{clubLine(g)} · 15/room max</div>
                    </div>
                    <button onClick={()=>toggleJoin(g)} style={{background:isJ?g.color:"transparent",border:`1px solid ${g.color}`,borderRadius:20,padding:"6px 14px",color:isJ?"#0D0A06":g.color,fontSize:13,cursor:"pointer",fontWeight:isJ?"600":"400",flexShrink:0}}>{isJ?"✓ Joined":"Join"}</button>
                  </div>
                  <p style={{fontSize:14,color:"#D4A0B8",fontStyle:"italic",lineHeight:1.6,marginBottom:10}}>{g.description}</p>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:10}}>{g.tags.map(t=><span key={t} style={{fontSize:13,background:g.color+"14",border:`1px solid ${g.color}33`,color:g.color,borderRadius:20,padding:"2px 8px"}}>{t}</span>)}</div>
                  <div style={{fontSize:14,color:"#E8B4CC",fontStyle:"italic"}}>Now reading: <span style={{color:"#C4A060"}}>{pickTitle(g)}</span>{pickAuthor(g)?" · "+pickAuthor(g):""}</div>
                  <div style={{fontSize:13,color:"#C490A8",marginTop:4}}>Next meeting: {g.nextMeeting}</div>
                </div>
              );})}
            </div>
          )}

          {/* NEXT PICK */}
          {tab==="discover"&&(
            <div className="fade-up" style={{padding:14}}>
              <div style={{fontSize:13,letterSpacing:3,color:"#E8B4CC",textTransform:"uppercase",marginBottom:4}}>Next Month's Pick</div>
              <div style={{fontSize:14,color:"#D4A0B8",fontStyle:"italic",marginBottom:18,lineHeight:1.7}}>Nominate a book. Top 3 go to a vote. The community decides.</div>
              {jGenres.length===0&&<div style={{textAlign:"center",color:"#D4A0B8",fontSize:13,fontStyle:"italic",marginTop:40}}>Join a club first to nominate and vote.</div>}
              {jGenres.map(g=>{
                const gnoms=noms[g.id]||[];const top3=gnoms.slice(0,3);const rest=gnoms.slice(3);
                const mq=MONTHLY_Q[g.id];const sv=survVote[g.id];const bv=bookVote[g.id];
                return(
                  <div key={g.id} style={{background:"#1A120888",borderRadius:16,padding:16,marginBottom:20,border:`1px solid ${g.color}28`,backdropFilter:"blur(8px)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><span style={{fontSize:18}}>{g.icon}</span><span style={{fontWeight:"600",color:"#F0D9B0",fontSize:15}}>{g.label}</span>{g.manga&&<span style={{fontSize:14,color:"#D4608A",background:"#D4608A18",border:"1px solid #D4608A33",borderRadius:20,padding:"1px 6px"}}>MANGA</span>}{g.mature&&<span style={{fontSize:14,color:"#C2476A",background:"#C2476A18",border:"1px solid #C2476A33",borderRadius:20,padding:"1px 6px"}}>MATURE</span>}</div>
                    {mq&&(<div style={{background:"#231A0A",borderRadius:12,padding:"13px 14px",marginBottom:14,border:"1px solid #3A2A14"}}><div style={{fontSize:13,letterSpacing:2,color:"#E8B4CC",textTransform:"uppercase",marginBottom:6}}>📋 Monthly Survey</div><div style={{fontSize:13,color:"#C4A060",fontStyle:"italic",marginBottom:10}}>{mq.q}</div><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{mq.opts.map(opt=><button key={opt} onClick={()=>castSurvey(g.id,opt)} style={{background:sv===opt?g.color+"22":"#1A1208",border:`1px solid ${sv===opt?g.color:"#C490A8"}`,borderRadius:20,padding:"5px 12px",fontSize:13,color:sv===opt?g.color:"#E8B4CC",cursor:"pointer",transition:"all 0.2s"}}>{sv===opt?"✓ ":""}{opt}</button>)}</div>{sv&&<div style={{fontSize:13,color:"#D4A0B8",marginTop:8,fontStyle:"italic"}}>Your answer: {sv} ✓</div>}</div>)}
                    <div style={{fontSize:13,letterSpacing:2,color:"#E8B4CC",textTransform:"uppercase",marginBottom:8}}>🗳️ Vote for Next Read</div>
                    {top3.length===0&&<div style={{fontSize:14,color:"#C490A8",fontStyle:"italic",marginBottom:10}}>No nominations yet — be the first!</div>}
                    {top3.map((n,i)=>(<div key={n.title} onClick={()=>voteBook(g.id,n.title)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:10,marginBottom:7,cursor:"pointer",background:bv===n.title?g.color+"18":"#231A0A",border:`1px solid ${bv===n.title?g.color:"#C490A8"}`,transition:"all 0.2s"}}><div style={{width:22,height:22,borderRadius:"50%",background:g.color+"28",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:g.color,fontWeight:"bold",flexShrink:0}}>#{i+1}</div><div style={{flex:1,fontSize:13,color:"#EDE0CE"}}>{n.title}</div><div style={{fontSize:13,color:"#E8B4CC"}}>{n.count} nom{n.count!==1?"s":""}</div>{bv===n.title&&<div style={{color:g.color}}>✓</div>}{isAdmin&&<div onClick={(e)=>{e.stopPropagation();setPickForm({gid:g.id,title:n.title,author:""});}} style={{color:"#E8B4CC",fontSize:15,cursor:"pointer",padding:"0 2px",flexShrink:0}} title="Set as current read">★</div>}</div>))}
                    {bv&&<div style={{fontSize:13,color:"#D4A0B8",fontStyle:"italic",marginBottom:10}}>Your vote: {bv} ✓</div>}
                    {isAdmin&&overrides[g.id]&&<div style={{fontSize:13,color:"#E8B4CC",marginBottom:10}}>★ Founder's pick: <span style={{color:"#F0D9B0"}}>{overrides[g.id].title}</span> <button onClick={()=>clearPick(g.id)} style={{background:"none",border:"none",color:"#C490A8",fontSize:13,cursor:"pointer",textDecoration:"underline",padding:0}}>clear</button></div>}
                    {isAdmin&&pickForm&&pickForm.gid===g.id&&(<div style={{background:"#231A0A",borderRadius:12,padding:12,marginBottom:10,border:"1px solid #E8B4CC44"}}>
                      <div style={{fontSize:13,color:"#E8B4CC",marginBottom:8}}>Set {g.label}'s current read</div>
                      <input value={pickForm.title} onChange={e=>setPickForm(p=>({...p,title:e.target.value}))} placeholder="Book title" style={{width:"100%",boxSizing:"border-box",background:"#0D0A06",border:"1px solid #3A2A14",borderRadius:10,padding:"9px 12px",color:"#EDE0CE",fontSize:13,marginBottom:8}}/>
                      <input value={pickForm.author} onChange={e=>setPickForm(p=>({...p,author:e.target.value}))} placeholder="Author (optional)" style={{width:"100%",boxSizing:"border-box",background:"#0D0A06",border:"1px solid #3A2A14",borderRadius:10,padding:"9px 12px",color:"#EDE0CE",fontSize:13,marginBottom:8}}/>
                      <div style={{display:"flex",gap:8}}><button onClick={savePick} style={{flex:1,background:g.color,border:"none",borderRadius:10,padding:"9px 14px",color:"#0D0A06",fontSize:14,fontWeight:"600",cursor:"pointer"}}>Save pick</button><button onClick={()=>setPickForm(null)} style={{background:"none",border:"1px solid #C490A8",borderRadius:10,padding:"9px 14px",color:"#E8B4CC",fontSize:14,cursor:"pointer"}}>Cancel</button></div>
                    </div>)}
                    <div style={{fontSize:13,letterSpacing:2,color:"#E8B4CC",textTransform:"uppercase",marginBottom:8,marginTop:12}}>📚 Nominate</div>
                    <div style={{display:"flex",gap:8}}><input value={nomIn[g.id]||""} onChange={e=>setNomIn(p=>({...p,[g.id]:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&nominate(g.id)} placeholder="Title + Enter..." style={{flex:1,background:"#0D0A06",border:"1px solid #3A2A14",borderRadius:10,padding:"9px 12px",color:"#EDE0CE",fontSize:13}}/><button onClick={()=>nominate(g.id)} style={{background:g.color,border:"none",borderRadius:10,padding:"9px 14px",color:"#0D0A06",fontSize:14,fontWeight:"600",cursor:"pointer"}}>+</button></div>
                    {rest.length>0&&<div style={{marginTop:10,fontSize:13,color:"#C490A8",fontStyle:"italic"}}>Also nominated: {rest.map(r=>r.title).join(", ")}</div>}
                  </div>
                );
              })}
            </div>
          )}

          {/* TIP JAR */}
          {tab==="tip"&&(
            <div className="fade-up" style={{padding:14}}>
              {/* Header */}
              <div style={{textAlign:"center",marginBottom:24,padding:"20px 14px 0"}}>
                <div className="flicker" style={{fontSize:48,marginBottom:12}}>🪐</div>
                <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:300,color:"#F0D9B0",marginBottom:8}}>Support Orbit</h2>
                <p style={{fontSize:14,color:"#D4A0B8",lineHeight:1.8,fontStyle:"italic"}}>Orbit is free forever.<br/>If it's brought you your people — a tip means everything.</p>
              </div>

              {/* Founding Member Card */}
              <div style={{background:"linear-gradient(135deg,#C4870018,#1A1208)",border:"1px solid #C4870066",borderRadius:16,padding:"18px 16px",marginBottom:20}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                  <span style={{fontSize:28}}>🌟</span>
                  <div>
                    <div style={{fontWeight:"600",color:"#F0D9B0",fontSize:16}}>Founding Member Badge</div>
                    <div style={{fontSize:12,color:"#C48700",marginTop:2}}>Limited window · First 6 months only</div>
                  </div>
                </div>
                <p style={{fontSize:13,color:"#D4A0B8",lineHeight:1.8,fontStyle:"italic",marginBottom:10}}>
                  "Tip within the first 6 months of Orbit's launch and this badge is yours forever. No matter how big Orbit grows — you were here first. This badge never goes away."
                </p>
                <div style={{height:1,background:"#C4870033",marginBottom:10}}/>
                <div style={{fontSize:12,color:"#C48700",display:"flex",alignItems:"center",gap:6}}>
                  <span>🌟</span>
                  <span>Any tip amount qualifies for the Founding Member badge</span>
                </div>
              </div>

              {/* Tip amounts */}
              <div style={{fontSize:10,letterSpacing:3,color:"#E8B4CC",textTransform:"uppercase",marginBottom:14}}>Choose an amount</div>
              {[
                {icon:"☕",label:"Buy us a coffee",amount:"$3",desc:"Keeps one room running",link:"https://buy.stripe.com/00wcN6bfc4dCdtq3mZa7C04"},
                {icon:"🌙",label:"Moon tier",amount:"$9",desc:"Keeps the lights on",link:"https://buy.stripe.com/28EcN63MKaC00GE5v7a7C05"},
                {icon:"🪐",label:"Founding Member",amount:"$15",desc:"You helped build this universe",link:"https://buy.stripe.com/00wcN6ab8bG4cpm2iVa7C06"},
                {icon:"💫",label:"Custom tip",amount:"Any $",desc:"You choose the amount",link:"https://buy.stripe.com/7sY6oIbfcaC08961eRa7C07"},
              ].map((t,i)=>(
                <div key={i} style={{background:"#1A120888",border:"1px solid #C4870044",borderRadius:14,padding:"16px",marginBottom:12,display:"flex",alignItems:"center",gap:14,cursor:"pointer",backdropFilter:"blur(8px)",transition:"all 0.2s"}}
                  onClick={()=>window.open(t.link,"_blank","noopener")}
                  onMouseEnter={e=>e.currentTarget.style.border="1px solid #C48700AA"}
                  onMouseLeave={e=>e.currentTarget.style.border="1px solid #C4870044"}>
                  <div style={{fontSize:32,flexShrink:0}}>{t.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:"600",color:"#F0D9B0",fontSize:15,marginBottom:3}}>{t.label}</div>
                    <div style={{fontSize:12,color:"#D4A0B8"}}>{t.desc}</div>
                  </div>
                  <div style={{background:"linear-gradient(135deg,#8A5A00,#C48700)",borderRadius:20,padding:"8px 18px",color:"#0D0A06",fontWeight:"600",fontSize:15,flexShrink:0}}>{t.amount}</div>
                </div>
              ))}

              {/* Footer note */}
              <div style={{textAlign:"center",padding:"0 10px"}}>
                <p style={{fontSize:12,color:"#D4A0B8",lineHeight:1.8,fontStyle:"italic"}}>Tips are processed securely through Stripe.<br/>Orbit will always be free — tips just help it grow.</p>
                <p style={{fontSize:11,color:"#C490A8",marginTop:8}}>🌸 Thank you for believing in this community.</p>
              </div>
            </div>
          )}

          {/* MEETINGS */}
          {tab==="meetings"&&(
            <div className="fade-up" style={{padding:14}}>
              <div style={{fontSize:13,letterSpacing:3,color:"#E8B4CC",textTransform:"uppercase",marginBottom:4}}>Weekly Meetings</div>
              <div style={{fontSize:14,color:"#D4A0B8",fontStyle:"italic",marginBottom:14}}>No camera. No mic. 15 readers/room — intimate by design.</div>
              {identity==="she"&&<div style={{fontSize:14,color:"#E8709A",background:"#E8709A10",border:"1px solid #E8709A33",borderRadius:10,padding:"8px 12px",marginBottom:16,lineHeight:1.6}}>🌸 Women's Rooms available in select clubs.</div>}
              {TIME_SLOTS.map(ts=>(
                <div key={ts.id} style={{marginBottom:22}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,paddingBottom:7,borderBottom:"1px solid #2A1E0E"}}>
                    <span style={{fontSize:18}}>{ts.icon}</span>
                    <div style={{flex:1}}><div style={{color:"#C4A060",fontWeight:"600",fontSize:14}}>{ts.label}</div><div style={{fontSize:13,color:"#D4A0B8"}}>{ts.range}</div></div>
                    {timeSlot===ts.id&&<div style={{fontSize:13,color:"#C48700",background:"#C4870018",border:"1px solid #C4870044",borderRadius:20,padding:"3px 9px"}}>Your slot ✓</div>}
                  </div>
                  {jGenres.map(g=>{
                    const slotData=rooms[g.id]?.[ts.id]||{women:[],open:[]};
                    return(
                      <div key={g.id} style={{background:"#1A120888",borderRadius:12,padding:"12px 14px",marginBottom:10,border:`1px solid ${timeSlot===ts.id?g.color+"38":"#2A1E0E"}`,opacity:timeSlot===ts.id?1:0.5,transition:"opacity 0.2s",backdropFilter:"blur(8px)"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                          <div><div style={{display:"flex",gap:6,alignItems:"center",marginBottom:2}}><span>{g.icon}</span><span style={{fontWeight:"600",color:"#F0D9B0",fontSize:13}}>{g.label}</span></div><div style={{fontSize:13,color:"#D4A0B8"}}>💬 Text-only · 15/room max</div></div>
                          {timeSlot===ts.id?<button onClick={()=>setRoomPicker(g.id)} style={{background:g.color+"18",border:`1px solid ${g.color}44`,borderRadius:8,padding:"6px 10px",fontSize:13,color:g.color,cursor:"pointer"}}>Choose Room</button>:<div onClick={()=>setTimeSlot(ts.id)} style={{fontSize:13,color:"#C490A8",cursor:"pointer",textDecoration:"underline"}}>Switch here</div>}
                        </div>
                        <div style={{display:"flex",gap:5}}>
                          {identity==="she"&&g.womenRoom&&<div style={{flex:1,background:"#E8709A10",borderRadius:8,padding:"5px 8px",border:"1px solid #E8709A33"}}><div style={{fontSize:14,color:"#E8709A",marginBottom:2}}>🌸 Women's</div><div style={{fontSize:14,color:"#E8B4CC"}}>{(slotData.women||[]).filter(r=>r.current<r.cap).length} open</div></div>}
                          <div style={{flex:1,background:"#C4870010",borderRadius:8,padding:"5px 8px",border:"1px solid #C4870033"}}><div style={{fontSize:14,color:"#C48700",marginBottom:2}}>🌍 Open</div><div style={{fontSize:14,color:"#E8B4CC"}}>{(slotData.open||[]).filter(r=>r.current<r.cap).length} open</div></div>
                        </div>
                      </div>
                    );
                  })}
                  {jGenres.length===0&&<div style={{fontSize:14,color:"#C490A8",fontStyle:"italic"}}>Join clubs to unlock meetings.</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BOTTOM NAV */}
        <nav style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"#0D0A06cc",backdropFilter:"blur(14px)",borderTop:"1px solid #2A1E0E",display:"flex",justifyContent:"space-around",padding:"8px 0 16px",zIndex:20}}>
          {[{id:"home",icon:"🪐",label:"My Clubs"},{id:"discover",icon:"🗳️",label:"Next Pick"},{id:"explore",icon:"🔭",label:"Explore"},{id:"meetings",icon:"✨",label:"Meetings"},{id:"tip",icon:"☕",label:"Support"}].map(t=>(
            <button key={t.id} onClick={()=>{setTab(t.id);setClub(null);}} style={{background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,color:tab===t.id?"#C48700":"#5A4030",fontSize:14,letterSpacing:1,textTransform:"uppercase",transition:"color 0.2s"}}>
              <span style={{fontSize:20}}>{t.icon}</span>{t.label}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
