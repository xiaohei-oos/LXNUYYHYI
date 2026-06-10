// ============================================================
// LXNUYYHYI Image Upload Tool v1.0
// Upload images to Alibaba Cloud OSS + Supabase database
// ============================================================

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { S3Client, PutObjectCommand, DeleteObjectCommand, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand } = require('@aws-sdk/client-s3');
const { createClient } = require('@supabase/supabase-js');
const archiver = require('archiver');
const dotenv = require('dotenv');

// Load .env
dotenv.config();

// ============================================================
// Configuration
// ============================================================

const OSS_CONFIG = {
  region: process.env.OSS_REGION || 'us-west-1',
  endpoint: process.env.OSS_ENDPOINT || 'oss-us-west-1.aliyuncs.com',
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  secretAccessKey: process.env.OSS_SECRET_ACCESS_KEY,
  bucket: process.env.OSS_BUCKET_NAME || 'yuanjingban',
};

const SUPABASE_CONFIG = {
  url: process.env.COZE_SUPABASE_URL,
  anonKey: process.env.COZE_SUPABASE_ANON_KEY,
  serviceRoleKey: process.env.COZE_SUPABASE_SERVICE_ROLE_KEY,
};

const CDN_DOMAIN = `https://${OSS_CONFIG.bucket}.${OSS_CONFIG.endpoint}`;

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff', '.avif'];

const CATEGORY_MAP = {
  'wealth-finance': { name: 'Wealth & Finance', name_cn: '财富与财务' },
  'travel-adventure': { name: 'Travel & Adventure', name_cn: '旅行与探索' },
  'health-fitness': { name: 'Health & Fitness', name_cn: '健康与健身' },
  'career-business': { name: 'Career & Business', name_cn: '职业与事业' },
  'self-love-growth': { name: 'Self-Love & Personal Growth', name_cn: '自爱与成长' },
  'family-relationship': { name: 'Family & Relationship', name_cn: '家庭与关系' },
  'home-living': { name: 'Home & Living', name_cn: '居家生活' },
  'spiritual-manifestation': { name: 'Spiritual & Manifestation', name_cn: '灵性与显化' },
};

// ============================================================
// Clients (lazy init)
// ============================================================

let s3Client = null;
let supabase = null;

function initClients() {
  // Validate config
  if (!OSS_CONFIG.accessKeyId || !OSS_CONFIG.secretAccessKey) {
    console.error('❌ Missing OSS credentials. Check your .env file.');
    process.exit(1);
  }
  if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.serviceRoleKey) {
    console.error('❌ Missing Supabase credentials. Check your .env file.');
    process.exit(1);
  }

  s3Client = new S3Client({
    region: OSS_CONFIG.region,
    endpoint: `https://${OSS_CONFIG.endpoint}`,
    credentials: {
      accessKeyId: OSS_CONFIG.accessKeyId,
      secretAccessKey: OSS_CONFIG.secretAccessKey,
    },
    forcePathStyle: false,
  });

  supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log('✅ OSS and Supabase clients initialized\n');
}

// ============================================================
// OSS Operations
// ============================================================

async function uploadToOSS(key, filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
    '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif',
  };
  const contentType = contentTypes[ext] || 'application/octet-stream';

  const command = new PutObjectCommand({
    Bucket: OSS_CONFIG.bucket,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000',
  });

  await s3Client.send(command);
}

async function deleteFromOSS(key) {
  const command = new DeleteObjectCommand({
    Bucket: OSS_CONFIG.bucket,
    Key: key,
  });
  await s3Client.send(command);
}

async function uploadBufferToOSS(key, buffer, contentType) {
  const command = new PutObjectCommand({
    Bucket: OSS_CONFIG.bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000',
  });
  await s3Client.send(command);
}

