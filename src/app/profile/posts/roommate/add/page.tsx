import { ProfileLayout } from '@/components/profile/profile-layout';
import { RoommatePostForm } from '@/components/forms/roommate-post-form';

export default function AddRoommatePostPage() {
	return (
		<ProfileLayout>
			<RoommatePostForm mode="create" />
		</ProfileLayout>
	);
}
