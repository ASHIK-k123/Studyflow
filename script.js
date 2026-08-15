/* =========================
   STUDYFLOW
   Main JavaScript
========================= */


/* =========================
   TASK DATA
========================= */

let tasks =
    JSON.parse(localStorage.getItem("studyflow_tasks")) || [];


let currentFilter = "all";


/* =========================
   DOM ELEMENTS
========================= */

const taskForm =
    document.getElementById("taskForm");

const taskInput =
    document.getElementById("taskInput");

const priorityInput =
    document.getElementById("priorityInput");

const taskList =
    document.getElementById("taskList");

const emptyState =
    document.getElementById("emptyState");

const totalTasks =
    document.getElementById("totalTasks");

const completedTasks =
    document.getElementById("completedTasks");

const pendingTasks =
    document.getElementById("pendingTasks");

const themeButton =
    document.getElementById("themeButton");

const currentDate =
    document.getElementById("currentDate");


/* =========================
   SAVE TASKS
========================= */

function saveTasks() {

    localStorage.setItem(
        "studyflow_tasks",
        JSON.stringify(tasks)
    );

}


/* =========================
   DISPLAY TASKS
========================= */

function displayTasks() {

    taskList.innerHTML = "";


    let filteredTasks = tasks;


    if (currentFilter === "pending") {

        filteredTasks =
            tasks.filter(task => !task.completed);

    }


    if (currentFilter === "completed") {

        filteredTasks =
            tasks.filter(task => task.completed);

    }


    if (filteredTasks.length === 0) {

        emptyState.style.display = "block";

    } else {

        emptyState.style.display = "none";

    }


    filteredTasks.forEach(task => {

        const taskElement =
            document.createElement("div");


        taskElement.className =
            "task-item";


        if (task.completed) {

            taskElement.classList.add("completed");

        }


        taskElement.innerHTML = `

            <input
                type="checkbox"
                class="task-checkbox"
                ${task.completed ? "checked" : ""}
                onchange="toggleTask(${task.id})"
            >

            <div class="task-content">

                <div class="task-name">
                    ${escapeHTML(task.name)}
                </div>

            </div>

            <span class="priority ${task.priority}">
                ${capitalize(task.priority)}
            </span>

            <button
                class="delete-button"
                onclick="deleteTask(${task.id})">
                🗑️
            </button>

        `;


        taskList.appendChild(taskElement);

    });


    updateStats();

}


/* =========================
   ADD TASK
========================= */

taskForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const name =
            taskInput.value.trim();


        const priority =
            priorityInput.value;


        if (name === "") {

            return;

        }


        const newTask = {

            id: Date.now(),

            name: name,

            priority: priority,

            completed: false,

            createdAt:
                new Date().toISOString()

        };


        tasks.push(newTask);


        saveTasks();


        taskInput.value = "";


        priorityInput.value =
            "medium";


        displayTasks();

    }
);


/* =========================
   COMPLETE TASK
========================= */

function toggleTask(id) {

    tasks = tasks.map(task => {

        if (task.id === id) {

            return {

                ...task,

                completed: !task.completed

            };

        }

        return task;

    });


    saveTasks();


    displayTasks();

}


/* =========================
   DELETE TASK
========================= */

function deleteTask(id) {

    tasks =
        tasks.filter(task =>
            task.id !== id
        );


    saveTasks();


    displayTasks();

}


/* =========================
   UPDATE STATISTICS
========================= */

function updateStats() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            task => task.completed
        ).length;


    const pending =
        total - completed;


    totalTasks.textContent =
        total;


    completedTasks.textContent =
        completed;


    pendingTasks.textContent =
        pending;

}


/* =========================
   FILTER BUTTONS
========================= */

const filterButtons =
    document.querySelectorAll(
        ".filter-button"
    );


filterButtons.forEach(button => {

    button.addEventListener(
        "click",
        function() {

            filterButtons.forEach(
                btn =>
                    btn.classList.remove("active")
            );


            this.classList.add("active");


            currentFilter =
                this.dataset.filter;


            displayTasks();

        }
    );

});


/* =========================
   DARK MODE
========================= */

let darkMode =
    localStorage.getItem(
        "studyflow_dark_mode"
    ) === "true";


function updateTheme() {

    if (darkMode) {

        document.body.classList.add("dark");

        themeButton.textContent = "☀️";

    } else {

        document.body.classList.remove("dark");

        themeButton.textContent = "🌙";

    }

}


themeButton.addEventListener(
    "click",
    function() {

        darkMode = !darkMode;


        localStorage.setItem(
            "studyflow_dark_mode",
            darkMode
        );


        updateTheme();

    }
);


/* =========================
   DATE
========================= */

