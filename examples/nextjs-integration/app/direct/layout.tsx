'use client';

import { MagicSDKProvider } from '../../components/MagicSDKProvider';

export default function DirectLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <MagicSDKProvider>{children}</MagicSDKProvider>;
}
