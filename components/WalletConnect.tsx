import React, { useState } from 'react';
import { Magic } from 'magic-sdk';
import { SolanaExtension } from '@magic-ext/solana';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';

// Initialize Magic for Solana
const magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY!, {
	extensions: [
		new SolanaExtension({ rpcUrl: 'https://api.mainnet-beta.solana.com' }),
	],
});

const WalletConnect = () => {
	const [magicAddress, setMagicAddress] = useState<string | null>(null);
	const { login, user, linkWallet, wallets } = usePrivy();

	// Connect via Magic.link
	const connectWithMagic = async () => {
		try {
			const accounts = await magic.solana.getAccounts();
			if (accounts.length) {
				setMagicAddress(accounts[0]);
			}
		} catch (error) {
			console.error('Magic login error:', error);
		}
	};

	// Connect via Privy
	const connectWithPrivy = async () => {
		await login();
		if (user) {
			console.log('Privy User:', user);
		}
	};

	return (
		<div className="p-4 border rounded-lg shadow-lg w-96">
			<h2 className="text-lg font-semibold mb-2">Connect Your Wallet</h2>

			{/* Magic.link Wallet */}
			<button
				onClick={connectWithMagic}
				className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded mb-2"
			>
				Connect with Magic.link
			</button>
			{magicAddress && (
				<p className="text-sm text-gray-600">
					Magic Wallet: {magicAddress}
				</p>
			)}

			{/* Privy Wallet */}
			<button
				onClick={connectWithPrivy}
				className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded"
			>
				Connect with Privy
			</button>
			{user && (
				<p className="text-sm text-gray-600">
					Privy User: {user.email}
				</p>
			)}

			{/* Display linked wallets */}
			{wallets.length > 0 && (
				<div className="mt-2">
					<p className="font-medium">Linked Wallets:</p>
					<ul className="list-disc pl-4 text-sm">
						{wallets.map((wallet) => (
							<li key={wallet.address}>{wallet.address}</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
};

export default function WrappedWalletConnect() {
	return (
		<PrivyProvider appId={process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID!}>
			<WalletConnect />
		</PrivyProvider>
	);
}
