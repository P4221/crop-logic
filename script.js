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
  function sherwonSpeak(text, gender = "neutral") {
    const utter = new SpeechSynthesisUtterance(text);
    const voices = speechSynthesis.getVoices();
    let chosenVoice;

    if (gender === "male") {
      chosenVoice = voices.find(v => v.name.toLowerCase().includes("male")) || voices[0];
    } else if (gender === "female") {
      chosenVoice = voices.find(v => v.name.toLowerCase().includes("female")) || voices[0];
    } else {
      chosenVoice = voices[0];
    }

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

  function renderCalendar() {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const tasks = JSON.parse(localStorage.getItem('sg-tasks') || '[]');

    const monthNames = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ];

    let html = `<h4 style="color:#16a34a; margin-top:10px;">${monthNames[month]} ${year}</h4>`;
    html += `<table style="width:100%; border-collapse:collapse; color:#e2e8f0;">
      <tr style="color:#16a34a;">
        <th>Sun</th><th>Mon</th><th>Tue</th>
        <th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th>
      </tr><tr>`;

    let day = 1;
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDay) {
          html += "<td></td>";
        } else if (day > daysInMonth) {
          html += "<td></td>";
        } else {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const hasTask = tasks.some(t => t.date === dateStr);
          html += `<td data-date="${dateStr}" style="padding:6px; text-align:center; border:1px solid #14532d; cursor:pointer; ${hasTask ? 'background:#14532d; color:#22c55e;' : ''}">${day}</td>`;
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
        if (dayTasks.length) {
          const taskList = dayTasks.map(t => t.text).join(', ');
          const message = `You have ${dayTasks.length} task${dayTasks.length > 1 ? 's' : ''} for ${dateStr}: ${taskList}`;
          alert(message);
          sherwonSpeak(message, "male");
        } else {
          const message = `No tasks for ${dateStr}`;
          alert(message);
          sherwonSpeak(message, "neutral");
        }
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
    if (perRow === 0) funnyReply = "Whoa! That’s too narrow for any plant!";
    else if (perRow < 3) funnyReply = "Nice and roomy — your plants can stretch!";
    else if (perRow < 6) funnyReply = "Perfect balance — a happy veggie community!";
    else if (perRow < 10) funnyReply = "That’s a strong planting zone!";
    else funnyReply = "Whoa! That’s a whole plant party!";

    out.innerHTML = `<strong>${baseMessage}</strong><br>${funnyReply}`;
    sherwonSpeak(`${baseMessage} ${funnyReply}`, "funny");
  });

  /* ---------- Chatbot & AI ---------- */
  async function aiReply(q) {
    const t = q.toLowerCase().trim();
    const knowledge = {
      "soil": "🌍 Soil is the top layer of the earth that supports plant life.",
      "farming": "🚜 Farming is the process of growing crops and raising animals for food, materials, or income.",
      "pests": "🐛 Pests are insects or animals that harm crops.",
      "fertilizer": "🌿 Fertilizers help plants grow, organic or chemical.",
      "irrigation": "💧 Irrigation is watering crops using drip, sprinkler, or channels.",
      "crop rotation": "🔄 Plant different crops in the same soil each season."
    };

    for (const key in knowledge) {
      if (t.includes(key)) return knowledge[key];
    }

    if (/^[0-9+\-*/().\s]+$/.test(q)) {
      try {
        const val = eval(q);
        if (isFinite(val)) return `Answer: ${val}`;
      } catch (e) {}
    }

    if (t.includes("water")) return "💧 Water plants early in the morning or evening.";
    if (t.includes("pest")) return "🐞 Use natural pest control.";
    if (t.includes("plant")) return "🌱 Start with easy crops like spinach, lettuce, or tomatoes.";

    return "Sorry, I don't know that yet. Try asking about soil, pests, or watering!";
  }

  async function addChatBubble(text, type = 'ai') {
    const container = document.getElementById('chat-container');
    if (!container) return;
    const div = document.createElement('div');
    div.className = `chat-bubble ${type}-bubble`;
    div.textContent = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;

    if (type === 'ai') {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'en-US';
      window.speechSynthesis.speak(utter);
    }
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
    if (e.key === 'Enter') {
      e.preventDefault();
      chatSend.click();
    }
  });

});
