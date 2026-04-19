const monthFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric"
});

const fullDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric"
});

const shortDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric"
});

const liveTime = document.getElementById("live-time");
const liveDate = document.getElementById("live-date");
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const taskTotal = document.getElementById("task-total");
const taskProgress = document.getElementById("task-progress");
const reminderForm = document.getElementById("reminder-form");
const reminderTitle = document.getElementById("reminder-title");
const reminderText = document.getElementById("reminder-text");
const reminderList = document.getElementById("reminder-list");
const calendarTitle = document.getElementById("calendar-title");
const calendarGrid = document.getElementById("calendar-grid");
const selectedDateLabel = document.getElementById("selected-date-label");
const selectedDateCopy = document.getElementById("selected-date-copy");
const prevMonth = document.getElementById("prev-month");
const nextMonth = document.getElementById("next-month");

const now = new Date();
let currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
let selectedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

const tasks = [
  { id: crypto.randomUUID(), title: "Planejar a semana", done: true },
  { id: crypto.randomUUID(), title: "Separar ideias do projeto", done: false },
  { id: crypto.randomUUID(), title: "Organizar referências visuais", done: false }
];

const reminders = [
  {
    id: crypto.randomUUID(),
    title: "Lembrete fofo",
    text: "Escolha um dia do calendário para imaginar onde cada plano da semana vai ficar."
  },
  {
    id: crypto.randomUUID(),
    title: "Próximo passo",
    text: "Você pode transformar essa tela em algo com salvamento depois, se quiser."
  }
];

const noteDates = new Set([
  keyFromDate(now),
  keyFromDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2)),
  keyFromDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5))
]);

function keyFromDate(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function updateClock() {
  const current = new Date();
  liveTime.textContent = current.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  });
  liveDate.textContent = fullDateFormatter.format(current);
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderTasks() {
  taskList.innerHTML = "";

  if (!tasks.length) {
    taskList.innerHTML = '<li class="empty">Nenhuma tarefa adicionada ainda.</li>';
  } else {
    tasks.forEach((task) => {
      const item = document.createElement("li");
      item.className = "task-item" + (task.done ? " is-done" : "");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "task-check";
      checkbox.checked = task.done;
      checkbox.addEventListener("change", () => {
        task.done = checkbox.checked;
        renderTasks();
      });

      const text = document.createElement("div");
      text.className = "task-text";
      text.innerHTML = `<strong>${escapeHtml(task.title)}</strong><span>${task.done ? "Concluída com carinho" : "Pendente para hoje"}</span>`;

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "mini-button";
      remove.textContent = "×";
      remove.addEventListener("click", () => {
        const index = tasks.findIndex((entry) => entry.id === task.id);
        tasks.splice(index, 1);
        renderTasks();
      });

      item.append(checkbox, text, remove);
      taskList.append(item);
    });
  }

  const total = tasks.length;
  const done = tasks.filter((task) => task.done).length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  taskTotal.textContent = String(total);
  taskProgress.textContent = `${percent}%`;
}

function renderReminders() {
  reminderList.innerHTML = "";

  if (!reminders.length) {
    reminderList.innerHTML = '<li class="empty">Nenhum lembrete salvo por aqui.</li>';
    return;
  }

  reminders.forEach((reminder) => {
    const item = document.createElement("li");
    item.className = "reminder-item";
    item.innerHTML = `
      <div>
        <strong>${escapeHtml(reminder.title)}</strong>
        <span>${escapeHtml(reminder.text)}</span>
      </div>
    `;

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "mini-button";
    remove.textContent = "×";
    remove.addEventListener("click", () => {
      const index = reminders.findIndex((entry) => entry.id === reminder.id);
      reminders.splice(index, 1);
      renderReminders();
    });

    item.append(remove);
    reminderList.append(item);
  });
}

function renderCalendar() {
  calendarGrid.innerHTML = "";
  calendarTitle.textContent = monthFormatter.format(currentMonth);

  const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startOffset = start.getDay();
  const totalSlots = Math.ceil((startOffset + end.getDate()) / 7) * 7;

  for (let index = 0; index < totalSlots; index += 1) {
    const dayNumber = index - startOffset + 1;
    const cellDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNumber);
    const inCurrentMonth = cellDate.getMonth() === currentMonth.getMonth();
    const isToday = keyFromDate(cellDate) === keyFromDate(now);
    const isSelected = keyFromDate(cellDate) === keyFromDate(selectedDate);
    const hasNotes = noteDates.has(keyFromDate(cellDate));

    const button = document.createElement("button");
    button.type = "button";
    button.className = "calendar-day";

    if (!inCurrentMonth) button.classList.add("muted");
    if (isToday) button.classList.add("today");
    if (isSelected) button.classList.add("selected");
    if (hasNotes) button.classList.add("has-notes");

    button.innerHTML = `<strong>${cellDate.getDate()}</strong><small>${hasNotes ? "com nota" : "livre"}</small>`;
    button.addEventListener("click", () => {
      selectedDate = new Date(cellDate);
      renderCalendar();
      updateSelectedDate();
    });

    calendarGrid.append(button);
  }
}

function updateSelectedDate() {
  selectedDateLabel.textContent = fullDateFormatter.format(selectedDate);

  const selectedKey = keyFromDate(selectedDate);
  const hasNote = noteDates.has(selectedKey);
  selectedDateCopy.textContent = hasNote
    ? `Esse dia já está destacado na agenda visual. Você pode usar a lista de lembretes ao lado para anotar o que vai acontecer em ${shortDateFormatter.format(selectedDate)}.`
    : `Ainda não existe destaque prévio para ${shortDateFormatter.format(selectedDate)}, então ele está livre para receber novos planos, eventos ou lembretes.`;
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = taskInput.value.trim();
  if (!value) return;

  tasks.unshift({
    id: crypto.randomUUID(),
    title: value,
    done: false
  });

  taskInput.value = "";
  renderTasks();
});

reminderForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = reminderTitle.value.trim();
  const text = reminderText.value.trim();
  if (!title || !text) return;

  reminders.unshift({
    id: crypto.randomUUID(),
    title,
    text
  });

  reminderTitle.value = "";
  reminderText.value = "";
  renderReminders();
});

prevMonth.addEventListener("click", () => {
  currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
  renderCalendar();
});

nextMonth.addEventListener("click", () => {
  currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
  renderCalendar();
});

updateClock();
setInterval(updateClock, 1000);
renderTasks();
renderReminders();
renderCalendar();
updateSelectedDate();
