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

const setupNotice = document.getElementById("setupNotice");
const authSection = document.getElementById("authSection");
const appSection = document.getElementById("appSection");
const messageEl = document.getElementById("message");

const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");
const verifyForm = document.getElementById("verifyForm");
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

const config = window.AWS_CONFIG || {};
const hasConfig = Boolean(
  config.REGION &&
  config.USER_POOL_ID &&
  config.USER_POOL_CLIENT_ID &&
  config.API_BASE_URL
);

const amplify = window.aws_amplify;
if (hasConfig) {
  amplify.Amplify.configure({
    Auth: {
      region: config.REGION,
      userPoolId: config.USER_POOL_ID,
      userPoolWebClientId: config.USER_POOL_CLIENT_ID,
      mandatorySignIn: true,
      authenticationFlowType: "USER_PASSWORD_AUTH"
    }
  });
}

let state = {
  profile: null,
  progress: null,
  logs: []
};

function showMessage(msg, isError = true) {
  messageEl.style.color = isError ? "#b42318" : "#00703c";
  messageEl.textContent = msg;
  setTimeout(() => {
    if (messageEl.textContent === msg) {
      messageEl.textContent = "";
    }
  }, 4000);
}

function createDefaultWeeks() {
  const completed = {};
  for (const wk of WEEK_DEFS) {
    completed[wk.id] = false;
  }
  return completed;
}

