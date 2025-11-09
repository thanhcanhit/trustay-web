// Mock data generator for landlord dashboard analytics

export interface MonthlyRevenue {
	month: string;
	revenue: number;
	expenses: number;
	profit: number;
}

export interface OccupancyTrend {
	month: string;
	occupancyRate: number;
	totalRooms: number;
	occupiedRooms: number;
}

export interface PropertyPerformance {
	buildingName: string;
	revenue: number;
	occupancyRate: number;
	roomCount: number;
}

export interface RoomTypeDistribution {
	type: string;
	count: number;
	percentage: number;
}

export interface RevenueByRoom {
	buildingName: string;
	buildingRevenue: number;
	rooms: {
		roomName: string;
		roomRevenue: number;
		instances: {
			instanceName: string;
			revenue: number;
			status: 'occupied' | 'vacant';
		}[];
	}[];
}

export interface RevenueByCategory {
	category: string;
	amount: number;
	percentage: number;
}

export interface DashboardAnalytics {
	monthlyRevenue: MonthlyRevenue[];
	occupancyTrend: OccupancyTrend[];
	propertyPerformance: PropertyPerformance[];
	roomTypeDistribution: RoomTypeDistribution[];
	revenueByRoom: RevenueByRoom[];
	revenueByCategory: RevenueByCategory[];
	yearToDateStats: {
		totalRevenue: number;
		totalExpenses: number;
		netProfit: number;
		averageOccupancy: number;
		totalContracts: number;
		activeContracts: number;
	};
}

// Generate last 6 months of data
const generateMonthlyRevenue = (): MonthlyRevenue[] => {
	const months = ['T7/2024', 'T8/2024', 'T9/2024', 'T10/2024', 'T11/2024', 'T12/2024'];

	return months.map((month, index) => {
		const baseRevenue = 50000000 + index * 5000000;
		const variation = Math.random() * 10000000;
		const revenue = baseRevenue + variation;
		const expenses = revenue * (0.25 + Math.random() * 0.1); // 25-35% expenses

		return {
			month,
			revenue: Math.round(revenue),
			expenses: Math.round(expenses),
			profit: Math.round(revenue - expenses),
		};
	});
};

// Generate occupancy trend for last 6 months
const generateOccupancyTrend = (): OccupancyTrend[] => {
	const months = ['T7/2024', 'T8/2024', 'T9/2024', 'T10/2024', 'T11/2024', 'T12/2024'];
	const totalRooms = 45;

	return months.map((month, index) => {
		const baseOccupancy = 70 + index * 3;
		const occupancyRate = Math.min(95, baseOccupancy + Math.random() * 5);
		const occupiedRooms = Math.round((totalRooms * occupancyRate) / 100);

		return {
			month,
			occupancyRate: Math.round(occupancyRate * 10) / 10,
			totalRooms,
			occupiedRooms,
		};
	});
};

// Generate property performance data
const generatePropertyPerformance = (): PropertyPerformance[] => {
	return [
		{
			buildingName: 'Nhà trọ Nguyễn Huệ',
			revenue: 28500000,
			occupancyRate: 92.5,
			roomCount: 20,
		},
		{
			buildingName: 'KTX Sinh viên A',
			revenue: 35200000,
			occupancyRate: 88.0,
			roomCount: 25,
		},
		{
			buildingName: 'Chung cư mini Lê Lợi',
			revenue: 18300000,
			occupancyRate: 76.5,
			roomCount: 15,
		},
	];
};

// Generate room type distribution
const generateRoomTypeDistribution = (): RoomTypeDistribution[] => {
	const types = [
		{ type: 'Phòng đơn', count: 15 },
		{ type: 'Phòng đôi', count: 20 },
		{ type: 'Phòng 3-4 người', count: 10 },
		{ type: 'Studio', count: 8 },
		{ type: 'Căn hộ mini', count: 7 },
	];

	const total = types.reduce((sum, t) => sum + t.count, 0);

	return types.map((t) => ({
		...t,
		percentage: Math.round((t.count / total) * 100 * 10) / 10,
	}));
};

