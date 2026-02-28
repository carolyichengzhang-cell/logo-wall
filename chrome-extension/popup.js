// Logo 采集器 - Popup 脚本

const CATEGORY_TREE = {
  '商务办公': ['在线会议', '商务沟通', '项目管理', '文档协作', '企业管理', '办公工具', '求职招聘', '其他'],
  '社交聊天': ['即时通讯', '社区论坛', '婚恋交友', '兴趣社交', '其他'],
  '娱乐': ['OTT', '短视频', '直播', '音乐与音频', '播客', '其他'],
  '购物': ['综合电商', '二手交易', '特卖折扣', '跨境电商', '其他'],
  '生活服务': ['外卖配送', '本地生活', '快递物流', '女性健康', '拍照工具', '二手交易', '家用电器', '通信运营', '便利店', '婚庆服务', '其他'],
  '金融理财': ['银行', '支付', '投资理财', '保险', '借贷', '其他'],
  '出行导航': ['地图导航', '打车出行', '共享单车', '货运', '其他'],
  '旅游出行': ['综合旅游服务', '酒店住宿', '机票火车', '旅行攻略', '其他'],
  '教育学习': ['K12教育', '职业培训', '语言学习', '在线课程', '其他'],
  '游戏': ['射击', '团队竞技', 'MOBA', 'RPG', '休闲益智', '棋牌', '其他'],
  '新闻资讯': ['综合新闻', '财经资讯', '科技资讯', '体育资讯', '其他'],
  '照片视频': ['照片编辑', '视频编辑', '相机工具', '美颜滤镜', '其他'],
  '健身健康': ['运动健身', '医疗健康', '女性健康', '心理健康', '在线医疗', '其他'],
  '阅读文学': ['小说阅读', '电子书', '有声书', '漫画', '其他'],
  '房产家居': ['租房买房', '家装设计', '智能家居', '其他'],
  'AI 人工智能': ['AI助手', 'AI创作', 'AI工具', '其他'],
  '美食餐饮': ['餐厅推荐', '美食菜谱', '食品生鲜', '其他'],
  '汽车服务': ['买车卖车', '车主服务', '充电加油', '其他'],
  '工具效率': ['浏览器', '系统工具', '文件管理', '效率工具', '其他'],
  '其他': ['其他']
};

// DOM 元素
const btnScan = document.getElementById('btnScan');
const btnPick = document.getElementById('btnPick');
const btnExport = document.getElementById('btnExport');
const btnImport = document.getElementById('btnImport');
const btnClear = document.getElementById('btnClear');
const logoList = document.getElementById('logoList');
const emptyState = document.getElementById('emptyState');
const totalCount = document.getElementById('totalCount');
const editOverlay = document.getElementById('editOverlay');
const editName = document.getElementById('editName');
const editCategory = document.getElementById('editCategory');
const editSubcategory = document.getElementById('editSubcategory');
const editRegion = document.getElementById('editRegion');
const editProduct = document.getElementById('editProduct');
const editSave = document.getElementById('editSave');
const editCancel = document.getElementById('editCancel');

let allLogos = [];
let editingId = null;

// ============ 产品 + 区域 批量选择 ============
let currentProduct = 'IM';
let currentRegion = '中国大陆';

// 产品选择
document.querySelectorAll('#productOptions .opt-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#productOptions .opt-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentProduct = btn.dataset.product;
    // 保存到 storage 供 content.js 使用
    chrome.storage.local.set({ logo_collector_product: currentProduct, logo_collector_region: currentRegion });
  });
});

// 区域选择
document.querySelectorAll('#regionOptions .opt-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#regionOptions .opt-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentRegion = btn.dataset.region;
    chrome.storage.local.set({ logo_collector_product: currentProduct, logo_collector_region: currentRegion });
  });
});

// 从 storage 恢复上次的选择
chrome.storage.local.get(['logo_collector_product', 'logo_collector_region'], (result) => {
  if (result.logo_collector_product) {
    currentProduct = result.logo_collector_product;
    document.querySelectorAll('#productOptions .opt-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.product === currentProduct);
    });
  }
  if (result.logo_collector_region) {
    currentRegion = result.logo_collector_region;
    document.querySelectorAll('#regionOptions .opt-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.region === currentRegion);
    });
  }
});

