export interface Report {
	id: string;
	title: string;
	type: string;
	period: string;
	status: string;
	totalRevenue?: number;
	totalExpenses?: number;
	netProfit?: number;
	occupancyRate?: number;
	totalRooms?: number;
	occupiedRooms?: number;
	vacantRooms?: number;
	maintenanceRooms?: number;
	totalTenants?: number;
	newTenants?: number;
	leavingTenants?: number;
	averageRent?: number;
	createdAt: string;
}
