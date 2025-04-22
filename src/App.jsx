import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Check, Plus, Sun, Moon, Loader2 } from 'lucide-react';
import './App.css';

const API_URL = 'http://localhost/api/task_api.php';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [filter, setFilter] = useState('all');
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load tasks from API
  useEffect(() => {
    fetchTasks();
    
    // Load theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : 'light-mode';
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Fetch all tasks from API
  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      
      // Transform the data to match our task structure
      const formattedTasks = data.map(task => ({
        id: task.task_id,
        text: task.task_item,
        completed: task.completed === '1', // Convert to boolean
      }));
      
      setTasks(formattedTasks);
      setError(null);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new task
  const addTask = async () => {
    if (newTask.trim() !== '') {
      setIsLoading(true);
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ item: newTask }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to add task');
        }
        
        // Refresh the task list
        await fetchTasks();
        setNewTask('');
      } catch (err) {
        console.error('Error adding task:', err);
        setError('Failed to add task. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle key press for adding tasks
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  // Delete a task
  const deleteTask = async (id) => {
    setIsLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      
      // Refresh the task list
      await fetchTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Start editing a task
  const startEditing = (id, text) => {
    setEditingTaskId(id);
    setEditingText(text);
  };

  // Save task edit
  const saveEdit = async (id) => {
    if (editingText.trim() !== '') {
      setIsLoading(true);
      try {
        const response = await fetch(API_URL, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            id: id,
            selected_item: editingText 
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update task');
        }
        
        // Refresh the task list
        await fetchTasks();
        setEditingTaskId(null);
      } catch (err) {
        console.error('Error updating task:', err);
        setError('Failed to update task. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle key press for editing tasks
  const handleEditKeyPress = (e, id) => {
    if (e.key === 'Enter') {
      saveEdit(id);
    } else if (e.key === 'Escape') {
      setEditingTaskId(null);
    }
  };

  // Toggle task completion
const toggleCompletion = async (id, currentStatus) => {
  setIsLoading(true);
  try {
      const response = await fetch(API_URL, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
              id: id,
              completed: !currentStatus // Send the new status (opposite of current)
          }),
      });
      
      if (!response.ok) {
          throw new Error('Failed to update task status');
      }
      
      // Optimistically update the UI without full refresh
      setTasks(tasks.map(task => 
          task.id === id ? { ...task, completed: !currentStatus } : task
      ));
  } catch (err) {
      console.error('Error toggling task completion:', err);
      setError('Failed to update task status. Please try again.');
      // Revert the UI change if the request failed
      setTasks(tasks.map(task => 
          task.id === id ? { ...task, completed: currentStatus } : task
      ));
  } finally {
      setIsLoading(false);
  }
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
      
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}
      
      <div className="task-input-container">
        <input
          type="text"
          className="task-input"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add a new task"
          disabled={isLoading}
        />
        <button 
          className="add-btn" 
          onClick={addTask}
          disabled={newTask.trim() === '' || isLoading}
        >
          {isLoading ? <Loader2 size={18} className="spinner" /> : <Plus size={18} />}
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
      
      {isLoading && tasks.length === 0 ? (
        <div className="loading-container">
          <Loader2 size={40} className="spinner" />
          <p>Loading tasks...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="empty-state">
          <p>{filter === 'all' ? 'No tasks yet. Add your first task!' : 
             filter === 'pending' ? 'No pending tasks!' : 'No completed tasks!'}</p>
        </div>
      ) : (
        <ul className="task-list">
          {filteredTasks.map(task => (
            <li 
              key={task.id} 
              className={`task-item ${task.completed ? 'completed' : ''} ${isLoading ? 'disabled' : ''}`}
            >
              <div className="task-content">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleCompletion(task.id, task.completed)}
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={editingText.trim() === '' || isLoading}
                  >
                    {isLoading ? <Loader2 size={18} className="spinner" /> : <Check size={18} />}
                  </button>
                ) : (
                  <>
                    <button 
                      className="edit-btn" 
                      onClick={() => startEditing(task.id, task.text)}
                      disabled={isLoading}
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      className="delete-btn" 
                      onClick={() => deleteTask(task.id)}
                      disabled={isLoading}
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