<template>
  <div class="welcome-container">
    <!-- 动态粒子背景 + 连线效果 (Canvas) -->
    <canvas ref="canvasRef" class="particles-canvas"></canvas>

    <!-- 科技感装饰：旋转光环 & 悬浮光点 -->
    <div class="tech-ornaments">
      <div class="orb-glow orb-1"></div>
      <div class="orb-glow orb-2"></div>
      <div class="scan-line"></div>
    </div>

    <!-- 主内容区 -->
    <div class="welcome-content">
      <!-- 品牌区（带科技感徽章 + 旋转环） -->
      <div class="brand">
        <div class="logo-wrapper">
          <div class="logo-glow"></div>
          <!-- 替换后的自定义图片 logo -->
          <img :src="logoUrl" alt="Logo" class="custom-logo" />
          <div class="tech-ring"></div>
        </div>
        <h1 class="brand-name">EleWord</h1>
        <div class="slogan">
          <span class="ai-tag">AI ENGINE</span>
          <span class="slogan-text">AI 驱动决策 · EleWord智联未来</span>
          <span class="blink-dot"></span>
        </div>
      </div>

      <!-- 卡片：日期 + 天气（增强玻璃态、科技边框与内部光晕） -->
      <div class="glass-panel info-card">
        <div class="datetime-section">
          <div class="date">{{ currentDate }}</div>
          <div class="time">{{ currentTime }}</div>
          <div class="greeting">{{ greeting }}</div>
          <div class="ai-badge">实时预测中</div>
        </div>
        <div class="info-divider"></div>
        <div class="weather-section" v-if="weatherData">
          <div class="weather-icon">{{ weatherIcon }}</div>
          <div class="weather-temp">{{ weatherData.temperature }}°C</div>
          <div class="weather-desc">{{ weatherDesc }}</div>
          <div class="weather-location">
            <el-icon><Location /></el-icon> {{ weatherData.location }}
          </div>
          <div class="weather-metric">湿度动态阈值 · 实时校准</div>
        </div>
        <div class="weather-section" v-else>
          <el-skeleton :rows="3" animated />
        </div>
      </div>

      <!-- 简短介绍 + 科技特性（炫光悬停效果） -->
      <div class="intro-text">
        <p>以 AI 为核心的智能决策中枢，融合实时数据分析与机器学习预测，让每一个业务决策都精准高效。</p>
        <div class="tech-badges">
          <div class="badge"><el-icon><TrendCharts /></el-icon> 流式分析引擎</div>
          <div class="badge"><el-icon><Monitor /></el-icon> 边缘推理节点</div>
          <div class="badge"><el-icon><Connection /></el-icon> 全链路可观测</div>
        </div>
      </div>

      <!-- 底部信息栏：科技网格风格 + 状态指示器 -->
      <div class="footer-info">
        <div class="info-grid">
          <div class="info-block">
            <div class="block-title"><span class="led-green"></span><el-icon><Share /></el-icon> 开源镜像</div>
            <div class="block-links">
              <a href="https://github.com" target="_blank">GitHub <span class="arrow">↗</span></a>
              <a href="https://gitee.com" target="_blank">Gitee <span class="arrow">↗</span></a>
            </div>
          </div>
          <div class="info-block">
            <div class="block-title"><span class="led-blue"></span><el-icon><ChatDotRound /></el-icon> 技术通道</div>
            <div class="contact-items">
              <span>QQ: 2917215433</span>
              <span>邮箱: xianglw2002@163.com</span>
            </div>
          </div>
          <div class="info-block">
            <div class="block-title"><span class="led-cyan"></span><el-icon><UserFilled /></el-icon> 迭代核心</div>
            <div class="author-info">
              <span>EleWay · Royi 框架</span>
              <span>© 2026 开源 · 持续进化</span>
            </div>
          </div>
        </div>
        <!-- 底部系统状态栏 -->
        <div class="system-status">
          <div class="status-item"><span class="pulse"></span> AI 核心: 在线</div>
          <div class="status-item"><span class="pulse"></span> 数据流: 实时同步</div>
          <div class="status-item"><span class="pulse"></span> 模型版本: v2.6.0</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Location, TrendCharts, Monitor, Connection, Share, ChatDotRound, UserFilled } from '@element-plus/icons-vue'

