import { useEffect, useState } from 'react';
import { useBookingRequestStore } from '@/stores/bookingRequestStore';
import { useInvitationStore } from '@/stores/invitationStore';
import { useRoommateApplicationsStore } from '@/stores/roommate-applications.store';

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

	const { loadReceived: loadBookingRequests, receivedMeta } = useBookingRequestStore();
	const { loadSent: loadInvitations, sentMeta } = useInvitationStore();
	const { fetchLandlordPendingApplications, pagination: roommateAppPagination } =
		useRoommateApplicationsStore();

	useEffect(() => {
		if (userType === 'landlord') {
			// Fetch pending booking requests
			loadBookingRequests({ page: 1, limit: 1, status: 'pending' });

			// Fetch pending invitations
			loadInvitations({ page: 1, limit: 1, status: 'pending' });

			// Fetch accepted roommate applications (waiting for landlord to approve/reject)
			fetchLandlordPendingApplications({ page: 1, limit: 1, status: 'accepted' });
		}
	}, [userType, loadBookingRequests, loadInvitations, fetchLandlordPendingApplications]);

	useEffect(() => {
		if (userType === 'landlord') {
			setBadges({
				bookingRequests: receivedMeta?.total || 0,
				invitations: sentMeta?.total || 0,
				roommateApplications: roommateAppPagination?.total || 0,
			});
		}
	}, [userType, receivedMeta, sentMeta, roommateAppPagination]);

	return badges;
}
