// 📄 lockManager.js：編集ロック管理ユーティリティ（新構造対応）

import fs from "fs";
import path from "path";

const LOCK_PATH = path.resolve("data", "lock.json");

function loadLocks() {
  if (!fs.existsSync(LOCK_PATH)) return {};
  return JSON.parse(fs.readFileSync(LOCK_PATH, "utf8"));
}

function saveLocks(locks) {
  fs.writeFileSync(LOCK_PATH, JSON.stringify(locks, null, 2));
}

export function isLocked(id) {
  const locks = loadLocks();
  return locks[id]?.locked === true;
}

export function lock(id, user = "admin") {
  const locks = loadLocks();
  locks[id] = {
    locked: true,
    lockedBy: user,
    lockedAt: new Date().toISOString()
  };
  saveLocks(locks);
}

export function unlock(id) {
  const locks = loadLocks();
  delete locks[id];
  saveLocks(locks);
}