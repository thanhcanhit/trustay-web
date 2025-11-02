/* eslint-disable */
// @ts-nocheck
// Example Usage of Roommate Invitation Components
// ================================================
// This file contains example code snippets for reference only
// Copy individual examples to your actual implementation files

/**
 * EXAMPLE 1: Using the Complete Panel
 * Use this in your roommate seeking post detail page
 */

import { RoommateInvitationPanel } from "@/components/roommate";

function RoommateSeekingPostDetail() {
  const postId = "your-post-id";

  return (
    <div>
      {/* Other content */}
      
      <RoommateInvitationPanel
        postId={postId}
        onSuccess={() => {
          // Refresh applications list
          // Show success notification
          console.log("Success!");
        }}
      />
    </div>
  );
}

/**
 * EXAMPLE 2: Using Individual Dialogs
 * More granular control over when each dialog is shown
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AddRoommateDialog, InviteLinkDialog } from "@/components/roommate";

function RoommateManagement() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const postId = "your-post-id";

  return (
    <div>
      <Button onClick={() => setShowAddDialog(true)}>
        Thêm trực tiếp
      </Button>
      
      <Button onClick={() => setShowInviteDialog(true)}>
        Tạo link mời
      </Button>

      <AddRoommateDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        postId={postId}
        onSuccess={() => {
          // Handle success
        }}
      />

      <InviteLinkDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
      />
    </div>
  );
}

/**
 * EXAMPLE 3: Displaying Applications
 * Show list of applications with action buttons
 */

import { ApplicationCard } from "@/components/roommate";
import { getApplicationsForMyPosts } from "@/actions/roommate-applications.action";

async function ApplicationsList() {
  const result = await getApplicationsForMyPosts({
    page: 1,
    limit: 10,
  });

  if (!result.success) {
    return <div>Error: {result.error}</div>;
  }

  const applications = result.data.data;

  return (
    <div className="space-y-4">
      {applications.map((app) => (
        <ApplicationCard
          key={app.id}
          application={app}
          userRole="landlord" // or "tenant" or "applicant"
          onUpdate={() => {
            // Refresh list
          }}
        />
      ))}
    </div>
  );
}

/**
 * EXAMPLE 4: Direct API Usage
 * Use the API actions directly without UI components
 */

import {
  addRoommateDirectly,
  generateInviteLink,
  acceptInvite,
} from "@/actions/roommate-applications.action";

async function addRoommateExample() {
  const postId = "your-post-id";
  
  const result = await addRoommateDirectly(postId, {
    email: "user@example.com",
    moveInDate: "2024-01-01",
    intendedStayMonths: 6,
  });

  if (result.success) {
    console.log("Roommate added successfully!");
  } else {
    console.error("Error:", result.error);
  }
}

async function generateLinkExample() {
  const result = await generateInviteLink();

  if (result.success) {
    const { inviteLink, expiresAt } = result.data;
    console.log("Invite link:", inviteLink);
    console.log("Expires at:", expiresAt);
  }
}

async function acceptInviteExample() {
  const result = await acceptInvite({
    token: "invite-token-from-url",
    moveInDate: "2024-01-01",
    intendedStayMonths: 6, // Optional
  });

  if (result.success) {
    console.log("Application submitted!");
    console.log("Status:", result.data.status);
  }
}

/**
 * EXAMPLE 5: Integration with Existing Pages
 * Add to existing roommate seeking post management
 */

function ExistingRoommatePostPage() {
  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const postId = "your-post-id";

  return (
    <div>
      {/* Existing content */}
      <h1>My Roommate Seeking Post</h1>
      
      {/* Add button to show invitation panel */}
      <Button onClick={() => setShowInvitePanel(true)}>
        Mời người ở ghép
      </Button>

      {/* Conditionally render panel */}
      {showInvitePanel && (
        <RoommateInvitationPanel
          postId={postId}
          onSuccess={() => {
            setShowInvitePanel(false);
            // Refresh data
          }}
        />
      )}
    </div>
  );
}

/**
 * EXAMPLE 6: Error Handling Pattern
 */

async function handleAddRoommate() {
  const result = await addRoommateDirectly(postId, formData);

  if (result.success) {
    toast.success("Đã thêm người ở ghép thành công!");
  } else {
    // Handle specific error codes
    if (result.status === 404) {
      toast.error("Không tìm thấy người dùng");
    } else if (result.status === 400) {
      toast.error("Phòng đã hết chỗ hoặc người dùng đã có rental");
    } else {
      toast.error(result.error);
    }
  }
}

/**
 * EXAMPLE 7: Using with React Query
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function ApplicationsWithReactQuery() {
  const queryClient = useQueryClient();

  // Query applications
  const { data, isLoading } = useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const result = await getApplicationsForMyPosts();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

  // Mutation to add roommate
  const addMutation = useMutation({
    mutationFn: (data: AddRoommateDirectlyRequest) =>
      addRoommateDirectly(postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast.success("Success!");
    },
  });

  return (
    <div>
      {/* Use the data */}
    </div>
  );
}

/**
 * EXAMPLE 8: Navigation from Notification
 */

function NotificationHandler({ notification }) {
  const router = useRouter();

  const handleNotificationClick = () => {
    if (notification.type === "ROOMMATE_APPLICATION_RECEIVED") {
      // Navigate to applications page
      router.push("/dashboard/landlord/applications");
    } else if (notification.type === "ROOMMATE_APPLICATION_APPROVED") {
      // Navigate to my applications
      router.push("/dashboard/tenant/my-applications");
    }
  };

  return (
    <button onClick={handleNotificationClick}>
      {notification.message}
    </button>
  );
}
