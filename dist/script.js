var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
document.addEventListener("DOMContentLoaded", function () {
    var _a, _b, _c;
    // DOM Elements
    var homePage = document.getElementById("homePage");
    var appPage = document.getElementById("appPage");
    var getStartedBtn = document.getElementById("getStartedBtn");
    var hamburger = document.querySelector(".hamburger");
    var navMenu = document.querySelector(".nav-menu");
    var themeToggle = document.getElementById("themeToggle");
    var appThemeToggle = document.getElementById("appThemeToggle");
    var body = document.body;
    // App functionality variables
    var taskInput = document.getElementById("taskInput");
    var dueDate = document.getElementById("dueDate");
    var prioritySelect = document.getElementById("prioritySelect");
    var addTaskBtn = document.getElementById("addTaskBtn");
    var voiceInputBtn = document.getElementById("voiceInputBtn");
    var downloadBtn = document.getElementById("downloadBtn");
    var taskList = document.getElementById("taskList");
    var completedList = document.getElementById("completedList");
    var emptyState = document.getElementById("emptyState");
    var completedSection = document.getElementById("completedSection");
    var totalTasksElement = (_a = document
        .getElementById("totalTasks")) === null || _a === void 0 ? void 0 : _a.querySelector("span");
    var completedTasksElement = (_b = document
        .getElementById("completedTasks")) === null || _b === void 0 ? void 0 : _b.querySelector("span");
    var activeTasksElement = (_c = document
        .getElementById("activeTasks")) === null || _c === void 0 ? void 0 : _c.querySelector("span");
    var filterButtons = document.querySelectorAll(".filter-btn");
    var sortButtons = document.querySelectorAll(".sort-btn");
    var tasks = [];
    var taskId = 0;
    var currentFilter = "all";
    var currentSort = "priority";
    var recognition = null;
    // Load tasks from localStorage
    function loadTasksFromStorage() {
        var storedTasks = localStorage.getItem("priorityTasks");
        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
            // Find the highest ID to continue from there
            if (tasks.length > 0) {
                taskId = Math.max.apply(Math, tasks.map(function (task) { return task.id; })) + 1;
            }
        }
    }
    // Save tasks to localStorage
    function saveTasksToStorage() {
        localStorage.setItem("priorityTasks", JSON.stringify(tasks));
    }
    // Check for saved theme preference or respect OS preference
    var savedTheme = localStorage.getItem("theme");
    var prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
    // Set initial theme
    if (savedTheme === "dark" || (!savedTheme && prefersDarkScheme.matches)) {
        body.classList.add("dark-mode");
        updateThemeIcons("dark");
        appPage.className = "app-container dark-mode-bg";
        document.documentElement.classList.add("dark");
    }
    else {
        body.classList.remove("dark-mode");
        updateThemeIcons("light");
        appPage.className = "app-container light-mode-bg";
        document.documentElement.classList.remove("dark");
    }
    // Theme toggle functionality
    function toggleTheme() {
        if (body.classList.contains("dark-mode")) {
            body.classList.remove("dark-mode");
            appPage.className = "app-container light-mode-bg";
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
            updateThemeIcons("light");
        }
        else {
            body.classList.add("dark-mode");
            appPage.className = "app-container dark-mode-bg";
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
            updateThemeIcons("dark");
        }
    }
    // Update theme toggle icons
    function updateThemeIcons(theme) {
        var icons = document.querySelectorAll(".theme-toggle i");
        var appIcons = document.querySelectorAll(".app-theme-toggle i");
        if (theme === "dark") {
            icons.forEach(function (icon) {
                icon.classList.remove("fa-moon");
                icon.classList.add("fa-sun");
            });
            appIcons.forEach(function (icon) {
                icon.classList.remove("fa-moon");
                icon.classList.add("fa-sun");
            });
        }
        else {
            icons.forEach(function (icon) {
                icon.classList.remove("fa-sun");
                icon.classList.add("fa-moon");
            });
            appIcons.forEach(function (icon) {
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
    hamburger.addEventListener("click", function () {
        navMenu.classList.toggle("active");
        hamburger.classList.toggle("active");
    });
    // Close mobile menu when clicking on links
    document.querySelectorAll(".nav-link").forEach(function (link) {
        link.addEventListener("click", function () {
            navMenu.classList.remove("active");
            hamburger.classList.remove("active");
        });
    });
    // Get Started Button - Navigate to App Page
    getStartedBtn.addEventListener("click", function (e) {
        e.preventDefault();
        homePage.style.display = "none";
        appPage.style.display = "block";
        // Initialize the app if it's the first time
        if (tasks.length === 0) {
            initApp();
        }
    });
    // Home link in navigation
    var homeLink = document.querySelector(".home-link");
    if (homeLink) {
        homeLink.addEventListener("click", function (e) {
            e.preventDefault();
            homePage.style.display = "block";
            appPage.style.display = "none";
        });
    }
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();
            var targetId = this.getAttribute("href");
            if (targetId === "#")
                return;
            var targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: "smooth",
                });
            }
        });
    });
    // Initialize the app functionality
    function initApp() {
        // Load tasks from localStorage
        loadTasksFromStorage();
        // Set default due date to tomorrow
        var tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dueDate.valueAsDate = tomorrow;
        // Initialize voice recognition if available
        if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
            var SpeechRecognition = window.SpeechRecognition ||
                window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = "en-US";
            recognition.onresult = function (event) {
                var transcript = event.results[0][0].transcript;
                taskInput.value = transcript;
                voiceInputBtn.classList.remove("listening");
            };
            recognition.onerror = function (event) {
                console.error("Speech recognition error", event.error);
                voiceInputBtn.classList.remove("listening");
                alert("Voice input failed. Please try again.");
            };
            recognition.onend = function () {
                voiceInputBtn.classList.remove("listening");
            };
        }
        else {
            voiceInputBtn.style.display = "none";
        }
        // Render tasks from storage
        renderTasks();
        // Check if empty state should be shown
        checkEmptyState();
    }
    // Check if empty state should be shown
    function checkEmptyState() {
        var activeTasks = tasks.filter(function (task) { return !task.completed; });
        if (tasks.length === 0) {
            emptyState.style.display = "block";
            taskList.style.display = "none";
        }
        else {
            emptyState.style.display = "none";
            taskList.style.display = "block";
        }
        if (tasks.filter(function (task) { return task.completed; }).length > 0) {
            completedSection.style.display = "block";
        }
        else {
            completedSection.style.display = "none";
        }
        updateStats();
    }
    // Update task statistics
    function updateStats() {
        totalTasksElement.textContent = tasks.length.toString();
        var completedCount = tasks.filter(function (task) { return task.completed; }).length;
        completedTasksElement.textContent = completedCount.toString();
        activeTasksElement.textContent = (tasks.length - completedCount).toString();
    }
    // Save tasks to localStorage
    function saveTasks() {
        saveTasksToStorage();
    }
    // Add new task
    function addTask() {
        var taskText = taskInput.value.trim();
        if (taskText === "")
            return;
        var task = {
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
    function toggleTask(id) {
        tasks = tasks.map(function (task) {
            if (task.id === id) {
                return __assign(__assign({}, task), { completed: !task.completed });
            }
            return task;
        });
        saveTasks();
        renderTasks();
    }
    // Edit task text
    function editTask(id, newText) {
        if (newText.trim() === "")
            return;
        tasks = tasks.map(function (task) {
            if (task.id === id) {
                return __assign(__assign({}, task), { text: newText });
            }
            return task;
        });
        saveTasks();
        renderTasks();
    }
    // Change task priority
    function changePriority(id, newPriority) {
        tasks = tasks.map(function (task) {
            if (task.id === id) {
                return __assign(__assign({}, task), { priority: newPriority });
            }
            return task;
        });
        saveTasks();
        renderTasks();
    }
    // Delete task
    function deleteTask(id) {
        // Add animation before removing
        var taskElement = document.getElementById("task-".concat(id));
        if (taskElement) {
            taskElement.style.opacity = "0";
            taskElement.style.transform = "translateX(40px)";
            taskElement.style.transition = "all 0.3s";
        }
        setTimeout(function () {
            tasks = tasks.filter(function (task) { return task.id !== id; });
            saveTasks();
            renderTasks();
        }, 300);
    }
    // Filter tasks
    function filterTasks(filter) {
        currentFilter = filter;
        renderTasks();
        // Update active filter button
        filterButtons.forEach(function (btn) {
            if (btn.dataset.filter === filter) {
                btn.classList.add("active");
            }
            else {
                btn.classList.remove("active");
            }
        });
    }
    // Sort tasks
    function sortTasks(sortBy) {
        currentSort = sortBy;
        renderTasks();
        // Update active sort button
        sortButtons.forEach(function (btn) {
            if (btn.dataset.sort === sortBy) {
                btn.classList.add("active");
            }
            else {
                btn.classList.remove("active");
            }
        });
    }
    // Download tasks as JSON
    function downloadTasks() {
        var dataStr = JSON.stringify(tasks, null, 2);
        var dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
        var exportFileDefaultName = "tasks.json";
        var linkElement = document.createElement("a");
        linkElement.setAttribute("href", dataUri);
        linkElement.setAttribute("download", exportFileDefaultName);
        linkElement.click();
    }
    // Render all tasks based on current filter and sort
    function renderTasks() {
        if (!taskList || !completedList)
            return;
        taskList.innerHTML = "";
        completedList.innerHTML = "";
        // Filter tasks
        var filteredTasks = [];
        if (currentFilter === "all") {
            filteredTasks = tasks;
        }
        else if (currentFilter === "active") {
            filteredTasks = tasks.filter(function (task) { return !task.completed; });
        }
        else if (currentFilter === "completed") {
            filteredTasks = tasks.filter(function (task) { return task.completed; });
        }
        // Sort tasks
        filteredTasks.sort(function (a, b) {
            var _a, _b;
            if (currentSort === "priority") {
                var priorityOrder = {
                    high: 0,
                    medium: 1,
                    low: 2,
                };
                var aPriority = (_a = priorityOrder[a.priority]) !== null && _a !== void 0 ? _a : 3;
                var bPriority = (_b = priorityOrder[b.priority]) !== null && _b !== void 0 ? _b : 3;
                return aPriority - bPriority;
            }
            else if (currentSort === "date") {
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            }
            else if (currentSort === "added") {
                return (new Date(a.addedDate).getTime() - new Date(b.addedDate).getTime());
            }
            return 0;
        });
        // Render tasks
        filteredTasks.forEach(function (task) {
            var li = document.createElement("li");
            li.id = "task-".concat(task.id);
            li.className = "task-item priority-".concat(task.priority, "-border ").concat(task.completed ? "task-completed" : "");
            // Format date for display
            var dueDateObj = new Date(task.dueDate);
            var formattedDate = dueDateObj.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: dueDateObj.getFullYear() !== new Date().getFullYear()
                    ? "numeric"
                    : undefined,
            });
            li.innerHTML = "\n                <div class=\"task-content\">\n                    <button class=\"task-checkbox\" onclick=\"window.toggleTask(".concat(task.id, ")\">\n                        <i class=\"").concat(task.completed
                ? "fas fa-check-circle"
                : "far fa-circle", "\"></i>\n                    </button>\n                    <div class=\"task-info\">\n                        <div class=\"task-text\">").concat(task.text, "</div>\n                        <div class=\"task-meta\">\n                            <span class=\"priority-badge priority-").concat(task.priority, "\">").concat(task.priority.charAt(0).toUpperCase() + task.priority.slice(1), "</span>\n                            <span class=\"task-date\"><i class=\"far fa-calendar\"></i> ").concat(formattedDate, "</span>\n                        </div>\n                    </div>\n                </div>\n                <div class=\"task-actions\">\n                    <select onchange=\"window.changePriority(").concat(task.id, ", this.value)\" class=\"priority-select-small\">\n                        <option value=\"high\" ").concat(task.priority === "high" ? "selected" : "", ">High</option>\n                        <option value=\"medium\" ").concat(task.priority === "medium" ? "selected" : "", ">Medium</option>\n                        <option value=\"low\" ").concat(task.priority === "low" ? "selected" : "", ">Low</option>\n                    </select>\n                    <button onclick=\"window.startEdit(").concat(task.id, ")\" class=\"action-btn edit-btn\">\n                        <i class=\"fas fa-edit\"></i>\n                    </button>\n                    <button onclick=\"window.deleteTask(").concat(task.id, ")\" class=\"action-btn delete-btn\">\n                        <i class=\"fas fa-trash\"></i>\n                    </button>\n                </div>\n            ");
            // Apply appropriate colors for light/dark mode
            var checkboxIcon = li.querySelector(".task-checkbox i");
            if (task.completed) {
                checkboxIcon.style.color = "#10b981";
            }
            else {
                checkboxIcon.style.color = document.documentElement.classList.contains("dark")
                    ? "#94a3b8"
                    : "#64748b";
            }
            if (task.completed) {
                completedList.appendChild(li);
            }
            else {
                taskList.appendChild(li);
            }
        });
        checkEmptyState();
    }
    // Start editing a task
    function startEdit(id) {
        var task = tasks.find(function (t) { return t.id === id; });
        if (!task)
            return;
        var taskElement = document.getElementById("task-".concat(id));
        if (!taskElement)
            return;
        var taskTextElement = taskElement.querySelector(".task-text");
        var currentText = task.text;
        taskTextElement.innerHTML = "\n            <input type=\"text\" value=\"".concat(currentText, "\" class=\"edit-input\" style=\"background: inherit; color: inherit; border: none; padding: 0.25rem; width: 100%;\">\n        ");
        var input = taskTextElement.querySelector("input");
        input.focus();
        var saveEdit = function () {
            editTask(id, input.value);
        };
        input.addEventListener("blur", saveEdit);
        input.addEventListener("keypress", function (e) {
            if (e.key === "Enter") {
                saveEdit();
            }
        });
    }
    // Voice input functionality
    function startVoiceInput() {
        if (!recognition) {
            alert("Speech recognition is not supported in your browser.");
            return;
        }
        try {
            voiceInputBtn.classList.add("listening");
            recognition.start();
        }
        catch (error) {
            console.error("Speech recognition error:", error);
            voiceInputBtn.classList.remove("listening");
        }
    }
    // Event listeners for app functionality
    addTaskBtn.addEventListener("click", addTask);
    taskInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            addTask();
        }
    });
    voiceInputBtn.addEventListener("click", startVoiceInput);
    downloadBtn.addEventListener("click", downloadTasks);
    filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            filterTasks(button.dataset.filter);
        });
    });
    sortButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            sortTasks(button.dataset.sort);
        });
    });
    // Make functions global for onclick attributes
    window.toggleTask = toggleTask;
    window.deleteTask = deleteTask;
    window.startEdit = startEdit;
    window.changePriority = changePriority;
    // Initial render if we're on the app page
    if (window.location.hash === "#app") {
        homePage.style.display = "none";
        appPage.style.display = "block";
        initApp();
    }
});
