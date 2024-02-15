+++
title = "基于 Coding CI 实现 Hexo 的持续集成与 Github 和 Coding 的同步部署"
categories = ["tech"]
tags = ["ci", "git", "hexo"]
date = "2020-02-20T16:41:00+08:00"
lastmod = "2020-02-20T16:41:00+08:00"
#images = "/imgs/codingci/cover.jpg"
slug = "codingci"
toc = true
+++

网上关于 Hexo 持续集成的文章大多是使用 Travis CI，也有不少同步部署到 Github 和 Coding 的教程，不过 Travis 只对 Github 的仓库提供CI服务，由于某些原因，Github 在国内的访问速度并不理想，所以采用 [Coding CI](https://help.coding.net/docs/devops/ci/introduce.html) 进行部署。

<!--more-->

> 具体流程如下：
> ![ci](/imgs/codingci/cover.jpg)

## 什么是持续集成(CI)：

> 持续集成（Continuous Integration，简称 CI）是一种软件开发实践，在实践中指只要代码有变更，就自动运行构建（包括编译，发布，自动化测试）来验证，从而尽早地发现集成错误。

## 1.获取访问令牌

因为是需要进行双端部署，这里需要分别获取 Github 和 Coding 的访问令牌

### 1.1 获取Coding访问令牌

![tokenc1](/imgs/codingci/tokenc1.jpg)

如图，点击新建令牌，描述可以随便填写，勾选 `project:depot` 的复选框即可。

![tokenc2](/imgs/codingci/tokenc2.jpg)

密钥只显示一次，请将获取到的密钥复制保存下来，并以 `用户名:密钥` 的方式组合起来。

![tokenc3](/imgs/codingci/tokenc3.jpg)

### 1.2 获取Github访问令牌

点击：[https://github.com/settings/tokens](https://github.com/settings/tokens)

申请 Github 账号令牌

申请流程和获取 Coding 令牌差不多

![tokeng1](/imgs/codingci/tokeng1.jpg)

名称随意，勾选 `repo` 复选框

![tokeng2](/imgs/codingci/tokeng2.jpg)

注意保存密钥，并以 `用户名:密钥` 的方式组合起来。

![tokeng3](/imgs/codingci/tokeng3.jpg)

## 2.新建仓库

### 2.1.新建GitHub仓库

![gitrepo](/imgs/codingci/gitrepo.jpg)

### 2.2.新建Coding项目

![xjxm1](/imgs/codingci/xjxm1.jpg)
![xjxm2](/imgs/codingci/xjxm2.jpg)

### 2.3.新建Coding仓库

![xjck1](/imgs/codingci/xjck1.jpg)
![xjck2](/imgs/codingci/xjck2.jpg)
![xjck3](/imgs/codingci/xjck3.jpg)
### 2.4.上传源码至Coding仓库

![gitpush](/imgs/codingci/gitpush.jpg)

## 3.配置构建脚本

如图，进入项目仓库，点击项目设置，功能开关，将构建与部署打开，

![gjbs](/imgs/codingci/gjbs.jpg)

回到项目主页，点击构建，点击下方的新建构建计划

![cxjc](/imgs/codingci/cxjc.jpg)

代码源默认为Coding，这里要注意的地方是仓库，在Coding中，一个项目可以创建多个仓库，我把Hexo源码文件放在了source仓库中。
勾选静态配置Jenkinsfile文件，选择自定义构建过程，勾选前往配置详情，并点击确定。

![ci](/imgs/codingci/ci1.jpg)

点击文本编辑器，清空内容。将下方配置文件粘贴至编辑器中，修改相关内容并点击保存。

![pz](/imgs/codingci/pz.jpg)

```Jenkins
pipeline {
  agent {
    docker {
      reuseNode true
      registryUrl 'https://coding-public-docker.pkg.coding.net'
      image 'public/docker/nodejs:12'
    }

  }

  stages {
    stage('拉取源码') {
      steps {
        checkout([$class: 'GitSCM',branches: [[name: env.GIT_BUILD_REF]],userRemoteConfigs: [[url: env.GIT_REPO_URL, credentialsId: env.CREDENTIALS_ID]]])
      }
    }
    stage('安装Hexo') {
      steps {
        echo '正在安装Hexo-cli...'
        sh 'npm install -g hexo-cli'
        sh 'npm install'
        echo '安装完成.'
      }
    }
    stage('生成静态文件') {
      steps {
        echo '生成静态文件中...'
        sh 'hexo clean'
        sh 'hexo g'
        echo '已生成静态文件，准备推送部署.'
      }
    }
    stage('推送部署') {
      steps {
        echo '正在推送静态文件...'
        dir(path: 'public') {
          script {
            writeFile(file: 'CNAME', text: '域名')
            sh 'git init'
            sh 'git add -A'
            sh 'git config user.name "用户名"'
            sh 'git config user.email "邮箱"'
            sh 'git commit -m CI'
            sh 'git push -f https://${GH_Token}@github.com/用户名/仓库.git master'
            sh 'git push -f https://${CO_Token}@e.coding.net/用户名/仓库.git master'
          }

        }

        echo '已完成文件推送.'
      }
    }
  }
}
```
> 如若未使用自定义域名，可删除第30行内容。

> 如果只需要单仓库部署，请删除36或37行。

点击变量与缓存，增加环境变量，添加两个环境变量：

![bl](/imgs/codingci/bl.jpg)

变量名称：CO_Token，类型：字符串，默认值为上一步 Coding 令牌的组合。

![cotoken](/imgs/codingci/cotoken.jpg)

变量名称：GH_Token，类型：字符串，默认值为上一步 Github 令牌的组合。

![ghtoken](/imgs/codingci/ghtoken.jpg)

这里建议把保密勾选上。

## 4.测试配置

返回构建列表，选择立即构建，测试配置是否正确。

![gjybs](/imgs/codingci/gjybs.jpg)

![ljgj](/imgs/codingci/ljgj.jpg)

> 如若源码仓库无文件请自行使用 `git` 上传

然后就可以打开 Coding 和 Github 仓库查看是否成功推送。

![ghrepo](/imgs/codingci/ghrepo.jpg)
![corepo](/imgs/codingci/corepo.jpg)

祝各位一次成功！

Enjoy!
