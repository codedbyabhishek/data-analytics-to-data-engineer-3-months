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

const WEEK_CONTENT = {
  0: {
    tasks: [
      "Install Python, Git, VS Code and verify versions.",
      "Learn terminal basics: pwd, ls, cd, mkdir, touch.",
      "Create first GitHub repo and push first commit.",
      "Run a simple Python script from terminal."
    ],
    refs: [
      { label: "Week 0 Foundation", url: "week-by-week/week-0-foundation.md" },
      { label: "Week 0 Resources", url: "resources/week-0-beginner-resources.md" }
    ]
  },
  1: {
    tasks: [
      "Practice Python syntax with loops/functions exercises.",
      "Read CSV/JSON files and inspect data.",
      "Build mini notebook with basic stats.",
      "Commit notebook with notes and examples."
    ],
    refs: [
      { label: "Python Official Tutorial", url: "https://docs.python.org/3/tutorial/" },
      { label: "12 Week Roadmap", url: "week-by-week/12-week-roadmap.md" }
    ]
  },
  2: {
    tasks: [
      "Master SELECT, WHERE, GROUP BY, ORDER BY.",
      "Practice joins, CTEs, and window functions.",
      "Solve at least 50 SQL questions.",
      "Document solutions in SQL file."
    ],
    refs: [
      { label: "PostgreSQL Docs", url: "https://www.postgresql.org/docs/" },
      { label: "SQL Practice", url: "https://www.hackerrank.com/domains/sql" }
    ]
  },
  3: {
    tasks: [
      "Perform EDA in pandas.",
      "Define business metrics (conversion/retention).",
      "Create charts and summarize insights.",
      "Publish one insights notebook."
    ],
    refs: [
      { label: "Pandas Docs", url: "https://pandas.pydata.org/docs/" },
      { label: "Roadmap Week 3", url: "week-by-week/12-week-roadmap.md" }
    ]
  },
  4: {
    tasks: [
      "Build dashboard in Power BI/Tableau/Looker Studio.",
      "Create KPI drill-down views.",
      "Write one-page business summary.",
      "Share screenshot/demo link in repo."
    ],
    refs: [
      { label: "Project 1 Brief", url: "projects/project-1-analytics-dashboard.md" }
    ]
  },
  5: {
    tasks: [
      "Design star schema with fact and dimension tables.",
      "Map source fields to model entities.",
      "Review OLTP vs OLAP usage.",
      "Upload schema diagram to repo."
    ],
    refs: [
      { label: "Project 2 Brief", url: "projects/project-2-batch-pipeline.md" }
    ]
  },
  6: {
    tasks: [
      "Create ETL pipeline with extract-transform-load steps.",
      "Add retry/error handling and logging.",
      "Make load idempotent for reruns.",
      "Write runbook steps in README."
    ],
    refs: [
      { label: "Airflow Docs", url: "https://airflow.apache.org/docs/" },
      { label: "Prefect Docs", url: "https://docs.prefect.io/" }
    ]
  },
  7: {
    tasks: [
      "Create DAG/flow with dependencies.",
      "Schedule daily run and monitor status.",
      "Add alerts for failure cases.",
      "Document orchestration design decisions."
    ],
    refs: [
      { label: "Roadmap Week 7", url: "week-by-week/12-week-roadmap.md" }
    ]
  },
  8: {
    tasks: [
      "Load transformed data into warehouse tables.",
      "Implement incremental load strategy.",
      "Optimize partitioning or clustering.",
      "Validate table freshness and counts."
    ],
    refs: [
      { label: "BigQuery Quickstart", url: "https://cloud.google.com/bigquery/docs/quickstarts" },
      { label: "Redshift Docs", url: "https://docs.aws.amazon.com/redshift/" }
    ]
  },
  9: {
    tasks: [
      "Set up producer and consumer for events.",
      "Process stream records and aggregate output.",
      "Handle delayed or malformed messages.",
      "Write stream architecture notes."
    ],
    refs: [
      { label: "Project 3 Brief", url: "projects/project-3-streaming-and-quality.md" },
      { label: "Kafka Docs", url: "https://kafka.apache.org/documentation/" }
    ]
  },
  10: {
    tasks: [
      "Define data quality checks (schema/null/freshness).",
      "Implement automated validation.",
      "Create alerting rules for failures.",
      "Document one incident simulation."
    ],
    refs: [
      { label: "Great Expectations", url: "https://docs.greatexpectations.io/" }
    ]
  },
  11: {
    tasks: [
      "Integrate ingestion, transformation, warehouse and dashboard.",
      "Add tests and sample datasets.",
      "Create architecture diagram.",
      "Prepare capstone README."
    ],
    refs: [
      { label: "Capstone Week", url: "week-by-week/12-week-roadmap.md" }
    ]
  },
  12: {
    tasks: [
      "Polish all project READMEs.",
      "Create short project demo videos.",
      "Prepare interview Q&A answers.",
      "Finalize resume bullets with outcomes."
    ],
    refs: [
      { label: "Interview Resources", url: "resources/free-learning-resources.md" }
    ]
  }
};

