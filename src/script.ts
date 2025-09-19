interface Task {
  id: number;
  text: string;
  completed: boolean;
  priority: string;
  dueDate: string;
  addedDate: string;
}

document.addEventListener("DOMContentLoaded", function (): void {
  // DOM Elements
  const homePage = document.getElementById("homePage") as HTMLElement;
  const appPage = document.getElementById("appPage") as HTMLElement;
  const getStartedBtn = document.getElementById(
    "getStartedBtn"
  ) as HTMLButtonElement;
  const hamburger = document.querySelector(".hamburger") as HTMLElement;
  const navMenu = document.querySelector(".nav-menu") as HTMLElement;
  const themeToggle = document.getElementById("themeToggle") as HTMLElement;
  const appThemeToggle = document.getElementById(
    "appThemeToggle"
  ) as HTMLElement;
  const body = document.body as HTMLBodyElement;

  // App functionality variables
  const taskInput = document.getElementById("taskInput") as HTMLInputElement;
  const dueDate = document.getElementById("dueDate") as HTMLInputElement;
  const prioritySelect = document.getElementById(
    "prioritySelect"
  ) as HTMLSelectElement;
  const addTaskBtn = document.getElementById("addTaskBtn") as HTMLButtonElement;
  const voiceInputBtn = document.getElementById(
    "voiceInputBtn"
  ) as HTMLButtonElement;
  const downloadBtn = document.getElementById(
    "downloadBtn"
  ) as HTMLButtonElement;
  const taskList = document.getElementById("taskList") as HTMLElement;
  const completedList = document.getElementById("completedList") as HTMLElement;
  const emptyState = document.getElementById("emptyState") as HTMLElement;
  const completedSection = document.getElementById(
    "completedSection"
  ) as HTMLElement;
  const totalTasksElement = document
    .getElementById("totalTasks")
    ?.querySelector("span") as HTMLElement;
  const completedTasksElement = document
    .getElementById("completedTasks")
    ?.querySelector("span") as HTMLElement;
  const activeTasksElement = document
    .getElementById("activeTasks")
    ?.querySelector("span") as HTMLElement;
  const filterButtons = document.querySelectorAll(
    ".filter-btn"
  ) as NodeListOf<HTMLElement>;
  const sortButtons = document.querySelectorAll(
    ".sort-btn"
  ) as NodeListOf<HTMLElement>;

  let tasks: Task[] = [];
  let taskId: number = 0;
  let currentFilter: string = "all";
  let currentSort: string = "priority";
  // Declare SpeechRecognition type for TypeScript
  type SpeechRecognitionType = typeof window & {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  };
  let recognition: any = null;

  // Load tasks from localStorage
  function loadTasksFromStorage(): void {
    const storedTasks = localStorage.getItem("priorityTasks");
    if (storedTasks) {
      tasks = JSON.parse(storedTasks);
      // Find the highest ID to continue from there
      if (tasks.length > 0) {
        taskId = Math.max(...tasks.map((task: Task) => task.id)) + 1;
      }
    }
  }

  // Save tasks to localStorage
  function saveTasksToStorage(): void {
    localStorage.setItem("priorityTasks", JSON.stringify(tasks));
  }

  // Check for saved theme preference or respect OS preference
  const savedTheme = localStorage.getItem("theme");
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

  // Set initial theme
  if (savedTheme === "dark" || (!savedTheme && prefersDarkScheme.matches)) {
    body.classList.add("dark-mode");
    updateThemeIcons("dark");
    appPage.className = "app-container dark-mode-bg";
    document.documentElement.classList.add("dark");
  } else {
    body.classList.remove("dark-mode");
    updateThemeIcons("light");
    appPage.className = "app-container light-mode-bg";
    document.documentElement.classList.remove("dark");
  }

  // Theme toggle functionality
  function toggleTheme(): void {
    if (body.classList.contains("dark-mode")) {
      body.classList.remove("dark-mode");
      appPage.className = "app-container light-mode-bg";
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      updateThemeIcons("light");
    } else {
      body.classList.add("dark-mode");
      appPage.className = "app-container dark-mode-bg";
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      updateThemeIcons("dark");
    }
  }

  // Update theme toggle icons
  function updateThemeIcons(theme: string): void {
    const icons = document.querySelectorAll(
      ".theme-toggle i"
    ) as NodeListOf<HTMLElement>;
    const appIcons = document.querySelectorAll(
      ".app-theme-toggle i"
    ) as NodeListOf<HTMLElement>;

    if (theme === "dark") {
      icons.forEach((icon: HTMLElement) => {
        icon.classList.remove("fa-moon");
        icon.classList.add("fa-sun");
      });
      appIcons.forEach((icon: HTMLElement) => {
        icon.classList.remove("fa-moon");
        icon.classList.add("fa-sun");
      });
    } else {
      icons.forEach((icon: HTMLElement) => {
        icon.classList.remove("fa-sun");
        icon.classList.add("fa-moon");
      });
      appIcons.forEach((icon: HTMLElement) => {
        icon.classList.remove("fa-sun");
        icon.classList.add("fa-moon");
      });
    }
  }

  // Event listeners for theme toggles
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }

  if (appThemeToggle) {
    appThemeToggle.addEventListener("click", toggleTheme);
  }

  // Mobile Navigation
  hamburger.addEventListener("click", function (): void {
    navMenu.classList.toggle("active");
    hamburger.classList.toggle("active");
  });

  // Close mobile menu when clicking on links
  document.querySelectorAll(".nav-link").forEach((link: Element) => {
    (link as HTMLElement).addEventListener("click", (): void => {
      navMenu.classList.remove("active");
      hamburger.classList.remove("active");
    });
  });

  // Get Started Button - Navigate to App Page
  getStartedBtn.addEventListener("click", function (e: Event): void {
    e.preventDefault();
    homePage.style.display = "none";
    appPage.style.display = "block";
    // Initialize the app if it's the first time
    if (tasks.length === 0) {
      initApp();
    }
  });

  // Home link in navigation
  const homeLink = document.querySelector(".home-link") as HTMLElement;
  if (homeLink) {
    homeLink.addEventListener("click", function (e: Event): void {
      e.preventDefault();
      homePage.style.display = "block";
      appPage.style.display = "none";
    });
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor: Element) => {
    (anchor as HTMLElement).addEventListener(
      "click",
      function (e: Event): void {
        e.preventDefault();
        const targetId = this.getAttribute("href");
        if (targetId === "#") return;

        const targetElement = document.querySelector(targetId as string);
        if (targetElement) {
          window.scrollTo({
            top: (targetElement as HTMLElement).offsetTop - 80,
            behavior: "smooth",
          });
        }
      }
    );
  });

  // Initialize the app functionality
  function initApp(): void {
    // Load tasks from localStorage
    loadTasksFromStorage();

    // Set default due date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dueDate.valueAsDate = tomorrow;

    // Initialize voice recognition if available
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = function (event: any): void {
        const transcript = event.results[0][0].transcript;
        taskInput.value = transcript;
        voiceInputBtn.classList.remove("listening");
      };

      recognition.onerror = function (event: any): void {
        console.error("Speech recognition error", event.error);
        voiceInputBtn.classList.remove("listening");
        alert("Voice input failed. Please try again.");
      };

      recognition.onend = function (): void {
        voiceInputBtn.classList.remove("listening");
      };
    } else {
      voiceInputBtn.style.display = "none";
    }

    // Render tasks from storage
    renderTasks();

    // Check if empty state should be shown
    checkEmptyState();
  }

  // Check if empty state should be shown
  function checkEmptyState(): void {
    const activeTasks = tasks.filter((task: Task) => !task.completed);

    if (tasks.length === 0) {
      emptyState.style.display = "block";
      taskList.style.display = "none";
    } else {
      emptyState.style.display = "none";
      taskList.style.display = "block";
    }

    if (tasks.filter((task: Task) => task.completed).length > 0) {
      completedSection.style.display = "block";
    } else {
      completedSection.style.display = "none";
    }

    updateStats();
  }

  // Update task statistics
  function updateStats(): void {
    totalTasksElement.textContent = tasks.length.toString();
    const completedCount = tasks.filter((task: Task) => task.completed).length;
    completedTasksElement.textContent = completedCount.toString();
    activeTasksElement.textContent = (tasks.length - completedCount).toString();
  }

  // Save tasks to localStorage
  function saveTasks(): void {
    saveTasksToStorage();
  }

  // Add new task
  function addTask(): void {
    const taskText = taskInput.value.trim();
    if (taskText === "") return;

    const task: Task = {
      id: taskId++,
      text: taskText,
      completed: false,
      priority: prioritySelect.value,
      dueDate: dueDate.value,
      addedDate: new Date().toISOString(),
    };

    tasks.push(task);
    saveTasks();
    renderTasks();
    taskInput.value = "";
    taskInput.focus();
  }

  // Toggle task completion
  function toggleTask(id: number): void {
    tasks = tasks.map((task: Task) => {
      if (task.id === id) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });
    saveTasks();
    renderTasks();
  }

  // Edit task text
  function editTask(id: number, newText: string): void {
    if (newText.trim() === "") return;

    tasks = tasks.map((task: Task) => {
      if (task.id === id) {
        return { ...task, text: newText };
      }
      return task;
    });
    saveTasks();
    renderTasks();
  }

  // Change task priority
  function changePriority(id: number, newPriority: string): void {
    tasks = tasks.map((task: Task) => {
      if (task.id === id) {
        return { ...task, priority: newPriority };
      }
      return task;
    });
    saveTasks();
    renderTasks();
  }

  // Delete task
  function deleteTask(id: number): void {
    // Add animation before removing
    const taskElement = document.getElementById(`task-${id}`);
    if (taskElement) {
      taskElement.style.opacity = "0";
      taskElement.style.transform = "translateX(40px)";
      taskElement.style.transition = "all 0.3s";
    }

    setTimeout(() => {
      tasks = tasks.filter((task: Task) => task.id !== id);
      saveTasks();
      renderTasks();
    }, 300);
  }

  // Filter tasks
  function filterTasks(filter: string): void {
    currentFilter = filter;
    renderTasks();

    // Update active filter button
    filterButtons.forEach((btn: HTMLElement) => {
      if (btn.dataset.filter === filter) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  // Sort tasks
  function sortTasks(sortBy: string): void {
    currentSort = sortBy;
    renderTasks();

    // Update active sort button
    sortButtons.forEach((btn: HTMLElement) => {
      if (btn.dataset.sort === sortBy) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  // Download tasks as JSON
  function downloadTasks(): void {
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = "tasks.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  }

  // Render all tasks based on current filter and sort
  function renderTasks(): void {
    if (!taskList || !completedList) return;

    taskList.innerHTML = "";
    completedList.innerHTML = "";

    // Filter tasks
    let filteredTasks: Task[] = [];
    if (currentFilter === "all") {
      filteredTasks = tasks;
    } else if (currentFilter === "active") {
      filteredTasks = tasks.filter((task: Task) => !task.completed);
    } else if (currentFilter === "completed") {
      filteredTasks = tasks.filter((task: Task) => task.completed);
    }

    // Sort tasks
    filteredTasks.sort((a: Task, b: Task) => {
      if (currentSort === "priority") {
        const priorityOrder: Record<string, number> = {
          high: 0,
          medium: 1,
          low: 2,
        };
        const aPriority = priorityOrder[a.priority] ?? 3;
        const bPriority = priorityOrder[b.priority] ?? 3;
        return aPriority - bPriority;
      } else if (currentSort === "date") {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (currentSort === "added") {
        return (
          new Date(a.addedDate).getTime() - new Date(b.addedDate).getTime()
        );
      }
      return 0;
    });

    // Render tasks
    filteredTasks.forEach((task: Task) => {
      const li = document.createElement("li");
      li.id = `task-${task.id}`;
      li.className = `task-item priority-${task.priority}-border ${
        task.completed ? "task-completed" : ""
      }`;

      // Format date for display
      const dueDateObj = new Date(task.dueDate);
      const formattedDate = dueDateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          dueDateObj.getFullYear() !== new Date().getFullYear()
            ? "numeric"
            : undefined,
      });

      li.innerHTML = `
                <div class="task-content">
                    <button class="task-checkbox" onclick="window.toggleTask(${
                      task.id
                    })">
                        <i class="${
                          task.completed
                            ? "fas fa-check-circle"
                            : "far fa-circle"
                        }"></i>
                    </button>
                    <div class="task-info">
                        <div class="task-text">${task.text}</div>
                        <div class="task-meta">
                            <span class="priority-badge priority-${
                              task.priority
                            }">${
        task.priority.charAt(0).toUpperCase() + task.priority.slice(1)
      }</span>
                            <span class="task-date"><i class="far fa-calendar"></i> ${formattedDate}</span>
                        </div>
                    </div>
                </div>
                <div class="task-actions">
                    <select onchange="window.changePriority(${
                      task.id
                    }, this.value)" class="priority-select-small">
                        <option value="high" ${
                          task.priority === "high" ? "selected" : ""
                        }>High</option>
                        <option value="medium" ${
                          task.priority === "medium" ? "selected" : ""
                        }>Medium</option>
                        <option value="low" ${
                          task.priority === "low" ? "selected" : ""
                        }>Low</option>
                    </select>
                    <button onclick="window.startEdit(${
                      task.id
                    })" class="action-btn edit-btn">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="window.deleteTask(${
                      task.id
                    })" class="action-btn delete-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

      // Apply appropriate colors for light/dark mode
      const checkboxIcon = li.querySelector(".task-checkbox i") as HTMLElement;
      if (task.completed) {
        checkboxIcon.style.color = "#10b981";
      } else {
        checkboxIcon.style.color = document.documentElement.classList.contains(
          "dark"
        )
          ? "#94a3b8"
          : "#64748b";
      }

      if (task.completed) {
        completedList.appendChild(li);
      } else {
        taskList.appendChild(li);
      }
    });

    checkEmptyState();
  }

  // Start editing a task
  function startEdit(id: number): void {
    const task = tasks.find((t: Task) => t.id === id);
    if (!task) return;

    const taskElement = document.getElementById(`task-${id}`);
    if (!taskElement) return;

    const taskTextElement = taskElement.querySelector(
      ".task-text"
    ) as HTMLElement;

    const currentText = task.text;
    taskTextElement.innerHTML = `
            <input type="text" value="${currentText}" class="edit-input" style="background: inherit; color: inherit; border: none; padding: 0.25rem; width: 100%;">
        `;

    const input = taskTextElement.querySelector("input") as HTMLInputElement;
    input.focus();

    const saveEdit = (): void => {
      editTask(id, input.value);
    };

    input.addEventListener("blur", saveEdit);
    input.addEventListener("keypress", (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        saveEdit();
      }
    });
  }

  // Voice input functionality
  function startVoiceInput(): void {
    if (!recognition) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    try {
      voiceInputBtn.classList.add("listening");
      recognition.start();
    } catch (error) {
      console.error("Speech recognition error:", error);
      voiceInputBtn.classList.remove("listening");
    }
  }

  // Event listeners for app functionality
  addTaskBtn.addEventListener("click", addTask);

  taskInput.addEventListener("keypress", function (e: KeyboardEvent): void {
    if (e.key === "Enter") {
      addTask();
    }
  });

  voiceInputBtn.addEventListener("click", startVoiceInput);

  downloadBtn.addEventListener("click", downloadTasks);

  filterButtons.forEach((button: HTMLElement) => {
    button.addEventListener("click", (): void => {
      filterTasks(button.dataset.filter as string);
    });
  });

  sortButtons.forEach((button: HTMLElement) => {
    button.addEventListener("click", (): void => {
      sortTasks(button.dataset.sort as string);
    });
  });

  // Make functions global for onclick attributes
  (window as any).toggleTask = toggleTask;
  (window as any).deleteTask = deleteTask;
  (window as any).startEdit = startEdit;
  (window as any).changePriority = changePriority;

  // Initial render if we're on the app page
  if (window.location.hash === "#app") {
    homePage.style.display = "none";
    appPage.style.display = "block";
    initApp();
  }
});
