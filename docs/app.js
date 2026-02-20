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

const config = window.APP_CONFIG || {};
const hasConfig = Boolean(config.SUPABASE_URL && config.SUPABASE_ANON_KEY);
const supabase = hasConfig
  ? window.supabase.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY)
  : null;

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
  const daySet = new Set(logs.map((l) => l.log_date));
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
    const w = Number(log.week_no);
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

async function ensureUserRows(user, fullNameFromSignup = "") {
  const fallbackName = fullNameFromSignup || user.user_metadata?.full_name || user.email || "Learner";

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({ user_id: user.id, full_name: fallbackName }, { onConflict: "user_id" });

  if (profileError) throw profileError;

  const { data: progressRow, error: progressReadError } = await supabase
    .from("user_progress")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (progressReadError) throw progressReadError;

  if (!progressRow) {
    const { error: progressInsertError } = await supabase.from("user_progress").insert({
      user_id: user.id,
      goal_weekly_hours: 20,
      completed_weeks_json: createDefaultWeeks()
    });
    if (progressInsertError) throw progressInsertError;
  }
}

async function loadState(user) {
  const [{ data: profile, error: profileError }, { data: progress, error: progressError }, { data: logs, error: logsError }] =
    await Promise.all([
      supabase.from("profiles").select("full_name, created_at").eq("user_id", user.id).single(),
      supabase
        .from("user_progress")
        .select("goal_weekly_hours, completed_weeks_json")
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("learning_logs")
        .select("id, log_date, week_no, topic, hours, notes")
        .eq("user_id", user.id)
        .order("log_date", { ascending: false })
    ]);

  if (profileError) throw profileError;
  if (progressError) throw progressError;
  if (logsError) throw logsError;

  state = {
    profile,
    progress,
    logs
  };
}

function renderWeeks() {
  weeksGrid.innerHTML = "";
  const completed = state.progress.completed_weeks_json || createDefaultWeeks();
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
      const next = { ...(state.progress.completed_weeks_json || createDefaultWeeks()) };
      next[wk.id] = e.target.checked;

      const { error } = await supabase
        .from("user_progress")
        .update({ completed_weeks_json: next })
        .eq("user_id", (await supabase.auth.getUser()).data.user.id);

      if (error) {
        showMessage(error.message);
        e.target.checked = !e.target.checked;
        return;
      }

      state.progress.completed_weeks_json = next;
      renderStats();
      renderWeeks();
    });

    weeksGrid.appendChild(card);
  }
}

