import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Check, Plus, Sun, Moon } from 'lucide-react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [filter, setFilter] = useState('all');
  const [darkMode, setDarkMode] = useState(false);

  // Load tasks from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
    
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : 'light-mode';
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const addTask = () => {
    if (newTask.trim() !== '') {
      setTasks([...tasks, { 
        id: Date.now(), 
        text: newTask, 
        completed: false,
        createdAt: new Date().toISOString()
      }]);
      setNewTask('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const startEditing = (id, text) => {
    setEditingTaskId(id);
    setEditingText(text);
  };

  const saveEdit = (id) => {
    if (editingText.trim() !== '') {
      setTasks(tasks.map(task => 
        task.id === id ? { ...task, text: editingText } : task
      ));
      setEditingTaskId(null);
    }
  };

  const handleEditKeyPress = (e, id) => {
    if (e.key === 'Enter') {
      saveEdit(id);
    } else if (e.key === 'Escape') {
      setEditingTaskId(null);
    }
  };

  const toggleCompletion = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { 
        ...task, 
        completed: !task.completed,
        completedAt: !task.completed ? new Date().toISOString() : null
      } : task
    ));
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    return true;
  });

  const getFilterButtonClass = (buttonFilter) => {
    return `filter-btn ${filter === buttonFilter ? 'active' : ''}`;
  };

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>To-Do List</h1>
        <button 
          className="theme-toggle" 
          onClick={() => setDarkMode(!darkMode)}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
      
      <div className="task-input-container">
        <input
          type="text"
          className="task-input"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add a new task"
        />
        <button 
          className="add-btn" 
          onClick={addTask}
          disabled={newTask.trim() === ''}
        >
          <Plus size={18} />
          <span>Add Task</span>
        </button>
      </div>
      
      <div className="filter-container">
        <button 
          className={getFilterButtonClass('all')} 
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={getFilterButtonClass('pending')} 
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button 
          className={getFilterButtonClass('completed')} 
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>
      
      {filteredTasks.length === 0 ? (
        <div className="empty-state">
          <p>{filter === 'all' ? 'No tasks yet. Add your first task!' : 
             filter === 'pending' ? 'No pending tasks!' : 'No completed tasks!'}</p>
        </div>
      ) : (
        <ul className="task-list">
          {filteredTasks.map(task => (
            <li 
              key={task.id} 
              className={`task-item ${task.completed ? 'completed' : ''}`}
            >
              <div className="task-content">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleCompletion(task.id)}
                  />
                  <span className="checkmark"></span>
                </label>
                
                {editingTaskId === task.id ? (
                  <input
                    type="text"
                    className="edit-input"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyDown={(e) => handleEditKeyPress(e, task.id)}
                    autoFocus
                  />
                ) : (
                  <span className="task-text">{task.text}</span>
                )}
              </div>
              
              <div className="task-actions">
                {editingTaskId === task.id ? (
                  <button 
                    className="save-btn" 
                    onClick={() => saveEdit(task.id)}
                    disabled={editingText.trim() === ''}
                  >
                    <Check size={18} />
                  </button>
                ) : (
                  <>
                    <button 
                      className="edit-btn" 
                      onClick={() => startEditing(task.id, task.text)}
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      className="delete-btn" 
                      onClick={() => deleteTask(task.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      
      <div className="task-summary">
        <p>
          {tasks.filter(task => !task.completed).length} tasks remaining
        </p>
      </div>
    </div>
  );
}

export default App;