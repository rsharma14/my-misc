if (typeof(vidteq) == 'undefined') { vidteq = {}; }

vidteq._sped = function (gui) {
  this.gui = gui;
  this.inputValEmail="id@company.com";
  this.inputValSMS="Eg: XXXXXYYYYY";
}

vidteq._sped.prototype.prepareSMS=function (response) {
  var smsHtml="";
  var funcList = {};
  var smsColor = "";
  var paddingRight = "";
  if(this.gui.sideBarUI) {
    smsColor = "color:white;";
    paddingRight = "padding-right:20px;";
  }
  if(this.gui.wowPlace) {
    smsHtml+="<p style='font-size:14px;padding:5px;'>Download our VidNav App (Video Directions on your Phone) at <br >";
    smsHtml+="<a href='https://play.google.com/store/apps/details?id=air.com.mobile.vidteq' style='color:blue;' target='_blank'>https://play.google.com/store/apps/details?id=air.com.mobile.vidteq</a></p>";
    smsHtml+="<p style='font-size:16px;padding:5px;'>Your Address:</p>";
  }
  if( response.name ) {
    smsHtml+="<p style='font-size:13px;padding:5px;"+smsColor+"'>"+response.name+"</p>";
    if(vidteq.addrParams) addrParams = vidteq.addrParams;
    for(i in addrParams) {
      if(response[addrParams[i].field]) smsHtml+="<p style='font-size:13px;padding:5px;"+smsColor+"'>"+response[addrParams[i].field]+"</p>";
    }
    if(this.gui.wowPlace) {
      smsHtml+="<p style='font-size:13px;padding:5px;'>More Info at <a href=http://"+document.location.hostname+" target='_blank' style='color:blue;'>www.vidteq.com</a></p>";
    }
  }else {
    //TBD: create a flag
    smsHtml +="<div class='header3'>"+
                "<div class='startend'>"+
                  "<p style='font-size:14px;margin:0;padding:0;padding-bottom:5px;"+smsColor+"'>Start Address - <span class='bold'>"+response.startAddress+"</span></p>"+
                  "<p style='margin:0;padding:0;padding-bottom:5px;font-size:14px;"+smsColor+"'>End Address - <span class='bold'>"+response.endAddress+"</span></p>"+
                "</div>"+
                "<div class='fromto' style='display:none;'><p style='font-size:14px;margin:0;padding:0;padding-bottom:5px;"+smsColor+"'>Driving Directions from <span class='bold'>"+response.startAddress+"</span> to <span class='bold'>"+response.endAddress+"</span></p></div>"+
                "<div class='totaldistance'><p style='font-size:14px;margin:0;padding:0;padding-bottom:5px;"+smsColor+"'>Total Distance : <span class='bold'>"+response.routeSummary.distance+" Kms</span>, Video Time : <span class='bold'>"+response.routeSummary.videoDuration+"</span></p></div>";
    if (this.gui.embed && this.gui.embed.place) { 
      smsHtml+="<div class='businessaddr'><p style='font-size:14px;margin:0;padding:0;padding-bottom:5px;"+smsColor+"'>Business Address : <span class='bold'>"+this.gui.embed.place.address.name+(new vidteq._poi(this.gui.embed.place,this.gui)).getEntityHtmlAddrContent('fvt').addrContent+"</span></p></div>";
    }
    smsHtml +="</div>";
    smsHtml+="<div class='directions-wrapper'><div class='directions'>";
    for(i in response.vid) {
      smsHtml+="<p style='font-size:13px;"+smsColor+"'>"+(parseInt(i)+1)+". "+response.vid[i].direction+"</p>";
    }
    smsHtml+="</div></div>";
  }
  //var headerHtml='<span class="header1"><span>Please enter your Mobile Number</span></span>';
  var smsHeaderCon = "SMS Driving Directions";
  if(this.gui.wowPlace) { smsHeaderCon = "SMS - Driving Directions"; }
  var headerHtml='<span class="header1" style="display:none;"><span>'+smsHeaderCon+'</span></span><span class="header2"><span>Please enter your Mobile Number</span></span>';
  if (this.gui.topBarUI || this.gui.wowPlace || (typeof(this.gui.nemo)!=="undefined" && this.gui.nemo) ) {
    var lowerHtml="<table align=center width=75% cellspacing=0 cellpadding=0><tr><td><a onfocus='this.blur();' style='font-size:14px'></a></td><td><a onfocus='this.blur();' style='font-size:14px;'>+91</a><input type='text' maxlength=10 size=10 style='width:80%;' name='smsbox' id='mobinput' value='"+this.inputValSMS+"' defaultValue='"+this.inputValSMS+"' /></td><td class='mobile_submit-wrapper'><div tabindex=0 id='mobile_submit' class='mobile_submit feedback_submit1' title='Send SMS' alt='SMS' href='javascript:void(0);' ><a class='popSubmit' style='padding-right:24px;'><span>SMS</span></a></div></td></tr></table>";
  } else if(this.gui.sideBarUI) {    
    var lowerHtml="<table align=center width=75% cellspacing=0 cellpadding=0><tr><td><a onfocus='this.blur();' style='font-size:14px'></a></td><td><a onfocus='this.blur();' style='font-size:14px;color:white;'>+91</a><input type='text' maxlength=10 size=10 style='width:80%;background: none repeat scroll 0 0 #000000;border: 0 none;color: #FFFFFF;height: 22px;' name='smsbox' id='mobinput' value='"+this.inputValSMS+"' defaultValue='"+this.inputValSMS+"' /></td><td class='mobile_submit-wrapper'><div tabindex=0 id='mobile_submit' class='mobile_submit feedback_submit1' title='Send SMS' alt='SMS' href='javascript:void(0);' ><a class='popSubmit' style='padding-right:24px;'><span>SMS</span></a></div></td></tr></table>";      
  } else if (typeof(vidteq.aD) != 'undefined' && typeof(vidteq.aD.config) != 'undefined' && typeof(vidteq.aD.config.theme) != 'undefined' && vidteq.aD.config.theme != ''){
    var lowerHtml="<table align=center width=75% cellspacing=0 cellpadding=0><tr><td><a onfocus='this.blur();' style='font-size:14px'></a></td><td><a onfocus='this.blur();' style='font-size:14px'>+91</a><input type='text' maxlength=10 size=10 style='width:80%;' name='smsbox' id='mobinput' value='"+this.inputValSMS+"' defaultValue='"+this.inputValSMS+"' /></td><td class='mobile_submit-wrapper'><div tabindex=0 id='mobile_submit' class='mobile_submit feedback_submit1' title='Send SMS' alt='SMS' href='javascript:void(0);' ><a class='popSubmit' style='padding-right:24px;'><span>SMS</span></a></div></td></tr></table>";
  } else { 
    var lowerHtml="<table align=center width=75% cellspacing=0 cellpadding=0><tr><td><a onfocus='this.blur();' style='font-size:14px'></a></td><td><a onfocus='this.blur();' style='font-size:14px'>+91</a><input type='text' maxlength=10 size=10 style='width:80%;' name='smsbox' id='mobinput' value='"+this.inputValSMS+"' defaultValue='"+this.inputValSMS+"' /></td><td class='mobile_submit-wrapper'><img id='mobile_submit' alt='Sms' src='"+vidteq.imgPath.sms+"' tabindex=0 style='cursor:pointer' height=25 href='javascript:void(0);' /></td></tr></table>";
  }
  var that = this;
  funcList.mobinput = function () { that.clickTextbox(this); };
  funcList.mobile_submit = function () { return that.sendSMS(); };
  var allHtml = "<div style='background-color:"+vidteq.vidteq.bgColor+";text-align:left;min-width:410px;max-width:680px;'><div id='smsHeaderDiv' class='smsHeaderDiv' style='text-align:center;'><div onfocus='this.blur();' class='popupheader1'>"+headerHtml+"</div><br>"+lowerHtml+"<br></div><hr id='hrSeperator' class='hrSeperator' style='line-height:0;height:2px;font-size:2px;background-color:black;color:black;width=100%;border:none;padding:0px;padding-top:0px;padding-bottom:0px;margin:0; margin-top:2px;margin-bottom:2px;'><div id='smsInnerDiv' class='smsInnerDiv' style='background-color:"+vidteq.vidteq.bgColor+";text-align:left;margin:0;margin-top:5px;padding:5px;padding-left:10px;"+paddingRight+"'>"+smsHtml+"</div><div style='height:20px;background-color:"+vidteq.vidteq.bgColor+";width:100%;'></div></div>";
  return ({
    headerHtml:headerHtml,
    innerDivHtml:smsHtml,
    lowerHtml:lowerHtml,
    allHtml:allHtml,
    funcList:funcList
  });
}

