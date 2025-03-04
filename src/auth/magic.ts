import { Magic as MagicAdmin } from '@magic-sdk/admin';
import { UserData, WalletConfig } from '../types';
import { AuthProvider } from './interfaces';
import { createHash } from 'crypto';

/**
 * MagicLink authentication provider
 */
export class MagicAuthProvider implements AuthProvider {
	private magic: MagicAdmin;
	private config: WalletConfig;
	private currentUser: UserData | null = null;

	constructor(config: WalletConfig) {
		this.config = config;
		this.magic = new MagicAdmin(config.apiKey);
	}

	async initialize(): Promise<void> {
		// Magic.link doesn't require special initialization on the server side
		return Promise.resolve();
	}

	async login(email: string): Promise<UserData> {
		try {
			// In a real implementation, this would validate a DID token
			// Here we're just generating a user ID from the email
			const userId = this.generateUserId(email);

			// Generate blockchain addresses for this user
			const addresses = await this.generateAddresses(userId);

			const userData: UserData = {
				id: userId,
				email,
				addresses,
				metadata: {
					provider: 'magic.link',
				},
			};

			this.currentUser = userData;
			return userData;
		} catch (error) {
			console.error('Error during Magic.link login:', error);
			throw new Error('Authentication failed');
		}
	}

	async logout(): Promise<void> {
		// In a client-side implementation, this would call magic.user.logout()
		this.currentUser = null;
		return Promise.resolve();
	}

	async getCurrentUser(): Promise<UserData | null> {
		return this.currentUser;
	}

	async generateAddresses(userId: string): Promise<{
		solanaAddress: string;
		flowAddress: string;
	}> {
		// In a real implementation, these would be derived from the user's Magic.link wallet
		// For now, we're deterministically generating them from the user ID

		// Create deterministic "random" values based on user ID
		const solanaAddressSeed = createHash('sha256')
			.update(`${userId}-solana`)
			.digest('hex');
		const flowAddressSeed = createHash('sha256')
			.update(`${userId}-flow`)
			.digest('hex');

		return {
			solanaAddress: `${solanaAddressSeed.substring(0, 32)}`,
			flowAddress: `0x${flowAddressSeed.substring(0, 16)}`,
		};
	}

	private generateUserId(email: string): string {
		return createHash('md5').update(email).digest('hex');
	}
}