// 初始化分类下拉
function initCategorySelects() {
  editCategory.innerHTML = '<option value="">请选择分类</option>';
  Object.keys(CATEGORY_TREE).forEach(cat => {
    editCategory.innerHTML += `<option value="${cat}">${cat}</option>`;
  });

  editCategory.addEventListener('change', () => {
    const subs = CATEGORY_TREE[editCategory.value] || [];
    editSubcategory.innerHTML = '<option value="">请选择小分类</option>';
    subs.forEach(sub => {
      editSubcategory.innerHTML += `<option value="${sub}">${sub}</option>`;
    });
  });
}

// 加载 Logo 列表
async function loadLogos() {
  return new Promise(resolve => {
    chrome.runtime.sendMessage({ action: 'getLogos' }, (response) => {
      if (chrome.runtime.lastError) {
        resolve([]);
        return;
      }
      allLogos = response?.logos || [];
      resolve(allLogos);
    });
  });
}

// 渲染 Logo 列表
function renderList() {
  totalCount.textContent = allLogos.length;

  if (allLogos.length === 0) {
    emptyState.style.display = 'block';
    // 清除列表中除 emptyState 外的元素
    const items = logoList.querySelectorAll('.logo-item');
    items.forEach(el => el.remove());
    return;
  }

  emptyState.style.display = 'none';

  // 按添加时间倒序
  const sorted = [...allLogos].sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));

  logoList.innerHTML = '';
  sorted.forEach(logo => {
    const item = document.createElement('div');
    item.className = 'logo-item';
    item.innerHTML = `
      <img src="${logo.src}" alt="${logo.name}">
      <div class="logo-info">
        <div class="logo-name">${logo.name}</div>
        <div class="logo-meta">
          ${logo.product ? `<span class="logo-tag product">${logo.product}</span>` : ''}
          ${logo.category ? `<span class="logo-tag">${logo.category}${logo.subcategory ? ' > ' + logo.subcategory : ''}</span>` : ''}
          ${logo.region ? `<span class="logo-tag region">${logo.region}</span>` : ''}
          ${logo.source ? `<span class="logo-tag source">${logo.source}</span>` : ''}
        </div>
      </div>
      <div class="logo-actions">
        <button class="btn-edit" data-id="${logo.id}" title="编辑">✏️</button>
        <button class="btn-delete" data-id="${logo.id}" title="删除">🗑️</button>
      </div>
    `;

    // 编辑按钮
    item.querySelector('.btn-edit').addEventListener('click', () => {
      openEditDialog(logo);
    });

    // 删除按钮
    item.querySelector('.btn-delete').addEventListener('click', async () => {
      chrome.runtime.sendMessage({
        action: 'removeLogos',
        data: { ids: [logo.id] }
      }, (response) => {
        allLogos = response?.logos || [];
        renderList();
      });
    });

    logoList.appendChild(item);
  });
}

// 打开编辑对话框
function openEditDialog(logo) {
  editingId = logo.id;
  editName.value = logo.name || '';
  editProduct.value = logo.product || currentProduct || 'IM';
  editCategory.value = logo.category || '';

  // 触发小分类更新
  const subs = CATEGORY_TREE[logo.category] || [];
  editSubcategory.innerHTML = '<option value="">请选择小分类</option>';
  subs.forEach(sub => {
    editSubcategory.innerHTML += `<option value="${sub}">${sub}</option>`;
  });
  editSubcategory.value = logo.subcategory || '';

  editRegion.value = logo.region || '';
  editOverlay.classList.add('visible');
}

// 保存编辑
editSave.addEventListener('click', () => {
  if (!editingId) return;

  chrome.runtime.sendMessage({
    action: 'updateLogo',
    data: {
      id: editingId,
      updates: {
        name: editName.value.trim() || '未命名',
        product: editProduct.value,
        category: editCategory.value,
        subcategory: editSubcategory.value,
        region: editRegion.value
      }
    }
  }, (response) => {
    allLogos = response?.logos || allLogos;
    renderList();
    editOverlay.classList.remove('visible');
    editingId = null;
  });
});

