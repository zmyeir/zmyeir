+++
title = "Arch Linux 配置小记"
categories = ["note"]
tags = ["linux", "archlinux"]
date = "2022-04-28T16:04:00+08:00"
lastmod = "2023-05-07T17:33:00+08:00"
#images = "/imgs/archlinux/cover.jpg"
slug = "archlinux"
+++

Arch Linux 配置备忘录~~(方便重装~~

<!--more-->

请查看更新版本： [ArchLinux安装及Snapper和btrfs-grub的使用](/posts/sabgia)

## 系统安装

老一套，关闭 Secure Boot 后U盘启动 

### 连接网络

由于我用的是笔记本，所以用 iwctl 连接 WiFi：

```bash
iwctl                                           # 进入 iwd 命令行
[iwd#] device list                              # 查询网卡设备
[iwd#] station <devicename> connect <wifi-ssid> # 连接 WiFi
[iwd#] exit                                     # 退出 iwd
```

使用 `ping` 测试网络是否可用：

```bash
ping -c4 1.2.4.8
```

### 更新系统时间

```bash
timedatectl set-ntp true
```

### 更换软件镜像源

使用 `vim` 修改 `/etc/pacman.d/mirrorlist` (别问我为啥不用 `reflector` ，问就自己去试试)

```text
Server = https://mirrors.ustc.edu.cn/archlinux/$repo/os/$arch
Server = https://mirrors.bfsu.edu.cn/archlinux/$repo/os/$arch
```

### 分区

[使用 Btrfs 安装 Arch Linux 小记](/posts/arch-btrfs/)

### 安装基本系统

老一套用 `pacstrap` 安装 base：

```bash
pacstrap /mnt base base-devel linux linux-firmware vim sudo zsh
```

### 基本配置

生成 fstab：

```bash
genfstab -U /mnt >> /mnt/etc/fstab
```

chroot 到新系统下：

```bash
arch-chroot /mnt
```

更改时区：

```bash
ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
hwclock --systohc
```

设置主机名：

```bash
echo YOURHOSTNAME > /etc/hostname
```

修改 `/etc/hosts`:

```bash
printf '
127.0.0.1   localhost
::1         localhost
127.0.1.1   YOURHOSTNAME.localdomain    YOURHOSTNAME\n
' > /etc/hosts
```

修改语言：

```bash
echo "en_US.UTF-8 UTF-8" >> /etc/locale.gen
echo "zh_CN.UTF-8 UTF-8" >> /etc/locale.gen
locale-gen
echo "LANG=en_US.UTF-8" > /etc/locale.conf
```

安装微码：

```bash
pacman -S intel-ucode # Intel
pacman -S amd-ucode # AMD
```

安装网络管理：

```bash
pacman -S networkmanager dhcpcd 
systemctl enable NetworkManager.service
systemctl enable dhcpcd.service
```

音频驱动：

```bash
pacman -S alsa-utils sof-firmware
```

用户/密码：

```bash
passwd root
useradd -m -G wheel -s /bin/bash USERNAME
passwd USERNAME
EDITOR=vim visudo
#找到 ： # %wheel ALL=(ALL) ALL
#改为：
%wheel ALL=(ALL) ALL
```

### 配置 GURB

安装 GRUB：

```bash
pacman -S grub efibootmgr os-prober
```

生成引导：

```bash
grub-install --target=x86_64-efi --efi-directory=/boot/efi --bootloader-id=ARCH
grub-mkconfig -o /boot/grub/grub.cfg
```

### 安装 KDE Plasma

安装字体：

```bash
pacman -S noto-fonts-cjk noto-fonts-emoji
```

安装 KDE 和 Fcitx5：

```bash
pacman -S sddm plasma-mate konsole dolphin fcitx5-im fcitx5-chinese-addons fcitx5-material-color
systemctl enable sddm
```

### 完成安装

```bash
exit # 退出chroot
umount -R /mnt # 卸载目录
reboot
```

## KDE 配置

字体 vim ：
```bash
<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <alias>
    <family>sans-serif</family>
    <prefer>
      <family>Noto Sans CJK SC</family>
      <family>Noto Sans CJK TC</family>
      <family>Noto Sans CJK JP</family>
    </prefer>
  </alias>
  <alias>
    <family>serif</family>
    <prefer>
      <family>Noto Serif CJK SC</family>
      <family>Noto Serif CJK TC</family>
      <family>Noto Serif CJK JP</family>
    </prefer>
  </alias>
  <alias>
    <family>monospace</family>
    <prefer>
      <family>FiraCode Nerd Font Mono</family>
      <family>Hack Nerd Font Mono</family>
    </prefer>
  </alias>
</fontconfig>
```

先写到这，有空再加
