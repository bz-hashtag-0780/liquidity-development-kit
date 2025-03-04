'use client';

import { useState, useEffect } from 'react';

export default function DirectMagicLogin() {
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [magic, setMagic] = useState<any>(null);
	const [user, setUser] = useState<any>(null);

	// Initialize Magic on the client side only
	useEffect(() => {
		const initMagic = async () => {
			try {
				// Import Magic SDK dynamically (client-side only)
				const { Magic } = await import('magic-sdk');
				const { OAuthExtension } = await import('@magic-ext/oauth');

				const magicInstance = new Magic(
					process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY || '',
					{
						extensions: [new OAuthExtension()],
					}
				);

				setMagic(magicInstance);

				// Check if user is already logged in
				const isLoggedIn = await magicInstance.user.isLoggedIn();
				if (isLoggedIn) {
					const userMetadata = await magicInstance.user.getMetadata();
					setUser(userMetadata);
				}
			} catch (err) {
				console.error('Error initializing Magic:', err);
				setError('Failed to initialize Magic SDK');
			}
		};

		initMagic();
	}, []);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!magic) {
			setError('Magic SDK not initialized');
			return;
		}

		setLoading(true);
		setError(null);

		try {
			console.log('Trying direct Magic login for:', email);

			// Log in with Magic Link
			const didToken = await magic.auth.loginWithMagicLink({
				email,
				showUI: true,
			});

			console.log('Got DID token:', didToken ? 'Yes' : 'No');

			// Get user metadata
			const userMetadata = await magic.user.getMetadata();
			console.log('User metadata:', userMetadata);

			setUser(userMetadata);
		} catch (err: any) {
			console.error('Magic login error:', err);
			setError(err.message || 'Login failed');
		} finally {
			setLoading(false);
		}
	};

	const handleLogout = async () => {
		if (!magic) return;

		try {
			await magic.user.logout();
			setUser(null);
		} catch (err) {
			console.error('Logout error:', err);
		}
	};

	return (
		<div
			className="direct-magic-login"
			style={{
				marginTop: '2rem',
				padding: '1rem',
				border: '1px solid #ddd',
				borderRadius: '8px',
			}}
		>
			<h3>Direct Magic.link Login Test</h3>
			<p>Test Magic.link directly without going through the LDK</p>

			{!user ? (
				<form onSubmit={handleLogin} style={{ marginTop: '1rem' }}>
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="Your email"
						style={{
							padding: '0.5rem',
							width: '100%',
							marginBottom: '0.5rem',
						}}
						required
					/>
					<button
						type="submit"
						disabled={loading || !magic}
						style={{
							padding: '0.5rem 1rem',
							backgroundColor:
								loading || !magic ? '#ccc' : '#0070f3',
							color: 'white',
							border: 'none',
							borderRadius: '4px',
							cursor:
								loading || !magic ? 'not-allowed' : 'pointer',
						}}
					>
						{loading
							? 'Logging in...'
							: 'Login Directly with Magic'}
					</button>

					{error && (
						<p style={{ color: 'red', marginTop: '0.5rem' }}>
							{error}
						</p>
					)}

					{!magic && (
						<p style={{ color: 'orange', marginTop: '0.5rem' }}>
							Magic SDK is initializing...
						</p>
					)}
				</form>
			) : (
				<div style={{ marginTop: '1rem' }}>
					<p>
						<strong>Logged in as:</strong> {user.email}
					</p>
					<button
						onClick={handleLogout}
						style={{
							marginTop: '0.5rem',
							padding: '0.5rem 1rem',
							backgroundColor: '#f0f0f0',
							border: '1px solid #ccc',
							borderRadius: '4px',
							cursor: 'pointer',
						}}
					>
						Logout
					</button>
				</div>
			)}
		</div>
	);
}
