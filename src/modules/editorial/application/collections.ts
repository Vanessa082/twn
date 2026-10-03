import type { CollectionRepository } from "../domain/ports";
import type {
  Collection,
  CollectionWithNotes,
  CreateCollectionInput,
  SaveCollectionEntriesInput,
} from "../domain/types";

export async function getPublicCollections(
  repository: CollectionRepository
): Promise<Collection[]> {
  return repository.findAllPublished();
}

export async function getCollectionBySlug(
  slug: string,
  repository: CollectionRepository
): Promise<CollectionWithNotes | null> {
  return repository.findPublishedBySlug(slug);
}

export async function getAllCollectionsAdmin(
  repository: CollectionRepository
): Promise<Collection[]> {
  return repository.findAllAdmin();
}

export async function getCollectionByIdAdmin(
  id: string,
  repository: CollectionRepository
): Promise<CollectionWithNotes | null> {
  return repository.findByIdAdmin(id);
}

export async function createCollectionAdmin(
  input: CreateCollectionInput,
  repository: CollectionRepository
): Promise<Collection> {
  return repository.create(input);
}

export async function updateCollectionAdmin(
  id: string,
  input: Partial<CreateCollectionInput>,
  repository: CollectionRepository
): Promise<Collection> {
  return repository.update(id, input);
}

export async function deleteCollectionAdmin(
  id: string,
  repository: CollectionRepository
): Promise<void> {
  return repository.delete(id);
}

export async function saveCollectionEntriesAdmin(
  collectionId: string,
  input: SaveCollectionEntriesInput,
  repository: CollectionRepository
): Promise<void> {
  return repository.saveEntries(collectionId, input);
}
