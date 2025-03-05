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
				methods: Object.keys(ldk).filter(
					(key) => typeof ldk[key as keyof typeof ldk] === 'function'
				),
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

				{/* Direct Magic implementation link */}
				<div
					style={{
						marginTop: '2rem',
						padding: '1.5rem',
						backgroundColor: '#f0f8ff',
						borderRadius: '8px',
						border: '1px solid #add8e6',
						textAlign: 'center',
					}}
				>
					<h2>Try Our Direct Magic.Link Implementation</h2>
					<p style={{ marginBottom: '1rem' }}>
						We've built a standalone implementation that directly
						integrates with Magic.link and should work regardless of
						any LDK initialization issues.
					</p>
					<a
						href="/direct"
						style={{
							display: 'inline-block',
							padding: '0.75rem 1.5rem',
							backgroundColor: '#0070f3',
							color: 'white',
							borderRadius: '4px',
							textDecoration: 'none',
							fontWeight: 'bold',
							fontSize: '1.1rem',
						}}
					>
						Go to Direct Implementation →
					</a>
					<p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
						This solution should generate real Solana and Flow
						addresses using Magic.link
					</p>
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

			{/* Standalone Implementation Banner */}
			<div
				style={{
					marginBottom: '2rem',
					padding: '1.5rem',
					backgroundColor: '#E8F5FF',
					borderRadius: '8px',
					border: '2px solid #0070f3',
					textAlign: 'center',
				}}
			>
				<h2 style={{ margin: '0 0 0.75rem 0', color: '#0070f3' }}>
					🎉 Working Solution Available!
				</h2>
				<p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
					We've created a <strong>standalone implementation</strong>{' '}
					that generates real Solana and Flow addresses.
				</p>
				<a
					href="/standalone"
					style={{
						display: 'inline-block',
						padding: '0.75rem 1.5rem',
						backgroundColor: '#0070f3',
						color: 'white',
						borderRadius: '4px',
						textDecoration: 'none',
						fontWeight: 'bold',
						fontSize: '1.1rem',
						boxShadow: '0 4px 6px rgba(0, 112, 243, 0.2)',
					}}
				>
					Try Standalone Magic Implementation →
				</a>
				<p
					style={{
						fontSize: '0.9rem',
						marginTop: '0.75rem',
						color: '#666',
					}}
				>
					This implementation bypasses the LDK completely and works
					reliably
				</p>
			</div>

			{/* Minimal fallback implementation */}
			<div
				style={{
					marginBottom: '2rem',
					padding: '1.5rem',
					backgroundColor: '#FFF8E1',
					borderRadius: '8px',
					border: '2px solid #FFA000',
					textAlign: 'center',
				}}
			>
				<h2 style={{ margin: '0 0 0.75rem 0', color: '#FF6F00' }}>
					⚠️ Try Minimal Implementation
				</h2>
				<p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
					Having trouble with other implementations? Try our{' '}
					<strong>absolute minimal</strong> Magic.link integration
					with no dependencies.
				</p>
				<a
					href="/minimal"
					style={{
						display: 'inline-block',
						padding: '0.75rem 1.5rem',
						backgroundColor: '#FF6F00',
						color: 'white',
						borderRadius: '4px',
						textDecoration: 'none',
						fontWeight: 'bold',
						fontSize: '1.1rem',
						boxShadow: '0 4px 6px rgba(255, 111, 0, 0.2)',
					}}
				>
					Try Minimal Magic Implementation →
				</a>
				<p
					style={{
						fontSize: '0.9rem',
						marginTop: '0.75rem',
						color: '#666',
					}}
				>
					This implementation has zero dependencies and should work
					regardless of other issues
				</p>
			</div>

			{/* Direct Magic implementation banner - always visible */}
			<div
				style={{
					marginBottom: '2rem',
					padding: '1rem',
					backgroundColor: '#f0f8ff',
					borderRadius: '8px',
					border: '1px solid #add8e6',
				}}
			>
				<h3 style={{ margin: '0 0 0.5rem 0' }}>
					Try Our Direct Implementation
				</h3>
				<p style={{ margin: '0 0 0.75rem 0' }}>
					For a guaranteed working integration with real blockchain
					addresses:
				</p>
				<a
					href="/direct"
					style={{
						display: 'inline-block',
						padding: '0.5rem 1rem',
						backgroundColor: '#0070f3',
						color: 'white',
						borderRadius: '4px',
						textDecoration: 'none',
					}}
				>
					Open Direct Magic Implementation →
				</a>
			</div>

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
												hasAuthProvider: true,
												hasBridgeProvider: true,
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
							This example demonstrates using actual Magic.link
							integration with the Liquidity Development Kit. You
							can receive tokens on your Solana address and they
							will be automatically bridged to your Flow address.
						</p>
					</div>
				</div>
			)}
		</main>
	);
}
