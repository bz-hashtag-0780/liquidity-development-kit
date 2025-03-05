'use client';

import { useState, useEffect } from 'react';

// This is a minimal implementation with no dependencies on LDK
export default function MinimalMagicTest() {
	// State for the component
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);
	const [user, setUser] = useState<any>(null);
	const [error, setError] = useState<string | null>(null);
	const [magic, setMagic] = useState<any>(null);
	const [initialized, setInitialized] = useState(false);

	// Initialize Magic only on the client side
	useEffect(() => {
		const initMagic = async () => {
			try {
				// Only load Magic in the browser
				if (typeof window !== 'undefined') {
					console.log('Initializing minimal Magic implementation...');
					setLoading(true);

					// Check for API key
					const apiKey =
						process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY;
					if (!apiKey) {
						throw new Error(
							'Magic API key is missing. Please set NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY in .env.local'
						);
					}
					console.log(
						'API key found:',
						apiKey.substring(0, 8) + '...'
					);

					// Dynamically import Magic to avoid SSR issues
					const { Magic } = await import('magic-sdk');

					// Create new instance with minimal configuration
					const magicInstance = new Magic(apiKey);
					console.log('Magic instance created');

					setMagic(magicInstance);

					// Check if user is already logged in
					const isLoggedIn = await magicInstance.user.isLoggedIn();
					console.log('User logged in status:', isLoggedIn);

					if (isLoggedIn) {
						const userData = await magicInstance.user.getMetadata();
						console.log('User data retrieved:', userData);
						setUser(userData);
					}

					setInitialized(true);
				}
			} catch (err: any) {
				console.error('Magic initialization error:', err);
				setError(
					`Failed to initialize Magic: ${
						err.message || 'Unknown error'
					}`
				);
			} finally {
				setLoading(false);
			}
		};

		initMagic();
	}, []);

	// Login handler
	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!magic) {
			setError('Magic SDK not initialized');
			return;
		}

		setLoading(true);
		setError(null);

		try {
			console.log('Attempting login with email:', email);

			// Use basic email login with no extensions
			const didToken = await magic.auth.loginWithMagicLink({ email });
			console.log('Login successful, token:', didToken);

			// Get user data
			const userData = await magic.user.getMetadata();
			console.log('User data:', userData);
			setUser(userData);
		} catch (err: any) {
			console.error('Login error:', err);
			setError(`Login failed: ${err.message || 'Unknown error'}`);
		} finally {
			setLoading(false);
		}
	};

	// Logout handler
	const handleLogout = async () => {
		if (!magic) return;

		setLoading(true);
		try {
			await magic.user.logout();
			console.log('Logged out successfully');
			setUser(null);
		} catch (err: any) {
			console.error('Logout error:', err);
			setError(`Logout failed: ${err.message || 'Unknown error'}`);
		} finally {
			setLoading(false);
		}
	};

	// Loading state
	if (loading && !initialized) {
		return (
			<main
				style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}
			>
				<h1>Minimal Magic.link Test</h1>
				<div style={{ textAlign: 'center', marginTop: '2rem' }}>
					<div>Loading...</div>
					<p>Initializing Magic.link...</p>
				</div>
			</main>
		);
	}

	// Error state
	if (error && !initialized) {
		return (
			<main
				style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}
			>
				<h1>Minimal Magic.link Test</h1>
				<div
					style={{
						padding: '1rem',
						backgroundColor: '#fff0f0',
						borderRadius: '8px',
						border: '1px solid #ffcccc',
					}}
				>
					<h2>Initialization Error</h2>
					<p>{error}</p>
					<div style={{ marginTop: '1rem' }}>
						<h3>Troubleshooting:</h3>
						<ul>
							<li>
								Make sure your .env.local file contains
								NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY
							</li>
							<li>
								Verify your API key is valid in the Magic
								dashboard
							</li>
							<li>
								Check your browser console for additional error
								details
							</li>
						</ul>
					</div>
				</div>
			</main>
		);
	}

	return (
		<main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
			<h1>Minimal Magic.link Test</h1>
			<p>
				This is a bare-minimum implementation with{' '}
				<strong>no external dependencies</strong> or extensions.
			</p>

			{!user ? (
				<div>
					<h2>Login with Magic.link</h2>
					<form onSubmit={handleLogin} style={{ marginTop: '1rem' }}>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="your@email.com"
							required
							style={{
								padding: '0.5rem',
								width: '100%',
								maxWidth: '300px',
								marginBottom: '1rem',
							}}
						/>
						<button
							type="submit"
							disabled={loading || !initialized}
							style={{
								padding: '0.5rem 1rem',
								backgroundColor: '#0070f3',
								color: 'white',
								border: 'none',
								borderRadius: '4px',
								cursor: loading ? 'not-allowed' : 'pointer',
								opacity: loading ? 0.7 : 1,
							}}
						>
							{loading ? 'Logging in...' : 'Login'}
						</button>
					</form>

					{error && (
						<div
							style={{
								marginTop: '1rem',
								padding: '0.5rem 1rem',
								backgroundColor: '#fff0f0',
								borderRadius: '4px',
								color: '#e00',
							}}
						>
							{error}
						</div>
					)}

					<div style={{ marginTop: '2rem', fontSize: '0.9rem' }}>
						<h3>SDK Status:</h3>
						<p>
							Magic SDK Initialized: {initialized ? '✅' : '❌'}
						</p>
						<p>
							API Key:{' '}
							{process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY
								? process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY.substring(
										0,
										8
								  ) + '...'
								: 'Not found ❌'}
						</p>
					</div>
				</div>
			) : (
				<div>
					<div
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
								padding: '0.5rem 1rem',
								backgroundColor: '#f44336',
								color: 'white',
								border: 'none',
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
						}}
					>
						<h3>User Information</h3>
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
								<strong>User ID:</strong> {user.issuer}
							</p>
							<p>
								<strong>Email:</strong> {user.email}
							</p>

							<p style={{ marginTop: '1rem' }}>
								<strong>Note:</strong> This basic implementation
								does not yet include blockchain extensions. If
								this works, we can add those separately.
							</p>
						</div>
					</div>

					{error && (
						<div
							style={{
								marginTop: '1rem',
								padding: '0.5rem 1rem',
								backgroundColor: '#fff0f0',
								borderRadius: '4px',
								color: '#e00',
							}}
						>
							{error}
						</div>
					)}

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
			)}
		</main>
	);
}
