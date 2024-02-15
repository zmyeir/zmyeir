+++
title = "小米 MIX 2S System 分区扩容"
description = "由于MIX 2S的System分区过小，导致部分gsi无法刷入，故扩容分区，顺便制作为卡刷包方便使用。"
categories = ["tech"]
tags = ["android"]
date = "2020-08-09T18:17:00+08:00"
lastmod = "2020-08-09T18:17:00+08:00"
#images = "/imgs/mix2skr/cover.jpg"
slug = "mix2skr"
toc = true
+++

## 前言：

由于 MIX 2S 的 System 分区过小，导致部分 gsi 无法刷入，故扩容分区，顺便制作为卡刷包方便使用。

<!--more-->

## 设备要求：

i：确保您的设备为小米 MIX 2s

ii：设备已解除BL锁并拥有第三方 Recovery

## 有损扩容

### 使用方法：

i：下载本人提供的 MIX2s_5GB_System.zip 文件

ii：重启至 Recovery

iii：找到 MIX2s_5GB_System.zip 并刷入

iv:重启至 Recovery，格式化： System,Vendor,Data

注意：由于会清除 System,Vendor,Data 三个分区的数据，请提前备份您的所有重要数据，如果您的身边没有电脑或其它存储设备，请下载 los 的 ROM 并复制到 /cust 目录一份，方便刷入。

### 原理：

使用 `sgdisk` 对磁盘进行重新分区

### 常见问题：

Q:扩容之后可以还原吗？

A:可以，刷一次 3GB 的文件即可还原。另：如果已经扩容分区，之后想更换其它的大小的分区，请务必先还原。

Q:扩容之后可以刷官方 ROM 吗？

A:可以，但是需要注意官方有 dm 校验，不去除会卡第一屏，可以通过同时刷入 magisk 去除。

Q:扩容之后可以线刷吗？

A:可以，但不推荐这样做，如果需要线刷，请勿勾选锁定选项，否则可能会导致需要售后解决。

Q:为什么我扩容之后刷入 ROM 却显示 System 大小为 3GB

A:这是因为 ROM 打包时是按照 3GB 大小打包的，请前往 Recovery，点击：分区管理 - System - 调整分区大小。Vendor 分区同理。

## 无损扩容

此方法极度危险，并且不推荐使用，如果您没有相关经验，请谨慎。

手机重启至第三方 Recovery 连接电脑，下载我提供的无损扩容文件

解压并进入目录,按 Shift+右键 选择打开 Powershell

输入以下命令（此处为win10）：

```shell

./adb push sgdisk /sbin
./adb shell
comod 0777 /sbin/sgdisk

sgdisk --delete=18 /dev/block/sda
sgdisk --delete=19 /dev/block/sda
sgdisk --delete=20 /dev/block/sda
sgdisk --delete=47 /dev/block/sde
sgdisk --delete=48 /dev/block/sde

sgdisk --new 0:0:+1024M --change-name=18:vendor --typecode=18:97D7B011-54DA-4835-B3C4-917AD6E73D74 /dev/block/sda
sgdisk --new 0:0:+64M --change-name=19:recovery --typecode=19:9D72D4E4-9958-42DA-AC26-BEA7A90B0434 /dev/block/sda
sgdisk --new 0:0:0 --change-name=20:cache --typecode=20:5594C694-C871-4B5F-90B1-690A6F68E0F7 /dev/block/sda
sgdisk --new 0:0:+512M --change-name=47:cust --typecode=47:C3008246-512A-4FEB-8A51-068FA4AD5F6D /dev/block/sde
sgdisk --new 0:0:0 --change-name=48:system --typecode=48:97D7B011-54DA-4835-B3C4-917AD6E73D74 /dev/block/sde

reboot bootloader
```

此时手机将重启至 fastboot ，保持设备连接，在 Powershell 中输入：

