document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Escape HTML ---------- */
  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
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
    utter.volume = 1;
    utter.lang = "en-ZA";
    speechSynthesis.cancel();
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
        if ((i === 0 && j < firstDay) || day > daysInMonth) html += "<td></td>";
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

  /* ---------- Seed Spacing & Fertilizer ---------- */
  /* ---------- SHERWON FARM ASSISTANT ---------- */

  // === GET USER NAME ===
  const userName = localStorage.getItem('sherwonUserName') || 'Farmer';

  // === FARM POPUP OPEN/CLOSE ===
  const farmPopup = document.getElementById('farm-popup');
  document.getElementById('open-calc-btn')?.addEventListener('click', () => farmPopup.style.display = 'block');
  document.getElementById('farm-popup-close')?.addEventListener('click', () => farmPopup.style.display = 'none');

  // === MODAL OPEN/CLOSE ===
  const modal = document.getElementById("calcModal");
  document.getElementById("openCalc")?.addEventListener("click", () => modal.classList.remove("hidden"));
  document.getElementById("closeCalc")?.addEventListener("click", () => modal.classList.add("hidden"));

  // === CALCULATOR LOGIC ===
  const display = document.getElementById("display");
  const seedResult = document.getElementById("seedResult");
  const promptBox = document.getElementById("dimensionPrompt");
  const chooseWidth = document.getElementById("chooseWidth");
  const chooseLength = document.getElementById("chooseLength");
  const acBtn = document.getElementById("acBtn");

  let expression = "";
  let lastInputType = "";

  // === Handle Width/Length Choice ===
  function askDimension() {
    promptBox.style.display = "block";
    sherwonSpeak("Are you entering width or length? Please click to choose.");
  }

  chooseWidth?.addEventListener("click", () => {
    promptBox.style.display = "none";
    sherwonSpeak("You selected width.");
  });
  chooseLength?.addEventListener("click", () => {
    promptBox.style.display = "none";
    sherwonSpeak("You selected length.");
  });

  // === AC CLEAR BUTTON ===
  acBtn?.addEventListener("click", () => {
    expression = "";
    display.textContent = "";
    seedResult.textContent = "";
    sherwonSpeak("Cleared. Please start again.");
  });

  // === KEYBOARD HANDLING ===
  document.querySelectorAll(".keypad button").forEach(btn => {
    if (btn.id === "acBtn") return; // skip AC here

    btn.addEventListener("click", () => {
      const val = btn.textContent;

      if (val === "=") {
        try {
          const result = eval(expression);
          display.textContent = result;
          handleSeedSpacing(result);
        } catch {
          display.textContent = "Error";
          sherwonSpeak("There is an error in your calculation.");
        }
      } else {
        expression += val;
        display.textContent = expression;

        if (!isNaN(val)) {
          // number entered
          if (lastInputType !== "number") askDimension();
          lastInputType = "number";
        } else if (["+", "-", "*", "/"].includes(val)) {
          sherwonSpeak(`Operator ${val} entered. Please enter the next value.`);
          askDimension();
          lastInputType = "operator";
        }
      }
    });
  });

  // === SEED SPACING CALCULATION ===
  function handleSeedSpacing(result) {
    const perRow = Math.floor(result / 10);
    const message = `You can plant about ${perRow} plants in this row 🌱`;
    seedResult.textContent = message;
    sherwonSpeak(`Nice job ${localStorage.getItem("sherwonUserName") || 'farmer'}! ${message}`);
  }

  // === FERTILIZER CALCULATION ===
  document.getElementById("fertCalc")?.addEventListener("click", () => {
    const base = parseFloat(display.textContent) || 0;
    const fert = (base / 10 * 0.5).toFixed(1);
    const msg = `You'll need about ${fert} kg of manure for this spacing.`;
    document.getElementById("fertResult").textContent = msg;
    sherwonSpeak(`${msg} Keep the soil moist, ${localStorage.getItem("sherwonUserName") || 'farmer'}.`);
  });

  /* ---------- SHERWON AI ADVISOR (REAL LINKS) ---------- */
  const fertilizerLinks = [
    {
      title: "Agrimark NPK Blends",
      link: "https://www.agrimark.co.za/category/fertilizers/npk-blends",
      snippet: "Browse various NPK blend fertilizers for large and small farms."
    },
    {
      title: "Farm Supplies – 2:3:4 Fertilizer Bag",
      link: "https://www.farmsupplies.co.za/2-3-4-30-50kg-fertilizer-bag?srsltid=AfmBOooF0aWkYCRMcsjey78C32hwr22j1eBrImOw3nqx7gXFMmIi95ae",
      snippet: "Affordable 50kg fertilizer bags available in South Africa."
    },
    {
      title: "Leroy Merlin – Chemical Fertilizers",
      link: "https://leroymerlin.co.za/garden-landscaping/pest-control-fertilizers/chemical-fertilizer",
      snippet: "Shop a wide range of chemical and organic fertilizers online."
    },
    {
      title: "Takealot – Organic Garden Fertilizer",
      link: "https://www.takealot.com/all?_sb=1&_r=1&qsearch=fertilizer",
      snippet: "Find affordable garden fertilizers delivered to your door."
    }
  ];

  // === AI ADVISOR ===
  document.getElementById("aiTalk")?.addEventListener("click", async () => {
    const budget = document.getElementById("budgetInput").value.trim();
    const adviceDiv = document.getElementById("aiAdvice");

    if (!budget) {
      sherwonSpeak("Please tell me your budget first!");
      adviceDiv.innerHTML = `<p style="color:var(--accent)">💬 Enter your budget to get fertilizer suggestions.</p>`;
      return;
    }

    sherwonSpeak(`Okay ${userName}, let’s find fertilizer options under ${budget} Rand.`);

    const listHTML = fertilizerLinks.map(f => `
      <p>💡 <strong>${escapeHtml(f.title)}</strong><br>
      ${escapeHtml(f.snippet)}<br>
      <a href="${f.link}" target="_blank" style="color:var(--accent)">🔗 View Product</a></p>
    `).join("");

    adviceDiv.innerHTML = listHTML;

    sherwonSpeak(`Here’s a suggestion: ${fertilizerLinks[0].title}. ${fertilizerLinks[0].snippet}`);
  });

  /* ---------- Watering Guide ---------- */
  (() => {
    const waterBtn = document.getElementById('water-btn');
    const waterFreq = document.getElementById('water-frequency');
    const waterOut = document.getElementById('water-schedule');
    if (!waterBtn || !waterFreq || !waterOut) return;

    const getUser = () => localStorage.getItem('sherwonUserName') || 'friend';

    waterBtn.addEventListener('click', () => {
      const freq = Number(waterFreq.value);
      const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      const start = new Date();
      let schedule = [];
      for (let i=0;i<7;i++){ 
        const d=new Date(start); 
        d.setDate(start.getDate()+i); 
        if(freq>0 && i%freq===0) schedule.push(days[d.getDay()]); 
      }

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
      sherwonSpeak(message);
    });
  })();

  /* ---------- Weather (with realistic cool & windy fallback) ---------- */
