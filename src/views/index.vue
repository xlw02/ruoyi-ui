<template>
  <div class="welcome-container">
    <!-- 动态粒子背景 (Canvas) -->
    <canvas ref="canvasRef" class="particles-canvas"></canvas>

    <!-- 主内容区 -->
    <div class="welcome-content">
      <!-- 品牌区（带科技感徽章） -->
      <div class="brand">
        <div class="logo-wrapper">
          <div class="logo-glow"></div>
          <!-- 替换后的自定义图片 logo -->
          <img :src="logoUrl" alt="Logo" class="custom-logo" />
        </div>
        <h1 class="brand-name">EleWord</h1>
        <div class="slogan">
          <span class="ai-tag">AI ENGINE</span>
          <span class="slogan-text">AI 驱动决策 · EleWord智联未来</span>
        </div>
      </div>

      <!-- 卡片：日期 + 天气（增强玻璃态与光泽） -->
      <div class="glass-panel info-card">
        <div class="datetime-section">
          <div class="date">{{ currentDate }}</div>
          <div class="time">{{ currentTime }}</div>
          <div class="greeting">{{ greeting }}</div>
        </div>
        <div class="info-divider"></div>
        <div class="weather-section" v-if="weatherData">
          <div class="weather-icon">{{ weatherIcon }}</div>
          <div class="weather-temp">{{ weatherData.temperature }}°C</div>
          <div class="weather-desc">{{ weatherDesc }}</div>
          <div class="weather-location">
            <el-icon><Location /></el-icon> {{ weatherData.location }}
          </div>
        </div>
        <div class="weather-section" v-else>
          <el-skeleton :rows="3" animated />
        </div>
      </div>

      <!-- 简短介绍 + 科技特性 -->
      <div class="intro-text">
        <p>以 AI 为核心的智能决策中枢，融合实时数据分析与机器学习预测，让每一个业务决策都精准高效。</p>
        <div class="tech-badges">
          <div class="badge"><el-icon><TrendCharts /></el-icon> 实时数据分析</div>
          <div class="badge"><el-icon><Monitor /></el-icon> 边缘计算</div>
          <div class="badge"><el-icon><Connection /></el-icon> 全流程可观测</div>
        </div>
      </div>

      <!-- 底部信息栏：开源地址、联系方式、作者 (科技感网格分割) -->
      <div class="footer-info">
        <div class="info-grid">
          <div class="info-block">
            <div class="block-title"><el-icon><Share /></el-icon> 开源地址</div>
            <div class="block-links">
              <a href="https://github.com" target="_blank">GitHub</a>
              <a href="https://gitee.com" target="_blank">Gitee</a>
            </div>
          </div>
          <div class="info-block">
            <div class="block-title"><el-icon><ChatDotRound /></el-icon> 联系方式</div>
            <div class="contact-items">
              <span>QQ: 2917215433</span>
              <!-- <span>微信: EleWay_AI</span> -->
              <span>邮箱: xianglw2002@163.com</span>
            </div>
          </div>
          <div class="info-block">
            <div class="block-title"><el-icon><UserFilled /></el-icon> 作者信息</div>
            <div class="author-info">
              <span>EleWay · Royi框架支持</span>
              <span>© 2026 开源 · 持续迭代</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Location, TrendCharts, Monitor, Connection, Share, ChatDotRound, UserFilled } from '@element-plus/icons-vue'
// import myLogo from '@/assets/logo.png'
// ---------- 自定义 Logo 图片路径（请根据实际路径修改）----------
// 方案1：将图片放在 public 目录下，例如 public/my-logo.png，然后直接使用 '/my-logo.png'
// 方案2：放在 assets 目录，使用 import 导入，例如 import myLogo from '@/assets/logo.png'
// 这里演示方案1（最简单，无需额外配置）
const logoUrl = ref('src\\assets\\logo\\logoblack.png')  // 👈 请替换为你自己的图片路径

// ---------- 日期时间逻辑 ----------
const currentDate = ref('')
const currentTime = ref('')
const greeting = ref('')
let timer = null

const updateDateTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekday = weekdays[now.getDay()]
  currentDate.value = `${year}.${month}.${day} ${weekday}`

  const hours = now.getHours()
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  currentTime.value = `${String(hours).padStart(2, '0')}:${minutes}:${seconds}`

  if (hours >= 5 && hours < 12) greeting.value = '🌤️ 早安，AI 引擎已启动'
  else if (hours >= 12 && hours < 18) greeting.value = '☕ 午后，数据流活跃'
  else if (hours >= 18 && hours < 22) greeting.value = '🌙 晚间，智能模型持续优化'
  else greeting.value = '✨ 夜深，神经网络训练中'
}

