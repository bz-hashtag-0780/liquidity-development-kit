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
	private magicSolana: any = null;
	private magicFlow: any = null;
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

			// Initialize Magic in the simplest way possible to avoid type errors
			console.log('Creating base Magic instance...');
			this.magic = await this.createMagicInstance();

			if (!this.magic) {
				throw new Error('Failed to create Magic instance');
			}

			console.log('Magic instance created successfully');

			// Initialize network connections
			const network = this.config.network || 'testnet';
			const solanaRpcUrl = getSolanaNetworkUrl(
				network === 'mainnet' ? 'mainnet' : 'testnet'
			);
			this.solanaConnection = new Connection(solanaRpcUrl);

			const flowRpcUrl = getFlowNetworkUrl(
				network === 'mainnet' ? 'mainnet' : 'testnet'
			);
			fcl.config().put('accessNode.api', flowRpcUrl);

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

	// Create Magic instance safely with dynamic imports
	private async createMagicInstance() {
		try {
			// Simple dynamic import of the main Magic SDK
			const magicModule = await import('magic-sdk');
			const Magic = magicModule.Magic;

			if (!Magic) {
				console.error('Magic constructor not found in imported module');
				return null;
			}

			console.log('Magic constructor found, creating instance');
			// Create a basic instance without extensions first
			const instance = new Magic(this.config.apiKey);
			console.log('Basic Magic instance created');

			// Also create the blockchain-specific instances if needed
			try {
				console.log(
					'Creating specialized instances will be done later if needed'
				);
			} catch (extError) {
				console.error(
					'Error creating blockchain extensions:',
					extError
				);
				// Continue with just the basic instance
			}

			return instance;
		} catch (error) {
			console.error('Error in createMagicInstance:', error);
			return null;
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
		console.log('Generating addresses for user:', userId);

		// For now, we'll create deterministic addresses as a fallback
		// Later we can implement the actual blockchain-specific logic
		try {
			return {
				// Generate deterministic addresses from userId
				solanaAddress: `solana-${userId.substring(0, 16)}`,
				flowAddress: `0x${userId.substring(0, 16)}`,
			};
		} catch (error) {
			console.error('Error in generateAddresses:', error);
			return {
				solanaAddress: `solana-${userId.substring(0, 16)}`,
				flowAddress: `0x${userId.substring(0, 16)}`,
			};
		}
	}

	/**
	 * Get the Magic SDK instances
	 */
	getMagicInstances() {
		return {
			magic: this.magic,
			magicSolana: this.magicSolana,
			magicFlow: this.magicFlow,
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
			console.log('Generating addresses...');
			const addresses = await this.generateAddresses(userId);

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
