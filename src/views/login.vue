<template>
  <div class="login">
    <div class="login-cover"></div>
    <div class="login-box">
      <div class="login-card">
        <div class="card-header">
          <div class="brand-mark">E</div>
          <div class="brand-info">
            <h1 class="card-title">{{ title }}</h1>
            <p class="card-subtitle">安全快速的 EleWay 管理后台</p>
          </div>
        </div>
        <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              type="text"
              size="medium"
              auto-complete="off"
              placeholder="请输入账号"
            >
              <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              size="medium"
              auto-complete="off"
              placeholder="请输入密码"
              @keyup.enter="handleLogin"
            >
              <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
            </el-input>
          </el-form-item>
          <el-form-item prop="code" v-if="captchaEnabled" class="captcha-row">
            <el-input
              v-model="loginForm.code"
              size="medium"
              auto-complete="off"
              placeholder="请输入验证码"
              style="width: 62%"
              @keyup.enter="handleLogin"
            >
              <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
            </el-input>
            <div class="login-code">
              <img :src="codeUrl" @click="getCode" class="login-code-img" />
            </div>
          </el-form-item>
          <div class="form-extra">
            <el-checkbox v-model="loginForm.rememberMe" class="remember-checkbox">记住密码</el-checkbox>
            <div class="register-link" v-if="register">
              <router-link class="link-type" :to="'/register'">立即注册</router-link>
            </div>
          </div>
          <el-form-item class="button-row">
            <el-button
              :loading="loading"
              size="large"
              type="primary"
              class="login-button"
              @click.prevent="handleLogin"
            >
              <span v-if="!loading">登 录</span>
              <span v-else>登 录 中...</span>
            </el-button>
          </el-form-item>
        </el-form>
        <div class="login-footer">
          <span>{{ footerContent }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getCodeImg } from "@/api/login"
import Cookies from "js-cookie"
import { encrypt, decrypt } from "@/utils/jsencrypt"
import useUserStore from '@/store/modules/user'
import defaultSettings from '@/settings'

const title = import.meta.env.VITE_APP_TITLE
const footerContent = defaultSettings.footerContent
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const { proxy } = getCurrentInstance()

const loginForm = ref({
  username: "admin",
  password: "admin123",
  rememberMe: false,
  code: "",
  uuid: ""
})

const loginRules = {
  username: [{ required: true, trigger: "blur", message: "请输入您的账号" }],
  password: [{ required: true, trigger: "blur", message: "请输入您的密码" }],
  code: [{ required: true, trigger: "change", message: "请输入验证码" }]
}

const codeUrl = ref("")
const loading = ref(false)
// 验证码开关
const captchaEnabled = ref(true)
// 注册开关
const register = ref(false)
const redirect = ref(undefined)

watch(route, (newRoute) => {
    redirect.value = newRoute.query && newRoute.query.redirect
}, { immediate: true })

function handleLogin() {
  proxy.$refs.loginRef.validate(valid => {
    if (valid) {
      loading.value = true
      // 勾选了需要记住密码设置在 cookie 中设置记住用户名和密码
      if (loginForm.value.rememberMe) {
        Cookies.set("username", loginForm.value.username, { expires: 30 })
        Cookies.set("password", encrypt(loginForm.value.password), { expires: 30 })
        Cookies.set("rememberMe", loginForm.value.rememberMe, { expires: 30 })
      } else {
        // 否则移除
        Cookies.remove("username")
        Cookies.remove("password")
        Cookies.remove("rememberMe")
      }
      // 调用action的登录方法
      userStore.login(loginForm.value).then(() => {
        const query = route.query
        const otherQueryParams = Object.keys(query).reduce((acc, cur) => {
          if (cur !== "redirect") {
            acc[cur] = query[cur]
          }
          return acc
        }, {})
        router.push({ path: redirect.value || "/", query: otherQueryParams })
      }).catch(() => {
        loading.value = false
        // 重新获取验证码
        if (captchaEnabled.value) {
          getCode()
        }
      })
    }
  })
}

function getCode() {
  getCodeImg().then(res => {
    captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled
    if (captchaEnabled.value) {
      codeUrl.value = "data:image/gif;base64," + res.img
      loginForm.value.uuid = res.uuid
    }
  })
}

function getCookie() {
  const username = Cookies.get("username")
  const password = Cookies.get("password")
  const rememberMe = Cookies.get("rememberMe")
  loginForm.value = {
    username: username === undefined ? loginForm.value.username : username,
    password: password === undefined ? loginForm.value.password : decrypt(password),
    rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
  }
}

getCode()
getCookie()
</script>

<style lang='scss' scoped>
.login {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: radial-gradient(circle at top left, rgba(13, 66, 116, 0.88), transparent 20%),
    radial-gradient(circle at bottom right, rgba(14, 165, 233, 0.16), transparent 18%),
    linear-gradient(135deg, #061325 0%, #0b1c38 40%, #112846 100%);
  overflow: hidden;
}
.login::before,
.login::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.login::before {
  background-image: linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 60px 60px;
  opacity: 0.6;
  transform: translateZ(0);
}
.login::after {
  background: radial-gradient(circle at 25% 20%, rgba(15, 185, 255, 0.14), transparent 18%),
    radial-gradient(circle at 75% 15%, rgba(56, 189, 248, 0.16), transparent 16%),
    radial-gradient(circle at 50% 80%, rgba(168, 85, 247, 0.14), transparent 16%);
  opacity: 0.8;
}
.login-cover {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 25%, transparent 75%, rgba(255,255,255,0.02) 100%);
  mask-image: radial-gradient(circle at center, rgba(0,0,0,1) 20%, transparent 80%);
}
.login-box {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 360px;
}
.login-card {
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(7, 17, 36, 0.96);
  box-shadow: 0 32px 90px rgba(0, 0, 0, 0.35);
}
.card-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 26px 26px 18px;
}
.brand-mark {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #0ea5e9, #38bdf8);
  color: #ffffff;
  font-size: 24px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 18px 40px rgba(56, 189, 248, 0.2);
}
.brand-info {
  flex: 1;
}
.card-title {
  margin: 0;
  font-size: 26px;
  color: #ffffff;
}
.card-subtitle {
  margin: 6px 0 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 13px;
}
.login-form {
  padding: 10px 26px 24px;
  display: grid;
  gap: 16px;
  color: #e5e7eb;
}
.el-form-item {
  margin-bottom: 0;
}
.el-input {
  position: relative;
}
.el-input__inner {
  height: 44px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #ffffff;
  padding-left: 46px;
}
.el-input__inner::placeholder {
  color: rgba(255, 255, 255, 0.58);
}
.input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.6);
}
.captcha-row {
  display: flex;
  align-items: center;
  gap: 16px;
}
.login-code {
  display: flex;
  align-items: center;
}
.login-code-img {
  height: 40px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.14);
}
.form-extra {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}
.remember-checkbox {
  color: rgba(255, 255, 255, 0.82);
}
.button-row {
  width: 100%;
}
.login-button {
  width: 100%;
  height: 44px;
  border-radius: 14px;
  font-weight: 600;
}
.register-link {
  font-size: 13px;
}
.link-type {
  color: #7dd3fc;
}
.login-footer {
  padding: 16px 26px 22px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  text-align: center;
  background: rgba(255, 255, 255, 0.02);
}
</style>
