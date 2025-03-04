# Liquidity Development Kit (LDK)

A development kit that enables cross-chain liquidity between Solana and Flow blockchains, with automatic token bridging functionality.

## Features

-   Multi-wallet provider support (magic.link, privy, with more coming soon)
-   Automatic generation of Solana and Flow addresses for users
-   Automatic token bridging from Solana to Flow when tokens are received
-   Support for multiple bridge providers (LayerZero initially, with Hyperlane coming soon)
-   Simple API for developers to integrate into their projects

## Installation

```bash
pnpm install liquidity-development-kit
```

## Quick Start

```typescript
import { LiquidityKit } from 'liquidity-development-kit';
import { MagicAuthProvider } from 'liquidity-development-kit/auth';
import { LayerZeroBridge } from 'liquidity-development-kit/bridges';

// Initialize the kit
const ldk = new LiquidityKit({
	authProvider: new MagicAuthProvider({ apiKey: 'your-key' }),
	bridgeProvider: new LayerZeroBridge({ network: 'testnet' }),
});

// Login user
const user = await ldk.login(email);

// Start listening for deposits and auto-bridging
ldk.listenForDeposits(user.addresses.solanaAddress, {
	onDeposit: (deposit) =>
		console.log(`Received ${deposit.amount} ${deposit.token}`),
	onBridgeCompleted: (deposit) =>
		console.log(`Bridged to Flow successfully!`),
});
```

## Auth Providers

The LDK supports the following authentication providers:

-   Magic.link (`MagicAuthProvider`)
-   Privy (`PrivyAuthProvider`)

More providers coming soon!

## Bridge Providers

The LDK supports the following bridge providers:

-   LayerZero (`LayerZeroBridge`)

With Hyperlane support coming soon.

## Advanced Configuration

See the [documentation](/docs) for advanced configuration options and examples.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
