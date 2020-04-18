/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const testMenu = {
  path: '/testMenu',
  component: Layout,
  redirect: 'noRedirect',
  name: 'ComponentDemo',
  meta: {
    title: 'components',
    icon: 'component'
  },
  children: [{  //二级菜单
    path: 'tree',
    component: Layout,
    name: 'treename',
    meta: {
      title: 'rolePermission',
      icon: 'component',
      roles: ['admin']  //权限
    },
     children: [{  //三级菜单
      path: 'tree-1',
      component:  () => import('@/views/testMenu/tree/tree-1'),
      name: 'tree-1-name',
      meta: {
        title: 'tree-1-title',
        icon: 'component',
        roles: ['admin']  //权限
      }
    }]
  }]
}

export default testMenu