vidteq._sped.prototype.clickTextbox = function (obj) {
  var defVal = $(obj).attr('defaultValue');
  if (typeof(defVal) != 'undefined' && defVal.trim() != '') {
    $(obj).val(($(obj).val()==defVal)?'':$(obj).val());
  }
}

vidteq._sped.prototype.prepareEmail = function (response,place) {
  var emailHtml;
  var funcList = {};
  var paddingRight = "";
  if(this.gui.sideBarUI) {    
    paddingRight = "padding-right:20px;";
  }
  if(typeof(place)!==undefined && place == 1) {
    emailHtml = this.preparePlaceHtml(response);
  } else {
    var t = this.prepareRouteDirectionsPreview();
    emailHtml=t.html;
  }
  var emailHeaderCon = "Email Driving Directions";
  if(this.gui.wowPlace) { emailHeaderCon = "EMAIL - Driving Directions"; }
  var headerHtml =  '<span class="header1" style="display:none;"><span>'+emailHeaderCon+'</span></span>'+
                    '<span class="header2"><span>Please enter your Email Id</span></span><br>'+
                    '<a onfocus="this.blur();" style="text-align:center;">'+
                      '<span class="header2a"><span>(Multiple Email Ids separated by a comma)</span></span>'+
                    '</a>';
  //var headerHtml='<span class="header1" style="display:none;"><span>SMS Driving Directions</span></span><span class="header2"><span>Please enter your Mobile Number</span></span>';
  if (this.gui.topBarUI || this.gui.wowPlace || (typeof(this.gui.nemo)!=="undefined" && this.gui.nemo) ) {
    var lowerHtml="<table align=center width=75% cellspacing=0 cellpadding=0><tr><td><a onfocus='this.blur();' style='font-size:14px'></a></td><td><input type='text'  style='width:95%;' id='emailinput' name='emailbox' value='"+this.inputValEmail+"' defaultValue='"+this.inputValEmail+"' />&nbsp</td><td class='email_submit-wrapper'><div tabindex=0 id='email_submit' class='email_submit feedback_submit1' title='Send Email' alt='Email' href='javascript:void(0);' ><a class='popSubmit' style='padding-right:18px;'><span>EMail</span></a></div></td></tr></table>";
  } else if(this.gui.sideBarUI) {
    var headerHtml="<a onfocus='this.blur();' style='text-align:center;color:#ffffff;'>Please enter your Email Id <br></a><a onfocus='this.blur();' style='text-align:center;color:#ffffff;font-size:10px;font-weight:normal;'>(Multiple Email Ids separated by a comma)</a>";
    var lowerHtml="<table align=center width=75% cellspacing=0 cellpadding=0><tr><td><a onfocus='this.blur();' style='font-size:14px'></a></td><td><input type='text'  style='width:95%;background: none repeat scroll 0 0 #000000;border: 0 none;color: #FFFFFF;height: 22px;' id='emailinput' name='emailbox' value='"+this.inputValEmail+"' defaultValue='"+this.inputValEmail+"' />&nbsp</td><td class='email_submit-wrapper'><div tabindex=0 id='email_submit' class='email_submit feedback_submit1' title='Send Email' alt='Email' href='javascript:void(0);' ><a class='popSubmit' style='padding-right:18px;'><span>EMail</span></a></div></td></tr></table>";      
  } else if (typeof(vidteq.aD) != 'undefined' && typeof(vidteq.aD.config) != 'undefined' && typeof(vidteq.aD.config.theme) != 'undefined' && vidteq.aD.config.theme != ''){
    var lowerHtml="<table align=center width=75% cellspacing=0 cellpadding=0><tr><td><a onfocus='this.blur();' style='font-size:14px'></a></td><td><input type='text'  style='width:95%;' id='emailinput' name='emailbox' value='"+this.inputValEmail+"' defaultValue='"+this.inputValEmail+"' />&nbsp</td><td class='email_submit-wrapper'><div tabindex=0 id='email_submit' class='email_submit feedback_submit1' title='Send Email' alt='Email' href='javascript:void(0);' ><a class='popSubmit' style='padding-right:18px;'><span>EMail</span></a></div></td></tr></table>";
  } else {
    var lowerHtml="<table align=center width=75% cellspacing=0 cellpadding=0><tr><td><a onfocus='this.blur();' style='font-size:14px'></a></td><td><input type='text'  style='width:95%;' id='emailinput' name='emailbox' value='"+this.inputValEmail+"' defaultValue='"+this.inputValEmail+"' />&nbsp</td><td class='email_submit-wrapper'><img id='email_submit' alt='email' src='"+vidteq.imgPath.email+"' tabindex=0 style='cursor:pointer' height=25 href='javascript:void(0);' /></td></tr></table>";
  }
  var that = this;
  funcList.emailinput = function () { that.clickTextbox(this); };
  funcList.email_submit = function () { return that.sendEmail(); };
  var allHtml = "<div style='background-color:"+vidteq.vidteq.bgColor+";text-align:left;min-width:200px;max-width:580px;'><div id='emailHeaderDiv' class='emailHeaderDiv' style='text-align:center;'><div onfocus='this.blur();' class='popupheader1'>"+headerHtml+"</div><br>"+lowerHtml+"<br></div><hr id='hrSeperator' class='hrSeperator' style='line-height:0;height:2px;font-size:2px;background-color:black;color:black;width=100%;border:none;padding:0px;padding-top:0px;padding-bottom:0px;margin:0; margin-top:2px;margin-bottom:2px;'><div id='emailInnerDiv' class='emailInnerDiv' style='background-color:"+vidteq.vidteq.bgColor+";text-align:left;margin:0;margin-top:5px;padding:5px;padding-left:10px;"+paddingRight+"'>"+emailHtml+"</div><div style='height:20px;background-color:"+vidteq.vidteq.bgColor+";width:100%;'></div></div>";
  return ({
    headerHtml:headerHtml,
    innerDivHtml:emailHtml,
    lowerHtml:lowerHtml,
    allHtml:allHtml,
    funcList:funcList
  });
}  

vidteq._sped.prototype.preparePlaceHtml = function (placeObj) {
  var emailHtml = "";
  if(this.gui.wowPlace) {    
    emailHtml+="<p style='font-size:14px;padding:5px;'>Download our VidNav App (Video Directions on your Phone) at <br >";
    emailHtml+="<a href='https://play.google.com/store/apps/details?id=air.com.mobile.vidteq' style='color:blue;' target='_blank'>https://play.google.com/store/apps/details?id=air.com.mobile.vidteq</a></p>";
    emailHtml+="<p style='font-size:18px;padding:5px;'>"+placeObj['name']+"</p>";
  } else {
    emailHtml+="<p style='font-size:18px;padding:5px;'>"+placeObj['name']+"</p><br/>";
  }
  if(vidteq.addrParams) addrParams = vidteq.addrParams;
  for(i in addrParams) {
    if(placeObj[addrParams[i].field]) emailHtml+="<p style='padding:5px;font-size:13px'>"+placeObj[addrParams[i].field]+"</p>";
  }
  this.email={};
  this.email.files='';
  if(placeObj.lightPullImg) {
      this.email.files+=placeObj.lightPullImg+";";
      emailHtml+='<br/><img src=http://'+document.location.host+placeObj.lightPullImg+' />';
  }
  if(placeObj.image) {
      this.email.files+=placeObj.image;
      emailHtml+='<br/><img src='+vidteq.cfg.cloneImageUrl+placeObj.image+' />';
  }
  emailHtml+='<br/><br/>Please visit ';
  emailHtml+='<a href=http://'+document.location.hostname+' style="color:blue;">www.vidteq.com</a>';
  emailHtml+=' for richer experience';
  return emailHtml;
}

vidteq._sped.prototype.getQRCode = function () {
  $('#qrCode').html('');
  var linkStr = this.gui.io.link;
  var qParam = {text:(linkStr).toString()};
  var elem = document.createElement('canvas');
  if (!(elem.getContext && elem.getContext('2d'))) {
    qParam.render='table';
  }
  $('#qrCode').qrcode(qParam);
}

