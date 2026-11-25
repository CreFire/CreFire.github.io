(function () {
  'use strict';

  /* 1. Theme Toggle */
  var themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      var next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try {
        localStorage.setItem('crefire-theme', next);
      } catch (e) {}
    });
  }

  /* 2. Auto Table of Contents (shown when post has >= 3 headings) */
  var postContent = document.getElementById('post-content');
  var tocBox = document.getElementById('post-toc');
  var tocList = document.getElementById('post-toc-list');
  if (postContent && tocBox && tocList) {
    var headings = postContent.querySelectorAll('h2, h3');
    if (headings.length >= 3) {
      headings.forEach(function (h, idx) {
        if (!h.id) {
          h.id = 'section-' + (idx + 1);
        }
        var li = document.createElement('li');
        if (h.tagName === 'H3') {
          li.className = 'post__toc-item--sub';
        }
        var a = document.createElement('a');
        a.href = '#' + h.id;
        a.textContent = h.textContent;
        li.appendChild(a);
        tocList.appendChild(li);
      });
      tocBox.hidden = false;
    }
  }

  /* 3. Code Copy Buttons */
  document.querySelectorAll('.prose pre').forEach(function (pre) {
    var code = pre.querySelector('code');
    if (!code) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'code-copy-btn';
    btn.textContent = '复制';
    btn.addEventListener('click', function () {
      var text = code.innerText || code.textContent || '';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          btn.textContent = '已复制';
          setTimeout(function () { btn.textContent = '复制'; }, 1600);
        });
      }
    });
    pre.appendChild(btn);
  });

  /* 4. Instant Search Dialog */
  var dialog = document.getElementById('search-dialog');
  var openBtn = document.getElementById('search-open');
  var input = document.getElementById('search-input');
  var resultsEl = document.getElementById('search-results');
  var searchIndex = null;
  var activeIdx = -1;

  function loadIndex() {
    if (searchIndex !== null) return Promise.resolve(searchIndex);
    return fetch('/search.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        searchIndex = Array.isArray(data) ? data : [];
        return searchIndex;
      })
      .catch(function () {
        searchIndex = [];
        return searchIndex;
      });
  }

  function renderResults(query) {
    if (!resultsEl) return;
    var q = (query || '').trim().toLowerCase();
    var list = (searchIndex || []).filter(function (item) {
      if (!q) return true;
      var hay = [item.title, item.tags, item.category, item.excerpt].join(' ').toLowerCase();
      return hay.indexOf(q) !== -1;
    }).slice(0, 12);

    resultsEl.innerHTML = '';
    activeIdx = -1;

    if (list.length === 0) {
      var empty = document.createElement('li');
      empty.className = 'search-result__empty';
      empty.textContent = q ? '没有找到匹配的内容' : '暂无可索引的文章';
      resultsEl.appendChild(empty);
      return;
    }

    list.forEach(function (item) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.className = 'search-result__link';
      a.href = item.url;

      var left = document.createElement('span');
      var title = document.createElement('span');
      title.className = 'search-result__title';
      title.textContent = item.title;
      left.appendChild(title);

      if (item.excerpt) {
        var ex = document.createElement('span');
        ex.className = 'search-result__excerpt';
        ex.textContent = item.excerpt;
        left.appendChild(ex);
      }

      var date = document.createElement('span');
      date.className = 'search-result__date';
      date.textContent = item.date || '';

      a.appendChild(left);
      a.appendChild(date);
      li.appendChild(a);
      resultsEl.appendChild(li);
    });
  }

  function openSearch() {
    if (!dialog) return;
    dialog.hidden = false;
    loadIndex().then(function () {
      renderResults(input ? input.value : '');
      if (input) input.focus();
    });
  }

  function closeSearch() {
    if (!dialog) return;
    dialog.hidden = true;
  }

  if (openBtn) {
    openBtn.addEventListener('click', openSearch);
  }

  if (dialog) {
    dialog.querySelectorAll('[data-search-close]').forEach(function (el) {
      el.addEventListener('click', closeSearch);
    });
  }

  if (input) {
    input.addEventListener('input', function () {
      renderResults(input.value);
    });
  }

  document.addEventListener('keydown', function (e) {
    var tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
    var isEditable = tag === 'input' || tag === 'textarea' || (e.target && e.target.isContentEditable);

    if (e.key === '/' && !isEditable && dialog && dialog.hidden) {
      e.preventDefault();
      openSearch();
      return;
    }

    if (!dialog || dialog.hidden) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeSearch();
      return;
    }

    var links = resultsEl ? resultsEl.querySelectorAll('.search-result__link') : [];
    if (!links.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIdx = (activeIdx + 1) % links.length;
      links.forEach(function (l, i) { l.classList.toggle('is-selected', i === activeIdx); });
      links[activeIdx].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIdx = (activeIdx - 1 + links.length) % links.length;
      links.forEach(function (l, i) { l.classList.toggle('is-selected', i === activeIdx); });
      links[activeIdx].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter' && activeIdx >= 0 && links[activeIdx]) {
      e.preventDefault();
      window.location.href = links[activeIdx].href;
    }
  });
})();
