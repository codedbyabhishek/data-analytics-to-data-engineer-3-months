const DEFAULT_COURSE_ID = "analytics-to-de";

const COURSES = [
  {
    id: "analytics-to-de",
    title: "Data Analytics to Data Engineer",
    subtitle: "Zero to Professional in 12 Weeks",
    weeks: [
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
    ]
  },
  {
    id: "data-science-foundations",
    title: "Data Science Foundations",
    subtitle: "Math, ML basics, and model storytelling",
    weeks: [
      { id: 1, title: "Week 1", focus: "Python + NumPy" },
      { id: 2, title: "Week 2", focus: "Pandas + cleaning" },
      { id: 3, title: "Week 3", focus: "Statistics essentials" },
      { id: 4, title: "Week 4", focus: "Visualization + EDA" },
      { id: 5, title: "Week 5", focus: "Supervised ML basics" },
      { id: 6, title: "Week 6", focus: "Model evaluation" },
      { id: 7, title: "Week 7", focus: "Feature engineering" },
      { id: 8, title: "Week 8", focus: "Unsupervised learning" },
      { id: 9, title: "Week 9", focus: "Model tuning" },
      { id: 10, title: "Week 10", focus: "Mini ML project" },
      { id: 11, title: "Week 11", focus: "Deployment basics" },
      { id: 12, title: "Week 12", focus: "Portfolio + case study" }
    ]
  },
  {
    id: "business-analytics-pro",
    title: "Business Analytics Professional",
    subtitle: "Metrics, dashboards, and decision storytelling",
    weeks: [
      { id: 1, title: "Week 1", focus: "Business metrics foundations" },
      { id: 2, title: "Week 2", focus: "SQL for analytics" },
      { id: 3, title: "Week 3", focus: "Data cleaning workflow" },
      { id: 4, title: "Week 4", focus: "KPI tree design" },
      { id: 5, title: "Week 5", focus: "Dashboard UX" },
      { id: 6, title: "Week 6", focus: "A/B testing basics" },
      { id: 7, title: "Week 7", focus: "Cohort analysis" },
      { id: 8, title: "Week 8", focus: "Forecasting basics" },
      { id: 9, title: "Week 9", focus: "Stakeholder reporting" },
      { id: 10, title: "Week 10", focus: "Executive presentation" },
      { id: 11, title: "Week 11", focus: "End-to-end case project" },
      { id: 12, title: "Week 12", focus: "Portfolio + interview prep" }
    ]
  }
];

const COURSE_MAP = Object.fromEntries(COURSES.map((c) => [c.id, c]));

function makeWeekContent(course) {
  const content = {};
  for (const week of course.weeks) {
    content[week.id] = {
      tasks: [
        `Complete core study module for ${week.title}.`,
        `Practice at least 60 minutes on ${week.focus}.`,
        "Build one small hands-on task and commit to GitHub.",
        "Write weekly summary and next-week plan."
      ],
      refs: [
        { label: `${course.title} roadmap`, url: "week-by-week/12-week-roadmap.md" },
        { label: "Free learning resources", url: "resources/free-learning-resources.md" }
      ]
    };
  }
  return content;
}

const COURSE_CONTENT = Object.fromEntries(COURSES.map((c) => [c.id, makeWeekContent(c)]));

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

const config = window.AWS_CONFIG || {};
const hasConfig = Boolean(
  config.REGION && config.USER_POOL_ID && config.USER_POOL_CLIENT_ID && config.API_BASE_URL
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
  logs: [],
  activeCourseId: DEFAULT_COURSE_ID
};

function getActiveCourse() {
  return COURSE_MAP[state.activeCourseId] || COURSE_MAP[DEFAULT_COURSE_ID];
}