const setupNotice = document.getElementById("setupNotice");
const authSection = document.getElementById("authSection");
const appSection = document.getElementById("appSection");
const messageEl = document.getElementById("message");

const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");
const verifyForm = document.getElementById("verifyForm");
const openLoginBtn = document.getElementById("openLoginBtn");
const openSignupBtn = document.getElementById("openSignupBtn");
const tabLoginBtn = document.getElementById("tabLoginBtn");
const tabSignupBtn = document.getElementById("tabSignupBtn");
const tabVerifyBtn = document.getElementById("tabVerifyBtn");
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
const signupPane = document.getElementById("signupPane");
const loginPane = document.getElementById("loginPane");
const verifyPane = document.getElementById("verifyPane");

const generateCertBtn = document.getElementById("generateCertBtn");
const shareLinkedInBtn = document.getElementById("shareLinkedInBtn");
const shareXBtn = document.getElementById("shareXBtn");
const shareFacebookBtn = document.getElementById("shareFacebookBtn");
const copyCertLinkBtn = document.getElementById("copyCertLinkBtn");
const certificateCard = document.getElementById("certificateCard");

const config = window.AWS_CONFIG || {};
const hasConfig = Boolean(
  config.REGION &&
  config.USER_POOL_ID &&
  config.USER_POOL_CLIENT_ID &&
  config.API_BASE_URL
);

const amplifyGlobal = window.aws_amplify || {};
const AmplifyApi = amplifyGlobal.Amplify || window.Amplify || null;
const AuthApi = amplifyGlobal.Auth || window.Auth || null;

