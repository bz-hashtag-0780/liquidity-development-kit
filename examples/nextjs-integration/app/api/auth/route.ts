import { NextRequest, NextResponse } from 'next/server';
import { LiquidityKit } from 'liquidity-development-kit';
import { MagicAuthProvider } from 'liquidity-development-kit/auth';
import { LayerZeroBridge } from 'liquidity-development-kit/bridges';

// Initialize the Liquidity Development Kit
const ldk = new LiquidityKit({
	authProvider: new MagicAuthProvider({
		apiKey: process.env.MAGIC_API_KEY || 'your-magic-api-key',
	}),
	bridgeProvider: new LayerZeroBridge({
		network: 'testnet',
	}),
	autobridge: true,
});

export async function POST(request: NextRequest) {
	try {
		const { email } = await request.json();

		if (!email) {
			return NextResponse.json(
				{ error: 'Email is required' },
				{ status: 400 }
			);
		}

		// Login user with Magic.link
		const userData = await ldk.login(email);

		return NextResponse.json({
			success: true,
			user: userData,
		});
	} catch (error) {
		console.error('Authentication error:', error);
		return NextResponse.json(
			{ error: 'Authentication failed' },
			{ status: 500 }
		);
	}
}
