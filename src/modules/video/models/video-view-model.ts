import { videoAvailableResolutions } from './video.schema';

export class VideoViewModel {
  id: number;
  title: string;
  author: string;
  canBeDownloaded: boolean;
  minAgeRestriction: null | number;
  createdAt: string;
  publicationDate: string;
  availableResolutions: typeof videoAvailableResolutions;
}
