import { UserData, WalletConfig } from '../types';

/**
 * Interface that all authentication providers must implement
 */
export interface AuthProvider {
	/**
	 * Initialize the auth provider
	 */
	initialize(): Promise<void>;

	/**
	 * Login a user with the given identifier (usually email)
	 */
	login(identifier: string): Promise<UserData>;

	/**
	 * Logout the current user
	 */
	logout(): Promise<void>;

	/**
	 * Get the current user data if logged in
	 */
	getCurrentUser(): Promise<UserData | null>;

	/**
	 * Generate blockchain addresses for the user
	 */
	generateAddresses(userId: string): Promise<{
		solanaAddress: string;
		flowAddress: string;
	}>;
}
