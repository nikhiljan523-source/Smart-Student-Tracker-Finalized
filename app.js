// Smart Student Tracker - FULL FINAL JS

(function () {

  // AUTH CHECK
  const sessionRaw = localStorage.getItem("sst_user");
  if (!sessionRaw) {
    window.location.href = "login.html";
  }
  const session = JSON.parse(sessionRaw || "{}");

  // HELPERS
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));
  const uid = (p = "id") => p + Math.random().toString(36).slice(2, 9);

  // PROFILE
  qs("#userName").textContent = session.name || session.uid || "User";
  qs("#userRole").textContent = session.type === "professor" ? "Professor" : "Student";
  qs("#profileAvatar").textContent = (session.name || session.uid || "U")[0];

  // STORAGE KEYS
  const COURSES_KEY = "sst_courses_v1";
  const TASKS_KEY = "sst_tasks_v1";

  // DEFAULT COURSES
  const demoCourses = [
    { id: uid("c"), name: "Web Design", lessons: 10, level: "Elementary" },
    { id: uid("c"), name: "Data with Python", lessons: 5, level: "Intermediate" },
    { id: uid("c"), name: "JavaScript", lessons: 8, level: "Elementary" },
  ];

  // LOAD / SAVE
  const load = (k, f) => {
    try {
      return JSON.parse(localStorage.getItem(k)) || f;
    } catch {
      return f;
    }
  };
  const save = (k, d) => localStorage.setItem(k, JSON.stringify(d));

  let courses = load(COURSES_KEY, demoCourses.slice());
  let tasks = load(TASKS_KEY, []);

  // NAVIGATION
  const navItems = qsa(".nav-item");
  navItems.forEach((b) =>
    b.addEventListener("click", () => showView(b.dataset.view))
  );

  function showView(view) {
    navItems.forEach((b) => b.classList.toggle("active", b.dataset.view === view));
    qsa(".view").forEach((v) => v.classList.add("hidden"));
    qs(`#view-${view}`).classList.remove("hidden");
    renderAll();
  }

  function renderAll() {
    renderDashboard();
    renderCourses();
    renderTasks();
    populateTaskCourseSelect();
    renderProgress();
    renderCalendar();
  }

  // DASHBOARD
  function renderDashboard() {
    const container = qs("#dashboardCourses");
    container.innerHTML = "";

    if (!courses.length) {
      container.innerHTML = "<div class='small'>No courses yet</div>";
      return;
    }

    courses.forEach((c) => {
      const el = document.createElement("div");
      el.className = "course-tile";
      el.innerHTML = `
        <div class="tile-head">
          <strong>${c.name}</strong>
          <div class="small">${c.level}</div>
        </div>
        <div class="tile-body">
          <div class="lessons">${c.lessons} lessons</div>
          <div class="tile-actions">
            <button class="secondary" data-id="${c.id}" data-action="edit">Edit</button>
            <button data-id="${c.id}" data-action="del">Delete</button>
          </div>
        </div>
      `;

      container.appendChild(el);
    });

    qsa('#dashboardCourses button[data-action="edit"]').forEach(
      (b) => (b.onclick = onEditCourse)
    );
    qsa('#dashboardCourses button[data-action="del"]').forEach(
      (b) => (b.onclick = onDeleteCourse)
    );
  }

  // COURSES
  const courseForm = qs("#courseForm");
  const courseName = qs("#courseName");
  const courseLessons = qs("#courseLessons");
  const courseLevel = qs("#courseLevel");
  let editingCourseId = null;

  courseForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = courseName.value.trim();
    const lessons = parseInt(courseLessons.value) || 1;
    const level = courseLevel.value;

    if (!name) return alert("Course name required");

    if (editingCourseId) {
      const c = courses.find((x) => x.id === editingCourseId);
      if (c) {
        c.name = name;
        c.lessons = lessons;
        c.level = level;
      }
      editingCourseId = null;
    } else {
      courses.unshift({ id: uid("c"), name, lessons, level });
    }

    save(COURSES_KEY, courses);
    courseForm.reset();
    showView("courses");
  });

  qs("#cancelCourse")?.addEventListener("click", () => {
    editingCourseId = null;
    courseForm.reset();
  });

  function renderCourses() {
    const grid = qs("#coursesGrid");
    grid.innerHTML = "";

    courses.forEach((c) => {
      const stats = getCourseTaskStats(c.id);
      const percent = stats.total
        ? Math.round((stats.done / stats.total) * 100)
        : 0;

      const div = document.createElement("div");
      div.className = "course-card-rich";
      div.innerHTML = `
        <div class="title">${c.name}</div>
        <div class="meta">${c.lessons} lessons</div>
        <div class="badge ${c.level.toLowerCase()}">${c.level}</div>
        <div class="progress-bar">
          <div class="progress" style="width:${percent}%"></div>
        </div>
        <div class="actions" style="margin-top:12px;">
          <button class="secondary" data-id="${c.id}" data-action="edit">Edit</button>
          <button data-id="${c.id}" data-action="del">Delete</button>
        </div>
      `;
      grid.appendChild(div);
    });

    qsa('#coursesGrid button[data-action="edit"]').forEach(
      (b) => (b.onclick = onEditCourse)
    );
    qsa('#coursesGrid button[data-action="del"]').forEach(
      (b) => (b.onclick = onDeleteCourse)
    );
  }

  function onEditCourse(e) {
    const id = e.currentTarget.dataset.id;
    const c = courses.find((x) => x.id === id);
    if (!c) return;

    editingCourseId = id;
    courseName.value = c.name;
    courseLessons.value = c.lessons;
    courseLevel.value = c.level;

    showView("courses");
  }

  function onDeleteCourse(e) {
    const id = e.currentTarget.dataset.id;
    if (!confirm("Delete this course?")) return;

    courses = courses.filter((x) => x.id !== id);
    tasks = tasks.filter((t) => t.courseId !== id);
    save(COURSES_KEY, courses);
    save(TASKS_KEY, tasks);

    renderAll();
  }

  // TASKS
  const taskForm = qs("#taskForm");
  const taskTitle = qs("#taskTitle");
  const taskCourse = qs("#taskCourse");
  const taskDue = qs("#taskDue");

  taskForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = taskTitle.value.trim();
    if (!title) return alert("Task title required");

    tasks.unshift({
      id: uid("t"),
      title,
      courseId: taskCourse.value,
      due: taskDue.value,
      done: false,
    });

    save(TASKS_KEY, tasks);
    taskForm.reset();
    renderTasks();
    renderProgress();
  });

  function populateTaskCourseSelect() {
    if (!taskCourse) return;
    taskCourse.innerHTML = "";

    courses.forEach((c) => {
      const op = document.createElement("option");
      op.value = c.id;
      op.textContent = c.name;
      taskCourse.appendChild(op);
    });
  }

  function renderTasks() {
    const box = qs("#tasksList");
    box.innerHTML = "";

    if (!tasks.length) {
      box.innerHTML = "<div class='small'>No tasks yet</div>";
      return;
    }

    tasks.forEach((t) => {
      const c = courses.find((x) => x.id === t.courseId);
      const div = document.createElement("div");
      div.className = "task";
      div.innerHTML = `
        <div>
          <strong>${t.title}</strong>
          <div class="small">${c ? c.name : ""} ${t.due ? "• due " + t.due : ""}</div>
        </div>
        <div>
          <input type="checkbox" data-id="${t.id}" ${t.done ? "checked" : ""}>
          <button class="secondary" data-id="${t.id}" data-action="remove">Delete</button>
        </div>
      `;
      box.appendChild(div);
    });

    qsa('#tasksList input[type=checkbox]').forEach(
      (cb) => (cb.onchange = toggleTask)
    );
    qsa('#tasksList button[data-action=remove]').forEach(
      (b) => (b.onclick = removeTask)
    );
  }

  function toggleTask(e) {
    const t = tasks.find((x) => x.id === e.currentTarget.dataset.id);
    if (!t) return;
    t.done = e.currentTarget.checked;

    save(TASKS_KEY, tasks);
    renderProgress();
  }

  function removeTask(e) {
    if (!confirm("Delete task?")) return;
    tasks = tasks.filter((t) => t.id !== e.currentTarget.dataset.id);

    save(TASKS_KEY, tasks);
    renderAll();
  }

  // PROGRESS
  function getCourseTaskStats(courseId) {
    const t = tasks.filter((x) => x.courseId === courseId);
    return {
      total: t.length,
      done: t.filter((x) => x.done).length,
    };
  }

  function renderProgress() {
    const box = qs("#progressList");
    box.innerHTML = "";

    courses.forEach((c) => {
      const st = getCourseTaskStats(c.id);
      const percent = st.total
        ? Math.round((st.done / st.total) * 100)
        : 0;

      const row = document.createElement("div");
      row.className = "progress-item";

      row.innerHTML = `
        <div>
          <strong>${c.name}</strong>
          <div class="small">${st.done}/${st.total} tasks completed</div>
        </div>
        <div class="progress-item-bar">
          <div class="pbar-fill" style="width:${percent}%"></div>
        </div>
        <div style="width:40px;text-align:right;">
          <strong>${percent}%</strong>
        </div>
      `;

      box.appendChild(row);
    });
  }

  // CALENDAR
  let currentMonth = new Date();
  const monthGrid = qs("#monthGrid");
  const calPrev = qs("#calPrev");
  const calNext = qs("#calNext");
  const calToday = qs("#calToday");
  const calendarTitle = qs("#calendarTitle");

  const datePanel = qs("#datePanel");
  const dpDateLabel = qs("#dpDateLabel");
  const dpEvents = qs("#dpEvents");
  const dpAddForm = qs("#dpAddForm");
  const dpTitle = qs("#dpTitle");
  const dpCourseSelect = qs("#dpCourseSelect");
  const closeDp = qs("#closeDp");
  const dpCancel = qs("#dpCancel");

  calPrev.onclick = () => {
    currentMonth.setMonth(currentMonth.getMonth() - 1);
    renderCalendar();
  };
  calNext.onclick = () => {
    currentMonth.setMonth(currentMonth.getMonth() + 1);
    renderCalendar();
  };
  calToday.onclick = () => {
    currentMonth = new Date();
    renderCalendar();
  };

  function renderCalendar() {
    monthGrid.innerHTML = "";

    const y = currentMonth.getFullYear();
    const m = currentMonth.getMonth();

    const monthStart = new Date(y, m, 1);
    const monthEnd = new Date(y, m + 1, 0);

    const startDay = monthStart.getDay();
    const totalDays = monthEnd.getDate();

    const monthNames = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ];

    calendarTitle.textContent = `${monthNames[m]} ${y}`;

    ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach((w) => {
      const h = document.createElement("div");
      h.className = "weekday";
      h.textContent = w;
      monthGrid.appendChild(h);
    });

    for (let i = 0; i < startDay; i++) {
      const empty = document.createElement("div");
      empty.className = "day-cell inactive";
      monthGrid.appendChild(empty);
    }

    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(y, m, d);

      const div = document.createElement("div");
      div.className = "day-cell";
      div.innerHTML = `<div class="day-num">${d}</div>`;

      const events = tasks.filter((t) => t.due === formatDate(date));
      events.forEach(() => {
        const dot = document.createElement("div");
        dot.className = "event-dot";
        div.appendChild(dot);
      });

      div.onclick = () => openDatePanel(date);
      monthGrid.appendChild(div);
    }
  }

  function openDatePanel(date) {
    datePanel.classList.remove("hidden");
    dpDateLabel.textContent = date.toLocaleDateString();

    const f = formatDate(date);
    dpEvents.innerHTML = "";

    const ev = tasks.filter((t) => t.due === f);

    if (!ev.length) {
      dpEvents.innerHTML = `<div class="small" style="padding:10px;">No events</div>`;
    }

    ev.forEach((e) => {
      const row = document.createElement("div");
      row.className = "evt";

      const c = courses.find((x) => x.id === e.courseId);

      row.innerHTML = `
        <div>
          <strong>${e.title}</strong>
          <div class="small">${c ? c.name : ""}</div>
        </div>
        <button class="secondary" data-id="${e.id}">×</button>
      `;

      row.querySelector("button").onclick = () => {
        tasks = tasks.filter((t) => t.id !== e.id);
        save(TASKS_KEY, tasks);
        openDatePanel(date); 
        renderCalendar();
        renderProgress();
        renderTasks();
      };

      dpEvents.appendChild(row);
    });

    dpCourseSelect.innerHTML = "";
    courses.forEach((c) => {
      const o = document.createElement("option");
      o.value = c.id;
      o.textContent = c.name;
      dpCourseSelect.appendChild(o);
    });

    dpAddForm.onsubmit = (e) => {
      e.preventDefault();

      const title = dpTitle.value.trim();
      if (!title) return;

      tasks.push({
        id: uid("t"),
        title,
        courseId: dpCourseSelect.value,
        due: f,
        done: false,
      });

      save(TASKS_KEY, tasks);
      dpTitle.value = "";

      openDatePanel(date);
      renderCalendar();
      renderTasks();
      renderProgress();
    };
  }

  closeDp.onclick = () => datePanel.classList.add("hidden");
  dpCancel.onclick = () => datePanel.classList.add("hidden");

  function formatDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  }

  // GLOBAL SEARCH
  qs("#globalSearch")?.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase();

    qsa(".course-tile, .course-card-rich, .task").forEach((el) => {
      el.style.display = el.textContent.toLowerCase().includes(q)
        ? ""
        : "none";
    });
  });

  // SETTINGS
  qs("#resetData")?.addEventListener("click", () => {
    if (!confirm("Reset all data?")) return;

    courses = demoCourses.slice();
    tasks = [];
    save(COURSES_KEY, courses);
    save(TASKS_KEY, tasks);

    renderAll();
    alert("Data reset.");
  });

  qs("#logoutBtn")?.addEventListener("click", () => {
    if (!confirm("Logout?")) return;

    localStorage.removeItem("sst_user");
    location.href = "login.html";
  });

  // INITIAL LOAD
  renderAll();
  renderCalendar();
})();
