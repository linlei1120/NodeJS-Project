var express = require('express');
var router = express.Router();
const bitcoin = require('bitcoinjs-lib'),
    createHash = require('create-hash');
    function standardHash(name, data) {
      let h = createHash(name);
      return h.update(data).digest();
  }
  
  function hash160(data) {
      let h1 = standardHash('sha256', data);
      let h2 = standardHash('ripemd160', h1);
      return h2;
  }
  
  function hash256(data) {
      let h1 = standardHash('sha256', data);
      let h2 = standardHash('sha256', h1);
      return h2;
  }
  let s = 'bitcoin is awesome';
console.log('ripemd160 = ' + standardHash('ripemd160', s).toString('hex'));
console.log('  hash160 = ' + hash160(s).toString('hex'));
console.log('   sha256 = ' + standardHash('sha256', s).toString('hex'));
console.log('  hash256 = ' + hash256(s).toString('hex'));
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Expresssssss' });
});

router.get('/account', function(req, res, next) {
  res.render('index', { title: 'sssssss' });
});

module.exports = router;
