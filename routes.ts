// routes.ts
/**
 * An array of routes that are accessible to the public
 * These routes do not require authentication
 * @type {string[]}
 */
export const publicRoutes = [
    "/",
  ];
  
  /**
   * An array of routes that are used for authentication
   * These routes will redirect logged in users to the default redirect path
   * @type {string[]}
   */
  export const authRoutes = [
    "/auth/signin",
    "/auth/signup",
    "/auth/error",
    "/auth/reset",
    "/auth/new-password"
  ];
  
  /**
   * The prefix for API authentication routes
   * Routes that start with this prefix are used for API authentication purposes
   * @type {string}
   */
  export const apiAuthPrefix = "/api/auth";
  
  /**
   * An array of routes that are accessible only to administrators
   * These routes require admin-level authentication
   * @type {string[]}
   */
  export const adminRoutes = [
    "/admin",
    "/admin/dashboard",
    "/admin/events",
    "/admin/events/[id]"
  ];
  
  /**
   * The default redirect path after logging in
   * @type {string}
   */
  export const DEFAULT_USER_LOGIN_REDIRECT = "/my-events";
  export const DEFAULT_ADMIN_LOGIN_REDIRECT = "/admin";