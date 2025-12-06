"use client";

import { usePathname } from "next/navigation";
import { AISidebar } from "./ai/ai-sidebar";

export function ConditionalAISidebar() {
	const pathname = usePathname();
	
	// Hide AI sidebar on admin pages
	if (pathname?.startsWith("/admin")) {
		return null;
	}
	
	return <AISidebar />;
}
