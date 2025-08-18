import { defineConfig } from 'umi';
// 从 Ant Design 4.24.0 版本开始，中文语言包路径变更为 'antd/lib/locale/zh_CN'
// 同时需要确保项目中安装了 Ant Design 相应版本
import zhCN from 'antd/lib/locale/zh_CN';
import { commonHandle } from '@/api/robot';
const px2vw = require('postcss-px-to-viewport');
export default defineConfig({
  base: '/',
  // 指定静态资源的加载路径
  publicPath: '/',
  chainWebpack(memo) {
    // `memo` 是 Webpack 配置的链式调用对象，通过它可以修改 Webpack 配置
    memo.module
      // 定义一个新的 Webpack 模块规则，规则名称为 'mjs'
      .rule('mjs|js')
      // 设置该规则匹配的文件类型，这里匹配所有以 `.mjs` 结尾的文件
      .test(/\.mjs$/)
      // 指定该规则要包含的文件路径，这里使用正则表达式匹配 `node_modules` 目录下的文件
      .include.add(/node_modules/)
      // 结束当前的链式调用，返回到上一级对象，也就是 `memo.module`
      .end()
      // 设置匹配到的 `.mjs` 文件的处理类型为 'javascript/auto'，
      // 这样 Webpack 会以自动模式处理这些文件，能更好地兼容 ES 模块
      .type('javascript/auto');   
    // 添加STL文件处理规则
    memo.module
      .rule('stl')
      .test(/\.stl$/)
      .use('file-loader')
      .loader('file-loader')
      .options({
        name: 'assets/library/[name].[ext]', // 输出路径
        // 添加MIME类型配置
        mimetype: 'application/sla',
        // 添加响应头配置
        headers: {
          'Content-Type': 'application/sla',
          'Content-Disposition': 'attachment; filename="[name].[ext]"',
          'Cache-Control': 'no-store'
        }
      });
    },
  theme: {
    'primary-color': '#607D8B', // 自定义主题色
    // 可添加其他主题变量
    'link-color': '#1890ff',
    'success-color': '#52c41a',
    'warning-color': '#faad14',
    'error-color': '#f5222d',
    'font-size-base': '14px',
    'heading-color': 'rgba(0, 0, 0, 0.85)',
    'text-color': 'rgba(0, 0, 0, 0.65)',
    'text-color-secondary': 'rgba(0, 0, 0, 0.45)',
    'border-color-base': '#e8e8e8',
    'border-radius-base': '4px',
    'box-shadow-base': '0 2px 8px rgba(0, 0, 0, 0.15)',
  },
  locale: {
    default: 'zh-CN',
    antd: true,
    baseNavigator: false,
  },
  antd: {},
  extraPostCSSPlugins: [
    px2vw({
      replace: true, // 启用单位替换
      include: /\/src\//, // 增加包含路径
      //exclude: /node_modules/, // 明确排除node_modules
      viewportWidth: 1920, // 视窗的宽度，对应的是我们设计稿的宽度，一般是750
      viewportHeight: 1080, // 视窗的高度，根据750设备的宽度来指定，一般指定1334，也可以不配置
      unitPrecision: 3, // 指定`px`转换为视窗单位值的小数位数（很多时候无法整除）
      viewportUnit: 'vw', // 指定需要转换成的视窗单位，建议使用vw
      selectorBlackList: ['.ignore', '.hairlines'], // 指定不转换为视窗单位的类，可以自定义，可以无限添加,建议定义一至两个通用的类名
      minPixelValue: 1, // 小于或等于`1px`不转换为视窗单位，你也可以设置为你想要的值
      mediaQuery: false, // 允许在媒体查询中转换`px`
    }),
  ],
  // ...其他配置...
  sass: {
    // 可选配置项
    implementation: require('sass'), // 使用dart-sass替代node-sass
  },
  routes: [
    {
      path: '/',
      component: '@/pages/index',
      title: 'online 3D server',
      // 配置子路由
      routes: [
        { path:'/home', component: '@/pages/home', title: '首页'},
        // 当访问根路径时，重定向到主页
        // { path: '/', redirect: '/index' },
        { path: '/', component: '@/pages/home', title: '首页' },
        {
          path: '/experiment-management',
          component: '@/pages/experimentManagement',
          title: '实验管理',
        },
        {
          path: '/production-record',
          component: '@/pages/productionRecord',
          title: '生产记录',
        },
        {
          path: '/mixArea-setting',
          component: '@/pages/mixAreaSetting',
          title: '拌料区设置',
        },
        {
          path: '/material-management',
          component: '@/pages/materialManagement',
          title: '原料管理',
        },
        {
          path: '/warning-record',
          component: '@/pages/warningRecord',
          title: '报警记录',
        },
        {
          path: '/online-quotation',
          component: '@/pages/onlineQuotation',
          title: '在线报价',
        },
        {
          path: '/model-library',
          component: '@/pages/modelLibrary',
          title: '3D模型库',
        },
        { 
          path: '/log', 
          component: '@/pages/log', 
          title: '日志' 
        },
        { 
          path:'/model-detail',
          component:'@/pages/modelDetail',
          title:'模型详情'
        },
        { 
          path:'/industryCases',
          component:'@/pages/industryCases',
          title:'行业案例'
        },
         { 
          path:'/more',
          component:'@/pages/more',
          title:'更多'
        },
      ],
    },
  ],
  fastRefresh: {},
  // 新增代理配置
  proxy: {
    '/api': {
      target: 'http://localhost:3000/api', // 后端服务地址
      changeOrigin: true,
      pathRewrite: { '^/api': '' }, // 可选，根据后端路由实际情况配置
    },
    '/webapp/': {
      target: 'http://192.168.1.111/', // 后端服务地址
      changeOrigin: true,
      pathRewrite: {
        '^/webapp': '', // 去除路径中的/webapp前缀
      },
    },
  },

  // 开启 CSS Modules
  // cssLoader: {
  //   modules: {
  //     localIdentName: '[local]_[hash:base64:5]',
  //   },
  // },
});
