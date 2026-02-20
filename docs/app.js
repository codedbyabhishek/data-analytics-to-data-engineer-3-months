const DEFAULT_COURSE_ID = "analytics-to-de";
const CATALOG_STORAGE_KEY = "dj_course_catalog_v1";

const FALLBACK_CATALOG = {
  version: 1,
  courses: [
    {
      id: "analytics-to-de",
      title: "Data Analytics to Data Engineer",
      subtitle: "Zero to Professional in 12 Weeks",
      weeks: [
        {
          id: 0,
          title: "Week 0",
          focus: "Terminal + Git + Python setup",
          tasks: [
            "Install Python, Git, VS Code and verify versions.",
            "Learn terminal basics: pwd, ls, cd, mkdir, touch.",
            "Create first GitHub repo and push first commit.",
            "Run a simple Python script from terminal."
          ],
          references: [{ label: "Week 0 Foundation", url: "week-by-week/week-0-foundation.md" }]
        }
      ]
    }
  ]
};

let CATALOG = FALLBACK_CATALOG;
let COURSES = FALLBACK_CATALOG.courses;
let COURSE_MAP = Object.fromEntries(COURSES.map((c) => [c.id, c]));

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
const billingStatus = document.getElementById("billingStatus");
const plansGrid = document.getElementById("plansGrid");

const weeksGrid = document.getElementById("weeksGrid");
const logForm = document.getElementById("logForm");
const logsBody = document.getElementById("logsBody");
const logWeek = document.getElementById("logWeek");
const courseSelect = document.getElementById("courseSelect");

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

const loadConfigBtn = document.getElementById("loadConfigBtn");
const applyConfigBtn = document.getElementById("applyConfigBtn");
const exportConfigBtn = document.getElementById("exportConfigBtn");
const resetConfigBtn = document.getElementById("resetConfigBtn");
const configEditor = document.getElementById("configEditor");

const config = window.AWS_CONFIG || {};
const hasConfig = Boolean(config.REGION && config.USER_POOL_ID && config.USER_POOL_CLIENT_ID && config.API_BASE_URL);

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
  logs: [],
  activeCourseId: DEFAULT_COURSE_ID,
  billing: null,
  plans: []
};

function showMessage(msg, isError = true) {
  messageEl.style.color = isError ? "#b42318" : "#00703c";
  messageEl.textContent = msg;
  setTimeout(() => {
    if (messageEl.textContent === msg) messageEl.textContent = "";
  }, 4000);
}

function validateCatalogShape(catalog) {
  if (!catalog || typeof catalog !== "object") return "Catalog must be an object.";
  if (!Array.isArray(catalog.courses) || !catalog.courses.length) return "Catalog must include a non-empty courses array.";

  const ids = new Set();
  for (const course of catalog.courses) {
    if (!course.id || !course.title || !Array.isArray(course.weeks)) return "Each course requires id, title, and weeks array.";
    if (ids.has(course.id)) return `Duplicate course id: ${course.id}`;
    ids.add(course.id);
    for (const week of course.weeks) {
      if (typeof week.id !== "number" || !week.title || !week.focus) {
        return `Course ${course.id} has invalid week entry.`;
      }
      if (!Array.isArray(week.tasks)) return `Course ${course.id} week ${week.id} requires tasks array.`;
      if (!Array.isArray(week.references)) return `Course ${course.id} week ${week.id} requires references array.`;
    }
  }
  return "";
}

function applyCatalog(catalog, persist = false) {
  const err = validateCatalogShape(catalog);
  if (err) throw new Error(err);

  CATALOG = catalog;
  COURSES = catalog.courses;
  COURSE_MAP = Object.fromEntries(COURSES.map((c) => [c.id, c]));

  if (persist) localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(catalog));

  if (!COURSE_MAP[state.activeCourseId]) state.activeCourseId = COURSES[0].id;
  if (state.progress) {
    const next = structuredClone(state.progress);
    for (const course of COURSES) {
      if (!next.courses[course.id]) next.courses[course.id] = createCourseProgress(course.id);
    }
    state.progress = next;
  }
}

