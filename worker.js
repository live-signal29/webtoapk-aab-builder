import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase Credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function processPendingBuilds() {
  console.log("Checking for pending builds...");

  const { data: builds, error } = await supabase
    .from('builds')
    .select('*')
    .eq('status', 'pending')
    .limit(1);

  if (error) {
    console.error("Error fetching builds:", error);
    return;
  }

  if (!builds || builds.length === 0) {
    console.log("No pending builds found.");
    return;
  }

  const build = builds[0];
  console.log(`Processing build ID: ${build.id} for App: ${build.app_name}`);

  try {
    // 1. App working directory setup
    const buildDir = path.join(process.cwd(), 'temp_build');
    if (fs.existsSync(buildDir)) {
      fs.rmSync(buildDir, { recursive: true, force: true });
    }
    fs.mkdirSync(buildDir);

    const appId = build.package_name || 'com.webtoapp.app';
    const appName = build.app_name || 'My Web App';

    // 2. Cordova CLI ke zariye Android project initialize
    console.log("Generating Android project...");
    execSync(`npx cordova create "${buildDir}" "${appId}" "${appName}"`, { stdio: 'inherit' });

    process.chdir(buildDir);
    execSync('npx cordova platform add android', { stdio: 'inherit' });

    // 3. WebView Config (User URL redirect setup)
    const configPath = path.join(buildDir, 'config.xml');
    let configXml = fs.readFileSync(configPath, 'utf8');
    configXml = configXml.replace(/<content src="index.html" \/>/, `<content src="${build.website_url}" />`);
    fs.writeFileSync(configPath, configXml);

    // 4. APK Build compilation
    console.log("Compiling APK...");
    execSync('npx cordova build android --allow-webview-on-allow-navigation', { stdio: 'inherit' });

    // 5. Output file locate karna
    const apkPath = path.join(buildDir, 'platforms/android/app/build/outputs/apk/debug/app-debug.apk');

    if (!fs.existsSync(apkPath)) {
      throw new Error("APK file generation failed.");
    }

    // 6. Supabase Storage mein APK upload karna
    console.log("Uploading generated APK to Supabase Storage...");
    const fileBuffer = fs.readFileSync(apkPath);
    const fileName = `builds/${build.id}_${Date.now()}.apk`;

    const { error: uploadError } = await supabase.storage
      .from('app-assets')
      .upload(fileName, fileBuffer, {
        contentType: 'application/vnd.android.package-archive',
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from('app-assets')
      .getPublicUrl(fileName);

    const downloadUrl = publicUrlData.publicUrl;

    // 7. Database status mark completed
    await supabase
      .from('builds')
      .update({
        status: 'completed',
        download_url: downloadUrl
      })
      .eq('id', build.id);

    console.log(`Build ${build.id} completed successfully!`);

  } catch (err) {
    console.error("Build failed:", err);
    await supabase
      .from('builds')
      .update({ status: 'failed' })
      .eq('id', build.id);
  }
}

processPendingBuilds();