```shell
./fastboot flash recovery recovery.img
./fastboot boot recovery.img
```

不出意外，您的手机将重启至 Recovery ，请保持设备连接。
在 Powershell 中输入：

```shell
./adb shell

mke2fs -t ext4 -b 4096 /dev/block/sde47
mke2fs -t ext4 -b 4096 /dev/block/sda18
e2fsdroid -e -S /file_contexts -a /vendor /dev/block/sda18
mke2fs -t ext4 -b 4096 /dev/block/sda20
e2fsdroid -e -S /file_contexts -a /cache /dev/block/sda20
mke2fs -t ext4 -b 4096 /dev/block/sde48
e2fsdroid -e -S /file_contexts -a / /dev/block/sde48
reboot recovery
```

并在 Recovery 中格式化： System,Vendor,Data,Cache

至此，扩容完成。

下方是本人执行扩容时的回显内容，可以参考。

```shell
PS C:\platform-tools> ./adb push sgdisk /sbin
PS C:\platform-tools> ./adb shell
sh-5.0# chmod 0777 /sbin/sgdisk
sh-5.0# sgdisk --delete=18 /dev/block/sda
Warning: The kernel is still using the old partition table.
The new table will be used at the next reboot.
The operation has completed successfully.
sh-5.0# sgdisk --delete=19 /dev/block/sda
Warning: The kernel is still using the old partition table.
The new table will be used at the next reboot.
The operation has completed successfully.
sh-5.0# sgdisk --delete=20 /dev/block/sda
Warning: The kernel is still using the old partition table.
The new table will be used at the next reboot.
The operation has completed successfully.
sh-5.0# sgdisk --delete=47 /dev/block/sde
The operation has completed successfully.
sh-5.0# sgdisk --delete=48 /dev/block/sde
The operation has completed successfully.
sh-5.0# sgdisk --new 0:0:+1024M --change-name=18:vendor --typecode=18:97D7B011-54DA-4835-B3C4-917AD6E73D74 /dev/block/>
Setting name!
partNum is 17
REALLY setting name!
Warning: The kernel is still using the old partition table.
The new table will be used at the next reboot.
The operation has completed successfully.

sh-5.0# sgdisk --new 0:0:+64M --change-name=19:recovery --typecode=19:9D72D4E4-9958-42DA-AC26-BEA7A90B0434 /dev/block/>
Setting name!
partNum is 18
REALLY setting name!
Warning: The kernel is still using the old partition table.
The new table will be used at the next reboot.
The operation has completed successfully.
sh-5.0# sgdisk --new 0:0:+0 --change-name=20:cache --typecode=20:5594C694-C871-4B5F-90B1-690A6F68E0F7 /dev/block/sda
Setting name!
partNum is 19
REALLY setting name!
Warning: The kernel is still using the old partition table.
The new table will be used at the next reboot.
The operation has completed successfully.

sh-5.0# sgdisk --new 0:0:+512M --change-name=47:cust --typecode=47:C3008246-512A-4FEB-8A51-068FA4AD5F6D /dev/block/sde
Setting name!
partNum is 46
REALLY setting name!
The operation has completed successfully.
sh-5.0# sgdisk --new 0:0:0 --change-name=48:system --typecode=48:97D7B011-54DA-4835-B3C4-917AD6E73D74 /dev/block/sde
Setting name!
partNum is 47
REALLY setting name!
The operation has completed successfully.
sh-5.0# sgdisk --print /dev/block/sde
Disk /dev/block/sde: 1179648 sectors, 4.5 GiB
Logical sector size: 4096 bytes
Disk identifier (GUID): A9708BF8-6148-6573-F93F-EF3C911FC364
Partition table holds up to 64 entries
First usable sector is 6, last usable sector is 1179642
Partitions will be aligned on 2-sector boundaries
Total free space is 16379 sectors (64.0 MiB)

Number  Start (sector)    End (sector)  Size       Code  Name
   1               6              13   32.0 KiB    FFFF  sec
   2              14              21   32.0 KiB    FFFF  limits
   3              22              63   168.0 KiB   FFFF  bk41
   4              64              95   128.0 KiB   FFFF  qupfw_a
   5              96             127   128.0 KiB   FFFF  qupfw_b
   6             128             191   256.0 KiB   FFFF  apdp
   7             192             255   256.0 KiB   FFFF  msadp
   8             256             287   128.0 KiB   FFFF  vbmeta
   9             288             319   128.0 KiB   FFFF  bk42
  10             320             351   128.0 KiB   FFFF  storsec_a
  11             352             383   128.0 KiB   FFFF  storsec_b
  12             384             447   256.0 KiB   FFFF  devcfg_a
  13             448             511   256.0 KiB   FFFF  devcfg_b
  14             512             639   512.0 KiB   FFFF  aop_a
  15             640             767   512.0 KiB   FFFF  aop_b
  16             768             895   512.0 KiB   FFFF  bk43
  17             896            1023   512.0 KiB   FFFF  bk44
  18            1024            1279   1024.0 KiB  FFFF  cmnlib_a
  19            1280            1535   1024.0 KiB  FFFF  cmnlib_b
  20            1536            1791   1024.0 KiB  FFFF  cmnlib64_a
  21            1792            2047   1024.0 KiB  FFFF  cmnlib64_b
  22            2048            2303   1024.0 KiB  FFFF  keymaster_a
  23            2304            2559   1024.0 KiB  FFFF  keymaster_b
  24            2560            2815   1024.0 KiB  FFFF  bluetooth
  25            2816            3071   1024.0 KiB  FFFF  bk45
  26            3072            3327   1024.0 KiB  FFFF  hyp_a
  27            3328            3583   1024.0 KiB  FFFF  hyp_b
  28            3584            3839   1024.0 KiB  FFFF  dip
  29            3840            4095   1024.0 KiB  FFFF  bk46
  30            4096            4607   2.0 MiB     FFFF  sti
  31            4608            5119   2.0 MiB     FFFF  toolsfv
  32            5120            5631   2.0 MiB     FFFF  abl_a
  33            5632            6143   2.0 MiB     FFFF  abl_b
  34            6144            7167   4.0 MiB     FFFF  tz_a
  35            7168            8191   4.0 MiB     FFFF  tz_b
  36            8192           10239   8.0 MiB     FFFF  fsg
  37           10240           12287   8.0 MiB     FFFF  dtbo
  38           12288           14335   8.0 MiB     FFFF  bk47
  39           14336           16383   8.0 MiB     FFFF  spunvm
  40           16384           20479   16.0 MiB    FFFF  bk48
  41           20480           24575   16.0 MiB    FFFF  bk49
  42           24576           32767   32.0 MiB    FFFF  splash
  43           32768           40959   32.0 MiB    FFFF  logo
  44           40960           49151   32.0 MiB    FFFF  dsp
  45           49152           65535   64.0 MiB    FFFF  boot
  46           65536          114687   192.0 MiB   0700  modem
  47          114688          245759   512.0 MiB   FFFF  cust
  48          245760         1163263   3.5 GiB     FFFF  system
  49         1163264         1179642   64.0 MiB    FFFF  last_parti
sh-5.0#
```

## 免责声明：

i：本人仅提供扩容文件，不对使用文件后造成的如：数据丢失、硬件损坏等后果负责。

ii：您必须明白并且承担使用文件后所造成的后果。

iii：如不同意以上内容请不要使用本文件。

扩容文件：

Link：[https://pans.lanzous.com/b0dq5x2ni](https://pans.lanzous.com/b0dq5x2ni)

Key:idkzr

扩容视频：

[http://www.bilibili.com/video/BV1gK411T74X](http://www.bilibili.com/video/BV1gK411T74X)