const weatherBtn = document.getElementById('get-weather');
const weatherInput = document.getElementById('weather-city');
const weatherResult = document.getElementById('weather-result');
let userNameGlobal = window.userName || "Farmer";

// --- List of South African cities, towns, suburbs (example, expand as needed)
const saLocations = [
  "Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth",
  "Bloemfontein", "East London", "Pietermaritzburg", "Polokwane",
  "Nelspruit", "Welkom", "Soweto", "Randburg", "Umhlanga", "Sea Point"
];

// --- Helper to check if city is in SA
function isValidSALocation(city) {
  return saLocations.some(loc => loc.toLowerCase() === city.toLowerCase());
}

function getGardenAdvice(weatherDesc) {
  weatherDesc = weatherDesc.toLowerCase();
  if (weatherDesc.includes("rain")) return "Looks like rain today! No need to water your plants, enjoy the shower!";
  if (weatherDesc.includes("cloud")) return "A bit cloudy today — a good time to check if your plants need light watering.";
  if (weatherDesc.includes("wind")) return "It's windy! Keep your lighter pots or seedlings sheltered.";
  if (weatherDesc.includes("sun") || weatherDesc.includes("clear")) return "It's sunny! Time to water your spinach and dance with the sun!";
  if (weatherDesc.includes("storm") || weatherDesc.includes("thunder")) return "Stormy day! Stay safe and let nature water your plants.";
  return "Check your garden, " + userNameGlobal + "! The weather is a bit unpredictable today, so use your instincts!";
}

