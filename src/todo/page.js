import React, { useState, useEffect } from 'react';
import initializeContract from '../utils/contract';

const TodoList = () => {
    const [newTodo, setNewTodo] = useState('');
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(false); // Loading state
    const [contract, setContract] = useState(null); // Contract instance
    const [user, setUser] = useState("Login");



    const shortenAddress = (address) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };


    // Fetch todos from the contract on component mount

    useEffect(() => {
        const fetchContract = async () => {
            const [contractInstance, signer] = await initializeContract();
            setContract(contractInstance);

            setUser(await signer.getAddress());
            console.log(user);

            const todoData = await contractInstance.getUserTodo();
            const formattedTodos = todoData.map(item => JSON.parse(item));
            setTodos(formattedTodos);
        };

        fetchContract();
    }, []); // Empty dependency array to run only once

    useEffect(() => {
        if (contract) {
            const intervalId = setInterval(() => {
                refreshTodos();
            }, 5000); // Poll every 5 seconds

            return () => clearInterval(intervalId); // Cleanup on unmount
        }
    }, [contract]);

    // Add new todo
    const handleAddTodo = async () => {
        if (newTodo.trim() && contract) {
            setLoading(true); // Start loading
            try {
                await contract.addTodo(newTodo);
                setNewTodo('');
                await refreshTodos(); // Refetch todos after adding
            } finally {
                setLoading(false); // Stop loading
            }
        }
    };

    // Fetch todos after any change
    const refreshTodos = async () => {
        if (contract) {
            const todoData = await contract.getUserTodo();
            const formattedTodos = todoData.map(item => JSON.parse(item));
            setTodos(formattedTodos);
        }
    };

    // Delete todo
    const handleDeleteTodo = async (index) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this to-do?");

        if (confirmDelete && contract) {
            setLoading(true); // Start loading
            try {
                await contract.deleteTodo(index);
                await refreshTodos(); // Refetch todos after deleting
            } finally {
                setLoading(false); // Stop loading
            }
        }
    };


    // Mark todo as completed using contract
    const handleToggleComplete = async (index) => {
        if (contract) {
            setLoading(true); // Start loading
            try {
                await contract.markCompleted(index); // Mark the todo as completed in the contract
                await refreshTodos(); // Refetch todos after completion
            } finally {
                setLoading(false); // Stop loading
            }
        }
    };

    return (
        <div className="body">
            <div className="header">

                <button className="login-button, button-30" id="loginBtn">{shortenAddress(user)}</button>

            </div>
            <div className="container">
                <h1>To-Do</h1>
                <div className="todo-input">
                    <input
                        type="text"
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                        placeholder="Add a new task..."
                        id="newTodo"
                    />
                    <button onClick={handleAddTodo} disabled={loading}>Add</button>
                </div>

                <div className="todo-list-container">
                    <ul id="todoList">
                        {todos.map((todo, index) => (
                            <li key={index} className={todo.status ? 'completed' : ''}>
                                <span
                                    className="dot"
                                    onClick={() => handleToggleComplete(index)}
                                    style={{
                                        backgroundColor: todo.status ? '#28a745' : 'transparent',
                                        cursor: 'pointer'
                                    }}
                                ></span>
                                <span>{todo.todo}</span>
                                <span className="delete" onClick={() => handleDeleteTodo(index)}>❌</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Loading Overlay */}
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                    <p>Processing...</p>
                </div>
            )}
        </div>
    );
};

export default TodoList;
