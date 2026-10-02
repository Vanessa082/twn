export type { MarginNote, ModerationStatus, SharedPage } from "../domain/types";
export { FALLBACK_MARGIN_NOTES, FALLBACK_SHARED_PAGES } from "../domain/community-content";
export {
  buildSharedPageSlug,
  extractSharedPageIdHint,
  isUuid,
  type SharedPageSlugSource,
} from "../domain/shared-page-slug";
export { findSharedPageByParam } from "../domain/shared-page-lookup";
export { truncateSharedPagePreview } from "../domain/shared-page-preview";
