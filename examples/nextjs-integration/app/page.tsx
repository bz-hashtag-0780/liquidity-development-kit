'use client';

import { useState, useEffect } from 'react';
import { UserBalances } from '../components/UserBalances';
import { useLiquidityKit } from './providers';
import DirectMagicLogin from '../components/DirectMagicLogin';

export default function Home() {
	const { ldk, user, isLoading, initError, resetError } = useLiquidityKit();
	const [email, setEmail] = useState('');
	const [loginLoading, setLoginLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [debugInfo, setDebugInfo] = useState<string | null>(null);

	// Check if user data updates
	useEffect(() => {
		if (user) {
			console.log('User logged in:', user);
			setDebugInfo(null); // Clear debug info on successful login
			setError(null); // Clear any errors
		}
	}, [user]);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		console.log('Login button clicked with email:', email);

		if (!ldk) {
			setError('SDK not initialized. Please refresh the page.');
			setDebugInfo('LDK object is null');
			return;
		}

		setLoginLoading(true);
		setError(null);
		setDebugInfo('Attempting to login...');

		try {
			// Log LDK state before login
			console.log('LDK before login:', {
				isInstance: ldk instanceof Object,
				hasLogin: typeof ldk.login === 'function',
				properties: Object.keys(ldk),
			});

			// Use the actual Magic.link login
			console.log('Calling ldk.login...');
			await ldk.login(email);
			console.log('ldk.login completed successfully');
			// Note: user state will be updated by the provider
		} catch (err: any) {
			console.error('Login error:', err);
			setError(`Failed to login: ${err?.message || 'Unknown error'}`);
			setDebugInfo(`Error details: ${err?.stack || JSON.stringify(err)}`);
		} finally {
			setLoginLoading(false);
		}
	};

	const handleLogout = async () => {
		if (!ldk) return;

		try {
			await ldk.logout();
			// Note: user state will be updated by the provider
		} catch (err) {
			console.error('Logout error:', err);
		}
	};

	// If we get an error with LDK but direct login works,
	// let's add a button to retry LDK initialization
	const handleRetryLdkInit = () => {
		window.location.reload();
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
	if (initError) {
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
					<h3>Failed to initialize the app</h3>
					<p>{initError}</p>
					<button
						onClick={handleRetryLdkInit}
						style={{
							padding: '0.5rem 1rem',
							backgroundColor: '#0070f3',
							color: 'white',
							border: 'none',
							borderRadius: '4px',
							marginTop: '1rem',
							cursor: 'pointer',
						}}
					>
						Retry Initialization
					</button>
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

				{/* Add direct Magic login for testing */}
				<div style={{ marginTop: '2rem' }}>
					<h2>Try Direct Magic.link Login</h2>
					<p>
						If the LDK integration is failing, try this direct
						Magic.link login to see if your API key works:
					</p>
					<DirectMagicLogin />
				</div>
			</main>
		);
	}

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
						<button type="submit" disabled={loginLoading}>
							{loginLoading ? 'Logging in...' : 'Login'}
						</button>
					</form>
					{error && <p className="error">{error}</p>}
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
								<strong>SDK Status:</strong>{' '}
								{ldk ? 'Initialized' : 'Not Initialized'}
							</p>
							<p>
								<strong>API Key:</strong>{' '}
								{process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY
									? process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY.substring(
											0,
											8
									  ) + '...'
									: 'Not found'}
							</p>
							{ldk && (
								<details>
									<summary>LDK Details</summary>
									<pre>
										{JSON.stringify(
											{
												hasAuthProvider:
													!!ldk.authProvider,
												hasBridgeProvider:
													!!ldk.bridgeProvider,
												methods: Object.keys(
													ldk
												).filter(
													(key) =>
														typeof ldk[
															key as keyof typeof ldk
														] === 'function'
												),
											},
											null,
											2
										)}
									</pre>
								</details>
							)}
						</div>
					)}

					<div className="info-card" style={{ marginTop: '1.5rem' }}>
						<h3>Test Account</h3>
						<p>
							Enter your email address to receive a Magic.link
							login link. Once logged in, you'll see your Solana
							and Flow addresses.
						</p>
					</div>

					{/* Add direct Magic login for testing */}
					<div
						style={{
							marginTop: '2rem',
							padding: '1rem',
							border: '1px solid #ccc',
							borderRadius: '8px',
						}}
					>
						<h3>Try Direct Magic.link Login</h3>
						<p>
							This bypasses the LDK integration to test if
							Magic.link works directly:
						</p>
						<DirectMagicLogin />
					</div>
				</div>
			) : (
				<div className="user-section">
					<div className="user-header">
						<h2>Welcome, {user.email}</h2>
						<button onClick={handleLogout}>Logout</button>
					</div>

					{ldk && <UserBalances user={user} ldk={ldk} />}

					<div className="info-card">
						<h3>Instructions</h3>
						<p>
							This example demonstrates using actual Magic.link
							integration with the Liquidity Development Kit. You
							can receive tokens on your Solana address and they
							will be automatically bridged to your Flow address.
						</p>
						<p>
							Your Solana Address:{' '}
							<strong>{user.addresses.solanaAddress}</strong>
							<br />
							Your Flow Address:{' '}
							<strong>{user.addresses.flowAddress}</strong>
						</p>
					</div>
				</div>
			)}
		</main>
	);
}
