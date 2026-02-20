const STORAGE_KEY = "da_de_tracker_accounts_v1";
const SESSION_KEY = "da_de_tracker_current_user";

const WEEK_DEFS = [
  { id: 0, title: "Week 0", focus: "Terminal + Git + Python setup" },
  { id: 1, title: "Week 1", focus: "Python basics" },
  { id: 2, title: "Week 2", focus: "SQL fundamentals" },
  { id: 3, title: "Week 3", focus: "EDA + metrics" },
  { id: 4, title: "Week 4", focus: "Dashboard storytelling" },
  { id: 5, title: "Week 5", focus: "Data modeling" },
  { id: 6, title: "Week 6", focus: "ETL design" },
  { id: 7, title: "Week 7", focus: "Orchestration" },
  { id: 8, title: "Week 8", focus: "Warehouse loading" },
  { id: 9, title: "Week 9", focus: "Streaming basics" },
  { id: 10, title: "Week 10", focus: "Quality + monitoring" },
  { id: 11, title: "Week 11", focus: "Capstone build" },
  { id: 12, title: "Week 12", focus: "Portfolio + interviews" }
];

const authSection = document.getElementById("authSection");
const appSection = document.getElementById("appSection");
const messageEl = document.getElementById("message");

const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");
const logoutBtn = document.getElementById("logoutBtn");
const exportBtn = document.getElementById("exportBtn");
const importInput = document.getElementById("importInput");

const welcomeText = document.getElementById("welcomeText");
const joinedText = document.getElementById("joinedText");
const completionPct = document.getElementById("completionPct");
const completionBar = document.getElementById("completionBar");
const totalHours = document.getElementById("totalHours");
const streakCount = document.getElementById("streakCount");
const weeksDone = document.getElementById("weeksDone");

const weeksGrid = document.getElementById("weeksGrid");
const logForm = document.getElementById("logForm");
const logsBody = document.getElementById("logsBody");
const logWeek = document.getElementById("logWeek");

const goalHours = document.getElementById("goalHours");
const saveGoalBtn = document.getElementById("saveGoalBtn");
const goalStatus = document.getElementById("goalStatus");

function hashPassword(password) {
  return btoa(unescape(encodeURIComponent(password)));
}