function renderLogs() {
  logsBody.innerHTML = "";

  for (const log of state.logs) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${log.log_date}</td>
      <td>Week ${log.week_no}</td>
      <td>${log.topic}</td>
      <td>${log.hours}</td>
      <td>${log.notes || "-"}</td>
      <td><button class="delete-log" data-id="${log.id}">Delete</button></td>
    `;
    logsBody.appendChild(tr);
  }

  logsBody.querySelectorAll(".delete-log").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const { error } = await supabase.from("learning_logs").delete().eq("id", id);
      if (error) {
        showMessage(error.message);
        return;
      }

      state.logs = state.logs.filter((l) => l.id !== id);
      renderStats();
      renderWeeks();
      renderLogs();
      showMessage("Log removed.", false);
    });
  });
}

function renderStats() {
  const completed = state.progress.completed_weeks_json || createDefaultWeeks();
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

  const goal = Number(state.progress.goal_weekly_hours || 20);
  const week0Hours = calculateWeekHours(state.logs)[0] || 0;
  goalStatus.textContent = `Goal: ${goal}h/week. Week 0 currently logged: ${week0Hours}h.`;
}

function renderApp(user) {
  const fullName = state.profile.full_name || user.email;
  welcomeText.textContent = `Welcome, ${fullName}`;
  joinedText.textContent = `Email: ${user.email} | Joined: ${new Date(state.profile.created_at).toLocaleDateString()}`;
  goalHours.value = state.progress.goal_weekly_hours || 20;

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

  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;

  if (!user) {
    authSection.classList.remove("hidden");
    appSection.classList.add("hidden");
    return;
  }

  authSection.classList.add("hidden");
  appSection.classList.remove("hidden");

  try {
    await ensureUserRows(user);
    await loadState(user);
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

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName }
    }
  });

  if (error) {
    showMessage(error.message);
    return;
  }

  if (data.user) {
    try {
      await ensureUserRows(data.user, fullName);
    } catch (rowError) {
      showMessage(rowError.message);
      return;
    }
  }

  signupForm.reset();

  if (!data.session) {
    showMessage("Account created. Check your email and verify before login.", false);
    return;
  }

  showMessage("Account created and logged in.", false);
  await renderAuthState();
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!hasConfig) return;

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPass").value;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    showMessage(error.message);
    return;
  }

  loginForm.reset();
  showMessage("Logged in.", false);
  await renderAuthState();
});

logoutBtn.addEventListener("click", async () => {
  if (!hasConfig) return;
  await supabase.auth.signOut();
  showMessage("Logged out.", false);
  await renderAuthState();
});

logForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!hasConfig) return;

  const date = document.getElementById("logDate").value;
  const week = Number(logWeek.value);
  const topic = document.getElementById("logTopic").value.trim();
  const hours = Number(document.getElementById("logHours").value);
  const notes = document.getElementById("logNotes").value.trim();

  if (!date || !topic || !hours || hours <= 0) {
    showMessage("Fill date, topic, and valid hours.");
    return;
  }

  const user = (await supabase.auth.getUser()).data.user;
  const { data, error } = await supabase
    .from("learning_logs")
    .insert({
      user_id: user.id,
      log_date: date,
      week_no: week,
      topic,
      hours,
      notes
    })
    .select("id, log_date, week_no, topic, hours, notes")
    .single();

  if (error) {
    showMessage(error.message);
    return;
  }

  state.logs.unshift(data);
  logForm.reset();
  document.getElementById("logDate").value = new Date().toISOString().split("T")[0];

  renderStats();
  renderWeeks();
  renderLogs();
  showMessage("Learning log added.", false);
});

saveGoalBtn.addEventListener("click", async () => {
  if (!hasConfig) return;

  const goal = Number(goalHours.value);
  if (!goal || goal < 5) {
    showMessage("Set a weekly goal of at least 5 hours.");
    return;
  }

  const user = (await supabase.auth.getUser()).data.user;
  const { error } = await supabase
    .from("user_progress")
    .update({ goal_weekly_hours: goal })
    .eq("user_id", user.id);

  if (error) {
    showMessage(error.message);
    return;
  }

  state.progress.goal_weekly_hours = goal;
  renderStats();
  showMessage("Goal updated.", false);
});

exportBtn.addEventListener("click", async () => {
  if (!hasConfig) return;
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return;

  const payload = JSON.stringify(
    {
      exported_at: new Date().toISOString(),
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
  a.download = `tracker-${user.email.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

importInput.addEventListener("change", async (e) => {
  if (!hasConfig) return;
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const imported = JSON.parse(text);

    if (!imported.progress?.completed_weeks_json || !Array.isArray(imported.logs)) {
      throw new Error("Invalid import file format.");
    }

    const user = (await supabase.auth.getUser()).data.user;

    const { error: updateProgressError } = await supabase
      .from("user_progress")
      .update({
        goal_weekly_hours: Number(imported.progress.goal_weekly_hours || 20),
        completed_weeks_json: imported.progress.completed_weeks_json
      })
      .eq("user_id", user.id);

    if (updateProgressError) throw updateProgressError;

    const { error: deleteLogsError } = await supabase.from("learning_logs").delete().eq("user_id", user.id);
    if (deleteLogsError) throw deleteLogsError;

    if (imported.logs.length) {
      const rows = imported.logs.map((l) => ({
        user_id: user.id,
        log_date: l.log_date,
        week_no: Number(l.week_no),
        topic: l.topic,
        hours: Number(l.hours),
        notes: l.notes || ""
      }));

      const { error: insertLogsError } = await supabase.from("learning_logs").insert(rows);
      if (insertLogsError) throw insertLogsError;
    }

    await loadState(user);
    renderApp(user);
    showMessage("Data imported successfully.", false);
  } catch (err) {
    showMessage(err.message || "Could not import this file.");
  }

  importInput.value = "";
});

if (hasConfig) {
  supabase.auth.onAuthStateChange(async () => {
    await renderAuthState();
  });
}

populateWeekSelect();
document.getElementById("logDate").value = new Date().toISOString().split("T")[0];
renderAuthState();
