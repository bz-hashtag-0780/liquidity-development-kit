import { Providers } from './providers';
import './globals.css';

export const metadata = {
	title: 'Liquidity Development Kit Demo',
	description: 'Example application using the Liquidity Development Kit',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