vidteq._sped.prototype.prepareLink = function( id ) {
  var headerHtml = '<span class="header1"><span>Direct Link</span></span><br /><span class="header2"><span class="linkshortmsg">Copy to clipboard: Ctrl+C</span><span class="linklongmsg" style="display:none;">Select the below link text and press <span class="bold">Ctrl+C</span> to copy to Clipboard or click to open in another window.</span></span>'
  ,gui = this.gui
  ,classid = (typeof id !=='undefined'? ' '+id : '')
  ,linkStr = gui.io.link
  ,hrefLinkStr = (linkStr).toString()
  ,innerHtml = "<a style='font-size:12px;color:black;font-family:Terbuchet MS, Arial;word-wrap: break-word;' href='"+hrefLinkStr+"' target='_blank' class='click"+classid+"'>"+linkStr+"</a>"
  ;
  
  if( gui.topBarUI || gui.sideBarUI ) {
    headerHtml = '<span class="header1"><span>Direct Link</span></span><br /><span class="linkshortmsg">Copy this link in email and send</span>';
    //headerHtml = "Direct Link <br /> Copy this link in email and send";
    innerHtml += "<center><div style='width:256px;height:256px;'><br /><div id='qrCode'><img src='images/qrLoader.gif' style='padding-top:50px;'/></div></div></center>";
  }
  
  var allHtml = "<div style='background-color:"+vidteq.vidteq.bgColor+";text-align:left;min-width:410px;max-width:680px;'><div id='linkHeaderDiv' class='linkHeaderDiv' style='text-align:center;'><div onfocus='this.blur();' class='popupheader1'>"+headerHtml+"</div><br></div><hr id='hrSeperator' class='hrSeperator' style='line-height:0;height:2px;font-size:2px;background-color:black;color:black;width=100%;border:none;padding:0px;padding-top:0px;padding-bottom:0px;margin:0; margin-top:2px;margin-bottom:2px;'><div id='linkInnerDiv' class='linkInnerDiv' style='background-color:"+vidteq.vidteq.bgColor+";text-align:center;margin:5px 0 0 0; padding:5px 5px 5px 10px;'><br />"+innerHtml+"</div><br /></div>";
  
  return ({
     headerHtml : headerHtml
    ,innerDivHtml : innerHtml
    ,allHtml : allHtml
  });
}

vidteq._sped.prototype.createEmailDITopHtml = function (dIRef,attr,dIHtml) {
  // note : function modifies incoming dIHtml as well using pointers
  var fullHtml; var hintHtml;
  if(vidteq.gui.sideBarUI) {
    hintHtml = "<a class='poi2' >,&nbsp;&nbsp;</a>"+dIHtml.hintHtml;
    dIHtml.hintHtml ="<a class='textdir2' style='display:inline;'> Additional "+(dIRef.post[0]-dIRef.pre[dIRef.pre.length-1]-1)+" POIs to watch for ... (</a>"+dIHtml.hintHtml+"<a class='textdir1' >)</a>";
  } else {
    hintHtml = "<a class='poi1' >,&nbsp;&nbsp;</a>"+dIHtml.hintHtml;
    dIHtml.hintHtml ="<a class='textdir1' style='display:inline;'> Additional "+(dIRef.post[0]-dIRef.pre[dIRef.pre.length-1]-1)+" POIs to watch for ... (</a>"+dIHtml.hintHtml+"<a class='textdir1' >)</a>";  
  }  
  var gId = attr.id;
  var lId = dIRef.pre[0];
  fullHtml ="<br><div><div id='fullImageDiv_"+gId+"_"+lId+"' class='fullImageDiv' style='display:none;'>"+dIHtml.fullHtml+"</div><div id='hintImageDiv_"+gId+"_"+lId+"' class='hintImageDiv' style='display:block;cursor:pointer;text-align:left;padding-left:20px;padding-bottom:10px;' onclick = 'javascript:$(\"#hintImageDiv_"+gId+"_"+lId+"\").hide();$(\"#fullImageDiv_"+gId+"_"+lId+"\").show(); $(\"#fullImageDiv_"+gId+"_"+lId+"\").find(\"img[id^=imgdivpoi_"+gId+"_"+attr.depth+"_]\").each(function () {$(this).attr(\"src\",$(this).attr(\"alt_src\"));$(this).attr(\"alt_src\",\"\");});'>"+dIHtml.hintHtml+"</div></div>";
  return {hintHtml:hintHtml,fullHtml:fullHtml};
}

vidteq._sped.prototype.createEmailImage = function (attr,oneRec) {
  var fullHtml; var hintHtml;
  if (attr.visible) {
    fullHtml = "<br><div class='imgdivpoi-wrapper'><br><a class='simple' style='display:block;text-align:left;padding-left:20px;padding-bottom:10px;'>"+oneRec.poiName+"</a><div id='imgdivpoi_"+attr.id+"_"+attr.depth+"_"+attr.lId+"' class='imgdivpoi' style='margin-left:20px;z-index:12000;height:240px;width:320px;'><div style='display:block;' ><img id=imgdivpoi_"+attr.id+"_"+attr.depth+"_"+attr.lId+" alt='"+oneRec.poiName+"' src="+vidteq.cfg.cloneImageUrl+oneRec.imgName +" /></div><div id='arrowoverlay' style='padding-top:180px;text-align:center'></div></div></div>";
  } else {
    fullHtml = "<br><div class='imgdivpoi-wrapper'><br><a class='simple' style='display:block;text-align:left;padding-left:20px;padding-bottom:10px;'>"+oneRec.poiName+"</a><div id='imgdivpoi_"+attr.id+"_"+attr.depth+"_"+attr.lId+"' class='imgdivpoi' style='margin-left:20px;z-index:12000;height:240px;width:320px;'><div style='display:block;' ><img id=imgdivpoi_"+attr.id+"_"+attr.depth+"_"+attr.lId+" alt='"+oneRec.poiName+"' alt_src="+vidteq.cfg.cloneImageUrl+oneRec.imgName +" /></div><div id='arrowoverlay' style='padding-top:180px;text-align:center'></div></div></div>";
  }
  if (attr.begin) {
    if(vidteq.gui.sideBarUI) {
      hintHtml = "<a class='poi2' >"+oneRec.poiName+"</a>";
    } else {
      hintHtml = "<a class='poi1' >"+oneRec.poiName+"</a>";
    }
  } else {
    if(vidteq.gui.sideBarUI) {    
      hintHtml = "<a class='poi2' >,&nbsp;&nbsp;"+oneRec.poiName+"</a>";
    } else {
      hintHtml = "<a class='poi1' >,&nbsp;&nbsp;"+oneRec.poiName+"</a>";
    }
  }
  return {hintHtml:hintHtml,fullHtml:fullHtml};
}

