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
      //   str += `<li>
      //         <p><img src="${friend.avatar}" alt="" loading="lazy" class="R"></p>
      //         <ul>
      //         <li>${friend.name}</li>
      //         <li>${friend.intro}</li>
      //         <li><a href="${friend.link}" target="_blank"></a></li>
      //         </ul>
      //         </li>`;
      // });
        str += `<li><a href="${friend.link}" target="_blank">${friend.name}</a></li>`;
      });
      document.querySelector(`.friends #${dic.id_name}`).innerHTML = str;
    });
  });
