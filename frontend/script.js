const API_BASE = 'http://localhost:4000/api';

const form = document.getElementById('task-form');
const titleInput = document.getElementById('title');
const descInput = document.getElementById('description');
const taskList = document.getElementById('task-list');
const errorMsg = document.getElementById('error-msg');

function showError(message) {
  errorMsg.textContent = message;
  errorMsg.classList.remove('hidden');
}

function clearError() {
  errorMsg.classList.add('hidden');
}

async function fetchTasks() {
  try {
    clearError();
    const res = await fetch(`${API_BASE}/tasks`);
    if (!res.ok) throw new Error('Failed to fetch tasks');
    const tasks = await res.json();
    renderTasks(tasks);
  } catch (err) {
    showError(`Could not reach the API. Is the backend running on port 4000? (${err.message})`);
  }
}

function renderTasks(tasks) {
  taskList.innerHTML = '';

  if (tasks.length === 0) {
    taskList.innerHTML = '<li class="empty-state">No tasks yet. Add one above.</li>';
    return;
  }

  tasks.forEach((task) => {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.innerHTML = `
      <div class="task-info">
        <div class="task-title ${task.completed ? 'completed' : ''}">${escapeHtml(task.title)}</div>
        ${task.description ? `<div class="task-desc">${escapeHtml(task.description)}</div>` : ''}
      </div>
      <div class="task-actions">
        <button class="btn-complete" data-id="${task.id}" data-completed="${task.completed}">
          ${task.completed ? 'Undo' : 'Done'}
        </button>
        <button class="btn-delete" data-id="${task.id}">Delete</button>
      </div>
    `;
    taskList.appendChild(li);
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  const description = descInput.value.trim();
  if (!title) return;

  try {
    clearError();
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    });
    if (!res.ok) throw new Error('Failed to create task');
    titleInput.value = '';
    descInput.value = '';
    fetchTasks();
  } catch (err) {
    showError(err.message);
  }
});

taskList.addEventListener('click', async (e) => {
  const id = e.target.dataset.id;
  if (!id) return;

  try {
    clearError();
    if (e.target.classList.contains('btn-delete')) {
      const res = await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete task');
    } else if (e.target.classList.contains('btn-complete')) {
      const completed = e.target.dataset.completed === 'true';
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed }),
      });
      if (!res.ok) throw new Error('Failed to update task');
    }
    fetchTasks();
  } catch (err) {
    showError(err.message);
  }
});

fetchTasks();
