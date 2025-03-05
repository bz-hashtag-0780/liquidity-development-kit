// Using import type to avoid issues with SSR
import type { UserData, WalletConfig } from '../types';
import { Connection } from '@solana/web3.js';
import * as fcl from '@onflow/fcl';
import { AuthProvider } from './interfaces';
import { getFlowNetworkUrl, getSolanaNetworkUrl } from '../utils/network';

/**
 * Client-side Magic.link authentication provider
 * This provider is meant to be used in the browser
 */
export class MagicClientAuthProvider implements AuthProvider {
	private config: WalletConfig;
	private magic: any = null;
	private solanaConnection: Connection | null = null;
	private currentUser: UserData | null = null;
	private didToken: string = '';

	constructor(config: WalletConfig) {
		this.config = config;
	}

	async initialize(): Promise<void> {
		console.log('Magic client initialization starting...');
		// Skip initialization if not in browser environment
		if (typeof window === 'undefined') {
			console.log('Not in browser environment, skipping initialization');
			return Promise.resolve();
		}

		try {
			console.log(
				'Initializing Magic client with API key:',
				this.config.apiKey.substring(0, 8) + '...'
			);

			// Initialize network connections
			const network = this.config.network || 'testnet';
			const solanaRpcUrl = getSolanaNetworkUrl(
				network === 'mainnet' ? 'mainnet' : 'testnet'
			);
			const flowRpcUrl = getFlowNetworkUrl(
				network === 'mainnet' ? 'mainnet' : 'testnet'
			);

			// Initialize solana connection
			this.solanaConnection = new Connection(solanaRpcUrl);
			fcl.config().put('accessNode.api', flowRpcUrl);

			// Initialize Magic SDK in the simplest possible way for Next.js
			await this.initializeMagicInBrowser(
				solanaRpcUrl,
				flowRpcUrl,
				network
			);

			if (!this.magic) {
				throw new Error('Failed to create Magic instance');
			}

			// Check if user is already logged in
			console.log('Checking if user is already logged in...');
			const isLoggedIn = await this.magic.user.isLoggedIn();
			console.log('User already logged in:', isLoggedIn);

			if (isLoggedIn) {
				await this.loadUserData();
			}

			console.log('Magic client initialization completed successfully');
		} catch (error) {
			console.error('Error during Magic initialization:', error);
			throw new Error(`Failed to initialize Magic client: ${error}`);
		}

		return Promise.resolve();
	}

	// Simplified initialization method that works better with Next.js
	private async initializeMagicInBrowser(
		solanaRpcUrl: string,
		flowRpcUrl: string,
		network: string
	) {
		// Only run in browser
		if (typeof window === 'undefined') {
			return false;
		}

		try {
			// Use eval to avoid Next.js from statically analyzing the imports
			// This is a workaround for Next.js module resolution issues
			const initCode = `
				async function initMagic(apiKey, solanaRpcUrl, flowRpcUrl, network) {
					try {
						// Import Magic SDK
						const { Magic } = await import('magic-sdk');
						
						// Initialize extensions array
						const extensions = [];
						
						// Try to load Solana extension
						try {
							const solanaModule = await import('@magic-ext/solana').catch(() => null);
							if (solanaModule && solanaModule.SolanaExtension) {
								extensions.push(new solanaModule.SolanaExtension({
									rpcUrl: solanaRpcUrl
								}));
								console.log('Solana extension loaded');
							}
						} catch (err) {
							console.warn('Could not load Solana extension:', err);
						}
						
						// Try to load Flow extension
						try {
							const flowModule = await import('@magic-ext/flow').catch(() => null);
							if (flowModule && flowModule.FlowExtension) {
								extensions.push(new flowModule.FlowExtension({
									rpcUrl: flowRpcUrl,
									network: network === 'mainnet' ? 'mainnet' : 'testnet'
								}));
								console.log('Flow extension loaded');
							}
						} catch (err) {
							console.warn('Could not load Flow extension:', err);
						}
						
						// Try to load OAuth extension - SAFELY HANDLING MISSING MODULE
						try {
							// Dynamically import OAuth extension - this will be skipped if module not found
							const oauthModule = await import('@magic-ext/oauth').catch(() => null);
							if (oauthModule && oauthModule.OAuthExtension) {
								extensions.push(new oauthModule.OAuthExtension());
								console.log('OAuth extension loaded');
							} else {
								console.log('OAuth extension not available - skipping');
							}
						} catch (err) {
							console.warn('Could not load OAuth extension (this is okay):', err);
							// Continue without OAuth extension - this is expected if package isn't installed
						}
						
						// Create Magic instance with available extensions
						const magic = new Magic(apiKey, { 
							extensions: extensions.length > 0 ? extensions : undefined 
						});
						
						console.log('Magic SDK initialized with ' + extensions.length + ' extensions');
						return magic;
					} catch (error) {
						console.error('Error initializing Magic:', error);
						return null;
					}
				}
				return initMagic("${this.config.apiKey}", "${solanaRpcUrl}", "${flowRpcUrl}", "${network}");
			`;

			// Execute the initialization code
			console.log('Initializing Magic using browser evaluation...');
			// Use Function constructor instead of eval for better scoping
			const initFunction = new Function(initCode);
			this.magic = await initFunction();

			if (this.magic) {
				console.log(
					'Magic initialized successfully with custom loader'
				);
				return true;
			} else {
				console.error('Failed to initialize Magic with custom loader');
				return false;
			}
		} catch (error) {
			console.error('Error in initializeMagicInBrowser:', error);
			return false;
		}
	}

