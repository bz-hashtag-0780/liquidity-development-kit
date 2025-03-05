/**
 * Helper functions for loading Magic SDK and extensions safely
 * This is needed because Next.js has issues with dynamic loading of certain modules
 */

// Helper function to safely load the Magic SDK
export async function loadMagicSDK() {
	try {
		const magicModule = await import('magic-sdk');
		return magicModule.Magic;
	} catch (error) {
		console.error('Error loading Magic SDK:', error);
		return null;
	}
}

// Helper function to safely load the Solana extension
export async function loadSolanaExtension() {
	try {
		const solanaModule = await import('@magic-ext/solana');
		return solanaModule.SolanaExtension;
	} catch (error) {
		console.error('Error loading Solana extension:', error);
		return null;
	}
}

// Helper function to safely load the Flow extension
export async function loadFlowExtension() {
	try {
		const flowModule = await import('@magic-ext/flow');
		return flowModule.FlowExtension;
	} catch (error) {
		console.error('Error loading Flow extension:', error);
		return null;
	}
}

// Helper function to safely load the OAuth extension
export async function loadOAuthExtension() {
	try {
		const oauthModule = await import('@magic-ext/oauth');
		return oauthModule.OAuthExtension;
	} catch (error) {
		// We'll just ignore this error since OAuth is optional
		console.warn('OAuth extension not available (this is optional)');
		return null;
	}
}

// Create a Magic instance with available extensions
export async function createMagicInstance(apiKey: string, options: any = {}) {
	const Magic = await loadMagicSDK();

	if (!Magic) {
		throw new Error('Failed to load Magic SDK');
	}

	// Load extensions if not provided in options
	if (!options.extensions) {
		options.extensions = [];

		// Try to load OAuth extension
		const OAuthExtension = await loadOAuthExtension();
		if (OAuthExtension) {
			options.extensions.push(new OAuthExtension());
		}
	}

	return new Magic(apiKey, options);
}

// Create a Magic instance specifically for Solana
export async function createSolanaMagicInstance(
	apiKey: string,
	rpcUrl: string
) {
	const Magic = await loadMagicSDK();
	const SolanaExtension = await loadSolanaExtension();

	if (!Magic || !SolanaExtension) {
		throw new Error('Failed to load Magic SDK or Solana extension');
	}

	return new Magic(apiKey, {
		extensions: [
			new SolanaExtension({
				rpcUrl,
			}),
		],
	});
}

// Create a Magic instance specifically for Flow
export async function createFlowMagicInstance(
	apiKey: string,
	options: {
		rpcUrl: string;
		network: 'mainnet' | 'testnet';
	}
) {
	const Magic = await loadMagicSDK();
	const FlowExtension = await loadFlowExtension();

	if (!Magic || !FlowExtension) {
		throw new Error('Failed to load Magic SDK or Flow extension');
	}

	return new Magic(apiKey, {
		extensions: [
			new FlowExtension({
				rpcUrl: options.rpcUrl,
				network: options.network,
			}),
		],
	});
}
