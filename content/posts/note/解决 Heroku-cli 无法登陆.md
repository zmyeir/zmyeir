+++
title = "解决 Heroku-cli 无法登陆"
categories = ["note"]
tags = ["cli", "heroku"]
date = "2020-10-17T13:35:00+08:00"
lastmod = "2020-10-17T13:35:00+08:00"
#images = "/imgs/herokuclilogin/cover.jpg"
slug = "herokuclilogin"
+++

在折腾 heroku 部署 OLAINDEX 时，使用 `heroku login` 但出现报错

<!--more-->

```
 ›   Warning: login is not a heroku command.
Did you mean join? [y/n]: y
 ›   Error: Missing required flag:
 ›    -a, --app APP  app to run command against
 ›   See more help with --help
```
随即便尝试使用 `heroku login -i` 但依旧是无法登陆

于是便去看了看 help ，找到了解决方法。

### 1.获取 API Key

登陆 Heroku 后，前往 [Account settings](https://dashboard.heroku.com/account) 页

找到 **API** 选项，点击 **Reveal** 复制 API Key

### 2.新建 .netrc

Linux：

```
touch ~/.netrc
```

Windows：找到环境变量目录新建：`.netrc` 文件

### 3.编辑 .netrc

使用vi/vim等编辑器编辑 `~/.netrc`

输入如下内容：

```
machine api.heroku.com
  login #heroku绑定的邮箱
  password #你的API Key
machine git.heroku.com
  login #heroku绑定的邮箱
  password #你的API Key
```

随后就可以尝试进行操作了233

Enjoy !
