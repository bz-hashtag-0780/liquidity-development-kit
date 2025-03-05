'use client';

import { useState, useEffect } from 'react';
import { useMagicSDK } from '../../components/MagicSDKProvider';

export default function DirectMagicPage() {
	const { isLoading, user, login, logout, error, magicSolana, magicFlow } =
		useMagicSDK();
	const [email, setEmail] = useState('');
	const [loginLoading, setLoginLoading] = useState(false);
	const [loginError, setLoginError] = useState<string | null>(null);
	const [debugInfo, setDebugInfo] = useState<string | null>(null);

	// Check if user data updates
	useEffect(() => {
		if (user) {
			console.log('User logged in:', user);
			setDebugInfo(null); // Clear debug info on successful login
			setLoginError(null); // Clear any errors
		}
	}, [user]);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		console.log('Login button clicked with email:', email);

		setLoginLoading(true);
		setLoginError(null);
		setDebugInfo('Attempting to login...');

		try {
			// Use the login function from our custom provider
			await login(email);
			console.log('Login completed successfully');
		} catch (err: any) {
			console.error('Login error:', err);
			setLoginError(
				`Failed to login: ${err?.message || 'Unknown error'}`
			);
			setDebugInfo(`Error details: ${err?.stack || JSON.stringify(err)}`);
		} finally {
			setLoginLoading(false);
		}
	};

	const handleLogout = async () => {
		try {
			await logout();
		} catch (err) {
			console.error('Logout error:', err);
		}
	};

	if (isLoading) {
		return (
			<main className="container">
				<h1>Loading...</h1>
				<div
					className="loading-spinner"
					style={{ textAlign: 'center', marginTop: '2rem' }}
				>
					<div className="spinner"></div>
					<p>Initializing Magic.link and blockchain connections...</p>
				</div>
			</main>
		);
	}

	// Show initialization errors
	if (error) {
		return (
			<main className="container">
				<h1>Initialization Error</h1>
				<div
					className="error-container"
					style={{
						backgroundColor: '#fff0f0',
						padding: '1rem',
						borderRadius: '8px',
						border: '1px solid #ffcccc',
					}}
				>
					<h3>Failed to initialize Magic SDK</h3>
					<p>{error}</p>

					<div style={{ marginTop: '1rem' }}>
						<h4>Possible solutions:</h4>
						<ul>
							<li>
								Make sure you've set up the
								NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY in .env.local
							</li>
							<li>Check that your Magic.link API key is valid</li>
							<li>Try refreshing the page</li>
							<li>
								Check the browser console for more detailed
								errors
							</li>
						</ul>
					</div>
				</div>
			</main>
		);
	}

	return (
		<main className="container">
			<h1>Direct Magic SDK Integration</h1>

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
						<button type="submit" disabled={loginLoading}>
							{loginLoading ? 'Logging in...' : 'Login'}
						</button>
					</form>
					{loginError && <p className="error">{loginError}</p>}
					{debugInfo && (
						<div
							style={{
								marginTop: '1rem',
								padding: '0.5rem',
								backgroundColor: '#f8f9fa',
								borderRadius: '4px',
								fontSize: '14px',
							}}
						>
							<p>
								<strong>Debug Info:</strong>
							</p>
							<pre
								style={{
									whiteSpace: 'pre-wrap',
									wordBreak: 'break-word',
								}}
							>
								{debugInfo}
							</pre>
							<p>
								<strong>API Key:</strong>{' '}
								{process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY
									? process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY.substring(
											0,
											8
									  ) + '...'
									: 'Not found'}
							</p>

							<details>
								<summary>Magic SDK Details</summary>
								<pre>
									{JSON.stringify(
										{
											hasMagicSolana: !!magicSolana,
											hasMagicFlow: !!magicFlow,
										},
										null,
										2
									)}
								</pre>
							</details>
						</div>
					)}

					<div className="info-card" style={{ marginTop: '1.5rem' }}>
						<h3>Direct Magic Integration</h3>
						<p>
							This page uses a direct integration with Magic.link,
							bypassing the LDK wrapper. Enter your email address
							to receive a Magic.link login link. Once logged in,
							you'll see your Solana and Flow addresses.
						</p>
					</div>
				</div>
			) : (
				<div className="user-section">
					<div className="user-header">
						<h2>Welcome, {user.email}</h2>
						<button onClick={handleLogout}>Logout</button>
					</div>

					<div className="info-card">
						<h3>Your Blockchain Addresses</h3>
						<div
							style={{
								backgroundColor: '#f5f5f5',
								padding: '1rem',
								borderRadius: '8px',
								marginTop: '1rem',
							}}
						>
							<p>
								<strong>Solana Address:</strong>
								<br />
								<code
									style={{
										display: 'block',
										padding: '0.5rem',
										backgroundColor: '#eaeaea',
										overflowWrap: 'break-word',
										marginTop: '0.5rem',
									}}
								>
									{user.addresses.solanaAddress}
								</code>
							</p>
							<p style={{ marginTop: '1rem' }}>
								<strong>Flow Address:</strong>
								<br />
								<code
									style={{
										display: 'block',
										padding: '0.5rem',
										backgroundColor: '#eaeaea',
										overflowWrap: 'break-word',
										marginTop: '0.5rem',
									}}
								>
									{user.addresses.flowAddress}
								</code>
							</p>
						</div>

						<p style={{ marginTop: '1.5rem' }}>
							This is a direct implementation of Magic.link with
							Solana and Flow extensions. This demonstrates how to
							get real blockchain addresses for both chains.
						</p>

						<div style={{ marginTop: '1rem' }}>
							<a
								href="/"
								style={{
									display: 'inline-block',
									padding: '0.5rem 1rem',
									backgroundColor: '#f0f0f0',
									borderRadius: '4px',
									textDecoration: 'none',
									color: '#333',
								}}
							>
								← Back to LDK Example
							</a>
						</div>
					</div>
				</div>
			)}
		</main>
	);
}
