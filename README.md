# CreFire.github.io

[https://crefire.github.io/](https://crefire.github.io/) — 极简个人技术博客与纯代码视听实验主页，基于 GitHub Pages 原生 Jekyll 构建。

## 目录结构

- `_posts/`：博客文章（Markdown，`YYYY-MM-DD-slug.md`）
- `pages/`：独立页面（如 `/about/`、`/works/`）
- `_layouts/`、`_includes/`、`assets/`：极简主题模板、样式表与前端搜索脚本
- `llm-trend/`：纯代码视听长卷《硅基涌现 · 大模型演进二十幕》
- `pelican-6000-pure-code/`：纯代码艺术史视听全片《鹈鹕六千年的车》
- `admin/`、`cms-auth/`：Decap CMS 在线写作后台与 GitHub App 登录服务

## 在线写作后台 (CMS)

打开 [写作后台 `https://crefire.github.io/admin/`](https://crefire.github.io/admin/) 并使用拥有本仓库写入权限的 GitHub 账号登录：

- 在 **文章** 中新建或编辑博文；草稿通过 Editorial Workflow 保存为分支/PR，点击 **Publish** 后自动合并至 `main` 并触发 GitHub Pages 发布。

### GitHub App 登录 Worker 配置说明

1. 注册私有 [GitHub App](https://github.com/settings/apps/new)，Homepage 设为写作后台地址，Callback URL 设为 `https://crefire-pages-auth.astroblog.workers.dev/auth/callback`，关闭 Webhook，仓库权限开启 **Contents** 与 **Pull requests** 读写，**Metadata** 只读。
2. 仅将该 App 安装到 `CreFire/CreFire.github.io`。
3. 部署登录 Worker 并写入密钥：

   ```bash
   npx wrangler deploy --config cms-auth/wrangler.jsonc
   npx wrangler secret put GITHUB_CLIENT_ID --config cms-auth/wrangler.jsonc
   npx wrangler secret put GITHUB_CLIENT_SECRET --config cms-auth/wrangler.jsonc
   ```

4. 验证 Worker 的 `/auth/status` 返回 `{"configured":true}`。
