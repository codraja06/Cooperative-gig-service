import { useAuth } from "@/contexts/AuthContext";
import { Redirect, useSegments } from "expo-router";
import React from "react";
import { LoadingSpinner } from "./UIKit";
export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const section = segments[0] as string | undefined;
  const isPublic =
    !section || ["onboarding", "roles", "(auth)"].includes(section);
  if (!isPublic && isLoading) return <LoadingSpinner />;
  if (!isPublic && !user) return <Redirect href="/roles" />;
  if (
    section === "booking" &&
    segments[1] === "create" &&
    user?.role !== "customer"
  )
    return <Redirect href="/" />;
  if (
    section === "booking" &&
    ["workers", "confirmation"].includes(segments[1] as string) &&
    user?.role === "worker"
  )
    return <Redirect href="/" />;
  if (
    (section === "rating" || section === "complaint") &&
    user?.role !== "customer"
  )
    return <Redirect href="/" />;
  return <>{children}</>;
}