	async login(email: string): Promise<UserData> {
		console.log('Magic login attempt for email:', email);
		if (!this.magic) {
			console.error('Magic SDK not initialized');
			throw new Error(
				'Magic SDK not initialized. Please refresh the page and try again.'
			);
		}

		try {
			// Login with email - using the basic magic instance like the direct approach
			console.log('Calling magic.auth.loginWithMagicLink...');
			const didToken = await this.magic.auth.loginWithMagicLink({
				email,
				showUI: true,
			});
			console.log('Received DID token:', didToken ? 'Yes' : 'No');
			this.didToken = didToken || '';

			console.log('Loading user data after login...');
			await this.loadUserData();

			if (!this.currentUser) {
				console.error('Failed to load user data after login');
				throw new Error('Failed to load user data after login');
			}

			console.log('Login successful:', this.currentUser);
			return this.currentUser;
		} catch (error) {
			console.error('Error during Magic.link login:', error);
			throw new Error(`Authentication failed: ${error}`);
		}
	}

	async logout(): Promise<void> {
		if (!this.magic) {
			return Promise.resolve();
		}

		try {
			await this.magic.user.logout();
			this.currentUser = null;
			this.didToken = '';
		} catch (error) {
			console.error('Error during logout:', error);
		}

		return Promise.resolve();
	}

	async getCurrentUser(): Promise<UserData | null> {
		// If we already have the user data, return it
		if (this.currentUser) {
			return this.currentUser;
		}

		// If Magic isn't initialized or user isn't logged in, return null
		if (!this.magic) {
			return null;
		}

		try {
			const isLoggedIn = await this.magic.user.isLoggedIn();
			if (!isLoggedIn) {
				return null;
			}

			// Load user data if logged in
			await this.loadUserData();
			return this.currentUser;
		} catch (error) {
			console.error('Error checking current user:', error);
			return null;
		}
	}

	async generateAddresses(userId: string): Promise<{
		solanaAddress: string;
		flowAddress: string;
	}> {
		console.log('Generating blockchain addresses for user:', userId);

		// Initialize with fallback addresses in case something fails
		let solanaAddress = `solana-${userId.substring(0, 16)}`;
		let flowAddress = `0x${userId.substring(0, 16)}`;

		if (!this.magic) {
			console.error(
				'Magic SDK not initialized, using fallback addresses'
			);
			return { solanaAddress, flowAddress };
		}

		// Try to get Solana address if the extension is available
		try {
			if (this.magic.solana) {
				console.log('Getting Solana address from Magic...');
				const address = await this.magic.solana.getAccount();
				console.log('Got Solana address:', address);
				if (address) {
					solanaAddress = address;
				}
			} else {
				console.warn(
					'Solana extension not available in Magic instance'
				);
			}
		} catch (solanaError) {
			console.error('Error getting Solana address:', solanaError);
		}

		// Try to get Flow address if the extension is available
		try {
			if (this.magic.flow) {
				console.log('Getting Flow address from Magic...');
				const address = await this.magic.flow.getAccount();
				console.log('Got Flow address:', address);
				if (address) {
					flowAddress = address;
				}
			} else {
				console.warn('Flow extension not available in Magic instance');
			}
		} catch (flowError) {
			console.error('Error getting Flow address:', flowError);
		}

		// Log the final addresses we're using
		console.log('Using addresses:', { solanaAddress, flowAddress });

		return {
			solanaAddress,
			flowAddress,
		};
	}

	/**
	 * Get the Magic SDK instances
	 */
	getMagicInstances() {
		return {
			magic: this.magic,
			solanaConnection: this.solanaConnection,
		};
	}

	/**
	 * Get the DID token for the authenticated user
	 */
	getToken(): string {
		return this.didToken;
	}

	/**
	 * Set the DID token (useful when you already have a token from elsewhere)
	 */
	setToken(token: string) {
		this.didToken = token;
	}

	/**
	 * Helper method to load user data
	 */
	private async loadUserData(): Promise<void> {
		console.log('Loading user data...');
		if (!this.magic) {
			console.error('Magic SDK not initialized, cannot load user data');
			return;
		}

		try {
			// Get user metadata from Magic
			console.log('Getting user metadata...');
			const userMetadata = await this.magic.user.getMetadata();
			console.log('Got user metadata:', userMetadata);

			if (!userMetadata.issuer) {
				console.warn('No issuer in user metadata, using fallback');
			}

			// Use a fallback ID if necessary
			const userId =
				userMetadata.issuer || userMetadata.email || 'unknown-user';

			// Get blockchain addresses
			console.log('Generating blockchain addresses...');
			const addresses = await this.generateAddresses(userId);
			console.log('Generated addresses:', addresses);

			this.currentUser = {
				id: userId,
				email: userMetadata.email || undefined,
				addresses,
				metadata: {
					provider: 'magic.link',
					...userMetadata,
				},
			};

			console.log('User data loaded successfully:', this.currentUser);
		} catch (error) {
			console.error('Error loading user data:', error);
			throw new Error(`Failed to load user data: ${error}`);
		}
	}
}
