const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Load .env
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found! Copy .env.example to .env and fill in your keys.');
    process.exit(1);
  }
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const eq = line.indexOf('=');
    if (eq > 0) {
      const key = line.substring(0, eq).trim();
      const val = line.substring(eq + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  });
}
loadEnv();

// ============================================================
// Config
// ============================================================

const OSS_CONFIG = {
  region: process.env.OSS_REGION || 'us-west-1',
  endpoint: process.env.OSS_ENDPOINT || 'oss-us-west-1.aliyuncs.com',
  credentials: {
    accessKeyId: process.env.OSS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.OSS_SECRET_ACCESS_KEY || '',
  },
  bucket: process.env.OSS_BUCKET_NAME || 'yuanjingban',
};

const SUPABASE_CONFIG = {
  url: process.env.COZE_SUPABASE_URL || '',
  anonKey: process.env.COZE_SUPABASE_ANON_KEY || '',
  serviceRoleKey: process.env.COZE_SUPABASE_SERVICE_ROLE_KEY || '',
};

const CDN_DOMAIN = `https://${OSS_CONFIG.bucket}.${OSS_CONFIG.endpoint}`;
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff'];
const PROGRESS_FILE = path.join(process.cwd(), 'upload-progress.json');
const MAX_RETRIES = 3;
const UPLOAD_TIMEOUT_MS = 120000; // 2 minutes per file

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
// Progress Tracking (断点续传)
// ============================================================

function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    } catch (e) {
      return {};
    }
  }
  return {};
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

function markUploaded(progress, categorySlug, filename) {
  if (!progress[categorySlug]) progress[categorySlug] = {};
  progress[categorySlug][filename] = { uploaded: true, time: new Date().toISOString() };
  saveProgress(progress);
}

function isAlreadyUploaded(progress, categorySlug, filename) {
  return progress[categorySlug] && progress[categorySlug][filename] && progress[categorySlug][filename].uploaded;
}

// ============================================================
// OSS Client (S3 Compatible)
// ============================================================

let s3Client = null;

function getS3Client() {
  if (s3Client) return s3Client;
  const { S3Client } = require('@aws-sdk/client-s3');
  s3Client = new S3Client({
    region: OSS_CONFIG.region,
    endpoint: `https://${OSS_CONFIG.endpoint}`,
    credentials: OSS_CONFIG.credentials,
    forcePathStyle: false,
  });
  return s3Client;
}

async function uploadToOSS(key, filePath) {
  const { PutObjectCommand } = require('@aws-sdk/client-s3');
  const client = getS3Client();
  const fileBuffer = fs.readFileSync(filePath);
  const ext = path.extname(key).toLowerCase();
  const contentTypeMap = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
    '.webp': 'image/webp', '.gif': 'image/gif', '.bmp': 'image/bmp',
  };
  const command = new PutObjectCommand({
    Bucket: OSS_CONFIG.bucket,
    Key: key,
    Body: fileBuffer,
    ContentType: contentTypeMap[ext] || 'application/octet-stream',
  });
  await client.send(command);
}

async function uploadBufferToOSS(key, buffer, contentType) {
  const { PutObjectCommand } = require('@aws-sdk/client-s3');
  const client = getS3Client();
  const command = new PutObjectCommand({
    Bucket: OSS_CONFIG.bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });
  await client.send(command);
}

async function deleteFromOSS(key) {
  const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
  const client = getS3Client();
  await client.send(new DeleteObjectCommand({ Bucket: OSS_CONFIG.bucket, Key: key }));
}

// ============================================================
// Supabase Client
// ============================================================

let supabase = null;

function getSupabase() {
  if (supabase) return supabase;
  const { createClient } = require('@supabase/supabase-js');
  supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.serviceRoleKey || SUPABASE_CONFIG.anonKey);
  return supabase;
}

async function getCategoryBySlug(slug) {
  const { data, error } = await getSupabase().from('categories').select('*').eq('slug', slug).single();
  if (error) throw new Error(`Category not found: ${slug}`);
  return data;
}

async function getAllCategories() {
  const { data, error } = await getSupabase().from('categories').select('*').order('sort_order');
  if (error) throw new Error('Failed to fetch categories');
  return data;
}

