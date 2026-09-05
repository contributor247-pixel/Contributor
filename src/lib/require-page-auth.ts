import { redirect } from "next/navigation";
import {
  requireAuth,
  requireRole,
  requireAuthorPro,
  requireVerifiedAuthor,
  UnauthenticatedError,
  ForbiddenError,
} from "@/lib/permissions";

// Thin page-component wrappers around the permissions.ts checks: an
// unauthenticated visitor is sent home with the AuthModal auto-opened
// (per docs/04_MasterBuildGuide.md Step 2.6 point 4 — never a bare 404
// or blank page), while an authenticated-but-unauthorized visitor is
// sent to the homepage plainly (they don't need to sign in again, they
// just can't be here). Route Handlers and Server Actions should call
// the permissions.ts functions directly instead of these — redirecting
// only makes sense for a page render.

function redirectForAuthFailure(err: unknown): never {
  if (err instanceof UnauthenticatedError) {
    redirect("/?authRequired=1");
  }
  if (err instanceof ForbiddenError) {
    redirect("/");
  }
  throw err;
}

export async function requireAuthForPage() {
  try {
    return await requireAuth();
  } catch (err) {
    redirectForAuthFailure(err);
  }
}

export async function requireRoleForPage(
  role: "reader" | "author" | "admin" | Array<"reader" | "author" | "admin">
) {
  try {
    return await requireRole(role);
  } catch (err) {
    redirectForAuthFailure(err);
  }
}

export async function requireAuthorProForPage() {
  try {
    return await requireAuthorPro();
  } catch (err) {
    redirectForAuthFailure(err);
  }
}

export async function requireVerifiedAuthorForPage() {
  try {
    return await requireVerifiedAuthor();
  } catch (err) {
    redirectForAuthFailure(err);
  }
}
