/**
 * Get the RPC URL for the specified network
 */
export function getSolanaNetworkUrl(
	network: 'mainnet' | 'testnet' | 'devnet' = 'devnet'
): string {
	switch (network) {
		case 'mainnet':
			return 'https://api.mainnet-beta.solana.com';
		case 'testnet':
			return 'https://api.testnet.solana.com';
		case 'devnet':
		default:
			return 'https://api.devnet.solana.com';
	}
}

/**
 * Get the Flow network URL for the specified network
 */
export function getFlowNetworkUrl(
	network: 'mainnet' | 'testnet' = 'testnet'
): string {
	switch (network) {
		case 'mainnet':
			return 'https://rest-mainnet.onflow.org';
		case 'testnet':
		default:
			return 'https://rest-testnet.onflow.org';
	}
}
