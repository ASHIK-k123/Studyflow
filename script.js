/* =========================
   STUDYFLOW
   Main JavaScript
========================= */


/* =========================
   TASK DATA
========================= */

let tasks =
    JSON.parse(
        localStorage.getItem("studyflow_tasks")
    ) || [];


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
            tasks.filter(
                task => !task.completed
            );

    }


    if (currentFilter === "completed") {

        filteredTasks =
            tasks.filter(
                task => task.completed
            );

    }


    if (filteredTasks.length === 0) {

        emptyState.style.display =
            "block";

    } else {

        emptyState.style.display =
            "none";

    }


    filteredTasks.forEach(task => {

        const taskElement =
            document.createElement("div");


        taskElement.className =
            "task-item";


        if (task.completed) {

            taskElement.classList.add(
                "completed"
            );

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


        taskList.appendChild(
            taskElement
        );

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

    tasks =
        tasks.map(task => {

            if (task.id === id) {

                return {

                    ...task,

                    completed:
                        !task.completed

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
        tasks.filter(
            task => task.id !== id
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
                    btn.classList.remove(
                        "active"
                    )
            );


            this.classList.add(
                "active"
            );


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

        document.body.classList.add(
            "dark"
        );


        themeButton.textContent =
            "☀️";

    } else {

        document.body.classList.remove(
            "dark"
        );


        themeButton.textContent =
            "🌙";

    }

}


themeButton.addEventListener(
    "click",
    function() {

        darkMode =
            !darkMode;


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


/* =====================================================
   POMODORO TIMER
   CUSTOMIZABLE FOCUS & BREAK TIME
===================================================== */


/* =========================
   TIMER DOM ELEMENTS
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


const focusMinutesInput =
    document.getElementById(
        "focusMinutes"
    );


const breakMinutesInput =
    document.getElementById(
        "breakMinutes"
    );


const applyTimer =
    document.getElementById(
        "applyTimer"
    );


/* =========================
   DEFAULT TIMER SETTINGS
========================= */

let focusMinutes =
    parseInt(
        localStorage.getItem(
            "studyflow_focus_time"
        )
    ) || 25;


let breakMinutes =
    parseInt(
        localStorage.getItem(
            "studyflow_break_time"
        )
    ) || 5;


/* Put saved values into inputs */

focusMinutesInput.value =
    focusMinutes;


breakMinutesInput.value =
    breakMinutes;


/* =========================
   TIMER VARIABLES
========================= */

let timerInterval = null;


let selectedMode =
    "focus";


let timerRunning =
    false;


let timerSeconds =
    focusMinutes * 60;


/* =========================
   FORMAT TIME
========================= */

function formatTime(seconds) {

    const minutes =
        Math.floor(
            seconds / 60
        );


    const remainingSeconds =
        seconds % 60;


    return (
        String(minutes).padStart(2, "0")
        +
        ":"
        +
        String(remainingSeconds).padStart(2, "0")
    );

}


/* =========================
   UPDATE TIMER DISPLAY
========================= */

function updateTimerDisplay() {

    timerDisplay.textContent =
        formatTime(
            timerSeconds
        );

}


/* =========================
   APPLY CUSTOM TIME
========================= */

applyTimer.addEventListener(
    "click",
    function() {

        const newFocus =
            parseInt(
                focusMinutesInput.value
            );


        const newBreak =
            parseInt(
                breakMinutesInput.value
            );


        /* Check Focus Time */

        if (
            isNaN(newFocus) ||
            newFocus < 1 ||
            newFocus > 180
        ) {

            alert(
                "Focus time must be between 1 and 180 minutes."
            );

            return;

        }


        /* Check Break Time */

        if (
            isNaN(newBreak) ||
            newBreak < 1 ||
            newBreak > 60
        ) {

            alert(
                "Break time must be between 1 and 60 minutes."
            );

            return;

        }


        /* Save new values */

        focusMinutes =
            newFocus;


        breakMinutes =
            newBreak;


        /* Store in browser */

        localStorage.setItem(
            "studyflow_focus_time",
            focusMinutes
        );


        localStorage.setItem(
            "studyflow_break_time",
            breakMinutes
        );


        /* Reset timer */

        resetTimerMode();


        timerStatus.textContent =
            "New timer settings applied!";

    }
);


/* =========================
   START / PAUSE TIMER
========================= */

startTimer.addEventListener(
    "click",
    function() {


        /* If timer is running */

        if (timerRunning) {

            clearInterval(
                timerInterval
            );


            timerRunning =
                false;


            startTimer.textContent =
                "▶ Start";


            timerStatus.textContent =
                "Timer paused";


            return;

        }


        /* Start timer */

        timerRunning =
            true;


        startTimer.textContent =
            "⏸ Pause";


        if (
            selectedMode === "focus"
        ) {

            timerStatus.textContent =
                "Stay focused! 💪";

        } else {

            timerStatus.textContent =
                "Take a relaxing break ☕";

        }


        timerInterval =
            setInterval(
                function() {


                    timerSeconds--;


                    updateTimerDisplay();


                    /* Timer finished */

                    if (
                        timerSeconds <= 0
                    ) {

                        clearInterval(
                            timerInterval
                        );


                        timerRunning =
                            false;


                        startTimer.textContent =
                            "▶ Start";


                        if (
                            selectedMode ===
                            "focus"
                        ) {

                            timerStatus.textContent =
                                "Focus session complete! 🎉";

                        } else {

                            timerStatus.textContent =
                                "Break complete! Ready to focus.";

                        }


                        playNotificationSound();

                    }

                },
                1000
            );

    }
);


/* =========================
   RESET BUTTON
========================= */

resetTimer.addEventListener(
    "click",
    function() {

        resetTimerMode();

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
   RESET CURRENT TIMER
========================= */

function resetTimerMode() {


    /* Stop running timer */

    clearInterval(
        timerInterval
    );


    timerRunning =
        false;


    startTimer.textContent =
        "▶ Start";


    /* Set correct time */

    if (
        selectedMode === "focus"
    ) {

        timerSeconds =
            focusMinutes * 60;


        timerStatus.textContent =
            "Ready to focus";

    } else {

        timerSeconds =
            breakMinutes * 60;


        timerStatus.textContent =
            "Time for a break ☕";

    }


    updateTimerDisplay();

}


/* =========================
   NOTIFICATION SOUND
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


        oscillator.connect(
            gain
        );


        gain.connect(
            audioContext.destination
        );


        oscillator.frequency.value =
            800;


        gain.gain.value =
            0.1;


        oscillator.start();


        oscillator.stop(
            audioContext.currentTime
            + 0.3
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
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}


/* =========================
   CAPITALIZE
========================= */

function capitalize(text) {

    return (
        text.charAt(0).toUpperCase()
        +
        text.slice(1)
    );

}


/* =========================
   INITIALIZE WEBSITE
========================= */

updateTheme();

updateDate();

displayTasks();

updateTimerDisplay();