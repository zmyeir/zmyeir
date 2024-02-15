+++
title = "使用 Btrfs 安装 Arch Linux 小记"
categories = ["tech"]
tags = ["btrfs", "archlinux"]
date = "2022-04-18T16:04:00+08:00"
lastmod = "2024-02-13T13:39:00+08:00"
#images = "/imgs/arch-btrfs/cover.jpg"
slug = "arch-btrfs"
toc = true
+++

在向 186526 询问 Arch Linux 备份方案时，贴心的向我推荐了 Btrfs ,并跟我说滚挂了就滚回去(，加上因为某些问题实在闲的无聊，想着备份数据后重装

<!--more-->

请查看更新版本： [ArchLinux安装及Snapper和btrfs-grub的使用](/posts/sabgia)

## Btrfs：现代 Linux 文件系统

先来介绍一下 Btrfs ~~(NTRFS~~

### Btrfs

> 引自 [Wikipedia](https://zh.wikipedia.org/wiki/Btrfs)/ [Btrfs Wiki](https://btrfs.wiki.kernel.org/index.php/Main_Page)：
> 
> Btrfs 是一种新型的写时复制（CoW）Linux 文件系统，已经并入内核主线。你可以读作 **B**e**t**te**r** **F**ile **S**ystem、**B**-**tr**ee **F**ile **S**ystem、**B**u**t**ter **F**ile **S**ystem 等等，都是正确的。Btrfs 在设计实现高级功能的同时，着重于容错、修复以及易于管理。它由 Oracle、Red Hat、Fujitsu、Intel、SUSE、STRATO 等企业和开发者共同开发。Btrfs 以 **GNU GPL** 协议授权，同时也欢迎任何人的贡献。

### 特性

- 写时复制（CoW）

- 子卷（Subvolume）

- 快照（Snapshot）

- 透明压缩

- 软 RAID

- ......

对我来说快照和透明压缩这两个特性挺好用的（还有针对ssd的特殊优化）

万一滚挂了用快照恢复，透明压缩也能减少磁盘写入量

## 系统安装

系统安装就按正常走，把分区按btrfs即可

### 分区

这一部分就是重点了hhh

我的分区结构如下：

- /dev/nvme0n1p1 `/boot/efi` 1G ，EFI 分区

- /dev/nvme0n1p2 `/`256G，根目录的 `Btrfs` 分区

- /dev/nvme0n1p3 `Swap` 8G，用来休眠

#### 建立分区

使用`cfdisk /dev/nvme0n1`分区

```bash
# fdisk -l /dev/nvme0n1 

Disk /dev/nvme0n1: 476.94 GiB, 512110190592 bytes, 1000215216 sectors
Disk model: YMTC PC005 512GB                        
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: gpt
Disk identifier: A6EFB39C-17BC-4113-A296-28013437DA0A

Device             Start       End   Sectors  Size Type
/dev/nvme0n1p1      2048   2099199   2097152    1G EFI System
/dev/nvme0n1p2   2099200 538970111 536870912  256G Linux filesystem
/dev/nvme0n1p3 538970112 555747327  16777216    8G Linux swap

```

#### 格式化分区

EFI :

```bash
mkfs.fat -F32 /dev/nvme0n1p1
```

Btrfs :

```bash
mkfs.btrfs -f -m single -L Arch /dev/nvme0n1p2
```

Swap :

```bash
mkswap /dev/nvme0n1p3
```

#### 建立Btrfs子卷

- `@`：对应 `/`
- `@home`：对应 `/home`
- `@cache`：对应 `/var/cache`
- `@docker`：对应`/var/lib/docker`
- `@log`：对应 `/var/log`

其中 `@cache，@log`不使用写时复制

1.先将 `Btrfs` 分区挂载到 `/mnt` 下：

```bash
mount -t btrfs -o compress=lzo /dev/nvme0n1p2 /mnt
```

2.规划完成之后开始创建子卷：

```bash
btrfs subvol create /mnt/@
btrfs subvol create /mnt/@home
btrfs subvol create /mnt/@cache
btrfs subvol create /mnt/@docker
btrfs subvol create /mnt/@log
btrfs subvol create /mnt/@tmp
# 使用 chattr 忽略无需写时复制的目录
chattr +C /mnt/@cache
chattr +C /mnt/@log
# 取消挂载
umount /mnt
```

#### 挂载分区及Btrfs子卷

首先按先后顺序挂载 Btrfs 子卷

```bash
mount -o noatime,nodiratime,ssd,compress=lzo,subvol=@ /dev/nvme0n1p2 /mnt
mkdir -p /mnt/{boot/efi,home,var/{log,lib/docker,cache}}
mount -o noatime,nodiratime,ssd,compress=lzo,subvol=@home /dev/nvme0n1p2 /mnt/home
mount -o noatime,nodiratime,ssd,compress=lzo,subvol=@log /dev/nvme0n1p2 /mnt/var/log
mount -o noatime,nodiratime,ssd,compress=lzo,subvol=@docker /dev/nvme0n1p2 /mnt/var/lib/docker
mount -o noatime,nodiratime,ssd,compress=lzo,subvol=@cache /dev/nvme0n1p2 /mnt/var/cache
```

挂载 EFI 分区：

```bash
mount /dev/nvme0n1p1 /mnt/boot/efi
```

挂载 SWAP：

```bash
swapon /dev/nvme0n1p3
```


## 快照
我在用openSUSE的时候系统默认的是sanpper,本来想着arch也一样用来着，但我太笨了，还是用timeshift算了qwq

通过以下命令安装 Timeshift：
```bash
yay -S timeshift timeshift-autosnap grub-btrfs
```
然后，打开Timeshift，选btrfs一路点点点完事

## 参考

1. [使用 btrfs 文件系統安裝 archlinux | 寒风凛冽](https://snowfrs.com/2019/08/10/intall-archlinux-with-btrfs.html)
2. [Snapper - ArchWiki](https://wiki.archlinux.org/title/snapper)
3. [Btrfs：认识、从Ext4迁移与快照方案 | KAAAsS&#039;s blog](https://blog.kaaass.net/archives/1748)

嗯，成功写了一遍arch安装过程（逃
