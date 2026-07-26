// Margin Notes
export {
  getApprovedMarginNotesForArticle,
  submitMarginNote,
  getAllMarginNotesAdmin,
  updateMarginNoteStatusAdmin,
  updateMarginNotePinAdmin,
  deleteMarginNoteAdmin,
} from "./application/margin-notes";

// Shared Pages
export {
  getApprovedSharedPages,
  getApprovedSharedPageBySlug,
  submitSharedPage,
  getAllSharedPagesAdmin,
  updateSharedPageStatusAdmin,
  deleteSharedPageAdmin,
} from "./application/shared-pages";

// Domain constants
export { FALLBACK_MARGIN_NOTES, FALLBACK_SHARED_PAGES } from "./domain/community-content";
