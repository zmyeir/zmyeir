+++
title = "YubiKey 与 GnuPG"
categories = ["tech"]
tags = ["gpg", "git"]
date = "2023-01-20T11:41:00+08:00"
lastmod = "2023-01-20T11:41:00+08:00"
#images = "/imgs/ykandgpg/cover.jpg"
slug = "ykandgpg"
toc = true
+++

感谢 CloudFlare 提供的福利让我用上了很贵的 YubiKey（逃

<!--more-->

从下单到发货到到手中间花了一个多月，在此之前一直用的是国内的开源替代品 CanoKeys（有兴趣可以去了解一下，便宜大碗）

## 什么是GPG/Yubikey

GPG (GNU Privacy Guard) 是一个密码学软件，用于加密、签名通信内容及管理非对称密码学的密钥。GnuPG 是自由软件，遵循 IETF 订定的 OpenPGP 技术标准设计，并与 PGP 保持兼容。

YubiKey 是由 Yubico 生产的身份认证设备，支持一次性密码（OTP）、公钥加密和身份认证，以及由FIDO联盟（FIDO U2F）开发的通用第二因素（U2F）协议。

（建议去看wiki，更详细）

## 子密钥转移至YK

我相信大部分 GPG 用户都是日常使用子密钥的吧～ ~~（不会真的有人直接用主密钥吧）~~

现在，插入你的 YK，在终端执行 `gpg --card-status` 应该会显示这样的输出：

```shell
> gpg --card-status
Reader ...........: Yubico YubiKey OTP FIDO CCID
Application ID ...: D000000000000000000000000000000
Application type .: OpenPGP
Version ..........: 3.4
Manufacturer .....: Yubico
# ......
```

或者这样的（我一度怀疑是不是udev和gpg有问题）：

```shell
> gpg --card-status
Reader ...........: 1050:0407:X:0
Application ID ...: D000000000000000000000000000000
Application type .: OpenPGP
Version ..........: 3.4
Manufacturer .....: Yubico
# ......
```

### 转移密钥

⚠️请记得提前备份密钥。⚠️请记得提前备份密钥。⚠️请记得提前备份密钥。提一句，kleopatra 用户请分别备份每一个 subkey ，说多了都是泪呜呜呜

>默认 PIN：123456

>默认 Admin PIN：12345678

打开终端，输入 `gpg --expert --edit-key <id>`

然后使用 `key x` 依次选中/取消密钥，并执行 `keytocard` 即可导入

### 打开触摸认证
```shell
 ykman openpgp keys set-touch [SIG|ENC|AUT|ATT] [on|off|fixed|cached|cached-fixed]
```

先写这么多，后面再说（逃
