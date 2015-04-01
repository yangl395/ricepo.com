//dependencies
var http = require('http');
var https = require('https');
var express = require('express');

var sha1 = require('sha1');
var request = require('request');

//new instance of modules
var app = express();

//--------------------------------

//middlewares
//app.use(express.logger());
app.use(function(req,res,next){
  console.log(req.header('User-Agent'));
  next();
});
app.set('views', __dirname + '/public');
app.engine('html', require('ejs').renderFile);
//app.engine('jade', require('jade').__express);

app.use('/static',express.static(__dirname + '/public'));

//android wechat
app.use(function(req, res, next){
  var agent = req.header('User-Agent').toLowerCase();
  if(agent.indexOf('android') > -1 && agent.indexOf('micromessenger') > -1){
    res.render('mobile.html');
  }
  else{
    next();
  }
});

//terms
app.all('/terms', function(req, res){
  res.render('terms.html');
});
//privacy
app.all('/privacy', function(req, res){
  res.render('privacy.html');
});


//mobile download
app.all('/d', function(req, res){
  var agent = req.header('User-Agent').toLowerCase();
  //iphone
  if(agent.indexOf('iphone') > -1){
    res.redirect('https://itunes.apple.com/us/app/ricepo-chinese-food-delivery/id844835003?mt=8');
  }
  //android
  else if(agent.indexOf('android') > -1){
    //res.sendfile(__dirname + '/public/Ricepo-release 1.1.1.apk');
    res.redirect('https://play.google.com/store/apps/details?id=com.ricepo.app');
  }
  //else
  else{
    res.render('index.html');
  }
});

app.all('/wechat/token', function (req, res) {
  request('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wxa40f507374970ea0&secret=c25a01dfd0098ab00b6355ef7256701d', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.json(JSON.parse(body));
    }
  })
});

//for wechat
app.all('/wechat', function(req, res) {
  //first authorize
  var valid = req.param('signature') === sha1([req.param('timestamp'), req.param('nonce'), '1234'].sort().join(''));
  console.log(valid ? 'valid' : 'invalid');
  if(!valid) return res.end('invalid token');

  if(req.param('echostr')) return res.end(req.param('echostr'));

  //handle the user message
  res.send('sending sms');
  sms('5857668377');
  sms('5855202237');
});

//android donwload
app.all('/android',function(req,res){
  res.download('public/Ricepo-release.apk');
});
//android donwload latest
app.all('/android/latest',function(req,res){
  res.download('public/ricepo.apk');
});

//intro page
app.all('/w',function(req,res){
  res.render('ricepo.html');
});
//intro page
app.all('*',function(req,res){
  var agent = req.header('User-Agent').toLowerCase();
  //iphone
  if(/iphone/i.test(agent)){
    res.redirect('https://itunes.apple.com/us/app/ricepo-chinese-food-delivery/id844835003?mt=8');
  }
  //android
  else if(/android/i.test(agent)){
    //res.sendfile(__dirname + '/public/Ricepo-release 1.1.1.apk');
    res.redirect('https://play.google.com/store/apps/details?id=com.ricepo.app');
  }
  //else
  else{
    res.render('ricepo.html');
  }
});

//Error handlers
app.use(express.errorHandler);


//--------------------------------

//run the server
console.log('starting server on 80..');
http.createServer(app).listen(80);
console.log('server running on 80..');
//https.createServer(options, app).listen(443);


function sms(phone, text){
  if(!phone || phone.length < 10) return;

  var content = text || 'Hey, you got a new wechat feedback.';
  client.messages.create({
    body: content,
    to: phone,
    from: "+15854716488",
  }, function(err, message) {
    if(err) console.log(err);
    else console.log(message.sid);
  });
}

function mobile(ua){
  if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(ua)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(ua.substr(0,4))) {
    return true;
  }
  return false;
}