async function loadCatalog() {
  const local = localStorage.getItem(CATALOG_STORAGE_KEY);
  if (local) {
    try {
      applyCatalog(JSON.parse(local));
      return;
    } catch {
      localStorage.removeItem(CATALOG_STORAGE_KEY);
    }
  }

  try {
    const res = await fetch(`courses/catalog.json?v=${Date.now()}`);
    const remote = await res.json();
    applyCatalog(remote);
  } catch {
    applyCatalog(FALLBACK_CATALOG);
  }
}

function getActiveCourse() {
  return COURSE_MAP[state.activeCourseId] || COURSES[0];
}

function setAuthPane(pane) {
  const panes = { signup: signupPane, login: loginPane, verify: verifyPane };
  const tabs = { signup: tabSignupBtn, login: tabLoginBtn, verify: tabVerifyBtn };
  Object.entries(panes).forEach(([k, el]) => el && el.classList.toggle("hidden", k !== pane));
  Object.entries(tabs).forEach(([k, el]) => el && el.classList.toggle("active", k === pane));
}

function defaultCompletedWeeks(courseId) {
  const completed = {};
  const course = COURSE_MAP[courseId] || COURSES[0];
  for (const week of course.weeks) completed[week.id] = false;
  return completed;
}

function defaultTaskProgress(courseId) {
  const taskProgress = {};
  const course = COURSE_MAP[courseId] || COURSES[0];
  for (const week of course.weeks) taskProgress[week.id] = Array.from({ length: week.tasks.length }, () => false);
  return taskProgress;
}

function createCourseProgress(courseId) {
  return {
    goalWeeklyHours: 20,
    completedWeeks: defaultCompletedWeeks(courseId),
    taskProgress: defaultTaskProgress(courseId),
    certificate: null
  };
}

function defaultCoursesProgress() {
  const courses = {};
  for (const course of COURSES) courses[course.id] = createCourseProgress(course.id);
  return courses;
}

function normalizeProgress(progress) {
  if (!progress || typeof progress !== "object") {
    return { activeCourseId: COURSES[0].id, courses: defaultCoursesProgress() };
  }

  if (progress.courses && progress.activeCourseId) {
    const courses = defaultCoursesProgress();
    for (const course of COURSES) {
      const incoming = progress.courses[course.id];
      if (!incoming) continue;
      courses[course.id] = {
        ...courses[course.id],
        ...incoming,
        completedWeeks: { ...courses[course.id].completedWeeks, ...(incoming.completedWeeks || {}) },
        taskProgress: { ...courses[course.id].taskProgress, ...(incoming.taskProgress || {}) }
      };
    }
    return {
      activeCourseId: COURSE_MAP[progress.activeCourseId] ? progress.activeCourseId : COURSES[0].id,
      courses
    };
  }

  const legacy = createCourseProgress(DEFAULT_COURSE_ID);
  legacy.goalWeeklyHours = Number(progress.goalWeeklyHours || 20);
  legacy.completedWeeks = { ...legacy.completedWeeks, ...(progress.completedWeeks || {}) };
  legacy.taskProgress = { ...legacy.taskProgress, ...(progress.taskProgress || {}) };
  legacy.certificate = progress.certificate || null;

  const courses = defaultCoursesProgress();
  courses[DEFAULT_COURSE_ID] = legacy;
  return { activeCourseId: DEFAULT_COURSE_ID, courses };
}

