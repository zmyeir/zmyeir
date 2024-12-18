+++
title = "Typecho 迁移至 Hugo"
categories = ["tech"]
tags = ["web", "typecho", "hugo"]
date = "2021-09-20T06:04:00+08:00"
lastmod = "2021-09-20T06:04:00+08:00"
cover = "/imgs/te2hugo/cover.jpg"
slug = "te2hugo"
toc = true
+++

本文又名：《关于我想换个主题，却导致服务器崩溃，以至于我导出数据库更换博客程序这件事》

<!-- more -->

距离抛弃 Hexo 转向使用 typecho 已经 271 天了，在这次事故后，我决定回到 Hugo 的怀抱🤣。

博客嘛，总是在一次次折腾中不断重生，慢慢的学习新的内容，随后便是长时间的咕咕咕🕊。

## 1. 数据导出

需要导出的内容也就文章和独立页面，或许还有个评论（因为我本身就没用Typecho的原生评论，所以我直接忽略)。

### 1.1 文章导出

这里推荐使用 [Typecho export hugo](https://github.com/lizheming/typecho-export-hugo/)这个插件。

食用方法：下载后上传解压到 plugins 目录下，将其重命名为Export2Hugo，随后启用插件并在后台找到 导出至Hugo 即可。

如果你和我一样，因为某些原因无法 进入后台/启用插件 这类情况，可以使用 mysqldump 将数据库导出到本地，随后使用[Mysql to Sqlite](https://github.com/dumblob/mysql2sqlite)将其转换为sqlite db(当然，你要是本来就用的sqlite3就更好了)，然后，使用[Typecho to Hugo](https://github.com/gucheen/typecho2hugo) 将其转换为hugo适用的.md文件即可。(另，这是个nodejs项目，请自行配置环境)

### 1.2 评论导出

如果你准备使用[Twikoo](https://twikoo.js.org/)，那么点击[这里](https://github.com/Android-KitKat/twikoo-import-tools-typecho)  
如果你准备使用[Valine](https://valine.js.org/)/[Waline](https://Waline.js.org/)，请点击[这里](https://github.com/lizheming/typecho-export-valine)  
如果你准备使用[Disqus](https://disqus.com/)这类程序，请尝试使用[ByeTyp](https://github.com/ibadboy-net/ByeTyp/)导出WXR文件。

## 2. Hugo配置

这部分没啥好说的，我主要写永久链接相关（以下配置默认为yaml格式）

由于hugo的链接是基于目录的，默认生成的链接格式为:

```
# 文章：
/post/slug/

# 独立页面：
/slug/
```

而大多数用户使用typecho时设置的是这样的：
```
# 文章：
/archives/slug/
或
/posts/slug/
或
/archives/slug.html
或
/posts/slug.html
# 独立页面：
/slug/
或
/slug.html
```

针对使用 `/posts/slug/` 这类链接只需在修改hugo配置的permalinks部分：
```yaml
permalinks:
    post: /posts/:slug/
    page: /:slug/
```
但如果你使用了.html后缀，如果直接修改permalinks为 `post: /posts/:slug.html` ，hugo会生成`/posts/slug.html/`还是个目录。

查看官方文档后发现，想生成 `.html` 结尾的链接需要在配置中添加：`uglyurls: true` ，也就是如下配置:
```yaml
uglyurls: true
permalinks:
    post: /posts/:slug.html
    page: /:slug.html
```

但是，这样做会导致分类、标签这类聚合页也以`.html`结尾，于是我又去瞅了瞅文档，解决方法也简单。

以分类为例：
在`content`下创建`categories`目录，新建一个`_index.md`文件，并在Front Matter中指定`slug: /categories/`或`url: /categories/`即可，标签或文章页也是如此。

Enjoy！
