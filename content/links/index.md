+++
title = "Links"
date = "2019-12-21T08:00:00+08:00"
description = "Links on ZRLab"
displayCopyright = false
+++

这里有一些可爱的小伙伴~

<div class="friends">
  <ul id="links">

- [Dejavu's Blog](https://blog.dejavu.moe/)

- [杏铃の小本](https://杏铃.top/)

- [知命的博客](https://zimk.org/)

- [Rui's Blog](https://blog.rui.plus/)

- [林祈'Blog](https://dnslin.com/)

- [LamGC](https://blog.lamgc.moe/)

- [CyanFalse's Weblog](https://blog.eurekac.cn)

- [YosakiSonako](https://blog.yosakisonako.top)

  </ul>
</div>

不怎么可爱的可爱的小伙伴~

<div class="friends">
  <ul id="inactive-links">

- [Dreamy.WJY](https://wjy.me/)

- [KUKU](https://kuku.me/)

- [186526's Blog](https://blog.186526.xyz/)

  </ul>
</div>

<script>
function shuffle(arr) {
  return arr.sort(function () {
    return Math.random() - 0.5;
  });
}
fetch("/res/links.json")
  .then((res) => res.json())
  .then((data) => {
    data.friends.forEach((dic) => {
      var str = "";
      shuffle(dic.link_list).forEach((friend) => {
        str += `<li><a href="${friend.link}" target="_blank">${friend.name}</a></li><br/>`;
      });
      document.querySelector(`.friends #${dic.id_name}`).innerHTML = str;
    });
  });
</script>

上次友联维护时间：2024-02-13

> 本站信息&友链模板：
> ```links
>Name：ZRLab
>Site：https://blog.zrlab.org
>Avatar：https://blog.zrlab.org/imgs/avatar.jpg
>Description：难道尽。
>```

~~留言或发送邮件至links@zrlab.org申请友链，将于每周日定时处理。~~

君非吾友，何谈友链？