function activeCourseProgress() {
  return state.progress?.courses?.[state.activeCourseId] || createCourseProgress(state.activeCourseId);
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
        if (daySet.has(date.toISOString().split("T")[0])) {
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

function absoluteOrRepoUrl(url) {
  if (/^https?:\/\//i.test(url)) return url;
  return `https://github.com/codedbyabhishek/data-analytics-to-data-engineer-3-months/blob/main/${url}`;
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

function buildCertificateLink(certificate, courseId) {
  const params = new URLSearchParams({
    cert_id: certificate.id,
    cert_name: certificate.learnerName,
    cert_date: certificate.issuedAt,
    cert_course: courseId
  });
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}

function renderSharedCertificateViewFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const certId = params.get("cert_id");
  const certName = params.get("cert_name");
  const certDate = params.get("cert_date");
  const certCourse = params.get("cert_course");
  if (!certId || !certName || !certDate) return false;

  const courseTitle = COURSE_MAP[certCourse]?.title || "Learning Program";
  document.body.innerHTML = `
    <main class="container" style="padding-top:2rem;">
      <section class="panel certificate-public">
        <p class="eyebrow">Verified Achievement</p>
        <h1 style="margin:0.2rem 0 0.6rem;">${courseTitle}</h1>
        <p>This certifies that <strong>${certName}</strong> completed this course roadmap.</p>
        <p><strong>Certificate ID:</strong> ${certId}</p>
        <p><strong>Issued:</strong> ${new Date(certDate).toLocaleDateString()}</p>
        <a class="chip" href="${window.location.origin}${window.location.pathname}">Open Tracker</a>
      </section>
    </main>
  `;
  return true;
}

async function loadLogsForActiveCourse() {
  const logsPayload = await apiFetch(`/logs?courseId=${encodeURIComponent(state.activeCourseId)}`);
  state.logs = logsPayload.logs || [];
}

async function loadState() {
  const [profile, progressRaw, plansPayload, billingPayload] = await Promise.all([
    apiFetch("/profile"),
    apiFetch("/progress"),
    apiFetch("/billing/plans"),
    apiFetch("/billing/subscription")
  ]);
  state.profile = profile;
  state.progress = normalizeProgress(progressRaw);
  state.activeCourseId = state.progress.activeCourseId || COURSES[0].id;
  state.plans = plansPayload.plans || [];
  state.billing = billingPayload || { plan: "free", status: "active" };
  await loadLogsForActiveCourse();
}

async function persistProgress(nextProgress) {
  const payload = { activeCourseId: state.activeCourseId, courses: nextProgress.courses };
  const updated = await apiFetch("/progress", { method: "PUT", body: JSON.stringify(payload) });
  state.progress = normalizeProgress(updated);
}

function populateCourseSelect() {
  courseSelect.innerHTML = "";
  for (const course of COURSES) {
    const opt = document.createElement("option");
    opt.value = course.id;
    opt.textContent = course.title;
    courseSelect.appendChild(opt);
  }
  courseSelect.value = state.activeCourseId;
}

function populateWeekSelect() {
  const course = getActiveCourse();
  logWeek.innerHTML = "";
  for (const week of course.weeks) {
    const opt = document.createElement("option");
    opt.value = String(week.id);
    opt.textContent = `${week.title} - ${week.focus}`;
    logWeek.appendChild(opt);
  }
}

function calculateWeekHours(logs) {
  const map = {};
  for (const week of getActiveCourse().weeks) map[week.id] = 0;
  for (const log of logs) {
    const id = Number(log.weekNo);
    map[id] = Number(map[id] || 0) + Number(log.hours || 0);
  }
  return map;
}

function isCourseComplete() {
  const cp = activeCourseProgress();
  return getActiveCourse().weeks.every((w) => Boolean(cp.completedWeeks[w.id]));
}

function renderWeeks() {
  weeksGrid.innerHTML = "";
  const course = getActiveCourse();
  const cp = activeCourseProgress();
  const hoursMap = calculateWeekHours(state.logs);

  for (const week of course.weeks) {
    const taskState = cp.taskProgress[week.id] || Array.from({ length: week.tasks.length }, () => false);
    const doneTasks = taskState.filter(Boolean).length;
    const taskPct = Math.round((doneTasks / Math.max(1, week.tasks.length)) * 100);
    const isDone = Boolean(cp.completedWeeks[week.id]);

    const card = document.createElement("article");
    card.className = `week-card week-expand ${isDone ? "done" : ""}`;

    card.innerHTML = `
      <details>
        <summary>
          <div class="week-summary-left">
            <h4>${week.title}</h4>
            <p class="muted">${week.focus}</p>
          </div>
          <div class="week-summary-right">
            <span class="week-hours">${Number(hoursMap[week.id] || 0)}h logged</span>
            <span class="task-pct">${doneTasks}/${week.tasks.length} tasks</span>
          </div>
        </summary>

        <div class="week-line">
          <label>
            <input type="checkbox" class="week-complete-checkbox" data-week-id="${week.id}" ${isDone ? "checked" : ""}>
            Mark week complete
          </label>
          <span>${taskPct}% tasks done</span>
        </div>

        <div class="task-list">
          ${week.tasks
            .map(
              (task, idx) =>
                `<label class="task-item"><input type="checkbox" data-week="${week.id}" data-task-index="${idx}" ${taskState[idx] ? "checked" : ""}><span>${task}</span></label>`
            )
            .join("")}
        </div>

        <div class="week-refs">
          <p class="muted">References</p>
          <ul>
            ${week.references
              .map((ref) => `<li><a href="${absoluteOrRepoUrl(ref.url)}" target="_blank" rel="noreferrer">${ref.label}</a></li>`)
              .join("")}
          </ul>
        </div>
      </details>
    `;

    weeksGrid.appendChild(card);
  }

  weeksGrid.querySelectorAll(".week-complete-checkbox").forEach((el) => {
    el.addEventListener("change", async (e) => {
      const id = Number(e.target.dataset.weekId);
      const next = structuredClone(state.progress);
      next.courses[state.activeCourseId].completedWeeks[id] = e.target.checked;
      try {
        await persistProgress(next);
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
      const weekId = Number(e.target.dataset.week);
      const idx = Number(e.target.dataset.taskIndex);
      const next = structuredClone(state.progress);
      if (!Array.isArray(next.courses[state.activeCourseId].taskProgress[weekId])) {
        next.courses[state.activeCourseId].taskProgress[weekId] = [];
      }
      next.courses[state.activeCourseId].taskProgress[weekId][idx] = e.target.checked;
      try {
        await persistProgress(next);
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
  const cp = activeCourseProgress();
  const weeks = getActiveCourse().weeks;
  const done = weeks.filter((w) => cp.completedWeeks[w.id]).length;
  const totalWeeksCount = weeks.length;
  const pct = Math.round((done / Math.max(1, totalWeeksCount)) * 100);
  const total = state.logs.reduce((sum, l) => sum + Number(l.hours), 0);
  const streak = calcStreak(state.logs);

  completionPct.textContent = `${pct}%`;
  completionBar.style.width = `${pct}%`;
  totalHours.textContent = String(total);
  streakCount.textContent = `${streak} day${streak === 1 ? "" : "s"}`;
  weeksDone.textContent = `${done} / ${totalWeeksCount}`;

  const firstWeek = weeks[0];
  const hoursMap = calculateWeekHours(state.logs);
  goalStatus.textContent = `Goal: ${cp.goalWeeklyHours}h/week. ${firstWeek.title} logged: ${hoursMap[firstWeek.id] || 0}h.`;
}

function renderCertificate() {
  const cp = activeCourseProgress();
  const cert = cp.certificate;
  const enabled = isCourseComplete();

  generateCertBtn.disabled = !enabled;
  shareLinkedInBtn.disabled = !cert;
  shareXBtn.disabled = !cert;
  shareFacebookBtn.disabled = !cert;
  copyCertLinkBtn.disabled = !cert;

  if (!cert) {
    certificateCard.classList.add("hidden");
    certificateCard.innerHTML = "";
    return;
  }

  const certLink = buildCertificateLink(cert, state.activeCourseId);
  certificateCard.classList.remove("hidden");
  certificateCard.innerHTML = `
    <p class="eyebrow">Certificate Ready</p>
    <h3>${cert.learnerName}</h3>
    <p>Completed <strong>${getActiveCourse().title}</strong>.</p>
    <p><strong>ID:</strong> ${cert.id}</p>
    <p><strong>Issued:</strong> ${new Date(cert.issuedAt).toLocaleDateString()}</p>
    <p><a href="${certLink}" target="_blank" rel="noreferrer">Open public certificate</a></p>
  `;
}

function renderBilling() {
  if (!plansGrid || !billingStatus) return;
  const currentPlan = state.billing?.plan || "free";
  const currentStatus = state.billing?.status || "active";
  billingStatus.textContent = `Current plan: ${currentPlan.toUpperCase()} (${currentStatus})`;

  plansGrid.innerHTML = "";
  for (const plan of state.plans) {
    const isCurrent = plan.id === currentPlan;
    const card = document.createElement("article");
    card.className = `plan-card ${isCurrent ? "current" : ""}`;
    card.innerHTML = `
      <h3>${plan.name}</h3>
      <p class="plan-price">${plan.monthlyUsd === 0 ? "Free" : `$${plan.monthlyUsd}/month`}</p>
      <ul>
        ${(plan.features || []).map((f) => `<li>${f}</li>`).join("")}
      </ul>
      <button data-plan-id="${plan.id}" ${isCurrent ? "disabled" : ""}>
        ${isCurrent ? "Current Plan" : plan.id === "free" ? "Downgrade to Free" : `Upgrade to ${plan.name}`}
      </button>
    `;
    plansGrid.appendChild(card);
  }
}

function renderApp(user) {
  const fullName = state.profile.fullName || user.attributes.name || user.attributes.email;
  welcomeText.textContent = `Welcome, ${fullName}`;
  joinedText.textContent = `Email: ${user.attributes.email} | Joined: ${new Date(state.profile.createdAt).toLocaleDateString()}`;

  populateCourseSelect();
  populateWeekSelect();
  goalHours.value = activeCourseProgress().goalWeeklyHours;

  renderStats();
  renderWeeks();
  renderLogs();
  renderCertificate();
  renderBilling();
}

async function renderAuthState() {
  if (!hasConfig || !AmplifyApi || !AuthApi) {
    setupNotice.classList.remove("hidden");
    authSection.classList.add("hidden");
    appSection.classList.add("hidden");
    if (hasConfig && (!AmplifyApi || !AuthApi)) showMessage("Auth library failed to load. Refresh once and try again.");
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

courseSelect?.addEventListener("change", async () => {
  const nextCourseId = courseSelect.value;
  if (!COURSE_MAP[nextCourseId]) return;

  state.activeCourseId = nextCourseId;
  const next = structuredClone(state.progress);
  next.activeCourseId = nextCourseId;
  if (!next.courses[nextCourseId]) next.courses[nextCourseId] = createCourseProgress(nextCourseId);

  try {
    await persistProgress(next);
    await loadLogsForActiveCourse();
    renderApp(await AuthApi.currentAuthenticatedUser());
    showMessage(`Switched to ${COURSE_MAP[nextCourseId].title}.`, false);
  } catch (err) {
    showMessage(err.message);
  }
});

plansGrid?.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-plan-id]");
  if (!btn) return;
  const planId = btn.dataset.planId;
  if (!planId || planId === state.billing?.plan) return;

  try {
    if (planId === "free") {
      const updated = await apiFetch("/billing/set-plan", {
        method: "POST",
        body: JSON.stringify({ plan: "free", status: "active" })
      });
      state.billing = { plan: updated.plan, status: updated.status, updatedAt: updated.updatedAt };
      renderBilling();
      showMessage("Plan updated to Free.", false);
      return;
    }

    const checkout = await apiFetch("/billing/create-checkout-session", {
      method: "POST",
      body: JSON.stringify({ planId })
    });
    if (!checkout.checkoutUrl) {
      throw new Error("Checkout URL was not returned.");
    }
    window.open(checkout.checkoutUrl, "_blank");
  } catch (err) {
    showMessage(err.message || "Could not start checkout.");
  }
});

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!hasConfig) return;

  const fullName = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPass").value;

  try {
    const result = await AuthApi.signUp({ username: email, password, attributes: { email, name: fullName } });
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
      body: JSON.stringify({ courseId: state.activeCourseId, logDate, weekNo, topic, hours, notes })
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
    const next = structuredClone(state.progress);
    next.courses[state.activeCourseId].goalWeeklyHours = goal;
    await persistProgress(next);
    renderStats();
    showMessage("Goal updated.", false);
  } catch (err) {
    showMessage(err.message);
  }
});

generateCertBtn?.addEventListener("click", async () => {
  if (!isCourseComplete()) {
    showMessage("Complete all weeks in this course before generating certificate.");
    return;
  }

  const cert = {
    id: `CERT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    learnerName: state.profile.fullName || "Learner",
    issuedAt: new Date().toISOString()
  };

  try {
    const next = structuredClone(state.progress);
    next.courses[state.activeCourseId].certificate = cert;
    await persistProgress(next);
    renderCertificate();
    showMessage("Certificate generated.", false);
  } catch (err) {
    showMessage(err.message);
  }
});

shareLinkedInBtn?.addEventListener("click", () => {
  const cert = activeCourseProgress().certificate;
  if (!cert) return;
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(buildCertificateLink(cert, state.activeCourseId))}`, "_blank");
});

shareXBtn?.addEventListener("click", () => {
  const cert = activeCourseProgress().certificate;
  if (!cert) return;
  const url = buildCertificateLink(cert, state.activeCourseId);
  const text = `I completed the ${getActiveCourse().title} roadmap.`;
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");
});

shareFacebookBtn?.addEventListener("click", () => {
  const cert = activeCourseProgress().certificate;
  if (!cert) return;
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(buildCertificateLink(cert, state.activeCourseId))}`, "_blank");
});

copyCertLinkBtn?.addEventListener("click", async () => {
  const cert = activeCourseProgress().certificate;
  if (!cert) return;
  try {
    await navigator.clipboard.writeText(buildCertificateLink(cert, state.activeCourseId));
    showMessage("Certificate link copied.", false);
  } catch {
    showMessage("Could not copy link.");
  }
});

exportBtn.addEventListener("click", async () => {
  if (!hasConfig) return;

  try {
    const allLogs = await apiFetch("/logs");
    const payload = JSON.stringify({
      exportedAt: new Date().toISOString(),
      profile: state.profile,
      progress: state.progress,
      logs: allLogs.logs || []
    }, null, 2);

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
    const imported = JSON.parse(await file.text());
    if (!imported.progress || !Array.isArray(imported.logs)) throw new Error("Invalid import file format.");

    await apiFetch("/import", { method: "POST", body: JSON.stringify(imported) });
    await loadState();
    renderApp(await AuthApi.currentAuthenticatedUser());
    showMessage("Data imported successfully.", false);
  } catch (err) {
    showMessage(err.message || "Could not import file.");
  }

  importInput.value = "";
});

loadConfigBtn?.addEventListener("click", () => {
  configEditor.value = JSON.stringify(CATALOG, null, 2);
  showMessage("Loaded current course config into editor.", false);
});

applyConfigBtn?.addEventListener("click", async () => {
  try {
    const parsed = JSON.parse(configEditor.value || "{}");
    applyCatalog(parsed, true);

    if (state.progress) {
      const next = normalizeProgress(state.progress);
      next.activeCourseId = COURSE_MAP[state.activeCourseId] ? state.activeCourseId : COURSES[0].id;
      state.progress = next;
      await persistProgress(next);
      await loadLogsForActiveCourse();
      renderApp(await AuthApi.currentAuthenticatedUser());
    }

    showMessage("Course catalog applied successfully.", false);
  } catch (err) {
    showMessage(err.message || "Invalid course catalog JSON.");
  }
});

exportConfigBtn?.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(CATALOG, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "course-catalog.json";
  a.click();
  URL.revokeObjectURL(url);
});

resetConfigBtn?.addEventListener("click", async () => {
  localStorage.removeItem(CATALOG_STORAGE_KEY);
  await loadCatalog();
  configEditor.value = JSON.stringify(CATALOG, null, 2);

  if (state.progress) {
    const next = normalizeProgress(state.progress);
    state.activeCourseId = COURSE_MAP[state.activeCourseId] ? state.activeCourseId : COURSES[0].id;
    next.activeCourseId = state.activeCourseId;
    state.progress = next;
    await persistProgress(next);
    await loadLogsForActiveCourse();
    renderApp(await AuthApi.currentAuthenticatedUser());
  }

  showMessage("Reset to default catalog from file.", false);
});

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

document.getElementById("logDate").value = new Date().toISOString().split("T")[0];
setAuthPane("login");

(async () => {
  await loadCatalog();
  configEditor.value = JSON.stringify(CATALOG, null, 2);

  if (!renderSharedCertificateViewFromUrl()) {
    await renderAuthState();
  }
})();