// ---------- 天气 API (Open-Meteo) ----------
const weatherData = ref(null)

const getWeatherDescription = (code) => {
  const map = { 0: '晴', 1: '晴', 2: '多云', 3: '阴', 45: '雾', 48: '雾', 51: '细雨', 61: '小雨', 63: '中雨', 65: '大雨', 71: '小雪', 73: '中雪', 75: '大雪', 95: '雷暴' }
  return map[code] || '未知'
}
const getWeatherIcon = (code) => {
  if (code === 0) return '☀️'
  if (code === 1) return '🌤️'
  if (code === 2) return '⛅'
  if (code === 3) return '☁️'
  if ([45,48].includes(code)) return '🌫️'
  if ([51,61,63,65].includes(code)) return '🌧️'
  if ([71,73,75].includes(code)) return '❄️'
  if (code === 95) return '⛈️'
  return '🌡️'
}

const fetchWeather = async () => {
  try {
    const lat = 30.49, lon = 119.41
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=Asia/Shanghai`
    const res = await fetch(url)
    const data = await res.json()
    if (data?.current_weather) {
      const code = data.current_weather.weathercode
      weatherData.value = {
        temperature: Math.round(data.current_weather.temperature),
        description: getWeatherDescription(code),
        icon: getWeatherIcon(code),
        location: '安吉 · 中国'
      }
    } else throw new Error()
  } catch {
    weatherData.value = { temperature: '--', description: '获取失败', icon: '🌐', location: '网络受限' }
  }
}

const weatherIcon = computed(() => weatherData.value?.icon || '🌡️')
const weatherDesc = computed(() => weatherData.value?.description || '加载中...')

// ---------- 粒子背景动画 (Canvas) 适配白色主题 ----------
const canvasRef = ref(null)
let animationId = null
let particles = []

class Particle {
  constructor(width, height) {
    this.x = Math.random() * width
    this.y = Math.random() * height
    this.vx = (Math.random() - 0.5) * 0.6
    this.vy = (Math.random() - 0.5) * 0.6
    this.size = Math.random() * 2.5 + 0.8
    // 白色背景下的粒子颜色：深蓝灰，透明度较低
    this.alpha = Math.random() * 0.25 + 0.08
  }
  update(width, height) {
    this.x += this.vx
    this.y += this.vy
    if (this.x < 0) this.x = width
    if (this.x > width) this.x = 0
    if (this.y < 0) this.y = height
    if (this.y > height) this.y = 0
  }
  draw(ctx) {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(40, 60, 120, ${this.alpha})`
    ctx.fill()
  }
}

const initParticles = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  const width = window.innerWidth
  const height = window.innerHeight
  canvas.width = width
  canvas.height = height
  particles = []
  const particleCount = Math.min(120, Math.floor(width * height / 7000))
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle(width, height))
  }
}

const animateParticles = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const width = window.innerWidth
  const height = window.innerHeight
  ctx.clearRect(0, 0, width, height)
  particles.forEach(p => {
    p.update(width, height)
    p.draw(ctx)
  })
  animationId = requestAnimationFrame(animateParticles)
}

const handleResize = () => {
  const canvas = canvasRef.value
  if (canvas) {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    initParticles()
  }
}

onMounted(() => {
  updateDateTime()
  timer = setInterval(updateDateTime, 1000)
  fetchWeather()
  setInterval(fetchWeather, 30 * 60 * 1000)

  initParticles()
  animateParticles()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  clearInterval(timer)
  if (animationId) cancelAnimationFrame(animationId)
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
.welcome-container {
  position: relative;
  min-height: calc(100vh - 84px);
  width: 100%;
  overflow: hidden;
  background: linear-gradient(145deg, #f5f9ff 0%, #eef2f8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
}

.particles-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  opacity: 0.7;
}

.welcome-content {
  position: relative;
  z-index: 2;
  max-width: 1300px;
  width: 88%;
  margin: 0 auto;
  padding: 32px;
}

// 品牌区（浅色主题）
.brand {
  text-align: center;
  margin-bottom: 48px;
  .logo-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100px;
    height: 100px;
    background: rgba(255,255,255,0.7);
    backdrop-filter: blur(8px);
    border-radius: 40px;
    box-shadow: 0 8px 20px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8);
    margin-bottom: 24px;
    .logo-glow {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 40px;
      background: radial-gradient(circle at 30% 20%, rgba(3, 31, 70, 0.15), transparent);
      filter: blur(8px);
      pointer-events: none;
    }
    .custom-logo {
      width: 56px;
      height: auto;
      max-height: 56px;
      object-fit: contain;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
      transition: transform 0.2s ease;
      z-index: 1;
      &:hover {
        transform: scale(1.02);
      }
    }
  }
  .brand-name {
    font-size: 64px;
    font-weight: 800;
    margin: 0 0 12px;
    background: linear-gradient(135deg, #1e3c72, #2b4c7c);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    letter-spacing: 2px;
    text-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }
  .slogan {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    .ai-tag {
      background: rgba(30, 100, 200, 0.1);
      border: 1px solid #2b6ed7;
      border-radius: 40px;
      padding: 2px 12px;
      font-size: 12px;
      font-weight: 600;
      color: #1a5bbf;
      letter-spacing: 1px;
    }
    .slogan-text {
      font-size: 16px;
      color: #4a627a;
    }
  }
}

// 玻璃面板卡片（白色半透明）
.glass-panel {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px);
  border-radius: 48px;
  border: 1px solid rgba(30, 100, 200, 0.2);
  box-shadow: 0 20px 35px -12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255,255,255,0.9);
}