async function insertImage(categoryId, title, thumbnailUrl, hdImageKey, sortOrder) {
  const { error } = await getSupabase().from('vision_images').insert({
    category_id: categoryId, title, thumbnail_url: thumbnailUrl,
    hd_image_key: hdImageKey, sort_order: sortOrder,
  });
  if (error) throw new Error(`DB insert failed: ${error.message}`);
}

async function getImagesByCategory(categoryId) {
  const { data, error } = await getSupabase().from('vision_images').select('*').eq('category_id', categoryId).order('sort_order');
  if (error) throw new Error('Failed to fetch images');
  return data;
}

async function updateCategoryImageCount(categoryId) {
  const images = await getImagesByCategory(categoryId);
  const { error } = await getSupabase().from('categories').update({ image_count: images.length }).eq('id', categoryId);
  if (error) throw new Error('Failed to update count');
  return images.length;
}

async function updateCategoryCoverImage(categoryId, coverUrl) {
  await getSupabase().from('categories').update({ cover_image: coverUrl }).eq('id', categoryId);
}

async function updateCategoryZipKey(categoryId, zipKey, zipSize) {
  await getSupabase().from('categories').update({ zip_file_key: zipKey, zip_file_size: zipSize }).eq('id', categoryId);
}

async function deleteImage(imageId) {
  await getSupabase().from('vision_images').delete().eq('id', imageId);
}

// ============================================================
// Retry with Timeout
// ============================================================

async function retryWithTimeout(fn, label, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await Promise.race([
        fn(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), UPLOAD_TIMEOUT_MS)),
      ]);
      return result;
    } catch (err) {
      if (attempt < retries) {
        process.stdout.write(` ⏳ Retry ${attempt}/${retries}...`);
        await new Promise(r => setTimeout(r, 2000 * attempt)); // 递增等待
      } else {
        throw err;
      }
    }
  }
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
  return `${CDN_DOMAIN}/${ossKey}?x-oss-process=image/resize,w_600/quality,q_85`;
}

async function uploadCategoryImages(categorySlug, dirPath) {
  if (!CATEGORY_MAP[categorySlug]) {
    console.error(`❌ Unknown category slug: "${categorySlug}"`);
    console.log(`   Available: ${Object.keys(CATEGORY_MAP).join(', ')}`);
    process.exit(1);
  }

  if (!fs.existsSync(dirPath)) {
    console.error(`❌ Directory not found: ${dirPath}`);
    process.exit(1);
  }

  const category = await getCategoryBySlug(categorySlug);
  const categoryInfo = CATEGORY_MAP[categorySlug];
  console.log(`📦 Category: ${categoryInfo.name} (${categoryInfo.name_cn})`);
  console.log(`📁 Directory: ${dirPath}\n`);

  const files = fs.readdirSync(dirPath).filter(f => isImageFile(f)).sort();

  if (files.length === 0) {
    console.log('⚠️  No image files found in directory.');
    return;
  }

  // Load progress
  const progress = loadProgress();
  const alreadyUploaded = files.filter(f => isAlreadyUploaded(progress, categorySlug, f));
  const toUpload = files.filter(f => !isAlreadyUploaded(progress, categorySlug, f));

  if (alreadyUploaded.length > 0) {
    console.log(`⏭️  Skipping ${alreadyUploaded.length} already uploaded file(s)`);
  }
  console.log(`🖼️  ${toUpload.length} file(s) to upload (${files.length} total)\n`);

  let uploaded = 0;
  let failed = 0;

  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const filePath = path.join(dirPath, filename);
    const fileSize = fs.statSync(filePath).size;
    const fileSizeMB = (fileSize / 1024 / 1024).toFixed(1);

    // Skip already uploaded
    if (isAlreadyUploaded(progress, categorySlug, filename)) {
      process.stdout.write(`  [${i + 1}/${files.length}] ${filename} - ⏭️  skipped (already uploaded)\n`);
      continue;
    }

    try {
      const ossKey = generateOssKey(categorySlug, filename);
      const thumbnailUrl = getThumbnailUrl(ossKey);
      const title = path.basename(filename, path.extname(filename));

      process.stdout.write(`  [${i + 1}/${files.length}] ${filename} (${fileSizeMB}MB) → uploading...`);

      // Upload to OSS with retry
      await retryWithTimeout(() => uploadToOSS(ossKey, filePath), filename);

      // Insert into database with retry
      await retryWithTimeout(() => insertImage(category.id, title, thumbnailUrl, ossKey, i + 1), 'DB insert');

      // Mark as uploaded
      markUploaded(progress, categorySlug, filename);

      uploaded++;
      process.stdout.write(` ✅\n`);
    } catch (err) {
      failed++;
      process.stdout.write(` ❌ ${err.message}\n`);
    }
  }

  // Update category image count
  const totalCount = await updateCategoryImageCount(category.id);

  // Update cover image if needed
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
    Object.keys(CATEGORY_MAP).forEach(slug => { console.log(`     ${slug}/`); });
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

  const archiver = require('archiver');
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
        await retryWithTimeout(() => uploadBufferToOSS(zipKey, zipBuffer, 'application/zip'), 'ZIP upload');
        await updateCategoryZipKey(category.id, zipKey, zipSize);
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
// List / Delete / Reset
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

