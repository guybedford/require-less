require(['less!test'], function () {
  function test() {
    var body, bodyPadding;
    if (document.readyState === 'complete') {
      body = document.body,
      bodyPadding = window.getComputedStyle(body).padding;
      body.innerText = bodyPadding === '17px' ? 'succeeded' : 'failed';
    }
  }
  document.onreadystatechange = test;
  test();
});
