// Custom Magic SDK Provider that handles direct integration with Magic SDK
'use client';

import {
	createContext,
	useContext,
	useEffect,
	useState,
	ReactNode,
} from 'react';
import { Connection } from '@solana/web3.js';
import * as fcl from '@onflow/fcl';
import {
	loadMagicSDK,
	createMagicInstance,
	createSolanaMagicInstance,
	createFlowMagicInstance,
} from '../utils/magic-helper';

// Define the user data structure
interface UserAddresses {
	solanaAddress: string;
	flowAddress: string;
}

interface MagicUser {
	id: string;
	email?: string;
	addresses: UserAddresses;
	metadata: any;
}

// Define the context type
interface MagicSDKContextType {
	isLoading: boolean;
	user: MagicUser | null;
	magic: any | null;
	magicSolana: any | null;
	magicFlow: any | null;
	solanaConnection: Connection | null;
	login: (email: string) => Promise<MagicUser>;
	logout: () => Promise<void>;
	error: string | null;
}

// Create the context
const MagicSDKContext = createContext<MagicSDKContextType>({
	isLoading: true,
	user: null,
	magic: null,
	magicSolana: null,
	magicFlow: null,
	solanaConnection: null,
	login: async () => {
		throw new Error('Not implemented');
	},
	logout: async () => {
		throw new Error('Not implemented');
	},
	error: null,
});

// Export the hook for using the context
export const useMagicSDK = () => useContext(MagicSDKContext);

// Provider component
export function MagicSDKProvider({ children }: { children: ReactNode }) {
	const [isLoading, setIsLoading] = useState(true);
	const [user, setUser] = useState<MagicUser | null>(null);
	const [magic, setMagic] = useState<any | null>(null);
	const [magicSolana, setMagicSolana] = useState<any | null>(null);
	const [magicFlow, setMagicFlow] = useState<any | null>(null);
	const [solanaConnection, setSolanaConnection] = useState<Connection | null>(
		null
	);
	const [error, setError] = useState<string | null>(null);

	// Initialize Magic SDK
	useEffect(() => {
		const initializeMagic = async () => {
			if (typeof window === 'undefined') return;

			try {
				const apiKey = process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY;
				if (!apiKey) {
					setError('Magic SDK API key is missing');
					setIsLoading(false);
					return;
				}

				console.log(
					'Initializing Magic with API key:',
					apiKey.substring(0, 8) + '...'
				);

				// Initialize network connections
				const network = 'testnet'; // Change to 'mainnet' for production
				const solanaRpcUrl =
					network === 'mainnet'
						? 'https://api.mainnet-beta.solana.com'
						: 'https://api.testnet.solana.com';
				const flowRpcUrl =
					network === 'mainnet'
						? 'https://rest-mainnet.onflow.org'
						: 'https://rest-testnet.onflow.org';

				// Create Solana connection
				const connection = new Connection(solanaRpcUrl);
				setSolanaConnection(connection);

				// Configure Flow
				fcl.config().put('accessNode.api', flowRpcUrl);

				// Create Magic instances - load dynamically to avoid SSR issues
				const Magic = await loadMagicSDK();
				if (!Magic) {
					throw new Error('Failed to load Magic SDK');
				}

				// Create separate instances for each blockchain
				// Base instance with no extensions
				const baseInstance = await createMagicInstance(apiKey);
				setMagic(baseInstance);

				// Solana-specific instance
				try {
					const solanaInstance = await createSolanaMagicInstance(
						apiKey,
						solanaRpcUrl
					);
					setMagicSolana(solanaInstance);
				} catch (err) {
					console.warn(
						'Could not create Solana Magic instance:',
						err
					);
				}

				// Flow-specific instance
				try {
					const flowInstance = await createFlowMagicInstance(apiKey, {
						rpcUrl: flowRpcUrl,
						network: network === 'mainnet' ? 'mainnet' : 'testnet',
					});
					setMagicFlow(flowInstance);
				} catch (err) {
					console.warn('Could not create Flow Magic instance:', err);
				}

				// Check if user is already logged in
				if (baseInstance) {
					const isLoggedIn = await baseInstance.user.isLoggedIn();
					if (isLoggedIn) {
						// Load user data
						const userData = await baseInstance.user.getMetadata();

						// Get blockchain addresses
						let solanaAddress = '';
						let flowAddress = '';

						try {
							if (magicSolana) {
								solanaAddress =
									await magicSolana.solana.getAccount();
								console.log(
									'Got Solana address:',
									solanaAddress
								);
							}
						} catch (err) {
							console.error('Error getting Solana address:', err);
						}

						try {
							if (magicFlow) {
								flowAddress = await magicFlow.flow.getAccount();
								console.log('Got Flow address:', flowAddress);
							}
						} catch (err) {
							console.error('Error getting Flow address:', err);
						}

						// Set user data
						setUser({
							id: userData.issuer || '',
							email: userData.email,
							addresses: {
								solanaAddress:
									solanaAddress ||
									`solana-${userData.issuer?.substring(
										0,
										16
									)}`,
								flowAddress:
									flowAddress ||
									`0x${userData.issuer?.substring(0, 16)}`,
							},
							metadata: userData,
						});
					}
				}
			} catch (err) {
				console.error('Error initializing Magic SDK:', err);
				setError(`Failed to initialize Magic SDK: ${err}`);
			} finally {
				setIsLoading(false);
			}
		};

		initializeMagic();
	}, []);

	// Login function
	const login = async (email: string): Promise<MagicUser> => {
		if (!magic) {
			throw new Error('Magic SDK not initialized');
		}

		try {
			console.log('Logging in with email:', email);
			await magic.auth.loginWithMagicLink({ email });

			// Get user metadata
			const userData = await magic.user.getMetadata();

			// Get blockchain addresses
			let solanaAddress = '';
			let flowAddress = '';

			try {
				if (magicSolana) {
					solanaAddress = await magicSolana.solana.getAccount();
					console.log('Got Solana address:', solanaAddress);
				}
			} catch (err) {
				console.error('Error getting Solana address:', err);
			}

			try {
				if (magicFlow) {
					flowAddress = await magicFlow.flow.getAccount();
					console.log('Got Flow address:', flowAddress);
				}
			} catch (err) {
				console.error('Error getting Flow address:', err);
			}

			// Create user object
			const user: MagicUser = {
				id: userData.issuer || '',
				email: userData.email,
				addresses: {
					solanaAddress:
						solanaAddress ||
						`solana-${userData.issuer?.substring(0, 16)}`,
					flowAddress:
						flowAddress || `0x${userData.issuer?.substring(0, 16)}`,
				},
				metadata: userData,
			};

			setUser(user);
			return user;
		} catch (err) {
			console.error('Login error:', err);
			throw err;
		}
	};

	// Logout function
	const logout = async (): Promise<void> => {
		if (!magic) return;

		try {
			await magic.user.logout();
			setUser(null);
		} catch (err) {
			console.error('Logout error:', err);
			throw err;
		}
	};

	return (
		<MagicSDKContext.Provider
			value={{
				isLoading,
				user,
				magic,
				magicSolana,
				magicFlow,
				solanaConnection,
				login,
				logout,
				error,
			}}
		>
			{children}
		</MagicSDKContext.Provider>
	);
}
