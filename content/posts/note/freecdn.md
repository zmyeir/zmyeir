+++
title = "盘点一下那些我用过的免费CDN"
categories = ["note"]
tags = ["web", "cdn"]
date = "2020-04-16T14:26:00+08:00"
lastmod = "2020-04-16T14:26:00+08:00"
#images = "/imgs/freecdn/cover.jpg"
slug = "freecdn"
+++

众所周知，暂若是个的穷孩纸，没得一丢丢小钱钱，又想给网站套个CDN，加快一下访问速度，于是就有了这篇文章。

<!--more-->

> ## CDN是什么？
> CDN 的全称是 Content Delivery Network，即内容分发网络。依靠部署在各地的边缘服务器，通过中心平台的负载均衡、内容分发、调度等功能模块，使用户就近获取所需内容，降低网络拥塞，提高用户访问响应速度和命中率。

好的，现在进入正题盘点一下我用过的可以白嫖的 CDN，这里因为某些原因我会分为两个区。

## 备案区

域名备案了的话是会方便不少的，本人的备案注销了 QWQ。

### 一、又拍云

![yp](/imgs/freecdn/yp.jpg)

相信很多人都对又拍云有所耳闻，只需要在网页底部加入又拍云的 logo，即可申请加入又拍云联盟，之后每月可以享有 **15G** CDN 流量，支持 **http/https** 访问，速度不错国内一片绿。

链接：[https://www.upyun.com/](https://www.upyun.com/)

### 二、七牛云

![qn](/imgs/freecdn/qn.jpg)

七牛云也是国内老牌的商家了，七牛云的开发者计划提供了每月国内及海外分别 **10G** CDN 流量，但是仅针对 **http** 请求免费，https 需要额外付费，不过价格十分优惠，且可以通过邀请好友来提升免费额度。

链接： [https://www.qiniu.com/](https://www.qiniu.com/)

### 三、腾讯云

![tx](/imgs/freecdn/tx.jpg)

腾讯云针对新用户会在前六个月每月赠送 **50G** 流量包，六个月之后每月 **10G** 流量，本人在使用的时候发现对电信网络访问有一丢丢不友好，当然，也可能是我配置问题。

链接：[https://cloud.tencent.com/product/cdn](https://cloud.tencent.com/product/cdn)

### 四、百度云

![bd](/imgs/freecdn/bd.jpg)

百度云加速免费用户每天可用 **10G** 流量，并且按官网说法对百度搜索有 SEO 优化，可以加快百度收录速度，免费用户会分配8个国内节点和2个国外节点，总体来说还算不错。

链接：[https://su.baidu.com/](https://su.baidu.com/)

### 五、猫云

![my](/imgs/freecdn/my.jpg)

猫云算是个新秀，推出的猫云联盟和又拍云联盟类似，需要在网站底部加上猫云 logo，每月赠送 **30G** CDN 流量，访问速度也算不错。

链接：[https://www.maoyuncloud.com/](https://www.maoyuncloud.com/)

## 自由区
下面的这些都无需备案，自由发育(ಡωಡ)

### 1.Cloudflare

![cf](/imgs/freecdn/cf.jpg)

cf 可以说是霸主级别的存在，没得流量限制，免费用户可以通过 cfp 自选 IP 及分区域解析来实现访问速度的优化，不过这需要一点点耐心。

链接：[https://www.cloudflare.com/](https://www.cloudflare.com/)

### 2.Nodecache

![nc](/imgs/freecdn/nc.jpg)

新用户赠一个月流量，走 aff 注册账号享有 1t 流量和 100G 中国直连流量，也可以自行注册获得 500G 流量，这家最近推出了一个中国直连的流量包，速度还算不错。

链接：[https://www.nodecache.com/](https://console-api.nodecache.com/f?aff=37jNvr)

### 3.DDOS-GUARD

![dg](/imgs/freecdn/dg.jpg)

这家的CDN貌似不限流量，有香港的节点，速度还说得过去，不过使用 ssl 需要升级账户才行。

链接：[https://ddos-guard.net/](https://ddos-guard.net/)

### 4.企鹅小屋

![qe](/imgs/freecdn/qe.jpg)

企鹅小屋最近公测 CDN，可以免费开一年的套餐，限制两个域名，每个月 **50G** 流量，节点数量和质量还算不错，值得一试(ಡωಡ)

链接：[http://www.aipky.com/](http://www.aipky.com/)

### 5.其它

上面只说了我使用过的，还有一些我了解但没使用过的，各位可以自行尝试。
psychz.net  免费50G/月
netdepot.com 免费100G/月
AWS CLOUDFONT 12个月免费50G