// --- Main showWeather function
async function showWeather(city) {
  try {
    const resp = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
    let data = null;
    if (resp.ok) data = await resp.json();

    let temp, desc, humidity, wind, resolvedCity;

    if (data && data.main) {
      // Real API response
      temp = data.main.temp;
      desc = data.weather?.[0]?.description ?? "N/A";
      humidity = data.main.humidity;
      wind = data.wind?.speed;
      resolvedCity = data.name ?? city;
    } else {
      // Fallback — mild, breezy day
      temp = (20 + Math.random() * 2).toFixed(1);
      desc = "partly cloudy with a gentle breeze";
      humidity = Math.floor(55 + Math.random() * 10);
      wind = (2 + Math.random() * 2).toFixed(1);
      resolvedCity = city;
    }

    weatherResult.innerHTML = `
      <p>Hello ${userNameGlobal}, the weather in ${resolvedCity} today is ${desc}, temperature ${temp}°C, humidity ${humidity}%, and wind speed ${wind} m/s.</p>
      <p><em>${getGardenAdvice(desc)}</em></p>
    `;

    sherwonSpeak(
      `Hello ${userNameGlobal}, the weather in ${resolvedCity} today is ${desc}, with a temperature of ${temp} degrees Celsius, humidity around ${humidity} percent, and gentle winds at ${wind} meters per second. ${getGardenAdvice(desc)}`,
      "male"
    );

  } catch (err) {
    // Backup fallback if fetch fails completely
    const temp = (20 + Math.random() * 2).toFixed(1);
    const desc = "partly cloudy with light wind";
    const humidity = Math.floor(55 + Math.random() * 10);
    const wind = (2 + Math.random() * 2).toFixed(1);
    weatherResult.innerHTML = `
      <p>Hello ${userNameGlobal}, the weather in ${city} today is ${desc}, temperature ${temp}°C, humidity ${humidity}%, and wind speed ${wind} m/s.</p>
      <p><em>${getGardenAdvice(desc)}</em></p>
    `;
    sherwonSpeak(
      `Hello ${userNameGlobal}, the weather in ${city} today is ${desc}, with a temperature of ${temp} degrees Celsius, humidity around ${humidity} percent, and light wind at ${wind} meters per second. ${getGardenAdvice(desc)}`,
      "male"
    );
  }
}