// ---------- 自定义 Logo 图片路径 ----------
const logoUrl = ref('src\\assets\\logo\\logoblack.png')  // 👈 请替换为你自己的图片路径

// ---------- 日期时间逻辑 ----------
const currentDate = ref('')
const currentTime = ref('')
const greeting = ref('')
let timer = null

// 在函数外部（或更高作用域）记录上一次的小时
let lastHour = -1

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

  // ----- 问候语：仅在小时变化时更新 -----
  if (hours !== lastHour) {
    lastHour = hours

    if (hours >= 5 && hours < 12) {
      const morningGreetings = [
        '🌤️ 早安，AI 引擎已启动',
        '☀️ 清晨，数据流已预热',
        '🚀 新的一天，推理加速中',
        '⚙️ 早安，注意力机制唤醒',
        '📈 早安，指标爬坡，模型就绪',
        '🧠 早安，神经元兴奋连接',
        '💡 清晨，创意模型注入',
        '📡 清晨，分布式节点同步',
        '☕ 清晨，早高峰，请求涌入',
        '⚡ 清晨，特征工程就绪',
        '🌅 破晓，梯度下降开始',
        '📊 新的一天，监控面板点亮',
        '🤖 新的一天，深度网络热身',
        '🎯 新的一天，召回率正在爬升',
        '⏰ 新的一天，时序预测启动'
      ]
      greeting.value = morningGreetings[Math.floor(Math.random() * morningGreetings.length)]
    } 
    else if (hours >= 12 && hours < 18) {
      const afternoonGreetings = [
        '☕ 午后，数据流活跃',
        '⚡ 午后，峰值处理，吞吐飙升',
        '🌞 午后，嵌入向量对齐',
        '📊 午后，报表生成，准确率稳定',
        '🔍 午后，注意力聚焦，复杂查询',
        '🍜 午间，损失函数收敛',
        '📈 午后，AUC曲线爬升',
        '🔄 午后，反向传播迭代',
        '💾 下午，模型参数微调',
        '🔁 下午，增量学习进行中',
        '📦 下午，特征打包完毕',
        '🌆 下午，黄昏预热，第二波高峰',
        '🎯 下午，精准度验证通过',
        '⚙️ 下午，动态Batch处理',
        '📉 午后，过拟合风险低'
      ]
      greeting.value = afternoonGreetings[Math.floor(Math.random() * afternoonGreetings.length)]
    } 
    else if (hours >= 18 && hours < 22) {
      const eveningGreetings = [
        '🌙 晚间，智能模型持续优化',
        '🌆 黄昏，日志归档中',
        '✨ 夜间模式，增量学习',
        '🌌 黄昏，嵌入空间漫游',
        '🦉 黄昏，无监督自由探索',
        '📡 晚间，数据疏散有序',
        '🌟 晚间，生成模型试跑',
        '💤 晚间，权重缓慢更新'
      ]
      greeting.value = eveningGreetings[Math.floor(Math.random() * eveningGreetings.length)]
    } 
    else {
      const nightGreetings = [
        '✨ 夜深，神经网络训练中',
        '🌌 凌晨，梯度反向传播',
        '💤 深夜，参数微调',
        '🌙 深夜，神经元做梦',
        '🌠 深夜，损失函数低语',
        '🦉 深夜，聚类夜空漫步',
        '🧠 深夜，脑波数据清洗',
        '🔮 深夜，隐藏层飘过梦呓',
        '🌫️ 深夜，模型静默进化'
      ]
      greeting.value = nightGreetings[Math.floor(Math.random() * nightGreetings.length)]
    }
  }
}

