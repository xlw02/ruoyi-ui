<template>
  <div class="home">
    <!-- 顶部欢迎栏 -->
    <header class="hero">
      <div class="hero-left">
        <img v-if="logoUrl" :src="logoUrl" alt="logo" class="hero-logo" />
        <div>
          <h1 class="hero-title">{{ title }}</h1>
          <p class="hero-sub">{{ greeting }}，{{ currentDate }}</p>
        </div>
      </div>
      <div class="hero-right">
        <div class="clock">{{ currentTime }}</div>
      </div>
    </header>

    <!-- 天气 + 快捷入口 -->
    <section class="main-grid">
      <!-- 天气卡片 -->
      <div class="card weather-card">
        <div class="card-label">实时天气</div>
        <template v-if="weatherData">
          <div class="weather-main">
            <span class="weather-icon">{{ weatherIcon }}</span>
            <span class="weather-temp">{{ weatherData.temperature }}°</span>
          </div>
          <div class="weather-info">
            <span>{{ weatherDesc }}</span>
            <span class="weather-loc">{{ weatherData.location }}</span>
          </div>
        </template>
        <el-skeleton v-else :rows="2" animated />
      </div>

      <!-- 快捷入口 -->
      <div class="card shortcuts-card">
        <div class="card-label">快捷入口</div>
        <div class="shortcuts-grid">
          <a
            v-for="s in shortcuts"
            :key="s.name"
            :href="s.url"
            target="_blank"
            class="shortcut-item"
          >
            <span class="shortcut-icon">{{ s.icon }}</span>
            <span class="shortcut-name">{{ s.name }}</span>
          </a>
        </div>
      </div>
    </section>

    <!-- 公告 / 滚动消息 -->
    <section class="card notice-card" v-if="notices.length">
      <div class="card-label">公告</div>
      <div class="notice-list">
        <div v-for="(n, i) in notices" :key="i" class="notice-item">
          <span class="notice-dot"></span>
          <span class="notice-text">{{ n }}</span>
        </div>
      </div>
    </section>

    <!-- 项目 / 系统卡片 -->
    <section class="card systems-card">
      <div class="card-header-row">
        <div class="card-label">业务系统</div>
        <input
          v-model="searchTerm"
          type="text"
          placeholder="搜索..."
          class="sys-search"
        />
      </div>
      <div class="systems-grid">
        <div
          v-for="item in filteredSystems"
          :key="item.name"
          class="sys-item"
          @click="openLink(item.url)"
        >
          <span class="sys-icon">{{ item.icon }}</span>
          <div class="sys-info">
            <div class="sys-name">{{ item.name }}</div>
            <div class="sys-desc">{{ item.desc }}</div>
          </div>
          <span class="sys-arrow">→</span>
        </div>
      </div>
    </section>

    <!-- 底部 -->
    <footer class="home-footer">
      <span>© {{ new Date().getFullYear() }} {{ title }}</span>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// ============================================================
// 📌 配置区 —— 所有可改内容集中在这里
// ============================================================

// Logo
import logoImage from '@/assets/logo/logoblack.png'
const logoUrl = ref(logoImage)

// 系统名称
const title = import.meta.env.VITE_APP_TITLE

// 快捷入口
const shortcuts = ref([
  { name: 'OA系统',   icon: '🏠', url: 'https://oa.chaoyang.com' },
  { name: 'AI助手',   icon: '🤖', url: 'https://agent.dingtalk.com/copilot?code=VlMczAyHj4&channel' },
  { name: 'MES系统',  icon: '⚙️', url: 'http://10.4.10.120:8080/' },
  { name: 'ERP系统',  icon: '💼', url: 'http://10.1.10.196:9080/zcerp/mainframe.action' },
  { name: 'BI平台',   icon: '📈', url: 'http://10.4.10.36:37799/webroot/decision' },
  { name: '知识库',   icon: '📚', url: 'http://10.4.40.250/upload.html' }
])

// 公告（留空则不显示公告栏）
const notices = ref([
  'EleWord已正式进入测试阶段，如有问题联系管理员'
])