vidteq._sped.prototype.prepareRouteDirectionsSneakPeak = function (print,noImages) {
  var myGui = this.gui;
  var myIo = this.gui.io;
  var myRes = this.gui.io.response;
  
  var emailHTML="<div class='header3'>";
  if( this.gui.sideBarUI ) {
    emailHTML+="<h3 style='color:white;'>Driving Directions from "+myRes.startAddress+" to "+myRes.endAddress+"</h3>";
    emailHTML+="<p style='font-size:14px;margin:0;padding:0;padding-bottom:5px;color:white;'>Total Distance : "+myRes.routeSummary.distance+" Kms, Video Time : "+myRes.routeSummary.videoDuration+".</p>";
  }else {
    //TBD: remove h3 tag or div
    emailHTML+="<h3 class='fromto'>Driving Directions from "+myRes.startAddress+" to "+myRes.endAddress+"</h3>";
    emailHTML+="<div class='fromto' style='display:none;'><p>Driving Directions from <span class='bold'>"+myRes.startAddress+"</span> to <span class='bold'>"+myRes.endAddress+"</span></p></div>";
    //emailHTML+="<div class='fromto' style='display:none;'><p style='font-size:14px;margin:0;padding:0;padding-bottom:5px;"+smsColor+"'>Driving Directions from <span class='bold'>"+response.startAddress+"</span> to <span class='bold'>"+response.endAddress+"</span></p></div>"+
    emailHTML+="<div class='totaldistance'><p style='font-size:14px;margin:0;padding:0;padding-bottom:5px;'>Total Distance : <span class='bold'>"+myRes.routeSummary.distance+"</span> Kms, Video Time : <span class='bold'>"+myRes.routeSummary.videoDuration+"</span>.</p></div>";  
  }
  if( myGui.embed && myGui.embed.place ) {
    if( this.gui.sideBarUI ) {
      emailHTML+="<p style='font-size:14px;margin:0;padding:0;padding-bottom:5px;color:white;'>Business Address : "+myGui.embed.place.address.name+(new vidteq._poi(myGui.embed.place,myGui)).getEntityHtmlAddrContent('fvt').addrContent+"</p>";
    }else {
      emailHTML+="<div class='businessaddr'><p style='font-size:14px;margin:0;padding:0;padding-bottom:5px;'>Business Address : "+myGui.embed.place.address.name+(new vidteq._poi(myGui.embed.place,myGui)).getEntityHtmlAddrContent('fvt').addrContent+"</p></div>";  
    }
  }
  emailHTML+="</div>";
  emailHTML+="<div class='directions-wrapper'><div class='directions'>";
  var arrowImageClasses = 'arrowImage' + (vidteq.MSIE6? ' pngfixclass' : '');
  var arrowdirClasses = 'arrowdir-wrapper';
  for( var i in myRes.vid ) {
    //hostname=document.location.host;
    if( i == 0 ) { arrowdirClasses = arrowdirClasses+' first'; }
    emailHTML+="<br><hr class='hrSeperator' style='height:2px;width:100%;margin:0;padding:0;'>";
    emailHTML+="<div class='"+arrowdirClasses+"'><table><tr><td class='arrowImage-wrapper'><img id='arrowImage-"+i+"' class='"+arrowImageClasses+"' src="+myRes.vid[i].arrowSrc+" alt="+(i+1)+"/> </td><td> <a class='simple' style='padding-bottom:5px;'>&nbsp;&nbsp;"+(parseInt(i)+1)+". "+myRes.vid[i].direction+"</a></td></tr></table></div>";
    if( typeof noImages == 'undefined' ) { // TBD
      var refPois = [];
      for( var j in myRes.vid[i].passBy ) {
        var curPoi=myRes.imgData[myRes.vid[i].passBy[j].id];
        refPois.push(curPoi);
      }
      if (myRes.vid[i].passBy.length > 0) {
        var temp = vidteq.utils.buildDiveIn(
          vidteq.utils.buildDiveInArray([1,2,4,6,8,10,12,14,16,18],0,0,myRes.vid[i].passBy.length-1),
          refPois,
          {id:i,print:print,visible:true,depth:0},
          this.createEmailDITopHtml,
          this.createEmailImage);
        temp.fullHtml = "<div class='passby-text' style='text-align:left'><br><a class='simple' style='text-align:center;padding-left:20px;padding-bottom:3px;'>Pass by following Points Of Interests (POI).<br></a></div>"+temp.fullHtml;
        emailHTML += temp.fullHtml;
      }
    }
  }
  try {
    if( typeof noImages == 'undefined' ) {
      emailHTML+="<div id='routeimgsnap-wrapper' class='routeimgsnap-wrapper'><p id='routeimgsnap' class='routeimgsnap'>Loading the image of route .....</p></div>";
      this.addMapImage(vidteq.mboxObj.prepareLightpullReqObj());
    }
  }catch (e) { }
  if( this.gui.sideBarUI ) {
    emailHTML+="<div class='nicetripmsg'><p style='color:white;'><span>Have a nice trip.</span> Please do visit us back at <span>www.vidteq.com</span></p></div>";
  }else {
    emailHTML+="<div class='nicetripmsg'><p><span>Have a nice trip.</span> Please do visit us back at <span class='underline'>www.vidteq.com</span></p></div>"; 
  }
  emailHTML+="</div></div>";
  return { html:emailHTML,start:myRes.startAddress,end:myRes.endAddress };
}

vidteq._sped.prototype.prepareRouteDirectionsPreview = function (print,noImages) {
  return this.prepareRouteDirectionsSneakPeak(print,noImages); 
}

vidteq._sped.prototype.addMapImageToDom = function (html) {
  if(this.printWindow && this.printWindow!=null && 
     this.printWindow.document!=null && 
     this.printWindow.document.getElementById('routeimgsnap')) {  
    this.printWindow.document.getElementById('routeimgsnap').innerHTML= html;
  }
  if ($('#routeimgsnap').length) { $('#routeimgsnap').html(html); }
}

vidteq._sped.prototype.addMapImage = function (mapData) {
  var s=JSON.stringify(mapData);
  var paramsToSend={'w':320,'h':320,'onlyPath':1,'places':s,city:vidteq.cfg.city};
  var that = this;
  var img=$.ajax({
    url:vidteq.cfg.lightPullUrl,
    type:"POST",
    dataType:'json',
    data:paramsToSend,
    success:function (response) {
      var imgName=response.path;
      var toPut = "<img src=http://"+document.location.host+"/tmp/"+imgName+" />";
      if (typeof(imgName) != 'undefined' && imgName!='undefined') {
        that.addMapImageToDom(toPut);
      } else { that.addMapImageToDom(''); }
    },
    error: function () { that.addMapImageToDom(''); }
  });
}  

vidteq._sped.prototype.sendSMS= function (opt) {
  var opt = opt || {};
  /* if(isMapXpanded){
  setTimeout('getBackVideoTd()',4000);
  }*/
  var nId = opt.mobileNoId || 'mobinput';
  //var mobileNumber=$('#mobinput').val();
  var mobileNumber = $('#'+nId).val();
  if (!vidteq.utils.checkPhoneNumber(mobileNumber)) { 
    $('#'+nId).css('background-color','red');
    return false; 
  }
  mobileNumber.replace(/\s+/g,'');
  //if(mobileNumber.length==10 && mobileNumber.match(/^9\d{9}/)) {
  var sId = opt.smsBodyId || 
    ($('#smsInnerDiv').length?'smsInnerDiv':'innerDiv');
  var totalRoute = $('#'+sId).html();
  if (!totalRoute) {
    alert("Empty Sms body");
    return; 
  } 
  //var totalRoute;
  //if (this.gui.topBarUI || this.gui.sideBarUI || (typeof(this.gui.nemo)!=="undefined" && this.gui.nemo) 
  //       || (typeof(vidteq.aD) != 'undefined' && typeof(vidteq.aD.config) != 'undefined' 
  //            && typeof(vidteq.aD.config.theme) != 'undefined' && vidteq.aD.config.theme != '')){
  //  totalRoute=$('#smsInnerDiv').html();
  //} else {
  //  totalRoute=$('#innerDiv').html();
  //}
  totalRoute = totalRoute.replace(/\<span[^\>]*\>/ig,"")
    .replace(/\<div[^\>]*\>/ig,"")
    .replace(/\<\/span\>/ig,"")
    .replace(/\<\/div\>/ig,"");
  totalRoute=totalRoute.replace(/\<p[^\>]*\>/ig,"");
  totalRoute=totalRoute.replace(/\<\/p\>/ig,"\n");
  totalRoute=totalRoute.replace(/\<br[^\>]*\>/ig,"\n");
  totalRoute=totalRoute.replace(/\<a[^\>]*\>/ig,"");
  totalRoute=totalRoute.replace(/\<\/a\>/ig,"\n");
  totalRoute=totalRoute.replace(/&nbsp;/ig," ");
  var sendSMSAjaxData = {
    action:"sendSms"
    ,city:vidteq.cfg.city
    ,to:mobileNumber
    ,text:totalRoute
    ,account:vidteq.vidteq.account
    ,key:vidteq.vidteq.key||'blah'
  };
  var magicHappensUrl = 'vs/magicHappens.php';
  if('pathPre' in vidteq) {
    magicHappensUrl = vidteq.pathPre + 'vs/magicHappens.php';
  }
  this.globalAjaxObj=$.ajax({
    type: 'GET'
    ,url: magicHappensUrl
    ,data: sendSMSAjaxData
    ,error:function () {return true;}
    ,dataType: vidteq.vidteq.dataType
  });
  //} else {
  //  alert("Please check the number you have entered");
  //  return false;
  //}
  var callback = opt.callback || null;
  if(opt.xPage && opt.callback) {
    opt.callback();
    return;
  }
  if (this.gui.wap) {
    var temp = new this.showSendingPromptTopBarUI(3,callback);
    return true;
  }
  if (this.gui.topBarUI || this.gui.wowPlace || this.gui.sideBarUI || (typeof(this.gui.nemo)!=="undefined" && this.gui.nemo) 
         || (typeof(vidteq.aD) != 'undefined' && typeof(vidteq.aD.config) != 'undefined' 
              && typeof(vidteq.aD.config.theme) != 'undefined' && vidteq.aD.config.theme != '')){
    var temp = new this.showSendingPromptTopBarUI(3,callback);
  } else {
    // TBD
    this.showSendingPrompt(callback);
  }
  return true;
}

