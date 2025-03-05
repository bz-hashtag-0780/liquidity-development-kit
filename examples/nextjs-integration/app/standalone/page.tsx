'use client';

import { useState, useEffect } from 'react';
import { useMagicSDK } from '../../components/MagicSDKProvider';

export default function StandaloneMagicPage() {
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
				<h1>Standalone Magic Integration</h1>
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
				<h1>Standalone Magic Integration</h1>
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
							← Back to Main Page
						</a>
					</div>
				</div>
			</main>
		);
	}

	return (
		<main className="container">
			<h1>Standalone Magic Integration</h1>
			<p>
				This implementation completely bypasses the LDK and directly
				uses Magic.link.
			</p>

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
						<button
							type="submit"
							disabled={loginLoading}
							style={{
								backgroundColor: '#0070f3',
								color: 'white',
								border: 'none',
								padding: '0.5rem 1rem',
								borderRadius: '4px',
								cursor: loginLoading
									? 'not-allowed'
									: 'pointer',
								opacity: loginLoading ? 0.7 : 1,
							}}
						>
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

					<div
						style={{
							marginTop: '1.5rem',
							padding: '1rem',
							backgroundColor: '#f5f5f5',
							borderRadius: '8px',
						}}
					>
						<h3>Standalone Implementation</h3>
						<p>
							This page uses a standalone implementation of
							Magic.link that works independently of the LDK. It
							uses separate Magic instances for Solana and Flow to
							generate real blockchain addresses. Enter your email
							to try it out!
						</p>
					</div>

					<div style={{ marginTop: '2rem', textAlign: 'center' }}>
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
							← Back to Main Page
						</a>
					</div>
				</div>
			) : (
				<div className="user-section">
					<div
						className="user-header"
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							marginBottom: '1.5rem',
						}}
					>
						<h2>Welcome, {user.email}</h2>
						<button
							onClick={handleLogout}
							style={{
								backgroundColor: '#f44336',
								color: 'white',
								border: 'none',
								padding: '0.5rem 1rem',
								borderRadius: '4px',
								cursor: 'pointer',
							}}
						>
							Logout
						</button>
					</div>

					<div
						style={{
							padding: '1.5rem',
							backgroundColor: '#f5f5f5',
							borderRadius: '8px',
							marginBottom: '2rem',
						}}
					>
						<h3>Your Blockchain Addresses</h3>
						<div
							style={{
								backgroundColor: 'white',
								padding: '1rem',
								borderRadius: '8px',
								marginTop: '1rem',
								border: '1px solid #eaeaea',
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
										borderRadius: '4px',
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
										borderRadius: '4px',
									}}
								>
									{user.addresses.flowAddress}
								</code>
							</p>
						</div>

						<p style={{ marginTop: '1.5rem' }}>
							This standalone implementation of Magic.link with
							Solana and Flow extensions generates real blockchain
							addresses for both chains. You can use these
							addresses for transactions on the respective
							blockchains.
						</p>

						<div style={{ marginTop: '1.5rem' }}>
							<h4>User Information</h4>
							<div
								style={{
									backgroundColor: 'white',
									padding: '1rem',
									borderRadius: '8px',
									border: '1px solid #eaeaea',
								}}
							>
								<p>
									<strong>User ID:</strong> {user.id}
								</p>
								<p>
									<strong>Email:</strong> {user.email}
								</p>
								<details>
									<summary>Full User Metadata</summary>
									<pre
										style={{
											overflow: 'auto',
											padding: '0.5rem',
											backgroundColor: '#f8f9fa',
											borderRadius: '4px',
											fontSize: '14px',
										}}
									>
										{JSON.stringify(user.metadata, null, 2)}
									</pre>
								</details>
							</div>
						</div>
					</div>

					<div style={{ textAlign: 'center' }}>
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
							← Back to Main Page
						</a>
					</div>
				</div>
			)}
		</main>
	);
}
