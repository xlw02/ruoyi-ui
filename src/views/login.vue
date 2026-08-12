<template>
  <div class="page">
    <!-- 左侧：品牌 + 登录 -->
    <aside class="left">
      <div class="left-inner">
        <div class="brand">
          <div class="brand-logo">E</div>
          <div>
            <h1 class="brand-name">{{ title }}</h1>
            <p class="brand-slogan">安全 · 高效 · 智能</p>
          </div>
        </div>

        <div class="login-card">
          <h2 class="login-title">登录</h2>
          <p class="login-sub">请输入您的账号信息</p>

          <el-form ref="loginFormRef" :model="form" :rules="rules" class="form">
            <el-form-item prop="username">
              <el-input
                v-model="form.username"
                placeholder="账号"
                size="large"
                clearable
                :prefix-icon="UserFilled"
              />
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model="form.password"
                type="password"
                placeholder="密码"
                size="large"
                show-password
                :prefix-icon="Lock"
                @keyup.enter="handleLogin"
              />
            </el-form-item>

            <el-form-item prop="code" v-if="captchaEnabled">
              <div class="captcha-row">
                <el-input
                  v-model="form.code"
                  placeholder="验证码"
                  size="large"
                  :prefix-icon="Key"
                  @keyup.enter="handleLogin"
                />
                <div class="captcha-img" @click="refreshCaptcha">
                  <img :src="captchaSrc" alt="验证码" />
                </div>
              </div>
            </el-form-item>

            <div class="form-row">
              <el-checkbox v-model="form.rememberMe">记住密码</el-checkbox>
              <router-link v-if="register" to="/register" class="form-link">立即注册</router-link>
            </div>

            <el-button
              type="primary"
              size="large"
              :loading="loading"
              class="login-btn"
              @click="handleLogin"
            >
              {{ loading ? '登录中...' : '登 录' }}
            </el-button>
          </el-form>

          <p class="login-footer">{{ footerContent }}</p>
        </div>
      </div>
    </aside>

    <!-- 右侧：导航 / 轮播图 -->
    <main class="right">
      <!-- 有导航数据时显示导航 -->
      <div v-if="hasNavData" class="nav-area">
        <div class="nav-header">
          <h3 class="nav-title">快速导航</h3>
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input
              v-model="searchTerm"
              type="text"
              placeholder="搜索系统..."
              class="search-input"
            />
          </div>
        </div>

        <div class="nav-body">
          <div
            v-for="cat in navCategories"
            :key="cat.name"
            class="cat-section"
          >
            <div class="cat-head">
              <span class="cat-icon">{{ cat.icon }}</span>
              <span>{{ cat.name }}</span>
            </div>
            <div class="cat-grid">
              <div
                v-for="item in filteredItems(cat.items)"
                :key="item.title"
                class="nav-card"
                @click="openLink(item.url)"
              >
                <span class="card-emoji">{{ item.icon }}</span>
                <div class="card-info">
                  <div class="card-name">{{ item.title }}</div>
                  <div class="card-desc">{{ item.desc }}</div>
                </div>
                <span class="card-go">→</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 无导航数据时显示轮播图 -->
      <div v-else class="banner-area">
        <div class="banner-slide">
          <img :src="bannerImages[activeBanner]" alt="banner" class="banner-img" />
        </div>
        <div class="banner-dots">
          <span
            v-for="(img, i) in bannerImages"
            :key="i"
            class="dot"
            :class="{ active: i === activeBanner }"
            @click="activeBanner = i"
          ></span>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { UserFilled, Lock, Key } from '@element-plus/icons-vue'
import Cookies from 'js-cookie'
import { encrypt, decrypt } from '@/utils/jsencrypt'
import { getCodeImg } from '@/api/login'
import useUserStore from '@/store/modules/user'
import defaultSettings from '@/settings'

// ============================================================
// 📌 轮播图配置 —— 在这里更换图片地址即可
// 当 navCategories 清空时，右侧会自动切换为轮播图展示
// ============================================================
const bannerImages = ref([
  'https://picsum.photos/seed/banner1/1200/800',
  'https://picsum.photos/seed/banner2/1200/800',
  'https://picsum.photos/seed/banner3/1200/800'
])
const activeBanner = ref(0)

// 自动轮播（5秒）
let bannerTimer = null
const startAutoPlay = () => {
  bannerTimer = setInterval(() => {
    activeBanner.value = (activeBanner.value + 1) % bannerImages.value.length
  }, 5000)
}
const stopAutoPlay = () => {
  if (bannerTimer) clearInterval(bannerTimer)
}
// 如果后续需要自动轮播，取消下一行注释：
// startAutoPlay()

// ============================================================

const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const title = import.meta.env.VITE_APP_TITLE
const footerContent = defaultSettings.footerContent
const register = ref(false)
const captchaEnabled = ref(true)

const form = reactive({
  username: 'user1',
  password: '123456',
  rememberMe: false,
  code: '',
  uuid: ''
})

const rules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