vidteq._sped.prototype.sendEmail= function (opt) { 
  var opt = opt || {};
  var nId = opt.emailId || 'emailinput';
  var emailId=$('#'+nId)[0].value.split(/\,/);
  for(var i=0;i<emailId.length;i++) {
    if(!vidteq.utils.checkEmailId(emailId[i])) { return false; }
  }
  //var chiller=0;
  var innerDiv = 'innerDiv';
  if (this.gui.topBarUI || this.gui.wowPlace || this.gui.sideBarUI || (typeof(this.gui.nemo)!=="undefined" && this.gui.nemo)  
         || (typeof(vidteq.aD) != 'undefined' && typeof(vidteq.aD.config) != 'undefined' 
              && typeof(vidteq.aD.config.theme) != 'undefined' && vidteq.aD.config.theme != '')){
    innerDiv = 'emailInnerDiv'; 
  }
  if (typeof(emailWindowMode) != 'undefined') { innerDiv = 'emailInnerDiv'; }
  //if(typeof(__experimentalUI)!='undefined' && __experimentalUI) {
    //var innerDiv = 'emailInnerDiv';
    var fileNames = [];
    //$('#'+innerDiv).find('div').each(function () {
    //  if (!$(this).attr('id').match(/imgdiv/)) { return true; }
    //  if (!$(this).is(':visible')) { 
    //    $(this).css('background-image',''); // for now just remove it
    //    return true; 
    //  }
    //  var oneName = $(this).css('background-image');
    //  oneName = oneName.replace(/^.*\("/g,'');
    //  oneName = oneName.replace(/"\).*$/g,'');
    //  fileNames.push(oneName);
    //  $(this).css('background-image','');
    //  $(this).html("<img src='cid:image"+fileNames.length+"@vidteq.com' style='height:240px;width:320px;' \/>");
    //});
    $('#'+innerDiv).find('div[id^=fullImageDiv]').each(function () {
      if (!$(this).is(':visible')) { $(this).remove(); }
    });
    $('#'+innerDiv).find('img[id^=imgdivpoi_]').each(function () {
      var oneName = $(this).attr('src');
      if (typeof(oneName) == 'undefined') { return; }
      oneName = oneName.replace(/^[ ]*/g,'');
      oneName = oneName.replace(/[ ]*$/g,'');
      fileNames.push(oneName);
      $(this).attr('src','cid:image'+fileNames.length+'@vidteq.com');
    });
    
    var arrowPaths = {};
    $('#'+innerDiv).find('img').each(function () {
      var imgId=$(this).attr('id');
      if(imgId)
        var imgCheck= imgId.toString().match(/arrowImage/);
      else
        var imgCheck = false;
      
      if (!imgCheck) { return true; }
      var oneName = $(this).attr('src');
      if (typeof(arrowPaths[oneName]) == 'undefined') {
        fileNames.push(vidteq.utils.makePathAbsolute(oneName));
        arrowPaths[oneName] = "cid:image"+fileNames.length+"@vidteq.com";
      }
    $(this).attr('src',arrowPaths[oneName]);
    });
    $('#routeimgsnap').find('img').each(function () {
      var oneName = $(this).attr('src');
      fileNames.push(vidteq.utils.makePathAbsolute(oneName));
      $(this).attr('src',"cid:image"+fileNames.length+"@vidteq.com");
    });
  var totalRoute="<html><head><style>p{ font-size:14px;font-family:'Trebuchet MS', Arial; }h{ font-size:100%;font-family:'Trebuchet MS', Arial; }</style></head><body>";
  totalRoute+=$('#'+innerDiv)[0].innerHTML;
  totalRoute+="</body></html>";
  var fileName=fileNames.join(';')+';';
  for(var i=0;i<emailId.length;i++) {
    if(vidteq.utils.checkEmailId(emailId[i])) {
      if(opt.xPage) {
        emailData = {action:'postEmail', to:emailId[i], content: totalRoute, attach:'yes', filename:fileName, subject:opt.subject};
      } else {
        emailData = {action:'postEmail', to:emailId[i], content: totalRoute, start:this.gui.io.response.startAddress,end:this.gui.io.response.endAddress, attach:'yes', filename:fileName};
      }
      if (typeof(vidteq.aD) != 'undefined' && vidteq.aD.account=="Arthabfs"){
        emailData.from ='customer@artha.in';
      }
      this.globalAjaxObj=$.ajax({type: 'POST', url:vidteq.cfg.emailUrl, data:emailData, dataType: "text"});
    }
  }
  if(opt.xPage && opt.callback) {
    opt.callback();
    return;
  }
  if (this.gui.topBarUI || this.gui.wowPlace || this.gui.sideBarUI || (typeof(this.gui.nemo)!=="undefined" && this.gui.nemo) 
         || (typeof(vidteq.aD) != 'undefined' && typeof(vidteq.aD.config) != 'undefined' 
              && typeof(vidteq.aD.config.theme) != 'undefined' && vidteq.aD.config.theme != '')){
    var temp = new this.showSendingPromptTopBarUI(3);
  } else {
    this.showSendingPrompt();
  }
  if (typeof(emailWindowMode) != 'undefined') { window.close(); }
  return true;
}

vidteq._sped.prototype.showSendingPrompt=function (callback) {
  if (this.gui.handheld) { return; } // TBD
  var a=$('#comdiv')[0];
  a.innerHTML='';
  a.style.width='250px';
  a.style.height='50px';
  var wLeft=(document.body.offsetWidth/2)-100;
  wLeft=wLeft>0?wLeft:0;
  a.style.left=wLeft+"px";
  var wHeight=(document.body.offsetHeight/2)-105;
  wHeight=wHeight>0?wHeight:0;
  a.style.top=wHeight+"px";
  var timedComDivClose = function(seconds) {
    $('#comdiv').html("<div style='text-align:center;'><p style='font-size:14px; text-align:center'>Sending and closing in "+seconds+" seconds</p></div>");
  };
  timedComDivClose(3);
  for(var i=2;i>0;i--) {
    var t = i;
    setTimeout(function () {
      timedComDivClose(t);
    },(3-i)*1000);
  }
  var that = this;
  setTimeout(function () {
    if (callback) { callback(); }
    that.closeMe();
  },3000);
}

vidteq._sped.prototype.showSendingPromptTopBarUI = function (seconds,callback) {
  var s = vidteq.utils.getPopupParams(1.7); 
  var pName = 'divSending';
  if ($("#"+pName).length) { $("#"+pName).remove(); }
  //this.con = $("<div id='"+pName+"' style='z-index:80001;position:absolute;left:"+s.left+"px;top:"+s.top+"px;height:50px;width:280px;padding:10px;background-color:transparent;'><div id='divSendingText' style='text-align:center;background-color:white;width:280px;height:50px;margin:0;padding:0;'></div></div>").appendTo('body');
  this.con = $("<div id='"+pName+"' style='z-index:80001;position:absolute;left:"+s.left+"px;top:"+s.top+"px;height:50px;width:280px;padding:10px;background-color:transparent;'><div id='divSendingText' style='text-align:center;background-color:"+vidteq.vidteq.bgColor+";width:280px;height:50px;margin:0;padding:0;'></div></div>").appendTo('body');
  this.seconds = seconds;
  this.conText = $('#'+pName+'Text'); // first time
  var that = this;
  this.putMessage = function () {
    var sendColor = "";
    if(vidteq.gui.sideBarUI) {   
      sendColor = "color:white;";
    }
    that.conText.html("<p style='margin:0;padding:0;padding-top:15px;font-color:black;font-size:14px; text-align:center;"+sendColor+"'>Sending and closing in "+that.seconds+" seconds .... </p>");
    that.seconds--;
  }
  this.putMessage();
  var boxImage = { url:vidteq.imgPath.refBox3, cornerW:10, cornerH:10, boxW:510, boxH:378, offsetW:0, offsetH:0 };
  vidteq.utils.boxify(boxImage,pName,{lt:1,rt:1,lb:1,rb:1});
  this.conText = $('#'+pName+'Text'); // readjust
  for(var i=seconds-1;i>0;i--) {
    setTimeout(function () {
      that.putMessage();
    },(seconds-i)*1000);
  }
  setTimeout(function () {
    if (callback) { callback(); }
    that.con.remove();
  },seconds * 1000);
  s.rWidth = parseInt($("#"+pName).outerWidth());
  s.rHeight = parseInt($("#"+pName).outerHeight());
  $("#"+pName).animate({left:parseInt(s.left+(s.width-s.rWidth)/2)+'px',top:parseInt(s.top+(s.height-s.rHeight)/2)+"px"},1000);
}

