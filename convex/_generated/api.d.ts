/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as http from "../http.js";
import type * as import_packs from "../import_packs.js";
import type * as lib_audit from "../lib/audit.js";
import type * as lib_permissions from "../lib/permissions.js";
import type * as lib_types from "../lib/types.js";
import type * as modules_branches_model from "../modules/branches/model.js";
import type * as modules_branches_mutations from "../modules/branches/mutations.js";
import type * as modules_branches_queries from "../modules/branches/queries.js";
import type * as modules_careers_model from "../modules/careers/model.js";
import type * as modules_careers_mutations from "../modules/careers/mutations.js";
import type * as modules_careers_queries from "../modules/careers/queries.js";
import type * as modules_content_mutations from "../modules/content/mutations.js";
import type * as modules_content_queries from "../modules/content/queries.js";
import type * as modules_inquiries_model from "../modules/inquiries/model.js";
import type * as modules_inquiries_mutations from "../modules/inquiries/mutations.js";
import type * as modules_news_model from "../modules/news/model.js";
import type * as modules_news_queries from "../modules/news/queries.js";
import type * as modules_users_actions from "../modules/users/actions.js";
import type * as modules_users_mutations from "../modules/users/mutations.js";
import type * as modules_users_queries from "../modules/users/queries.js";
import type * as seed from "../seed.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  http: typeof http;
  import_packs: typeof import_packs;
  "lib/audit": typeof lib_audit;
  "lib/permissions": typeof lib_permissions;
  "lib/types": typeof lib_types;
  "modules/branches/model": typeof modules_branches_model;
  "modules/branches/mutations": typeof modules_branches_mutations;
  "modules/branches/queries": typeof modules_branches_queries;
  "modules/careers/model": typeof modules_careers_model;
  "modules/careers/mutations": typeof modules_careers_mutations;
  "modules/careers/queries": typeof modules_careers_queries;
  "modules/content/mutations": typeof modules_content_mutations;
  "modules/content/queries": typeof modules_content_queries;
  "modules/inquiries/model": typeof modules_inquiries_model;
  "modules/inquiries/mutations": typeof modules_inquiries_mutations;
  "modules/news/model": typeof modules_news_model;
  "modules/news/queries": typeof modules_news_queries;
  "modules/users/actions": typeof modules_users_actions;
  "modules/users/mutations": typeof modules_users_mutations;
  "modules/users/queries": typeof modules_users_queries;
  seed: typeof seed;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
