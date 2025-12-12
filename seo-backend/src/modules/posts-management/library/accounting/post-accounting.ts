import { ApplicationUsage } from 'src/modules/subscriptions/library/usage.interface';
import { Post } from '../../schemas/posts.schema';
import {
  PostBlockType,
  PostFAQ,
  PostHeading,
  PostImage,
  PostParagraph,
} from '../interfaces/posts.interface';

export function countPostUsage(post: Post): ApplicationUsage {
  const applicationUsage: ApplicationUsage = {
    aiGeneratedImages: 0,
    generatedWords: 0,
  };
  for (const block of post.blocks ?? []) {
    switch (block.type) {
      case PostBlockType.HEADING:
        applicationUsage.generatedWords += (block as PostHeading).title.split(
          ' ',
        ).length;
        break;
      case PostBlockType.PARAGRAPH:
        applicationUsage.generatedWords += (
          block as PostParagraph
        ).content.split(' ').length;
        break;

      case PostBlockType.IMAGE:
        if ((block as PostImage).image?.sourceType === 'ai_generated') {
          applicationUsage.aiGeneratedImages += 1;
        }
        break;

      case PostBlockType.FAQ:
        (block as PostFAQ).questions.forEach((question: string) => {
          applicationUsage.generatedWords += question.split(' ').length;
        });
        (block as PostFAQ).answers.forEach((answer: string) => {
          applicationUsage.generatedWords += answer.split(' ').length;
        });
        break;
    }
  }

  return applicationUsage;
}
