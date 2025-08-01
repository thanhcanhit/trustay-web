import { User } from '@/stores/user-store';

export const demoUsers: User[] = [
	{
		id: 'tenant-1',
		name: 'Nguyễn Văn An',
		email: 'tenant@demo.com',
		avatar: undefined,
		userType: 'tenant',
	},
	{
		id: 'landlord-1',
		name: 'Trần Thị Bình',
		email: 'landlord@demo.com',
		avatar: undefined,
		userType: 'landlord',
	},
];

export const getDemoUser = (email: string): User | null => {
	return demoUsers.find((user) => user.email === email) || null;
};

export const getDemoUserByType = (userType: 'tenant' | 'landlord'): User => {
	const user = demoUsers.find((user) => user.userType === userType);
	if (!user) {
		throw new Error(`Demo user with type ${userType} not found`);
	}
	return user;
};