// 业务系统列表
const systems = ref([
  { name: 'OA系统',          desc: '泛微协同办公平台',                   icon: '🏠', url: 'https://oa.chaoyang.com' },
  { name: 'AI助手',          desc: '四分厂数据AI助手',                   icon: '🤖', url: 'https://agent.dingtalk.com/copilot?code=VlMczAyHj4&channel' },
  { name: '安吉数据决策系统', desc: '如需账号密码请联系钉钉',             icon: '📊', url: 'http://10.4.10.35:8075/webroot/decision/login?origin=4cbe45ab-fbdb-4c45-93fb-68e45d4f3eef' },
  { name: '共享文件中心',    desc: 'win+r 输入 \\\\10.4.27.250',        icon: '📁', url: 'http://10.4.40.250:8080' },
  { name: '资源中心',        desc: '访问密码请联系管理员',                icon: '💾', url: 'http://10.4.40.250:8081' },
  { name: '监控摄像',        desc: '摄像监控查看',                       icon: '📹', url: 'https://10.4.180.1/' },
  { name: '四分厂MES',       desc: '查看设备状态',                       icon: '⚙️', url: 'http://10.4.10.120:8080/' },
  { name: '胶料MES',         desc: '中策安吉准备分厂胶料系统',            icon: '📦', url: 'http://10.4.10.59:8088/login?redirect=%2Findex' },
  { name: 'BI平台',          desc: '企业数据分析和可视化',                icon: '📈', url: 'http://10.4.10.36:37799/webroot/decision' },
  { name: 'ERP系统',         desc: '基础ERP系统',                       icon: '💼', url: 'http://10.1.10.196:9080/zcerp/mainframe.action' },
  { name: '集采系统',        desc: '基础采购系统',                       icon: '🛒', url: 'http://122.224.74.44:8280/oauth/' },
  { name: '仓储WMS',         desc: '仓储系统日常使用',                   icon: '📦', url: 'http://10.4.10.57:1401/' },
  { name: '远程软件注册',    desc: '自行搭建的远程软件',                  icon: '🖥️', url: 'http://10.4.40.250:21114/' },
  { name: '模具WMS',         desc: '模具系统管理',                       icon: '🔧', url: 'http://10.4.10.109:1401/' },
  { name: '知识库',          desc: '内部文档知识库',                     icon: '📚', url: 'http://10.4.40.250/upload.html' },
  { name: '培训平台',        desc: '在线培训学习',                       icon: '🎬', url: 'https://training.company.com/' }
])

// ============================================================
// 以下逻辑一般不需要改
// ============================================================

// 日期时间
const currentDate = ref('')
const currentTime = ref('')
const greeting = ref('')
let timer = null

const updateDateTime = () => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const wk = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  currentDate.value = `${y}.${m}.${d} ${wk[now.getDay()]}`
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const ss = String(now.getSeconds()).padStart(2, '0')
  currentTime.value = `${hh}:${mm}:${ss}`
  const h = now.getHours()
  if (h >= 5 && h < 12) greeting.value = '早上好'
  else if (h >= 12 && h < 14) greeting.value = '中午好'
  else if (h >= 14 && h < 18) greeting.value = '下午好'
  else if (h >= 18 && h < 22) greeting.value = '晚上好'
  else greeting.value = '夜深了'
}

// 天气
const weatherData = ref(null)
const weatherCodeMap = {
  0: { desc: '晴', icon: '☀️' }, 1: { desc: '晴', icon: '☀️' },
  2: { desc: '多云', icon: '⛅' }, 3: { desc: '阴', icon: '☁️' },
  45: { desc: '雾', icon: '🌫️' }, 48: { desc: '雾', icon: '🌫️' },
  51: { desc: '毛毛雨', icon: '🌧️' }, 53: { desc: '毛毛雨', icon: '🌧️' }, 55: { desc: '毛毛雨', icon: '🌧️' },
  61: { desc: '小雨', icon: '🌧️' }, 63: { desc: '中雨', icon: '🌧️' }, 65: { desc: '大雨', icon: '🌧️' },
  71: { desc: '小雪', icon: '❄️' }, 73: { desc: '中雪', icon: '❄️' }, 75: { desc: '大雪', icon: '❄️' },
  80: { desc: '阵雨', icon: '🌦️' }, 81: { desc: '阵雨', icon: '🌦️' }, 82: { desc: '阵雨', icon: '🌦️' },
  95: { desc: '雷暴', icon: '⛈️' }
}

let weatherTimer = null

const fetchWeather = async () => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 5000)
  try {
    const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=30.49&longitude=119.41&current_weather=true&timezone=Asia/Shanghai', { signal: controller.signal })
    clearTimeout(timeoutId)
    const data = await res.json()
    if (data?.current_weather) {
      const code = data.current_weather.weathercode
      const mapped = weatherCodeMap[code] || { desc: '未知', icon: '🌡️' }
      weatherData.value = {
        temperature: Math.round(data.current_weather.temperature),
        description: mapped.desc, icon: mapped.icon, location: '中策橡胶（安吉）有限公司'
      }
    } else throw new Error()
  } catch {
    clearTimeout(timeoutId)
    weatherData.value = { temperature: '--', description: '获取失败', icon: '🌐', location: '网络受限' }
  }
}

const weatherIcon = computed(() => weatherData.value?.icon || '🌡️')
const weatherDesc = computed(() => weatherData.value?.description || '加载中...')

