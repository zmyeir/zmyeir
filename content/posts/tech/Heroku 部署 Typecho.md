+++
title = "Heroku 部署安装 Typecho"
categories = ["tech"]
tags = ["web", "typecho", "heroku", "git"]
date = "2020-11-27T07:54:00+08:00"
lastmod = "2020-11-27T07:54:00+08:00"
#images = "/imgs/typechoonheroku/cover.jpg"
slug = "typechoonheroku"
toc = true
+++

突然发现 Heroku 的玩法属实不少，便想着能不能在 Heroku 上部署安装 Typecho，写篇文章记录一下。

<!--more-->

## 什么是 Heroku？

Heroku 是一个支持多种编程语言的 PaaS(Platform-as-a-Service)。在 2010 年被 Salesforce 收购。Heroku 作为最开始的云平台之一，从 2007 年 6 月起开始开发，当时它仅支持 Ruby，后来增加了对 Java、Node.js、Scala、Clojure、Python 以及 PHP 和 Perl 的支持。

## 1.Heroku基本配置

首先，我们需要一个 Heroku 账号，如果你还没有，请自行注册一个，并绑定一张信用卡&借记卡，这里不做多讲。

### 1.1 安装Heroku-cli

如果你的设备上已经安装了 Nodejs ，那么可以使用： `npm i heroku-cli -g` 来安装 `heroku-cli`

否则请按照[官方文档](https://devcenter.heroku.com/articles/heroku-cli)安装 `heroku-cli`

安装完成后使用：`heroku version` 来检查是否成功安装，如有类似以下输出则代表安装成功。

```shell
$ heroku version
heroku-cli/7.0.9 android-arm64 node-v12.18.3
```

### 1.2 配置Heroku-cli

安装完成 `heroku-cli` 后，使用 `heroku login -i` 登陆 Heroku，回显如下：

```shell
$ heroku login -i
heroku: Enter your login credentials
Email: xxx@mail.com
Password: 
Two-factor code: 
Logged in as xxx@mail.com
```

如果以上命令无法登陆，请参考[解决 Heroku-cli 无法登陆](/posts/herokuclilogin/)

然后添加 SSH 密钥:

```shell
$ heroku keys:add
```

## 2.部署 Typecho 至 Heroku

heroku-cli配置完成后就可以开始准备部署了。

### 2.1 新建 Typecho 项目

拉取 Typecho 源码并修改：

```shell
git clone https://github.com/zmyeir/typecho-on-heroku.git toh
cd toh
wget http://typecho.org/build.tar.gz
tar axf build.tar.gz
mv build/* Typecho/
rm -rf .git*
```

初始化 Git 仓库：

```shell
git init
git add .
git commit -m 'init heroku-te'
```

### 2.2 新建 Heroku 应用

这步可以在 web 操作，也可以使用 heroku-cli 进行配置，这里我使用 cli 来进行操作。
使用 `heroku create` 新建APP，创建成功将会输出类似如下内容:

```shell
$ heroku create
Creating app... done, ⬢ xxxxxx-xxxx-12345
https://xxxxxx-xxxx-12345.herokuapp.com/ | https://git.heroku.com/xxxxxx-xxxx-12345
```

其中：

- `xxxxxx-xxxx-12345`为应用名称
- `https://xxxxxx-xxxx-12345.herokuapp.com/`为访问链接
- `https://git.heroku.com/xxxxxx-xxxx-12345`为 git 仓库

应用名称可以使用 `heroku rename` 进行修改，此操作将会同步修改访问链接和 git 仓库地址，如：

```shell
$ heroku rename zr-te
```

### 2.3 设置应用语言

使用如下命令将应用语言设置为 PHP：

```shell
heroku buildpacks:set heroku/php
```

若不设置语言可能导致上传时报错

### 2.3 数据库配置

Heroku提供了 MySQL 和 PgSQL 两种数据库，以插件形式添加，并各有一定免费额度，两种数据库二选一即可。

添加MySQL插件：

```shell
heroku addons:create jawsdb-maria:kitefin
```

添加PgSQL插件：

```shell
heroku addons:create heroku-postgresql:hobby-dev
```

注：二选一即可，我这里使用 MySQL 举例。

添加完 MySQL/PgSQ L后，前往[Heroku管理面板](https://dashboard.heroku.com/apps)，找到刚才新建的应用，点击导航栏中的 **Settings**，找到 **Config Vars**  项，点击 **Reveal Config Vars**

![](/imgs/typechoonheroku/configvars.jpg)

将会显示 MySQL/PgSQL 连接信息，解析如下：

| NAME | KEY | VALUE |
|:----:|:----:|:----:|
|   MySQL   |   JAWSDB_MARIA_URL   |   mysql://用户名:密码@数据库主机:3306/数据库名称   |
|   PgSQL   |   DATABASE_URL   |   postgres://用户名:密码@数据库主机:5432/数据库名称   |

修改 `config.inc.php` 文件中数据库相关配置：

```php
/** 定义MySQL数据库参数 */
/**与下方PgSQL参数无法共存，请选择一项进行填写
$db = new Typecho_Db('Pdo_Mysql', 'typecho_');
$db->addServer(array (
  'host' => '数据库地址',
  'user' => '数据库用户名',
  'password' => '数据库密码',                                           'charset' => 'utf8mb4',
  'port' => '3306',
  'database' => '数据库名称',
  'engine' => 'MyISAM',
), Typecho_Db::READ | Typecho_Db::WRITE);
Typecho_Db::set($db);        **/


/** 定义PgSQL数据库参数 */
/**与上方MySQL参数无法共存，请选择一项进行填写
$db = new Typecho_Db('Pdo_Pgsql', 'typecho_');
$db->addServer(array (
  'host' => '数据库地址',
  'user' => '数据库用户名',
  'password' => '数据库密码',
  'charset' => 'utf8',
  'port' => '5432',
  'database' => '数据库名称',
), Typecho_Db::READ | Typecho_Db::WRITE);
Typecho_Db::set($db);        **/
```

删除其中一项的注释，并填写相关配置，然后更新 git 仓库：

```shell
git add .
git commit -m 'update config'
```

### 2.4 推送项目至 Heroku

接下来，使用如下命令将项目推送至 Heroku

```shell
git push heroku master
```

然后打开：https://`APP_NAME`.herokuapp.com/install.php

安装typecho

## 3.绑定域名

这一步非必须，为可选步骤。

前往[Heroku管理面板](https://dashboard.heroku.com/apps)，找到新建的应用，点击导航栏中的 **Settings**，下拉找到 **Domains**

点击 **Add domains**

![](/imgs/typechoonheroku/addom.jpg)

![](/imgs/typechoonheroku/editdom.jpg)

将域名解析至 cname 地址即可

Enjoy !😁