const loginFormRef = ref(null)
const loading = ref(false)
const captchaSrc = ref('')
const redirect = ref(undefined)
const searchTerm = ref('')

watch(route, (to) => {
  redirect.value = to.query?.redirect
}, { immediate: true })

const getCaptcha = async () => {
  try {
    const res = await getCodeImg()
    captchaEnabled.value = res.captchaEnabled !== false
    if (captchaEnabled.value) {
      captchaSrc.value = 'data:image/gif;base64,' + res.img
      form.uuid = res.uuid
    }
  } catch (error) {
    console.error('获取验证码失败', error)
  }
}

const refreshCaptcha = () => {
  getCaptcha()
}

const loadRemembered = () => {
  const username = Cookies.get('username')
  const password = Cookies.get('password')
  const remember = Cookies.get('rememberMe')
  if (username && password && remember === 'true') {
    form.username = username
    form.password = decrypt(password)
    form.rememberMe = true
  }
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      if (form.rememberMe) {
        Cookies.set('username', form.username, { expires: 30 })
        Cookies.set('password', encrypt(form.password), { expires: 30 })
        Cookies.set('rememberMe', 'true', { expires: 30 })
      } else {
        Cookies.remove('username')
        Cookies.remove('password')
        Cookies.remove('rememberMe')
      }
      await userStore.login(form)
      const query = route.query
      const otherParams = Object.keys(query).reduce((acc, key) => {
        if (key !== 'redirect') acc[key] = query[key]
        return acc
      }, {})
      router.push({ path: redirect.value || '/', query: otherParams })
    } catch (error) {
      if (captchaEnabled.value) {
        refreshCaptcha()
        form.code = ''
      }
    } finally {
      loading.value = false
    }
  })
}

// ============================================================
// 📌 导航配置 —— 清空 items 数组或整个 navCategories 即可切换为轮播图
// ============================================================
const navCategories = ref([
  {
    name: '主要网站',
    icon: '🌟',
    items: [
      { title: 'OA系统', desc: '泛微oa系统，新一代协同融合平台', icon: '🏠', url: 'https://oa.chaoyang.com' },
      { title: 'AI助手', desc: '四分厂数据AI助手', icon: '🤖', url: 'https://agent.dingtalk.com/copilot?code=VlMczAyHj4&channel' },
      { title: '安吉数据决策系统', desc: '如需使用账号及密码登陆请与钉钉联系相立维', icon: '📊', url: 'http://10.4.10.35:8075/webroot/decision/login?origin=4cbe45ab-fbdb-4c45-93fb-68e45d4f3eef' },
      { title: '共享文件下载中心', desc: 'win+r 输入 \\\\10.4.27.250\\基础共享文件', icon: '📁', url: 'http://10.4.40.250:8080' },
      { title: '资源中心', desc: '访问密码请联系管理员', icon: '💾', url: 'http://10.4.40.250:8081' },
      { title: '监控摄像', desc: '摄像监控查看', icon: '📹', url: 'https://10.4.180.1/' }
    ]
  },
  {
    name: '常用网址',
    icon: '🔗',
    items: [
      { title: '四分厂MES系统', desc: '使用mes系统查看设备状态', icon: '⚙️', url: 'http://10.4.10.120:8080/' },
      { title: '胶料MES系统', desc: '中策安吉准备分厂胶料系统访问', icon: '📦', url: 'http://10.4.10.59:8088/login?redirect=%2Findex' },
      { title: '中策安吉BI平台', desc: '企业数据分析和可视化工具', icon: '📈', url: 'http://10.4.10.36:37799/webroot/decision' },
      { title: 'ERP系统', desc: '基础ERP系统使用及管理', icon: '💼', url: 'http://10.1.10.196:9080/zcerp/mainframe.action' },
      { title: '集采系统', desc: '基础采购系统使用', icon: '🛒', url: 'http://122.224.74.44:8280/oauth/' },
      { title: '仓储WMS', desc: '仓储系统日常使用和访问', icon: '📦', url: 'http://10.4.10.57:1401/' },
      { title: '远程软件注册', desc: '注册自行搭建的远程软件', icon: '🖥️', url: 'http://10.4.40.250:21114/' },
      { title: '模具WMS', desc: '基础模具系统使用及管理', icon: '🔧', url: 'http://10.4.10.109:1401/' }
    ]
  },
  {
    name: '学习资源',
    icon: '📚',
    items: [
      { title: '知识库', desc: '暂无内容', icon: '📚', url: 'http://10.4.40.250/upload.html' },
      { title: '培训平台', desc: '暂无内容', icon: '🎬', url: 'https://training.company.com/' }
    ]
  }
])

// 是否有导航数据
const hasNavData = computed(() => {
  return navCategories.value.some(cat => cat.items && cat.items.length > 0)
})

const filteredItems = (items) => {
  if (!searchTerm.value.trim()) return items
  const term = searchTerm.value.toLowerCase().trim()
  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(term) ||
      item.desc.toLowerCase().includes(term)
  )
}

const openLink = (url) => {
  window.open(url, '_blank')
}