// ---------- 天气 API (Open-Meteo) ----------
const weatherData = ref(null)

const getWeatherDescription = (code) => {
  if ([0, 1].includes(code)) return '晴'
  if (code === 2) return '局部多云'
  if (code === 3) return '阴'
  if ([45, 48].includes(code)) return '雾'
  if ([51, 53].includes(code)) return '轻毛毛雨'
  if (code === 55) return '浓毛毛雨'
  if ([56, 57].includes(code)) return '冻毛毛雨'
  if (code === 61) return '小雨'
  if (code === 63) return '中雨'
  if (code === 65) return '大雨'
  if ([66, 67].includes(code)) return '冻雨'
  if (code === 71) return '小雪'
  if (code === 73) return '中雪'
  if (code === 75) return '大雪'
  if (code === 77) return '雪粒'
  if ([80, 81].includes(code)) return '小阵雨'
  if (code === 82) return '大阵雨'
  if ([85, 86].includes(code)) return '阵雪'
  if ([95, 96, 99].includes(code)) return '雷暴'
  return '未知'
}

const getWeatherIcon = (code) => {
  if ([0, 1].includes(code)) return '☀️'
  if (code === 2) return '⛅'
  if (code === 3) return '☁️'
  if ([45, 48].includes(code)) return '🌫️'
  if ([51, 53, 55].includes(code)) return '🌧️'
  if ([56, 57].includes(code)) return '🧊🌧️'
  if ([61, 63, 65].includes(code)) return '🌧️'
  if ([66, 67].includes(code)) return '🧊🌧️'
  if ([71, 73, 75, 77].includes(code)) return '❄️'
  if ([80, 81, 82].includes(code)) return '🌦️'
  if ([85, 86].includes(code)) return '❄️🌨️'
  if ([95, 96, 99].includes(code)) return '⛈️'
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
        location: '中策橡胶（安吉）有限公司'
      }
    } else throw new Error()
  } catch {
    weatherData.value = { temperature: '--', description: '获取失败', icon: '🌐', location: '网络受限' }
  }
}

const weatherIcon = computed(() => weatherData.value?.icon || '🌡️')
const weatherDesc = computed(() => weatherData.value?.description || '加载中...')

// ---------- 增强粒子背景动画 (带智能连线) ----------
const canvasRef = ref(null)
let animationId = null
let particles = []
let mouseX = null, mouseY = null

