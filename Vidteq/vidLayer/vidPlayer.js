if (typeof(vidteq) == 'undefined') { vidteq = {}; }

vidteq._vidPlayer = function (vtt) {
  console.log("_vidPlayer");
  this.vtt = vtt;
  if (typeof(vidteq._linearResponse) != 'undefined' ) {
    this.linearResponse = new vidteq._linearResponse();
  }
  var that = this;
  getObjectVideo = function () {
    var videoSumma = that.linearResponse.getObjectVideo(that.vtt.videoResponse);
    //that.vtt.makeRouteLayer(videoSumma);
    return videoSumma;
    //return vidteq.linearResponse.getObjectVideo(vtto.videoResponse);
  }
  
  this.loadVideoPlayer();
}

vidteq._vidPlayer.prototype.loadVideoPlayer = function () {
  console.log("loadVideoPlayer");
  if(typeof(AC_FL_RunContent) == 'undefined') { return; }
  var w,h;
  w = 400;
  h = 280;
  vidteq['pathPre'] = "";
  this.videoSwf = vidteq.pathPre+'VideoPlaylistWap';
  var videoDom = 'VideoPlayerDiv';
  var flashVars = 'txtColor=#ffffff&btnColor=#2C2C2C&mcColor=#595958';
  if(typeof(vidteq.aD) != 'undefined' 
      && typeof(vidteq.aD.config) != 'undefined') { 
    var flashCfg = vidteq.aD.config;
    var txtBgColor = typeof(flashCfg.txtBgColor) != 'undefined' ? flashCfg.txtBgColor : '#ffffff';
    var btnBgColor = typeof(flashCfg.btnBgColor) != 'undefined' ? flashCfg.btnBgColor : '#2C2C2C';
    var mcBgColor = typeof(flashCfg.mcBgColor) != 'undefined' ? flashCfg.mcBgColor : '#595958';
    flashVars = "txtColor="+txtBgColor+"&btnColor="+btnBgColor+"&mcColor="+mcBgColor;
  }
  if(typeof(vidteq.aD) != 'undefined' 
    && (vidteq.aD.urlId == "commonfloor")) {
    flashVars += "&volumeOff=true";
  }
  var str = AC_FL_RunContent(
    'codebase', 'http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0',
    'width', w,
    'height', h,
    //'src', 'VideoPlaylist',
    'src', this.videoSwf,
    'quality', 'high',
    'pluginspage', 'http://www.macromedia.com/go/getflashplayer',
    'align', 'middle',
    'play', 'true',
    'loop', 'true',
    'scale', 'exactfit',
    'wmode', 'transparent',
    'devicefont', 'false',
    //'id', 'VideoPlaylist',
    'id', this.videoSwf,
    'bgcolor', '#000000',
    'FlashVars',flashVars,
    //'name', 'VideoPlaylist',
    'name', this.videoSwf,
    'menu', 'true',
    'allowFullScreen', 'false',
    'allowScriptAccess','sameDomain',
    //'movie', 'VideoPlaylist',
    'movie', this.videoSwf,
    'salign', ''
  ); //end AC code
  var vidPlayerHTML=str;
  document.getElementById(videoDom).innerHTML = str;  
  
  dragHandler('videoPlayer');
}



function dragHandler(spanId){
  $(function(){
    console.log('drag 1');
    $('#'+spanId).bind('drag',function( event ){
      console.log('drag');
      $( this ).css({
        top: event.offsetY,
        left: event.offsetX
      });
    });
  });
}
