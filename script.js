        // DOM Elements
        const themeToggle = document.getElementById('themeToggle');
        const body = document.body;
        const addTaskBtn = document.getElementById('addTaskBtn');
        const taskModal = document.getElementById('taskModal');
        const closeModal = document.getElementById('closeModal');
        const cancelBtn = document.getElementById('cancelBtn');
        const taskForm = document.getElementById('taskForm');
        const taskList = document.getElementById('taskList');
        const modalTitle = document.getElementById('modalTitle');
        const taskId = document.getElementById('taskId');
        const taskTitle = document.getElementById('taskTitle');
        const taskDescription = document.getElementById('taskDescription');
        const taskNotes = document.getElementById('taskNotes');
        const taskTags = document.getElementById('taskTags');
        const taskPriority = document.getElementById('taskPriority');
        const taskCategorySelect = document.getElementById('taskCategory'); // Renamed to avoid conflict
        const taskDueDate = document.getElementById('taskDueDate');
        const taskReminder = document.getElementById('taskReminder');
        const taskRecurrence = document.getElementById('taskRecurrence');
        const saveTaskBtn = document.getElementById('saveTaskBtn');
        const toast = document.getElementById('toast');
        const toastTitle = document.getElementById('toastTitle');
        const toastMessage = document.getElementById('toastMessage');
        const filterBtns = document.querySelectorAll('.filter-btn');
        const searchInput = document.querySelector('.search-input');
        const completedCount = document.getElementById('completedCount');
        const pendingCount = document.getElementById('pendingCount');
        const totalCount = document.getElementById('totalCount');
        const progressPercentage = document.getElementById('progressPercentage');
        const progressFill = document.getElementById('progressFill');
        const categoryListElement = document.getElementById('categoryList');
        const addCategoryBtn = document.getElementById('addCategoryBtn');
        const categoryModal = document.getElementById('categoryModal');
        const closeCategoryModal = document.getElementById('closeCategoryModal');
        const manageCategoriesBtn = document.getElementById('manageCategoriesBtn');
        const manageCategoryList = document.getElementById('manageCategoryList');
        const newCategoryInput = document.getElementById('newCategoryInput');
        const addCategoryConfirmBtn = document.getElementById('addCategoryConfirmBtn');
        const quickAddTaskInput = document.getElementById('quickAddTaskInput');
        const quickAddTaskBtn = document.getElementById('quickAddTaskBtn');
        const subtaskListContainer = document.getElementById('subtaskList');
        const addSubtaskBtn = document.getElementById('addSubtaskBtn');
        const taskContextMenu = document.getElementById('taskContextMenu');
        const contextMenuItems = document.querySelector('#taskContextMenu .context-menu-items');

        // Confirm Delete Modal Elements
        const confirmDeleteModal = document.getElementById('confirmDeleteModal');
        const closeConfirmDeleteModal = document.getElementById('closeConfirmDeleteModal');
        const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        const dontAskAgainCheckbox = document.getElementById('dontAskAgainCheckbox');
        let taskToDeleteId = null; // Store task ID to delete after confirmation


        // App State
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        let categories = JSON.parse(localStorage.getItem('categories')) || ['Personal', 'Work', 'Shopping', 'Health', 'Education']; // Default categories
        let currentFilter = 'all';
        let isEditing = false;
        let editingCategory = null; // Track category being edited
        let currentContextMenuTaskId = null; // Track task ID for context menu


        // Check for dark mode preference
        if (localStorage.getItem('darkMode') === 'true') {
            body.classList.add('dark-mode');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }

        // Initialize the app
        function init() {
            renderTasks();
            updateStats();
            renderCategoriesSidebar();
            populateCategoryDropdown();
            checkAndRequestNotificationPermission();

            // Set today's date as the default due date
            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            taskDueDate.value = formattedDate;
        }

        // Toggle Dark Mode
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-mode');

            if (body.classList.contains('dark-mode')) {
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
                localStorage.setItem('darkMode', 'true');
            } else {
                themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
                localStorage.setItem('darkMode', 'false');
            }
        });

        // --- Category Management ---

        function renderCategoriesSidebar() {
            categoryListElement.innerHTML = '';
            categories.forEach((category, index) => {
                const categoryItem = document.createElement('li');
                categoryItem.className = 'category-item';
                categoryItem.dataset.category = category.toLowerCase();
                categoryItem.innerHTML = `
                    <span>${category}</span>
                `;

                categoryItem.addEventListener('click', () => {
                    // Remove active class from all and add to clicked
                    document.querySelectorAll('.category-item').forEach(item => item.classList.remove('active'));
                    categoryItem.classList.add('active');
                    currentFilter = categoryItem.dataset.category; // Set filter to category
                    filterBtns.forEach(btn => btn.classList.remove('active')); // Unselect other filters
                    renderTasks();
                });

                categoryListElement.appendChild(categoryItem);
            });
        }

        function populateCategoryDropdown() {
            taskCategorySelect.innerHTML = ''; // Clear existing options
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.toLowerCase();
                option.textContent = category;
                taskCategorySelect.appendChild(option);
            });
        }

        addCategoryBtn.addEventListener('click', () => {
            categoryModal.classList.add('active');
            renderManageCategoriesList();
        });

        closeCategoryModal.addEventListener('click', () => {
            categoryModal.classList.remove('active');
            editingCategory = null; // Reset editing state
        });

        manageCategoriesBtn.addEventListener('click', () => {
            categoryModal.classList.add('active');
            renderManageCategoriesList();
        });

        function renderManageCategoriesList() {
            manageCategoryList.innerHTML = '';
            categories.forEach((category, index) => {
                const manageCategoryItem = document.createElement('li');
                manageCategoryItem.className = 'manage-category-item';
                manageCategoryItem.innerHTML = `
                    <span class="manage-category-item-text">${category}</span>
                    <div class="category-actions">
                        <button class="category-action-btn edit-category-btn" data-index="${index}" title="Edit Category"><i class="fas fa-edit"></i></button>
                        <button class="category-action-btn delete-category-btn" data-index="${index}" title="Delete Category"><i class="fas fa-trash-alt"></i></button>
                    </div>
                `;
                manageCategoryList.appendChild(manageCategoryItem);
            });

            // Event listeners for edit and delete buttons (added dynamically)
            manageCategoryList.querySelectorAll('.edit-category-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const index = parseInt(event.target.closest('.edit-category-btn').dataset.index);
                    editingCategory = index;
                    newCategoryInput.value = categories[index];
                    newCategoryInput.focus();
                });
            });

            manageCategoryList.querySelectorAll('.delete-category-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const index = parseInt(event.target.closest('.delete-category-btn').dataset.index);
                    deleteCategory(index);
                });
            });
        }

        addCategoryConfirmBtn.addEventListener('click', () => {
            const newCategoryName = newCategoryInput.value.trim();
            if (newCategoryName) {
                if (editingCategory !== null) {
                    updateCategory(editingCategory, newCategoryName);
                    editingCategory = null; // Reset editing state
                } else {
                    addCategory(newCategoryName);
                }
                newCategoryInput.value = '';
                renderManageCategoriesList();
                renderCategoriesSidebar();
                populateCategoryDropdown();
            }
        });


        function addCategory(categoryName) {
            if (!categories.includes(categoryName)) {
                categories.push(categoryName);
                saveCategories();
            } else {
                showToast('Category Exists', 'Category already exists.', 'error');
            }
        }

        function updateCategory(index, newName) {
            if (!categories.includes(newName)) {
                categories[index] = newName;
                saveCategories();
            } else {
                showToast('Category Exists', 'Category already exists.', 'error');
            }
        }

        function deleteCategory(index) {
            categories.splice(index, 1);
            saveCategories();
            renderManageCategoriesList();
            renderCategoriesSidebar();
            populateCategoryDropdown();
            renderTasks(); // Re-render tasks to update category filters
        }

        function saveCategories() {
            localStorage.setItem('categories', JSON.stringify(categories));
        }


        // --- Quick Add Task ---
        quickAddTaskBtn.addEventListener('click', () => {
            const title = quickAddTaskInput.value.trim();
            if (title) {
                addTask(title);
                quickAddTaskInput.value = '';
            }
        });

        quickAddTaskInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                quickAddTaskBtn.click();
            }
        });

        function addTask(title) {
            const newTask = {
                id: Date.now().toString(),
                title: title,
                description: '',
                notes: '',
                tags: [],
                subtasks: [],
                priority: 'medium',
                category: categories[0].toLowerCase() || 'personal', // Default to first category or personal
                dueDate: new Date().toISOString().split('T')[0],
                reminder: null,
                recurrence: 'none',
                completed: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            tasks.unshift(newTask);
            saveTasks();
            renderTasks();
            updateStats();
            showToast('Success', 'Task added successfully!', 'success');
        }


        // Open Add Task Modal
        addTaskBtn.addEventListener('click', () => {
            isEditing = false;
            modalTitle.textContent = 'Add New Task';
            taskForm.reset();

            // Clear subtask inputs
            subtaskListContainer.innerHTML = '';
            addSubtaskInput(); // Add at least one subtask input initially

            // Set today's date as the default due date
            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            taskDueDate.value = formattedDate;
            taskReminder.value = ''; // Clear reminder

            taskId.value = '';
            taskModal.classList.add('active');
        });

        // Close Modal
        function closeTaskModal() {
            taskModal.classList.remove('active');
        }

        closeModal.addEventListener('click', closeTaskModal);
        cancelBtn.addEventListener('click', closeTaskModal);

        // Close modal when clicking outside
        taskModal.addEventListener('click', (e) => {
            if (e.target === taskModal) {
                closeTaskModal();
            }
        });

        // --- Subtasks Input Management ---
        addSubtaskBtn.addEventListener('click', addSubtaskInput);

        function addSubtaskInput(subtaskText = '') {
            const subtaskInputGroup = document.createElement('div');
            subtaskInputGroup.className = 'form-group form-row subtask-input-group';
            subtaskInputGroup.innerHTML = `
                <input type="text" class="form-input subtask-input" placeholder="Enter subtask" value="${subtaskText}">
                <button type="button" class="btn btn-secondary btn-small remove-subtask-btn"><i class="fas fa-trash"></i></button>
            `;
            subtaskListContainer.appendChild(subtaskInputGroup);

            const removeSubtaskButton = subtaskInputGroup.querySelector('.remove-subtask-btn');
            removeSubtaskButton.addEventListener('click', () => {
                subtaskListContainer.removeChild(subtaskInputGroup);
            });
        }


        // Save Task
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const subtasks = Array.from(subtaskListContainer.querySelectorAll('.subtask-input')).map(input => ({
                text: input.value.trim(),
                completed: false
            })).filter(subtask => subtask.text !== ''); // Filter out empty subtasks

            const tags = taskTags.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

            const reminderValue = taskReminder.value ? new Date(taskReminder.value).toISOString() : null;


            if (isEditing) {
                // Update existing task
                const taskIndex = tasks.findIndex(task => task.id === taskId.value);

                if (taskIndex !== -1) {
                    tasks[taskIndex] = {
                        ...tasks[taskIndex],
                        title: taskTitle.value,
                        description: taskDescription.value,
                        notes: taskNotes.value,
                        tags: tags,
                        subtasks: subtasks,
                        priority: taskPriority.value,
                        category: taskCategorySelect.value,
                        dueDate: taskDueDate.value,
                        reminder: reminderValue,
                        recurrence: taskRecurrence.value,
                        updatedAt: new Date().toISOString()
                    };

                    showToast('Success', 'Task updated successfully!', 'success');
                }
            } else {
                // Add new task
                const newTask = {
                    id: Date.now().toString(),
                    title: taskTitle.value,
                    description: taskDescription.value,
                    notes: taskNotes.value,
                    tags: tags,
                    subtasks: subtasks,
                    priority: taskPriority.value,
                    category: taskCategorySelect.value,
                    dueDate: taskDueDate.value,
                    reminder: reminderValue,
                    recurrence: taskRecurrence.value,
                    completed: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                tasks.unshift(newTask);
                showToast('Success', 'Task added successfully!', 'success');
            }

            // Save to localStorage and update UI
            saveTasks();
            renderTasks();
            updateStats();
            closeTaskModal();
            scheduleReminders(); // Re-schedule reminders after task update
        });

        // Render Tasks
        function renderTasks() {
            let filteredTasks = filterTasks(tasks, currentFilter);

            // Apply search filter
            if (searchInput.value.trim() !== '') {
                const searchTerm = searchInput.value.trim().toLowerCase();
                filteredTasks = filteredTasks.filter(task =>
                    task.title.toLowerCase().includes(searchTerm) ||
                    task.description.toLowerCase().includes(searchTerm) ||
                    task.notes.toLowerCase().includes(searchTerm) ||
                    task.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
                    task.subtasks.some(subtask => subtask.text.toLowerCase().includes(searchTerm))
                );
            }

            if (filteredTasks.length === 0) {
                taskList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">
                            <i class="fas fa-clipboard-list"></i>
                        </div>
                        <h3>No tasks found</h3>
                        <p>Add a new task or change your filters to see tasks here.</p>
                        <button class="btn btn-primary add-task-btn" id="emptyStateAddBtn">
                            <i class="fas fa-plus"></i> Add New Task
                        </button>
                    </div>
                `;

                document.getElementById('emptyStateAddBtn').addEventListener('click', () => {
                    addTaskBtn.click();
                });

                return;
            }

            taskList.innerHTML = '';

            filteredTasks.forEach(task => {
                const taskElement = document.createElement('div');
                taskElement.className = `task-item priority-${task.priority} ${task.completed ? 'completed' : ''}`;
                taskElement.dataset.id = task.id;
                taskElement.draggable = true;

                const dueDate = new Date(task.dueDate);
                const formattedDate = dueDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });

                let priorityLabel = '';
                if (task.priority === 'high') priorityLabel = 'High Priority';
                if (task.priority === 'medium') priorityLabel = 'Medium Priority';
                if (task.priority === 'low') priorityLabel = 'Low Priority';

                let tagsHTML = '';
                if (task.tags && task.tags.length > 0) {
                    tagsHTML = `<div class="task-tags">${task.tags.map(tag => `<span class="task-tag">${tag}</span>`).join('')}</div>`;
                }

                let notesHTML = '';
                if (task.notes) {
                    notesHTML = `<p class="task-notes">${task.notes}</p>`;
                }

                let subtasksHTML = '';
                if (task.subtasks && task.subtasks.length > 0) {
                    subtasksHTML = `
                        <div class="subtasks-container">
                            ${task.subtasks.map((subtask, index) => `
                                <div class="subtask-item ${subtask.completed ? 'completed' : ''}" data-subtask-index="${index}">
                                    <div class="checkbox-container ${subtask.completed ? 'checked' : ''}">
                                        <div class="custom-checkbox">
                                            <i class="fas fa-check"></i>
                                        </div>
                                    </div>
                                    <span class="subtask-text">${subtask.text}</span>
                                </div>
                            `).join('')}
                        </div>
                    `;
                } else {
                    subtasksHTML = ''; // No subtasks, so empty HTML
                }


                taskElement.innerHTML = `
                    <div class="task-header">
                        <div>
                            <h3 class="task-title">${task.title}</h3>
                            <div class="task-date">
                                <i class="far fa-calendar-alt"></i>
                                ${formattedDate}
                            </div>
                        </div>
                        <span class="task-priority priority-${task.priority}">${priorityLabel}</span>
                    </div>
                    <p class="task-description">${task.description || 'No description provided.'}</p>
                    ${notesHTML}
                    ${subtasksHTML}
                    <div class="task-footer">
                        <span class="task-category">${task.category.charAt(0).toUpperCase() + task.category.slice(1)}</span>
                        ${tagsHTML}
                        <div class="task-actions">
                            <button class="task-action-btn complete-btn" title="${task.completed ? 'Mark as incomplete' : 'Mark as complete'}">
                                <i class="fas ${task.completed ? 'fa-times-circle' : 'fa-check-circle'}"></i>
                            </button>
                            <button class="task-action-btn edit-btn" title="Edit task">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="task-action-btn delete-btn" title="Delete task">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                `;

                taskList.appendChild(taskElement);

                // --- CONTEXT MENU EVENT LISTENER (ADDED HERE) ---
                taskElement.addEventListener('contextmenu', (event) => {
                    event.preventDefault(); // Prevent default right-click menu
                    openContextMenu(event, task.id);
                });


                // Subtask checkbox event listeners
                const subtaskItems = taskElement.querySelectorAll('.subtask-item');
                subtaskItems.forEach(subtaskItem => {
                    subtaskItem.addEventListener('click', (event) => {
                        if (event.target.closest('.checkbox-container')) { // Only handle clicks on the checkbox area
                            const subtaskIndex = parseInt(subtaskItem.dataset.subtaskIndex);
                            toggleSubtaskComplete(task.id, subtaskIndex, subtaskItem); // Pass subtaskItem
                        }
                    });
                });


                // Add event listeners to task action buttons
                const completeBtn = taskElement.querySelector('.complete-btn');
                const editBtn = taskElement.querySelector('.edit-btn');
                const deleteBtn = taskElement.querySelector('.delete-btn');

                completeBtn.addEventListener('click', () => toggleTaskComplete(task.id));
                editBtn.addEventListener('click', () => editTask(task.id));
                deleteBtn.addEventListener('click', () => deleteTask(task.id)); // Call deleteTask here
            });

            // Setup drag and drop after tasks are rendered
            setupDragAndDrop();
        }

        // --- CONTEXT MENU FUNCTIONS ---

        function openContextMenu(event, taskId) {
            currentContextMenuTaskId = taskId; // Store the task ID for later actions

            // Clear existing submenu items (categories)
            const categorySubmenu = taskContextMenu.querySelector('.context-menu-item[data-action="category"] .context-menu-submenu');
            categorySubmenu.innerHTML = '';

            // Populate category submenu dynamically
            categories.forEach(category => {
                const categoryItem = document.createElement('li');
                categoryItem.className = 'context-menu-item';
                categoryItem.dataset.category = category.toLowerCase();
                categoryItem.textContent = category;
                categorySubmenu.appendChild(categoryItem);

                categoryItem.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent closing main menu immediately
                    changeTaskCategoryContextMenu(taskId, categoryItem.dataset.category);
                    closeContextMenu();
                });
            });


            // Position the context menu
            taskContextMenu.style.left = `${event.clientX}px`;
            taskContextMenu.style.top = `${event.clientY}px`;

            // Show the context menu
            taskContextMenu.classList.add('active');
        }

        function closeContextMenu() {
            taskContextMenu.classList.remove('active');
            currentContextMenuTaskId = null; // Clear task ID
        }

        // Global click listener to close context menu when clicking outside
        document.addEventListener('click', (event) => {
            if (!event.target.closest('.context-menu') && !event.target.closest('.task-item')) {
                closeContextMenu();
            }
        });

        // Context Menu Actions Handlers

        function handleContextMenuAction(action) {
            if (!currentContextMenuTaskId) return; // No task selected

            switch (action) {
                case 'complete':
                    toggleTaskComplete(currentContextMenuTaskId);
                    break;
                case 'edit':
                    editTask(currentContextMenuTaskId);
                    break;
                case 'delete':
                    showConfirmModal(currentContextMenuTaskId); // Show confirm modal from context menu
                    break;
                case 'priority':
                    // Priority change is handled by submenu clicks (see below - CORRECTED EVENT LISTENER)
                    break;
                case 'category':
                    // Category change is handled in openContextMenu for submenu
                    break;
            }
            closeContextMenu(); // Close after action (except for priority/category which close on submenu item click)
        }

        function changeTaskPriorityContextMenu(priority) {
            if (!currentContextMenuTaskId) return;
            const taskIndex = tasks.findIndex(task => task.id === currentContextMenuTaskId);
            if (taskIndex !== -1) {
                tasks[taskIndex].priority = priority;
                saveTasks();
                renderTasks();
                updateStats();
                showToast('Task Updated', `Task priority changed to ${priority}!`, 'success');
            }
        }

        function changeTaskCategoryContextMenu(taskId, category) {
            if (!taskId) return;
            const taskIndex = tasks.findIndex(task => task.id === taskId);
            if (taskIndex !== -1) {
                tasks[taskIndex].category = category;
                saveTasks();
                renderTasks();
                updateStats();
                showToast('Task Updated', `Task category changed to ${category}!`, 'success');
            }
        }


        // Event listeners for context menu items
        contextMenuItems.addEventListener('click', (event) => {
            const menuItem = event.target.closest('.context-menu-item');
            if (menuItem) {
                const action = menuItem.dataset.action;

                if (action === 'priority') {
                    // Handle priority submenu clicks - **CORRECTED EVENT HANDLING**
                    const priorityItem = event.target.closest('.context-menu-item[data-priority]'); // Target the submenu *item*
                    if (priorityItem) { // Check if we clicked on a priority item
                        const priority = priorityItem.dataset.priority;
                        changeTaskPriorityContextMenu(priority);
                        closeContextMenu(); // Close after priority change
                    }
                } else if (action !== 'category') { // Category is handled in openContextMenu for submenu
                    handleContextMenuAction(action);
                }
            }
        });


        // Filter Tasks
        function filterTasks(tasks, filter) {
            if (categories.map(c => c.toLowerCase()).includes(filter)) {
                return tasks.filter(task => task.category === filter); // Filter by category
            }
            switch (filter) {
                case 'pending':
                    return tasks.filter(task => !task.completed);
                case 'completed':
                    return tasks.filter(task => task.completed);
                case 'high':
                    return tasks.filter(task => task.priority === 'high');
                default:
                    return tasks;
            }
        }

        // Toggle Task Complete Status
        function toggleTaskComplete(id) {
            const taskIndex = tasks.findIndex(task => task.id === id);

            if (taskIndex !== -1) {
                tasks[taskIndex].completed = !tasks[taskIndex].completed;

                // Move completed task to the bottom if it's now completed
                if (tasks[taskIndex].completed) {
                    const completedTask = tasks.splice(taskIndex, 1)[0]; // Remove from current position
                    tasks.push(completedTask); // Add to the end
                } else {
                    // If marking as incomplete, keep its position (or you can implement different logic)
                    // For now, we keep it in place when marked as incomplete.
                }


                const taskElement = document.querySelector(`.task-item[data-id="${id}"]`);
                if (taskElement) {
                    taskElement.classList.add('task-complete-animation');

                    setTimeout(() => {
                        taskElement.classList.remove('task-complete-animation');
                    }, 500);
                }

                saveTasks();
                renderTasks();
                updateStats();
                scheduleReminders(); // Re-schedule reminders after task completion change

                const status = tasks[taskIndex].completed ? 'completed' : 'marked as pending';
                showToast('Task Updated', `Task ${status} successfully!`, 'success');

                // Check if all tasks are completed
                checkAllTasksCompleted();
            }
        }

        // Toggle Subtask Complete Status
        function toggleSubtaskComplete(taskId, subtaskIndex, subtaskItem) {
            const task = tasks.find(task => task.id === taskId);
            if (task && task.subtasks[subtaskIndex]) {
                task.subtasks[subtaskIndex].completed = !task.subtasks[subtaskIndex].completed;
                saveTasks();
                renderTasks(); // Re-render to update subtask UI
            }
        }


        // Edit Task
        function editTask(id) {
            const task = tasks.find(task => task.id === id);

            if (task) {
                isEditing = true;
                modalTitle.textContent = 'Edit Task';

                taskId.value = task.id;
                taskTitle.value = task.title;
                taskDescription.value = task.description || '';
                taskNotes.value = task.notes || '';
                taskTags.value = task.tags ? task.tags.join(', ') : '';
                taskPriority.value = task.priority;
                taskCategorySelect.value = task.category;
                taskDueDate.value = task.dueDate;
                taskReminder.value = task.reminder ? new Date(task.reminder).toLocaleString('sv').slice(0, 16) : ''; // Format for datetime-local
                taskRecurrence.value = task.recurrence;

                // Populate subtasks
                subtaskListContainer.innerHTML = ''; // Clear existing inputs
                if (task.subtasks && task.subtasks.length > 0) {
                    task.subtasks.forEach(subtask => {
                        addSubtaskInput(subtask.text); // Populate with existing subtask text
                    });
                } else {
                    addSubtaskInput(); // Add at least one empty input if no subtasks exist
                }


                taskModal.classList.add('active');
            }
        }

        // --- Confirm Delete Modal Functions ---

        function showConfirmModal(id) {
            taskToDeleteId = id; // Store the ID of the task to be deleted
            confirmDeleteModal.classList.add('active');
            dontAskAgainCheckbox.checked = localStorage.getItem('dontAskAgainDelete') === 'true'; // Restore checkbox state
        }

        function closeConfirmDeleteModalFunc() { // Renamed to avoid conflict with closeModal
            confirmDeleteModal.classList.remove('active');
            taskToDeleteId = null;
        }

        closeConfirmDeleteModal.addEventListener('click', closeConfirmDeleteModalFunc);
        cancelDeleteBtn.addEventListener('click', closeConfirmDeleteModalFunc);

        confirmDeleteBtn.addEventListener('click', () => {
            const dontAskAgain = dontAskAgainCheckbox.checked;
            localStorage.setItem('dontAskAgainDelete', dontAskAgain); // Save "Don't ask again" preference

            if (taskToDeleteId) {
                performDeleteTask(taskToDeleteId, dontAskAgain); // Call performDeleteTask here and pass dontAskAgain
                taskToDeleteId = null; // Clear task ID after deletion
            }
            closeConfirmDeleteModalFunc();
        });

        confirmDeleteModal.addEventListener('click', (e) => {
            if (e.target === confirmDeleteModal) {
                closeConfirmDeleteModalFunc();
            }
        });


        // Delete Task (Now just performs the deletion - confirmation handled by modal)
        function performDeleteTask(id, dontAskAgain) { // Renamed to performDeleteTask and now accepts dontAskAgain
            tasks = tasks.filter(task => task.id !== id);
            saveTasks();
            renderTasks();
            updateStats();
            scheduleReminders();
            showToast('Task Deleted', 'Task has been deleted successfully!', 'success');
        }


        // Function to decide whether to delete directly or show confirm modal
        function deleteTask(id) { // Renamed deleteTask back to original name, now acts as decision maker
            const storedDontAskAgain = localStorage.getItem('dontAskAgainDelete') === 'true';
            console.log("storedDontAskAgain value:", storedDontAskAgain); // ADDED FOR DEBUGGING
            if (storedDontAskAgain) {
                performDeleteTask(id, true); // Delete directly if "don't ask again" is true, pass true for dontAskAgain
            } else {
                showConfirmModal(id); // Show confirmation modal if "don't ask again" is false
            }
        }


        // Save Tasks to localStorage
        function saveTasks() {
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }

        // Show Toast Notification
        function showToast(title, message, type = 'success') {
            toastTitle.textContent = title;
            toastMessage.textContent = message;

            toast.className = 'toast';
            toast.classList.add(`toast-${type}`);

            const icon = toast.querySelector('.toast-icon i');
            icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';

            toast.classList.add('active');

            setTimeout(() => {
                toast.classList.remove('active');
            }, 3000);
        }

        // Update Stats
        function updateStats() {
            const completed = tasks.filter(task => task.completed).length;
            const pending = tasks.length - completed;
            const total = tasks.length;

            completedCount.textContent = completed;
            pendingCount.textContent = pending;
            totalCount.textContent = total;

            // Update progress percentage
            let percentage = 0;
            if (total > 0) {
                percentage = Math.round((completed / total) * 100);
            }

            progressPercentage.textContent = `${percentage}%`;
            progressFill.style.width = `${percentage}%`;
        }

        // Filter Button Click Events
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                document.querySelectorAll('.category-item').forEach(item => item.classList.remove('active')); // Unselect categories in sidebar


                currentFilter = btn.dataset.filter;
                renderTasks();
            });
        });

        // Search Input Event
        searchInput.addEventListener('input', debounce(() => {
            renderTasks();
        }, 300));

        // Debounce Function
        function debounce(func, delay) {
            let timeout;
            return function() {
                const context = this;
                const args = arguments;
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(context, args), delay);
            };
        }

        // Setup Drag and Drop
        function setupDragAndDrop() {
            const taskItems = document.querySelectorAll('.task-item');
            let draggedItem = null;

            taskItems.forEach(item => {
                // Dragstart event
                item.addEventListener('dragstart', function() {
                    draggedItem = this;
                    setTimeout(() => {
                        this.style.opacity = '0.5';
                    }, 0);
                });

                // Dragend event
                item.addEventListener('dragend', function() {
                    this.style.opacity = '1';
                    draggedItem = null;
                });

                // Dragover event
                item.addEventListener('dragover', function(e) {
                    e.preventDefault();
                });

                // Dragenter event
                item.addEventListener('dragenter', function(e) {
                    e.preventDefault();
                    if (this !== draggedItem) {
                        this.style.borderTop = '2px solid var(--primary)';
                    }
                });

                // Dragleave event
                item.addEventListener('dragleave', function() {
                    this.style.borderTop = '';
                });

                // Drop event
                item.addEventListener('drop', function(e) {
                    e.preventDefault();
                    this.style.borderTop = '';

                    if (this !== draggedItem) {
                        // Get the IDs of the dragged and target items
                        const draggedId = draggedItem.dataset.id;
                        const targetId = this.dataset.id;

                        // Find their positions in the tasks array
                        const draggedIndex = tasks.findIndex(task => task.id === draggedId);
                        const targetIndex = tasks.findIndex(task => task.id === targetId);

                        // Reorder the tasks array
                        const [movedTask] = tasks.splice(draggedIndex, 1);
                        tasks.splice(targetIndex, 0, movedTask);

                        // Save and re-render
                        saveTasks();
                        renderTasks();
                    }
                });
            });

            // Allow dropping on the task list itself (for when there are no tasks or dropping at the end)
            taskList.addEventListener('dragover', function(e) {
                e.preventDefault();
            });

            taskList.addEventListener('drop', function(e) {
                e.preventDefault();

                // Only process if we have a dragged item and we're not dropping on another task
                if (draggedItem && e.target === this) {
                    // Move the dragged task to the end of the array
                    const draggedId = draggedItem.dataset.id;
                    const draggedIndex = tasks.findIndex(task => task.id === draggedId);

                    const [movedTask] = tasks.splice(draggedIndex, 1);
                    tasks.push(movedTask);

                    saveTasks();
                    renderTasks();
                }
            });
        }

        // Check if all tasks are completed
        function checkAllTasksCompleted() {
            if (tasks.length > 0 && tasks.every(task => task.completed)) {
                showToast('Congratulations!', 'You completed all your tasks!', 'success');
            }
        }


        // --- Reminders and Notifications ---

        function checkAndRequestNotificationPermission() {
            if (!("Notification" in navigator)) {
                console.log("This browser does not support notifications.");
            } else if (Notification.permission !== 'granted') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        console.log("Notification permission granted.");
                        scheduleReminders(); // Schedule reminders immediately after permission is granted
                    }
                });
            } else {
                scheduleReminders(); // Schedule reminders if permission is already granted
            }
        }

        function scheduleReminders() {
            tasks.forEach(task => {
                if (task.reminder && !task.completed) {
                    const reminderTime = new Date(task.reminder);
                    const now = new Date();

                    if (reminderTime > now) {
                        const delay = reminderTime.getTime() - now.getTime();
                        setTimeout(() => {
                            showNotification(task);
                        }, delay);
                    }
                }
            });
        }

        function showNotification(task) {
            if (Notification.permission === 'granted') {
                const notification = new Notification("Task Reminder: Todo Zen Pro", {
                    body: `Reminder for task: ${task.title} due on ${new Date(task.dueDate).toLocaleDateString()}`,
                    icon: 'icon.png', // Replace with your icon path if needed
                });

                notification.onclick = function(event) {
                    event.preventDefault(); // Prevent default action
                    window.focus(); // Focus current window
                    // You could also highlight/open the task in the app if needed
                }
            }
        }

        // --- Recurrence Handling (Basic - more complex recurrence patterns could be added) ---

        function handleRecurrence() {
            const now = new Date();
            tasks.forEach(task => {
                if (task.recurrence !== 'none' && task.dueDate) {
                    const dueDate = new Date(task.dueDate);

                    if (dueDate < now && !task.completed) {
                        // Task is overdue and recurring, create a new instance
                        createNewRecurringTask(task);
                    }
                }
            });
        }

        function createNewRecurringTask(originalTask) {
            const newTask = {
                ...originalTask,
                id: Date.now().toString(), // New ID for the recurring task
                completed: false,
                reminder: null, // Clear reminder for new instance
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Adjust due date based on recurrence
            if (originalTask.recurrence === 'daily') {
                newTask.dueDate = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]; // Tomorrow
            } else if (originalTask.recurrence === 'weekly') {
                newTask.dueDate = new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0]; // Next week
            } else if (originalTask.recurrence === 'monthly') {
                newTask.dueDate = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]; // Next month
            }

            tasks.unshift(newTask); // Add new recurring task to the list
            saveTasks();
            renderTasks();
            updateStats();
            scheduleReminders(); // Schedule reminders for the new task
        }


        // --- Initial App Load and Interval Setups ---
        init();
        scheduleReminders(); // Initial scheduling of reminders on app load
        setInterval(handleRecurrence, 60 * 60 * 1000); // Check for recurring tasks every hour (adjust interval as needed)