function getAccounts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveAccounts(accounts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

function createDefaultProgress() {
  const weeks = {};
  for (const wk of WEEK_DEFS) {
    weeks[wk.id] = { completed: false, hours: 0 };
  }
  return {
    goalWeeklyHours: 20,
    weeks,
    logs: []
  };
}

function getCurrentUsername() {
  return localStorage.getItem(SESSION_KEY);
}

function setCurrentUsername(username) {
  if (!username) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  localStorage.setItem(SESSION_KEY, username);
}

function getCurrentAccount() {
  const username = getCurrentUsername();
  if (!username) return null;
  const accounts = getAccounts();
  return accounts[username] || null;
}

function updateCurrentAccount(updateFn) {
  const username = getCurrentUsername();
  if (!username) return;
  const accounts = getAccounts();
  const current = accounts[username];
  if (!current) return;
  updateFn(current);
  accounts[username] = current;
  saveAccounts(accounts);
}

function showMessage(msg, isError = true) {
  messageEl.style.color = isError ? "#b42318" : "#00703c";
  messageEl.textContent = msg;
  setTimeout(() => {
    if (messageEl.textContent === msg) {
      messageEl.textContent = "";
    }
  }, 3000);
}

function renderAuthState() {
  const account = getCurrentAccount();
  if (!account) {
    authSection.classList.remove("hidden");
    appSection.classList.add("hidden");
    return;
  }
  authSection.classList.add("hidden");
  appSection.classList.remove("hidden");
  renderApp(account);
}

function calcStreak(logs) {
  if (!logs.length) return 0;
  const daySet = new Set(logs.map((l) => l.date));
  let streak = 0;
  const date = new Date();
  while (true) {
    const d = date.toISOString().split("T")[0];
    if (!daySet.has(d)) {
      if (streak === 0) {
        date.setDate(date.getDate() - 1);
        const yd = date.toISOString().split("T")[0];
        if (daySet.has(yd)) {
          streak += 1;
          date.setDate(date.getDate() - 1);
          continue;
        }
      }
      break;
    }
    streak += 1;
    date.setDate(date.getDate() - 1);
  }
  return streak;
}

function populateWeekSelect() {
  logWeek.innerHTML = "";
  for (const wk of WEEK_DEFS) {
    const opt = document.createElement("option");
    opt.value = String(wk.id);
    opt.textContent = `${wk.title} - ${wk.focus}`;
    logWeek.appendChild(opt);
  }
}

function renderWeeks(progress) {
  weeksGrid.innerHTML = "";
  for (const wk of WEEK_DEFS) {
    const item = progress.weeks[wk.id] || { completed: false, hours: 0 };
    const card = document.createElement("article");
    card.className = `week-card ${item.completed ? "done" : ""}`;

    const safeId = `week-${wk.id}`;
    card.innerHTML = `
      <h4>${wk.title}</h4>
      <p class="muted">${wk.focus}</p>
      <div class="week-line">
        <label>
          <input type="checkbox" id="${safeId}" ${item.completed ? "checked" : ""}>
          Completed
        </label>
        <span>${Number(item.hours || 0)}h logged</span>
      </div>
    `;

    const checkbox = card.querySelector(`#${safeId}`);
    checkbox.addEventListener("change", (e) => {
      updateCurrentAccount((account) => {
        account.progress.weeks[wk.id].completed = e.target.checked;
      });
      renderAuthState();
    });

    weeksGrid.appendChild(card);
  }
}

function renderLogs(progress) {
  logsBody.innerHTML = "";
  const sorted = [...progress.logs].sort((a, b) => (a.date < b.date ? 1 : -1));

  for (const log of sorted) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${log.date}</td>
      <td>Week ${log.week}</td>
      <td>${log.topic}</td>
      <td>${log.hours}</td>
      <td>${log.notes || "-"}</td>
      <td><button class="delete-log" data-id="${log.id}">Delete</button></td>
    `;
    logsBody.appendChild(tr);
  }

  logsBody.querySelectorAll(".delete-log").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      updateCurrentAccount((account) => {
        const log = account.progress.logs.find((l) => l.id === id);
        if (log) {
          account.progress.weeks[log.week].hours = Math.max(
            0,
            Number(account.progress.weeks[log.week].hours || 0) - Number(log.hours)
          );
        }
        account.progress.logs = account.progress.logs.filter((l) => l.id !== id);
      });
      renderAuthState();
      showMessage("Log removed.", false);
    });
  });
}

function renderStats(progress) {
  const totalWeeks = WEEK_DEFS.length;
  const done = Object.values(progress.weeks).filter((w) => w.completed).length;
  const percent = Math.round((done / totalWeeks) * 100);
  const hours = progress.logs.reduce((sum, l) => sum + Number(l.hours), 0);
  const streak = calcStreak(progress.logs);

  completionPct.textContent = `${percent}%`;
  completionBar.style.width = `${percent}%`;
  totalHours.textContent = String(hours);
  streakCount.textContent = `${streak} day${streak === 1 ? "" : "s"}`;
  weeksDone.textContent = `${done} / ${totalWeeks}`;

  const currentWeekHours = Number(progress.weeks[0].hours || 0);
  const goal = Number(progress.goalWeeklyHours || 20);
  goalStatus.textContent = `Goal: ${goal}h/week. Week 0 currently logged: ${currentWeekHours}h.`;
}

function renderApp(account) {
  const { profile, progress } = account;

  welcomeText.textContent = `Welcome, ${profile.name}`;
  joinedText.textContent = `Username: ${profile.username} | Joined: ${new Date(profile.createdAt).toLocaleDateString()}`;

  goalHours.value = progress.goalWeeklyHours || 20;
  renderStats(progress);
  renderWeeks(progress);
  renderLogs(progress);
}

signupForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("signupName").value.trim();
  const username = document.getElementById("signupUser").value.trim().toLowerCase();
  const password = document.getElementById("signupPass").value;

  const accounts = getAccounts();
  if (accounts[username]) {
    showMessage("Username already exists.");
    return;
  }

  accounts[username] = {
    profile: {
      name,
      username,
      createdAt: new Date().toISOString()
    },
    passwordHash: hashPassword(password),
    progress: createDefaultProgress()
  };

  saveAccounts(accounts);
  setCurrentUsername(username);
  signupForm.reset();
  renderAuthState();
  showMessage("Account created.", false);
});

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("loginUser").value.trim().toLowerCase();
  const password = document.getElementById("loginPass").value;

  const accounts = getAccounts();
  const account = accounts[username];
  if (!account || account.passwordHash !== hashPassword(password)) {
    showMessage("Invalid username or password.");
    return;
  }

  setCurrentUsername(username);
  loginForm.reset();
  renderAuthState();
  showMessage("Logged in.", false);
});

logoutBtn.addEventListener("click", () => {
  setCurrentUsername(null);
  renderAuthState();
  showMessage("Logged out.", false);
});

logForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const date = document.getElementById("logDate").value;
  const week = Number(logWeek.value);
  const topic = document.getElementById("logTopic").value.trim();
  const hours = Number(document.getElementById("logHours").value);
  const notes = document.getElementById("logNotes").value.trim();

  if (!date || !topic || !hours || hours <= 0) {
    showMessage("Fill date, topic, and valid hours.");
    return;
  }

  updateCurrentAccount((account) => {
    account.progress.logs.push({
      id: crypto.randomUUID(),
      date,
      week,
      topic,
      hours,
      notes
    });
    account.progress.weeks[week].hours = Number(account.progress.weeks[week].hours || 0) + hours;
  });

  logForm.reset();
  document.getElementById("logDate").value = new Date().toISOString().split("T")[0];
  renderAuthState();
  showMessage("Learning log added.", false);
});

saveGoalBtn.addEventListener("click", () => {
  const goal = Number(goalHours.value);
  if (!goal || goal < 5) {
    showMessage("Set a weekly goal of at least 5 hours.");
    return;
  }
  updateCurrentAccount((account) => {
    account.progress.goalWeeklyHours = goal;
  });
  renderAuthState();
  showMessage("Goal updated.", false);
});

exportBtn.addEventListener("click", () => {
  const account = getCurrentAccount();
  if (!account) return;

  const payload = JSON.stringify(account, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tracker-${account.profile.username}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

importInput.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const imported = JSON.parse(text);

    if (!imported.profile?.username || !imported.progress?.weeks || !Array.isArray(imported.progress.logs)) {
      throw new Error("Invalid data file");
    }

    updateCurrentAccount((account) => {
      account.progress = imported.progress;
    });

    renderAuthState();
    showMessage("Data imported.", false);
  } catch {
    showMessage("Could not import this file.");
  }

  importInput.value = "";
});

populateWeekSelect();
document.getElementById("logDate").value = new Date().toISOString().split("T")[0];
renderAuthState();
