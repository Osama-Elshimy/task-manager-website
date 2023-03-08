// Select elements from the DOM
const buttons = document.querySelectorAll(".btn-add-task");
const taskLists = document.querySelectorAll(".task-list");
const sections = document.querySelectorAll(".section");

const btnAddTask = document.querySelector(".modal-button-add");
const btnCanelTask = document.querySelector(".modal-button-cancel");

const modal = document.querySelector(".modal");
const modalTitleInput = document.querySelector("#task-title");
const overlay = document.querySelector(".overlay");

let activeList = [...taskLists][0];

let savedTasks = [];

////////////////////////////////////////////////
// Functions

// Create and return new task (li) element
const createNewTask = function (title) {
	// Create a new HTML element
	const html = `
		<div class="task">
			<p class="task-description">${title}</p>
			<div>
				<ion-icon class="delete-icon" name="trash-outline" aria-label="trash outline" role="img" class="md icon-small hydrated"></ion-icon>
				<ion-icon class="edit-icon" name="pencil-outline" aria-label="pencil outline" role="img" class="md icon-small hydrated"></ion-icon>
			</div>
		</div>
		`;

	const newTask = document.createElement("li");
	newTask.draggable = true;
	newTask.innerHTML = html;

	return newTask;
};

// Render new task to DOM
const addNewTask = function (title) {
	activeList.appendChild(createNewTask(title));
};

const openModal = function (e) {
	modal.classList.remove("hidden");
	overlay.classList.remove("hidden");
};

const closeModal = function (e) {
	modal.classList.add("hidden");
	overlay.classList.add("hidden");
};

////////////////////////////////////////////////
// Event Listeners

// Open Modal
buttons.forEach(button => {
	button.addEventListener("click", function () {
		openModal();

		setTimeout(() => {
			modalTitleInput.focus();
		}, 50);

		const parentSection = button.closest(".section");
		activeList = parentSection.querySelector(".task-list");
	});
});

// Close Modal
btnCanelTask.addEventListener("click", function () {
	// Clear the input field & close modal
	closeModal();
	modalTitleInput.value = "";
});

// Confirm Adding new task when the add button is clicked
btnAddTask.addEventListener("click", function (e) {
	e.preventDefault();

	// TEMP
	if (modalTitleInput.value.trim() === "") {
		closeModal();
		return;
	}

	addNewTask(modalTitleInput.value);

	saveTasksInLocalStorage();

	// Clear the input field & close modal
	closeModal();
	modalTitleInput.value = "";
});

// Confirm Adding new task when Enter is pressed
modalTitleInput.addEventListener("keyup", function (e) {
	e.preventDefault();

	if (e.keyCode === 13 || e.key === "Enter") {
		// TEMP
		if (modalTitleInput.value.trim() === "") {
			closeModal();
			return;
		}

		addNewTask(modalTitleInput.value);

		saveTasksInLocalStorage();

		// Clear the input field & close modal
		closeModal();
		modalTitleInput.value = "";
	}
});

// Delete task
taskLists.forEach(taskList =>
	taskList.addEventListener("click", function (e) {
		if (e.target.classList.contains("delete-icon")) {
			const parentLi = e.target.closest("li");
			parentLi.remove();
		}

		updateLocalStorage();
	})
);

// Edit task
taskLists.forEach(taskList =>
	taskList.addEventListener("click", function (e) {
		if (!e.target.classList.contains("edit-icon")) return;

		const parentLi = e.target.closest("li");

		const taskTitle = parentLi.querySelector(".task-description");
		const currentTitle = taskTitle.innerText;

		const inputField = document.createElement("input");
		inputField.setAttribute("type", "text");
		inputField.setAttribute("value", currentTitle);
		inputField.classList.add("task-description");
		taskTitle.replaceWith(inputField);
		inputField.focus();

		function handleEnterOrBlur() {
			const newTitle = inputField.value;
			const newTitleElement = document.createElement("p");
			newTitleElement.classList.add("task-description");
			newTitleElement.innerText = newTitle;
			inputField.replaceWith(newTitleElement);

			updateLocalStorage();
		}

		let keyPressed = false;

		inputField.addEventListener("keyup", function (e) {
			if (e.keyCode === 13 || e.key === "Enter") {
				keyPressed = true;
				handleEnterOrBlur();
			}
		});

		inputField.addEventListener("blur", function (e) {
			// Check if the Enter was pressed
			if (keyPressed) {
				// Reset the flag variable to false
				keyPressed = false;
				// Exit the function without doing anything else
				return;
			}
			// Else trigger the event function
			handleEnterOrBlur();
		});
	})
);

//////////////////////////////////////////////////
// Local Storage