function updateDate() {

    const today =
        new Date();


    const options = {

        weekday: "long",

        year: "numeric",

        month: "long",

        day: "numeric"

    };


    currentDate.textContent =
        today.toLocaleDateString(
            "en-IN",
            options
        );

}


/* =========================
   POMODORO TIMER
========================= */

const timerDisplay =
    document.getElementById(
        "timerDisplay"
    );

const timerStatus =
    document.getElementById(
        "timerStatus"
    );

const startTimer =
    document.getElementById(
        "startTimer"
    );

const resetTimer =
    document.getElementById(
        "resetTimer"
    );

const focusMode =
    document.getElementById(
        "focusMode"
    );

const breakMode =
    document.getElementById(
        "breakMode"
    );


let timerInterval =
    null;


let timerSeconds =
    25 * 60;


let selectedMode =
    "focus";


let timerRunning =
    false;


/* =========================
   FORMAT TIMER
========================= */

function formatTime(seconds) {

    const minutes =
        Math.floor(seconds / 60);


    const remainingSeconds =
        seconds % 60;


    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;

}


/* =========================
   UPDATE TIMER
========================= */

function updateTimerDisplay() {

    timerDisplay.textContent =
        formatTime(timerSeconds);

}


/* =========================
   START / PAUSE
========================= */

startTimer.addEventListener(
    "click",
    function() {

        if (timerRunning) {

            clearInterval(timerInterval);

            timerRunning = false;

            startTimer.textContent =
                "▶ Start";

            timerStatus.textContent =
                "Timer paused";

            return;

        }


        timerRunning = true;

        startTimer.textContent =
            "⏸ Pause";

        timerStatus.textContent =
            selectedMode === "focus"
                ? "Stay focused! 💪"
                : "Take a relaxing break ☕";


        timerInterval =
            setInterval(
                function() {

                    timerSeconds--;


                    updateTimerDisplay();


                    if (timerSeconds <= 0) {

                        clearInterval(
                            timerInterval
                        );


                        timerRunning =
                            false;


                        startTimer.textContent =
                            "▶ Start";


                        timerStatus.textContent =
                            selectedMode === "focus"
                                ? "Focus session complete! 🎉"
                                : "Break complete! Ready to focus.";


                        playNotificationSound();

                    }

                },
                1000
            );

    }
);


/* =========================
   RESET TIMER
========================= */

resetTimer.addEventListener(
    "click",
    function() {

        clearInterval(
            timerInterval
        );


        timerRunning = false;


        startTimer.textContent =
            "▶ Start";


        timerSeconds =
            selectedMode === "focus"
                ? 25 * 60
                : 5 * 60;


        timerStatus.textContent =
            "Ready to focus";


        updateTimerDisplay();

    }
);


/* =========================
   FOCUS MODE
========================= */

focusMode.addEventListener(
    "click",
    function() {

        selectedMode =
            "focus";


        focusMode.classList.add(
            "active"
        );


        breakMode.classList.remove(
            "active"
        );


        resetTimerMode();

    }
);


/* =========================
   BREAK MODE
========================= */

breakMode.addEventListener(
    "click",
    function() {

        selectedMode =
            "break";


        breakMode.classList.add(
            "active"
        );


        focusMode.classList.remove(
            "active"
        );


        resetTimerMode();

    }
);


/* =========================
   RESET TIMER MODE
========================= */

function resetTimerMode() {

    clearInterval(
        timerInterval
    );


    timerRunning = false;


    startTimer.textContent =
        "▶ Start";


    timerSeconds =
        selectedMode === "focus"
            ? 25 * 60
            : 5 * 60;


    timerStatus.textContent =
        selectedMode === "focus"
            ? "Ready to focus"
            : "Time for a break ☕";


    updateTimerDisplay();

}


/* =========================
   NOTIFICATION
========================= */

function playNotificationSound() {

    try {

        const audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();


        const oscillator =
            audioContext.createOscillator();


        const gain =
            audioContext.createGain();


        oscillator.connect(gain);

        gain.connect(
            audioContext.destination
        );


        oscillator.frequency.value =
            800;


        gain.gain.value =
            0.1;


        oscillator.start();


        oscillator.stop(
            audioContext.currentTime + 0.3
        );

    } catch (error) {

        console.log(
            "Notification sound unavailable."
        );

    }

}


/* =========================
   SECURITY
========================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");


    div.textContent =
        text;


    return div.innerHTML;

}


/* =========================
   CAPITALIZE
========================= */

function capitalize(text) {

    return text.charAt(0).toUpperCase()
        + text.slice(1);

}


/* =========================
   INITIALIZE
========================= */

updateTheme();

updateDate();

displayTasks();

updateTimerDisplay();