vidteq._sped.prototype.preparePrintOptions = function(id) {
  var funcList = {};
  var that = this;
  var headerHtml='<span class="header1"><span>Print Directions</span></span>';
  var innerHtml="<table align='center'; vertical-align='middle'; width=100% height=100% style='padding:0px;' ><tr height=100%; vertical-align='middle;' align='center' ><td><div style='text-align:center'><a id='printWithImages' class='printWithImages maptab' style='cursor:pointer'><span><span class='printWithImages-icon' style='display:none;'></span><span>With Images</span></span></a><br/>";
  funcList.printWithImages = function () {
    that.invokePrint(that.prepareRouteDirectionsPreview(true));
  }
  innerHtml+="<a id=printWithoutImages class='printWithoutImages maptab' style='cursor:pointer'><span><span class='printWithoutImages-icon' style='display:none;'></span><span>Without Images</span></span></a><br/></div></td></tr></table>";
  funcList.printWithoutImages = function () {
    that.invokePrint(that.prepareRouteDirectionsPreview(true,true));
  }
  var allHtml = "<div style='background-color:"+vidteq.vidteq.bgColor+";text-align:left;min-width:200px;max-width:300px;'><div id='printHeaderDiv' class='printHeaderDiv' style='text-align:center;'><div onfocus='this.blur();' class='popupheader1'>"+headerHtml+"</div><br></div><hr id='hrSeperator' class='hrSeperator' style='line-height:0;height:2px;font-size:2px;background-color:black;color:black;width=100%;border:none;padding:0px;padding-top:0px;padding-bottom:0px;margin:0; margin-top:2px;margin-bottom:2px;'><div id='printInnerDiv' class='printInnerDiv' style='background-color:"+vidteq.vidteq.bgColor+";text-align:left;margin:0;margin-top:5px;padding:5px;padding-left:10px;'>"+innerHtml+"</div></div>";
  return ({
    headerHtml:headerHtml,
    funcList:funcList,
    innerDivHtml:innerHtml,
    allHtml:allHtml,
    context:id
  });
}

vidteq._sped.prototype.prepareDownload = function() {
  var headerHtml="Download Video";
  var messageDiv = vidteq.utils.createElem("div"); 
  $('#comdiv')[0].appendChild(messageDiv);
  messageDiv.id = "download";
  var vVidDuration=this.gui.io.response.vVidDuration;
  var vidDuration=this.gui.io.response.vidDuration;
  var mainDpDuration = Math.round((vVidDuration / 60) * 100) / 100;
  var allVideoDuration = Math.round(((vidDuration + vVidDuration) / 60) * 100) / 100;
  var innerHtml="<table align='center'; vertical-align='middle'; width=100% height=100%><tr height=100%; valign='middle;' align='center;'><td><div style='text-align:center'>";
  innerHtml+=createDownloadLink("Main decision points only", this.gui.io.response.mainDpVideoLinks);  
  innerHtml+=" - ~" + mainDpDuration + " minutes (Video Duration)" + " - ~" + (mainDpDuration * 4) + "Mbs (Video Size)";
  innerHtml+="<br/><br/>";
  innerHtml+=createDownloadLink("Complete Video Map", this.gui.io.response.allVideoLinks);
  innerHtml+=" - ~" + allVideoDuration + " minutes (Video Duration)" + " - ~" + (allVideoDuration * 4) + "Mbs (Video Size)";
  innerHtml+="</div></td></tr></table>";
  function createDownloadLink(text, files) {
    var hrefString='<a href="javascript:void(0)" className="style8" onclick=vidteq.gui.sped.download("'+files+'"); >'+text+'</a>';
    var hrefString="<a class='maptab' style='cursor:pointer' onclick=vidteq.gui.sped.download(\""+files+"\"); >"+text+"</a><br/>";
    return hrefString;
  }
  return ({headerHtml:headerHtml,innerDivHtml:innerHtml});
}

vidteq._sped.prototype.download = function(files) {
  files=files.split(",");
  messageDiv=$('#messageDiv')[0];
  messageDiv.innerHTML = "<table align='center'><tr><td><a onfocus='this.blur();' style='font-size:18px;color:black;' class='style8'>The file you requested for is being prepared.</a></td><td><img src='"+vidteq.imgPath.load+"' /></td><td><a style='cursor:pointer;' class='message'  href='javascript:void(0);' onclick='javascript:ioAreaObj.cancelRequest();return false;'>Cancel</a></td></tr></table>";
  $.post(vidteq.cfg.magicHappensUrl + "?action=download&city="+vidteq.cfg.city, 
    {action:'download', videoFile : files},
    function foo(data) {
      var doc = vidteq.utils.getIFrameDocument('downloadIFrame');
      var href = document.location.href;
      var lastIndex = href.lastIndexOf("/");
      href = href.substring(0, lastIndex);
      href = href + "/" + vidteq.cfg.magicHappensUrl + "?action=getFile&city="+vidteq.cfg.city;
      formObj = vidteq.utils.attachForm(href, doc.body, doc, "POST")
      vidteq.utils.attachHiddenInputField(formObj, "start", doc, $("#starttextbox").val());
      vidteq.utils.attachHiddenInputField(formObj, "end", doc, $("#endtextbox").val());
      vidteq.utils.attachHiddenInputField(formObj, "fileName", doc, data.fileName);
      vidteq.utils.attachHiddenInputField(formObj, "action", doc, "getFile");
      formObj.submit();
      //messageDiv.innerHTML = "<p>File download will start now.</p>";
      messageDiv.innerHTML = "<a onfocus='this.blur();' style='font-size:18px;color:black;' class='style8'>File download will start now.</a>";
    },
    'json'
  );
}

vidteq._sped.prototype.invokeEmail = function (toEmail) {
  var l=(screen.width-300)/2;
  var t=(screen.height-300)/2;
  this.printWindow=window.open('','','width=500,height=300,left='+l+',top='+t+',scrollbars=yes,resizable=yes,titlebar=no,location=no,toolbar=no,menubar=no,directories=no');
  this.printWindow.document.open('text/html');
  this.printWindow.document.write("<head><style type='text/css'>a.poi   {font-size:11px;text-decoration:none;color:black;font-family:'Trebuchet MS', Arial;text-align:left;}a.textdir {text-decoration:none;cursor:pointer;font-family:'Trebuchet MS', Arial;font-size:13px;color:black;background-color:"+vidteq.vidteq.bgColor+";text-align:left;}p,a,b{font-size:12px;text-decoration:none;color:black;font-family:'Trebuchet MS', Arial;text-align:left;}h3{font-size:14px;text-decoration:none;color:black;font-family:'Trebuchet MS', Arial;text-align:left;}</style><script type=\"text/javascript\" src=\"js/jquery-1.4.2.min.js?r='"+vidteq._rStr+"'\"></script><script>sped = {}; sped.sendEmail = "+this.sendEmail+";sped.clickTextbox = "+this.clickTextbox+";sped.inputValEmail = \""+this.inputValEmail+"\";"+vidteq.utils.checkEmailId+vidteq.utils.makePathAbsolute+vidteq.utils.getRootPath+" ;var emailUrl =\""+vidteq.utils.makePathAbsolute(vidteq.cfg.emailUrl)+"\";var emailWindowMode = 1;"+showSendingPrompt+"</script><title>Driving Direction from "+this.gui.io.response.startAddress+" to "+this.gui.io.response.endAddress+"</title></head><body onload=\"$ = jQuery.noConflict();\"><div style='height:80px;'><div style='float:left;vertical-align:top;'><h3> Leaders in VideoMap<sup>TM</sup> based Driving Directions ..</h3><h3>&copy;&nbsp;VidTeq (India) Pvt. Ltd.</h3></div><div style='float:right;vertical-align:top;'></div></div><hr><div id='printdom' style='text-align:left'>"+toEmail+"</div></body>");
  this.printWindow.document.close();
}  

vidteq._sped.prototype.invokePrint = function (toPrint) {
  var l=(screen.width-300)/2;
  var t=(screen.height-300)/2;
  this.printWindow=window.open('','','width=480,height=300,left='+l+',top='+t+',scrollbars=yes,resizable=yes');
  this.printWindow.document.open('text/html');
  this.printWindow.document.write("<head><style type='text/css'>a.poi   {font-size:11px;text-decoration:none;color:black;font-family:'Trebuchet MS', Arial;text-align:left;}a.textdir {text-decoration:none;cursor:pointer;font-family:'Trebuchet MS', Arial;font-size:13px;color:black;background-color:"+vidteq.vidteq.bgColor+";text-align:left;}p,a,b{font-size:12px;text-decoration:none;color:black;font-family:'Trebuchet MS', Arial;text-align:left;}h3{font-size:14px;text-decoration:none;color:black;font-family:'Trebuchet MS', Arial;text-align:left;}</style><script type=\"text/javascript\" src=\"js/jquery-1.4.2.min.js?r='"+vidteq._rStr+"'\"></script><title>Driving Direction from "+toPrint.start+" to "+toPrint.end+"</title></head><body onload=\"$ = jQuery.noConflict();window.print();\"><div style='height:80px;'><div style='float:left;vertical-align:top;'><h3> Leaders in VideoMap<sup>TM</sup> based Driving Directions ..</h3><h3>&copy;VidTeq (India) Pvt. Ltd.</h3></div><div style='float:right;vertical-align:top;'><form style='padding-top:20px;'><input type=\"button\" value=\"Print this Route\" onClick='javascript:window.print();return false;'></form></div></div><hr><div id='printdom' style='text-align:left'>"+toPrint.html+"</div></body>");
  this.printWindow.document.close();
}  


