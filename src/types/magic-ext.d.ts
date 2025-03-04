declare module '@magic-ext/oauth' {
	export class OAuthExtension {
		constructor();
	}
}

declare module '@magic-ext/flow' {
	export class FlowExtension {
		constructor(options: { rpcUrl: string; network: string });
		flow: {
			getAccount(): Promise<string>;
		};
	}
}

declare module '@magic-ext/solana' {
	export class SolanaExtension {
		constructor(options: { rpcUrl: string });
		solana: {
			getAccount(): Promise<string>;
		};
	}
}
