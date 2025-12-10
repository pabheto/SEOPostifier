export interface ApplicationUsage {
  aiGeneratedImages: number;
  generatedWords: number;
}

export const emptyUsage: () => ApplicationUsage = () => ({
  aiGeneratedImages: 0,
  generatedWords: 0,
});