vidteq._sped.prototype.createOldPopup = function(factor, newOne, force,content, id) {
  //if (typeof(newOne)!='undefined') {
  //  this.createOldPopup2(factor);
  //  this.showContents(content);
  //  return 0;
  //}
  try {
    $('#body')[0].removeChild($("#comdiv")[0]);
    $('#body')[0].removeChild($("#combg")[0]);
  } catch(e) {
  }
  var mainBody=$('#body')[0] || document.body;
  var vidteqDiv=$('#vidteq')[0] || '';
  var comWindow=vidteq.utils.createElem('div');
  var comWindowBg=vidteq.utils.createElem('div');
  //this.popUp = comWindow;
  //this.bg = comWindowBg;
  var left=$('#main')[0].offsetLeft;
  var top=(typeof(this.gui.embed)!='undefined')?mainBody.offsetTop:parseInt($('#dynamicDiv')[0].offsetTop)+120;
  if(top==0) top=$('#map')[0].style.top;
  var a=vidteq.utils.returnBrowserHeightWidth();
  height=a.height;
  var height=(typeof(this.gui.embed)!='undefined')?a.height:$('#dynamicDiv')[0].offsetHeight; 
  var width=(typeof(this.gui.embed)!='undefined')?mainBody.offsetWidth:$('#dynamicDiv')[0].offsetWidth;
  //if(vidteq.scriptBased) {
  //  height=parseInt(vidteqDiv.style.height);
  //  width=parseInt(vidteqDiv.style.width);
  //}   
  comWindowBg.style.width=a.width+"px";
  comWindowBg.style.height=a.height+"px";
  comWindowBg.id="combg";
  comWindowBg.style.left="0px";
  comWindowBg.style.top="0px";
  comWindowBg.style.opacity="0.4";
  comWindowBg.style.filter="alpha(opacity=40)";
  comWindowBg.style.backgroundColor=vidteq.mainColor;
  comWindowBg.style.zIndex=80000;
  comWindowBg.style.position='absolute';  
  comWindow.id="comdiv";
  mainBody.appendChild(comWindow);
  mainBody.appendChild(comWindowBg);
  comWindow.className='popupclass';
  comWindow.style.width=(width/factor)+"px";
  comWindow.style.height=(height/factor)+"px";
  if(typeof(vidteq.aD) != 'undefined' && (vidteq.aD.q == 'blocate' || vidteq.aD.q == 'locatestores')) {
    comWindow.style.width="650px";
    comWindow.style.height="450px";
  }
  if(this.gui.handheld) {
    comWindow.style.width="280px";
    comWindow.style.height="350px";
  }
  comWindow.style.left=left+parseInt((width-parseInt(comWindow.style.width))/2)+"px";
  comWindow.style.top=(typeof(this.gui.embed)!='undefined')?((height-height/factor)/2+"px"):320+"px";
  if(this.gui.handheld)  comWindow.style.top="50px";
  //if(vidteq.scriptBased) comWindow.style.top=parseInt(comWindow.style.top)+vidteqDiv.offsetTop+'px';
  comWindow.style.width=parseInt(comWindow.style.width)-4+"px";
  var border="10px solid #FFFFFF";
  comWindow.style.border=border;

  var closeDiv = vidteq.utils.createElem("div");
  comWindow.appendChild(closeDiv);
  this.closeMe = function () {
    try {
      if($('body')[0]) {  
        $('body')[0].removeChild(comWindow);
        $('body')[0].removeChild(comWindowBg);
      }
      document.body.removeChild(comWindow);
      document.body.removeChild(comWindowBg);
      ioAreaObj.changeBackOpacity(1);
    } catch(e) { }
  };
  closeDiv.className = 'close';
  var image = vidteq.utils.createElem("img");
  image.src = vidteq.imgPath.cross;
  image.alt = "Close";
  image.className = "close";
  var that = this;
  image.onclick = function() { that.closeMe(); }
  if(force===undefined || force == 0) {
      closeDiv.appendChild(image);
  }
  this.showContents(content,id);
  return 0;
}

//vidteq._sped.prototype.createOldPopup2 = function (factor) {
//  var __VIDTEQ_H=($(window).height());
//  var __VIDTEQ_TOP=parseInt((__VIDTEQ_H-(__VIDTEQ_H/factor))/2);
//  __VIDTEQ_H=parseInt(__VIDTEQ_H/factor);
//  var __VIDTEQ_W=parseInt(($(window).width())/factor);
//  var floatDiv=document.createElement('div');
//  var bgDiv=document.createElement('div');
//  floatDiv.id='comDivFixed';
//  var style={
//      'position':'fixed',
//      'top':__VIDTEQ_TOP+'px',
//      'left':'0px',
//      'width':'100%',
//      'height':'100%',
//      'textAlign':'center',
//      'zIndex':'10000'
//  }
//  for(var prop in style) {
//    floatDiv.style[prop]=style[prop];
//  }
//  var innerHTML=['<center style="height: '+__VIDTEQ_H+'px;">'];
//  if(!this.gui.handheld)
//    innerHTML.push('<div id="comdiv" style="width: '+__VIDTEQ_W+'px;background-color:#ACC488;border:10px solid white;height: '+__VIDTEQ_H+'px;"></div>'); 
//  else
//    innerHTML.push('<div id="comdiv" style="width:320px;background-color:#000;height:450px;"></div>');
//  innerHTML.push('</center>');
//  innerHTML=innerHTML.join('');
//  floatDiv.innerHTML=innerHTML;
//  bgDiv.id='vidteqBgDiv';
//  style = {
//      'width':'100%',
//      'height':'100%',
//      'overflow':'visible',
//      'left':'0',
//      'top':'0',
//      'opacity':'0.4',
//      'filter':'alpha(opacity=40)',
//      'backgroundColor':'#000',
//      'zIndex':8000,
//      'position':'fixed'
//  }
//  for(var prop in style) {
//    bgDiv.style[prop]=style[prop];
//  }
//
//  this.popUp = floatDiv;
//  this.bg = bgDiv;
//  document.body.appendChild(floatDiv);
//  document.body.appendChild(bgDiv);
//  var closeDiv = vidteq.utils.createElem("div");
//  $('#comdiv')[0].appendChild(closeDiv);
//  this.closeMe = function () {
//    try {
//      if($('body')[0]) {  
//        $('body')[0].removeChild(comWindow);
//        $('body')[0].removeChild(comWindowBg);
//      }
//      document.body.removeChild(comWindow);
//      document.body.removeChild(comWindowBg);
//      ioAreaObj.changeBackOpacity(1);
//    } catch(e) { }
//  };
//  closeDiv.className = 'close';
//  var image = vidteq.utils.createElem("img");
//  image.src = vidteq.imgPath.cross;
//  image.alt = "Close";
//  image.className = "close";
//  var that = this;
//  image.onclick = function() { that.closeMe();}
//  closeDiv.appendChild(image);
//}

//PopUpWindow.prototype.close = function() {
//  try {
//    if($('body')[0]) {  
//      $('body')[0].removeChild(this.popUp);
//      $('body')[0].removeChild(this.bg);
//    }
//    document.body.removeChild(this.bg);
//    document.body.removeChild(this.popUp);
//    ioAreaObj.changeBackOpacity(1);
//  } catch(e) {
//  }
//}

