import { Suspense } from 'react'
import { PostCreationWizard } from '@/components/forms/post-creation-wizard'

export default function PostPage() {
	return (
		<div className="min-h-screen bg-gray-50 pt-8 -mb-20">
			<Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="text-lg">Loading...</div></div>}>
				<PostCreationWizard />
			</Suspense>
		</div>
	)
}
