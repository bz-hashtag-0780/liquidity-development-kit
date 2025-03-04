'use client';

import { useEffect, useState } from 'react';
import {
	LiquidityKit,
	TokenDeposit,
	UserData,
} from 'liquidity-development-kit';

interface UserBalancesProps {
	user: UserData;
	ldk: LiquidityKit;
}

interface Balance {
	token: string;
	amount: string;
	chain: 'solana' | 'flow';
}

export function UserBalances({ user, ldk }: UserBalancesProps) {
	const [balances, setBalances] = useState<Balance[]>([]);
	const [pendingBridges, setPendingBridges] = useState<TokenDeposit[]>([]);
	const [isListening, setIsListening] = useState(false);

	useEffect(() => {
		if (user && !isListening) {
			// Start listening for deposits
			const startListening = async () => {
				try {
					const { stop } = await ldk.listenForDeposits(
						user.addresses.solanaAddress,
						{
							onDeposit: (deposit: TokenDeposit) => {
								console.log('Deposit detected:', deposit);
								// Add to Solana balances
								setBalances((prev) => [
									...prev.filter(
										(b) =>
											!(
												b.token === deposit.token &&
												b.chain === 'solana'
											)
									),
									{
										token: deposit.token,
										amount: deposit.amount,
										chain: 'solana',
									},
								]);
							},
							onBridgeInitiated: (deposit: TokenDeposit) => {
								console.log('Bridge initiated:', deposit);
								setPendingBridges((prev) => [...prev, deposit]);
							},
							onBridgeCompleted: (deposit: TokenDeposit) => {
								console.log('Bridge completed:', deposit);
								// Remove from pending
								setPendingBridges((prev) =>
									prev.filter(
										(p) => p.txHash !== deposit.txHash
									)
								);

								// Add to Flow balances
								setBalances((prev) => [
									...prev,
									{
										token: deposit.token,
										amount: deposit.amount,
										chain: 'flow',
									},
								]);
							},
						}
					);

					setIsListening(true);

					// Cleanup function to stop listening when component unmounts
					return () => {
						stop();
						setIsListening(false);
					};
				} catch (error) {
					console.error('Error listening for deposits:', error);
				}
			};

			startListening();
		}
	}, [user, ldk, isListening]);

	return (
		<div className="user-balances">
			<h2>Your Balances</h2>

			<div className="addresses">
				<div>
					<h3>Solana Address</h3>
					<p>{user.addresses.solanaAddress}</p>
				</div>
				<div>
					<h3>Flow Address</h3>
					<p>{user.addresses.flowAddress}</p>
				</div>
			</div>

			<div className="balances-container">
				<div className="chain-balances">
					<h3>Solana Balances</h3>
					{balances.filter((b) => b.chain === 'solana').length > 0 ? (
						<ul>
							{balances
								.filter((b) => b.chain === 'solana')
								.map((balance, index) => (
									<li
										key={`solana-${balance.token}-${index}`}
									>
										{balance.amount} {balance.token}
									</li>
								))}
						</ul>
					) : (
						<p>No tokens on Solana yet</p>
					)}
				</div>

				<div className="chain-balances">
					<h3>Flow Balances</h3>
					{balances.filter((b) => b.chain === 'flow').length > 0 ? (
						<ul>
							{balances
								.filter((b) => b.chain === 'flow')
								.map((balance, index) => (
									<li key={`flow-${balance.token}-${index}`}>
										{balance.amount} {balance.token}
									</li>
								))}
						</ul>
					) : (
						<p>No tokens on Flow yet</p>
					)}
				</div>
			</div>

			{pendingBridges.length > 0 && (
				<div className="pending-bridges">
					<h3>Pending Bridges</h3>
					<ul>
						{pendingBridges.map((bridge, index) => (
							<li key={`bridge-${index}`}>
								Bridging {bridge.amount} {bridge.token} from
								Solana to Flow...
							</li>
						))}
					</ul>
				</div>
			)}

			<div className="info-box">
				<h3>Auto-Bridging Active</h3>
				<p>
					When you receive tokens on your Solana address, they will be
					automatically bridged to your Flow address.
				</p>
			</div>
		</div>
	);
}
