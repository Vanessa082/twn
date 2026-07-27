// Public application API
export {
  getAllActiveEntries,
  getRandomEntry,
  getTodaysEntry,
} from "./application/get-homepage-entry";

export {
  getAllEntriesAdmin,
  getAllNotebooksAdmin,
  getDefaultNotebookIdAdmin,
  createEntryAdmin,
  updateEntryAdmin,
  deleteEntryAdmin,
} from "./application/manage-entries";

// Public domain constants
export { FALLBACK_ENTRIES } from "./domain/notebook-entry";
