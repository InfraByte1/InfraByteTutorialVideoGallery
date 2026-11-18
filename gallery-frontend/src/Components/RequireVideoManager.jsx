import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

import { isAuthenticatedUser } from "../services/auth";
import { canManageVideos } from "../services/permissions";

/**
 * Wraps the pages for adding, editing and deleting videos. Signed-out users go
 * to the home/login page; signed-in users who are not video managers (see
 * canManageVideos in services/permissions.js) go back to the video library.
 */
const RequireVideoManager = ({ children }) => {
  const signedIn = isAuthenticatedUser();
  const allowed = signedIn && canManageVideos();

  useEffect(() => {
    if (signedIn && !allowed) {
      toast.error("Only admins can add or edit videos.");
    }
  }, [signedIn, allowed]);

  if (!signedIn) return <Navigate to="/" replace />;
  if (!allowed) return <Navigate to="/videos" replace />;
  return children;
};

export default RequireVideoManager;