// Multipart upload for large files (supports multi-GB)
async function multipartUploadToOSS(key, filePath, contentType) {
  const PART_SIZE = 100 * 1024 * 1024; // 100MB per part
  const fileSize = fs.statSync(filePath).size;

  console.log(`  File size: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Part size: ${PART_SIZE / 1024 / 1024} MB`);

  // If file is small enough, use simple upload
  if (fileSize <= PART_SIZE) {
    console.log('  File is small, using simple upload...');
    const buffer = fs.readFileSync(filePath);
    await uploadBufferToOSS(key, buffer, contentType);
    console.log('  \u2713 Upload complete!');
    return;
  }

  // Create multipart upload
  console.log('  Starting multipart upload...');
  const createCmd = new CreateMultipartUploadCommand({
    Bucket: OSS_CONFIG.bucket,
    Key: key,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000',
  });
  const createRes = await s3Client.send(createCmd);
  const uploadId = createRes.UploadId;
  const parts = [];
  const totalParts = Math.ceil(fileSize / PART_SIZE);

  try {
    const fileStream = fs.openSync(filePath, 'r');
    let uploadedParts = 0;

    for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
      const start = (partNumber - 1) * PART_SIZE;
      const end = Math.min(start + PART_SIZE, fileSize);
      const partSize = end - start;

      const buffer = Buffer.alloc(partSize);
      fs.readSync(fileStream, buffer, 0, partSize, start);

      console.log(`  Uploading part ${partNumber}/${totalParts} (${(partSize / 1024 / 1024).toFixed(2)} MB)...`);

      const uploadCmd = new UploadPartCommand({
        Bucket: OSS_CONFIG.bucket,
        Key: key,
        PartNumber: partNumber,
        UploadId: uploadId,
        Body: buffer,
      });
      const uploadRes = await s3Client.send(uploadCmd);

      parts.push({
        PartNumber: partNumber,
        ETag: uploadRes.ETag,
      });

      uploadedParts++;
      const progress = ((uploadedParts / totalParts) * 100).toFixed(1);
      console.log(`  \u2713 Part ${partNumber} done (${progress}% total)`);
    }

    fs.closeSync(fileStream);

    // Complete multipart upload
    console.log('  Completing multipart upload...');
    const completeCmd = new CompleteMultipartUploadCommand({
      Bucket: OSS_CONFIG.bucket,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts.sort((a, b) => a.PartNumber - b.PartNumber),
      },
    });
    await s3Client.send(completeCmd);
    console.log('  \u2713 Multipart upload complete!');

  } catch (err) {
    // Abort on failure
    console.error('  \u2717 Upload failed, aborting multipart upload...');
    try {
      const abortCmd = new AbortMultipartUploadCommand({
        Bucket: OSS_CONFIG.bucket,
        Key: key,
        UploadId: uploadId,
      });
      await s3Client.send(abortCmd);
    } catch { /* ignore abort errors */ }
    throw err;
  }
}

// ============================================================
// Supabase Operations
// ============================================================

async function getCategoryBySlug(slug) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    throw new Error(`Failed to find category "${slug}": ${error.message}`);
  }
  return data;
}

async function getAllCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order');

  if (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }
  return data;
}