class Particle {
  constructor(width, height) {
    this.x = Math.random() * width
    this.y = Math.random() * height
    this.vx = (Math.random() - 0.5) * 0.5
    this.vy = (Math.random() - 0.5) * 0.5
    this.size = Math.random() * 2.2 + 0.8
    this.alpha = Math.random() * 0.3 + 0.1
    this.originalAlpha = this.alpha
  }
  update(width, height) {
    this.x += this.vx
    this.y += this.vy
    // 边界环绕
    if (this.x < 0) this.x = width
    if (this.x > width) this.x = 0
    if (this.y < 0) this.y = height
    if (this.y > height) this.y = 0

    // 鼠标影响（轻微推斥，制造科技互动感）
    if (mouseX !== null && mouseY !== null) {
      const dx = this.x - mouseX
      const dy = this.y - mouseY
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 100) {
        const angle = Math.atan2(dy, dx)
        const force = (100 - dist) / 1000
        this.vx += Math.cos(angle) * force
        this.vy += Math.sin(angle) * force
        // 阻尼限制速度范围
        const maxSpeed = 1.2
        if (Math.abs(this.vx) > maxSpeed) this.vx = this.vx > 0 ? maxSpeed : -maxSpeed
        if (Math.abs(this.vy) > maxSpeed) this.vy = this.vy > 0 ? maxSpeed : -maxSpeed
      }
    }
  }
  draw(ctx) {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(50, 100, 180, ${this.alpha})`
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
  const particleCount = Math.min(110, Math.floor(width * height / 6000))
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle(width, height))
  }
}

// 绘制粒子之间的连线
const drawLines = (ctx, width, height) => {
  const maxDistance = 130
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x
      const dy = particles[i].y - particles[j].y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < maxDistance) {
        const opacity = (1 - dist / maxDistance) * 0.22
        ctx.beginPath()
        ctx.moveTo(particles[i].x, particles[i].y)
        ctx.lineTo(particles[j].x, particles[j].y)
        ctx.strokeStyle = `rgba(35, 110, 210, ${opacity})`
        ctx.lineWidth = 0.8
        ctx.stroke()
      }
    }
  }
}

const animateParticles = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const width = window.innerWidth
  const height = window.innerHeight
  ctx.clearRect(0, 0, width, height)
  // 更新并绘制粒子
  particles.forEach(p => {
    p.update(width, height)
    p.draw(ctx)
  })
  drawLines(ctx, width, height)
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

const handleMouseMove = (e) => {
  mouseX = e.clientX
  mouseY = e.clientY
}
const handleMouseLeave = () => {
  mouseX = null
  mouseY = null
}

onMounted(() => {
  updateDateTime()
  timer = setInterval(updateDateTime, 1000)
  fetchWeather()
  setInterval(fetchWeather, 30 * 60 * 1000)

  initParticles()
  animateParticles()
  window.addEventListener('resize', handleResize)
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseleave', handleMouseLeave)
})

onUnmounted(() => {
  clearInterval(timer)
  if (animationId) cancelAnimationFrame(animationId)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseleave', handleMouseLeave)
})
</script>

<style scoped lang="scss">
.welcome-container {
  position: relative;
  min-height: calc(100vh - 84px);
  width: 100%;
  overflow: hidden;
  background: radial-gradient(circle at 10% 20%, #f8fcff, #eef2fa);
  font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;

  // 细微科技网格背景
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: 
      linear-gradient(rgba(45, 110, 210, 0.08) 1px, transparent 1px),
      linear-gradient(90deg, rgba(45, 110, 210, 0.08) 1px, transparent 1px);
    background-size: 32px 32px;
    pointer-events: none;
    z-index: 1;
  }
}

.particles-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
  opacity: 0.8;
}

/* 科技装饰光晕 + 扫描线 */
.tech-ornaments {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  .orb-glow {
    position: absolute;
    width: 40vw;
    height: 40vw;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.25;
    background: radial-gradient(circle, rgba(0,150,255,0.3), transparent);
  }
  .orb-1 { top: -15vh; left: -10vw; }
  .orb-2 { bottom: -20vh; right: -10vw; background: radial-gradient(circle, rgba(80,160,255,0.2), transparent); }
  .scan-line {
    position: absolute;
    top: 0;
    left: -20%;
    width: 140%;
    height: 2px;
    background: linear-gradient(90deg, transparent, #3b82f6, #a0c4ff, #3b82f6, transparent);
    animation: scanMove 8s linear infinite;
    opacity: 0.35;
  }
}

@keyframes scanMove {
  0% { transform: translateY(-20vh); }
  100% { transform: translateY(120vh); }
}

.welcome-content {
  position: relative;
  z-index: 10;
  max-width: 1300px;
  width: 88%;
  margin: 0 auto;
  padding: 32px;
}

// 品牌区焕新科技感
.brand {
  text-align: center;
  margin-bottom: 48px;
  .logo-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 110px;
    height: 110px;
    background: rgba(255,255,255,0.7);
    backdrop-filter: blur(12px);
    border-radius: 36px;
    box-shadow: 0 10px 28px -8px rgba(0, 40, 80, 0.2), inset 0 1px 0 rgba(255,255,255,0.9);
    margin-bottom: 24px;
    transition: all 0.3s ease;
    .logo-glow {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 36px;
      background: radial-gradient(circle at 30% 30%, rgba(20, 100, 200, 0.2), transparent);
      filter: blur(10px);
    }
    .custom-logo {
      width: 58px;
      height: auto;
      max-height: 58px;
      object-fit: contain;
      filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.08));
      transition: transform 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
      z-index: 2;
    }
    .tech-ring {
      position: absolute;
      top: -8px;
      left: -8px;
      width: calc(100% + 16px);
      height: calc(100% + 16px);
      border-radius: 44px;
      border: 1px solid rgba(30, 120, 220, 0.5);
      border-top-color: rgba(30, 120, 220, 0.9);
      border-right-color: rgba(30, 120, 220, 0.3);
      transform: rotate(0deg);
      animation: spinRing 6s linear infinite;
      pointer-events: none;
    }
  }
  .brand-name {
    font-size: 66px;
    font-weight: 800;
    margin: 0 0 12px;
    background: linear-gradient(135deg, #133c6e, #1f5a9e, #3c7bc9);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    letter-spacing: -0.5px;
  }
  .slogan {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    .ai-tag {
      background: rgba(30, 100, 200, 0.12);
      border: 1px solid #2b6ed7;
      border-radius: 40px;
      padding: 3px 14px;
      font-size: 12px;
      font-weight: 600;
      color: #1a5bbf;
      backdrop-filter: blur(2px);
    }
    .slogan-text {
      font-size: 16px;
      color: #2c577c;
      font-weight: 450;
    }
    .blink-dot {
      width: 6px;
      height: 6px;
      background: #2b6ed7;
      border-radius: 50%;
      box-shadow: 0 0 8px #2b6ed7;
      animation: pulseDot 1.2s infinite;
    }
  }
}

/* 旋转光环 */
@keyframes spinRing {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes pulseDot {
  0%, 100% { opacity: 0.4; transform: scale(0.8);}
  50% { opacity: 1; transform: scale(1.2);}
}

// 增强玻璃面板科技感
.glass-panel {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(24px);
  border-radius: 48px;
  border: 1px solid rgba(45, 110, 200, 0.35);
  box-shadow: 0 20px 40px -16px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255,255,255,0.8);
  transition: all 0.35s;
  &:hover {
    border-color: rgba(45, 130, 230, 0.6);
    box-shadow: 0 25px 45px -14px rgba(0, 80, 150, 0.2);
  }
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
      color: #2b6ed7;
      letter-spacing: 1px;
      margin-bottom: 12px;
    }
    .time {
      font-size: 82px;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
      background: linear-gradient(135deg, #1a4980, #2e6bcb);
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      line-height: 1;
      margin-bottom: 12px;
      letter-spacing: 4px;
      text-shadow: 0 0 8px rgba(45,110,200,0.2);
    }
    .greeting {
      font-size: 16px;
      font-weight: 450;
      color: #3e6a8f;
    }
    .ai-badge {
      display: inline-block;
      margin-top: 12px;
      background: rgba(45, 110, 200, 0.1);
      border-radius: 30px;
      padding: 2px 12px;
      font-size: 12px;
      font-weight: 500;
      color: #1f6dc6;
      border-left: 2px solid #2b6ed7;
    }
  }
  .info-divider {
    width: 1px;
    height: 100px;
    background: linear-gradient(to bottom, transparent, #86a8cf, transparent);
  }
  .weather-section {
    flex: 1;
    text-align: center;
    .weather-icon { font-size: 62px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.05)); margin-bottom: 8px; }
    .weather-temp { font-size: 48px; font-weight: 700; color: #144b7a; }
    .weather-desc { font-size: 14px; color: #3f6b97; margin: 6px 0; }
    .weather-location { font-size: 13px; color: #5d7da2; display: flex; align-items: center; justify-content: center; gap: 6px; }
    .weather-metric { font-size: 10px; color: #6f8eb0; font-family: monospace; margin-top: 8px; letter-spacing: 0.5px; }
  }
}

.intro-text {
  text-align: center;
  max-width: 740px;
  margin: 0 auto 48px;
  p {
    font-size: 17.5px;
    line-height: 1.5;
    font-weight: 400;
    color: #244c6e;
    margin-bottom: 28px;
    backdrop-filter: blur(2px);
  }
  .tech-badges {
    display: flex;
    justify-content: center;
    gap: 20px;
    flex-wrap: wrap;
    .badge {
      background: rgba(255,255,255,0.55);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(35, 100, 200, 0.3);
      padding: 8px 26px;
      border-radius: 60px;
      font-size: 14px;
      font-weight: 600;
      color: #1e5fc7;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      transition: all 0.25s;
      cursor: default;
      &:hover {
        background: rgba(45, 110, 220, 0.12);
        transform: translateY(-3px);
        box-shadow: 0 12px 20px -12px rgba(0,80,120,0.25);
        border-color: rgba(45, 130, 230, 0.6);
      }
    }
  }
}

// 底部信息网格 + 状态栏
.footer-info {
  margin-top: 30px;
  .info-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 24px;
    background: rgba(255, 255, 255, 0.55);
    backdrop-filter: blur(16px);
    border-radius: 36px;
    padding: 22px 36px;
    border: 1px solid rgba(35, 105, 190, 0.25);
    .info-block {
      flex: 1;
      min-width: 170px;
      .block-title {
        font-size: 15px;
        font-weight: 600;
        color: #1360b5;
        margin-bottom: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
        .led-green, .led-blue, .led-cyan {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
          box-shadow: 0 0 4px currentColor;
        }
        .led-green { background: #2bc97a; box-shadow: 0 0 5px #2bc97a; }
        .led-blue { background: #2b6ed7; box-shadow: 0 0 5px #2b6ed7; }
        .led-cyan { background: #17cfcf; box-shadow: 0 0 5px #17cfcf; }
      }
      .block-links a, .contact-items span, .author-info span {
        display: block;
        color: #2c628d;
        font-size: 13px;
        margin-bottom: 8px;
        text-decoration: none;
        transition: 0.2s;
        .arrow {
          font-size: 12px;
          display: inline-block;
          transition: 0.2s;
        }
      }
      .block-links a:hover {
        color: #1070e0;
        .arrow { transform: translate(2px, -2px); }
      }
      .contact-items span {
        display: inline-block;
        margin-right: 20px;
        margin-bottom: 6px;
        font-family: monospace;
      }
    }
  }
  .system-status {
    display: flex;
    justify-content: center;
    gap: 28px;
    margin-top: 24px;
    padding: 6px 18px;
    background: rgba(235, 245, 255, 0.7);
    border-radius: 80px;
    width: fit-content;
    margin-left: auto;
    margin-right: auto;
    backdrop-filter: blur(8px);
    font-size: 12px;
    font-family: monospace;
    color: #2e6190;
    .status-item {
      display: flex;
      align-items: center;
      gap: 8px;
      .pulse {
        width: 6px;
        height: 6px;
        background: #2bc97a;
        border-radius: 50%;
        animation: pulseGreen 1.4s infinite;
      }
    }
  }
}
@keyframes pulseGreen {
  0% { opacity: 0.4; transform: scale(0.8);}
  100% { opacity: 1; transform: scale(1.2);}
}

@media (max-width: 860px) {
  .info-card {
    flex-direction: column;
    text-align: center;
    padding: 28px 24px;
    .datetime-section { text-align: center; }
    .info-divider { width: 80%; height: 1px; margin: 12px 0; }
  }
  .brand .brand-name { font-size: 48px; }
  .footer-info .info-grid { flex-direction: column; text-align: center; }
  .block-title { justify-content: center; }
  .system-status { flex-wrap: wrap; }
  .time { font-size: 58px !important; }
}
</style>