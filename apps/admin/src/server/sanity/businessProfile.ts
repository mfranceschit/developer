import type { BusinessProfile } from '../../shared/types';
import { draftSanityClient } from './client';

const BUSINESS_PROFILE_ID = 'businessProfile';

export async function getBusinessProfile(): Promise<BusinessProfile | null> {
  const doc = await draftSanityClient.getDocument(BUSINESS_PROFILE_ID);
  return (doc as unknown as BusinessProfile) ?? null;
}

export async function upsertBusinessProfile(
  doc: Omit<BusinessProfile, '_id' | '_type'>,
): Promise<BusinessProfile> {
  const result = await draftSanityClient.createOrReplace({
    ...doc,
    _id: BUSINESS_PROFILE_ID,
    _type: 'businessProfile',
  });
  return result as unknown as BusinessProfile;
}