// 取消编辑
editCancel.addEventListener('click', () => {
  editOverlay.classList.remove('visible');
  editingId = null;
});

// 发送消息到当前 tab 的 Content Script
async function sendToContentScript(msg) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  try {
    // 先注入 content script（以防还没加载）
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    }).catch(() => {});

    await chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      files: ['content.css']
    }).catch(() => {});

    return new Promise(resolve => {
      chrome.tabs.sendMessage(tab.id, msg, (response) => {
        resolve(response);
      });
    });
  } catch (e) {
    console.warn('sendToContentScript error:', e);
  }
}

// 自动扫描
btnScan.addEventListener('click', async () => {
  btnScan.textContent = '⏳ 扫描中...';
  btnScan.disabled = true;

  // 先同步产品/区域设置到 storage
  await chrome.storage.local.set({ logo_collector_product: currentProduct, logo_collector_region: currentRegion });
  await sendToContentScript({ action: 'setSettings', data: { product: currentProduct, region: currentRegion } });
  await sendToContentScript({ action: 'startScan' });

  // 延迟刷新列表
  setTimeout(async () => {
    await loadLogos();
    renderList();
    btnScan.textContent = '🔍 自动扫描';
    btnScan.disabled = false;
  }, 3000);
});

// 手动点选
btnPick.addEventListener('click', async () => {
  await chrome.storage.local.set({ logo_collector_product: currentProduct, logo_collector_region: currentRegion });
  await sendToContentScript({ action: 'setSettings', data: { product: currentProduct, region: currentRegion } });
  await sendToContentScript({ action: 'startPick' });
  // 关闭 popup，让用户在页面上操作
  window.close();
});

// 导出 JSON
btnExport.addEventListener('click', () => {
  if (allLogos.length === 0) {
    alert('没有可导出的 Logo');
    return;
  }

  // 导出为 Logo 墙生成器兼容的格式
  const exportData = allLogos.map(logo => ({
    src: logo.src,
    name: logo.name,
    category: logo.category || '',
    subcategory: logo.subcategory || '',
    product: logo.product || currentProduct || '',
    region: logo.region || ''
  }));

  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `logo-collection-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

// 导入到 Logo 墙生成器（通过剪贴板复制 JSON，用户去生成器粘贴）
btnImport.addEventListener('click', async () => {
  if (allLogos.length === 0) {
    alert('没有可导入的 Logo');
    return;
  }

  const exportData = allLogos.map(logo => ({
    id: Date.now() + '_' + Math.random().toString(36).slice(2, 8),
    src: logo.src,
    name: logo.name,
    category: logo.category || '',
    subcategory: logo.subcategory || '',
    product: logo.product || currentProduct || '',
    region: logo.region || '',
    addedAt: Date.now()
  }));

  const json = JSON.stringify(exportData);

  try {
    await navigator.clipboard.writeText(json);
    alert(`✅ 已复制 ${allLogos.length} 个 Logo 数据到剪贴板！\n\n请打开 Logo 墙生成器，在控制台输入：\n\nconst data = JSON.parse(await navigator.clipboard.readText());\nconst lib = JSON.parse(localStorage.getItem("logo_wall_library") || "[]");\nlib.push(...data);\nlocalStorage.setItem("logo_wall_library", JSON.stringify(lib));\nlocation.reload();\n\n即可导入到 Logo 库。`);
  } catch (e) {
    // 降级：下载 JSON 文件
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logo-import-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    alert('已下载 JSON 文件，请在 Logo 墙生成器中导入。');
  }
});

// 清空
btnClear.addEventListener('click', async () => {
  if (allLogos.length === 0) return;
  if (!confirm(`确定清空全部 ${allLogos.length} 个 Logo 吗？此操作不可撤销。`)) return;

  chrome.runtime.sendMessage({ action: 'clearAll' }, () => {
    allLogos = [];
    renderList();
  });
});

// 初始化
async function init() {
  initCategorySelects();
  await loadLogos();
  renderList();
}

init();

// 监听 storage 变化实时更新
chrome.storage.onChanged.addListener((changes) => {
  if (changes.logo_collector_items) {
    allLogos = changes.logo_collector_items.newValue || [];
    renderList();
  }
});
