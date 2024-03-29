(function ($) {

  function getServerList() {
    $.get('/api/servers/list').then(data => {
      const html = $.map(data, server => `<li><span>${server.name}</span>: <br><a href="${server.url}" title="${server.name}"> ${server.url} </a></li>`).join('');
      $('.server-list').html(html);
    }).catch(err => {
      window.alert(JSON.stringify(err));
    });
  }

  function getServerRss() {
    $.get('/api/servers/rss').then(data => {
      $('.server-rss').html(data);
    }).catch(err => {
      window.alert(JSON.stringify(err));
    });
  }

  function getReady(src) {
    $.post(src).then(() => {
      getServerList();
      getServerRss();
    }).catch(err => {
      window.alert(JSON.stringify(err));
    });
  }

  $(document).ready(() => {

    $(window).on('load', () => {
      getServerList();
      getServerRss();
    })

    $('#syncStartBtn').on('click', event => {
      const $target = $(event.target);
      const src = $target.data('src');
      $('.server-list').add('.server-rss').empty();
      getReady(src);
      return false;
    });

    $('#syncProxyBtn').on('click', event => {
      const $target = $(event.target);
      const src = $target.data('src');
      $('.server-list').add('.server-rss').empty();
      getReady(src);
      return false;
    });

  });

}(jQuery));

