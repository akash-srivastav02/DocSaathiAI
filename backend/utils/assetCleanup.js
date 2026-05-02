const User = require('../models/User');
const History = require('../models/ProcessHistory');
const { cloudinary } = require('./cloudinary');

const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;
const cleanupTimers = new Map();

function clearUserCleanupTimer(userId) {
  const key = String(userId);
  const timer = cleanupTimers.get(key);
  if (timer) {
    clearTimeout(timer);
    cleanupTimers.delete(key);
  }
}

function extractCloudinaryAsset(url) {
  if (!url || typeof url !== 'string' || !url.includes('res.cloudinary.com')) {
    return null;
  }

  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z0-9]+)?(?:\?|$)/i);
  if (!match || !match[1]) {
    return null;
  }

  const publicId = match[1];
  const resourceType = /\.pdf(?:\?|$)/i.test(url) ? 'raw' : 'image';
  return { publicId, resourceType };
}

async function cleanupUserProcessedAssets(userId) {
  clearUserCleanupTimer(userId);

  const historyItems = await History.find({ user: userId }).select('processedUrl originalUrl');
  const assets = new Map();

  historyItems.forEach((item) => {
    [item.processedUrl, item.originalUrl].forEach((url) => {
      const asset = extractCloudinaryAsset(url);
      if (asset) {
        assets.set(`${asset.resourceType}:${asset.publicId}`, asset);
      }
    });
  });

  await Promise.all(
    [...assets.values()].map(async ({ publicId, resourceType }) => {
      try {
        await cloudinary.uploader.destroy(publicId, {
          resource_type: resourceType,
          type: 'upload',
          invalidate: true,
        });
      } catch (error) {
        console.error(`[Cleanup] Could not delete Cloudinary asset ${publicId}:`, error.message);
      }
    })
  );

  await History.updateMany(
    { user: userId },
    { $set: { processedUrl: '', originalUrl: '' } }
  );

  await User.findByIdAndUpdate(userId, {
    $set: {
      cleanupAfter: null,
      lastAssetCleanupAt: new Date(),
    },
  });
}

function scheduleUserAssetCleanup(userId, runAt) {
  if (!runAt) return;

  clearUserCleanupTimer(userId);

  const delay = new Date(runAt).getTime() - Date.now();
  if (delay <= 0) {
    cleanupUserProcessedAssets(userId).catch((error) => {
      console.error('[Cleanup] Immediate cleanup failed:', error.message);
    });
    return;
  }

  const timer = setTimeout(() => {
    cleanupUserProcessedAssets(userId).catch((error) => {
      console.error('[Cleanup] Scheduled cleanup failed:', error.message);
    });
  }, delay);

  cleanupTimers.set(String(userId), timer);
}

async function restorePendingAssetCleanups() {
  const users = await User.find({ cleanupAfter: { $ne: null } }).select('_id cleanupAfter');

  users.forEach((user) => {
    scheduleUserAssetCleanup(user._id, user.cleanupAfter);
  });
}

async function reconcileUserAssetCleanup(user) {
  if (!user) return user;

  const now = new Date();
  if (user.cleanupAfter) {
    if (new Date(user.cleanupAfter).getTime() <= now.getTime()) {
      await cleanupUserProcessedAssets(user._id);
      user.cleanupAfter = null;
      user.lastAssetCleanupAt = now;
    } else {
      clearUserCleanupTimer(user._id);
      user.cleanupAfter = null;
    }
  }

  user.lastSeenAt = now;
  await user.save();
  return user;
}

module.exports = {
  EIGHT_HOURS_MS,
  cleanupUserProcessedAssets,
  scheduleUserAssetCleanup,
  restorePendingAssetCleanups,
  reconcileUserAssetCleanup,
  clearUserCleanupTimer,
};
