This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 🆕 New Feature: Roommate Invitation

Đã implement đầy đủ tính năng mời người ở ghép với 2 flows:
1. **Add Directly**: Thêm trực tiếp bằng email/phone
2. **Invite by Link**: Tạo link mời với approval flow

📚 **Documentation**:
- [Implementation Guide](./ROOMMATE_INVITATION_IMPLEMENTATION.md) - Chi tiết đầy đủ
- [Quick Summary](./ROOMMATE_INVITATION_SUMMARY.md) - Tóm tắt nhanh
- [Flow Diagrams](./ROOMMATE_INVITATION_DIAGRAMS.md) - Mermaid diagrams
- [Integration Checklist](./ROOMMATE_INVITATION_CHECKLIST.md) - Roadmap
- [Complete Report](./ROOMMATE_INVITATION_COMPLETE.md) - Tổng kết

🎯 **Quick Start**:
```tsx
import { RoommateInvitationPanel } from "@/components/roommate";

<RoommateInvitationPanel postId="your-post-id" onSuccess={() => {}} />
```

🔗 **Demo**: Visit `/dashboard/tenant/roommate-invitation`

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