loadRemembered()
getCaptcha()
</script>

<style lang="scss" scoped>
/* ===== 全局 ===== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.page {
  display: flex;
  min-height: 100vh;
  background: #f4f5f7;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  color: #333;
}

/* ===== 左侧 ===== */
.left {
  width: 420px;
  min-width: 380px;
  background: #1b2a4a;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 40px;
  flex-shrink: 0;
}

.left-inner {
  width: 100%;
  max-width: 340px;
}

/* 品牌 */
.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 48px;
}

.brand-logo {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: #3b5998;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.brand-name {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.3px;
}

.brand-slogan {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.45);
  margin-top: 2px;
}

/* 登录卡片 */
.login-card {
  background: #fff;
  border-radius: 14px;
  padding: 32px 28px;
}

.login-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.login-sub {
  font-size: 13px;
  color: #999;
  margin-bottom: 24px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

:deep(.el-form-item) {
  margin-bottom: 0;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
  background: #f7f8fa;
  box-shadow: 0 0 0 1px #e8e8e8 inset;
  transition: all 0.2s;
  padding: 4px 12px;
  height: 44px;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #d0d0d0 inset;
}

:deep(.el-input__wrapper.is-focus) {
  background: #fff;
  box-shadow: 0 0 0 1px #3b5998 inset;
}

:deep(.el-input__prefix) {
  color: #bbb;
}

:deep(.el-input__prefix .el-icon) {
  font-size: 17px;
}

.captcha-row {
  display: flex;
  gap: 10px;
  align-items: stretch;
}

.captcha-row .el-input {
  flex: 1;
}

.captcha-img {
  flex-shrink: 0;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e8e8e8;
}

.captcha-img img {
  display: block;
  width: 110px;
  height: 44px;
  object-fit: cover;
}

.form-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.form-row :deep(.el-checkbox__label) {
  color: #888;
  font-size: 13px;
}

.form-link {
  color: #3b5998;
  text-decoration: none;
  font-size: 13px;
}

.form-link:hover {
  text-decoration: underline;
}

.login-btn {
  width: 100%;
  height: 46px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  background: #3b5998;
  border: none;
  transition: background 0.2s;
  margin-top: 4px;
}

.login-btn:hover {
  background: #4a6aad;
}

.login-btn:active {
  background: #325088;
}

.login-footer {
  text-align: center;
  font-size: 12px;
  color: #ccc;
  margin-top: 20px;
}

/* ===== 右侧 ===== */
.right {
  flex: 1;
  display: flex;
  padding: 32px;
  overflow: hidden;
}

/* --- 导航区 --- */
.nav-area {
  flex: 1;
  background: #fff;
  border-radius: 14px;
  border: 1px solid #eee;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.nav-header {
  padding: 24px 28px 0;
  flex-shrink: 0;
}

.nav-title {
  font-size: 17px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 14px;
}

.search-box {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 13px;
  opacity: 0.4;
}

.search-input {
  width: 100%;
  padding: 10px 14px 10px 38px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 14px;
  background: #fafafa;
  transition: all 0.2s;
  font-family: inherit;
  color: #333;
}

.search-input:focus {
  outline: none;
  border-color: #3b5998;
  background: #fff;
}

.search-input::placeholder {
  color: #c0c0c0;
}

.nav-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 28px 28px;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #e0e0e0;
    border-radius: 4px;
  }
}

.cat-section {
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
}

.cat-head {
  font-size: 13px;
  font-weight: 600;
  color: #888;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.cat-icon {
  font-size: 14px;
}

.cat-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.nav-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #f9f9fb;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s;
}

.nav-card:hover {
  background: #f0f2f5;
}

.card-emoji {
  font-size: 18px;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #eee;
}

.card-info {
  flex: 1;
  min-width: 0;
}

.card-name {
  font-size: 13px;
  font-weight: 600;
  color: #222;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.card-desc {
  font-size: 12px;
  color: #aaa;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 1px;
  line-height: 1.3;
}

.card-go {
  font-size: 14px;
  color: #ccc;
  flex-shrink: 0;
  transition: all 0.15s;
  opacity: 0;
}

.nav-card:hover .card-go {
  opacity: 1;
  color: #3b5998;
}

/* --- 轮播图区 --- */
.banner-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.banner-slide {
  flex: 1;
  width: 100%;
  border-radius: 14px;
  overflow: hidden;
  background: #e8e8e8;
}

.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.banner-dots {
  display: flex;
  gap: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d5d5d5;
  cursor: pointer;
  transition: all 0.2s;
}

.dot.active {
  background: #3b5998;
  width: 24px;
  border-radius: 4px;
}

/* ===== 响应式 ===== */
@media (max-width: 900px) {
  .page {
    flex-direction: column;
  }

  .left {
    width: 100%;
    min-width: unset;
    padding: 32px 24px;
  }

  .brand {
    margin-bottom: 28px;
  }

  .right {
    padding: 0 16px 24px;
  }

  .cat-grid {
    grid-template-columns: 1fr;
  }
}
</style>
