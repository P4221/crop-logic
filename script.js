document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Escape HTML ---------- */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /* ---------- Daily Tips & Motivation ---------- */
  const tips = [
    '💧 Water early in the morning to reduce evaporation.',
    '🌱 Mulch keeps soil cool and reduces water loss.',
    '🔄 Rotate crops yearly to prevent soil pests.',
    '🐞 Encourage ladybugs to control aphids naturally.',
    '🕶 Shade young seedlings during hot noon sun.'
  ];
  const motivations = [
    'Like a plant, you grow stronger every day you learn.',
    'Small seeds, big dreams — keep tending your ideas.',
    'A healthy garden grows a healthy mind.'
  ];

  const tipEl = document.getElementById('daily-tip');
  const motEl = document.getElementById('daily-motivation');

  if (tipEl) tipEl.textContent = localStorage.getItem('override-tip') || tips[new Date().getDate() % tips.length];
  if (motEl) motEl.textContent = motivations[new Date().getDate() % motivations.length];

  /* ---------- Smooth Scroll ---------- */
  document.querySelectorAll('[data-scroll]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.scroll;
      const target = document.querySelector(id);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ---------- Sherwon AI Voice ---------- */
  let cachedVoices = [];
  function sherwonSpeak(text, gender = "neutral") {
    if (!speechSynthesis) return;
    const utter = new SpeechSynthesisUtterance(text);
    if (!cachedVoices.length) cachedVoices = speechSynthesis.getVoices();
    let chosenVoice = cachedVoices[0];

    if (gender === "male") chosenVoice = cachedVoices.find(v => v.name.toLowerCase().includes("male")) || cachedVoices[0];
    else if (gender === "female") chosenVoice = cachedVoices.find(v => v.name.toLowerCase().includes("female")) || cachedVoices[0];

    utter.voice = chosenVoice;
    utter.rate = 1;
    utter.pitch = 1;
    speechSynthesis.speak(utter);
  }

  /* ---------- Tasks + Calendar ---------- */
  const tasksEl = document.getElementById('tasks');
  const taskInput = document.getElementById('task-input');
  const taskDate = document.getElementById('task-date');
  const calendarEl = document.getElementById('calendar');

  function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('sg-tasks') || '[]');
    tasksEl.innerHTML = '';
    tasks.forEach((t, i) => {
      const li = document.createElement('li');
      li.innerHTML = `<label>
        <input type="checkbox" data-i="${i}" ${t.done ? 'checked' : ''}/> 
        ${escapeHtml(t.text)} <small style="color:#9ca3af;">(${t.date})</small>
        <button data-del="${i}" class="small-del">✖</button>
      </label>`;
      tasksEl.appendChild(li);
    });
    renderCalendar();
  }

  function saveTaskList(list) {
    localStorage.setItem('sg-tasks', JSON.stringify(list));
    loadTasks();
  }

  document.getElementById('add-task')?.addEventListener('click', () => {
    const v = taskInput.value.trim();
    const d = taskDate.value;
    if (!v || !d) return alert('Please enter a task and choose a date.');
    const list = JSON.parse(localStorage.getItem('sg-tasks') || '[]');
    list.push({ text: v, date: d, done: false });
    saveTaskList(list);
    taskInput.value = '';
    taskDate.value = '';
  });

  document.getElementById('clear-tasks')?.addEventListener('click', () => {
    if (confirm('Clear all tasks?')) {
      localStorage.removeItem('sg-tasks');
      loadTasks();
    }
  });

  tasksEl?.addEventListener('click', e => {
    if (e.target.dataset.del !== undefined) {
      const i = +e.target.dataset.del;
      const list = JSON.parse(localStorage.getItem('sg-tasks') || '[]');
      list.splice(i, 1);
      saveTaskList(list);
    }
  });

  tasksEl?.addEventListener('change', e => {
    if (e.target.matches('input[type=checkbox]')) {
      const i = +e.target.dataset.i;
      const list = JSON.parse(localStorage.getItem('sg-tasks') || '[]');
      if (list[i]) {
        list[i].done = e.target.checked;
        saveTaskList(list);
      }
    }
  });

  /* ---------- Calendar ---------- */
  function renderCalendar() {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const tasks = JSON.parse(localStorage.getItem('sg-tasks') || '[]');
    const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

    let html = `<h4 style="color:#16a34a; margin-top:10px;">${monthNames[month]} ${year}</h4>`;
    html += `<table style="width:100%; border-collapse:collapse; color:#e2e8f0;">
              <tr style="color:#16a34a;"><th>Sun</th><th>Mon</th><th>Tue</th>
              <th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th></tr><tr>`;

    let day = 1;
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDay || day > daysInMonth) html += "<td></td>";
        else {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const hasTask = tasks.some(t => t.date === dateStr);
          html += `<td data-date="${dateStr}" style="padding:6px; text-align:center; border:1px solid #14532d; cursor:pointer;
                   ${hasTask ? 'background:#14532d; color:#22c55e;' : ''}">${day}</td>`;
          day++;
        }
      }
      html += "</tr>";
      if (day > daysInMonth) break;
    }
    html += "</table>";
    calendarEl.innerHTML = html;

    calendarEl.querySelectorAll("td[data-date]").forEach(td => {
      td.addEventListener("click", () => {
        const dateStr = td.dataset.date;
        const dayTasks = tasks.filter(t => t.date === dateStr);
        const message = dayTasks.length
          ? `You have ${dayTasks.length} task${dayTasks.length > 1 ? 's' : ''} for ${dateStr}: ${dayTasks.map(t=>t.text).join(', ')}`
          : `No tasks for ${dateStr}`;
        alert(message);
        sherwonSpeak(message, dayTasks.length ? "male" : "neutral");
      });
    });
  }

  loadTasks();

  /* ---------- Seed Spacing ---------- */
  document.getElementById('calc-btn')?.addEventListener('click', () => {
    const bw = Number(document.getElementById('bed-width')?.value || 0);
    const sp = Number(document.getElementById('spacing')?.value || 0);
    const out = document.getElementById('calc-result');
    if (!out) return;

    if (bw <= 0 || sp <= 0) {
      out.textContent = 'Enter positive numbers 🌾';
      sherwonSpeak("Oops! I think you forgot to tell me how wide your bed or spacing is!", "funny");
      return;
    }

    const perRow = Math.floor(bw / sp);
    const leftover = (bw % sp).toFixed(1);
    const baseMessage = `≈ ${perRow} plants per row (about ${leftover} cm left over).`;

    let funnyReply = "";
    if (perRow === 0) funnyReply = "Whoa! That’s too narrow for any plant — even a micro spinach would say ‘nope!’";
    else if (perRow < 3) funnyReply = "Nice and roomy — your plants can stretch their roots like yoga masters!";
    else if (perRow < 6) funnyReply = "Perfect balance — not too crowded, not too lonely. A happy veggie community!";
    else if (perRow < 10) funnyReply = "That’s a strong planting zone! Your veggies might start a union!";
    else funnyReply = "Whoa! That’s a whole plant party! Even the worms will need a VIP pass!";

    out.innerHTML = `<strong>${baseMessage}</strong><br>${funnyReply}`;
    sherwonSpeak(`${baseMessage} ${funnyReply}`, "funny");
  });

  /* ---------- Watering Guide ---------- */
  (() => {
    const waterBtn = document.getElementById('water-btn');
    const waterFreq = document.getElementById('water-frequency');
    const waterOut = document.getElementById('water-schedule');
    if (!waterBtn || !waterFreq || !waterOut) return;

    const getUser = () => localStorage.getItem('sherwonUserName') || 'friend';
    const speakText = (text, rate=1, pitch=0.9) => { 
      if (!speechSynthesis) return;
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = rate;
      utter.pitch = pitch;
      utter.volume = 1;
      utter.voice = speechSynthesis.getVoices()[0];
      speechSynthesis.cancel();
      setTimeout(()=>speechSynthesis.speak(utter), 300);
    };

    waterBtn.addEventListener('click', () => {
      const freq = Number(waterFreq.value);
      const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      const start = new Date();
      let schedule = [];
      for (let i=0;i<7;i++){ const d=new Date(start); d.setDate(start.getDate()+i); if(freq>0 && i%freq===0) schedule.push(days[d.getDay()]); }

      waterOut.textContent = schedule.length ? '💧 Water on: '+schedule.join(', ') : 'Please select a valid watering frequency.';

      const username = getUser();
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes().toString().padStart(2,'0');
      const ampm = hour>=12?'PM':'AM';
      const timeNow = `${hour%12||12}:${minute} ${ampm}`;

      let message = `Hey ${username}! It's ${timeNow}. `;
      if(schedule.length>0) message += `You should water every ${freq} day${freq>1?'s':''}. This week: ${schedule.join(', ')}. `;
      else message += `Oops, ${username}, you forgot to choose your watering frequency! `;

      const funnyLines = [
        "Don't let your spinach faint — it's screaming for water!",
        "Your plants are giving you the side-eye... better grab that watering can!",
        "C'mon gardener, time to hydrate your green babies before they gossip about you!",
        "Your spinach just tweeted: ‘Bro, we’re dry out here!’ 😂"
      ];

      message += funnyLines[Math.floor(Math.random()*funnyLines.length)];
      speakText(message,1,1);
    });
  })();

  /* ---------- Weather (via backend) ---------- */
  const weatherBtn = document.getElementById('get-weather');
  const weatherInput = document.getElementById('weather-city');
  const weatherResult = document.getElementById('weather-result');
  let userNameGlobal = window.userName || "Farmer";

  function getGardenAdvice(weatherDesc){
    weatherDesc = weatherDesc.toLowerCase();
    if(weatherDesc.includes("rain")) return "Looks like rain today! No need to water your plants, enjoy the shower!";
    if(weatherDesc.includes("cloud")) return "Cloudy day! Maybe water your garden a little if the soil feels dry.";
    if(weatherDesc.includes("sun")||weatherDesc.includes("clear")) return "It's sunny! Time to water your spinach and dance with the sun!";
    if(weatherDesc.includes("storm")||weatherDesc.includes("thunder")) return "Stormy day! Stay safe and let nature water your plants.";
    return "Check your garden, "+userNameGlobal+"! The weather is tricky today, use your gardening instincts!";
  }

  async function fetchWeather(city){
    try{
      const resp = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
      if(!resp.ok) throw new Error('City not found');
      return await resp.json();
    }catch(e){console.error(e); return null;}
  }

  async function showWeather(city){
    const data = await fetchWeather(city);
    if(!data){ weatherResult.textContent="Sorry, couldn't find that town."; sherwonSpeak("Oops "+userNameGlobal+", I couldn't find "+city,"male"); return; }
    const temp = data.main.temp;
    const desc = data.weather[0].description;
    const humidity = data.main.humidity;
    const wind = data.wind.speed;
    weatherResult.innerHTML = `<p>Hello ${userNameGlobal}, the weather in ${city} today is ${desc}, temperature ${temp}°C, humidity ${humidity}%, wind speed ${wind} m/s.</p>
                               <p><em>${getGardenAdvice(desc)}</em></p>`;
    sherwonSpeak(`Hello ${userNameGlobal}, the weather in ${city} today is ${desc}, temperature ${temp}°C, humidity ${humidity}%, wind speed ${wind} m/s. ${getGardenAdvice(desc)}`, "male");
  }

  weatherBtn?.addEventListener('click', async ()=>{
    let city = weatherInput.value.trim();
    if(!city){
      const SpeechRecognition = window.SpeechRecognition||window.webkitSpeechRecognition;
      if(!SpeechRecognition) return sherwonSpeak("Sorry, voice recognition not supported.","male");
      sherwonSpeak("Hey "+userNameGlobal+", please say your town now.","male");
      const recognition = new SpeechRecognition();
      recognition.lang = "en-ZA";
      recognition.interimResults=false;
      recognition.maxAlternatives=1;
      recognition.onresult=async e=>{
        city = e.results[0][0].transcript;
        weatherInput.value = city;
        await showWeather(city);
      };
      recognition.onerror=()=>sherwonSpeak("Sorry, I didn't catch that, try typing your town.","male");
      recognition.start();
    }else await showWeather(city);
  });

  /* ---------- Chatbot + AI ---------- */
  async function fetchGoogleResults(query){
    try{
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if(!res.ok) throw new Error("Search failed");
      const data = await res.json();
      return data.snippet || "No results found.";
    }catch(e){return "Could not fetch info.";}
  }

  async function aiReply(q){
    const t = q.toLowerCase().trim();
    const knowledge = {
      "soil":"🌍 Soil is the top layer of the earth that supports plant life...",
      "types of soil":"🪴 Main types of soil are: Sandy, Clay, Loamy, and Silt.",
      "farming":"🚜 Farming is growing crops and raising animals for food...",
      "pests":"🐛 Pests are insects or animals that harm crops.",
      "fertilizer":"🌿 Fertilizers are nutrients added to soil.",
      "organic farming":"🍀 Organic farming avoids chemical fertilizers or pesticides.",
      "irrigation":"💧 Irrigation is watering crops using drip, sprinklers, etc.",
      "crop rotation":"🔄 Crop rotation means planting different crops each season.",
    };
    for(const key in knowledge) if(t.includes(key)) return knowledge[key];
    if(/^[0-9+\-*/().\s]+$/.test(q)) try{return `Answer: ${eval(q)}`}catch(e){}
    if(t.includes("water")) return "💧 Water plants early in the morning or evening — about 2–3 times per week.";
    if(t.includes("pest")) return "🐞 Use neem oil, garlic spray, or marigolds to naturally control pests.";
    if(t.includes("what to plant")||t.includes("what can i plant")) return "🌱 Start with easy crops like spinach, lettuce, or tomatoes.";
    return await fetchGoogleResults(q);
  }

  async function addChatBubble(text,type='ai'){
    const container=document.getElementById('chat-container');
    if(!container) return;
    const div=document.createElement('div');
    div.className=`chat-bubble ${type}-bubble`;
    div.textContent=text;
    container.appendChild(div);
    container.scrollTop=container.scrollHeight;
    if(type==='ai') speechSynthesis?.speak(new SpeechSynthesisUtterance(text));
  }

  const chatInput=document.getElementById('ai-search');
  const chatSend=document.getElementById('ai-send');

  chatSend?.addEventListener('click',async ()=>{
    const q=chatInput.value.trim();
    if(!q) return addChatBubble("Please type a question!","ai");
    await addChatBubble(q,"user");
    chatInput.value='';
    const reply=await aiReply(q);
    await addChatBubble(reply,"ai");
  });

  chatInput?.addEventListener('keydown', async e=>{
    if(e.key==='Enter'){e.preventDefault(); chatSend.click();}
  });

  /* ---------- Voice input ---------- */
  const micBtn=document.getElementById('mic-btn');
  if('webkitSpeechRecognition' in window || 'SpeechRecognition' in window){
    const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
    let sherwonActive=false;

    const chatRecognition=new SpeechRecognition();
    chatRecognition.continuous=false;
    chatRecognition.lang='en-US';
    chatRecognition.interimResults=false;
    chatRecognition.onresult=async e=>{
      const text=e.results[0][0].transcript;
      await addChatBubble(text,"user");
      const reply=await aiReply(text);
      await addChatBubble(reply,"ai");
    };

    const sherwonRecognition=new SpeechRecognition();
    sherwonRecognition.continuous=false;
    sherwonRecognition.lang='en-US';
    sherwonRecognition.interimResults=false;
    sherwonRecognition.onresult=async e=>{
      const transcript=e.results[0][0].transcript.trim().toLowerCase();
      if(!transcript.includes("sherwon")) return sherwonSpeak("Please start your command by saying Sherwon.");
      const command=transcript.replace("sherwon","").trim();
      // future Sherwon commands here
    };

    micBtn.addEventListener('click',()=>{
      if(sherwonActive) sherwonRecognition.start();
      else chatRecognition.start();
    });

  } else micBtn?.classList.add('disabled');

});
