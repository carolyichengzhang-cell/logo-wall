// Logo 采集器 - Background Service Worker

// 存储管理
const STORAGE_KEY = 'logo_collector_items';

// 获取已采集的 Logo 列表
async function getCollectedLogos() {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] || [];
}

// 保存 Logo 列表
async function saveCollectedLogos(logos) {
  await chrome.storage.local.set({ [STORAGE_KEY]: logos });
}

// 添加 Logo（去重）
async function addLogos(newLogos) {
  const existing = await getCollectedLogos();
  let addedCount = 0;
  newLogos.forEach(logo => {
    // 按名称 + 来源域名去重
    const isDuplicate = existing.some(
      e => e.name === logo.name && e.domain === logo.domain
    );
    if (!isDuplicate) {
      existing.push({
        ...logo,
        id: Date.now() + '_' + Math.random().toString(36).slice(2, 8),
        addedAt: Date.now()
      });
      addedCount++;
    }
  });
  await saveCollectedLogos(existing);
  return { addedCount, total: existing.length };
}

// 删除 Logo
async function removeLogos(ids) {
  const existing = await getCollectedLogos();
  const filtered = existing.filter(l => !ids.includes(l.id));
  await saveCollectedLogos(filtered);
  return filtered;
}

// 清空所有
async function clearAllLogos() {
  await saveCollectedLogos([]);
}

// 消息处理
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { action, data } = message;

  switch (action) {
    case 'getLogos':
      getCollectedLogos().then(logos => sendResponse({ logos }));
      return true;

    case 'addLogos':
      addLogos(data.logos).then(result => sendResponse(result));
      return true;

    case 'removeLogos':
      removeLogos(data.ids).then(logos => sendResponse({ logos }));
      return true;

    case 'clearAll':
      clearAllLogos().then(() => sendResponse({ success: true }));
      return true;

    case 'updateLogo':
      getCollectedLogos().then(logos => {
        const idx = logos.findIndex(l => l.id === data.id);
        if (idx >= 0) {
          logos[idx] = { ...logos[idx], ...data.updates };
          saveCollectedLogos(logos).then(() => sendResponse({ logos }));
        } else {
          sendResponse({ logos });
        }
      });
      return true;
  }
});

// 监听插件图标点击的 badge 更新
chrome.storage.onChanged.addListener((changes) => {
  if (changes[STORAGE_KEY]) {
    const newVal = changes[STORAGE_KEY].newValue || [];
    const count = newVal.length;
    chrome.action.setBadgeText({ text: count > 0 ? String(count) : '' });
    chrome.action.setBadgeBackgroundColor({ color: '#667eea' });
  }
});
