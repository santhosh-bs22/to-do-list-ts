interface Task {
  id: number;
  text: string;
  completed: boolean;
  priority: string;
  dueDate: string;
  addedDate: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

// Define types for speech recognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

// Polyfill for Array.find for older JavaScript targets
interface Array<T> {
  find(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): T | undefined;
}

// Promise polyfill type declarations
interface PromiseConstructor {
  new <T>(executor: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void): Promise<T>;
}

declare var Promise: PromiseConstructor;

// Extend Window interface to include webkitSpeechRecognition
interface Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

document.addEventListener("DOMContentLoaded", function (): void {
  // DOM Elements
  const homePage = document.getElementById("homePage") as HTMLElement;
  const appPage = document.getElementById("appPage") as HTMLElement;
  const authPage = document.getElementById("authPage") as HTMLElement;
  const getStartedBtn = document.getElementById("getStartedBtn") as HTMLButtonElement;
  const hamburger = document.querySelector(".hamburger") as HTMLElement;
  const navMenu = document.querySelector(".nav-menu") as HTMLElement;
  const themeToggle = document.getElementById("themeToggle") as HTMLElement;
  const appThemeToggle = document.getElementById("appThemeToggle") as HTMLElement;
  const body = document.body as HTMLBodyElement;

  // Auth elements
  const navSignIn = document.getElementById("navSignIn") as HTMLElement;
  const authBackBtn = document.getElementById("authBackBtn") as HTMLButtonElement;
  const switchToSignUp = document.getElementById("switchToSignUp") as HTMLElement;
  const switchToSignIn = document.getElementById("switchToSignIn") as HTMLElement;
  const signInBtn = document.getElementById("signInBtn") as HTMLButtonElement;
  const signUpBtn = document.getElementById("signUpBtn") as HTMLButtonElement;
  const toggleSignInPassword = document.getElementById("toggleSignInPassword") as HTMLElement;
  const toggleSignUpPassword = document.getElementById("toggleSignUpPassword") as HTMLElement;
  const toggleSignUpConfirmPassword = document.getElementById("toggleSignUpConfirmPassword") as HTMLElement;
  const signUpPassword = document.getElementById("signUpPassword") as HTMLInputElement;
  const signInForm = document.getElementById("signInForm") as HTMLElement;
  const signUpForm = document.getElementById("signUpForm") as HTMLElement;
  const appHomeButton = document.getElementById("appHomeButton") as HTMLButtonElement;
  const authLogo = document.getElementById("authLogo") as HTMLElement;
  const welcomeMessage = document.getElementById("welcomeMessage") as HTMLElement;
  const logoutBtn = document.getElementById("logoutBtn") as HTMLButtonElement;

  // App functionality variables
  const taskInput = document.getElementById("taskInput") as HTMLInputElement;
  const dueDate = document.getElementById("dueDate") as HTMLInputElement;
  const prioritySelect = document.getElementById("prioritySelect") as HTMLSelectElement;
  const addTaskBtn = document.getElementById("addTaskBtn") as HTMLButtonElement;
  const voiceInputBtn = document.getElementById("voiceInputBtn") as HTMLButtonElement;
  const downloadBtn = document.getElementById("downloadBtn") as HTMLButtonElement;
  const taskList = document.getElementById("taskList") as HTMLElement;
  const completedList = document.getElementById("completedList") as HTMLElement;
  const emptyState = document.getElementById("emptyState") as HTMLElement;
  const completedSection = document.getElementById("completedSection") as HTMLElement;
  const totalTasksElement = document.getElementById("totalTasks")?.querySelector("span") as HTMLElement;
  const completedTasksElement = document.getElementById("completedTasks")?.querySelector("span") as HTMLElement;
  const activeTasksElement = document.getElementById("activeTasks")?.querySelector("span") as HTMLElement;
  const filterButtons = document.querySelectorAll(".filter-btn") as NodeListOf<HTMLElement>;
  const sortButtons = document.querySelectorAll(".sort-btn") as NodeListOf<HTMLElement>;

  let tasks: Task[] = [];
  let taskId: number = 0;
  let currentFilter: string = "all";
  let currentSort: string = "priority";
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
    const icons = document.querySelectorAll(".theme-toggle i") as NodeListOf<HTMLElement>;
    const appIcons = document.querySelectorAll(".app-theme-toggle i") as NodeListOf<HTMLElement>;

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

  // Show auth page and specific form
  function showAuthPage(formType: string): void {
    homePage.style.display = "none";
    appPage.style.display = "none";
    authPage.style.display = "block";

    if (formType === 'signin') {
      signInForm.classList.add('active');
      signUpForm.classList.remove('active');
    } else if (formType === 'signup') {
      signUpForm.classList.add('active');
      signInForm.classList.remove('active');
    }
  }

  // Go back to home page from auth
  function goBackToHome(): void {
    authPage.style.display = "none";
    homePage.style.display = "block";
  }

  // Toggle password visibility
  function togglePasswordVisibility(inputId: string, toggleBtn: HTMLElement): void {
    const passwordInput = document.getElementById(inputId) as HTMLInputElement;
    const icon = toggleBtn.querySelector('i') as HTMLElement;

    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      icon.classList.remove('fa-eye');
      icon.classList.add('fa-eye-slash');
    } else {
      passwordInput.type = 'password';
      icon.classList.remove('fa-eye-slash');
      icon.classList.add('fa-eye');
    }
  }

  // Check password strength
  function checkPasswordStrength(password: string): number {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    return strength;
  }

  // Update password strength meter
  function updatePasswordStrength(): void {
    const password = signUpPassword.value;
    const strength = checkPasswordStrength(password);
    const meter = document.querySelector('.strength-meter') as HTMLElement;
    const text = document.querySelector('.strength-text') as HTMLElement;

    let width = 0;
    let color = '';
    let message = 'Password strength';

    if (password.length > 0) {
      width = (strength / 4) * 100;

      if (strength <= 1) {
        color = '#ef4444';
        message = 'Weak password';
      } else if (strength === 2) {
        color = '#f59e0b';
        message = 'Medium password';
      } else if (strength === 3) {
        color = '#84cc16';
        message = 'Strong password';
      } else {
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
  function validateSignUpForm(): boolean {
    const name = (document.getElementById('signUpName') as HTMLInputElement).value.trim();
    const email = (document.getElementById('signUpEmail') as HTMLInputElement).value.trim();
    const password = (document.getElementById('signUpPassword') as HTMLInputElement).value;
    const confirmPassword = (document.getElementById('signUpConfirmPassword') as HTMLInputElement).value;
    const termsAgree = (document.getElementById('termsAgree') as HTMLInputElement).checked;

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
  function validateSignInForm(): boolean {
    const email = (document.getElementById('signInEmail') as HTMLInputElement).value.trim();
    const password = (document.getElementById('signInPassword') as HTMLInputElement).value;

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
  function isValidEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Simulate authentication (in a real app, this would connect to a backend)
  function authenticateUser(email: string, password: string, isSignUp: boolean = false, name: string = ''): Promise<User> {
    // In a real application, this would be an API call to your backend
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check if user exists (for demo purposes)
        const users: User[] = JSON.parse(localStorage.getItem('taskvault_users') || '[]');

        if (isSignUp) {
          // Check if email already exists
          if (users.some(user => user.email === email)) {
            reject('Email already registered');
            return;
          }

          // Create new user
          const newUser: User = {
            id: Date.now(),
            name,
            email,
            password: btoa(password), // In a real app, never store passwords like this!
            createdAt: new Date().toISOString()
          };

          users.push(newUser);
          localStorage.setItem('taskvault_users', JSON.stringify(users));
          localStorage.setItem('taskvault_currentUser', JSON.stringify(newUser));
          resolve(newUser);
        } else {
          // Sign in - using filter()[0] instead of find() for compatibility
          const user = users.filter(u => u.email === email && atob(u.password) === password)[0];

          if (user) {
            localStorage.setItem('taskvault_currentUser', JSON.stringify(user));
            resolve(user);
          } else {
            reject('Invalid email or password');
          }
        }
      }, 1000); // Simulate network delay
    });
  }

  // Check if user is logged in
  function checkAuthStatus(): User | null {
    const user = JSON.parse(localStorage.getItem('taskvault_currentUser') || 'null');
    return user;
  }

  // Event listeners for auth functionality
  // Get Started button - show sign up form
  getStartedBtn.addEventListener('click', function(e: Event): void {
    e.preventDefault();
    showAuthPage('signup');
  });

  // Nav Sign In button - show sign in form
  navSignIn.addEventListener('click', function(e: Event): void {
    e.preventDefault();
    showAuthPage('signin');
  });

  // Back button from auth to home
  authBackBtn.addEventListener('click', goBackToHome);

  // Auth logo - go back to home
  authLogo.addEventListener('click', function(e: Event): void {
    e.preventDefault();
    goBackToHome();
  });

  // Switch between sign in and sign up forms
  switchToSignUp.addEventListener('click', function(e: Event): void {
    e.preventDefault();
    signInForm.classList.remove('active');
    signUpForm.classList.add('active');
  });

  switchToSignIn.addEventListener('click', function(e: Event): void {
    e.preventDefault();
    signUpForm.classList.remove('active');
    signInForm.classList.add('active');
  });

  // Toggle password visibility
  toggleSignInPassword.addEventListener('click', function(): void {
    togglePasswordVisibility('signInPassword', this);
  });

  toggleSignUpPassword.addEventListener('click', function(): void {
    togglePasswordVisibility('signUpPassword', this);
  });

  toggleSignUpConfirmPassword.addEventListener('click', function(): void {
    togglePasswordVisibility('signUpConfirmPassword', this);
  });

  // Password strength indicator
  signUpPassword.addEventListener('input', updatePasswordStrength);

  // Sign up form submission
  signUpBtn.addEventListener('click', function(): void {
    if (!validateSignUpForm()) return;

    const name = (document.getElementById('signUpName') as HTMLInputElement).value.trim();
    const email = (document.getElementById('signUpEmail') as HTMLInputElement).value.trim();
    const password = (document.getElementById('signUpPassword') as HTMLInputElement).value;

    // Show loading state
    const originalText = this.innerHTML;
    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
    this.disabled = true;

    authenticateUser(email, password, true, name)
      .then(user => {
        // Successfully signed up - redirect to sign in
        alert('Account created successfully! Please sign in.');
        signUpForm.classList.remove('active');
        signInForm.classList.add('active');
        (document.getElementById('signInEmail') as HTMLInputElement).value = email;
        this.innerHTML = originalText;
        this.disabled = false;
      })
      .catch(error => {
        alert(error);
        this.innerHTML = originalText;
        this.disabled = false;
      });
  });

  // Sign in form submission
  signInBtn.addEventListener('click', function(): void {
    if (!validateSignInForm()) return;

    const email = (document.getElementById('signInEmail') as HTMLInputElement).value.trim();
    const password = (document.getElementById('signInPassword') as HTMLInputElement).value;

    // Show loading state
    const originalText = this.innerHTML;
    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
    this.disabled = true;

    authenticateUser(email, password)
      .then(user => {
        // Successfully signed in
        authPage.style.display = "none";
        appPage.style.display = "block";
        initApp();
      })
      .catch(error => {
        alert(error);
        this.innerHTML = originalText;
        this.disabled = false;
      });
  });

  // Home link in navigation
  const homeLink = document.querySelector(".home-link") as HTMLElement;
  if (homeLink) {
    homeLink.addEventListener("click", function (e: Event): void {
      e.preventDefault();
      homePage.style.display = "block";
      appPage.style.display = "none";
      authPage.style.display = "none";
    });
  }

  // Home button in app
  appHomeButton.addEventListener("click", function (e: Event): void {
    e.preventDefault();
    homePage.style.display = "block";
    appPage.style.display = "none";
    authPage.style.display = "none";
  });

  // Logout button
  logoutBtn.addEventListener("click", function(): void {
    localStorage.removeItem('taskvault_currentUser');
    homePage.style.display = "block";
    appPage.style.display = "none";
    authPage.style.display = "none";
  });

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor: Element) => {
    (anchor as HTMLElement).addEventListener("click", function (e: Event): void {
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
    });
  });

  // Initialize the app functionality
  function initApp(): void {
    const user = checkAuthStatus();
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
    welcomeMessage.textContent = `Welcome, ${user.name}`;

    // Continue with the rest of the app initialization
    // Load tasks from localStorage
    loadTasksFromStorage();

    // Set default due date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dueDate.valueAsDate = tomorrow;

    // Initialize voice recognition if available
    if ((window as any).webkitSpeechRecognition || (window as any).SpeechRecognition) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = function (event: any) {
        const transcript = event.results[0][0].transcript;
        taskInput.value = transcript;
        voiceInputBtn.classList.remove("listening");
      };

      recognition.onerror = function (event: any) {
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
        const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
        return (priorityOrder[a.priority] ?? 99) - (priorityOrder[b.priority] ?? 99);
      } else if (currentSort === "date") {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (currentSort === "added") {
        return new Date(a.addedDate).getTime() - new Date(b.addedDate).getTime();
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
                    <button class="task-checkbox" onclick="window.app.toggleTask(${
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
                    <select onchange="window.app.changePriority(${
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
                    <button onclick="window.app.startEdit(${
                      task.id
                    })" class="action-btn edit-btn">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="window.app.deleteTask(${
                      task.id
                    })" class="action-btn delete-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

      // Apply appropriate colors for light/dark mode
      const checkboxIcon = li.querySelector(".task-checkbox i") as HTMLElement;
      if (checkboxIcon) {
        if (task.completed) {
          checkboxIcon.style.color = "#10b981";
        } else {
          checkboxIcon.style.color = document.documentElement.classList.contains(
            "dark"
          )
            ? "#94a3b8"
            : "#64748b";
        }
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
    // Using filter()[0] instead of find() for compatibility
    const task = tasks.filter((t: Task) => t.id === id)[0];
    if (!task) return;

    const taskElement = document.getElementById(`task-${id}`);
    if (!taskElement) return;
    
    const taskTextElement = taskElement.querySelector(".task-text") as HTMLElement;
    if (!taskTextElement) return;

    const currentText = task.text;
    taskTextElement.innerHTML = `
            <input type="text" value="${currentText}" class="edit-input" style="background: inherit; color: inherit; border: none; padding: 0.25rem; width: 100%;">
        `;

    const input = taskTextElement.querySelector("input") as HTMLInputElement;
    if (!input) return;
    
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
  (window as any).app = {
    toggleTask,
    deleteTask,
    startEdit,
    changePriority
  };

  // Initial render if we're on the app page
  if (window.location.hash === "#app") {
    homePage.style.display = "none";
    appPage.style.display = "block";
    initApp();
  }
});