async function deleteImageById(imageId) {
  const { data: image, error } = await getSupabase().from('vision_images').select('*').eq('id', imageId).single();
  if (error || !image) {
    console.error(`❌ Image not found: ${imageId}`);
    process.exit(1);
  }
  console.log(`🗑️  Deleting: ${image.title} (${image.hd_image_key})`);
  try {
    await deleteFromOSS(image.hd_image_key);
    console.log('  ✅ Deleted from OSS');
  } catch (err) {
    console.log(`  ⚠️  OSS delete failed: ${err.message}`);
  }
  await deleteImage(imageId);
  console.log('  ✅ Deleted from database');
  const newCount = await updateCategoryImageCount(image.category_id);
  console.log(`  📊 Category image count updated: ${newCount}`);
}

function resetProgress(categorySlug) {
  const progress = loadProgress();
  if (categorySlug) {
    if (progress[categorySlug]) {
      delete progress[categorySlug];
      saveProgress(progress);
      console.log(`🔄 Progress reset for: ${categorySlug}`);
    } else {
      console.log(`ℹ️  No progress found for: ${categorySlug}`);
    }
  } else {
    if (fs.existsSync(PROGRESS_FILE)) {
      fs.unlinkSync(PROGRESS_FILE);
    }
    console.log('🔄 All progress reset');
  }
}

// ============================================================
// CLI
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
║         LXNUYYHYI Image Upload Tool v2.0                   ║
║         (支持断点续传、自动重试、超时控制)                    ║
╚══════════════════════════════════════════════════════════════╝

Usage:
  node upload.js --category <slug>    Upload images for one category
  node upload.js --all                Upload all categories from ./images/
  node upload.js --zip <slug>         Create & upload ZIP for a category
  node upload.js --zip-all            Create ZIPs for all categories
  node upload.js --list               List all categories and counts
  node upload.js --delete <image-id>  Delete a specific image
  node upload.js --reset [slug]       Reset upload progress (all or one category)

Category Slugs:
  wealth-finance        财富与财务
  travel-adventure      旅行与探索
  health-fitness        健康与健身
  career-business       职业与事业
  self-love-growth      自爱与成长
  family-relationship   家庭与关系
  home-living           居家生活
  spiritual-manifestation 灵性与显化

Resume:
  If upload is interrupted, just run the same command again.
  Already uploaded files will be skipped automatically.
  Use --reset to clear progress and re-upload from scratch.

Examples:
  node upload.js --category wealth-finance
  node upload.js --all
  node upload.js --zip wealth-finance
  node upload.js --reset wealth-finance
  node upload.js --list
`);
}

async function main() {
  const args = parseArgs();

  if (Object.keys(args).length === 0 || args.help) {
    printHelp();
    return;
  }

  console.log('\n🌟 LXNUYYHYI Upload Tool v2.0\n');

  try {
    if (args.list) { await listCategories(); return; }
    if (args.reset) { resetProgress(args.reset !== 'true' ? args.reset : undefined); return; }
    if (args.category) {
      const dirPath = args.dir || path.join(process.cwd(), 'images', args.category);
      await uploadCategoryImages(args.category, dirPath);
      return;
    }
    if (args.all) { await uploadAllCategories(); return; }
    if (args.zip && args.zip !== 'true') { await createCategoryZip(args.zip); return; }
    if (args['zip-all'] || args.zip === 'true') { await createAllZips(); return; }
    if (args.delete) { await deleteImageById(args.delete); return; }

    console.log('Unknown option. Use --help for usage.');
  } catch (err) {
    console.error(`\n💥 Error: ${err.message}`);
    process.exit(1);
  }
}

main();
