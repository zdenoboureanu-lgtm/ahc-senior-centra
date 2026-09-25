import {
  convexAuthNextjsMiddleware,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
import { NextResponse } from "next/server";
import { getLegacyRedirect } from "@/common/lib/legacy-redirects";

/**
 * Combined proxy:
 *  1. Multi-tenant — z hostname vytáhne subdoménu = branch slug → `x-ahc-branch` header.
 *  2. Auth — chrání `/admin/*` route, redirectuje nepřihlášené na `/admin/login`.
 *
 * Mapování slugu:
 *  - `stribro.ahc.cz`           → branch = "stribro"
 *  - `stribro.localhost:3000`   → branch = "stribro"
 *  - `ahc.cz` / `localhost`     → branch = null (globální web)
 *  - `*.vercel.app`             → použije env `NEXT_PUBLIC_DEV_BRANCH_SLUG`
 */
export const proxy = convexAuthNextjsMiddleware(async (req, { convexAuth }) => {
  // Explicitní kontrola cesty (spolehlivější než createRouteMatcher).
  const path = req.nextUrl.pathname;
  const isLoginRoute = path === "/admin/login" || path.startsWith("/admin/login/");
  const isAdminRoute = path === "/admin" || path.startsWith("/admin/");
  // ── 1. Tenant resolution ─────────────────────────────────────────
  const host = req.headers.get("host") ?? "";
  const hostname = host.split(":")[0];
  const labels = hostname.split(".");
  const isLocalhost =
    hostname === "localhost" || hostname.endsWith(".localhost");
  const isVercelPreview =
    hostname.endsWith(".vercel.app") || hostname.endsWith(".vercel.dev");
  const ignored = new Set(["www", "ahc", "localhost"]);

  let branchSlug: string | null = null;

  // Preview override: ?branch=duchcov → nastaví cookie pro pozdější navigace.
  // Funguje jen na ne-produkčních doménách (localhost / *.vercel.app).
  const previewLike = isVercelPreview || isLocalhost;
  const queryBranch = previewLike
    ? req.nextUrl.searchParams.get("branch")
    : null;
  const cookieBranch = previewLike
    ? req.cookies.get("ahc-preview-branch")?.value
    : null;

  if (isVercelPreview) {
    branchSlug =
      queryBranch ??
      cookieBranch ??
      process.env.NEXT_PUBLIC_DEV_BRANCH_SLUG ??
      null;
  } else if (isLocalhost) {
    if (
      labels.length > 1 &&
      labels[0] !== "localhost" &&
      !ignored.has(labels[0])
    ) {
      branchSlug = labels[0];
    }
    branchSlug =
      queryBranch ??
      branchSlug ??
      cookieBranch ??
      process.env.NEXT_PUBLIC_DEV_BRANCH_SLUG ??
      null;
  } else {
    if (labels.length >= 3 && !ignored.has(labels[0])) {
      branchSlug = labels[0];
    }
  }

  // ── 1b. Legacy redirecty (SEO — zachování starých URL poboček) ───
  const legacyTarget = getLegacyRedirect(branchSlug, path);
  if (legacyTarget && legacyTarget !== path) {
    // Query string necháváme (UTM z reklam, ?branch= na preview doméně).
    const url = req.nextUrl.clone();
    url.pathname = legacyTarget;
    return NextResponse.redirect(url, 301);
  }

  // ── 2. Admin auth gate ───────────────────────────────────────────
  if (isAdminRoute && !isLoginRoute) {
    const authed = await convexAuth.isAuthenticated();
    if (!authed) {
      return nextjsMiddlewareRedirect(req, "/admin/login");
    }
  }
  if (isLoginRoute) {
    const authed = await convexAuth.isAuthenticated();
    if (authed) {
      return nextjsMiddlewareRedirect(req, "/admin");
    }
  }

  // Vlož branch header pro server komponenty
  const headers = new Headers(req.headers);
  if (branchSlug) headers.set("x-ahc-branch", branchSlug);
  const res = NextResponse.next({ request: { headers } });

  // Pokud přišel ?branch= override na preview doméně, ulož do cookie
  if (previewLike && queryBranch) {
    res.cookies.set("ahc-preview-branch", queryBranch, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });
  }
  return res;
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
