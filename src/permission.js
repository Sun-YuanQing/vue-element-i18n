import router from './router'
import store from './store'
import {
  Message
} from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import {
  getToken
} from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({
  showSpinner: false
}) // NProgress Configuration

const whiteList = ['/login', '/auth-redirect'] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()

  // set page title
  document.title = getPageTitle(to.meta.title)

  // determine whether the user has logged in
  const hasToken = getToken()
  console.log('进了路由获得hasToken===>' + hasToken)
  if (hasToken) {
    console.log('有Token')
    if (to.path == '/login') {
      // if is logged in, redirect to the home page

      console.log("有Token并'" + to.path + "'是 /login,重定向到‘/’")
      next({
        path: '/'
      })
      // 结束进度条
      NProgress.done()
    } else {
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      console.log("有Token并'" + to.path + "'不是 /login,获取缓存权限" + hasRoles + '===>' + JSON.stringify(store.getters.roles))
      if (hasRoles) {
        // 有权限，放行
        console.log("有Token并有'" + to.path + "'权限===>" + JSON.stringify(store.getters.roles) + '放行')
        next()
      } else {
        console.log("有Token并'" + to.path + "'不是 /login,没有缓存权限===>" + JSON.stringify(store.getters.roles))
        try {
          const {
            roles
          } = await store.dispatch('user/getInfo')
          console.log("有Token并'" + to.path + "'不是 /login,获取接口权限‘user/getInfo’" + JSON.stringify(roles))

          const accessRoutes = await store.dispatch('permission/generateRoutes', roles)
          console.log("有Token并'" + to.path + "'不是 /login,根据权限" + JSON.stringify(roles) +
            "调用'permission/generateRoutes'过虑路由===>", accessRoutes)
          router.addRoutes(accessRoutes)
          console.log('合并路由')
          // hack method to ensure that addRoutes is complete
          // set the replace: true, so the navigation will not leave a history record
          console.log('重定向到===>' + to.path + '清除之前的路由足迹')
          next({ ...to,
            replace: true
          })
        } catch (error) {
          // remove token and go to login page to re-login
          console.log('出错了！！！调用接口‘user/resetToken’清除Token')
          await store.dispatch('user/resetToken')
          Message.error(error || 'Has Error')
          console.log('跳到登陆，加重定向' + to.path)
          next(`/login?redirect=${to.path}`)
          // 结束进度条
          NProgress.done()
        }
      }
    }
  } else {
    /* has no token*/
    // 没有token 但在白名单中/longin,释放路由  但在白名单中"+to.path
    console.log('没有token ')
    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      console.log('但' + to.path + '在白名单中,放行')
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      // 没有token，
      console.log(to.path + '不在白名单中跳到/login，加重定向/login?redirect=' + to.path)
      next(`/login?redirect=${to.path}`)
      // 结束进度条
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