async function insertImage(categoryId, title, thumbnailUrl, hdImageKey, sortOrder) {
  const { data, error } = await supabase
    .from('vision_images')
    .insert({
      category_id: categoryId,
      title,
      thumbnail_url: thumbnailUrl,
      hd_image_key: hdImageKey,
      sort_order: sortOrder,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to insert image: ${error.message}`);
  }
  return data;
}

async function deleteImage(imageId) {
  const { error } = await supabase
    .from('vision_images')
    .delete()
    .eq('id', imageId);

  if (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}

async function updateCategoryImageCount(categoryId) {
  const { count, error: countError } = await supabase
    .from('vision_images')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', categoryId);

  if (countError) {
    throw new Error(`Failed to count images: ${countError.message}`);
  }

  const { error } = await supabase
    .from('categories')
    .update({ image_count: count || 0 })
    .eq('id', categoryId);

  if (error) {
    throw new Error(`Failed to update image count: ${error.message}`);
  }
  return count || 0;
}

async function updateCategoryCoverImage(categoryId, thumbnailUrl) {
  const { error } = await supabase
    .from('categories')
    .update({ cover_image: thumbnailUrl })
    .eq('id', categoryId);

  if (error) {
    throw new Error(`Failed to update cover image: ${error.message}`);
  }
}

async function updateCategoryZipKey(categoryId, zipKey, zipSize) {
  const { error } = await supabase
    .from('categories')
    .update({ zip_file_key: zipKey, zip_file_size: zipSize })
    .eq('id', categoryId);

  if (error) {
    throw new Error(`Failed to update ZIP info: ${error.message}`);
  }
}

async function getImagesByCategory(categoryId) {
  const { data, error } = await supabase
    .from('vision_images')
    .select('*')
    .eq('category_id', categoryId)
    .order('sort_order');

  if (error) {
    throw new Error(`Failed to fetch images: ${error.message}`);
  }
  return data;
}

// ============================================================
// Core Upload Logic
// ============================================================

function isImageFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
}

function generateOssKey(categorySlug, filename) {
  const ext = path.extname(filename);
  const nameWithoutExt = path.basename(filename, ext);
  const hash = crypto.randomBytes(4).toString('hex');
  return `images/${categorySlug}/${nameWithoutExt}-${hash}${ext}`;
}

function getThumbnailUrl(ossKey) {
  // Use OSS image processing for thumbnails (resize to 600px width)
  return `${CDN_DOMAIN}/${ossKey}?x-oss-process=image/resize,w_600/quality,q_85`;
}

async function uploadCategoryImages(categorySlug, dirPath) {
  // Validate category
  if (!CATEGORY_MAP[categorySlug]) {
    console.error(`❌ Unknown category slug: "${categorySlug}"`);
    console.log(`   Available: ${Object.keys(CATEGORY_MAP).join(', ')}`);
    process.exit(1);
  }

  // Validate directory
  if (!fs.existsSync(dirPath)) {
    console.error(`❌ Directory not found: ${dirPath}`);
    process.exit(1);
  }

  const category = await getCategoryBySlug(categorySlug);
  const categoryInfo = CATEGORY_MAP[categorySlug];
  console.log(`📦 Category: ${categoryInfo.name} (${categoryInfo.name_cn})`);
  console.log(`📁 Directory: ${dirPath}\n`);

  // Get image files
  const files = fs.readdirSync(dirPath)
    .filter(f => isImageFile(f))
    .sort();

  if (files.length === 0) {
    console.log('⚠️  No image files found in directory.');
    return;
  }

  console.log(`🖼️  Found ${files.length} image(s)\n`);

  let uploaded = 0;
  let failed = 0;

  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const filePath = path.join(dirPath, filename);
    const fileSize = fs.statSync(filePath).size;
    const fileSizeMB = (fileSize / 1024 / 1024).toFixed(1);

    try {
      // Generate OSS key
      const ossKey = generateOssKey(categorySlug, filename);
      const thumbnailUrl = getThumbnailUrl(ossKey);
      const title = path.basename(filename, path.extname(filename));

      process.stdout.write(`  [${i + 1}/${files.length}] ${filename} (${fileSizeMB}MB) → uploading...`);

      // Upload to OSS
      await uploadToOSS(ossKey, filePath);

      // Insert into database
      await insertImage(category.id, title, thumbnailUrl, ossKey, i + 1);

      uploaded++;
      process.stdout.write(` ✅\n`);
    } catch (err) {
      failed++;
      process.stdout.write(` ❌ ${err.message}\n`);
    }
  }

  // Update category image count
  const totalCount = await updateCategoryImageCount(category.id);

  // Update cover image if category has no cover or cover is a local path
  if (!category.cover_image || category.cover_image.startsWith('/')) {
    const firstImage = await getImagesByCategory(category.id);
    if (firstImage.length > 0) {
      await updateCategoryCoverImage(category.id, firstImage[0].thumbnail_url);
      console.log(`\n📸 Cover image updated for ${categoryInfo.name}`);
    }
  }

  console.log(`\n📊 Summary: ${uploaded} uploaded, ${failed} failed`);
  console.log(`🗂️  Category total: ${totalCount} images\n`);
}

async function uploadAllCategories() {
  const imagesDir = path.join(process.cwd(), 'images');

  if (!fs.existsSync(imagesDir)) {
    console.error(`❌ Images directory not found: ${imagesDir}`);
    console.log('   Create an "images" folder with subfolders named by category slug:');
    console.log('   images/');
    Object.keys(CATEGORY_MAP).forEach(slug => {
      console.log(`     ${slug}/`);
    });
    process.exit(1);
  }

  const subdirs = fs.readdirSync(imagesDir)
    .filter(f => fs.statSync(path.join(imagesDir, f)).isDirectory())
    .filter(f => CATEGORY_MAP[f]);

  if (subdirs.length === 0) {
    console.error('❌ No valid category folders found in images/ directory.');
    console.log(`   Expected folder names: ${Object.keys(CATEGORY_MAP).join(', ')}`);
    process.exit(1);
  }

  console.log(`🚀 Uploading ${subdirs.length} categories\n`);
  console.log('='.repeat(50));

  for (const slug of subdirs) {
    const dirPath = path.join(imagesDir, slug);
    try {
      await uploadCategoryImages(slug, dirPath);
    } catch (err) {
      console.error(`❌ Error uploading ${slug}: ${err.message}\n`);
    }
    console.log('='.repeat(50));
  }

  console.log('\n🎉 All categories processed!');
}

// ============================================================
// ZIP Creation
// ============================================================

async function createCategoryZip(categorySlug) {
  if (!CATEGORY_MAP[categorySlug]) {
    console.error(`❌ Unknown category slug: "${categorySlug}"`);
    process.exit(1);
  }

  const category = await getCategoryBySlug(categorySlug);
  const categoryInfo = CATEGORY_MAP[categorySlug];
  const images = await getImagesByCategory(category.id);

  if (images.length === 0) {
    console.log(`⚠️  No images found for ${categoryInfo.name}`);
    return;
  }

  console.log(`📦 Creating ZIP for: ${categoryInfo.name} (${images.length} images)`);

  const zipKey = `zips/${categorySlug}.zip`;
  const tempZipPath = path.join(process.cwd(), 'temp', `${categorySlug}.zip`);

  // Ensure temp directory exists
  fs.mkdirSync(path.dirname(tempZipPath), { recursive: true });

  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(tempZipPath);
    const archive = archiver('zip', { zlib: { level: 6 } });

    output.on('close', async () => {
      const zipSize = archive.pointer();
      const zipSizeMB = (zipSize / 1024 / 1024).toFixed(1);

      try {
        process.stdout.write(`  Uploading ZIP (${zipSizeMB}MB)...`);
        const zipBuffer = fs.readFileSync(tempZipPath);
        await uploadBufferToOSS(zipKey, zipBuffer, 'application/zip');

        // Update database
        await updateCategoryZipKey(category.id, zipKey, zipSize);

        // Clean up temp file
        fs.unlinkSync(tempZipPath);

        process.stdout.write(` ✅\n`);
        console.log(`  📍 OSS Key: ${zipKey}`);
        console.log(`  📏 Size: ${zipSizeMB}MB\n`);
        resolve();
      } catch (err) {
        fs.unlinkSync(tempZipPath);
        reject(err);
      }
    });

    archive.on('error', (err) => reject(err));

    archive.pipe(output);

    // Download each image from OSS and add to ZIP
    let processed = 0;
    const total = images.length;

    (async () => {
      for (const img of images) {
        processed++;
        const imageUrl = `${CDN_DOMAIN}/${img.hd_image_key}`;
        const filename = `${img.title}${path.extname(img.hd_image_key) || '.jpg'}`;

        try {
          process.stdout.write(`  [${processed}/${total}] Downloading ${filename}...`);

          const response = await fetch(imageUrl);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);

          const buffer = Buffer.from(await response.arrayBuffer());
          archive.append(buffer, { name: filename });

          process.stdout.write(` ✅\n`);
        } catch (err) {
          process.stdout.write(` ❌ ${err.message}\n`);
        }
      }

      archive.finalize();
    })();
  });
}

async function createAllZips() {
  const categories = await getAllCategories();

  for (const cat of categories) {
    if (!CATEGORY_MAP[cat.slug]) continue;
    try {
      await createCategoryZip(cat.slug);
    } catch (err) {
      console.error(`❌ Error creating ZIP for ${cat.slug}: ${err.message}\n`);
    }
  }
  console.log('\n🎉 All ZIPs created!');
}

// ============================================================
// List Categories
// ============================================================

async function listCategories() {
  const categories = await getAllCategories();

  console.log('\n📋 Categories:\n');
  console.log('  Slug'.padEnd(30) + 'Name'.padEnd(28) + 'Images');
  console.log('  ' + '-'.repeat(70));

  for (const cat of categories) {
    const slug = cat.slug.padEnd(28);
    const name = (cat.name || '').padEnd(26);
    const count = String(cat.image_count || 0);
    console.log(`  ${slug} ${name} ${count}`);
  }

  console.log();
}

// ============================================================
// Upload Local ZIP Package to OSS
// ============================================================

async function uploadZipPackage(categorySlug, zipFilePath) {
  // Validate category
  if (!CATEGORY_MAP[categorySlug]) {
    console.error(`❌ Unknown category slug: "${categorySlug}"`);
    console.log(`   Available: ${Object.keys(CATEGORY_MAP).join(', ')}`);
    process.exit(1);
  }

  // Validate file
  if (!fs.existsSync(zipFilePath)) {
    console.error(`❌ File not found: ${zipFilePath}`);
    process.exit(1);
  }

  const ext = path.extname(zipFilePath).toLowerCase();
  if (ext !== '.zip') {
    console.error(`❌ File must be a .zip file, got: ${ext}`);
    process.exit(1);
  }

  const category = await getCategoryBySlug(categorySlug);
  const categoryInfo = CATEGORY_MAP[categorySlug];
  const fileSize = fs.statSync(zipFilePath).size;
  const fileSizeMB = (fileSize / 1024 / 1024).toFixed(2);

  console.log(`📦 Category: ${categoryInfo.name} (${categoryInfo.name_cn})`);
  console.log(`📁 ZIP file: ${zipFilePath}`);
  console.log(`📏 File size: ${fileSizeMB} MB\n`);

  // Delete old ZIP if exists
  if (category.zip_file_key) {
    console.log(`  Old ZIP found: ${category.zip_file_key}`);
    try {
      await deleteFromOSS(category.zip_file_key);
      console.log('  ✅ Old ZIP deleted from OSS');
    } catch (err) {
      console.log(`  ⚠️  Old ZIP delete failed (may not exist): ${err.message}`);
    }
  }

  // Upload new ZIP
  const zipKey = `zips/${categorySlug}.zip`;
  console.log(`\n  Uploading to OSS: ${zipKey}`);

  await multipartUploadToOSS(zipKey, zipFilePath, 'application/zip');

  // Update database
  await updateCategoryZipKey(category.id, zipKey, fileSize);
  console.log(`  ✅ Database updated (zip_file_key = ${zipKey})`);

  console.log(`\n🎉 ZIP package uploaded successfully!`);
  console.log(`  Category: ${categoryInfo.name}`);
  console.log(`  OSS Key: ${zipKey}`);
  console.log(`  Size: ${fileSizeMB} MB\n`);
}

// ============================================================
// Delete Image
// ============================================================

async function deleteImageById(imageId) {
  const { data: image, error } = await supabase
    .from('vision_images')
    .select('*')
    .eq('id', imageId)
    .single();

  if (error || !image) {
    console.error(`❌ Image not found: ${imageId}`);
    process.exit(1);
  }

  console.log(`🗑️  Deleting: ${image.title} (${image.hd_image_key})`);

  // Delete from OSS
  try {
    await deleteFromOSS(image.hd_image_key);
    console.log('  ✅ Deleted from OSS');
  } catch (err) {
    console.log(`  ⚠️  OSS delete failed: ${err.message}`);
  }

  // Delete from database
  await deleteImage(imageId);
  console.log('  ✅ Deleted from database');

  // Update count
  const newCount = await updateCategoryImageCount(image.category_id);
  console.log(`  📊 Category image count updated: ${newCount}`);
}

// ============================================================
// CLI Argument Parsing
// ============================================================

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        parsed[key] = args[i + 1];
        i++;
      } else {
        parsed[key] = 'true';
      }
    }
  }

  return parsed;
}

function printHelp() {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║         LXNUYYHYI Image Upload Tool v1.0                   ║
╚══════════════════════════════════════════════════════════════╝

Usage:
  node upload.js --category <slug> --dir <path>    Upload images for one category
  node upload.js --all                              Upload all categories from ./images/
  node upload.js --zip <slug>                       Create & upload ZIP for a category
  node upload.js --zip-all                          Create ZIPs for all categories
  node upload.js --list                             List all categories and counts
  node upload.js --delete <slug> --image-id <id>    Delete a specific image
  node upload.js --upload-zip <slug> --file <path>  Upload local ZIP to OSS & link to category

Category Slugs:
  wealth-finance        财富与财务
  travel-adventure      旅行与探索
  health-fitness        健康与健身
  career-business       职业与事业
  self-love-growth      自爱与成长
  family-relationship   家庭与关系
  home-living           居家生活
  spiritual-manifestation 灵性与显化

Examples:
  node upload.js --category wealth-finance --dir ./images/wealth-finance/
  node upload.js --all
  node upload.js --zip wealth-finance
  node upload.js --list
`);
}

// ============================================================
// Main
// ============================================================

async function main() {
  const args = parseArgs();

  if (Object.keys(args).length === 0 || args.help) {
    printHelp();
    return;
  }

  console.log('\n🌟 LXNUYYHYI Upload Tool\n');
  initClients();

  try {
    // List categories
    if (args.list) {
      await listCategories();
      return;
    }

    // Upload single category
    if (args.category) {
      const dirPath = args.dir || path.join(process.cwd(), 'images', args.category);
      await uploadCategoryImages(args.category, dirPath);
      return;
    }

    // Upload all categories
    if (args.all) {
      await uploadAllCategories();
      return;
    }

    // Create ZIP for single category
    if (args.zip && args.zip !== 'true') {
      await createCategoryZip(args.zip);
      return;
    }

    // Create ZIPs for all categories
    if (args['zip-all'] || args.zip === 'true') {
      await createAllZips();
      return;
    }

    // Upload local ZIP file for single category
    if (args['upload-zip']) {
      const slug = args['upload-zip'];
      const zipPath = args.file;
      if (!zipPath) {
        console.error('❌ Missing --file parameter. Usage: node upload.js --upload-zip <slug> --file <path-to-zip>');
        process.exit(1);
      }
      await uploadZipPackage(slug, zipPath);
      return;
    }

    // Delete image
    if (args.delete && args['image-id']) {
      await deleteImageById(args['image-id']);
      return;
    }

    // No valid command
    printHelp();
  } catch (err) {
    console.error(`\n❌ Error: ${err.message}\n`);
    process.exit(1);
  }
}

main();
