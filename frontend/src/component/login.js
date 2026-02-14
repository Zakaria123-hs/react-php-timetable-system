import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Requires react-router-dom installed
// import './App.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost/php/time_tableV2.php/backend/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (result.status === 'success') {
                const userType = result.user.type.toLowerCase();

                // Save user info if needed
                localStorage.setItem('user', JSON.stringify(result.user));

                // --- NAVIGATION LOGIC ---
                if (userType === 'admin') {
                    navigate('/admin'); // Go to App.js (Admin Table)
                } else if (userType === 'stagiaire') {
                    navigate('/stagiaire'); // Go to Stagiaire.js (Read Only)
                } else if (userType === 'formateur') {
                    navigate('/formateur'); // Or wherever teachers go
                } else {
                    setError('Unknown user type');
                }

            } else {
                setError(result.message);
            }
        } catch (err) {
            console.error(err);
            setError('Connection failed. Is PHP running?');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">Welcome Back</h2>
                <p className="login-subtitle">Please sign in to your account</p>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button type="submit" className="btn-login">
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;