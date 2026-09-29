let tasks = JSON.parse(localStorage.getItem("tasks")) || [];


/* Save Tasks */

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}


/* Add Task */

function addTask() {

    let input = document.getElementById("taskInput");
    let deadlineInput = document.getElementById("taskDeadline");
    let priorityInput = document.getElementById("taskPriority");

    let text = input.value.trim();
    let deadline = deadlineInput.value;
    let priority = priorityInput.value;

    if (text === "") {
        alert("Please enter a task!");
        return;
    }

    tasks.push({
        text: text,
        deadline: deadline,
        priority: priority,
        completed: false
    });

    saveTasks();

    input.value = "";
    deadlineInput.value = "";
    priorityInput.value = "Low";

    showTasks();
}


/* Show Tasks */

function showTasks() {

    let list = document.getElementById("taskList");

    let searchText =
        document.getElementById("searchInput").value.toLowerCase();

    let status =
        document.getElementById("statusFilter").value;

    list.innerHTML = "";


    /* Create sorted copy */

    let sortedTasks = tasks
        .map((task, index) => ({
            ...task,
            originalIndex: index
        }))
        .sort((a, b) => {

            if (!a.deadline && !b.deadline) {
                return 0;
            }

            if (!a.deadline) {
                return 1;
            }

            if (!b.deadline) {
                return -1;
            }

            return new Date(a.deadline) - new Date(b.deadline);
        });


    sortedTasks.forEach((task) => {

        if (!task.text.toLowerCase().includes(searchText)) {
            return;
        }

        if (status === "Pending" && task.completed) {
            return;
        }

        if (status === "Completed" && !task.completed) {
            return;
        }


        let li = document.createElement("li");


        li.innerHTML = `
            <span>

                <strong>${task.text}</strong><br>

                <small class="priority ${task.priority.toLowerCase()}">
                    Deadline: ${task.deadline || "No deadline"}
                    |
                    Priority: ${task.priority}
                </small>

            </span>


            <button onclick="completeTask(${task.originalIndex})">
                ${task.completed ? "Undo" : "Complete"}
            </button>


            <button onclick="editTask(${task.originalIndex})">
                Edit
            </button>


            <button onclick="deleteTask(${task.originalIndex})">
                Delete
            </button>
        `;


        list.appendChild(li);

    });


    updateStats();
    updateDeadlineAlert();
}


/* Complete / Undo */

function completeTask(index) {

    tasks[index].completed =
        !tasks[index].completed;

    saveTasks();

    showTasks();
}


/* Edit Task */

function editTask(index) {

    let newTask = prompt(
        "Edit your task:",
        tasks[index].text
    );


    if (newTask === null || newTask.trim() === "") {
        return;
    }


    let newDeadline = prompt(
        "Edit deadline (YYYY-MM-DD):",
        tasks[index].deadline
    );


    let newPriority = prompt(
        "Edit priority (Low / Medium / High):",
        tasks[index].priority
    );


    if (
        newPriority !== "Low" &&
        newPriority !== "Medium" &&
        newPriority !== "High"
    ) {

        alert("Please enter Low, Medium or High.");

        return;
    }


    tasks[index].text = newTask.trim();

    tasks[index].deadline = newDeadline;

    tasks[index].priority = newPriority;


    saveTasks();

    showTasks();
}


/* Delete Task */

function deleteTask(index) {

    tasks.splice(index, 1);

    saveTasks();

    showTasks();
}


/* Statistics */

function updateStats() {

    let total = tasks.length;


    let completed = tasks.filter(
        task => task.completed
    ).length;


    let pending = total - completed;


    document.getElementById("totalTasks").textContent =
        total;


    document.getElementById("pendingTasks").textContent =
        pending;


    document.getElementById("completedTasks").textContent =
        completed;
}


/* Deadline Alert */

function updateDeadlineAlert() {

    let alertBox =
        document.getElementById("deadlineAlert");


    let message =
        document.getElementById("deadlineMessage");


    let today = new Date();

    today.setHours(0, 0, 0, 0);


    let upcomingTasks = tasks

        .filter(task =>
            !task.completed &&
            task.deadline
        )

        .map(task => {

            let deadline =
                new Date(task.deadline);

            deadline.setHours(0, 0, 0, 0);


            let difference =
                Math.ceil(
                    (deadline - today) /
                    (1000 * 60 * 60 * 24)
                );


            return {
                ...task,
                daysLeft: difference
            };

        })


        .sort((a, b) =>
            a.daysLeft - b.daysLeft
        );


    if (upcomingTasks.length === 0) {

        alertBox.style.display = "none";

        return;
    }


    let task = upcomingTasks[0];


    alertBox.style.display = "block";


    if (task.daysLeft < 0) {

        alertBox.className =
            "deadline-alert overdue";


        message.textContent =
            `🚨 ${task.text} is overdue!`;

    }


    else if (task.daysLeft === 0) {

        alertBox.className =
            "deadline-alert urgent";


        message.textContent =
            `⚠️ ${task.text} is due today!`;

    }


    else if (task.daysLeft === 1) {

        alertBox.className =
            "deadline-alert urgent";


        message.textContent =
            `⚠️ ${task.text} is due tomorrow!`;

    }


    else {

        alertBox.className =
            "deadline-alert";


        message.textContent =
            `📅 ${task.text} is due in ${task.daysLeft} days.`;
    }
}


/* Load Tasks */

showTasks();