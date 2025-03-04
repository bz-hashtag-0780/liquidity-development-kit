/**
 * Supported blockchain types
 */
export type ChainType = 'solana' | 'flow';

/**
 * User data with blockchain addresses
 */
export interface UserData {
	id: string;
	email?: string;
	addresses: {
		solanaAddress: string;
		flowAddress: string;
	};
	metadata?: Record<string, any>;
}

/**
 * Token deposit information
 */
export interface TokenDeposit {
	token: string; // Token address/mint
	amount: string; // Amount as string to handle large numbers
	txHash: string; // Transaction hash
	timestamp: number; // Timestamp when deposit was detected
}

/**
 * Parameters for bridging tokens between chains
 */
export interface BridgeParams {
	sourceChain: ChainType;
	destinationChain: ChainType;
	sourceAddress: string;
	destinationAddress: string;
	tokenAddress: string;
	amount: string;
}

/**
 * Status of a bridge transaction
 */
export interface BridgeStatus {
	txHash: string;
	sourceChain: ChainType;
	destinationChain: ChainType;
	status: 'pending' | 'completed' | 'failed';
	error?: string;
}

/**
 * Configuration for wallet providers
 */
export interface WalletConfig {
	apiKey: string;
	network?: 'mainnet' | 'testnet' | 'devnet';
	additionalConfig?: Record<string, any>;
}

/**
 * Configuration for bridge providers
 */
export interface BridgeConfig {
	network?: 'mainnet' | 'testnet';
	apiKey?: string;
	rpcUrl?: string;
	additionalConfig?: Record<string, any>;
}