if (hasConfig && AmplifyApi && AuthApi) {
  AmplifyApi.configure({
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

function setAuthPane(pane) {
  const panes = { signup: signupPane, login: loginPane, verify: verifyPane };
  const tabs = { signup: tabSignupBtn, login: tabLoginBtn, verify: tabVerifyBtn };

  Object.entries(panes).forEach(([key, el]) => {
    if (!el) return;
    el.classList.toggle("hidden", key !== pane);
  });
  Object.entries(tabs).forEach(([key, el]) => {
    if (!el) return;
    el.classList.toggle("active", key === pane);
  });
}

function showMessage(msg, isError = true) {
  messageEl.style.color = isError ? "#b42318" : "#00703c";
  messageEl.textContent = msg;
  setTimeout(() => {
    if (messageEl.textContent === msg) messageEl.textContent = "";
  }, 4000);
}

function createDefaultWeeks() {
  const completed = {};
  for (const wk of WEEK_DEFS) completed[wk.id] = false;
  return completed;
}

function createDefaultTaskProgress() {
  const progress = {};
  for (const wk of WEEK_DEFS) {
    const len = (WEEK_CONTENT[wk.id]?.tasks || []).length;
    progress[wk.id] = Array.from({ length: len }, () => false);
  }
  return progress;
}

function normalizeProgress(progress) {
  return {
    goalWeeklyHours: Number(progress?.goalWeeklyHours || 20),
    completedWeeks: progress?.completedWeeks || createDefaultWeeks(),
    taskProgress: progress?.taskProgress || createDefaultTaskProgress(),
    certificate: progress?.certificate || null,
    createdAt: progress?.createdAt,
    updatedAt: progress?.updatedAt
  };
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
  for (const wk of WEEK_DEFS) hoursMap[wk.id] = 0;
  for (const log of logs) {
    const w = Number(log.weekNo);
    hoursMap[w] = Number(hoursMap[w] || 0) + Number(log.hours || 0);
  }
  return hoursMap;
}

function isCourseComplete() {
  const completed = state.progress.completedWeeks || createDefaultWeeks();
  return Object.values(completed).every(Boolean);
}

function absoluteOrRepoUrl(url) {
  if (/^https?:\/\//i.test(url)) return url;
  return `https://github.com/codedbyabhishek/data-analytics-to-data-engineer-3-months/blob/main/${url}`;
}

function buildCertificateLink(certificate) {
  const params = new URLSearchParams({
    cert_id: certificate.id,
    cert_name: certificate.learnerName,
    cert_date: certificate.issuedAt
  });
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}

function renderSharedCertificateViewFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const certId = params.get("cert_id");
  const certName = params.get("cert_name");
  const certDate = params.get("cert_date");
  if (!certId || !certName || !certDate) return false;

  document.body.innerHTML = `
    <main class="container" style="padding-top:2rem;">
      <section class="panel certificate-public">
        <p class="eyebrow">Verified Achievement</p>
        <h1 style="margin:0.2rem 0 0.6rem;">Data Analytics to Data Engineer</h1>
        <p>This certifies that <strong>${certName}</strong> completed the 13-week learning roadmap.</p>
        <p><strong>Certificate ID:</strong> ${certId}</p>
        <p><strong>Issued:</strong> ${new Date(certDate).toLocaleDateString()}</p>
        <a class="chip" href="${window.location.origin}${window.location.pathname}">Open Tracker</a>
      </section>
    </main>
  `;
  return true;
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
  const session = await AuthApi.currentSession();
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
  if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);
  return payload;
}

async function persistProgress(nextProgress) {
  const payload = {
    goalWeeklyHours: Number(nextProgress.goalWeeklyHours || 20),
    completedWeeks: nextProgress.completedWeeks || createDefaultWeeks(),
    taskProgress: nextProgress.taskProgress || createDefaultTaskProgress(),
    certificate: nextProgress.certificate || null
  };

  const updated = await apiFetch("/progress", {
    method: "PUT",
    body: JSON.stringify(payload)
  });

  state.progress = normalizeProgress(updated);
}

async function loadState() {
  const [profile, progress, logsPayload] = await Promise.all([
    apiFetch("/profile"),
    apiFetch("/progress"),
    apiFetch("/logs")
  ]);

  state = {
    profile,
    progress: normalizeProgress(progress),
    logs: logsPayload.logs || []
  };
}

function renderWeeks() {
  weeksGrid.innerHTML = "";
  const completed = state.progress.completedWeeks || createDefaultWeeks();
  const taskProgress = state.progress.taskProgress || createDefaultTaskProgress();
  const hoursMap = calculateWeekHours(state.logs);

  for (const wk of WEEK_DEFS) {
    const weekContent = WEEK_CONTENT[wk.id] || { tasks: [], refs: [] };
    const weekTasksState = taskProgress[wk.id] || Array.from({ length: weekContent.tasks.length }, () => false);
    const doneTasks = weekTasksState.filter(Boolean).length;
    const totalTasks = weekContent.tasks.length || 1;
    const taskPct = Math.round((doneTasks / totalTasks) * 100);
    const isDone = Boolean(completed[wk.id]);

    const card = document.createElement("article");
    card.className = `week-card week-expand ${isDone ? "done" : ""}`;

    const tasksHtml = weekContent.tasks
      .map(
        (task, idx) => `
        <label class="task-item">
          <input type="checkbox" data-week="${wk.id}" data-task-index="${idx}" ${weekTasksState[idx] ? "checked" : ""}>
          <span>${task}</span>
        </label>`
      )
      .join("");

    const refsHtml = weekContent.refs
      .map(
        (ref) => `<li><a href="${absoluteOrRepoUrl(ref.url)}" target="_blank" rel="noreferrer">${ref.label}</a></li>`
      )
      .join("");

    card.innerHTML = `
      <details>
        <summary>
          <div class="week-summary-left">
            <h4>${wk.title}</h4>
            <p class="muted">${wk.focus}</p>
          </div>
          <div class="week-summary-right">
            <span class="week-hours">${Number(hoursMap[wk.id] || 0)}h logged</span>
            <span class="task-pct">${doneTasks}/${weekContent.tasks.length} tasks</span>
          </div>
        </summary>

        <div class="week-line">
          <label>
            <input type="checkbox" class="week-complete-checkbox" data-week-id="${wk.id}" ${isDone ? "checked" : ""}>
            Mark week complete
          </label>
          <span>${taskPct}% tasks done</span>
        </div>

        <div class="task-list">${tasksHtml}</div>
        <div class="week-refs">
          <p class="muted">References</p>
          <ul>${refsHtml}</ul>
        </div>
      </details>
    `;

    weeksGrid.appendChild(card);
  }

  weeksGrid.querySelectorAll(".week-complete-checkbox").forEach((el) => {
    el.addEventListener("change", async (e) => {
      const wk = Number(e.target.dataset.weekId);
      const nextCompleted = { ...(state.progress.completedWeeks || createDefaultWeeks()) };
      nextCompleted[wk] = e.target.checked;

      try {
        await persistProgress({ ...state.progress, completedWeeks: nextCompleted });
        renderStats();
        renderWeeks();
        renderCertificate();
      } catch (err) {
        showMessage(err.message);
        e.target.checked = !e.target.checked;
      }
    });
  });

  weeksGrid.querySelectorAll(".task-item input[type='checkbox']").forEach((el) => {
    el.addEventListener("change", async (e) => {
      const wk = Number(e.target.dataset.week);
      const idx = Number(e.target.dataset.taskIndex);
      const nextTaskProgress = structuredClone(state.progress.taskProgress || createDefaultTaskProgress());
      if (!Array.isArray(nextTaskProgress[wk])) nextTaskProgress[wk] = [];
      nextTaskProgress[wk][idx] = e.target.checked;

      try {
        await persistProgress({ ...state.progress, taskProgress: nextTaskProgress });
        renderWeeks();
      } catch (err) {
        showMessage(err.message);
        e.target.checked = !e.target.checked;
      }
    });
  });
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

function renderCertificate() {
  if (!certificateCard) return;

  const canGenerate = isCourseComplete();
  const cert = state.progress.certificate;
  generateCertBtn.disabled = !canGenerate;
  shareLinkedInBtn.disabled = !cert;
  shareXBtn.disabled = !cert;
  shareFacebookBtn.disabled = !cert;
  copyCertLinkBtn.disabled = !cert;

  if (!cert) {
    certificateCard.classList.add("hidden");
    return;
  }

  const certLink = buildCertificateLink(cert);
  certificateCard.classList.remove("hidden");
  certificateCard.innerHTML = `
    <p class="eyebrow">Certificate Ready</p>
    <h3>${cert.learnerName}</h3>
    <p>Completed <strong>Data Analytics to Data Engineer</strong> roadmap.</p>
    <p><strong>ID:</strong> ${cert.id}</p>
    <p><strong>Issued:</strong> ${new Date(cert.issuedAt).toLocaleDateString()}</p>
    <p><a href="${certLink}" target="_blank" rel="noreferrer">Open public certificate</a></p>
  `;
}

function renderApp(user) {
  const fullName = state.profile.fullName || user.attributes.name || user.attributes.email;
  welcomeText.textContent = `Welcome, ${fullName}`;
  joinedText.textContent = `Email: ${user.attributes.email} | Joined: ${new Date(state.profile.createdAt).toLocaleDateString()}`;
  goalHours.value = state.progress.goalWeeklyHours || 20;

  renderStats();
  renderWeeks();
  renderLogs();
  renderCertificate();
}

async function renderAuthState() {
  if (!hasConfig || !AmplifyApi || !AuthApi) {
    setupNotice.classList.remove("hidden");
    authSection.classList.add("hidden");
    appSection.classList.add("hidden");
    if (hasConfig && (!AmplifyApi || !AuthApi)) {
      showMessage("Auth library failed to load. Refresh once and try again.");
    }
    return;
  }

  setupNotice.classList.add("hidden");

  let user;
  try {
    user = await AuthApi.currentAuthenticatedUser();
  } catch {
    authSection.classList.remove("hidden");
    appSection.classList.add("hidden");
    setAuthPane("login");
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
    const result = await AuthApi.signUp({
      username: email,
      password,
      attributes: { email, name: fullName }
    });

    signupForm.reset();
    if (!result.userConfirmed) {
      showMessage("Account created. Check your email for verification code.", false);
      document.getElementById("verifyEmail").value = email;
      setAuthPane("verify");
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
    await AuthApi.confirmSignUp(email, code);
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
    await AuthApi.signIn(email, password);
    loginForm.reset();
    showMessage("Logged in.", false);
    await renderAuthState();
  } catch (err) {
    showMessage(err.message || "Login failed.");
  }
});

logoutBtn.addEventListener("click", async () => {
  if (!hasConfig) return;
  await AuthApi.signOut();
  showMessage("Logged out.", false);
  setAuthPane("login");
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
    await persistProgress({ ...state.progress, goalWeeklyHours: goal });
    renderStats();
    showMessage("Goal updated.", false);
  } catch (err) {
    showMessage(err.message);
  }
});

generateCertBtn?.addEventListener("click", async () => {
  if (!isCourseComplete()) {
    showMessage("Complete all weeks before generating certificate.");
    return;
  }

  const learnerName = state.profile.fullName || "Learner";
  const cert = {
    id: `DADE-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    learnerName,
    issuedAt: new Date().toISOString()
  };

  try {
    await persistProgress({ ...state.progress, certificate: cert });
    renderCertificate();
    showMessage("Certificate generated.", false);
  } catch (err) {
    showMessage(err.message);
  }
});

shareLinkedInBtn?.addEventListener("click", () => {
  const cert = state.progress.certificate;
  if (!cert) return;
  const url = buildCertificateLink(cert);
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank");
});

shareXBtn?.addEventListener("click", () => {
  const cert = state.progress.certificate;
  if (!cert) return;
  const url = buildCertificateLink(cert);
  const text = "I completed the Data Analytics to Data Engineer 13-week roadmap.";
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");
});

shareFacebookBtn?.addEventListener("click", () => {
  const cert = state.progress.certificate;
  if (!cert) return;
  const url = buildCertificateLink(cert);
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
});

copyCertLinkBtn?.addEventListener("click", async () => {
  const cert = state.progress.certificate;
  if (!cert) return;
  const url = buildCertificateLink(cert);
  try {
    await navigator.clipboard.writeText(url);
    showMessage("Certificate link copied.", false);
  } catch {
    showMessage("Could not copy link.");
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
    const user = await AuthApi.currentAuthenticatedUser();
    renderApp(user);
    showMessage("Data imported successfully.", false);
  } catch (err) {
    showMessage(err.message || "Could not import file.");
  }

  importInput.value = "";
});

populateWeekSelect();
document.getElementById("logDate").value = new Date().toISOString().split("T")[0];
setAuthPane("login");
openLoginBtn?.addEventListener("click", () => {
  authSection.classList.remove("hidden");
  setAuthPane("login");
  loginForm?.querySelector("input")?.focus();
});
openSignupBtn?.addEventListener("click", () => {
  authSection.classList.remove("hidden");
  setAuthPane("signup");
  signupForm?.querySelector("input")?.focus();
});
tabLoginBtn?.addEventListener("click", () => setAuthPane("login"));
tabSignupBtn?.addEventListener("click", () => setAuthPane("signup"));
tabVerifyBtn?.addEventListener("click", () => setAuthPane("verify"));

if (!renderSharedCertificateViewFromUrl()) {
  renderAuthState();
}
