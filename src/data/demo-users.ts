import { User } from '@/stores/userStore';

export const demoUsers: User[] = [
	{
		id: 'tenant-1',
		firstName: 'Văn An',
		lastName: 'Nguyễn',
		email: 'tenant@demo.com',
		phone: '+84901234567',
		gender: 'male',
		role: 'tenant',
		avatar: undefined,
	},
	{
		id: 'landlord-1',
		firstName: 'Thị Bình',
		lastName: 'Trần',
		email: 'landlord@demo.com',
		phone: '+84987654321',
		gender: 'female',
		role: 'landlord',
		avatar: undefined,
	},
];

export const getDemoUser = (email: string): User | null => {
	return demoUsers.find((user) => user.email === email) || null;
};

export const getDemoUserByType = (role: 'tenant' | 'landlord'): User => {
	const user = demoUsers.find((user) => user.role === role);
	if (!user) {
		throw new Error(`Demo user with role ${role} not found`);
	}
	return user;
};
