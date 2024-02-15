+++
title = "Arch Linux 在红米5 Plus (MSM8953) 上的移植"
summary = "Arch Linux 与主线 kernel 在 红米5 Plus (MSM8953) 上的移植"
categories = ["tech"]
tags = ["linux", "archlinux"]
date = "2024-02-13T20:13:10+08:00"
lastmod = "2024-02-13T20:13:10+08:00"
slug = "archlinux-on-vince"
toc = true
+++

## 前言

在 Android 上运行 Linux 发行版这件事我大概从 18 年就开始了，但是当时是使用 termux+proot 的组合，后面写了个脚本来调用 unshare，使用 magisk 来随系统启动，一直到现在hhh

前些天收拾东西发现有个被遗忘的红米 5 PLus，但是无限重启，在下载固件时发现 Vince 有 [postmarkedOS](https://wiki.postmarketos.org/wiki/Xiaomi_Redmi_5_Plus_(xiaomi-vince))  的支持，故事从此开始~

pmOS 是一个基于 Alpine 的发行版，Alpine 是个使用musl 和openrc 而非 glibc+systemd 的 Linux 发行版，但这问题不大本人日常用 Void Linux 也是 musl+runit 的组合，但是把 Alpine 用在容器以外的地方还是感觉有的怪（x，还是用 Arch Linux 比较~~棒~~（

好了，开始正文部分

要在手机上跑起来 Linux 发行版（说起来 Android 被开除 Linux 籍了）首先要准备一个 bootloader，其次是一个 Linux Kernel，最后再来一个 rootfs 就好了

bootloader 目前可用的有 lk2nd 和 edk2（SDM835以上），Vince 是 sd625，选 lk2nd。我这里直接用 pmOS 编译好的 lk2nd 镜像，下面就开始内核以及 rootfs 的准备

## 环境准备

我这里使用了 Debian12 (AMD64) 来进行交叉编译，有条件可以直接使用 ARM64 的设备（比如手机或者 ARM 的主机/服务器）来编译

### 安装依赖

交叉编译环境：

```shell
sudo apt install build-essential openssl pkg-config libssl-dev libncurses5-dev pkg-config minizip libelf-dev flex bison  libc6-dev libidn11-dev rsync bc liblz4-tool  
sudo apt install gcc-aarch64-linux-gnu dpkg dpkg-dev git debhelper
```

rootfs 构建：

```shell
sudo apt install arch-install-scripts qemu-user-static  android-platform-system-core mkbootimg
```

## 内核构建

内核源码： https://github.com/msm8953-mainline/linux

config：[ postmarketOS/pmaports](https://gitlab.com/postmarketOS/pmaports/-/raw/master/device/community/linux-postmarketos-qcom-msm8953/config-postmarketos-qcom-msm8953.aarch64)

### 源码拉取

拉取 v6.7.2-r0 分支（本文发布时最新签出）

```shell
mkdir ~/vince
cd ~/vince
git clone https://github.com/msm8953-mainline/linux.git -b v6.7.2-r0 --depth 1
cd linux
```

### 处理 Config

使用[@HandsomeHacker](https://blog.csdn.net/github_38345754)的脚本处理 config：

```shell
./check.sh </path/to/file> -w
```

脚本如下：
```shell
#!/bin/bash

FILE=$1

[ -f "$FILE" ] || {
	echo "Provide a config file as argument"
	exit
}

write=false

if [ "$2" = "-w" ]; then
	write=true
fi

CONFIGS_ON="
CONFIG_IKCONFIG
CONFIG_CPUSETS
CONFIG_AUTOFS4_FS
CONFIG_TMPFS_XATTR
CONFIG_TMPFS_POSIX_ACL
CONFIG_CGROUP_DEVICE
CONFIG_CGROUP_MEM_RES_CTLR
CONFIG_CGROUP_MEM_RES_CTLR_SWAP
CONFIG_CGROUP_MEM_RES_CTLR_KMEM
CONFIG_RTC_DRV_CMOS
CONFIG_BLK_CGROUP
CONFIG_CGROUP_PERF
CONFIG_IKCONFIG_PROC
CONFIG_SYSVIPC
CONFIG_CGROUPS
CONFIG_CGROUP_FREEZER
CONFIG_NAMESPACES
CONFIG_UTS_NS
CONFIG_IPC_NS
CONFIG_USER_NS
CONFIG_PID_NS
CONFIG_NET_NS
CONFIG_AUDIT
CONFIG_AUDITSYSCALL
CONFIG_AUDIT_TREE
CONFIG_AUDIT_WATCH
CONFIG_CC_STACKPROTECTOR
CONFIG_DEBUG_RODATA
CONFIG_DEVTMPFS
CONFIG_DEVTMPFS_MOUNT
CONFIG_DEVPTS_MULTIPLE_INSTANCES
CONFIG_ECRYPT_FS
CONFIG_ECRYPT_FS_MESSAGING
CONFIG_ENCRYPTED_KEYS
CONFIG_EXT4_FS_POSIX_ACL
CONFIG_EXT4_FS_SECURITY
CONFIG_FSNOTIFY
CONFIG_DNOTIFY
CONFIG_INOTIFY_USER
CONFIG_FANOTIFY
CONFIG_FANOTIFY_ACCESS_PERMISSIONS
CONFIG_KEYS
CONFIG_SWAP
CONFIG_VT
CONFIG_VT_CONSOLE
CONFIG_SECCOMP
CONFIG_STRICT_DEVMEM
CONFIG_SYN_COOKIES
CONFIG_BT
CONFIG_BT_RFCOMM
CONFIG_BT_RFCOMM_TTY
CONFIG_BT_BNEP
CONFIG_BT_BNEP_MC_FILTER
CONFIG_BT_BNEP_PROTO_FILTER
CONFIG_BT_HIDP
CONFIG_XFRM_USER
CONFIG_NET_KEY
CONFIG_INET
CONFIG_IP_ADVANCED_ROUTER
CONFIG_IP_MULTIPLE_TABLES
CONFIG_INET_AH
CONFIG_INET_ESP
CONFIG_INET_IPCOMP
CONFIG_INET_XFRM_MODE_TRANSPORT
CONFIG_INET_XFRM_MODE_TUNNEL
CONFIG_INET_XFRM_MODE_BEET
CONFIG_IPV6
CONFIG_INET6_AH
CONFIG_INET6_ESP
CONFIG_INET6_IPCOMP
CONFIG_INET6_XFRM_MODE_TRANSPORT
CONFIG_INET6_XFRM_MODE_TUNNEL
CONFIG_INET6_XFRM_MODE_BEET
CONFIG_IPV6_MULTIPLE_TABLES
CONFIG_NETFILTER
CONFIG_NETFILTER_ADVANCED
CONFIG_NETFILTER_NETLINK
CONFIG_NETFILTER_NETLINK_ACCT
CONFIG_NETFILTER_NETLINK_LOG
CONFIG_NETFILTER_NETLINK_QUEUE
CONFIG_NETFILTER_TPROXY
CONFIG_NETFILTER_XTABLES
CONFIG_NETFILTER_XT_CONNMARK
CONFIG_NETFILTER_XT_MARK
CONFIG_NETFILTER_XT_MATCH_ADDRTYPE
CONFIG_NETFILTER_XT_MATCH_CLUSTER
CONFIG_NETFILTER_XT_MATCH_COMMENT
CONFIG_NETFILTER_XT_MATCH_CONNBYTES
CONFIG_NETFILTER_XT_MATCH_CONNLIMIT
CONFIG_NETFILTER_XT_MATCH_CONNMARK
CONFIG_NETFILTER_XT_MATCH_CONNTRACK
CONFIG_NETFILTER_XT_MATCH_CPU
CONFIG_NETFILTER_XT_MATCH_DCCP
CONFIG_NETFILTER_XT_MATCH_DEVGROUP
CONFIG_NETFILTER_XT_MATCH_DSCP
CONFIG_NETFILTER_XT_MATCH_ECN
CONFIG_NETFILTER_XT_MATCH_ESP
CONFIG_NETFILTER_XT_MATCH_HASHLIMIT
CONFIG_NETFILTER_XT_MATCH_HELPER
CONFIG_NETFILTER_XT_MATCH_HL
CONFIG_NETFILTER_XT_MATCH_IPRANGE
CONFIG_NETFILTER_XT_MATCH_LENGTH
CONFIG_NETFILTER_XT_MATCH_LIMIT
CONFIG_NETFILTER_XT_MATCH_MAC
CONFIG_NETFILTER_XT_MATCH_MARK
CONFIG_NETFILTER_XT_MATCH_MULTIPORT
CONFIG_NETFILTER_XT_MATCH_NFACCT
CONFIG_NETFILTER_XT_MATCH_OSF
CONFIG_NETFILTER_XT_MATCH_OWNER
CONFIG_NETFILTER_XT_MATCH_PKTTYPE
CONFIG_NETFILTER_XT_MATCH_POLICY
CONFIG_NETFILTER_XT_MATCH_QUOTA
CONFIG_NETFILTER_XT_MATCH_QUOTA2
CONFIG_NETFILTER_XT_MATCH_RATEEST
CONFIG_NETFILTER_XT_MATCH_REALM
CONFIG_NETFILTER_XT_MATCH_RECENT
CONFIG_NETFILTER_XT_MATCH_SCTP
CONFIG_NETFILTER_XT_MATCH_SOCKET
CONFIG_NETFILTER_XT_MATCH_STATE
CONFIG_NETFILTER_XT_MATCH_STATISTIC
CONFIG_NETFILTER_XT_MATCH_STRING
CONFIG_NETFILTER_XT_MATCH_TCPMSS
CONFIG_NETFILTER_XT_MATCH_TIME
CONFIG_NETFILTER_XT_MATCH_U32
CONFIG_NETFILTER_XT_TARGET_AUDIT
CONFIG_NETFILTER_XT_TARGET_CHECKSUM
CONFIG_NETFILTER_XT_TARGET_CLASSIFY
CONFIG_NETFILTER_XT_TARGET_CONNMARK
CONFIG_NETFILTER_XT_TARGET_CONNSECMARK
CONFIG_NETFILTER_XT_TARGET_CT
CONFIG_NETFILTER_XT_TARGET_DSCP
CONFIG_NETFILTER_XT_TARGET_HL
CONFIG_NETFILTER_XT_TARGET_IDLETIMER
CONFIG_NETFILTER_XT_TARGET_LED
CONFIG_NETFILTER_XT_TARGET_LOG
CONFIG_NETFILTER_XT_TARGET_MARK
CONFIG_NETFILTER_XT_TARGET_NFLOG
CONFIG_NETFILTER_XT_TARGET_NFQUEUE
CONFIG_NETFILTER_XT_TARGET_NOTRACK
CONFIG_NETFILTER_XT_TARGET_RATEEST
CONFIG_NETFILTER_XT_TARGET_SECMARK
CONFIG_NETFILTER_XT_TARGET_TCPMSS
CONFIG_NETFILTER_XT_TARGET_TCPOPTSTRIP
CONFIG_NETFILTER_XT_TARGET_TEE
CONFIG_NETFILTER_XT_TARGET_TPROXY
CONFIG_NETFILTER_XT_TARGET_TRACE
CONFIG_NF_CONNTRACK_ZONES
CONFIG_IP6_NF_FILTER
CONFIG_IP6_NF_IPTABLES
CONFIG_IP6_NF_MANGLE
CONFIG_IP6_NF_MATCH_AH
CONFIG_IP6_NF_MATCH_EUI64
CONFIG_IP6_NF_MATCH_FRAG
CONFIG_IP6_NF_MATCH_HL
CONFIG_IP6_NF_MATCH_IPV6HEADER
CONFIG_IP6_NF_MATCH_MH
CONFIG_IP6_NF_MATCH_OPTS
CONFIG_IP6_NF_MATCH_RPFILTER
CONFIG_IP6_NF_MATCH_RT
CONFIG_IP6_NF_QUEUE
CONFIG_IP6_NF_RAW
CONFIG_IP6_NF_SECURITY
CONFIG_IP6_NF_TARGET_HL
CONFIG_IP6_NF_TARGET_REJECT
CONFIG_IP6_NF_TARGET_REJECT_SKERR
CONFIG_DNS_RESOLVER
CONFIG_IOSCHED_DEADLINE
CONFIG_SUSPEND_TIME
CONFIG_CORE_DUMP_DEFAULT_ELF_HEADERS
CONFIG_CONSOLE_TRANSLATIONS
CONFIG_EVM
CONFIG_INTEGRITY_SIGNATURE
CONFIG_FHANDLE
CONFIG_EPOLL
CONFIG_SIGNALFD
CONFIG_TIMERFD
CONFIG_TMPFS_POSIX_ACL
"

CONFIGS_OFF="
"
CONFIGS_EQ="
"

ered() {
	echo -e "\033[31m" $@
}

egreen() {
	echo -e "\033[32m" $@
}

ewhite() {
	echo -e "\033[37m" $@
}

echo -e "\n\nChecking config file for Halium specific config options.\n\n"

errors=0
fixes=0

for c in $CONFIGS_ON $CONFIGS_OFF;do
	cnt=`grep -w -c $c $FILE`
	if [ $cnt -gt 1 ];then
		ered "$c appears more than once in the config file, fix this"
		errors=$((errors+1))
	fi

	if [ $cnt -eq 0 ];then
		if $write ; then
			ewhite "Creating $c"
			echo "# $c is not set" >> "$FILE"
			fixes=$((fixes+1))
		else
			ered "$c is neither enabled nor disabled in the config file"
			errors=$((errors+1))
		fi
	fi
done

for c in $CONFIGS_ON;do
	if grep "$c=y\|$c=m" "$FILE" >/dev/null;then
		egreen "$c is already set"
	else
		if $write ; then
			ewhite "Setting $c"
			sed  -i "s,# $c is not set,$c=y," "$FILE"
			fixes=$((fixes+1))
		else
			ered "$c is not set, set it"
			errors=$((errors+1))
		fi
	fi
done

for c in $CONFIGS_EQ;do
	lhs=$(awk -F= '{ print $1 }' <(echo $c))
	rhs=$(awk -F= '{ print $2 }' <(echo $c))
	if grep "^$c" "$FILE" >/dev/null;then
		egreen "$c is already set correctly."
		continue
	elif grep "^$lhs" "$FILE" >/dev/null;then
		cur=$(awk -F= '{ print $2 }' <(grep "$lhs" "$FILE"))
		ered "$lhs is set, but to $cur not $rhs."
		if $write ; then
			egreen "Setting $c correctly"
			sed -i 's,^'"$lhs"'.*,# '"$lhs"' was '"$cur"'\n'"$c"',' "$FILE"
			fixes=$((fixes+1))
		fi
	else
		if $write ; then
			ewhite "Setting $c"
			echo  "$c" >> "$FILE"
			fixes=$((fixes+1))
		else
			ered "$c is not set"
			errors=$((errors+1))
		fi
	fi
done

for c in $CONFIGS_OFF;do
	if grep "$c=y\|$c=m" "$FILE" >/dev/null;then
		if $write ; then
			ewhite "Unsetting $c"
			sed  -i "s,$c=.*,# $c is not set," $FILE
			fixes=$((fixes+1))
		else
			ered "$c is set, unset it"
			errors=$((errors+1))
		fi
	else
		egreen "$c is already unset"
	fi
done

if [ $errors -eq 0 ];then
	egreen "\n\nConfig file checked, found no errors.\n\n"
else
	ered "\n\nConfig file checked, found $errors errors that I did not fix.\n\n"
fi

if [ $fixes -gt 0 ];then
	egreen "Made $fixes fixes.\n\n"
fi

ewhite " "
```

### 编译内核

将处理好的config重命名为.config移动到内核源码目录

编译内核：

```
# 交叉编译前务必设置环境变量
export ARCH=arm64
export CROSS_COMPILE=aarch64-linux-gnu-

# 配置内核模块压缩为 none，否则 Debian/Arch 不开机
make menuconfig 
make -j$(nproc)
```

生成 deb 包：

```shell
export ARCH=arm64
export CROSS_COMPILE=aarch64-linux-gnu-
export KBUILD_DEBARCH=arm64
export KDEB_CHANGELOG_DIST=mobile
make -j$(nproc)  deb-pkg
```

可选，如不生成，后续构建 rootfs 需要手动复制 vmLinuz。

生成的 deb 包在上级目录下。

## 构建 rootfs

可以选择使用[Arch Linux ARM](http://os.archlinuxarm.org/os/ArchLinuxARM-aarch64-latest.tar.gz)的官方预构建包

也可以使用 `pacstrap` 参考 Arch Linux 官方教程来构建root

这里使用预构建包：

```shell 
cd ~/vince
wget http://os.archlinuxarm.org/os/ArchLinuxARM-aarch64-latest.tar.gz
```

### 处理 rootfs

释放 rootfs 并挂载需要的目录：

```shell
mkdir rootfs
sudo tar axf ArchLinuxARM-aarch64-latest.tar.gz -C rootfs

# archlinux 需要挂载自身
sudo mount --bind ~/vince/rootfs/ ~/vince/rootfs
```

### 配置 rootfs

使用 `arch-chroot`  进入 rootfs 环境：

```shell
sudo arch-chroot rootfs su -
ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
```

#### 初始化 pacman keyring

```shell
pacman-key --init
pacman-key --populate archlinuxarm
```

#### 卸载内核及 firmware

```shell
pacman -R linux-aarch64 linux-firmware linux-firmware-whence
```

更新 rootfs：
```shell
pacman -Syu
```

#### 安装内核

打开一个新终端会话：

```shell
cd ~/vince/linux

sudo make ARCH=arm64 CROSS_COMPILE=aarch64-linux-gnu-  INSTALL_MOD_PATH=~/vince/rootfs modules_install

sudo make ARCH=arm64 INSTALL_PATH=~/vince/rootfs/boot install
```

如果上一步没有构建 deb 包就需要将 `arch/arm64/boot` 下的  `Image.gz`  手动复制到  `~/vince/rootfs/boot`

#### 安装 firmware

从 pmOS 或者 mobian 的 `/lib/firmware` 下复制所有文件到 rootfs 的 `/lib/firmware`

然后回到 rootfs 环境，安装 linux-firmware-qcom：

```shell
pacman -S linux-firmware-qcom
```

#### 系统及软件配置

参考[ArchLinux 安装及 Snapper 和 btrfs-grub 的使用](https://blog.zrlab.org/posts/sabgia/#基础配置---系统)

添加 danctnix 源：

```shell
echo '[danctnix]
Server = https://p64.arikawa-hi.me/$repo/$arch/' >> /etc/pacman.conf

wget https://p64.arikawa-hi.me/danctnix/aarch64/danctnix-keyring-2-1-any.pkg.tar.xz
pacman -U danctnix-keyring-2-1-any.pkg.tar.xz

pacman -Syu
```

前文未提到的必要软件：

```shell
pacman -S networkmanager modemmanager bluez bluez-utils  qrtr rmtfs git wget usbutils
systemctl enable NetworkManager 
systemctl enable bluetooth 
systemctl enable qrtr-ns 
systemctl enable rmtfs 
systemctl enable ModemManager
```

如不安装桌面环境：

```shell
pacman -Sy danctnix-usb-tethering openssh
systemctl enable usb-tethering
systemctl enable sshd
```

可连接 pc 使用RNDIS连接网络，使用 `ssh user@10.15.19.82` 来进行基本的网络配置(这个 ip 我真的，爬了十几分钟 Google)

#### 生成 initrd

```
kerver=$(ls /usr/lib/modules)
mkinitcpio --generate /boot/initrd.img-$kerver --kernel $kerver
```

### 打包镜像

清理缓存：

```shell
pacman -Scc
cat /dev/null > ~/.bash_history && history -c
```

随后 Ctrl+D 退出 rootfs

#### 配置文件系统

首先 dd 一个 4G 大小的 raw img，格式化为 ext4（或者你想要的文件系统）

```shell
cd ~/vince
dd if=/dev/zero of=rootfs.ext4 bs=1M count=4096
sudo mkfs.ext4 rootfs.ext4
```

记录刚刚的 UUID 备用，等下使用 `file` 指令也可获取

#### 同步文件

挂载 `rootfs.ext4`：

```shell
sudo mount rootfs.ext4 -m mnt
```

使用 `rsync` 迁移 rootfs ：

```shell
rsync -qaHAXS rootfs/ mnt
sudo umount -R mnt
```

#### 生成 simg

使用 img2simg 将 raw image 转换为sparse image

```shell
img2simg rootfs.ext4 rootfs.img
```

这样就得到的最终需要的 rootfs 了

## 构建 boot

还需要制作一个 boot.img 来启动 rootfs

### 准备文件：

```shell
mkdir mkboot

cp linux/arch/arm64/boot/Image.gz linux/arch/arm64/boot/dts/qcom/msm8953-xiaomi-vince.dtb mkboot

sudo cp rootfs/boot/initrd.img* mkboot/initrd.img

# 按你自己的用户来
sudo chown users:users -R mkboot
cd mkboot
```

### 为 kernel 附加设备树：

```shell
cat Image.gz msm8953-xiaomi-vince.dtb > kernel-dtb
```

### 生成 boot 镜像：

```shell
mkbootimg \
	--base 0x80000000 \
	--kernel_offset 0x00080000 \
	--ramdisk_offset 0x02000000 \
	--tags_offset 0x01e00000 \
	--pagesize 2048 \
	--second_offset 0x00f00000 \
	--ramdisk initrd.img \
	--cmdline "console=tty0 root=UUID=<分区UUID> rw loglevel=3 "\
	--kernel kernel-dtb -o boot.img
```

## 结语

以上，我们就得到了需要的 boot.img 和 rootfs.img ，刷入手机即可
![Arch Linux Kernel 6.7.2 aarch64](/imgs/archlinux-on-vince/device.jpg)

我也构建了成品放到 GitHub 上：zmyeir/msm8953-archlinux

## 参考

- [自己DIY一个pinephone——debian与主线linux在红米2（msm8916）上的移植](https://blog.csdn.net/github_38345754/article/details/114291930)
- [在骁龙（835 845 855等）设备通过UEFI运行Archlinux](https://forum.renegade-project.tech/t/835-845-855-uefi-archlinux/2497)
- [Xiaomi Redmi 5 Plus (xiaomi-vince)](https://wiki.postmarketos.org/wiki/Xiaomi_Redmi_5_Plus_(xiaomi-vince))
- [msm8953-mainline](https://github.com/msm8953-mainline)