// Add tasks to local storage
function saveTasksInLocalStorage() {
	const parentEl = activeList.closest(".section");

	const status = parentEl.classList.contains("section__not-started")
		? "Not started"
		: parentEl.classList.contains("section__in-progress")
		? "In progress"
		: "Completed";

	if (modalTitleInput.value === "") {
		return;
	}

	savedTasks.push({
		taskTitle: modalTitleInput.value,
		status: status,
	});

	localStorage.setItem("tasks", JSON.stringify(savedTasks));
}

////////////////////////////////

// Render tasks from local storage
function renderTasksFromLocalStorage() {
	savedTasks = JSON.parse(localStorage.getItem("tasks")) ?? [];

	if (savedTasks.length === 0) {
		return;
	}

	const notStartedSection = document.querySelector(".section__not-started ul");
	const inProgressSection = document.querySelector(".section__in-progress ul");
	const completedSection = document.querySelector(".section__completed ul");

	// Get saved tasks from local storage
	savedTasks.forEach(task => {
		const li = createNewTask(task.taskTitle);

		if (task.status === "Not started") {
			notStartedSection.appendChild(li);
		} else if (task.status === "In progress") {
			inProgressSection.appendChild(li);
		} else if (task.status === "Completed") {
			completedSection.appendChild(li);
		}
	});
}

////////////////////////////////////////////

// Update Local storage
function updateLocalStorage() {
	// Get the current tasks from the DOM
	const notStartedTasks = document.querySelector(
		".section__not-started .task-list"
	).children;
	const inProgressTasks = document.querySelector(
		".section__in-progress .task-list"
	).children;
	const completedTasks = document.querySelector(
		".section__completed .task-list"
	).children;

	// Create an array of tasks for each section
	const notStartedTasksArray = [];
	for (let task of notStartedTasks) {
		notStartedTasksArray.push({
			taskTitle: task.querySelector(".task-description").textContent,
			status: "Not started",
		});
	}

	const inProgressTasksArray = [];
	for (let task of inProgressTasks) {
		inProgressTasksArray.push({
			taskTitle: task.querySelector(".task-description").textContent,
			status: "In progress",
		});
	}

	const completedTasksArray = [];
	for (let task of completedTasks) {
		completedTasksArray.push({
			taskTitle: task.querySelector(".task-description").textContent,
			status: "Completed",
		});
	}

	// Merge the arrays into one array
	const allTasksArray = [
		...notStartedTasksArray,
		...inProgressTasksArray,
		...completedTasksArray,
	];

	// Save the tasks to local storage
	localStorage.setItem("tasks", JSON.stringify(allTasksArray));
}

//////////////////////////////////////////////////
// @TODO VERTICALLL MOVEMENTS AND TOUCH SCREENS
// Drag and drop

// add event listeners for all tasks using event delegation

taskLists.forEach(taskList => {
	taskList.addEventListener("dragstart", e => {
		if (e.target.tagName === "LI") {
			e.target.classList.add("dragging");
			console.log("drag start");
		}
	});

	taskList.addEventListener("dragend", e => {
		if (e.target.tagName === "LI") {
			e.target.classList.remove("dragging");
			console.log("drag end");
		}
	});
});

// add event listeners for all sections
sections.forEach(section => {
	section.addEventListener("dragover", function (e) {
		e.preventDefault();
		this.classList.add("drag-over");
	});

	section.addEventListener("dragleave", function (e) {
		e.preventDefault();
		this.classList.remove("drag-over");
	});

	section.addEventListener("drop", function (e) {
		e.preventDefault();
		this.classList.remove("drag-over");

		const task = document.querySelector(".dragging");
		if (task) {
			const targetSection = e.target.closest(".section");
			if (targetSection && targetSection !== task.parentNode) {
				targetSection.querySelector(".task-list").append(task);

				updateLocalStorage();
			}
		}
	});
});

const init = function () {
	renderTasksFromLocalStorage();
	saveTasksInLocalStorage();
};

init();

//////////////////////////////////////////
// Touch screens

taskLists.forEach(taskList => {
	taskList.addEventListener("touchstart", e => {
		if (e.target.tagName === "LI") {
			e.target.classList.add("dragging");
		}
	});

	taskList.addEventListener("touchend", e => {
		if (e.target.tagName === "LI") {
			e.target.classList.remove("dragging");
		}
	});
});

sections.forEach(section => {
	section.addEventListener("touchmove", function (e) {
		e.preventDefault();
		const touch = e.touches[0];

		// set the position of the dragged element
		const task = document.querySelector(".dragging");
		if (task) {
			task.style.left = touch.clientX + "px";
			task.style.top = touch.clientY + "px";
		}
	});

	section.addEventListener("touchend", function (e) {
		e.preventDefault();
		const task = document.querySelector(".dragging");
		if (task) {
			const targetSection = e.target.closest(".section");
			if (targetSection && targetSection !== task.parentNode) {
				targetSection.querySelector(".task-list").append(task);

				updateLocalStorage();
			}

			task.style.left = "";
			task.style.top = "";
			task.classList.remove("dragging");
		}
	});
});
