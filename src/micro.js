// c is the current script element
var c = document.currentScript,
  // d is the dataset of the current script element
  d = c.dataset,
  // q is the URL search params
  q = new URLSearchParams(location.search),
  // v is the rate of the current script element
  v = q.get('rum') || q.get('optel') || d.rate,
  // w is the rate of the current script element
  w = { on: 1, off: 0, high: 10, low: 1e3 }[v] || 100,
  // r is the rum object, we initialize it if it doesn't exist
  r = (window.hlx = window.hlx || {}).rum ||
    // generate a random id for the rum object
    (window.hlx.rum = { id: crypto.randomUUID().slice(-9) });
// if the page view is forced to be selected, or passes the sample rate
// then remember that the page view is selected and load the script
if (r.isSelected || ((w && Math.random() * w < 1) && (r.isSelected = true))) {
  // n is the new script element that we create
  var n = document.createElement('script');
  // copy all the attributes from the current script element to the new one
  for (var a of c.attributes) n.setAttribute(a.name, a.value);
  // set the source of the new script element to the script URL from the dataset
  // c8 ignore next
  n.src = d.script || c.src.replace(/\/micro\.js$/, '/standalone.js');
  // append the new script element to the head of the document
  document.head.append(n);
}
// these comments will not make it into the output