'use client';

import { MagicSDKProvider } from '../../components/MagicSDKProvider';

export default function StandaloneLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <MagicSDKProvider>{children}</MagicSDKProvider>;
}
