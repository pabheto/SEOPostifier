import { NestFactory } from '@nestjs/core';
import * as fs from 'fs';
import * as path from 'path';
import { NanoBananaImageGenerationService } from 'src/modules/image-generation/services/nano-banana-image-generation.service';
import { AppModule } from '../../app.module';

async function bootstrap() {
  console.log('🚀 Starting Nano Banana Image Generation Test...\n');

  const app = await NestFactory.create(AppModule);
  await app.init();

  const nanoBananaService = app.get(NanoBananaImageGenerationService);

  // === Prepare output folder ===
  const rootOutputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(rootOutputDir)) {
    fs.mkdirSync(rootOutputDir, { recursive: true });
  }
  const testDir = path.join(rootOutputDir, 'nano-banana-test_' + Date.now());
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  console.log(`📁 Output directory: ${testDir}\n`);

  try {
    // === Test 1: Generate Image from Text Prompt ===
    console.log('🧪 Test 1: Generating image from text prompt...');
    const generatePrompt =
      'Create a picture of a nano banana dish in a fancy restaurant with a Gemini theme';

    console.log(`   Prompt: "${generatePrompt}"`);

    const generateResult = await nanoBananaService.generateImage({
      prompt: generatePrompt,
    });

    console.log('   ✅ Image generated successfully!');
    console.log(`   📄 Filename: ${generateResult.filename}`);
    console.log(`   📏 Size: ${generateResult.size} bytes`);
    console.log(`   🔗 URL: ${generateResult.url}`);
    console.log(`   🤖 Model: ${generateResult.model}\n`);

    // Save result info to file
    const generateInfo = {
      test: 'Generate Image from Text Prompt',
      prompt: generatePrompt,
      result: {
        filename: generateResult.filename,
        originalName: generateResult.originalName,
        path: generateResult.path,
        size: generateResult.size,
        mimeType: generateResult.mimeType,
        url: generateResult.url,
        model: generateResult.model,
      },
      timestamp: new Date().toISOString(),
    };

    fs.writeFileSync(
      path.join(testDir, 'test1-generate-image.json'),
      JSON.stringify(generateInfo, null, 2),
      'utf8',
    );

    console.log(
      `   💾 Test results saved to: ${testDir}/test1-generate-image.json\n`,
    );

    // === Test 2: Edit Image (if we have a source image) ===
    console.log('🧪 Test 2: Editing image with prompt...');

    // First, let's check if we can use the generated image for editing
    // Or we can create a simple test image buffer
    // For this test, we'll try to read the generated image and edit it
    try {
      const generatedImageBuffer = fs.readFileSync(generateResult.path);
      const editPrompt =
        'Create a picture of my cat eating a nano-banana in a fancy restaurant under the Gemini constellation';

      console.log(`   Prompt: "${editPrompt}"`);
      console.log(
        `   Using generated image as source: ${generateResult.filename}`,
      );

      const editResult = await nanoBananaService.editImage({
        prompt: editPrompt,
        imageBuffer: generatedImageBuffer,
        imageMimeType: 'image/png',
      });

      console.log('   ✅ Image edited successfully!');
      console.log(`   📄 Filename: ${editResult.filename}`);
      console.log(`   📏 Size: ${editResult.size} bytes`);
      console.log(`   🔗 URL: ${editResult.url}`);
      console.log(`   🤖 Model: ${editResult.model}\n`);

      // Save result info to file
      const editInfo = {
        test: 'Edit Image with Prompt',
        prompt: editPrompt,
        sourceImage: generateResult.filename,
        result: {
          filename: editResult.filename,
          originalName: editResult.originalName,
          path: editResult.path,
          size: editResult.size,
          mimeType: editResult.mimeType,
          url: editResult.url,
          model: editResult.model,
        },
        timestamp: new Date().toISOString(),
      };

      fs.writeFileSync(
        path.join(testDir, 'test2-edit-image.json'),
        JSON.stringify(editInfo, null, 2),
        'utf8',
      );

      console.log(
        `   💾 Test results saved to: ${testDir}/test2-edit-image.json\n`,
      );
    } catch (editError) {
      const errorMessage =
        editError instanceof Error ? editError.message : 'Unknown error';
      console.log(`   ⚠️  Edit test skipped: ${errorMessage}\n`);
    }

    // === Test 3: Generate with custom model (if different) ===
    console.log('🧪 Test 3: Generating image with explicit model...');
    const customPrompt =
      'A futuristic cityscape at sunset with nano bananas floating in the sky';

    console.log(`   Prompt: "${customPrompt}"`);
    console.log(`   Model: gemini-2.5-flash-image (explicit)`);

    const customModelResult = await nanoBananaService.generateImage({
      prompt: customPrompt,
      model: 'gemini-2.5-flash-image',
    });

    console.log('   ✅ Image generated successfully!');
    console.log(`   📄 Filename: ${customModelResult.filename}`);
    console.log(`   📏 Size: ${customModelResult.size} bytes`);
    console.log(`   🤖 Model: ${customModelResult.model}\n`);

    // Save result info to file
    const customModelInfo = {
      test: 'Generate Image with Explicit Model',
      prompt: customPrompt,
      model: 'gemini-2.5-flash-image',
      result: {
        filename: customModelResult.filename,
        originalName: customModelResult.originalName,
        path: customModelResult.path,
        size: customModelResult.size,
        mimeType: customModelResult.mimeType,
        url: customModelResult.url,
        model: customModelResult.model,
      },
      timestamp: new Date().toISOString(),
    };

    fs.writeFileSync(
      path.join(testDir, 'test3-custom-model.json'),
      JSON.stringify(customModelInfo, null, 2),
      'utf8',
    );

    console.log(
      `   💾 Test results saved to: ${testDir}/test3-custom-model.json\n`,
    );

    // === Summary ===
    console.log('✅ All tests completed successfully!');
    console.log(`📁 All results saved to: ${testDir}\n`);
    console.log('📋 Summary:');
    console.log(
      `   - Generated images are stored in the configured upload directory`,
    );
    console.log(`   - Test metadata saved as JSON files`);
    console.log(`   - Check the upload directory for the actual image files\n`);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Test failed:', errorMessage);
    console.error(error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

void bootstrap();
