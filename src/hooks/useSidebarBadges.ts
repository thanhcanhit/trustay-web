import { useEffect, useState } from 'react';
import { useBookingRequestStore } from '@/stores/bookingRequestStore';
import { useInvitationStore } from '@/stores/invitationStore';
import { useRoommateApplicationsStore } from '@/stores/roommate-applications.store';
import type { BookingRequest } from '@/types/types';

interface BadgeCounts {
	bookingRequests: number;
	invitations: number;
	roommateApplications: number;
}

export function useSidebarBadges(userType: 'tenant' | 'landlord') {
	const [badges, setBadges] = useState<BadgeCounts>({
		bookingRequests: 0,
		invitations: 0,
		roommateApplications: 0,
	});

	const {
		loadReceived: loadBookingRequests,
		received: bookingRequests,
		receivedMeta,
	} = useBookingRequestStore();
	const { loadSent: loadInvitations, sentMeta } = useInvitationStore();
	const { fetchLandlordPendingApplications, pagination: roommateAppPagination } =
		useRoommateApplicationsStore();

	useEffect(() => {
		if (userType === 'landlord') {
			// Fetch all booking requests (we'll count unprocessed ones client-side)
			loadBookingRequests({ page: 1, limit: 100 });

			// Fetch pending invitations
			loadInvitations({ page: 1, limit: 1, status: 'pending' });

			// Fetch accepted roommate applications (waiting for landlord to approve/reject)
			fetchLandlordPendingApplications({ page: 1, limit: 1, status: 'accepted' });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userType]);

	useEffect(() => {
		if (userType === 'landlord') {
			// Count unprocessed booking requests (pending or awaiting_confirmation)
			const unprocessedCount = bookingRequests.filter(
				(req: BookingRequest) => req.status === 'pending' || req.status === 'awaiting_confirmation',
			).length;

			setBadges({
				bookingRequests: unprocessedCount,
				invitations: sentMeta?.total || 0,
				roommateApplications: roommateAppPagination?.total || 0,
			});

			// Debug: Log the data
			console.log('useSidebarBadges - bookingRequests:', bookingRequests);
			console.log('useSidebarBadges - unprocessedCount:', unprocessedCount);
			console.log('useSidebarBadges - sentMeta:', sentMeta);
			console.log('useSidebarBadges - roommateAppPagination:', roommateAppPagination);
		}
	}, [userType, bookingRequests, sentMeta, roommateAppPagination]);

	return badges;
}
