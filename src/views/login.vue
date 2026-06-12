<template>
  <div class="login-container">
    <div class="login-card">
      <!-- 头部品牌区 -->
      <div class="card-header">
        <div class="logo-wrapper">
          <div class="logo-icon">E</div>
          <div class="logo-text">
            <h1>{{ title }}</h1>
            <p>安全 · 高效 · 智能</p>
          </div>
        </div>
      </div>

      <!-- 登录表单 -->
      <el-form ref="loginFormRef" :model="form" :rules="rules" class="login-form">
        <!-- 账号 -->
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入账号"
            size="large"
            clearable
            :prefix-icon="UserFilled"
          />
        </el-form-item>

        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            show-password
            :prefix-icon="Lock"
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <!-- 验证码 -->
        <el-form-item prop="code" v-if="captchaEnabled">
          <div class="captcha-wrapper">
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

        <!-- 额外选项 -->
        <div class="form-options">
          <el-checkbox v-model="form.rememberMe">记住密码</el-checkbox>
          <div class="register-tip" v-if="register">
            <router-link to="/register">立即注册</router-link>
          </div>
        </div>

        <!-- 登录按钮 -->
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

      <!-- 页脚 -->
      <div class="card-footer">
        {{ footerContent }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { UserFilled, Lock, Key } from '@element-plus/icons-vue'
import Cookies from 'js-cookie'
import { encrypt, decrypt } from '@/utils/jsencrypt'
import { getCodeImg } from '@/api/login'
import useUserStore from '@/store/modules/user'
import defaultSettings from '@/settings'

const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 配置项
const title = import.meta.env.VITE_APP_TITLE
const footerContent = defaultSettings.footerContent
const register = ref(false)   // 是否开启注册入口（根据业务调整）
const captchaEnabled = ref(true)

// 表单数据
const form = reactive({
  username: 'user1',
  password: '123456',
  rememberMe: false,
  code: '',
  uuid: ''
})

// 验证规则
const rules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

const loginFormRef = ref(null)
const loading = ref(false)
const captchaSrc = ref('')
const redirect = ref(undefined)

// 监听路由重定向参数
watch(route, (to) => {
  redirect.value = to.query?.redirect
}, { immediate: true })

// 获取验证码
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

// 刷新验证码
const refreshCaptcha = () => {
  getCaptcha()
}

// 读取记住的账号密码
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

// 登录提交
const handleLogin = async () => {
  if (!loginFormRef.value) return
  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      // 记住密码逻辑
      if (form.rememberMe) {
        Cookies.set('username', form.username, { expires: 30 })
        Cookies.set('password', encrypt(form.password), { expires: 30 })
        Cookies.set('rememberMe', 'true', { expires: 30 })
      } else {
        Cookies.remove('username')
        Cookies.remove('password')
        Cookies.remove('rememberMe')
      }
      // 调用登录接口
      await userStore.login(form)
      // 跳转
      const query = route.query
      const otherParams = Object.keys(query).reduce((acc, key) => {
        if (key !== 'redirect') acc[key] = query[key]
        return acc
      }, {})
      router.push({ path: redirect.value || '/', query: otherParams })
    } catch (error) {
      // 登录失败刷新验证码
      if (captchaEnabled.value) {
        refreshCaptcha()
        form.code = ''
      }
    } finally {
      loading.value = false
    }
  })
}

// 初始化
loadRemembered()
getCaptcha()
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #f0f4fa 0%, #e9eef5 100%);
  padding: 1.5rem;
}

.login-card {
  width: 100%;
  max-width: 440px;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(0px);
  border-radius: 32px;
  box-shadow: 0 25px 45px -12px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(64, 158, 255, 0.08);
  overflow: hidden;
  transition: transform 0.2s;
}

.card-header {
  padding: 32px 32px 16px;
  border-bottom: 1px solid #eef2f8;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #409eff, #66b1ff);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  font-weight: 700;
  color: white;
  box-shadow: 0 8px 16px -8px rgba(64, 158, 255, 0.4);
}

.logo-text h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1f2f3d;
  letter-spacing: -0.2px;
}

.logo-text p {
  margin: 4px 0 0;
  font-size: 13px;
  color: #8c9aa8;
}

.login-form {
  padding: 28px 32px 20px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

:deep(.el-input__wrapper) {
  border-radius: 14px;
  background-color: #fafbfc;
  box-shadow: 0 0 0 1px #e2e6ec inset;
  transition: all 0.2s;
  padding-left: 12px;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0ccda inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset, 0 0 0 3px rgba(64, 158, 255, 0.1);
}

:deep(.el-input__prefix) {
  color: #8c9aa8;
  margin-right: 8px;
}

:deep(.el-input__prefix) i {
  font-size: 18px;
}

.captcha-wrapper {
  display: flex;
  gap: 12px;
  align-items: center;
}

.captcha-wrapper .el-input {
  flex: 1;
}

.captcha-img {
  flex-shrink: 0;
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e4e7ed;
  transition: opacity 0.2s;
}

.captcha-img img {
  display: block;
  width: 110px;
  height: 44px;
  object-fit: cover;
}

.captcha-img:hover {
  opacity: 0.85;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: -6px;
  font-size: 13px;
}

.form-options :deep(.el-checkbox__label) {
  color: #5a6e7c;
}

.register-tip a {
  color: #409eff;
  text-decoration: none;
  font-weight: 500;
}

.register-tip a:hover {
  text-decoration: underline;
}

.login-btn {
  width: 100%;
  height: 48px;
  border-radius: 14px;
  font-weight: 600;
  font-size: 16px;
  background: #409eff;
  border: none;
  margin-top: 4px;
  transition: all 0.25s;
}

.login-btn:hover {
  background: #66b1ff;
  transform: translateY(-1px);
  box-shadow: 0 8px 18px -6px rgba(64, 158, 255, 0.4);
}

.card-footer {
  padding: 18px 32px 24px;
  text-align: center;
  font-size: 12px;
  color: #8c9aa8;
  border-top: 1px solid #eef2f8;
  background: #fefefe;
}
</style>