.info-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  flex-wrap: wrap;
  padding: 28px 48px;
  margin-bottom: 48px;

  .datetime-section {
    flex: 2;
    text-align: left;
    .date {
      font-size: 18px;
      font-weight: 500;
      color: #3a6ea5;
      letter-spacing: 1px;
      margin-bottom: 12px;
    }
    .time {
      font-size: 72px;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
      background: linear-gradient(120deg, #1f3b64, #2b6ed7);
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      line-height: 1;
      margin-bottom: 12px;
      letter-spacing: 4px;
    }
    .greeting {
      font-size: 16px;
      color: #5b7ea4;
    }
  }
  .info-divider {
    width: 1px;
    height: 80px;
    background: linear-gradient(to bottom, transparent, #9bb5d4, transparent);
  }
  .weather-section {
    flex: 1;
    text-align: center;
    .weather-icon { font-size: 56px; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.1)); margin-bottom: 8px; }
    .weather-temp { font-size: 42px; font-weight: 700; color: #1f3b64; }
    .weather-desc { font-size: 14px; color: #5b7ea4; margin: 6px 0; }
    .weather-location { font-size: 13px; color: #6f8db0; display: flex; align-items: center; justify-content: center; gap: 4px; }
  }
}

.intro-text {
  text-align: center;
  max-width: 700px;
  margin: 0 auto 48px;
  p {
    font-size: 17px;
    line-height: 1.5;
    color: #3b5a7c;
    margin-bottom: 28px;
  }
  .tech-badges {
    display: flex;
    justify-content: center;
    gap: 24px;
    flex-wrap: wrap;
    .badge {
      background: rgba(30, 100, 200, 0.08);
      border: 1px solid rgba(30, 100, 200, 0.3);
      backdrop-filter: blur(4px);
      padding: 8px 24px;
      border-radius: 60px;
      font-size: 14px;
      font-weight: 500;
      color: #2b6ed7;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
      &:hover {
        background: rgba(30, 100, 200, 0.18);
        transform: translateY(-2px);
        box-shadow: 0 5px 12px rgba(0,0,0,0.08);
      }
    }
  }
}

// 底部信息网格（浅色玻璃）
.footer-info {
  margin-top: 20px;
  .info-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 24px;
    background: rgba(255, 255, 255, 0.65);
    backdrop-filter: blur(12px);
    border-radius: 32px;
    padding: 24px 36px;
    border: 1px solid rgba(30, 100, 200, 0.2);
    .info-block {
      flex: 1;
      min-width: 180px;
      .block-title {
        font-size: 15px;
        font-weight: 600;
        color: #2b6ed7;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .block-links a, .contact-items span, .author-info span {
        display: block;
        color: #4b6f93;
        font-size: 13px;
        margin-bottom: 8px;
        text-decoration: none;
        transition: color 0.2s;
      }
      .block-links a:hover {
        color: #1a5bbf;
      }
      .contact-items span {
        display: inline-block;
        margin-right: 20px;
        margin-bottom: 6px;
      }
      .author-info span {
        display: block;
      }
    }
  }
}

@media (max-width: 860px) {
  .info-card {
    flex-direction: column;
    text-align: center;
    padding: 28px 24px;
    .datetime-section { text-align: center; }
    .info-divider { width: 80%; height: 1px; }
  }
  .brand .brand-name { font-size: 48px; }
  .footer-info .info-grid { flex-direction: column; text-align: center; }
  .block-title { justify-content: center; }
}
</style>