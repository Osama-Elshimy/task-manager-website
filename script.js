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

function init() {
	renderTasksFromLocalStorage();
	updateLocalStorage();
	// saveTasksInLocalStorage();
}
init();

////////////////////////////////////////////////
// Functions

// Create and return new task (li) element
function createNewTask(title) {
	// Create a new HTML element
	const html = `
	<li draggable="true" id="draggable-list" class="task">
			<p class="task-description">${title}</p>
			<div>
				<ion-icon class="delete-icon icon" name="trash-outline" aria-label="trash outline" role="img" class="md icon-small hydrated" draggable="false"></ion-icon>
				<ion-icon class="edit-icon icon" name="pencil-outline" aria-label="pencil outline" role="img" class="md icon-small hydrated" draggable="false"></ion-icon>
			</div>
	</li>
		`;

	return html;
}

// Render new task to DOM
const addNewTask = function (title) {
	activeList.insertAdjacentHTML("beforeend", createNewTask(title));
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

	// saveTasksInLocalStorage();
	updateLocalStorage();

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

		// saveTasksInLocalStorage();
		updateLocalStorage();

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

// Render tasks from local storage
function renderTasksFromLocalStorage() {
	savedTasks = JSON.parse(localStorage.getItem("tasks")) ?? [];

	if (savedTasks.length === 0) return;

	const notStartedSection = document.querySelector(".section__not-started ul");
	const inProgressSection = document.querySelector(".section__in-progress ul");
	const completedSection = document.querySelector(".section__completed ul");

	// Get saved tasks from local storage
	savedTasks.forEach(task => {
		const li = createNewTask(task.taskTitle);

		if (task.status === "Not started") {
			notStartedSection.insertAdjacentHTML("beforeend", li);
		} else if (task.status === "In progress") {
			inProgressSection.insertAdjacentHTML("beforeend", li);
		} else if (task.status === "Completed") {
			completedSection.insertAdjacentHTML("beforeend", li);
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

//////////////////////////////////////////
// Vertical sort

let dragging = null;

taskLists.forEach(task => {
	task.addEventListener("dragstart", function (event) {
		if (event.target.id === "draggable-list") {
			event.target.classList.add("dragging");
			dragging = event.target;
			event.dataTransfer.setData("text/html", dragging);
		}
	});

	task.addEventListener("dragover", function (event) {
		event.preventDefault();

		const node = event.target;
		if (node !== dragging && node.nodeName === "LI") {
			const draggedOver = node.getBoundingClientRect();
			const draggedOverMiddleY = draggedOver.top + draggedOver.height / 2;
			const mouseY = event.clientY;
			if (mouseY < draggedOverMiddleY) {
				task.insertBefore(dragging, node);
			} else {
				task.insertBefore(dragging, node.nextSibling);
			}
		}
	});

	task.addEventListener("dragend", function (event) {
		event.target.classList.remove("dragging");
		dragging = null;

		updateLocalStorage();
	});
});

/*
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

	section.addEventListener("drop", function (event) {
		event.preventDefault();
		this.classList.remove("drag-over");

		const node = this.querySelector('.task-list');
		if (node !== dragging && node.nodeName === "LI") {
			const draggedOver = node.getBoundingClientRect();
			const draggedOverMiddleY = draggedOver.top + draggedOver.height / 2;
			const mouseY = event.clientY;
			if (mouseY < draggedOverMiddleY) {
				task.insertBefore(dragging, node);
			} else {
				task.insertBefore(dragging, node.nextSibling);
			}
		}

		const task = document.querySelector(".dragging");
		if (task) {
			const targetSection = event.target.closest(".section");
			targetSection.querySelector(".task-list").append(task);

			updateLocalStorage();
		}
	});
});
*/

//////////////////////////////////////////////////

/*
// Drag and drop

// add event listeners for all tasks using event delegation
taskLists.forEach(taskList => {
	taskList.addEventListener("dragstart", e => {
		if (e.target.id === "draggable-list") {
			e.target.classList.add("dragging");
		}
	});

	taskList.addEventListener("dragend", e => {
		if (e.target.id === "draggable-list") e.target.classList.remove("dragging");
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
			targetSection.querySelector(".task-list").append(task);

			updateLocalStorage();
		}
	});
});
*/

//////////////////////////////////////////
// Touch screens

// Add touch event listeners to draggable items
const draggableLists = document.querySelectorAll(".task-list");
draggableLists.forEach(draggableList => {
	// Touch event handler for starting a drag
	draggableList.addEventListener("touchstart", touchStart);

	// Touch event handler for ending a drag
	draggableList.addEventListener("touchend", touchEnd);
});

// Touch event handler functions
let targetSection;
let touchStartX, touchStartY;
let draggedItem;

function touchStart(event) {
	draggedItem = event.target.closest(".task");
	console.log(draggedItem);

	// Store the initial touch coordinates
	touchStartX = event.touches[0].clientX;
	touchStartY = event.touches[0].clientY;

	// Add dragging class to dragged item
	draggedItem.classList.add("dragging");
}

function touchEnd(event) {
	// Find the section where the drag ended
	let touch = event.changedTouches[0];
	let minDistance = Infinity;
	for (let i = 0; i < sections.length; i++) {
		let section = sections[i];
		let rect = section.getBoundingClientRect();
		let distance = Math.hypot(
			touch.clientX - rect.left - rect.width / 2,
			touch.clientY - rect.top - rect.height / 2
		);
		if (distance < minDistance) {
			minDistance = distance;
			targetSection = section;
		}
	}

	// Remove dragging class from dragged item
	draggedItem.classList.remove("dragging");
	event.target.closest(".section").classList.remove("drag-over");

	// Check if the target section is valid and has a task list
	if (targetSection && targetSection.querySelector(".task-list")) {
		// Move the dragged item to the target section's task list
		targetSection.querySelector(".task-list").appendChild(draggedItem);

		// Return to normal styles
		sections.forEach(section => section.classList.remove("drag-over"));
		draggedItem.style.transform = `translate(0, 0)`;

		draggedItem = null;

		// Update local storage
		updateLocalStorage();
	}
}

// Add touch event listeners to sections for drag over and drag leave
sections.forEach(section => {
	// Touch event handler for when a draggable item is over a section
	section.addEventListener("touchmove", touchMove);

	// Touch event handler for when a draggable item leaves a section
	section.addEventListener("touchleave", touchLeave);
});

function touchMove(event) {
	// Prevent default touch event behavior
	event.preventDefault();

	// Finde closest section to movement
	let touch = event.touches[0];
	let endX = touch.pageX;
	let endY = touch.pageY;
	let distanceMoved = Math.hypot(endX - touchStartX, endY - touchStartY);
	if (distanceMoved > 10) {
		// adjust this threshold as needed
		let minDistance = Infinity;
		for (let i = 0; i < sections.length; i++) {
			let section = sections[i];
			let rect = section.getBoundingClientRect();
			let distanceToSection = Math.hypot(
				touch.clientX - rect.left - rect.width / 2,
				touch.clientY - rect.top - rect.height / 2
			);
			if (distanceToSection < minDistance) {
				minDistance = distanceToSection;
				targetSection = section;
			}
		}
	}

	// Calculate the distance the finger has moved since the touch start
	const touchX = event.touches[0].clientX;
	const touchY = event.touches[0].clientY;
	const deltaX = touchX - touchStartX;
	const deltaY = touchY - touchStartY;

	// Move the dragged item using CSS transform
	draggedItem.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

	// Add drag-over class to the section
	targetSection.classList.add("drag-over");
}

function touchLeave(event) {
	console.log("touch leave");
	// Remove drag-over class from the section
	event.target.closest(".section").classList.remove("drag-over");
}

//////////////////////////////////////////