function calcStreak(logs) {
  if (!logs.length) return 0;
  const daySet = new Set(logs.map((l) => l.logDate));
  const date = new Date();
  let streak = 0;

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

function calculateWeekHours(logs) {
  const hoursMap = {};
  for (const wk of WEEK_DEFS) {
    hoursMap[wk.id] = 0;
  }
  for (const log of logs) {
    const w = Number(log.weekNo);
    hoursMap[w] = Number(hoursMap[w] || 0) + Number(log.hours || 0);
  }
  return hoursMap;
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

async function getToken() {
  const session = await amplify.Auth.currentSession();
  return session.getIdToken().getJwtToken();
}

async function apiFetch(path, options = {}) {
  const token = await getToken();
  const response = await fetch(`${config.API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(payload.error || `Request failed (${response.status})`);
  }

  return payload;
}

async function loadState() {
  const [profile, progress, logsPayload] = await Promise.all([
    apiFetch("/profile"),
    apiFetch("/progress"),
    apiFetch("/logs")
  ]);

  state = {
    profile,
    progress,
    logs: logsPayload.logs || []
  };
}

function renderWeeks() {
  weeksGrid.innerHTML = "";
  const completed = state.progress.completedWeeks || createDefaultWeeks();
  const hoursMap = calculateWeekHours(state.logs);

  for (const wk of WEEK_DEFS) {
    const isDone = Boolean(completed[wk.id]);
    const card = document.createElement("article");
    card.className = `week-card ${isDone ? "done" : ""}`;
    const safeId = `week-${wk.id}`;

    card.innerHTML = `
      <h4>${wk.title}</h4>
      <p class="muted">${wk.focus}</p>
      <div class="week-line">
        <label>
          <input type="checkbox" id="${safeId}" ${isDone ? "checked" : ""}>
          Completed
        </label>
        <span>${Number(hoursMap[wk.id] || 0)}h logged</span>
      </div>
    `;

    const checkbox = card.querySelector(`#${safeId}`);
    checkbox.addEventListener("change", async (e) => {
      const next = { ...(state.progress.completedWeeks || createDefaultWeeks()) };
      next[wk.id] = e.target.checked;

      try {
        const updated = await apiFetch("/progress", {
          method: "PUT",
          body: JSON.stringify({
            goalWeeklyHours: Number(state.progress.goalWeeklyHours || 20),
            completedWeeks: next
          })
        });

        state.progress = updated;
        renderStats();
        renderWeeks();
      } catch (err) {
        showMessage(err.message);
        e.target.checked = !e.target.checked;
      }
    });

    weeksGrid.appendChild(card);
  }
}

function renderLogs() {
  logsBody.innerHTML = "";

  for (const log of state.logs) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${log.logDate}</td>
      <td>Week ${log.weekNo}</td>
      <td>${log.topic}</td>
      <td>${log.hours}</td>
      <td>${log.notes || "-"}</td>
      <td><button class="delete-log" data-id="${log.id}">Delete</button></td>
    `;
    logsBody.appendChild(tr);
  }

  logsBody.querySelectorAll(".delete-log").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await apiFetch(`/logs/${btn.dataset.id}`, { method: "DELETE" });
        state.logs = state.logs.filter((l) => l.id !== btn.dataset.id);
        renderStats();
        renderWeeks();
        renderLogs();
        showMessage("Log removed.", false);
      } catch (err) {
        showMessage(err.message);
      }
    });
  });
}

function renderStats() {
  const completed = state.progress.completedWeeks || createDefaultWeeks();
  const doneCount = Object.values(completed).filter(Boolean).length;
  const totalWeeks = WEEK_DEFS.length;
  const percent = Math.round((doneCount / totalWeeks) * 100);
  const total = state.logs.reduce((sum, l) => sum + Number(l.hours), 0);
  const streak = calcStreak(state.logs);

  completionPct.textContent = `${percent}%`;
  completionBar.style.width = `${percent}%`;
  totalHours.textContent = String(total);
  streakCount.textContent = `${streak} day${streak === 1 ? "" : "s"}`;
  weeksDone.textContent = `${doneCount} / ${totalWeeks}`;

  const goal = Number(state.progress.goalWeeklyHours || 20);
  const week0Hours = calculateWeekHours(state.logs)[0] || 0;
  goalStatus.textContent = `Goal: ${goal}h/week. Week 0 currently logged: ${week0Hours}h.`;
}

function renderApp(user) {
  const fullName = state.profile.fullName || user.attributes.name || user.attributes.email;
  welcomeText.textContent = `Welcome, ${fullName}`;
  joinedText.textContent = `Email: ${user.attributes.email} | Joined: ${new Date(state.profile.createdAt).toLocaleDateString()}`;
  goalHours.value = state.progress.goalWeeklyHours || 20;

  renderStats();
  renderWeeks();
  renderLogs();
}

async function renderAuthState() {
  if (!hasConfig) {
    setupNotice.classList.remove("hidden");
    authSection.classList.add("hidden");
    appSection.classList.add("hidden");
    return;
  }

  setupNotice.classList.add("hidden");

  let user;
  try {
    user = await amplify.Auth.currentAuthenticatedUser();
  } catch {
    authSection.classList.remove("hidden");
    appSection.classList.add("hidden");
    return;
  }

  authSection.classList.add("hidden");
  appSection.classList.remove("hidden");

  try {
    await loadState();
    renderApp(user);
  } catch (err) {
    showMessage(err.message || "Could not load account data.");
  }
}

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!hasConfig) return;

  const fullName = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPass").value;

  try {
    const result = await amplify.Auth.signUp({
      username: email,
      password,
      attributes: {
        email,
        name: fullName
      }
    });

    signupForm.reset();
    if (!result.userConfirmed) {
      showMessage("Account created. Check your email for verification code.", false);
      document.getElementById("verifyEmail").value = email;
      return;
    }

    showMessage("Account created. Please log in.", false);
  } catch (err) {
    showMessage(err.message || "Signup failed.");
  }
});

verifyForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!hasConfig) return;

  const email = document.getElementById("verifyEmail").value.trim();
  const code = document.getElementById("verifyCode").value.trim();

  try {
    await amplify.Auth.confirmSignUp(email, code);
    verifyForm.reset();
    showMessage("Email verified. You can log in now.", false);
  } catch (err) {
    showMessage(err.message || "Verification failed.");
  }
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!hasConfig) return;

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPass").value;

  try {
    await amplify.Auth.signIn(email, password);
    loginForm.reset();
    showMessage("Logged in.", false);
    await renderAuthState();
  } catch (err) {
    showMessage(err.message || "Login failed.");
  }
});

logoutBtn.addEventListener("click", async () => {
  if (!hasConfig) return;
  await amplify.Auth.signOut();
  showMessage("Logged out.", false);
  await renderAuthState();
});

logForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!hasConfig) return;

  const logDate = document.getElementById("logDate").value;
  const weekNo = Number(logWeek.value);
  const topic = document.getElementById("logTopic").value.trim();
  const hours = Number(document.getElementById("logHours").value);
  const notes = document.getElementById("logNotes").value.trim();

  if (!logDate || !topic || !hours || hours <= 0) {
    showMessage("Fill date, topic, and valid hours.");
    return;
  }

  try {
    const created = await apiFetch("/logs", {
      method: "POST",
      body: JSON.stringify({ logDate, weekNo, topic, hours, notes })
    });

    state.logs.unshift(created);
    logForm.reset();
    document.getElementById("logDate").value = new Date().toISOString().split("T")[0];

    renderStats();
    renderWeeks();
    renderLogs();
    showMessage("Learning log added.", false);
  } catch (err) {
    showMessage(err.message);
  }
});

saveGoalBtn.addEventListener("click", async () => {
  if (!hasConfig) return;

  const goal = Number(goalHours.value);
  if (!goal || goal < 5) {
    showMessage("Set a weekly goal of at least 5 hours.");
    return;
  }

  try {
    const updated = await apiFetch("/progress", {
      method: "PUT",
      body: JSON.stringify({
        goalWeeklyHours: goal,
        completedWeeks: state.progress.completedWeeks || createDefaultWeeks()
      })
    });

    state.progress = updated;
    renderStats();
    showMessage("Goal updated.", false);
  } catch (err) {
    showMessage(err.message);
  }
});

exportBtn.addEventListener("click", async () => {
  if (!hasConfig) return;

  try {
    const payload = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        profile: state.profile,
        progress: state.progress,
        logs: state.logs
      },
      null,
      2
    );

    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tracker-export.json";
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    showMessage(err.message);
  }
});

importInput.addEventListener("change", async (e) => {
  if (!hasConfig) return;
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const imported = JSON.parse(text);

    if (!imported.progress?.completedWeeks || !Array.isArray(imported.logs)) {
      throw new Error("Invalid import file format.");
    }

    await apiFetch("/import", {
      method: "POST",
      body: JSON.stringify(imported)
    });

    await loadState();
    const user = await amplify.Auth.currentAuthenticatedUser();
    renderApp(user);
    showMessage("Data imported successfully.", false);
  } catch (err) {
    showMessage(err.message || "Could not import file.");
  }

  importInput.value = "";
});

populateWeekSelect();
document.getElementById("logDate").value = new Date().toISOString().split("T")[0];
renderAuthState();