// Generate revenue by room with instances
const generateRevenueByRoom = (): RevenueByRoom[] => {
	return [
		{
			buildingName: 'Nhà trọ Nguyễn Huệ',
			buildingRevenue: 26000000,
			rooms: [
				{
					roomName: 'Phòng đơn',
					roomRevenue: 9600000,
					instances: [
						{ instanceName: 'P101', revenue: 3200000, status: 'occupied' },
						{ instanceName: 'P102', revenue: 3200000, status: 'occupied' },
						{ instanceName: 'P103', revenue: 3200000, status: 'occupied' },
					],
				},
				{
					roomName: 'Phòng đôi',
					roomRevenue: 10500000,
					instances: [
						{ instanceName: 'P201', revenue: 3500000, status: 'occupied' },
						{ instanceName: 'P202', revenue: 3500000, status: 'occupied' },
						{ instanceName: 'P203', revenue: 3500000, status: 'occupied' },
					],
				},
				{
					roomName: 'Phòng VIP',
					roomRevenue: 5900000,
					instances: [
						{ instanceName: 'P301', revenue: 4200000, status: 'occupied' },
						{ instanceName: 'P302', revenue: 1700000, status: 'occupied' },
						{ instanceName: 'P303', revenue: 0, status: 'vacant' },
					],
				},
			],
		},
		{
			buildingName: 'KTX Sinh viên A',
			buildingRevenue: 29500000,
			rooms: [
				{
					roomName: 'Phòng 4 người',
					roomRevenue: 10000000,
					instances: [
						{ instanceName: 'A101', revenue: 2500000, status: 'occupied' },
						{ instanceName: 'A102', revenue: 2500000, status: 'occupied' },
						{ instanceName: 'A201', revenue: 2500000, status: 'occupied' },
						{ instanceName: 'A202', revenue: 2500000, status: 'occupied' },
					],
				},
				{
					roomName: 'Phòng 2 người',
					roomRevenue: 6400000,
					instances: [
						{ instanceName: 'A301', revenue: 3200000, status: 'occupied' },
						{ instanceName: 'A302', revenue: 3200000, status: 'occupied' },
					],
				},
				{
					roomName: 'Studio',
					roomRevenue: 13100000,
					instances: [
						{ instanceName: 'B101', revenue: 4800000, status: 'occupied' },
						{ instanceName: 'B102', revenue: 4800000, status: 'occupied' },
						{ instanceName: 'B201', revenue: 3500000, status: 'occupied' },
					],
				},
			],
		},
		{
			buildingName: 'Chung cư mini Lê Lợi',
			buildingRevenue: 18300000,
			rooms: [
				{
					roomName: 'Studio cao cấp',
					roomRevenue: 9000000,
					instances: [
						{ instanceName: 'Studio 1', revenue: 4500000, status: 'occupied' },
						{ instanceName: 'Studio 2', revenue: 4500000, status: 'occupied' },
					],
				},
				{
					roomName: 'Căn hộ 1 phòng ngủ',
					roomRevenue: 9300000,
					instances: [
						{ instanceName: 'A1', revenue: 3100000, status: 'occupied' },
						{ instanceName: 'A2', revenue: 3100000, status: 'occupied' },
						{ instanceName: 'B1', revenue: 3100000, status: 'occupied' },
					],
				},
			],
		},
	];
};

// Generate revenue by category
const generateRevenueByCategory = (): RevenueByCategory[] => {
	const categories = [
		{ category: 'Tiền thuê phòng', amount: 65000000 },
		{ category: 'Tiền điện', amount: 8500000 },
		{ category: 'Tiền nước', amount: 3200000 },
		{ category: 'Dịch vụ internet', amount: 2100000 },
		{ category: 'Phí dịch vụ khác', amount: 3200000 },
	];

	const total = categories.reduce((sum, c) => sum + c.amount, 0);

	return categories.map((c) => ({
		...c,
		percentage: Math.round((c.amount / total) * 100 * 10) / 10,
	}));
};

// Generate complete analytics data
export const generateDashboardAnalytics = (): DashboardAnalytics => {
	const monthlyRevenue = generateMonthlyRevenue();
	const occupancyTrend = generateOccupancyTrend();

	// Calculate year-to-date stats
	const totalRevenue = monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0);
	const totalExpenses = monthlyRevenue.reduce((sum, m) => sum + m.expenses, 0);
	const averageOccupancy =
		occupancyTrend.reduce((sum, m) => sum + m.occupancyRate, 0) / occupancyTrend.length;

	return {
		monthlyRevenue,
		occupancyTrend,
		propertyPerformance: generatePropertyPerformance(),
		roomTypeDistribution: generateRoomTypeDistribution(),
		revenueByRoom: generateRevenueByRoom(),
		revenueByCategory: generateRevenueByCategory(),
		yearToDateStats: {
			totalRevenue: Math.round(totalRevenue),
			totalExpenses: Math.round(totalExpenses),
			netProfit: Math.round(totalRevenue - totalExpenses),
			averageOccupancy: Math.round(averageOccupancy * 10) / 10,
			totalContracts: 68,
			activeContracts: 42,
		},
	};
};

// Helper function to format currency
export const formatCurrency = (amount: number): string => {
	if (amount >= 1000000000) {
		return `${(amount / 1000000000).toFixed(1)}B`;
	}
	if (amount >= 1000000) {
		return `${(amount / 1000000).toFixed(1)}M`;
	}
	if (amount >= 1000) {
		return `${(amount / 1000).toFixed(0)}K`;
	}
	return amount.toString();
};

// Helper function to format percentage
export const formatPercentage = (value: number): string => {
	return `${value.toFixed(1)}%`;
};
