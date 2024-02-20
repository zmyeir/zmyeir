+++
title = "ArchLinux 安装及 Snapper 和 btrfs-grub 的使用"
categories = ["tech"]
tags = ["btrfs", "archlinux", "snapper"]
date = "2023-05-07T17:33:00+08:00"
lastmod = "2024-02-21T00:06:00+08:00"
#images = "/imgs/sabgia/cover.jpg"
slug = "sabgia"
toc = true
+++

时隔一年，又一次在 Btrfs 上安装 ArchLinux，再次记录一下（其实上次那篇还没写完就跑去用 openSUSE 了）

<!--more-->

上次的快照管理用的是 TimeShift ，但去年用 openSUSE 时，其自带的 Snapper 蛮好用，这次便在 Arch 也使用相同软件（

## 系统安装

系统的安装参考官方的： [Installation guide](https://wiki.archlinuxcn.org/wiki/%E5%AE%89%E8%A3%85%E6%8C%87%E5%8D%97)

这里主要记一下 Btrfs 的配置，可以[点击这里跳到分区章节](#磁盘分区)

### 连接网络

#### 有线

插入网线的情况下，默认无需配置即可直接使用

#### 无线

```shell
iwctl                                           # 进入 iwd 命令行
[iwd#] device list                              # 查询网卡设备
[iwd#] station <devicename> connect <wifi-ssid> # 连接 WiFi
[iwd#] exit                                     # 退出 iwd
```

### 启用SSHD

tty还是太难用了，不如用另外一台可使用ssh的设备来进行操作

```shell
systemctl start sshd
```

### 更新系统时间

```shell
timedatectl set-ntp true
```

### 更换软件镜像源

没有额外配置的情况下官方源速度还是有点慢的，按喜好使用 `vim` 修改 `/etc/pacman.d/mirrorlist`，  或者使用 `reflector` 皆可

个人喜欢更直接一点：

```shell
echo 'Server = https://mirrors.bfsu.edu.cn/archlinux/$repo/os/$arch' > /etc/pacman.d/mirrorlist
```

### 磁盘分区

分区看个人喜好，反正 `/` 肯定要有

我的分区结构如下：

- /dev/nvme0n1p1 `/efi` 1G ，EFI 分区

- /dev/nvme0n1p2 `/` 1024G，根目录的 `Btrfs` 分区

- /dev/nvme0n1p3 `Swap` 8G，SWAP 用于休眠

#### 创建分区

使用 `cfdisk /dev/nvme0n1` 分区 ~~（TUI真好用）~~ (还是gdisk好用)

#### 格式化分区

ESP (/efi) :

```shell
mkfs.fat -F32 -n XESP /dev/nvme0n1p1
```

Btrfs (/) :

```shell
mkfs.btrfs -f -L XOS /dev/nvme0n1p2
```

Swap :

```shell
mkswap -L SWAP /dev/nvme0n1p3
```

### 建立 Btrfs 子卷

不创建子卷用个锤锤 Btrfs ~~（bushi~~

#### 子卷规划

此处参考了openSUSE Wiki ：[SDB:BTRFS](https://zh.opensuse.org/SDB:BTRFS#.E9.BB.98.E8.AE.A4.E5.AD.90.E5.8D.B7)

- `@`：对应 `/`

- `@docker`：对应 `/var/lib/docker`

- `@flatpak`：对应 `/var/lib/flatpak`

- `@home`：对应 `/home`

- `@opt`：对应 `/opt`

- `@snapshots`：对应 `/.snapshots`

- `@var_cache`：对应 `/var/cache`

- `@var_log`：对应 `/var/log`

- `@var_tmp`：对应 `/var/tmp`

其中 `@var_cache，@var_log，@var_tmp` 关闭写时复制

#### 创建子卷

首先需要将 `Btrfs` 分区挂载到 `/mnt` 下：

```shell
mount -t btrfs -o compress=zstd /dev/nvme0n1p2 /mnt
```

>  compress 参数用于开启透明压缩，将会稍稍增加 CPU 工作量，按需开启

创建子卷：

```shell
btrfs su cr /mnt/@
btrfs su cr /mnt/@docker
btrfs su cr /mnt/@flatpak
btrfs su cr /mnt/@home
btrfs su cr /mnt/@opt
btrfs su cr /mnt/@snapshots
btrfs su cr /mnt/@var_cache
btrfs su cr /mnt/@var_log
btrfs su cr /mnt/@var_tmp
```

 随后便可 `umount /mnt` 来进行下一步配置。
 
### 挂载分区

使用需要的参数来挂载子卷及分区

```shell
DISK=/dev/disk/by-partlabel
BTRFS_OPTS=compress=zstd,noatime,ssd,space_cache=v2
```

子卷：

```shell
mount -o subvol=@,$BTRFS_OPTS -m $DISK/XOS /mnt
mount -o subvol=@docker,$BTRFS_OPTS -m $DISK/XOS /mnt/var/lib/docker
mount -o subvol=@flatpak,$BTRFS_OPTS -m $DISK/XOS /mnt/var/lib/flatpak
mount -o subvol=@home,$BTRFS_OPTS -m $DISK/XOS /mnt/home
mount -o subvol=@opt,$BTRFS_OPTS -m $DISK/XOS /mnt/opt
mount -o subvol=@snapshots,$BTRFS_OPTS -m $DISK/XOS /mnt/.snapshots
mount -o subvol=@var_cache,$BTRFS_OPTS -m $DISK/XOS /mnt/var/cache
mount -o subvol=@var_log,$BTRFS_OPTS -m $DISK/XOS /mnt/var/log
mount -o subvol=@var_tmp,$BTRFS_OPTS -m $DISK/XOS /mnt/var/tmp
```

EFI 分区：

```shell
mount -m $DISK/XESP /mnt/efi
```

 SWAP：
 
```shell
swapon /dev/nvme0n1p4
```

使用 `chattr` 命令来设置文件属性以取消部分文件夹 CoW 特性：

```shell
chattr +C /mnt/var/cache
chattr +C /mnt/var/log
chattr +C /mnt/var/tmp
```

### 安装系统

#### 基础系统

使用 `pacstrap` 安装基础系统

```shell
pacstrap /mnt \
  base base-devel \
  linux-zen linux-firmware sof-firmware  \
  btrfs-progs 
```

kernel 可选 ：linux，linux-lts，linux-zen，linux-rt，linux-hardened 

区别可查看：[Kernel - ArchWiki](https://wiki.archlinux.org/title/Kernel)
个人常用 `linux-zen` + `linux-lts`

#### 安装微码

intel：

```shell
pacstrap /mnt intel-ucode
```

amd：

```shell
pacstrap /mnt amd-ucode
```

#### 生成 fstab

```shell
genfstab -U /mnt >> /mnt/etc/fstab
sed -i 's/subvolid=.*,//' /mnt/etc/fstab
```

注意在使用 `genfstab` 生成 `fstab` 时会给子卷加上 `subvolid=` 参数，这会导致恢复快照出现问题，可使用 `sed -i 's/subvolid=.*,//' /path/to/fstab` 删除

#### 进入 chroot

```arch
arch-chroot /mnt su -
```

#### 基础配置 - 系统

1. 更改时区：

```shell
ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
hwclock --systohc
```

 2. 设置主机名：

```shell
echo arch >> /etc/hostname
```

3. 修改 `hosts`:

```shell
cat >> /etc/hosts << EOF
127.0.0.1	localhost
::1		          localhost
127.0.1.1	arch.localdomain arch
EOF
```

4. 语言及输入：

```shell
echo "en_US.UTF-8 UTF-8" >> /etc/locale.gen
echo "zh_CN.UTF-8 UTF-8" >> /etc/locale.gen
locale-gen
echo "LANG=en_US.UTF-8" >> /etc/locale.conf
echo KEYMAP=us >> /etc/vconsole.conf
```

> 不建议将 LANG 设置为 zh_CN.UTF-8，在tty环境下cjk 字符无法显示，打patch当我没说（x

#### 基础配置 - 软件

1. 安装系统及常用软件包：

```shell
pacman -Sy grub efibootmgr \
  linux-zen-headers linux-lts linux-lts-headers \
  networkmanager git subversion sudo ruby \
	helix neofetch zsh fd fzf exa bat 
```

2. 安装桌面环境及常用软件：

```shell
pacman -S plasma-meta sddm plasma-wayland-session xdg-desktop-portal \
  noto-fonts noto-fonts-cjk noto-fonts-emoji noto-fonts-extra wqy-zenhei \
  konsole dolphin gwenview ark kleopatra \
  packagekit-qt5 packagekit appstream-qt appstream \
  fcitx5-im fcitx5-material-color fcitx5-rime \
  firefox chromium
```

> 在大部分教程中，桌面环境是系统安装完成并重启之后安装的，但我个人是习惯在 archiso 中配置好大部分内容

#### 用户配置

添加一个新用户并配置权限：

```shell
passwd root
useradd -m -G wheel -s /bin/bash USERNAME
passwd USERNAME
```

```shell
EDITOR=helix visudo
#找到 ： # %wheel ALL=(ALL) ALL
#改为：
%wheel ALL=(ALL) ALL
```

#### 启动配置

1. ~~由于系统使用了 BTRFS，需要对 `/etc/mkinitcpio.conf` 中的 `MODULES` 稍作修改 ：~~

```conf
MODULES=(btrfs)
```

并重新生成 initramfs ：

```shell
mkinitcpio -P
```

2. 安装 GRUB：

```shell
grub-install --target=x86_64-efi --efi-directory=/efi --bootloader-id='Arch Linux'
```

3. 修改内核参数：

```shell
# 去掉 quiet 参数，调整 loglevel 值为 5 ，加入 nowatchdog 参数

sed -i "s|GRUB_CMDLINE_LINUX_DEFAULT.*|GRUB_CMDLINE_LINUX_DEFAULT=\"loglevel=5 nowatchdog\"|" /etc/default/grub
```

> 注意：如果使用了以下参数：
> ```
> GRUB_DEFAULT=saved
> GRUB_SAVEDEFAULT="true"
> ```
>可能会导致开机出现：error: sparse file not allowed

4. 生成 GRUB 配置文件

```shell
grub-mkconfig -o /boot/grub/grub.cfg
```

5. 启用网络管理及 SDDM

```shell
systemctl enable NetworkManager.service
systemctl enable sddm.service
```

#### 完成安装

```shell
exit # 退出chroot
umount -R /mnt # 卸载目录
reboot
```

### 进阶配置

有些配置在 archiso 不方便进行，开机之后再来

#### 输入法

前面安装桌面环境中已经安装了 `fcitx5-rime`，使用 [Rime Auto Deploy](https://github.com/Mark24Code/rime-auto-deploy) 来安装 `rime-ice`

```shell
sudo pacman -Sy ruby
git clone --depth=1 https://github.com/Mark24Code/rime-auto-deploy.git --branch latest
cd rime-auto-deploy
./installer.rb
```

#### 系统休眠

1. 确定 swap 分区 uuid：

```shell
sudo blkid
```

2. 修改内核启动参数：

```shell
sudo vim /etc/default/grub
```

- 找到 GRUB_CMDLINE_LINUX_DEFAULT ，加入：
resume=UUID=${UUID}

3. 更新 GRUB 配置：

```shell
sudo grub-mkconfig -o /boot/grub/grub.cfg
```

4. 修改 /etc/mkinitcpio.conf 中的 HOOKS 行，添加 resume 值：

```shell 
sudo vim /etc/mkinitcpio.conf
......
HOOKS=(... udev resume ...)
......
```

5. 重新生成 initramfs：

```shell
sudo mkinitcpio -P
```

#### 添加软件源

Arch Linux CN：

```shell
cat >> /etc/pacman.conf << EOF
[archlinuxcn]
Server = https://mirrors.bfsu.edu.cn/archlinuxcn/\$arch
EOF
sudo pacman -Sy archlinuxcn-keyring
```

Arch4edu：

```shell
#导入 GPG Key
pacman-key --recv-keys 7931B6D628C8D3BA
pacman-key --finger 7931B6D628C8D3BA
pacman-key --lsign-key 7931B6D628C8D3BA
#添加源
cat >> /etc/pacman.conf << EOF
[arch4edu]
Server = https://mirrors.bfsu.edu.cn/arch4edu/\$arch
EOF
```

#### AUR Helper

```shell
sudo pacman -S paru
```

## 快照配置

这里选择 snapper + grub-btrfs

### Snapper

安装：

```shell
sudo pacman -S snapper snap-pac
```

创建 `snapper` 配置文件：

```shell
sudo snapper -c root create-config /
```

#### 配置snapshots子卷

`snapper` 默认会创建一个 `/.snapshots` 子卷，~~但这不archlinux~~，需要删掉~（当然，保持默认也能用）

```shell
btrfs su del /.snapshots
mkdir /.snapshots
```

前面创建了 `@snapshots` 没有使用，现在是时候挂载了（

使用 `sudo vim /etc/fstab` 修改fstab（找着上面的挂载参数照抄，把子卷换成 `@snapshots` 挂载点为：`/.snapshots`） ~~这一步不好自动化:(~~

修改完成后用  `sudo mount -a` 重新挂载

#### 配置 Snapper 

配置用户组：

```shell
sudo sed -i "s/ALLOW_USERS=\".*\"/ALLOW_USERS=\"$(whoami)\"/" /etc/snapper/configs/root
sudo sed -i "s/ALLOW_GROUPS=\".*\"/ALLOW_GROUPS=\"$(whoami)\"/" /etc/snapper/configs/root
```

配置快照规则：

```shell
sudo vim /etc/snapper/configs/root
......
# limits for timeline cleanup
TIMELINE_MIN_AGE="1800"
TIMELINE_LIMIT_HOURLY="5"
TIMELINE_LIMIT_DAILY="7"
TIMELINE_LIMIT_WEEKLY="0"
TIMELINE_LIMIT_MONTHLY="0"
TIMELINE_LIMIT_YEARLY="0"
......
```

启用自动快照：

```shell
sudo systemctl enable --now snapper-timeline.timer
sudo systemctl enable --now snapper-cleanup.timer
```

### Grub-Btrfs

安装：

```shell
sudo pacman -S grub-btrfs inotify-tools
```

启用：

```shell
sudo systemctl enable --now grub-btrfsd.service
grub-mkconfig -o /boot/grub/grub.cfg
```

### Btrfs-assistant

快照/子卷GUI管理，没啥好说的，安装就行了

```shell
sudo pacman -S btrfs-assistant
```

## 参考

1. [Btrfs：认识、从Ext4迁移与快照方案 | KAAAsS&#039;s blog](https://blog.kaaass.net/archives/1748)

2. [Deebble/arch-btrfs-install-guide](https://github.com/Deebble/arch-btrfs-install-guide)

嗯，成功又写了一遍arch安装过程（逃
