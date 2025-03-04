import { BridgeParams, BridgeStatus, TokenDeposit } from '../types';

/**
 * Interface that all bridge providers must implement
 */
export interface BridgeProvider {
	/**
	 * Initialize the bridge provider
	 */
	initialize(): Promise<void>;

	/**
	 * Bridge tokens from one chain to another
	 * @returns Transaction hash of the bridge transaction
	 */
	bridgeTokens(params: BridgeParams): Promise<string>;

	/**
	 * Check the status of a bridge transaction
	 */
	getBridgeStatus(txHash: string): Promise<BridgeStatus>;

	/**
	 * Listen for deposits on an address
	 * @returns Object with a stop function to stop listening
	 */
	listenForDeposits(
		address: string,
		callback: (deposit: TokenDeposit) => Promise<void> | void
	): Promise<{ stop: () => void }>;

	/**
	 * Get supported tokens for bridging
	 */
	getSupportedTokens(): Promise<{
		[chain: string]: string[];
	}>;
}