vidteq._sped.prototype.showContents = function (htmlInfo, id) {
  /*if(isMapXpanded){
  clearVideoTd();
  }*/
  vidteq.mainColor = '#376092';
  var classid = (typeof id !=='undefined'? ' '+id : '');
  var comParam,comFunc,comValue,inputVal,dynamicRows,dynamicColumns;
  var h = parseInt($('#comdiv')[0].style.height)-125+"px";
  var w = parseInt($('#comdiv')[0].style.width)-20+"px";
  var innerTextDiv = document.createElement("div");
  var innerHTML="";
  
  $('#comdiv')[0].appendChild(innerTextDiv);
  innerHTML+="<div id='headerDiv' style='text-align:center;padding:10px;height:40px;'><a onfocus='this.blur();' class='popupheader1"+classid+"'>"+htmlInfo.headerHtml+"</a><br><div style='text-align:center;padding:10px;height:40px;' id='messageDiv'></div></div>";
  if(typeof(vidteq.aD)!=='undefined')  {
    if(vidteq.aD.q == 'blocate' || vidteq.aD.q == 'locatestores') {
      innerHTML="<div id='headerDiv' style='text-align:center;padding:10px;height:40px;'><a onfocus='this.blur();' class='popupheader_yellow'>"+htmlInfo.headerHtml+"</a><br><div style='text-align:center;padding:10px;height:40px;' id='messageDiv'></div></div>";
    }   
  }
  if(this.gui.handheld) {
    innerHTML+="<div style='text-align:center; padding:4px;'><div id='innerDiv' style='position:relative;border: 1px solid #7fbee3; vertical-align:middle;background-color:#000;overflow:auto;margin-left:0px;margin-right:0px;height:"+h+";border:1px solid "+vidteq.mainColor+"'>"+htmlInfo.innerDivHtml+"</div></div>";
  } else {
    //horizontal and vertical scrollbar fix across browsers
    //overflow-wrap: break-word; //CSS3 only, required for chrome
    //overflow-x:hidden;overflow-y:auto
    if(typeof(htmlInfo.context)!=="undefined") {
      //fix for print popup vertical scroll
      var innerDivClass = htmlInfo.context+'DivFix';
      innerHTML+="<div style='text-align:center; padding:4px;'>"+
                 "<div id='innerDiv' class='innerDivFix "+innerDivClass+classid+"' style='position:relative;border: 1px solid #7fbee3; vertical-align:middle;background-color:#fff;margin-left:0px;margin-right:0px;height:"+h+";border:1px solid "+vidteq.mainColor+"'>"+htmlInfo.innerDivHtml+"</div>"+
                "</div>";
    } else {
      innerHTML+="<div style='text-align:center; padding:4px;'>"+
                 "<div id='innerDiv' class='innerDivFix"+classid+"'  style='position:relative;border: 1px solid #7fbee3; vertical-align:middle;background-color:#fff;margin-left:0px;margin-right:0px;height:"+h+";border:1px solid "+vidteq.mainColor+"'>"+htmlInfo.innerDivHtml+"</div>"+
                "</div>";
    }
  }
  if(typeof htmlInfo.lowerHtml!='undefined') {
    innerHTML+="<div style='text-align:center;padding:10px;'>"+htmlInfo.lowerHtml+"</div>"
  }
  //$('#comdiv')[0].innerHTML=innerHTML;
  innerTextDiv.innerHTML=innerHTML;
  //TBD: As of now only link id is passed. Some way to get all the buttons id, so can conditionally do some action. Avoid hard-coding of id.
  if( id ) {
    $("#comdiv #innerDiv."+id).mouseenter(function(e) {
      vidteq.utils.selectText( this );
    });  
  }
  
  try {
    // Jquery round corners fails in IE. So don' don't do it.
    if(!self.navigator.userAgent.match(/MSIE/)) $('#comdiv').corner("round");
  }
  catch(e) {}
  if (htmlInfo.funcList) {
    for (var i in htmlInfo.funcList) { $("#"+i).click(htmlInfo.funcList[i]); }
  }
}

vidteq._sped.prototype.clickedSmstab = function () {
  if ( this.gui.topBarUI  || this.gui.sideBarUI 
         || (typeof(this.gui.nemo)!=="undefined" && this.gui.nemo) 
         || (typeof(vidteq.aD) != 'undefined' && typeof(vidteq.aD.config) != 'undefined' 
              && typeof(vidteq.aD.config.theme) != 'undefined' && vidteq.aD.config.theme != '')
         || this.gui.wowPlace){
    var l = this.prepareSMS(this.gui.io.response);
    vidteq.utils.drapeSheer('divRoutePop');
    var popInfoConfig = this.getPopInfoConfig();
    var that = this;
    vidteq.utils.createPopup({
      html:l.allHtml,
      funcList:l.funcList,
      overflowDiv:'smsInnerDiv',
      headerDiv:'smsHeaderDiv',
      margins:(5+4+2),
      submitId:'mobile_submit' //,
      //submitFunc:function (response) {that.sendSMS();}
    },popInfoConfig);
    
    if (this.gui.sideBarUI ) {      
      var wM = 0;
      if(parseInt($("#divRoutePop").width()) >= 499) {        
        wM = parseInt($("#divRoutePop").width()) - 499;              
      } else { wM = parseInt($("#divRoutePop").width()) - 499; }
      this.attachNiceScroll('smsInnerDiv',wM);
    }
    
    return;
  }
  this.createOldPopup(2,undefined,undefined,this.prepareSMS(this.gui.io.response));
}

vidteq._sped.prototype.attachNiceScroll = function (id,margin) {
  if (!self.navigator.userAgent.match(/MSIE\s[7,8]/)){
    $("#"+id).niceScroll({
      cursorwidth:"7px",cursorfixedheight: 22,
      autohidemode:false,cursorborderradius:'0',cursorborder:'0',
      background:'#A87C2C'
    });  
  } else {
    $('#'+id).css({overflow:'auto'});
  }
  $('#body').find('div[id^=ascrail]').each(function () {
    $(this).css({'margin-left':margin}); 
  });
}

vidteq._sped.prototype.clickedEmailtab = function () {
  if ( this.gui.topBarUI || this.gui.sideBarUI 
         || (typeof(this.gui.nemo)!=="undefined" && this.gui.nemo)  
         || (typeof(vidteq.aD) != 'undefined' && typeof(vidteq.aD.config) != 'undefined' 
              && typeof(vidteq.aD.config.theme) != 'undefined' && vidteq.aD.config.theme != '')
         || this.gui.wowPlace){
    var l = '';
    if(this.gui.wowPlace) {    
      l = this.prepareEmail(this.gui.io.response,1);
    } else {
      l = this.prepareEmail(this.gui.io.response);
    }
    if (l.allHtml == '')  { return; }
    vidteq.utils.drapeSheer('divRoutePop');
    var popInfoConfig = this.getPopInfoConfig();
    var that = this;
    vidteq.utils.createPopup({
      html:l.allHtml,
      funcList:l.funcList,
      overflowDiv:'emailInnerDiv',
      headerDiv:'emailHeaderDiv',
      margins:(5+4+2),
      submitId:'email_submit' //,
      //submitFunc:function () { that.sendEmail();}
    },popInfoConfig);
    
    if (this.gui.sideBarUI ) {
      var wM = parseInt($("#divRoutePop").width()) - 500;      
      this.attachNiceScroll('emailInnerDiv',wM);      
    }    
    
    return;
  }
  var l = this.prepareEmail(this.gui.io.response);
  if (l.allHtml == '')  { return; }  // poped email mode
  this.createOldPopup(2,undefined,undefined,l);
}

vidteq._sped.prototype.clickedPrinttab = function(id) {
  if ( this.gui.topBarUI || this.gui.sideBarUI  
         || (typeof(this.gui.nemo)!=="undefined" && this.gui.nemo)  
         || (typeof(vidteq.aD) != 'undefined' && typeof(vidteq.aD.config) != 'undefined' 
              && typeof(vidteq.aD.config.theme) != 'undefined' && vidteq.aD.config.theme != '')){
    var l = this.preparePrintOptions(this.gui.io.response);
    vidteq.utils.drapeSheer('divRoutePop');
    var popInfoConfig = this.getPopInfoConfig();
    vidteq.utils.createPopup({
      html:l.allHtml,
      funcList:l.funcList,
      overflowDiv:'printInnerDiv',
      headerDiv:'printHeaderDiv',
      margins:(5+4+2)
      },popInfoConfig);
    return;
  }
  this.createOldPopup(2,undefined,undefined,this.preparePrintOptions(id));
}

vidteq._sped.prototype.clickedLinktab = function ( id ) {
  if ( this.gui.topBarUI || this.gui.sideBarUI 
         || (typeof(this.gui.nemo)!=="undefined" && this.gui.nemo)  
         || (typeof(vidteq.aD) != 'undefined' && typeof(vidteq.aD.config) != 'undefined' 
              && typeof(vidteq.aD.config.theme) != 'undefined' && vidteq.aD.config.theme != '')){
    var l = this.prepareLink( id );
    vidteq.utils.drapeSheer('divRoutePop');
    var popInfoConfig = this.getPopInfoConfig({type:id});
    vidteq.utils.createPopup({
      html:l.allHtml,
      funcList: l.funcList,
      overflowDiv:'linkInnerDiv',
      headerDiv:'linkHeaderDiv',
      margins:(5+4+2)
    },popInfoConfig);
    var that = this;
    if ( this.gui.topBarUI || this.gui.sideBarUI) {
      if(typeof(this.qrTimeout)!='undefined') clearTimeout(this.qrTimeout);
      this.qrTimeout = setTimeout(function() { that.getQRCode(); }, 500);
    }
    return;
  }
  this.createOldPopup(2,undefined,undefined,this.prepareLink( id ), id );
}

vidteq._sped.prototype.getPopInfoConfig = function( o ) {
  o = o || {};
  var popupInfoConfig = this.gui.popInfoConfig || {name:'divRoutePop',factor:2,animateTime:1000};
  return $.extend({}, popupInfoConfig, o );
}
