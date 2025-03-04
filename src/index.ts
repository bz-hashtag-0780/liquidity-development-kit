import { AuthProvider } from './auth/interfaces';
import { BridgeProvider } from './bridges/interfaces';
import { TokenDeposit, UserData } from './types';

export interface LiquidityKitConfig {
	authProvider: AuthProvider;
	bridgeProvider: BridgeProvider;
	autobridge?: boolean; // Whether to automatically bridge tokens when detected
	supportedTokens?: string[]; // List of supported token addresses
}

export class LiquidityKit {
	private authProvider: AuthProvider;
	private bridgeProvider: BridgeProvider;
	private autobridge: boolean;
	private supportedTokens: string[];

	constructor(config: LiquidityKitConfig) {
		this.authProvider = config.authProvider;
		this.bridgeProvider = config.bridgeProvider;
		this.autobridge = config.autobridge ?? true;
		this.supportedTokens = config.supportedTokens ?? [];
	}

	/**
	 * Get the auth module
	 */
	get auth() {
		return this.authProvider;
	}

	/**
	 * Get the bridge module
	 */
	get bridge() {
		return this.bridgeProvider;
	}

	/**
	 * Login a user with the configured auth provider
	 */
	async login(identifier: string): Promise<UserData> {
		const userData = await this.authProvider.login(identifier);
		return userData;
	}

	/**
	 * Logout the current user
	 */
	async logout(): Promise<void> {
		await this.authProvider.logout();
	}

	/**
	 * Get the current user data if logged in
	 */
	async getCurrentUser(): Promise<UserData | null> {
		return this.authProvider.getCurrentUser();
	}

	/**
	 * Listen for deposits to a Solana address and trigger callbacks
	 */
	async listenForDeposits(
		solanaAddress: string,
		callbacks: {
			onDeposit?: (deposit: TokenDeposit) => Promise<void> | void;
			onBridgeInitiated?: (deposit: TokenDeposit) => void;
			onBridgeCompleted?: (deposit: TokenDeposit) => void;
		}
	): Promise<{ stop: () => void }> {
		const depositHandler = async (deposit: TokenDeposit) => {
			// Call the onDeposit callback
			if (callbacks.onDeposit) {
				await callbacks.onDeposit(deposit);
			}

			// Auto-bridge tokens if enabled and token is supported
			if (
				this.autobridge &&
				(this.supportedTokens.length === 0 ||
					this.supportedTokens.includes(deposit.token))
			) {
				try {
					// Get user data to find destination address
					const userData = await this.authProvider.getCurrentUser();
					if (!userData) throw new Error('User not logged in');

					// Initiate bridge
					if (callbacks.onBridgeInitiated) {
						callbacks.onBridgeInitiated(deposit);
					}

					// Execute the bridge
					await this.bridgeProvider.bridgeTokens({
						sourceChain: 'solana',
						destinationChain: 'flow',
						sourceAddress: solanaAddress,
						destinationAddress: userData.addresses.flowAddress,
						tokenAddress: deposit.token,
						amount: deposit.amount,
					});

					// Bridge completed
					if (callbacks.onBridgeCompleted) {
						callbacks.onBridgeCompleted(deposit);
					}
				} catch (error) {
					console.error('Error during auto-bridging:', error);
				}
			}
		};

		// Start listening for deposits with the bridge provider
		const { stop } = await this.bridgeProvider.listenForDeposits(
			solanaAddress,
			depositHandler
		);

		return { stop };
	}

	/**
	 * Manually bridge tokens from Solana to Flow
	 */
	async bridgeTokens(
		sourceAddress: string,
		destinationAddress: string,
		tokenAddress: string,
		amount: string
	): Promise<string> {
		return this.bridgeProvider.bridgeTokens({
			sourceChain: 'solana',
			destinationChain: 'flow',
			sourceAddress,
			destinationAddress,
			tokenAddress,
			amount,
		});
	}
}

// Export types and implementations
export * from './types';
export * from './auth';
export * from './bridges';
