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
    var authPage = document.getElementById("authPage");
    var getStartedBtn = document.getElementById("getStartedBtn");
    var hamburger = document.querySelector(".hamburger");
    var navMenu = document.querySelector(".nav-menu");
    var themeToggle = document.getElementById("themeToggle");
    var appThemeToggle = document.getElementById("appThemeToggle");
    var body = document.body;
    // Auth elements
    var navSignIn = document.getElementById("navSignIn");
    var authBackBtn = document.getElementById("authBackBtn");
    var switchToSignUp = document.getElementById("switchToSignUp");
    var switchToSignIn = document.getElementById("switchToSignIn");
    var signInBtn = document.getElementById("signInBtn");
    var signUpBtn = document.getElementById("signUpBtn");
    var toggleSignInPassword = document.getElementById("toggleSignInPassword");
    var toggleSignUpPassword = document.getElementById("toggleSignUpPassword");
    var toggleSignUpConfirmPassword = document.getElementById("toggleSignUpConfirmPassword");
    var signUpPassword = document.getElementById("signUpPassword");
    var signInForm = document.getElementById("signInForm");
    var signUpForm = document.getElementById("signUpForm");
    var appHomeButton = document.getElementById("appHomeButton");
    var authLogo = document.getElementById("authLogo");
    var welcomeMessage = document.getElementById("welcomeMessage");
    var logoutBtn = document.getElementById("logoutBtn");
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
    var totalTasksElement = (_a = document.getElementById("totalTasks")) === null || _a === void 0 ? void 0 : _a.querySelector("span");
    var completedTasksElement = (_b = document.getElementById("completedTasks")) === null || _b === void 0 ? void 0 : _b.querySelector("span");
    var activeTasksElement = (_c = document.getElementById("activeTasks")) === null || _c === void 0 ? void 0 : _c.querySelector("span");
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
    // Show auth page and specific form
    function showAuthPage(formType) {
        homePage.style.display = "none";
        appPage.style.display = "none";
        authPage.style.display = "block";
        if (formType === 'signin') {
            signInForm.classList.add('active');
            signUpForm.classList.remove('active');
        }
        else if (formType === 'signup') {
            signUpForm.classList.add('active');
            signInForm.classList.remove('active');
        }
    }
    // Go back to home page from auth
    function goBackToHome() {
        authPage.style.display = "none";
        homePage.style.display = "block";
    }
    // Toggle password visibility
    function togglePasswordVisibility(inputId, toggleBtn) {
        var passwordInput = document.getElementById(inputId);
        var icon = toggleBtn.querySelector('i');
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        }
        else {
            passwordInput.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
    // Check password strength
    function checkPasswordStrength(password) {
        var strength = 0;
        if (password.length >= 8)
            strength++;
        if (/[A-Z]/.test(password))
            strength++;
        if (/[0-9]/.test(password))
            strength++;
        if (/[^A-Za-z0-9]/.test(password))
            strength++;
        return strength;
    }
    // Update password strength meter
    function updatePasswordStrength() {
        var password = signUpPassword.value;
        var strength = checkPasswordStrength(password);
        var meter = document.querySelector('.strength-meter');
        var text = document.querySelector('.strength-text');
        var width = 0;
        var color = '';
        var message = 'Password strength';
        if (password.length > 0) {
            width = (strength / 4) * 100;
            if (strength <= 1) {
                color = '#ef4444';
                message = 'Weak password';
            }
            else if (strength === 2) {
                color = '#f59e0b';
                message = 'Medium password';
            }
            else if (strength === 3) {
                color = '#84cc16';
                message = 'Strong password';
            }
            else {
                color = '#10b981';
                message = 'Very strong password';
            }
        }
        meter.style.width = width + '%';
        meter.style.backgroundColor = color;
        text.textContent = message;
        text.style.color = color;
    }
    // Validate sign up form
    function validateSignUpForm() {
        var name = document.getElementById('signUpName').value.trim();
        var email = document.getElementById('signUpEmail').value.trim();
        var password = document.getElementById('signUpPassword').value;
        var confirmPassword = document.getElementById('signUpConfirmPassword').value;
        var termsAgree = document.getElementById('termsAgree').checked;
        if (!name) {
            alert('Please enter your name');
            return false;
        }
        if (!email) {
            alert('Please enter your email');
            return false;
        }
        if (!isValidEmail(email)) {
            alert('Please enter a valid email address');
            return false;
        }
        if (password.length < 8) {
            alert('Password must be at least 8 characters long');
            return false;
        }
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return false;
        }
        if (!termsAgree) {
            alert('Please agree to the terms and conditions');
            return false;
        }
        return true;
    }
    // Validate sign in form
    function validateSignInForm() {
        var email = document.getElementById('signInEmail').value.trim();
        var password = document.getElementById('signInPassword').value;
        if (!email) {
            alert('Please enter your email');
            return false;
        }
        if (!isValidEmail(email)) {
            alert('Please enter a valid email address');
            return false;
        }
        if (!password) {
            alert('Please enter your password');
            return false;
        }
        return true;
    }
    // Simple email validation
    function isValidEmail(email) {
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    // Simulate authentication (in a real app, this would connect to a backend)
    function authenticateUser(email, password, isSignUp, name) {
        if (isSignUp === void 0) { isSignUp = false; }
        if (name === void 0) { name = ''; }
        // In a real application, this would be an API call to your backend
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                // Check if user exists (for demo purposes)
                var users = JSON.parse(localStorage.getItem('taskvault_users') || '[]');
                if (isSignUp) {
                    // Check if email already exists
                    if (users.some(function (user) { return user.email === email; })) {
                        reject('Email already registered');
                        return;
                    }
                    // Create new user
                    var newUser = {
                        id: Date.now(),
                        name: name,
                        email: email,
                        password: btoa(password), // In a real app, never store passwords like this!
                        createdAt: new Date().toISOString()
                    };
                    users.push(newUser);
                    localStorage.setItem('taskvault_users', JSON.stringify(users));
                    localStorage.setItem('taskvault_currentUser', JSON.stringify(newUser));
                    resolve(newUser);
                }
                else {
                    // Sign in - using filter()[0] instead of find() for compatibility
                    var user = users.filter(function (u) { return u.email === email && atob(u.password) === password; })[0];
                    if (user) {
                        localStorage.setItem('taskvault_currentUser', JSON.stringify(user));
                        resolve(user);
                    }
                    else {
                        reject('Invalid email or password');
                    }
                }
            }, 1000); // Simulate network delay
        });
    }
    // Check if user is logged in
    function checkAuthStatus() {
        var user = JSON.parse(localStorage.getItem('taskvault_currentUser') || 'null');
        return user;
    }
    // Event listeners for auth functionality
    // Get Started button - show sign up form
    getStartedBtn.addEventListener('click', function (e) {
        e.preventDefault();
        showAuthPage('signup');
    });
    // Nav Sign In button - show sign in form
    navSignIn.addEventListener('click', function (e) {
        e.preventDefault();
        showAuthPage('signin');
    });
    // Back button from auth to home
    authBackBtn.addEventListener('click', goBackToHome);
    // Auth logo - go back to home
    authLogo.addEventListener('click', function (e) {
        e.preventDefault();
        goBackToHome();
    });
    // Switch between sign in and sign up forms
    switchToSignUp.addEventListener('click', function (e) {
        e.preventDefault();
        signInForm.classList.remove('active');
        signUpForm.classList.add('active');
    });
    switchToSignIn.addEventListener('click', function (e) {
        e.preventDefault();
        signUpForm.classList.remove('active');
        signInForm.classList.add('active');
    });
    // Toggle password visibility
    toggleSignInPassword.addEventListener('click', function () {
        togglePasswordVisibility('signInPassword', this);
    });
    toggleSignUpPassword.addEventListener('click', function () {
        togglePasswordVisibility('signUpPassword', this);
    });
    toggleSignUpConfirmPassword.addEventListener('click', function () {
        togglePasswordVisibility('signUpConfirmPassword', this);
    });
    // Password strength indicator
    signUpPassword.addEventListener('input', updatePasswordStrength);
    // Sign up form submission
    signUpBtn.addEventListener('click', function () {
        var _this = this;
        if (!validateSignUpForm())
            return;
        var name = document.getElementById('signUpName').value.trim();
        var email = document.getElementById('signUpEmail').value.trim();
        var password = document.getElementById('signUpPassword').value;
        // Show loading state
        var originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
        this.disabled = true;
        authenticateUser(email, password, true, name)
            .then(function (user) {
            // Successfully signed up - redirect to sign in
            alert('Account created successfully! Please sign in.');
            signUpForm.classList.remove('active');
            signInForm.classList.add('active');
            document.getElementById('signInEmail').value = email;
            _this.innerHTML = originalText;
            _this.disabled = false;
        })
            .catch(function (error) {
            alert(error);
            _this.innerHTML = originalText;
            _this.disabled = false;
        });
    });
    // Sign in form submission
    signInBtn.addEventListener('click', function () {
        var _this = this;
        if (!validateSignInForm())
            return;
        var email = document.getElementById('signInEmail').value.trim();
        var password = document.getElementById('signInPassword').value;
        // Show loading state
        var originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
        this.disabled = true;
        authenticateUser(email, password)
            .then(function (user) {
            // Successfully signed in
            authPage.style.display = "none";
            appPage.style.display = "block";
            initApp();
        })
            .catch(function (error) {
            alert(error);
            _this.innerHTML = originalText;
            _this.disabled = false;
        });
    });
    // Home link in navigation
    var homeLink = document.querySelector(".home-link");
    if (homeLink) {
        homeLink.addEventListener("click", function (e) {
            e.preventDefault();
            homePage.style.display = "block";
            appPage.style.display = "none";
            authPage.style.display = "none";
        });
    }
    // Home button in app
    appHomeButton.addEventListener("click", function (e) {
        e.preventDefault();
        homePage.style.display = "block";
        appPage.style.display = "none";
        authPage.style.display = "none";
    });
    // Logout button
    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem('taskvault_currentUser');
        homePage.style.display = "block";
        appPage.style.display = "none";
        authPage.style.display = "none";
    });
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
        var user = checkAuthStatus();
        if (!user) {
            // If not authenticated, show auth page
            homePage.style.display = "none";
            appPage.style.display = "none";
            authPage.style.display = "block";
            signInForm.classList.add('active');
            signUpForm.classList.remove('active');
            return;
        }
        // Update welcome message with user's name
        welcomeMessage.textContent = "Welcome, ".concat(user.name);
        // Continue with the rest of the app initialization
        // Load tasks from localStorage
        loadTasksFromStorage();
        // Set default due date to tomorrow
        var tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dueDate.valueAsDate = tomorrow;
        // Initialize voice recognition if available
        if (window.webkitSpeechRecognition || window.SpeechRecognition) {
            var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
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
                var priorityOrder = { high: 0, medium: 1, low: 2 };
                return ((_a = priorityOrder[a.priority]) !== null && _a !== void 0 ? _a : 99) - ((_b = priorityOrder[b.priority]) !== null && _b !== void 0 ? _b : 99);
            }
            else if (currentSort === "date") {
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            }
            else if (currentSort === "added") {
                return new Date(a.addedDate).getTime() - new Date(b.addedDate).getTime();
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
            li.innerHTML = "\n                <div class=\"task-content\">\n                    <button class=\"task-checkbox\" onclick=\"window.app.toggleTask(".concat(task.id, ")\">\n                        <i class=\"").concat(task.completed
                ? "fas fa-check-circle"
                : "far fa-circle", "\"></i>\n                    </button>\n                    <div class=\"task-info\">\n                        <div class=\"task-text\">").concat(task.text, "</div>\n                        <div class=\"task-meta\">\n                            <span class=\"priority-badge priority-").concat(task.priority, "\">").concat(task.priority.charAt(0).toUpperCase() + task.priority.slice(1), "</span>\n                            <span class=\"task-date\"><i class=\"far fa-calendar\"></i> ").concat(formattedDate, "</span>\n                        </div>\n                    </div>\n                </div>\n                <div class=\"task-actions\">\n                    <select onchange=\"window.app.changePriority(").concat(task.id, ", this.value)\" class=\"priority-select-small\">\n                        <option value=\"high\" ").concat(task.priority === "high" ? "selected" : "", ">High</option>\n                        <option value=\"medium\" ").concat(task.priority === "medium" ? "selected" : "", ">Medium</option>\n                        <option value=\"low\" ").concat(task.priority === "low" ? "selected" : "", ">Low</option>\n                    </select>\n                    <button onclick=\"window.app.startEdit(").concat(task.id, ")\" class=\"action-btn edit-btn\">\n                        <i class=\"fas fa-edit\"></i>\n                    </button>\n                    <button onclick=\"window.app.deleteTask(").concat(task.id, ")\" class=\"action-btn delete-btn\">\n                        <i class=\"fas fa-trash\"></i>\n                    </button>\n                </div>\n            ");
            // Apply appropriate colors for light/dark mode
            var checkboxIcon = li.querySelector(".task-checkbox i");
            if (checkboxIcon) {
                if (task.completed) {
                    checkboxIcon.style.color = "#10b981";
                }
                else {
                    checkboxIcon.style.color = document.documentElement.classList.contains("dark")
                        ? "#94a3b8"
                        : "#64748b";
                }
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
        // Using filter()[0] instead of find() for compatibility
        var task = tasks.filter(function (t) { return t.id === id; })[0];
        if (!task)
            return;
        var taskElement = document.getElementById("task-".concat(id));
        if (!taskElement)
            return;
        var taskTextElement = taskElement.querySelector(".task-text");
        if (!taskTextElement)
            return;
        var currentText = task.text;
        taskTextElement.innerHTML = "\n            <input type=\"text\" value=\"".concat(currentText, "\" class=\"edit-input\" style=\"background: inherit; color: inherit; border: none; padding: 0.25rem; width: 100%;\">\n        ");
        var input = taskTextElement.querySelector("input");
        if (!input)
            return;
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
    window.app = {
        toggleTask: toggleTask,
        deleteTask: deleteTask,
        startEdit: startEdit,
        changePriority: changePriority
    };
    // Initial render if we're on the app page
    if (window.location.hash === "#app") {
        homePage.style.display = "none";
        appPage.style.display = "block";
        initApp();
    }
});