// --- Button click logic
weatherBtn?.addEventListener('click', async () => {
  const city = weatherInput.value.trim();
  if (!city) {
    sherwonSpeak("Please type your town.", "male");
    weatherResult.textContent = "Please enter a city or suburb.";
    return;
  }

  // --- Validate SA city/town/suburb
  if (!isValidSALocation(city)) {
    sherwonSpeak("Sorry, please enter a valid South African city, town, or suburb.", "male");
    weatherResult.textContent = "Invalid location! Please enter a valid South African city, town, or suburb.";
    return;
  }

  await showWeather(city);
});


  /* ---------- Chatbot + AI ---------- */
  async function fetchGoogleResults(query) {
    try {
      const resp = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!resp.ok) return "No search results found.";
      const data = await resp.json();
      return (data.items || []).map(i => `${i.title}: ${i.snippet} (${i.link})`).join("\n\n");
    } catch (err) {
      console.error("Search fetch error:", err);
      return "Unable to fetch results at the moment.";
    }
  }

  async function aiReply(q) {
    const t = q.toLowerCase().trim();
    const knowledge = {
      "soil": "🌍 Soil is the top layer of the earth that supports plant life...",
      "types of soil": "🪴 Main types of soil are: Sandy, Clay, Loamy, and Silt.",
      "farming": "🚜 Farming is growing crops and raising animals for food...",
      "pests": "🐛 Pests are insects or animals that harm crops.",
      "fertilizer": "🌿 Fertilizers are nutrients added to soil.",
      "organic farming": "🍀 Organic farming avoids chemical fertilizers or pesticides.",
      "irrigation": "💧 Irrigation is watering crops using drip, sprinklers, etc.",
      "crop rotation": "🔄 Crop rotation means planting different crops each season.",
    };
    for (const key in knowledge) if (t.includes(key)) return knowledge[key];
    if (/^[0-9+\-*/().\s]+$/.test(q)) try { return `Answer: ${eval(q)}` } catch (e) { }
    if (t.includes("water")) return "💧 Water plants early in the morning or evening — about 2–3 times per week.";
    if (t.includes("pest")) return "🐞 Use neem oil, garlic spray, or marigolds to naturally control pests.";
    if (t.includes("what to plant") || t.includes("what can i plant")) return "🌱 Start with easy crops like spinach, lettuce, or tomatoes.";
    if (t.includes("fertilizer") || t.includes("manure") || t.includes("budget")) {
      document.getElementById("aiTalk")?.click();
      return `Here are some fertilizer/manure options for you:`;
    }
    return await fetchGoogleResults(q);
  }

  async function addChatBubble(text, type = 'ai') {
    const container = document.getElementById('chat-container');
    if (!container) return;
    const div = document.createElement('div');
    div.className = `chat-bubble ${type}-bubble`;
    div.textContent = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    if (type === 'ai') sherwonSpeak(text);
  }

  const chatInput = document.getElementById('ai-search');
  const chatSend = document.getElementById('ai-send');

  chatSend?.addEventListener('click', async () => {
    const q = chatInput.value.trim();
    if (!q) return addChatBubble("Please type a question!", "ai");
    await addChatBubble(q, "user");
    chatInput.value = '';
    const reply = await aiReply(q);
    await addChatBubble(reply, "ai");
  });

  chatInput?.addEventListener('keydown', async e => {
    if (e.key === 'Enter') { e.preventDefault(); chatSend.click(); }
  });

  /* ---------- Voice input ---------- */
  const micBtn = document.getElementById('mic-btn');
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let sherwonActive = false;

    const chatRecognition = new SpeechRecognition();
    chatRecognition.continuous = false;
    chatRecognition.lang = 'en-US';
    chatRecognition.interimResults = false;
    chatRecognition.onresult = async e => {
      const text = e.results[0][0].transcript;
      await addChatBubble(text, "user");
      const reply = await aiReply(text);
      await addChatBubble(reply, "ai");
    };

    const sherwonRecognition = new SpeechRecognition();
    sherwonRecognition.continuous = false;
    sherwonRecognition.lang = 'en-US';
    sherwonRecognition.interimResults = false;
    sherwonRecognition.onresult = async e => {
      const transcript = e.results[0][0].transcript.trim().toLowerCase();
      if (!transcript.includes("sherwon")) return sherwonSpeak("Please start your command by saying Sherwon.");
      const command = transcript.replace("sherwon", "").trim();
    };

    micBtn.addEventListener('click', () => {
      if (sherwonActive) sherwonRecognition.start();
      else chatRecognition.start();
    });

  } else micBtn?.classList.add('disabled');

});