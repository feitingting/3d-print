declare module '*.css';
declare module '*.less';
declare module '*.png';
declare module '*.svg' {
  export function ReactComponent(
    props: React.SVGProps<SVGSVGElement>,
  ): React.ReactElement;
  const url: string;
  export default url;
}
// 为解决找不到模块问题，可先确保 index.module.scss 文件存在于当前目录
// 同时，若使用 TypeScript，需要添加类型声明文件来支持 .scss 文件导入
// 可以在项目中创建一个 global.d.ts 文件，并添加如下内容：
// declare module '*.module.scss' {
//   const classes: { [key: string]: string };
//   export default classes;
// }