// 搜索
const searchTerm = ref('')
const filteredSystems = computed(() => {
  if (!searchTerm.value.trim()) return systems.value
  const t = searchTerm.value.toLowerCase().trim()
  return systems.value.filter(s => s.name.toLowerCase().includes(t) || s.desc.toLowerCase().includes(t))
})

const openLink = (url) => window.open(url, '_blank')

onMounted(() => {
  updateDateTime()
  timer = setInterval(updateDateTime, 1000)
  fetchWeather()
  weatherTimer = setInterval(fetchWeather, 30 * 60 * 1000)
})

onUnmounted(() => {
  clearInterval(timer)
  clearInterval(weatherTimer)
})
</script>

<style lang="scss" scoped>
$bg: #fff;
$card-bg: #fff;
$border: #e5e7eb;
$text: #1f2937;
$text2: #6b7280;
$text3: #9ca3af;
$accent: #2563eb;
$radius: 14px;

.home {
  width: 100%;
  height: 100%;
  min-height: 0;
  background: $bg;
  overflow-y: auto;
  padding: 28px 36px 48px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  color: $text;
}

/* ===== 顶部 ===== */
.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.hero-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.hero-logo {
  width: 44px;
  height: 44px;
  object-fit: contain;
  border-radius: 12px;
}

.hero-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
  color: $text;
}

.hero-sub {
  font-size: 14px;
  color: $text2;
  margin: 2px 0 0;
}

.clock {
  font-size: 36px;
  font-weight: 600;
  font-family: 'JetBrains Mono', 'SF Mono', 'Menlo', monospace;
  color: $text;
  letter-spacing: 2px;
}

/* ===== 通用卡片 ===== */
.card {
  background: $card-bg;
  border: 1px solid $border;
  border-radius: $radius;
  padding: 20px 24px;
  margin-bottom: 16px;
}

.card-label {
  font-size: 13px;
  font-weight: 600;
  color: $text3;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 14px;
}

.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;

  .card-label {
    margin-bottom: 0;
  }
}

/* ===== 天气 + 快捷入口 ===== */
.main-grid {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.weather-card {
  display: flex;
  flex-direction: column;
}

.weather-main {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.weather-icon {
  font-size: 40px;
}

.weather-temp {
  font-size: 40px;
  font-weight: 700;
  color: $text;
}

.weather-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 14px;
  color: $text2;
}

.weather-loc {
  font-size: 12px;
  color: $text3;
}

.shortcuts-card {
  display: flex;
  flex-direction: column;
}

.shortcuts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
}

.shortcut-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 8px;
  background: #f9fafb;
  border: 1px solid transparent;
  border-radius: 12px;
  text-decoration: none;
  color: $text;
  transition: all 0.15s;
  cursor: pointer;

  &:hover {
    background: #fff;
    border-color: $border;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }
}

.shortcut-icon {
  font-size: 24px;
}

.shortcut-name {
  font-size: 12px;
  font-weight: 500;
  color: $text2;
  white-space: nowrap;
}

/* ===== 公告 ===== */
.notice-card {
  padding: 16px 24px;
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notice-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: $text2;
}

.notice-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: $accent;
  flex-shrink: 0;
}

/* ===== 业务系统 ===== */
.sys-search {
  padding: 7px 14px;
  border: 1px solid $border;
  border-radius: 8px;
  font-size: 13px;
  background: #f9fafb;
  width: 200px;
  transition: all 0.15s;
  font-family: inherit;
  color: $text;

  &:focus {
    outline: none;
    border-color: $accent;
    background: #fff;
  }

  &::placeholder {
    color: $text3;
  }
}

.systems-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 10px;
}

.sys-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #f9fafb;
  border: 1px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: #fff;
    border-color: $border;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

    .sys-arrow {
      opacity: 1;
      color: $accent;
    }
  }
}

.sys-icon {
  font-size: 20px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 10px;
  flex-shrink: 0;
}

.sys-info {
  flex: 1;
  min-width: 0;
}

.sys-name {
  font-size: 14px;
  font-weight: 600;
  color: $text;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sys-desc {
  font-size: 12px;
  color: $text3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}

.sys-arrow {
  font-size: 16px;
  color: #ccc;
  flex-shrink: 0;
  transition: all 0.15s;
  opacity: 0;
}

/* ===== 底部 ===== */
.home-footer {
  text-align: center;
  padding-top: 32px;
  font-size: 12px;
  color: $text3;
}

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .home {
    padding: 16px;
  }

  .hero {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .clock {
    font-size: 28px;
  }

  .main-grid {
    grid-template-columns: 1fr;
  }

  .systems-grid {
    grid-template-columns: 1fr;
  }

  .sys-search {
    width: 140px;
  }
}
</style>
