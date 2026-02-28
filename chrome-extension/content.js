// Logo 采集器 - Content Script
// 从网页 DOM 中智能提取 App Logo 和名称信息

(function() {
  'use strict';

  // 防止重复注入
  if (window.__logoCollectorInjected) return;
  window.__logoCollectorInjected = true;

  // ========== App 分类映射表（与主项目同步） ==========
  const APP_NAME_CATEGORY_MAP = {
    '微信': { major: '社交聊天', minor: '即时通讯' },
    'WeChat': { major: '社交聊天', minor: '即时通讯' },
    'QQ': { major: '社交聊天', minor: '即时通讯' },
    '钉钉': { major: '商务办公', minor: '企业管理' },
    'DingTalk': { major: '商务办公', minor: '企业管理' },
    '飞书': { major: '商务办公', minor: '企业管理' },
    'Lark': { major: '商务办公', minor: '企业管理' },
    '企业微信': { major: '商务办公', minor: '商务沟通' },
    '微博': { major: '社交聊天', minor: '社区论坛' },
    'Weibo': { major: '社交聊天', minor: '社区论坛' },
    '小红书': { major: '社交聊天', minor: '兴趣社交' },
    'RED': { major: '社交聊天', minor: '兴趣社交' },
    'Xiaohongshu': { major: '社交聊天', minor: '兴趣社交' },
    '抖音': { major: '娱乐', minor: '短视频' },
    'TikTok': { major: '娱乐', minor: '短视频' },
    'Douyin': { major: '娱乐', minor: '短视频' },
    '快手': { major: '娱乐', minor: '短视频' },
    'Kuaishou': { major: '娱乐', minor: '短视频' },
    '西瓜视频': { major: '娱乐', minor: 'OTT' },
    'B站': { major: '娱乐', minor: 'OTT' },
    '哔哩哔哩': { major: '娱乐', minor: 'OTT' },
    'Bilibili': { major: '娱乐', minor: 'OTT' },
    '优酷': { major: '娱乐', minor: 'OTT' },
    'Youku': { major: '娱乐', minor: 'OTT' },
    '爱奇艺': { major: '娱乐', minor: 'OTT' },
    'iQIYI': { major: '娱乐', minor: 'OTT' },
    '腾讯视频': { major: '娱乐', minor: 'OTT' },
    '芒果TV': { major: '娱乐', minor: 'OTT' },
    '淘宝': { major: '购物', minor: '综合电商' },
    'Taobao': { major: '购物', minor: '综合电商' },
    '天猫': { major: '购物', minor: '综合电商' },
    'Tmall': { major: '购物', minor: '综合电商' },
    '京东': { major: '购物', minor: '综合电商' },
    'JD': { major: '购物', minor: '综合电商' },
    '拼多多': { major: '购物', minor: '综合电商' },
    'Pinduoduo': { major: '购物', minor: '综合电商' },
    '唯品会': { major: '购物', minor: '特卖折扣' },
    '闲鱼': { major: '购物', minor: '二手交易' },
    '得物': { major: '购物', minor: '综合电商' },
    '1688': { major: '购物', minor: '综合电商' },
    '美团': { major: '生活服务', minor: '外卖配送' },
    'Meituan': { major: '生活服务', minor: '外卖配送' },
    '饿了么': { major: '生活服务', minor: '外卖配送' },
    '盒马': { major: '生活服务', minor: '外卖配送' },
    '叮咚买菜': { major: '生活服务', minor: '外卖配送' },
    '支付宝': { major: '金融理财', minor: '支付' },
    'Alipay': { major: '金融理财', minor: '支付' },
    '云闪付': { major: '金融理财', minor: '支付' },
    '招商银行': { major: '金融理财', minor: '银行' },
    '工商银行': { major: '金融理财', minor: '银行' },
    '建设银行': { major: '金融理财', minor: '银行' },
    '百度地图': { major: '出行导航', minor: '地图导航' },
    '高德地图': { major: '出行导航', minor: '地图导航' },
    '滴滴出行': { major: '出行导航', minor: '打车出行' },
    '携程': { major: '旅游出行', minor: '综合旅游服务' },
    '携程旅行': { major: '旅游出行', minor: '综合旅游服务' },
    '飞猪': { major: '旅游出行', minor: '综合旅游服务' },
    '网易云音乐': { major: '娱乐', minor: '音乐与音频' },
    'QQ音乐': { major: '娱乐', minor: '音乐与音频' },
    '酷狗音乐': { major: '娱乐', minor: '音乐与音频' },
    '知乎': { major: '新闻资讯', minor: '综合新闻' },
    'Zhihu': { major: '新闻资讯', minor: '综合新闻' },
    '今日头条': { major: '新闻资讯', minor: '综合新闻' },
    '豆包': { major: 'AI 人工智能', minor: 'AI助手' },
    'ChatGPT': { major: 'AI 人工智能', minor: 'AI助手' },
    'Kimi': { major: 'AI 人工智能', minor: 'AI助手' },
    'DeepSeek': { major: 'AI 人工智能', minor: 'AI助手' },
    '王者荣耀': { major: '游戏', minor: 'MOBA' },
    '和平精英': { major: '游戏', minor: '射击' },
    '原神': { major: '游戏', minor: 'RPG' },
    'Genshin Impact': { major: '游戏', minor: 'RPG' },
    'Keep': { major: '健身健康', minor: '运动健身' },
    'BOSS直聘': { major: '商务办公', minor: '求职招聘' },
    '腾讯会议': { major: '商务办公', minor: '在线会议' },
    'VooV Meeting': { major: '商务办公', minor: '在线会议' },
    '美图秀秀': { major: '照片视频', minor: '美颜滤镜' },
    '剪映': { major: '照片视频', minor: '视频编辑' },
    'CapCut': { major: '照片视频', minor: '视频编辑' },
    'Zoom': { major: '商务办公', minor: '在线会议' },
    'Slack': { major: '商务办公', minor: '商务沟通' },
    'WhatsApp': { major: '社交聊天', minor: '即时通讯' },
    'Telegram': { major: '社交聊天', minor: '即时通讯' },
    'Line': { major: '社交聊天', minor: '即时通讯' },
    'LINE': { major: '社交聊天', minor: '即时通讯' },
    'KakaoTalk': { major: '社交聊天', minor: '即时通讯' },
    'Instagram': { major: '社交聊天', minor: '兴趣社交' },
    'Facebook': { major: '社交聊天', minor: '社区论坛' },
    'Twitter': { major: '社交聊天', minor: '社区论坛' },
    'X': { major: '社交聊天', minor: '社区论坛' },
    'Snapchat': { major: '社交聊天', minor: '即时通讯' },
    'Discord': { major: '社交聊天', minor: '社区论坛' },
    'YouTube': { major: '娱乐', minor: 'OTT' },
    'Netflix': { major: '娱乐', minor: 'OTT' },
    'Spotify': { major: '娱乐', minor: '音乐与音频' },
    'Amazon': { major: '购物', minor: '综合电商' },
    'Shopee': { major: '购物', minor: '综合电商' },
    'Lazada': { major: '购物', minor: '综合电商' },
    'Tokopedia': { major: '购物', minor: '综合电商' },
    'Grab': { major: '出行导航', minor: '打车出行' },
    'Uber': { major: '出行导航', minor: '打车出行' },
    'Google Maps': { major: '出行导航', minor: '地图导航' },
    'Apple Maps': { major: '出行导航', minor: '地图导航' },
    'PayPal': { major: '金融理财', minor: '支付' },
    'GoPay': { major: '金融理财', minor: '支付' },
    'OVO': { major: '金融理财', minor: '支付' },
    'DANA': { major: '金融理财', minor: '支付' },
    '番茄小说': { major: '阅读文学', minor: '小说阅读' },
    '微信读书': { major: '阅读文学', minor: '电子书' },
    '大众点评': { major: '美食餐饮', minor: '餐厅推荐' },
    '瑞幸咖啡': { major: '美食餐饮', minor: '餐厅推荐' },
    '星巴克': { major: '美食餐饮', minor: '餐厅推荐' },
    'Starbucks': { major: '美食餐饮', minor: '餐厅推荐' },
    '肯德基': { major: '美食餐饮', minor: '餐厅推荐' },
    'KFC': { major: '美食餐饮', minor: '餐厅推荐' },
    '麦当劳': { major: '美食餐饮', minor: '餐厅推荐' },
    "McDonald's": { major: '美食餐饮', minor: '餐厅推荐' },
    '腾讯即时通信': { major: '社交聊天', minor: '即时通讯' },
    '无畏契约': { major: '游戏', minor: '射击' },
    'VALORANT': { major: '游戏', minor: '射击' },
    '美柚': { major: '健身健康', minor: '女性健康' },
    '腾讯云': { major: '工具效率', minor: '系统工具' },
    '斗鱼': { major: '娱乐', minor: '直播' },
    '虎牙': { major: '娱乐', minor: '直播' },
    '货拉拉': { major: '出行导航', minor: '货运' },
    '朴朴超市': { major: '生活服务', minor: '外卖配送' },
    '朴朴': { major: '生活服务', minor: '外卖配送' },
    '鱼泡直聘': { major: '商务办公', minor: '求职招聘' },
    '233乐园': { major: '游戏', minor: '休闲益智' },
    '智联招聘': { major: '商务办公', minor: '求职招聘' },
    '智学网': { major: '教育学习', minor: 'K12教育' },
    '前程无忧': { major: '商务办公', minor: '求职招聘' },
    '英雄联盟': { major: '游戏', minor: 'MOBA' },
    '画世界': { major: '照片视频', minor: '照片编辑' },
    '小拉出行': { major: '出行导航', minor: '打车出行' },
    '比亚迪': { major: '汽车服务', minor: '买车卖车' },
    'BYD': { major: '汽车服务', minor: '买车卖车' },
  };

  // 清理 App 名称中的副标题/描述
  function cleanAppName(rawName) {
    if (!rawName) return '';
    let name = rawName.trim();
    // 去掉常见分隔符后面的副标题：- : ： — | · 
    name = name.split(/\s*[-:：—|·]\s*/)[0].trim();
    // 去掉括号内容
    name = name.replace(/[（(][^)）]*[)）]/g, '').trim();
    // 去掉末尾版本号等
    name = name.replace(/\s*(v?\d+\.\d+.*|最新版|官方版|免费版|专业版|极速版)$/i, '').trim();
    return name;
  }

  function matchCategory(name) {
    if (!name) return { major: '', minor: '' };
    // 1. 原始名称精确匹配
    if (APP_NAME_CATEGORY_MAP[name]) return { ...APP_NAME_CATEGORY_MAP[name] };
    // 2. 清理后的名称精确匹配
    const cleaned = cleanAppName(name);
    if (cleaned && APP_NAME_CATEGORY_MAP[cleaned]) return { ...APP_NAME_CATEGORY_MAP[cleaned] };
    // 3. 映射表 key 包含在名称中（处理 "无畏契约：源能行动" 包含 "无畏契约"）
    for (const [key, cat] of Object.entries(APP_NAME_CATEGORY_MAP)) {
      if (name.includes(key) || cleaned.includes(key)) return { ...cat };
    }
    // 4. 名称包含在映射表 key 中
    for (const [key, cat] of Object.entries(APP_NAME_CATEGORY_MAP)) {
      if (key.includes(cleaned) && cleaned.length >= 2) return { ...cat };
    }
    return { major: '', minor: '' };
  }

  // ========== 地区猜测 ==========
  function guessRegion(name) {
    if (!name) return '';
    // 中文 App → 中国大陆
    if (/[\u4e00-\u9fff]/.test(name)) return '中国大陆';
    // 日文
    if (/[\u3040-\u309f\u30a0-\u30ff]/.test(name)) return '日本';
    // 韩文
    if (/[\uac00-\ud7af]/.test(name)) return '韩国';
    return '';
  }

  // ========== 状态 ==========
  let isCollecting = false; // 自动扫描模式
  let isPicking = false;    // 手动点选模式
  let sessionLogos = [];    // 当前页面采集到的 logo
  let toolbar = null;
  let panel = null;
  let toast = null;

  // ========== 工具函数 ==========

  // 将图片 URL 转为 Base64
  function imgUrlToBase64(url) {
    return new Promise((resolve, reject) => {
      // 如果已经是 base64
      if (url.startsWith('data:')) {
        resolve(url);
        return;
      }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = Math.max(img.naturalWidth, img.naturalHeight, 128);
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        // 居中绘制
        const scale = Math.min(size / img.naturalWidth, size / img.naturalHeight);
        const w = img.naturalWidth * scale;
        const h = img.naturalHeight * scale;
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => {
        // 尝试无 crossOrigin
        const img2 = new Image();
        img2.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img2.naturalWidth || 128;
          canvas.height = img2.naturalHeight || 128;
          const ctx = canvas.getContext('2d');
          try {
            ctx.drawImage(img2, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          } catch(e) {
            reject(new Error('CORS blocked: ' + url));
          }
        };
        img2.onerror = () => reject(new Error('Load failed: ' + url));
        img2.src = url;
      };
      img.src = url;
    });
  }

  function showToast(msg, duration = 2000) {
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'logo-collector-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
  }

  // ========== 网站适配器 ==========
  // 针对不同网站的 Logo 提取策略

  const siteAdapters = {
    // Apple App Store (apps.apple.com)
    appStore: {
      match: () => location.hostname.includes('apps.apple.com'),
      scan: () => {
        const results = [];
        // App 详情页
        const heroImg = document.querySelector('.we-artwork--ios-app-icon img, picture.product-hero__artwork img');
        if (heroImg) {
          const name = document.querySelector('.product-header__title, .app-header__title')?.textContent?.trim()?.replace(/\s*\d+\+?\s*$/, '');
          if (name) {
            results.push({ imgEl: heroImg, name, source: 'App Store' });
          }
        }
        // 列表页/搜索结果
        document.querySelectorAll('.we-lockup, .l-row .l-column').forEach(card => {
          const img = card.querySelector('.we-artwork img, picture img');
          const nameEl = card.querySelector('.we-lockup__title, .we-truncate');
          if (img && nameEl) {
            results.push({ imgEl: img, name: nameEl.textContent.trim(), source: 'App Store' });
          }
        });
        return results;
      }
    },

    // Google Play Store
    googlePlay: {
      match: () => location.hostname.includes('play.google.com'),
      scan: () => {
        const results = [];
        // App 详情页
        const heroImg = document.querySelector('img[itemprop="image"], .T75of');
        if (heroImg) {
          const name = document.querySelector('h1[itemprop="name"], h1 span')?.textContent?.trim();
          if (name) {
            results.push({ imgEl: heroImg, name, source: 'Google Play' });
          }
        }
        // 列表/推荐
        document.querySelectorAll('.Si6A0c, .ULeU3b, .VfPpkd-WsjYwc').forEach(card => {
          const img = card.querySelector('img.T75of, img[loading]');
          const nameEl = card.querySelector('.Epkrse, .ubGTjb, .DdYX5');
          if (img && nameEl) {
            results.push({ imgEl: img, name: nameEl.textContent.trim(), source: 'Google Play' });
          }
        });
        return results;
      }
    },

    // 华为应用市场 (AppGallery)
    huaweiAppGallery: {
      match: () => location.hostname.includes('appgallery.huawei.com'),
      scan: () => {
        const results = [];
        document.querySelectorAll('.appitem, .app-info, .appcardinfo').forEach(card => {
          const img = card.querySelector('img');
          const nameEl = card.querySelector('.name, .appname, h3, .title');
          if (img && nameEl) {
            results.push({ imgEl: img, name: nameEl.textContent.trim(), source: 'AppGallery' });
          }
        });
        return results;
      }
    },

    // 小米应用商店
    miAppStore: {
      match: () => location.hostname.includes('app.mi.com') || location.hostname.includes('m.app.mi.com'),
      scan: () => {
        const results = [];
        document.querySelectorAll('.applist-app, .app-item, .app-info-wrap').forEach(card => {
          const img = card.querySelector('img');
          const nameEl = card.querySelector('.app-name, h5, .app-title');
          if (img && nameEl) {
            results.push({ imgEl: img, name: nameEl.textContent.trim(), source: '小米应用商店' });
          }
        });
        return results;
      }
    },

    // 豌豆荚
    wandoujia: {
      match: () => location.hostname.includes('wandoujia.com'),
      scan: () => {
        const results = [];
        document.querySelectorAll('.card, .app-desc, li.search-item').forEach(card => {
          const img = card.querySelector('img.icon');
          const nameEl = card.querySelector('.name, .app-title-h2, h2');
          if (img && nameEl) {
            results.push({ imgEl: img, name: nameEl.textContent.trim(), source: '豌豆荚' });
          }
        });
        return results;
      }
    },

    // 通用适配器 - 智能检测页面上的 Logo 图片
    generic: {
      match: () => true,
      scan: () => {
        const results = [];

        // 从文本中提取分类（格式如 "娱乐 > 游戏服务"，支持各种 > 符号）
        function extractCategory(text) {
          if (!text) return null;
          // 支持 > ＞ → › » ❯ 以及它们的各种 Unicode 变体
          const m = text.match(/([\u4e00-\u9fff\w]+)\s*[>＞→›»❯\u003e\uff1e\u2192\u203a\u00bb]\s*([\u4e00-\u9fff\w/]+)/);
          if (m) return { major: m[1].trim(), minor: m[2].trim() };
          return null;
        }

        // 检测文本是否是纯分类格式（单元格主要内容就是分类）
        function isCategoryCell(text) {
          if (!text) return false;
          // 去掉空白后，整个文本就是一个分类格式
          const cleaned = text.trim();
          return /^[\u4e00-\u9fff\w]+\s*[>＞→]\s*[\u4e00-\u9fff\w/]+$/.test(cleaned);
        }

        // === 策略A：表格行扫描 ===
        // 支持多种表格实现：标准 table、Ant Design Table、Element UI Table、纯 div 模拟表格
        const tableRows = document.querySelectorAll(
          'tr, [role="row"], .ant-table-row, .el-table__row, ' +
          '[class*="table-row"], [class*="tableRow"], [class*="TableRow"]'
        );

        if (tableRows.length > 1) {
          // 获取行的直接子单元格（避免嵌套重复）
          function getDirectCells(row, isHeader) {
            // 先尝试直接子元素 td/th
            let cells = row.querySelectorAll(':scope > td');
            if (isHeader) cells = row.querySelectorAll(':scope > th');
            if (cells.length > 0) return cells;
            // 再尝试直接子元素 [role="cell"] / [role="columnheader"]
            if (isHeader) {
              cells = row.querySelectorAll(':scope > [role="columnheader"]');
            } else {
              cells = row.querySelectorAll(':scope > [role="cell"]');
            }
            if (cells.length > 0) return cells;
            // 兜底：直接子元素中带 class 的
            cells = row.querySelectorAll(':scope > .ant-table-cell, :scope > [class*="table-cell"], :scope > [class*="tableCell"]');
            if (cells.length > 0) return cells;
            // 最后兜底：所有直接子 div
            return row.querySelectorAll(':scope > div');
          }

          // 尝试多种方式查找表头
          let categoryColIndex = -1;
          const headerSelectors = [
            'thead tr',
            '.ant-table-thead tr',
            '[role="row"]:first-child',
            '[class*="table-header"] [role="row"]',
            '[class*="tableHeader"] [role="row"]',
            '[class*="thead"] [role="row"]',
          ];

          for (const sel of headerSelectors) {
            const headerRow = document.querySelector(sel);
            if (!headerRow) continue;
            const headerCells = getDirectCells(headerRow, true);
            console.log('[Logo采集器] 表头选择器:', sel, '列数:', headerCells.length,
              '列名:', Array.from(headerCells).map(c => c.textContent.trim().substring(0, 10)));
            headerCells.forEach((cell, idx) => {
              const text = cell.textContent.trim();
              if (text.includes('热门分类') || text === '分类' || text === '类别' || text === '类型') {
                categoryColIndex = idx;
              }
            });
            if (categoryColIndex >= 0) break;
          }

          console.log('[Logo采集器] 表格行数:', tableRows.length, '热门分类列索引:', categoryColIndex);

          tableRows.forEach((row, rowIdx) => {
            // 跳过表头行
            if (row.closest('thead') || row.querySelector('th') || row.querySelector('[role="columnheader"]')) return;

            const img = row.querySelector('img');
            if (!img) return;
            const rect = img.getBoundingClientRect();
            if (rect.width < 16 || rect.height < 16 || rect.width > 200) return;

            // 用同样的方法获取数据行的直接子单元格
            const cells = getDirectCells(row, false);

            // 调试：前3行打印详细信息
            if (rowIdx < 5) {
              console.log('[Logo采集器] 第' + rowIdx + '行, cells数:', cells.length,
                '各cell内容:', Array.from(cells).map((c, i) => `[${i}]${c.textContent.trim().substring(0, 20)}`));
            }

            let name = '';
            let pageCategory = '';
            let pageSubcategory = '';
            let imgCellIndex = -1;

            // 第一遍：找到图片所在的单元格并提取名称
            cells.forEach((cell, idx) => {
              if (!cell.contains(img) || name) return;
              imgCellIndex = idx;

              // 策略：找图片的兄弟或父级中，最近的纯文本名称
              // 先找 img 的直接父容器的兄弟元素（通常 App 名称在图片旁边）
              const imgParent = img.closest('div, td, a, span') || img.parentElement;
              
              // 方法1：找 img 同级或附近的文本节点
              // 遍历 cell 的所有 childNodes（包括文本节点），但只取浅层
              function findNameInContainer(container, depth) {
                if (depth > 3) return ''; // 限制深度避免找太深
                for (const child of container.childNodes) {
                  // 跳过图片本身
                  if (child === img || child.contains?.(img)) continue;
                  
                  const text = (child.textContent || '').trim();
                  if (!text || text.length < 2) continue;
                  
                  // 跳过包含 > ＞ 的文本（这是标签/分类，不是名称）
                  if (/[>＞→›»]/.test(text)) continue;
                  // 跳过纯数字
                  if (/^\d+$/.test(text)) continue;
                  // 跳过英文公司名
                  if (/Technology|Ltd|Inc|Co\.|Network|Beijing|Shanghai|Shenzhen|Comp|Limited|Games|Mobile|Entertainment/i.test(text)) continue;
                  if (/^[A-Za-z\s,.()\-&]{15,}$/.test(text)) continue;
                  // 跳过中文公司名（含"有限公司"、"科技"等）
                  if (/有限公司|科技有限|网络科技|信息技术/.test(text)) continue;
                  
                  // 找到了名称候选
                  if (text.length <= 30) {
                    return text;
                  }
                }
                return '';
              }
              
              // 从图片的各层父容器开始向上找
              let container = img.parentElement;
              while (container && container !== cell) {
                name = findNameInContainer(container, 0);
                if (name) break;
                container = container.parentElement;
              }
              
              // 如果还没找到，从 cell 的直接子元素中找
              if (!name) {
                for (const child of cell.children) {
                  if (child.contains(img)) continue;
                  const text = child.textContent.trim();
                  if (!text || text.length < 2 || text.length > 30) continue;
                  if (/[>＞→›»]/.test(text)) continue;
                  if (/^\d+$/.test(text)) continue;
                  if (/Technology|Ltd|Inc|Co\.|Network|Limited|Games|有限公司|科技|网络/i.test(text)) continue;
                  if (/^[A-Za-z\s,.()\-&]{15,}$/.test(text)) continue;
                  name = text;
                  break;
                }
              }
              
              if (!name && img.alt && img.alt.length >= 2 && img.alt.length <= 30 && !/[>＞]/.test(img.alt)) {
                name = img.alt.trim();
              }
            });

            // 第二遍：提取分类（只从「热门分类」列）
            if (categoryColIndex >= 0 && cells[categoryColIndex]) {
              const catCell = cells[categoryColIndex];
              
              // 核心方案：遍历叶子文本节点
              // 页面结构是 <span>大分类</span><img(箭头图标)/><span>小分类</span>
              const leafTexts = [];
              function collectLeafTexts(node) {
                for (const child of node.childNodes) {
                  if (child.nodeType === 3) { // 文本节点
                    const t = child.textContent.trim();
                    if (t && t.length >= 1) leafTexts.push(t);
                  } else if (child.nodeType === 1) { // 元素节点
                    // 跳过 img/svg（箭头图标）
                    const tag = child.tagName.toLowerCase();
                    if (tag === 'img' || tag === 'svg' || tag === 'i' || tag === 'icon') continue;
                    collectLeafTexts(child);
                  }
                }
              }
              collectLeafTexts(catCell);
              
              if (rowIdx < 3) {
                console.log('[Logo采集器] 第' + rowIdx + '行 分类叶子文本:', leafTexts,
                  'innerHTML前200:', catCell.innerHTML.substring(0, 200));
              }
              
              // 过滤出中文分类词（排除 > 符号、纯数字等）
              const catParts = leafTexts.filter(t => 
                /[\u4e00-\u9fff]/.test(t) && !/[>＞→›»]/.test(t) && t.length >= 1 && t.length <= 15
              );
              
              if (catParts.length >= 2) {
                pageCategory = catParts[0];
                pageSubcategory = catParts[1];
              } else if (catParts.length === 1) {
                // 可能文本连在一起（如"娱乐其他娱乐应用"），尝试按空格分
                const sp = catParts[0].split(/\s+/);
                if (sp.length >= 2) {
                  pageCategory = sp[0];
                  pageSubcategory = sp.slice(1).join('');
                }
              }
            }

            // 方法2：如果表头没找到列索引，遍历非图片单元格找「纯分类格式」的单元格
            if (!pageCategory) {
              cells.forEach((cell, idx) => {
                if (idx === imgCellIndex || pageCategory) return;
                const text = cell.textContent.trim();
                if (isCategoryCell(text)) {
                  const cat = extractCategory(text);
                  if (cat) {
                    pageCategory = cat.major;
                    pageSubcategory = cat.minor;
                  }
                }
              });
            }

            if (!name) {
              name = findNearbyName(img);
            }

            if (name) {
              const item = { imgEl: img, name, source: location.hostname };
              if (pageCategory) {
                item.pageCategory = pageCategory;
                item.pageSubcategory = pageSubcategory;
              }
              results.push(item);
            }
          });

          if (results.length > 0) {
            console.log('[Logo采集器] 表格扫描结果:', results.length, '个，有分类:', results.filter(r => r.pageCategory).length, '个');
            return results;
          }
        }

        // === 策略B：列表/卡片扫描（适配普通网页） ===
        const listItems = document.querySelectorAll(
          '.app-item, .app-card, .list-item, .card-item, [class*="app"], [class*="item"]'
        );
        if (listItems.length > 2) {
          listItems.forEach(item => {
            const img = item.querySelector('img');
            if (!img) return;
            const rect = img.getBoundingClientRect();
            if (rect.width < 20 || rect.height < 20 || rect.width > 200) return;

            const name = findNearbyName(img);
            if (!name) return;

            const entry = { imgEl: img, name, source: location.hostname };

            const allText = item.textContent;
            const cat = extractCategory(allText);
            if (cat) {
              entry.pageCategory = cat.major;
              entry.pageSubcategory = cat.minor;
            }

            results.push(entry);
          });

          if (results.length > 0) return results;
        }

        // === 策略C：全局图片扫描（兜底） ===
        const allImages = document.querySelectorAll('img');
        allImages.forEach(img => {
          const rect = img.getBoundingClientRect();
          if (rect.width < 30 || rect.height < 30 || rect.width > 300 || rect.height > 300) return;
          if (rect.width === 0 || rect.height === 0) return;
          const ratio = rect.width / rect.height;
          if (ratio < 0.7 || ratio > 1.4) return;

          const name = findNearbyName(img);
          if (name) {
            results.push({ imgEl: img, name, source: location.hostname });
          }
        });

        return results;
      }
    }
  };

  // 从图片元素附近的 DOM 中提取名称
  function findNearbyName(imgEl) {
    // 策略1：图片的 alt 属性
    if (imgEl.alt && imgEl.alt.length > 1 && imgEl.alt.length < 30) {
      return imgEl.alt.trim();
    }

    // 策略2：图片的 title 属性
    if (imgEl.title && imgEl.title.length > 1 && imgEl.title.length < 30) {
      return imgEl.title.trim();
    }

    // 策略3：父容器中的文本节点
    let parent = imgEl.parentElement;
    for (let i = 0; i < 3 && parent; i++) {
      // 查找相邻的文本元素
      const textEls = parent.querySelectorAll('span, p, h1, h2, h3, h4, h5, h6, a, div, label');
      for (const el of textEls) {
        if (el === imgEl || el.contains(imgEl)) continue;
        const text = el.textContent?.trim();
        if (text && text.length >= 2 && text.length <= 20 && !text.includes('\n')) {
          // 排除明显不是名称的文本
          if (/^[\d,.]+$/.test(text)) continue; // 纯数字
          if (/^(下载|安装|打开|更新|免费|广告|hot|new|top|#)$/i.test(text)) continue;
          return text;
        }
      }
      parent = parent.parentElement;
    }

    // 策略4：从 src 推断
    const src = imgEl.src || '';
    const match = src.match(/\/([^/]+?)(?:_logo|_icon|logo|icon)?\.(?:png|jpg|jpeg|webp|svg)/i);
    if (match && match[1].length > 2 && match[1].length < 30) {
      return match[1].replace(/[-_]/g, ' ');
    }

    return null;
  }

  // ========== 自动扫描 ==========
  async function autoScan() {
    showToast('🔍 正在扫描页面 Logo...');

    // 找到匹配的适配器
    let results = [];
    for (const [name, adapter] of Object.entries(siteAdapters)) {
      if (name === 'generic') continue;
      if (adapter.match()) {
        results = adapter.scan();
        if (results.length > 0) break;
      }
    }

    // 如果专用适配器没找到，用通用适配器
    if (results.length === 0) {
      results = siteAdapters.generic.scan();
    }

    if (results.length === 0) {
      showToast('❌ 未检测到 Logo，试试手动点选模式', 3000);
      return;
    }

    showToast(`✅ 检测到 ${results.length} 个 Logo，正在采集...`);

    // 转换为统一格式
    let successCount = 0;
    for (const item of results) {
      try {
        const imgSrc = item.imgEl.src || item.imgEl.currentSrc;
        if (!imgSrc) continue;

        const base64 = await imgUrlToBase64(imgSrc);
        const cat = matchCategory(item.name);
        const region = guessRegion(item.name);

        // 优先使用页面上提取到的分类，其次用映射表匹配
        const finalCategory = item.pageCategory || cat.major;
        const finalSubcategory = item.pageSubcategory || cat.minor;

        const logo = {
          name: cleanAppName(item.name) || item.name,
          src: base64,
          category: finalCategory,
          subcategory: finalSubcategory,
          region: region,
          domain: location.hostname,
          source: item.source || location.hostname,
          pageUrl: location.href,
          pageTitle: document.title
        };

        // 避免重复
        const exists = sessionLogos.some(l => l.name === logo.name);
        if (!exists) {
          sessionLogos.push(logo);
          item.imgEl.classList.add('logo-collector-collected');
          successCount++;
        }
      } catch (e) {
        console.warn('[Logo采集器] 图片转换失败:', e.message);
      }
    }

    // 发送到 background
    if (successCount > 0) {
      chrome.runtime.sendMessage({
        action: 'addLogos',
        data: { logos: sessionLogos }
      });
    }

    showToast(`✅ 成功采集 ${successCount} 个 Logo！`, 3000);
    updatePanel();
  }

  // ========== 手动点选模式 ==========
  let hoverTarget = null;

  function startPickMode() {
    isPicking = true;
    showToast('🎯 点选模式：将鼠标移到 Logo 上点击采集，按 ESC 退出');
    document.addEventListener('mousemove', onPickMouseMove, true);
    document.addEventListener('click', onPickClick, true);
    document.addEventListener('keydown', onPickKeyDown, true);
  }

  function stopPickMode() {
    isPicking = false;
    if (hoverTarget) {
      hoverTarget.classList.remove('logo-collector-highlight');
      hoverTarget = null;
    }
    document.removeEventListener('mousemove', onPickMouseMove, true);
    document.removeEventListener('click', onPickClick, true);
    document.removeEventListener('keydown', onPickKeyDown, true);
    showToast('已退出点选模式');
  }

  function onPickMouseMove(e) {
    // 忽略工具栏和面板区域
    if (e.target.closest('#logo-collector-toolbar') || e.target.closest('#logo-collector-panel')) return;

    const target = e.target.closest('img') || e.target;
    if (target === hoverTarget) return;

    if (hoverTarget) {
      hoverTarget.classList.remove('logo-collector-highlight');
    }

    if (target.tagName === 'IMG') {
      target.classList.add('logo-collector-highlight');
      hoverTarget = target;
    } else {
      hoverTarget = null;
    }
  }

  async function onPickClick(e) {
    // 忽略工具栏区域
    if (e.target.closest('#logo-collector-toolbar') || e.target.closest('#logo-collector-panel')) return;

    e.preventDefault();
    e.stopPropagation();

    const imgEl = e.target.closest('img');
    if (!imgEl) return;

    try {
      const imgSrc = imgEl.src || imgEl.currentSrc;
      if (!imgSrc) {
        showToast('❌ 无法获取图片地址');
        return;
      }

      const name = findNearbyName(imgEl) || prompt('请输入 App 名称:') || '未命名';
      const base64 = await imgUrlToBase64(imgSrc);
      const cat = matchCategory(name);
      const region = guessRegion(name);

      const logo = {
        name,
        src: base64,
        category: cat.major,
        subcategory: cat.minor,
        region,
        domain: location.hostname,
        source: location.hostname,
        pageUrl: location.href,
        pageTitle: document.title
      };

      const exists = sessionLogos.some(l => l.name === logo.name);
      if (!exists) {
        sessionLogos.push(logo);
        imgEl.classList.remove('logo-collector-highlight');
        imgEl.classList.add('logo-collector-collected');

        chrome.runtime.sendMessage({
          action: 'addLogos',
          data: { logos: [logo] }
        });

        showToast(`✅ 已采集: ${name}`);
        updatePanel();
      } else {
        showToast(`⚠️ 已存在: ${name}`);
      }
    } catch (err) {
      showToast('❌ 采集失败: ' + err.message, 3000);
    }
  }

  function onPickKeyDown(e) {
    if (e.key === 'Escape') {
      stopPickMode();
    }
  }

  // ========== 浮动工具栏 ==========
  function createToolbar() {
    if (toolbar) return;

    toolbar = document.createElement('div');
    toolbar.id = 'logo-collector-toolbar';
    toolbar.innerHTML = `
      <button class="logo-collector-btn-scan" title="自动扫描 Logo">🔍</button>
      <button class="logo-collector-btn-pick" title="手动点选 Logo">🎯</button>
    `;

    const [scanBtn, pickBtn] = toolbar.querySelectorAll('button');

    scanBtn.addEventListener('click', () => {
      autoScan();
    });

    pickBtn.addEventListener('click', () => {
      if (isPicking) {
        stopPickMode();
        pickBtn.classList.remove('logo-collector-btn-stop');
        pickBtn.classList.add('logo-collector-btn-pick');
        pickBtn.textContent = '🎯';
        pickBtn.title = '手动点选 Logo';
      } else {
        startPickMode();
        pickBtn.classList.remove('logo-collector-btn-pick');
        pickBtn.classList.add('logo-collector-btn-stop');
        pickBtn.textContent = '⏹';
        pickBtn.title = '停止点选';
      }
    });

    document.body.appendChild(toolbar);
  }

  // ========== 采集结果面板 ==========
  function createPanel() {
    if (panel) return;

    panel = document.createElement('div');
    panel.id = 'logo-collector-panel';
    panel.innerHTML = `
      <div class="logo-collector-panel-header">
        <span>已采集 <span id="lc-panel-count">0</span> 个 Logo</span>
        <span style="cursor:pointer;font-size:18px" id="lc-panel-close">✕</span>
      </div>
      <div class="logo-collector-panel-body" id="lc-panel-body"></div>
    `;

    panel.querySelector('#lc-panel-close').addEventListener('click', () => {
      panel.classList.remove('visible');
    });

    document.body.appendChild(panel);
  }

  function updatePanel() {
    if (!panel) createPanel();

    const countEl = panel.querySelector('#lc-panel-count');
    const bodyEl = panel.querySelector('#lc-panel-body');

    countEl.textContent = sessionLogos.length;

    if (sessionLogos.length === 0) {
      bodyEl.innerHTML = '<div style="text-align:center;padding:20px;color:#999;font-size:13px">暂未采集到 Logo</div>';
    } else {
      bodyEl.innerHTML = sessionLogos.map((logo, idx) => `
        <div class="logo-collector-panel-item" data-idx="${idx}">
          <img src="${logo.src}" alt="${logo.name}">
          <div class="logo-collector-panel-item-info">
            <div class="logo-collector-panel-item-name">${logo.name}</div>
            <div class="logo-collector-panel-item-cat">${logo.category ? logo.category + (logo.subcategory ? ' > ' + logo.subcategory : '') : '未分类'}</div>
          </div>
          <button class="logo-collector-panel-item-remove" data-idx="${idx}" title="移除">✕</button>
        </div>
      `).join('');

      // 绑定移除按钮
      bodyEl.querySelectorAll('.logo-collector-panel-item-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const idx = parseInt(btn.dataset.idx);
          sessionLogos.splice(idx, 1);
          updatePanel();
        });
      });
    }

    panel.classList.add('visible');
  }

  // ========== 消息监听（来自 Popup） ==========
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
      case 'startScan':
        createToolbar();
        autoScan();
        sendResponse({ success: true });
        break;

      case 'startPick':
        createToolbar();
        if (!isPicking) {
          startPickMode();
        }
        sendResponse({ success: true });
        break;

      case 'stopPick':
        if (isPicking) {
          stopPickMode();
        }
        sendResponse({ success: true });
        break;

      case 'getSessionLogos':
        sendResponse({ logos: sessionLogos });
        break;

      case 'showToolbar':
        createToolbar();
        sendResponse({ success: true });
        break;
    }
    return true;
  });

  // 页面加载后自动创建工具栏（可以通过设置控制是否自动显示）
  // 默认不自动显示，等用户从 Popup 触发
})();
