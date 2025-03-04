'use client';

import { useState, useEffect } from 'react';
import { UserBalances } from '../components/UserBalances';
import { LiquidityKit, UserData } from 'liquidity-development-kit';
import { MagicAuthProvider } from 'liquidity-development-kit/auth';
import { LayerZeroBridge } from 'liquidity-development-kit/bridges';

// Client-side initialization of Liquidity Kit
// In a real app, API keys would be handled more securely
const ldk = new LiquidityKit({
	authProvider: new MagicAuthProvider({
		apiKey:
			process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY ||
			'your-magic-publishable-key',
	}),
	bridgeProvider: new LayerZeroBridge({
		network: 'testnet',
	}),
	autobridge: true,
});

export default function Home() {
	const [email, setEmail] = useState('');
	const [user, setUser] = useState<UserData | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// Check if user is already logged in
		const checkUser = async () => {
			try {
				const currentUser = await ldk.getCurrentUser();
				if (currentUser) {
					setUser(currentUser);
				}
			} catch (err) {
				console.error('Error checking user:', err);
			}
		};

		checkUser();
	}, []);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			// For client-side Magic Link authentication
			const userData = await ldk.login(email);
			setUser(userData);
		} catch (err) {
			console.error('Login error:', err);
			setError('Failed to login. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const handleLogout = async () => {
		try {
			await ldk.logout();
			setUser(null);
		} catch (err) {
			console.error('Logout error:', err);
		}
	};

	return (
		<main className="container">
			<h1>Liquidity Development Kit Demo</h1>

			{!user ? (
				<div className="auth-section">
					<h2>Login with Magic.link</h2>
					<form onSubmit={handleLogin}>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="Your email"
							required
						/>
						<button type="submit" disabled={loading}>
							{loading ? 'Logging in...' : 'Login'}
						</button>
					</form>
					{error && <p className="error">{error}</p>}
				</div>
			) : (
				<div className="user-section">
					<div className="user-header">
						<h2>Welcome, {user.email}</h2>
						<button onClick={handleLogout}>Logout</button>
					</div>

					<UserBalances user={user} ldk={ldk} />

					<div className="info-card">
						<h3>Instructions</h3>
						<p>
							This demo simulates receiving tokens on your Solana
							address and automatically bridging them to your Flow
							address. In a real application, you would see actual
							blockchain transactions.
						</p>
						<p>
							The system will occasionally simulate token deposits
							to demonstrate the auto-bridging functionality.
						</p>
					</div>
				</div>
			)}
		</main>
	);
}
