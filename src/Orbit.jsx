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
  {id:"thriller",       label:"Thriller",        icon:"🔪",color:"#4A8A7A",members:77, totalChapters:52, progress:30,currentBook:"Gone Girl",                  author:"Gillian Flynn",    description:"Unreliable narrators, twists you didn't see coming, hauntings that last.",tags:["Psychological","Suspense","Mystery"],          nextMeeting:"Wednesday 6:00 PM",womenRoom:false},
  {id:"sci-fi",         label:"Sci-Fi",          icon:"🚀",color:"#5A7AAA",members:61, totalChapters:29, progress:55,currentBook:"Project Hail Mary",          author:"Andy Weir",        description:"The universe is vast and terrifying. These books go there anyway.",     tags:["Space","Hard Sci-Fi","First Contact"],          nextMeeting:"Friday 7:00 PM",  womenRoom:false},
  {id:"literary",       label:"Literary Fiction",icon:"📖",color:"#6A8A50",members:54, totalChapters:16, progress:90,currentBook:"Piranesi",                   author:"Susanna Clarke",   description:"Stories that crack something open in you and don't apologize for it.",  tags:["Character Study","Lyrical","Surreal"],          nextMeeting:"Tuesday 6:30 PM", womenRoom:false},
  {id:"shojo",          label:"Shojo",           icon:"🌸",color:"#D4608A",members:88, totalChapters:60, progress:42,currentBook:"Fruits Basket",             author:"Natsuki Takaya",   description:"Feelings, romance, slow burns in illustrated form. Pure heart.",         tags:["Romance Manga","Slice of Life","Emotions"],    nextMeeting:"Monday 7:00 PM",  womenRoom:true,manga:true},
  {id:"manga-romance",  label:"Manga Romance",   icon:"💕",color:"#C45A8A",members:95, totalChapters:50, progress:65,currentBook:"Kaguya-sama: Love is War",  author:"Aka Akasaka",      description:"For romance readers who found manga and never looked back.",            tags:["Romantic Comedy","Slow Burn","Drama"],         nextMeeting:"Saturday 7:00 PM",womenRoom:true,manga:true},
  {id:"isekai",         label:"Isekai",          icon:"🏯",color:"#7A6AAA",members:72, totalChapters:80, progress:28,currentBook:"That Time I Got Reincarnated as a Slime",author:"Fuse",description:"Another world, new rules, a protagonist who refuses to follow them.",  tags:["Isekai","Fantasy","Reincarnation"],             nextMeeting:"Tuesday 8:00 PM", womenRoom:false,manga:true},
  {id:"dark-manga",     label:"Dark Manga",      icon:"🌑",color:"#5A3A6A",members:61, totalChapters:45, progress:55,currentBook:"Berserk",                   author:"Kentaro Miura",    description:"Psychological horror, moral complexity, darkness drawn in ink.",         tags:["Horror","Psychological","Mature"],              nextMeeting:"Thursday 8:30 PM",womenRoom:false,manga:true,mature:true},
  {id:"shonen",         label:"Shonen / Action", icon:"⚔️",color:"#C47A20",members:54, totalChapters:100,progress:38,currentBook:"Demon Slayer",              author:"Koyoharu Gotouge", description:"Epic battles, found family, arcs that hit different in manga form.",     tags:["Action","Battle","Found Family"],               nextMeeting:"Sunday 9:00 PM",  womenRoom:false,manga:true},
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
const CITIES=["Raleigh","Durham","Chapel Hill","Cary","Apex","Morrisville","Carrboro","Hillsborough"];

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
    <div onClick={()=>msg.spoiler&&setOpen(o=>!o)} style={{fontSize:14,lineHeight:1.65,borderRadius:isMe?"14px 4px 14px 14px":"4px 14px 14px 14px",padding:"10px 14px",maxWidth:268,background:msg.spoiler?(open?"#3A1A0A":"#1E1608"):(isMe?color+"22":"#231A0E"),border:`1px solid ${msg.spoiler?(open?color+"88":"#4A3010"):(isMe?color+"44":"#3A2A14")}`,color:msg.spoiler&&!open?"#7A6040":"#EDE0CE",filter:msg.spoiler&&!open?"blur(3px)":"none",cursor:msg.spoiler?"pointer":"default",transition:"all 0.3s",userSelect:"none"}}>
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
function NotificationsPanel({notifs,onRead,onReadAll,onClose}){
  const unread=notifs.filter(n=>!n.read).length;
  return(
    <div style={{position:"fixed",inset:0,background:"#0D0A06f0",zIndex:100,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div className="fade-up" onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:430,background:"#1A1208",borderRadius:"20px 20px 0 0",border:"1px solid #3A2A14",padding:"20px 18px 36px",maxHeight:"75vh",display:"flex",flexDirection:"column"}}>
        <div style={{width:36,height:4,background:"#3A2A14",borderRadius:2,margin:"0 auto 18px"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:300,color:"#F0D9B0"}}>Notifications</div>{unread>0&&<div style={{fontSize:13,color:"#C48700",marginTop:2}}>{unread} unread</div>}</div>
          {unread>0&&<button onClick={onReadAll} style={{background:"transparent",border:"1px solid #3A2A14",borderRadius:20,padding:"5px 12px",fontSize:13,color:"#E8B4CC",cursor:"pointer"}}>Mark all read</button>}
        </div>
        <div style={{overflowY:"auto",flex:1}}>
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
function DMThread({username,thread,myAvatar,onSend,onBack}){
  const [txt,setTxt]=useState("");const endRef=useRef(null);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[thread?.messages]);
  if(!thread)return null;
  const send=()=>{if(!txt.trim())return;onSend(username,txt.trim());setTxt("");};
  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div style={{padding:"12px 14px",background:"#1A1208cc",borderBottom:"1px solid #2A1E0E",display:"flex",alignItems:"center",gap:10}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:"#E8B4CC",fontSize:22,cursor:"pointer",padding:0}}>‹</button>
        <div style={{width:36,height:36,borderRadius:"50%",background:"#231A0A",border:"1px solid #3A2A14",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{thread.avatar}</div>
        <div><div style={{fontWeight:"600",color:"#F0D9B0",fontSize:14}}>{username}</div><div style={{fontSize:13,color:"#E8B4CC"}}>📍 {thread.city}</div></div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"14px 13px 6px"}}>
        {thread.messages.map((m,i)=>(
          <div key={i} style={{marginBottom:12,display:"flex",gap:10,alignItems:"flex-end",flexDirection:m.isMe?"row-reverse":"row"}}>
            <div style={{width:30,height:30,borderRadius:"50%",background:"#231A0A",border:"1px solid #3A2A14",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{m.isMe?myAvatar:thread.avatar}</div>
            <div style={{maxWidth:"72%"}}>
              <div style={{fontSize:14,lineHeight:1.6,borderRadius:m.isMe?"14px 4px 14px 14px":"4px 14px 14px 14px",padding:"9px 13px",background:m.isMe?"#C4870022":"#231A0E",border:`1px solid ${m.isMe?"#C4870044":"#3A2A14"}`,color:"#EDE0CE"}}>{m.text}</div>
              <div style={{fontSize:13,color:"#B48098",marginTop:3,textAlign:m.isMe?"right":"left"}}>{m.time}</div>
            </div>
          </div>
        ))}
        <div ref={endRef}/>
      </div>
      <div style={{padding:"8px 12px 10px",borderTop:"1px solid #2A1E0E",background:"#0D0A06cc",display:"flex",gap:8}}>
        <input value={txt} onChange={e=>setTxt(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder={`Message ${username}...`} style={{flex:1,background:"#1A1208",border:"1px solid #3A2A14",borderRadius:20,padding:"10px 16px",color:"#EDE0CE",fontSize:14}}/>
        <button onClick={send} style={{width:40,height:40,borderRadius:"50%",background:"#C48700",border:"none",color:"#0D0A06",fontSize:16,cursor:"pointer",flexShrink:0}}>↑</button>
      </div>
    </div>
  );
}
function DMsList({dms,onOpenThread,onBack}){
  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div style={{padding:"12px 14px",background:"#1A1208cc",borderBottom:"1px solid #2A1E0E",display:"flex",alignItems:"center",gap:10}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:"#E8B4CC",fontSize:22,cursor:"pointer",padding:0}}>‹</button>
        <div style={{flex:1}}><div style={{fontWeight:"600",color:"#F0D9B0",fontSize:15}}>Direct Messages</div><div style={{fontSize:13,color:"#E8B4CC"}}>Private · just between readers</div></div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"8px 14px"}}>
        {Object.entries(dms).map(([username,thread])=>{const last=thread.messages[thread.messages.length-1];return(
          <div key={username} onClick={()=>onOpenThread(username)} style={{display:"flex",gap:12,padding:"12px 0",borderBottom:"1px solid #2A1E0E",cursor:"pointer"}}>
            <div style={{width:44,height:44,borderRadius:"50%",background:"#231A0A",border:"1px solid #3A2A14",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{thread.avatar}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:14,fontWeight:"600",color:"#F0D9B0"}}>{username}</span><span style={{fontSize:13,color:"#C490A8"}}>{last?.time}</span></div>
              <div style={{fontSize:14,color:"#D4A0B8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{last?.isMe?"You: ":""}{last?.text}</div>
            </div>
          </div>
        );})}
      </div>
    </div>
  );
}

// ── Book Page ─────────────────────────────────────────────────────
function BookPage({genre,myChapter,onUpdateChapter,onBack}){
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
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:600,color:"#F0D9B0",lineHeight:1.2}}>{genre.currentBook}</div>
            <div style={{fontSize:13,color:"#C4A060",marginTop:3}}>{genre.author}</div>
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
function ProfilePage({profile,joined,chapterProg,identity,onBack,onLogout}){
  const jGenres=GENRES.filter(g=>joined.includes(g.id));
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
      <div style={{padding:"12px 14px 0",display:"flex",alignItems:"center",gap:8}}><button onClick={onBack} style={{background:"none",border:"none",color:"#E8B4CC",fontSize:22,cursor:"pointer",padding:0}}>‹</button><span style={{fontSize:14,color:"#D4A0B8"}}>My Profile</span></div>
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
              <div style={{fontSize:13,color:"#F0D9B0",fontWeight:"600",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{g.currentBook}</div>
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
function LandingPage({onJoin,onSignIn,clubLine}){
  const reviews=[
    {avatar:"🦋",user:"bookish_introvert",city:"Raleigh",text:"I've never felt this comfortable talking about books online. The small rooms changed everything."},
    {avatar:"🌙",user:"moonreader_k",city:"Durham",text:"Orbit is the first book community that actually feels like a community."},
    {avatar:"🥀",user:"shadow_pages",city:"Durham",text:"The Dark Romance room is everything. We talk about what we actually want."},
    {avatar:"🐺",user:"wolf_bound",city:"Cary",text:"Found my people and we are feral about our books. No regrets."},
    {avatar:"🌸",user:"sakura_reads",city:"Chapel Hill",text:"As a manga reader I never had a space like this. Shojo club is my favorite place."},
    {avatar:"🌺",user:"petal_pages",city:"Raleigh",text:"The Women's Rooms feel genuinely safe. I say what I actually think."},
  ];
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
          {[{icon:"🕯️",title:"No cameras",desc:"Text-only rooms. Show up in your pajamas."},{icon:"🌸",title:"Women's Rooms",desc:"Safe, candid spaces in select clubs."},{icon:"😭",title:"Memes + Reactions",desc:"Share memes, images, passages, and emoji reactions in chat."},{icon:"👥",title:"15 per room",desc:"Intimate by design. Real conversations."},{icon:"🗳️",title:"You decide",desc:"Community votes on every book. Automatically."},{icon:"🌍",title:"Nationwide",desc:"Readers across all 50 states. Find your city's people."}].map((f,i)=>(
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
                <div style={{fontSize:13,color:"#C4A060",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontStyle:"italic"}}>{g.currentBook}</div>
                <div style={{fontSize:13,color:"#C490A8",marginTop:4}}>{clubLine(g)}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section style={{position:"relative",zIndex:1,padding:"40px 0 60px"}}>
        <div style={{textAlign:"center",padding:"0 24px",marginBottom:28}}><div style={{fontSize:13,letterSpacing:4,color:"#E8B4CC",textTransform:"uppercase",marginBottom:10}}>From the Community</div><h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:30,fontWeight:300,fontStyle:"italic",color:"#F0D9B0"}}>Real readers. Real rooms.</h2></div>
        <div style={{display:"flex",gap:12,padding:"8px 24px",overflowX:"auto",scrollbarWidth:"none"}}>
          {reviews.map((r,i)=>(
            <div key={i} style={{flexShrink:0,width:260,background:"#1A120888",border:"1px solid #2A1E0E",borderRadius:14,padding:"16px",backdropFilter:"blur(8px)"}}>
              <div style={{fontSize:22,marginBottom:4,color:"#C48700"}}>"</div>
              <p style={{fontSize:13,color:"#C4A060",fontStyle:"italic",lineHeight:1.7,marginBottom:14}}>{r.text}</p>
              <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#3A2A14,#4A3A20)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{r.avatar}</div><div><div style={{fontSize:14,color:"#F0D9B0",fontWeight:"600"}}>{r.user}</div><div style={{fontSize:13,color:"#D4A0B8"}}>📍 {r.city}</div></div></div>
            </div>
          ))}
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
  const [obStep,setObStep]=useState(1);const [tUser,setTUser]=useState("");const [tCity,setTCity]=useState("Raleigh");
  const [tAvatar,setTAvatar]=useState("🦋");const [tSlot,setTSlot]=useState("evening");
  const [tJoined,setTJoined]=useState([]);const [tIdentity,setTIdentity]=useState("she");

  const [profile,setProfile]=useState(null);const [identity,setIdentity]=useState("she");
  const [joined,setJoined]=useState([]);const [timeSlot,setTimeSlot]=useState("evening");
  const [tab,setTab]=useState("home");const [club,setClub]=useState(null);
  const [bookPage,setBookPage]=useState(null);const [profileOpen,setProfileOpen]=useState(false);
  const [roomPicker,setRoomPicker]=useState(null);
  const [msgs,setMsgs]=useState(CHAT_INIT);const [msg,setMsg]=useState("");const [spoiler,setSpoiler]=useState(false);
  const [attachOpen,setAttachOpen]=useState(false);
  const [reactionTarget,setReactionTarget]=useState(null); // msgId
  const [noms,setNoms]=useState(NOMINATIONS_INIT);const [nomIn,setNomIn]=useState({});
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
  const [notifs,setNotifs]=useState(NOTIF_INIT);const [notifsOpen,setNotifsOpen]=useState(false);
  const [dms,setDms]=useState(DM_INIT);const [dmOpen,setDmOpen]=useState(false);const [dmThread,setDmThread]=useState(null);
  const [exploreSection,setExploreSection]=useState("books");
  const endRef=useRef(null);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs,club]);

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
          setProfile({username:row.username,city:row.city,avatar:row.avatar,email:session.user.email,
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
  useEffect(()=>{
    if(!isCloud) return;
    let cancelled=false;
    (async()=>{
      try{
        const [uRes,mRes]=await Promise.all([
          supabase.from("users").select("id, city"),
          supabase.from("memberships").select("user_id, genre_id")
        ]);
        if(cancelled) return;
        const cityById={};
        (uRes.data||[]).forEach(u=>{cityById[u.id]=(u.city||"").trim().toLowerCase();});
        const myCity=scopeCity.toLowerCase();
        const nearby={},total={};
        (mRes.data||[]).forEach(m=>{
          total[m.genre_id]=(total[m.genre_id]||0)+1;
          if(myCity&&cityById[m.user_id]===myCity) nearby[m.genre_id]=(nearby[m.genre_id]||0)+1;
        });
        if(!cancelled) setClubCounts({nearby,total});
      }catch(e){/* leave counts empty — honest empty state shows instead */}
    })();
    return ()=>{cancelled=true;};
  },[isCloud,scopeCity,joined]);
  const clubLine=(g)=>{
    if(scopeCity){
      const n=clubCounts.nearby[g.id]||0;
      return n>0?`${n} reader${n===1?"":"s"} in ${scopeCity}`:`Be the first reader in ${scopeCity} 🪐`;
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
      setProfile({username:row.username,city:row.city,avatar:row.avatar,email:data.user.email,
        joinDate:row.join_date?new Date(row.join_date).toLocaleDateString([],{month:"long",year:"numeric"}):"April 2025"});
      setIdentity(row.identity||"she");setTimeSlot(row.time_slot||"evening");
      const {data:mems}=await supabase.from("memberships").select("genre_id").eq("user_id",uid);
      setJoined((mems||[]).map(m=>m.genre_id));
      setChapterProg({});setScreen("app");
    }catch(e){
      setAuthErr(e.message||"Sign in failed. Please try again.");
    }
  };

  const handleSignupSubmit=()=>{
    setSignErr("");
    if(!signEmail.includes("@")){setSignErr("Please enter a valid email.");return;}
    if(signPass.length<6){setSignErr("Password must be at least 6 characters.");return;}
    if(signPass!==signPass2){setSignErr("Passwords don't match.");return;}
    if(users[signEmail.toLowerCase()]){setSignErr("Account already exists.");return;}
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
        {id:uid,username,city:tCity,avatar:tAvatar,identity:tIdentity,time_slot:tSlot||"evening"},
        {onConflict:"id"});
      if(upErr) throw upErr;
      if(tJoined.length){
        const {error:mErr}=await supabase.from("memberships")
          .insert(tJoined.map(g=>({user_id:uid,genre_id:g})));
        if(mErr) throw mErr;
      }
      setProfile({username,city:tCity,avatar:tAvatar,email:pendingEmail,joinDate:"April 2025"});
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

  // ── Chat message senders ──
  const makeId=()=>"m"+Date.now()+Math.random().toString(36).slice(2,6);

  const send=()=>{
    if(!msg.trim()||!club)return;
    const m2={id:makeId(),user:profile.username,avatar:profile.avatar,isMe:true,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),type:"text",text:msg.trim(),city:profile.city,spoiler,identity,reactions:{}};
    setMsgs(p=>({...p,[club]:[...(p[club]||[]),m2]}));
    setMsg("");setSpoiler(false);
  };

  const sendMeme=(memeId)=>{
    const m2={id:makeId(),user:profile.username,avatar:profile.avatar,isMe:true,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),type:"meme",memeId,city:profile.city,spoiler:false,identity,reactions:{}};
    setMsgs(p=>({...p,[club]:[...(p[club]||[]),m2]}));
    setAttachOpen(false);
  };

  const sendImage=(imageUrl,caption)=>{
    const m2={id:makeId(),user:profile.username,avatar:profile.avatar,isMe:true,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),type:"image",imageUrl,caption,city:profile.city,spoiler:false,identity,reactions:{}};
    setMsgs(p=>({...p,[club]:[...(p[club]||[]),m2]}));
    setAttachOpen(false);
  };

  const sendPassage=(passage,chapter)=>{
    const m2={id:makeId(),user:profile.username,avatar:profile.avatar,isMe:true,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),type:"passage",passage,chapter,city:profile.city,spoiler:false,identity,reactions:{}};
    setMsgs(p=>({...p,[club]:[...(p[club]||[]),m2]}));
    setAttachOpen(false);
  };

  const addReaction=(msgId,emoji)=>{
    setMsgs(p=>{
      const list=[...(p[club]||[])];
      const idx=list.findIndex(m=>m.id===msgId);
      if(idx<0) return p;
      const m={...list[idx]};
      const reactions={...m.reactions};
      const users=[...(reactions[emoji]||[])];
      const me=profile.username;
      if(users.includes(me)){reactions[emoji]=users.filter(u=>u!==me);if(reactions[emoji].length===0)delete reactions[emoji];}
      else{reactions[emoji]=[...users,me];}
      list[idx]={...m,reactions};
      return {...p,[club]:list};
    });
    setReactionTarget(null);
  };

  const nominate=(gid)=>{
    const t=(nomIn[gid]||"").trim();if(!t)return;
    setNoms(p=>{const list=[...(p[gid]||[])];const ex=list.findIndex(n=>n.title.toLowerCase()===t.toLowerCase());
      if(ex>=0)list[ex]={...list[ex],count:list[ex].count+1};else list.push({title:t,count:1});
      list.sort((a,b)=>b.count-a.count);return {...p,[gid]:list};});
    setNomIn(p=>({...p,[gid]:""}));
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
    setRoomPicker(null);setClub(genreId);
    refreshRooms();
  };

  const sendDM=(toUser,text)=>{
    setDms(p=>({...p,[toUser]:{...(p[toUser]||{avatar:"👤",city:"Local",messages:[]}),messages:[...(p[toUser]?.messages||[]),{from:"you",text,time:"just now",isMe:true,type:"text"}]}}));
  };

  const bgStyle={background:"#0D0A06",minHeight:"100vh",fontFamily:"'Crimson Text',Georgia,serif",color:"#EDE0CE",position:"relative"};
  const cosmicBg=<><Stars count={55}/><CosmicBackground/><div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,background:"radial-gradient(ellipse at 50% 0%,#C4870010 0%,transparent 60%)"}}/></>;

  if(screen==="landing") return <><style>{css}</style><LandingPage onJoin={()=>setScreen("signup")} onSignIn={()=>setScreen("login")} clubLine={clubLine}/></>;

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
                style={{flex:f.ph==="YYYY"?2:1,background:"#1A1208",border:"1px solid #3A2A14",borderRadius:8,padding:"12px 6px",color:"#EDE0CE",fontSize:17,textAlign:"center"}}/>
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
                <select value={tCity} onChange={e=>setTCity(e.target.value)} style={{width:"100%",background:"#1A1208",border:"1px solid #3A2A14",borderRadius:10,padding:"12px 16px",color:"#EDE0CE",fontSize:15}}>
                  {CITIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <button onClick={()=>setObStep(2)} style={{width:"100%",padding:13,borderRadius:30,background:"linear-gradient(135deg,#8A5A00,#C48700)",border:"none",color:"#0D0A06",fontSize:16,fontWeight:"600",cursor:"pointer"}}>Next →</button>
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
  if(profileOpen) return(<><style>{css}</style><div style={{...bgStyle,maxWidth:430,margin:"0 auto",overflowY:"auto",overflow:"hidden"}}>{cosmicBg}<div style={{position:"relative",zIndex:1}}><ProfilePage profile={profile} joined={joined} chapterProg={chapterProg} identity={identity} onBack={()=>setProfileOpen(false)} onLogout={logout}/></div></div></>);
  if(bookPage&&bGenre) return(<><style>{css}</style><div style={{...bgStyle,maxWidth:430,margin:"0 auto",overflowY:"auto",overflow:"hidden"}}>{cosmicBg}<div style={{position:"relative",zIndex:1}}><BookPage genre={bGenre} myChapter={chapterProg[bookPage]||0} onUpdateChapter={(ch)=>setChapterProg(p=>({...p,[bookPage]:ch}))} onBack={()=>setBookPage(null)}/></div></div></>);
  if(dmOpen) return(
    <>
      <style>{css}</style>
      <div style={{...bgStyle,maxWidth:430,margin:"0 auto",display:"flex",flexDirection:"column",height:"100vh",overflow:"hidden"}}>
        {cosmicBg}
        <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          {dmThread?<DMThread username={dmThread} thread={dms[dmThread]} myAvatar={profile?.avatar} onSend={sendDM} onBack={()=>setDmThread(null)}/>:<DMsList dms={dms} onOpenThread={u=>setDmThread(u)} onBack={()=>setDmOpen(false)}/>}
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
        {notifsOpen&&<NotificationsPanel notifs={notifs} onRead={id=>setNotifs(p=>p.map(n=>n.id===id?{...n,read:true}:n))} onReadAll={()=>setNotifs(p=>p.map(n=>({...n,read:true})))} onClose={()=>setNotifsOpen(false)}/>}
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
            <div onClick={()=>setNotifsOpen(true)} style={{position:"relative",cursor:"pointer",width:32,height:32,borderRadius:"50%",background:"#1A1208",border:"1px solid #3A2A14",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>
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
                    <div style={{flex:1,minWidth:0,cursor:"pointer"}} onClick={()=>setClub(g.id)}>
                      <div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontWeight:"600",color:"#F0D9B0",fontSize:15}}>{g.label}</span>{g.manga&&<span style={{fontSize:13,color:"#D4608A",background:"#D4608A18",border:"1px solid #D4608A33",borderRadius:20,padding:"1px 5px"}}>MANGA</span>}{g.mature&&<span style={{fontSize:13,color:"#C2476A",background:"#C2476A18",border:"1px solid #C2476A33",borderRadius:20,padding:"1px 5px"}}>MATURE</span>}</div>
                      <div style={{fontSize:14,color:"#E8B4CC",marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{g.currentBook}</div>
                      <div style={{marginTop:5,height:3,background:"#2A1E0E",borderRadius:2}}><div style={{width:`${Math.round(((chapterProg[g.id]||0)/g.totalChapters)*100)}%`,height:"100%",background:`linear-gradient(90deg,${g.color}55,${g.color})`,borderRadius:2}}/></div>
                      <div style={{fontSize:13,color:"#C490A8",marginTop:2}}>Ch. {chapterProg[g.id]||0}/{g.totalChapters}</div>
                    </div>
                    <div onClick={()=>setClub(g.id)} style={{color:"#B48098",fontSize:20,cursor:"pointer"}}>›</div>
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
          {tab==="home"&&club&&aGenre&&(
            <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 118px)"}}>
              <div style={{padding:"11px 14px",background:"#1A1208cc",borderBottom:"1px solid #2A1E0E",display:"flex",alignItems:"center",gap:10,backdropFilter:"blur(10px)"}}>
                <button onClick={()=>setClub(null)} style={{background:"none",border:"none",color:"#E8B4CC",fontSize:22,cursor:"pointer",padding:0}}>‹</button>
                <span style={{fontSize:20}}>{aGenre.icon}</span>
                <div style={{flex:1}}><div style={{fontWeight:"600",color:"#F0D9B0",fontSize:14}}>{aGenre.label}</div><div style={{fontSize:13,color:"#E8B4CC"}}>{clubLine(aGenre)} · {aGenre.currentBook}</div></div>
                <button onClick={()=>setBookPage(aGenre.id)} style={{background:aGenre.color+"18",border:`1px solid ${aGenre.color}44`,borderRadius:8,padding:"5px 10px",fontSize:13,color:aGenre.color,cursor:"pointer"}}>📖 Book</button>
              </div>

              <div style={{flex:1,overflowY:"auto",padding:"14px 13px 6px"}}>
                {(msgs[club]||[]).map((m2)=>(
                  <div key={m2.id} className="msg-bubble" style={{marginBottom:14,display:"flex",gap:10,alignItems:"flex-start",flexDirection:m2.isMe?"row-reverse":"row",position:"relative"}}>
                    <div style={{width:34,height:34,borderRadius:"50%",background:"#231A0A",border:`1px solid ${aGenre.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{m2.avatar}</div>
                    <div style={{maxWidth:"75%"}}>
                      {!m2.isMe&&(
                        <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:4,flexWrap:"wrap"}}>
                          <span style={{fontSize:14,fontWeight:"600",color:aGenre.color,cursor:"pointer"}} onClick={()=>{setDmThread(m2.user);setDmOpen(true);}}>{m2.user}</span>
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
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  {/* Attachment button */}
                  <button onClick={()=>setAttachOpen(true)} style={{width:40,height:40,borderRadius:"50%",background:"#1A1208",border:`1px solid ${aGenre.color}44`,color:aGenre.color,fontSize:18,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    📎
                  </button>
                  <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Share your thoughts..." style={{flex:1,background:"#1A1208",border:"1px solid #3A2A14",borderRadius:20,padding:"10px 16px",color:"#EDE0CE",fontSize:14}}/>
                  <button onClick={send} style={{width:40,height:40,borderRadius:"50%",background:aGenre.color,border:"none",color:"white",fontSize:16,cursor:"pointer",flexShrink:0}}>↑</button>
                </div>
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
                  <div style={{fontSize:14,color:"#E8B4CC",fontStyle:"italic"}}>Now reading: <span style={{color:"#C4A060"}}>{g.currentBook}</span> · {g.author}</div>
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
                    {mq&&(<div style={{background:"#231A0A",borderRadius:12,padding:"13px 14px",marginBottom:14,border:"1px solid #3A2A14"}}><div style={{fontSize:13,letterSpacing:2,color:"#E8B4CC",textTransform:"uppercase",marginBottom:6}}>📋 Monthly Survey</div><div style={{fontSize:13,color:"#C4A060",fontStyle:"italic",marginBottom:10}}>{mq.q}</div><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{mq.opts.map(opt=><button key={opt} onClick={()=>setSurvVote(p=>({...p,[g.id]:opt}))} style={{background:sv===opt?g.color+"22":"#1A1208",border:`1px solid ${sv===opt?g.color:"#C490A8"}`,borderRadius:20,padding:"5px 12px",fontSize:13,color:sv===opt?g.color:"#E8B4CC",cursor:"pointer",transition:"all 0.2s"}}>{sv===opt?"✓ ":""}{opt}</button>)}</div>{sv&&<div style={{fontSize:13,color:"#D4A0B8",marginTop:8,fontStyle:"italic"}}>Your answer: {sv} ✓</div>}</div>)}
                    <div style={{fontSize:13,letterSpacing:2,color:"#E8B4CC",textTransform:"uppercase",marginBottom:8}}>🗳️ Vote for Next Read</div>
                    {top3.length===0&&<div style={{fontSize:14,color:"#C490A8",fontStyle:"italic",marginBottom:10}}>No nominations yet — be the first!</div>}
                    {top3.map((n,i)=>(<div key={n.title} onClick={()=>setBookVote(p=>({...p,[g.id]:n.title}))} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:10,marginBottom:7,cursor:"pointer",background:bv===n.title?g.color+"18":"#231A0A",border:`1px solid ${bv===n.title?g.color:"#C490A8"}`,transition:"all 0.2s"}}><div style={{width:22,height:22,borderRadius:"50%",background:g.color+"28",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:g.color,fontWeight:"bold",flexShrink:0}}>#{i+1}</div><div style={{flex:1,fontSize:13,color:"#EDE0CE"}}>{n.title}</div><div style={{fontSize:13,color:"#E8B4CC"}}>{n.count} nom{n.count!==1?"s":""}</div>{bv===n.title&&<div style={{color:g.color}}>✓</div>}</div>))}
                    {bv&&<div style={{fontSize:13,color:"#D4A0B8",fontStyle:"italic",marginBottom:10}}>Your vote: {bv} ✓</div>}
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

              {/* Custom amount */}
              <div style={{background:"#1A120888",border:"1px solid #3A2A14",borderRadius:14,padding:"14px 16px",marginBottom:20,backdropFilter:"blur(8px)"}}>
                <div style={{fontSize:13,color:"#D4A0B8",marginBottom:10}}>💫 Custom amount</div>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <div style={{fontSize:18,color:"#C48700"}}>$</div>
                  <input placeholder="Enter any amount..." style={{flex:1,background:"#0D0A06",border:"1px solid #3A2A14",borderRadius:10,padding:"10px 14px",color:"#EDE0CE",fontSize:14}}/>
                  <button style={{background:"linear-gradient(135deg,#8A5A00,#C48700)",border:"none",borderRadius:10,padding:"10px 16px",color:"#0D0A06",fontSize:13,fontWeight:"600",cursor:"pointer"}}>Tip →</button>
                </div>
              </div>

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
