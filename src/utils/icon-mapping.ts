import {
	Bath,
	Bed,
	Bike,
	Brush,
	Building,
	Camera,
	Car,
	Cigarette,
	Clock,
	Coffee,
	Dog,
	Droplets,
	Dumbbell,
	Fan,
	Heater,
	Home,
	Lamp,
	Lock,
	type LucideIcon,
	Microwave,
	Refrigerator,
	Settings,
	Shield,
	ShieldCheck,
	Shirt,
	Snowflake,
	Sofa,
	Timer,
	Toilet,
	Trash,
	TreePine,
	Tv,
	Users,
	UserX,
	Utensils,
	Volume2,
	VolumeX,
	WashingMachine,
	Waves,
	Wifi,
	Wind,
	Wrench,
	Zap,
} from 'lucide-react';

// Mapping amenity names to Lucide icons
const amenityIconMap: Record<string, LucideIcon> = {
	// Connectivity
	wifi: Wifi,
	'wi-fi': Wifi,
	internet: Wifi,
	mạng: Wifi,
	'wifi miễn phí': Wifi,
	'wifi tốc độ cao': Wifi,

	// Climate Control
	'điều hòa': Snowflake,
	'air conditioning': Snowflake,
	ac: Snowflake,
	'máy lạnh': Snowflake,
	quạt: Fan,
	fan: Fan,
	heater: Heater,
	'máy sưởi': Heater,

	// Kitchen & Dining
	bếp: Utensils,
	kitchen: Utensils,
	'bếp chung': Utensils,
	'tủ lạnh': Refrigerator,
	refrigerator: Refrigerator,
	fridge: Refrigerator,
	'lò vi sóng': Microwave,
	microwave: Microwave,
	coffee: Coffee,
	'cà phê': Coffee,

	// Laundry
	'máy giặt': WashingMachine,
	'washing machine': WashingMachine,
	'máy giặt chung': WashingMachine,
	'máy sấy': Wind,
	dryer: Wind,

	// Bathroom
	'phòng tắm': Bath,
	bathroom: Bath,
	toilet: Toilet,
	wc: Toilet,
	shower: Bath,
	'tắm đứng': Bath,
	bathtub: Bath,
	'bồn tắm': Bath,

	// Furniture
	giường: Bed,
	bed: Bed,
	'tủ quần áo': Shirt,
	wardrobe: Shirt,
	tủ: Shirt,
	bàn: Home,
	table: Home,
	ghế: Sofa,
	chair: Sofa,
	sofa: Sofa,
	đèn: Lamp,
	lamp: Lamp,
	gương: Settings,
	mirror: Settings,

	// Entertainment
	tv: Tv,
	television: Tv,
	tivi: Tv,

	// Security & Safety
	'bảo vệ': Shield,
	security: Shield,
	'bảo vệ 24/7': Shield,
	camera: Camera,
	cctv: Camera,
	khóa: Lock,
	lock: Lock,
	'khóa an toàn': Lock,

	// Utilities
	điện: Zap,
	electricity: Zap,
	nước: Droplets,
	water: Droplets,
	'điện nước': Zap,

	// Parking
	'gửi xe': Car,
	parking: Car,
	'bãi đỗ xe': Car,
	'gửi xe miễn phí': Car,
	'xe máy': Bike,
	motorbike: Bike,

	// Building Amenities
	'thang máy': Building,
	elevator: Building,
	lift: Building,
	'cầu thang': Building,
	stairs: Building,
	'sân thượng': Building,
	rooftop: Building,
	terrace: Building,
	'ban công': Building,
	balcony: Building,
	gym: Dumbbell,
	'phòng gym': Dumbbell,
	fitness: Dumbbell,
	'hồ bơi': Waves,
	'swimming pool': Waves,
	pool: Waves,
	vườn: TreePine,
	garden: TreePine,
	'công viên': TreePine,
	park: TreePine,

	// Services
	'dọn dẹp': Brush,
	cleaning: Brush,
	'giặt ủi': Shirt,
	laundry: Shirt,
	'bảo trì': Wrench,
	maintenance: Wrench,
	'sửa chữa': Wrench,
	repair: Wrench,

	// Default fallback
	default: Home,
};

// Get icon for amenity name
export function getAmenityIcon(amenityName: string): LucideIcon {
	const normalizedName = amenityName.toLowerCase().trim();

	// Try exact match first
	if (amenityIconMap[normalizedName]) {
		return amenityIconMap[normalizedName];
	}

	// Try partial match
	for (const [key, icon] of Object.entries(amenityIconMap)) {
		if (normalizedName.includes(key) || key.includes(normalizedName)) {
			return icon;
		}
	}

	// Default fallback
	return Home;
}

// Get icon for cost type
export function getCostTypeIcon(costTypeName: string): LucideIcon {
	const normalizedName = costTypeName.toLowerCase().trim();

	const costTypeIconMap: Record<string, LucideIcon> = {
		điện: Zap,
		electricity: Zap,
		nước: Droplets,
		water: Droplets,
		internet: Wifi,
		wifi: Wifi,
		'gửi xe': Car,
		parking: Car,
		'dọn dẹp': Brush,
		cleaning: Brush,
		'bảo trì': Wrench,
		maintenance: Wrench,
		'bảo vệ': Shield,
		security: Shield,
		'thang máy': Building,
		elevator: Building,
		rác: Trash,
		garbage: Trash,
		default: Settings,
	};

	// Try exact match first
	if (costTypeIconMap[normalizedName]) {
		return costTypeIconMap[normalizedName];
	}

	// Try partial match
	for (const [key, icon] of Object.entries(costTypeIconMap)) {
		if (normalizedName.includes(key) || key.includes(normalizedName)) {
			return icon;
		}
	}

	return Settings;
}

// Get icon for rule
export function getRuleIcon(ruleName: string): LucideIcon {
	const normalizedName = ruleName.toLowerCase().trim();

	const ruleIconMap: Record<string, LucideIcon> = {
		'hút thuốc': Cigarette,
		smoking: Cigarette,
		'không hút thuốc': VolumeX,
		'no smoking': VolumeX,
		'thú cưng': Dog,
		pets: Dog,
		pet: Dog,
		'không thú cưng': UserX,
		'no pets': UserX,
		khách: Users,
		visitors: Users,
		guest: Users,
		'không khách': UserX,
		'no visitors': UserX,
		'ồn ào': Volume2,
		noise: Volume2,
		'yên tĩnh': VolumeX,
		quiet: VolumeX,
		'giờ giấc': Clock,
		curfew: Clock,
		time: Clock,
		'tự do': Timer,
		free: Timer,
		'dọn dẹp': Brush,
		cleaning: Brush,
		'sạch sẽ': Brush,
		clean: Brush,
		'an ninh': Shield,
		security: Shield,
		'bảo mật': Lock,
		privacy: Lock,
		default: ShieldCheck,
	};

	// Try exact match first
	if (ruleIconMap[normalizedName]) {
		return ruleIconMap[normalizedName];
	}

	// Try partial match
	for (const [key, icon] of Object.entries(ruleIconMap)) {
		if (normalizedName.includes(key) || key.includes(normalizedName)) {
			return icon;
		}
	}

	return ShieldCheck;
}
