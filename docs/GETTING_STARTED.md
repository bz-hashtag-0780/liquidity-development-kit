# Getting Started with Liquidity Development Kit

The Liquidity Development Kit (LDK) provides a simple way to add cross-chain liquidity functionality to your application. This guide will walk you through the process of setting up the LDK and implementing its core features.

## Installation

Install the LDK using npm or yarn:

```bash
pnpm install liquidity-development-kit
```

## Basic Setup

### 1. Initialize the LDK

```typescript
import { LiquidityKit } from 'liquidity-development-kit';
import { MagicAuthProvider } from 'liquidity-development-kit/auth';
import { LayerZeroBridge } from 'liquidity-development-kit/bridges';

// Initialize the kit
const ldk = new LiquidityKit({
	authProvider: new MagicAuthProvider({
		apiKey: process.env.MAGIC_API_KEY,
	}),
	bridgeProvider: new LayerZeroBridge({
		network: 'testnet', // or 'mainnet'
	}),
	autobridge: true, // Enable automatic bridging
});
```

### 2. User Authentication

The LDK provides a flexible authentication system, currently supporting Magic.link and Privy:

```typescript
// Login with Magic.link
const user = await ldk.login('user@example.com');

// Get user's addresses
const { solanaAddress, flowAddress } = user.addresses;

// Check current user
const currentUser = await ldk.getCurrentUser();

// Logout
await ldk.logout();
```

### 3. Setting Up Auto-Bridging

The LDK can automatically bridge tokens from Solana to Flow when deposits are detected:

```typescript
const { stop } = await ldk.listenForDeposits(solanaAddress, {
	onDeposit: (deposit) => {
		console.log(`Received ${deposit.amount} ${deposit.token} on Solana`);
	},
	onBridgeInitiated: (deposit) => {
		console.log(
			`Starting bridge of ${deposit.amount} ${deposit.token} to Flow`
		);
	},
	onBridgeCompleted: (deposit) => {
		console.log(
			`Successfully bridged ${deposit.amount} ${deposit.token} to Flow`
		);
	},
});

// Later, when you want to stop listening:
stop();
```

### 4. Manual Bridging

You can also manually trigger a bridge operation:

```typescript
const txHash = await ldk.bridgeTokens(
	solanaAddress,
	flowAddress,
	'USDC',
	'100.00'
);

console.log(`Bridge initiated with transaction hash: ${txHash}`);
```

## Configuring Authentication Providers

### Magic.link

```typescript
import { MagicAuthProvider } from 'liquidity-development-kit/auth';

const magicAuth = new MagicAuthProvider({
	apiKey: 'your-magic-api-key',
	network: 'mainnet', // or 'testnet'
});
```

### Privy

```typescript
import { PrivyAuthProvider } from 'liquidity-development-kit/auth';

const privyAuth = new PrivyAuthProvider({
	apiKey: 'your-privy-api-key',
});
```

## Configuring Bridge Providers

### LayerZero

```typescript
import { LayerZeroBridge } from 'liquidity-development-kit/bridges';

const layerZeroBridge = new LayerZeroBridge({
	network: 'mainnet', // or 'testnet'
	// Additional configuration if needed
});
```

## Integration with Next.js

Check the `/examples/nextjs-integration` directory for a complete example of integrating the LDK with a Next.js application.

## Supported Tokens

By default, the LDK supports bridging popular stablecoins and tokens between Solana and Flow. You can check the supported tokens using:

```typescript
const supportedTokens = await ldk.bridge.getSupportedTokens();
console.log(supportedTokens);
```

## Advanced Configuration

You can customize the LDK behavior by passing additional configuration:

```typescript
const ldk = new LiquidityKit({
	authProvider,
	bridgeProvider,
	autobridge: true, // Enable/disable automatic bridging
	supportedTokens: ['USDC', 'USDT'], // Only allow specific tokens for auto-bridging
});
```

## Next Steps

-   Check the full API documentation for more details on all available methods and options
-   Explore the examples directory for implementation samples
-   Set up monitoring for bridge transactions in a production environment

## Troubleshooting

If you're having issues with the LDK, check the following:

1. Ensure you have the correct API keys for Magic.link/Privy and any bridge services
2. Verify network settings (testnet vs mainnet)
3. Check for sufficient token balances and gas fees on source chains
4. Ensure your application has the necessary permissions for wallet interactions
