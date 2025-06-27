// pages/todos.js
// This page provides a simple todo list functionality using Supabase
// It demonstrates basic CRUD operations with the database

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function TodosPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTodo, setNewTodo] = useState('');
  const [adding, setAdding] = useState(false);

  // Load todos when component mounts and user is authenticated
  useEffect(() => {
    if (user) {
      getTodos();
    }
  }, [user]);

  // Fetch todos from Supabase
  const getTodos = async () => {
    try {
      setLoading(true);
      const { data: todos, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTodos(todos || []);
    } catch (error) {
      addToast('Failed to load todos', 'error');
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add a new todo
  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      setAdding(true);
      const { data, error } = await supabase
        .from('todos')
        .insert([
          {
            text: newTodo.trim(),
            user_id: user.id,
            completed: false
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setTodos([data, ...todos]);
      setNewTodo('');
      addToast('Todo added successfully!', 'success');
    } catch (error) {
      addToast('Failed to add todo', 'error');
      console.error('Error adding todo:', error);
    } finally {
      setAdding(false);
    }
  };

  // Toggle todo completion status
  const toggleTodo = async (id, completed) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ completed: !completed })
        .eq('id', id);

      if (error) throw error;

      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, completed: !completed } : todo
      ));
    } catch (error) {
      addToast('Failed to update todo', 'error');
      console.error('Error updating todo:', error);
    }
  };

  // Delete a todo
  const deleteTodo = async (id) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTodos(todos.filter(todo => todo.id !== id));
      addToast('Todo deleted successfully!', 'success');
    } catch (error) {
      addToast('Failed to delete todo', 'error');
      console.error('Error deleting todo:', error);
    }
  };

  // Require login to access this page
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view your todos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">My Todos</h1>
        <p className="text-gray-600">
          Manage your personal todo list with Supabase integration.
        </p>
      </div>

      {/* Add Todo Form */}
      <div className="card mb-6">
        <form onSubmit={addTodo} className="flex gap-4">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new todo..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          />
          <button
            type="submit"
            disabled={adding || !newTodo.trim()}
            className="btn btn-primary"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            {adding ? 'Adding...' : 'Add Todo'}
          </button>
        </form>
      </div>

      {/* Todos List */}
      <div className="card">
        {loading ? (
          // Loading state
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="skeleton h-4 w-4 rounded"></div>
                <div className="skeleton h-4 flex-1"></div>
                <div className="skeleton h-8 w-8 rounded"></div>
              </div>
            ))}
          </div>
        ) : todos.length > 0 ? (
          // Todo items
          <div className="space-y-4">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id, todo.completed)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span
                  className={`flex-1 ${
                    todo.completed
                      ? 'text-gray-500 line-through'
                      : 'text-gray-900'
                  }`}
                >
                  {todo.text}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(todo.created_at).toLocaleDateString()}
                </span>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          // Empty state
          <div className="text-center py-8">
            <p className="text-gray-500">No todos yet. Add your first todo above!</p>
          </div>
        )}
      </div>
    </div>
  );
}