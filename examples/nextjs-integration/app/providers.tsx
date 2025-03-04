'use client';

import {
	ReactNode,
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { LiquidityKit, UserData } from 'liquidity-development-kit';
import { MagicClientAuthProvider } from 'liquidity-development-kit/auth';
import { LayerZeroBridge } from 'liquidity-development-kit/bridges';
import { Connection } from '@solana/web3.js';

// Create context for the LDK
type LiquidityKitContextType = {
	ldk: LiquidityKit | null;
	user: UserData | null;
	isLoading: boolean;
	solanaConnection: Connection | null;
	token: string;
	setToken: (token: string) => void;
	initError: string | null;
	resetError: () => void;
};

const LiquidityKitContext = createContext<LiquidityKitContextType>({
	ldk: null,
	user: null,
	isLoading: true,
	solanaConnection: null,
	token: '',
	setToken: () => {},
	initError: null,
	resetError: () => {},
});

export const useLiquidityKit = () => useContext(LiquidityKitContext);

export function Providers({ children }: { children: ReactNode }) {
	const [ldk, setLdk] = useState<LiquidityKit | null>(null);
	const [user, setUser] = useState<UserData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [solanaConnection, setSolanaConnection] = useState<Connection | null>(
		null
	);
	const [token, setToken] = useState('');
	const [magicProvider, setMagicProvider] =
		useState<MagicClientAuthProvider | null>(null);
	const [initError, setInitError] = useState<string | null>(null);

	const resetError = () => setInitError(null);

	// Initialize the SDK
	useEffect(() => {
		const initializeSdk = async () => {
			if (typeof window === 'undefined') return;
			console.log('Starting SDK initialization...');

			try {
				// Check if API key is available
				const apiKey = process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY;
				console.log('API key available:', !!apiKey);
				console.log(
					'API key first 10 chars:',
					apiKey?.substring(0, 10) + '...'
				);

				if (!apiKey) {
					setInitError(
						'Magic.link API key is missing. Please add NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY to your .env.local file'
					);
					setIsLoading(false);
					return;
				}

				// Create Magic auth provider - IMPORTANT: Use the key directly without any fallbacks
				console.log('Creating Magic auth provider...');
				const magicAuthProvider = new MagicClientAuthProvider({
					apiKey,
					network: 'testnet',
				});
				console.log('Magic auth provider created successfully');

				// Create Bridge provider
				console.log('Creating bridge provider...');
				const bridgeProvider = new LayerZeroBridge({
					network: 'testnet',
				});
				console.log('Bridge provider created successfully');

				// Create LDK instance
				console.log('Creating LDK instance...');
				const ldkInstance = new LiquidityKit({
					authProvider: magicAuthProvider,
					bridgeProvider,
					autobridge: true,
				});
				console.log('LDK instance created successfully');

				// Initialize Magic
				console.log('Initializing Magic auth provider...');
				try {
					await magicAuthProvider.initialize();
					console.log('Magic auth provider initialized successfully');
					setMagicProvider(magicAuthProvider);
				} catch (magicError) {
					console.error('Error initializing Magic:', magicError);
					throw new Error(
						`Failed to initialize Magic: ${magicError}`
					);
				}

				// Get Magic instances
				console.log('Getting Magic instances...');
				const magicInstances = magicAuthProvider.getMagicInstances();
				console.log('Magic instances:', Object.keys(magicInstances));
				const { solanaConnection: conn } = magicInstances;
				setSolanaConnection(conn);

				// Check for existing user
				console.log('Checking for existing user...');
				try {
					const currentUser = await ldkInstance.getCurrentUser();
					if (currentUser) {
						console.log('Found existing user:', currentUser);
						setUser(currentUser);
					} else {
						console.log('No existing user found');
					}
				} catch (userError) {
					console.error('Error checking existing user:', userError);
				}

				console.log('SDK initialization complete');
				setLdk(ldkInstance);

				// Patch login/logout methods to update user state
				const originalLogin = ldkInstance.login.bind(ldkInstance);
				ldkInstance.login = async (identifier: string) => {
					console.log('Patched login called with:', identifier);
					try {
						const userData = await originalLogin(identifier);
						console.log('Login successful, user data:', userData);
						setUser(userData);
						return userData;
					} catch (error) {
						console.error('Login error in patch:', error);
						throw error; // Rethrow to maintain original behavior
					}
				};

				const originalLogout = ldkInstance.logout.bind(ldkInstance);
				ldkInstance.logout = async () => {
					console.log('Patched logout called');
					try {
						await originalLogout();
						console.log('Logout successful');
						setUser(null);
					} catch (error) {
						console.error('Logout error in patch:', error);
						throw error; // Rethrow to maintain original behavior
					}
				};
			} catch (error: any) {
				console.error('Error initializing SDK:', error);
				console.error('Error stack:', error?.stack);
				setInitError(
					`SDK initialization failed: ${
						error?.message || 'Unknown error'
					}`
				);
			} finally {
				setIsLoading(false);
			}
		};

		initializeSdk();
	}, []);

	// Update token when it changes
	useEffect(() => {
		if (magicProvider && token) {
			console.log('Setting Magic token');
			magicProvider.setToken(token);
		}
	}, [magicProvider, token]);

	const contextValue = useMemo(
		() => ({
			ldk,
			user,
			isLoading,
			solanaConnection,
			token,
			setToken,
			initError,
			resetError,
		}),
		[ldk, user, isLoading, solanaConnection, token, initError]
	);

	return (
		<LiquidityKitContext.Provider value={contextValue}>
			{children}
		</LiquidityKitContext.Provider>
	);
}