function createCourseProgress(courseId) {
  const course = COURSE_MAP[courseId] || COURSE_MAP[DEFAULT_COURSE_ID];
  const completedWeeks = {};
  const taskProgress = {};
  for (const week of course.weeks) {
    completedWeeks[week.id] = false;
    taskProgress[week.id] = Array.from({ length: (COURSE_CONTENT[course.id]?.[week.id]?.tasks || []).length }, () => false);
  }
  return {
    goalWeeklyHours: 20,
    completedWeeks,
    taskProgress,
    certificate: null
  };
}

function defaultCoursesProgress() {
  const result = {};
  for (const course of COURSES) result[course.id] = createCourseProgress(course.id);
  return result;
}

function normalizeProgress(progress) {
  if (!progress || typeof progress !== "object") {
    return { activeCourseId: DEFAULT_COURSE_ID, courses: defaultCoursesProgress() };
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
      activeCourseId: COURSE_MAP[progress.activeCourseId] ? progress.activeCourseId : DEFAULT_COURSE_ID,
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
  const cp = state.progress?.courses?.[state.activeCourseId];
  return cp || createCourseProgress(state.activeCourseId);
}

function setAuthPane(pane) {
  const panes = { signup: signupPane, login: loginPane, verify: verifyPane };
  const tabs = { signup: tabSignupBtn, login: tabLoginBtn, verify: tabVerifyBtn };

  Object.entries(panes).forEach(([key, el]) => el && el.classList.toggle("hidden", key !== pane));
  Object.entries(tabs).forEach(([key, el]) => el && el.classList.toggle("active", key === pane));
}

function showMessage(msg, isError = true) {
  messageEl.style.color = isError ? "#b42318" : "#00703c";
  messageEl.textContent = msg;
  setTimeout(() => {
    if (messageEl.textContent === msg) messageEl.textContent = "";
  }, 4000);
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

async function loadState() {
  const [profile, progressRaw] = await Promise.all([apiFetch("/profile"), apiFetch("/progress")]);
  state.profile = profile;
  state.progress = normalizeProgress(progressRaw);
  state.activeCourseId = state.progress.activeCourseId || DEFAULT_COURSE_ID;
  await loadLogsForActiveCourse();
}

async function loadLogsForActiveCourse() {
  const logsPayload = await apiFetch(`/logs?courseId=${encodeURIComponent(state.activeCourseId)}`);
  state.logs = logsPayload.logs || [];
}

async function persistProgress(nextProgress) {
  const payload = {
    activeCourseId: state.activeCourseId,
    courses: nextProgress.courses
  };
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
  for (const wk of course.weeks) {
    const opt = document.createElement("option");
    opt.value = String(wk.id);
    opt.textContent = `${wk.title} - ${wk.focus}`;
    logWeek.appendChild(opt);
  }
}

function calculateWeekHours(logs) {
  const map = {};
  for (const wk of getActiveCourse().weeks) map[wk.id] = 0;
  for (const log of logs) {
    const w = Number(log.weekNo);
    map[w] = Number(map[w] || 0) + Number(log.hours || 0);
  }
  return map;
}

function renderWeeks() {
  weeksGrid.innerHTML = "";
  const course = getActiveCourse();
  const cp = activeCourseProgress();
  const hoursMap = calculateWeekHours(state.logs);
  const content = COURSE_CONTENT[course.id] || {};

  for (const wk of course.weeks) {
    const weekTasks = content[wk.id]?.tasks || [];
    const weekRefs = content[wk.id]?.refs || [];
    const taskState = cp.taskProgress[wk.id] || Array.from({ length: weekTasks.length }, () => false);
    const doneTasks = taskState.filter(Boolean).length;
    const isDone = Boolean(cp.completedWeeks[wk.id]);
    const taskPct = Math.round((doneTasks / Math.max(1, weekTasks.length)) * 100);

    const card = document.createElement("article");
    card.className = `week-card week-expand ${isDone ? "done" : ""}`;

    card.innerHTML = `
      <details>
        <summary>
          <div class="week-summary-left">
            <h4>${wk.title}</h4>
            <p class="muted">${wk.focus}</p>
          </div>
          <div class="week-summary-right">
            <span class="week-hours">${Number(hoursMap[wk.id] || 0)}h logged</span>
            <span class="task-pct">${doneTasks}/${weekTasks.length} tasks</span>
          </div>
        </summary>

        <div class="week-line">
          <label>
            <input type="checkbox" class="week-complete-checkbox" data-week-id="${wk.id}" ${isDone ? "checked" : ""}>
            Mark week complete
          </label>
          <span>${taskPct}% tasks done</span>
        </div>

        <div class="task-list">
          ${weekTasks
            .map(
              (task, idx) =>
                `<label class="task-item"><input type="checkbox" data-week="${wk.id}" data-task-index="${idx}" ${taskState[idx] ? "checked" : ""}><span>${task}</span></label>`
            )
            .join("")}
        </div>

        <div class="week-refs">
          <p class="muted">References</p>
          <ul>
            ${weekRefs
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
      const weekId = Number(e.target.dataset.weekId);
      const next = structuredClone(state.progress);
      next.courses[state.activeCourseId].completedWeeks[weekId] = e.target.checked;
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
  const course = getActiveCourse();
  const cp = activeCourseProgress();
  const done = Object.values(cp.completedWeeks || {}).filter(Boolean).length;
  const totalWeeksCount = course.weeks.length;
  const percent = Math.round((done / Math.max(1, totalWeeksCount)) * 100);
  const total = state.logs.reduce((sum, l) => sum + Number(l.hours), 0);
  const streak = calcStreak(state.logs);

  completionPct.textContent = `${percent}%`;
  completionBar.style.width = `${percent}%`;
  totalHours.textContent = String(total);
  streakCount.textContent = `${streak} day${streak === 1 ? "" : "s"}`;
  weeksDone.textContent = `${done} / ${totalWeeksCount}`;

  const firstWeekId = course.weeks[0]?.id;
  const hoursMap = calculateWeekHours(state.logs);
  goalStatus.textContent = `Goal: ${cp.goalWeeklyHours}h/week. ${course.weeks[0]?.title || "Current week"} logged: ${hoursMap[firstWeekId] || 0}h.`;
}

function isCourseComplete() {
  const cp = activeCourseProgress();
  const course = getActiveCourse();
  return course.weeks.every((w) => Boolean(cp.completedWeeks[w.id]));
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

  const nextProgress = structuredClone(state.progress);
  nextProgress.activeCourseId = nextCourseId;
  if (!nextProgress.courses[nextCourseId]) nextProgress.courses[nextCourseId] = createCourseProgress(nextCourseId);

  try {
    await persistProgress(nextProgress);
    await loadLogsForActiveCourse();
    populateWeekSelect();
    goalHours.value = activeCourseProgress().goalWeeklyHours;
    renderStats();
    renderWeeks();
    renderLogs();
    renderCertificate();
    showMessage(`Switched to ${COURSE_MAP[nextCourseId].title}.`, false);
  } catch (err) {
    showMessage(err.message);
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
  const url = buildCertificateLink(cert, state.activeCourseId);
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank");
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
  const url = buildCertificateLink(cert, state.activeCourseId);
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
});

copyCertLinkBtn?.addEventListener("click", async () => {
  const cert = activeCourseProgress().certificate;
  if (!cert) return;
  const url = buildCertificateLink(cert, state.activeCourseId);
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
    const allLogs = await apiFetch("/logs");
    const payload = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        profile: state.profile,
        progress: state.progress,
        logs: allLogs.logs || []
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
    if (!imported.progress || !Array.isArray(imported.logs)) {
      throw new Error("Invalid import file format.");
    }

    await apiFetch("/import", { method: "POST", body: JSON.stringify(imported) });
    await loadState();
    const user = await AuthApi.currentAuthenticatedUser();
    renderApp(user);
    showMessage("Data imported successfully.", false);
  } catch (err) {
    showMessage(err.message || "Could not import file.");
  }

  importInput.value = "";
});

populateCourseSelect();
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
