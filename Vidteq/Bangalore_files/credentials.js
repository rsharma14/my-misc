if (typeof(vidteq) == 'undefined') { vidteq = {}; }

vidteq._credentials = function (gui) {
  this.gui = gui;
  // vertical 
  this.id = 'feedbackdiv';
  // horizontal
  this.id = 'feedbackhref';
}

vidteq._credentials.prototype.init = function() {
  if (vidteq.aD.feedbackemail && vidteq.aD.feedbackemail !='') {
    this.attachFeedbackTab();
  } else  {
    if ($('#feedbackhref').length) { $('#feedbackhref').css('display','none'); }
    if ($('#feedbackdiv').length) { $('#feedbackdiv').css('display','none'); }
  }
  var feedbackForm = { 
    url:'feedback/feedback_vidteq.html',
    force:0,noOfQuestions:12,
    submitId:'feedback_submit',
    tabId:'feedbackhref'
  };
  if(this.gui.embed && this.gui.embed.wayfinder)  {
    feedbackForm = { 
      url:'feedback/feedback_wayfinder.html',
      force:0,noOfQuestions:7,
      submitId:'feedback_submit',
      tabId:'feedbackhref'
    };
  }
  if(this.gui.embed && (this.gui.embed.blocate || this.gui.embed['blocate-lite']))  {
    feedbackForm = { 
      url:'feedback/feedback_evisit.html',
      force:0,noOfQuestions:13,
      submitId:'feedback_submit',
      tabId:'feedbackhref'
    };
    if(this.gui.topBarUI || this.gui.sideBarUI) {
      feedbackForm.url = 'feedback/feedback_evisit_topBarUI.html';
    }
  }
  if(this.gui.embed && this.gui.embed.locateStores) {
    feedbackForm = { 
      url:'feedback/feedback_storelocator.html',
      force:0,noOfQuestions:9,
      submitId:'feedback_submit',
      tabId:'feedbackhref'
    };
  }
  this.id = feedbackForm.tabId;
  this.feedbackForm = feedbackForm;
}

vidteq._credentials.prototype.attachFeedbackTab = function() {
  //var feedbackForm = { 
  //  url:'feedback/feedback_vidteq.html',
  //  force:0,noOfQuestions:12,
  //  submitId:'feedback_submit',
  //  tabId:'feedbackhref'
  //};
  //if(this.gui.embed && this.gui.embed.wayfinder)  {
  //  feedbackForm = { 
  //    url:'feedback/feedback_wayfinder.html?r='+vidteq._rStr,
  //    force:0,noOfQuestions:7,
  //    submitId:'feedback_submit',
  //    tabId:'feedbackhref'
  //  };
  //}
  //if(this.gui.embed && this.gui.embed.blocate)  {
  //  feedbackForm = { 
  //    url:'feedback/feedback_evisit.html?r='+vidteq._rStr,
  //    force:0,noOfQuestions:13,
  //    submitId:'feedback_submit',
  //    tabId:'feedbackhref'
  //  };
  //  if(this.gui.topBarUI) {
  //    feedbackForm.url = 'feedback/feedback_evisit_topBarUI.html?r='+vidteq._rStr;
  //  }
  //}
  //if(this.gui.embed && this.gui.embed.locateStores) {
  //  feedbackForm = { 
  //    url:'feedback/feedback_storelocator.html?r='+vidteq._rStr,
  //    force:0,noOfQuestions:9,
  //    submitId:'feedback_submit',
  //    tabId:'feedbackhref'
  //  };
  //}
  //this.id = feedbackForm.tabId;
  if(this.gui.embed && this.gui.embed.blocate)  {
    return; // in blocate we have top panel feedback 
  }
  var that = this;
  $('#'+this.id).click(function () {
    $.get(that.feedbackForm.url,function (content) {
      that.handleFeedbackForm(content); 
    });
    //if (that.gui.topBarUI) {  // TBD
    //  ioAreaObj.selectInTopPanel('div_feedbackhref');
    //}
  });
}

vidteq._credentials.prototype.handleFeedbackForm = function(content,feedbackForm) {
  var feedbackForm = feedbackForm || this.feedbackForm;
  if(this.gui.topBarUI || this.gui.sideBarUI) {
    var s = vidteq.utils.getPopupParams(1.7); 
    var pName = 'divInnerFeedback';
    if ($("#"+pName).length) { $("#"+pName).remove(); }
    //may have some side effects original z-index:80000
    var con = $("<div id = '"+pName+"' style='z-index:9985;position:absolute;left:"+s.left+"px;top:"+s.top+"px;padding:10px;background-color:transparent;'></div>").appendTo('body');
    con.html(content);
    $('.infoContent').css({'background-color':vidteq.vidteq.bgColor}); // TBD why
    con.css('height',con.height()); // just formalize
    con.css('width',con.width());  // just formalize
    var boxImage = { url:vidteq.imgPath.refBox3, cornerW:10, cornerH:10, boxW:510, boxH:378, offsetW:0, offsetH:0 };
    vidteq.utils.boxify(boxImage,pName,{lt:1,rt:1,lb:1,rb:1});
    if (!feedbackForm.force) { vidteq.utils.attachCloseDiv(pName); }
    var that = this;
    $("#"+feedbackForm.submitId).click(function () {
      if (that.sendFeedback(feedbackForm.noOfQuestions,1)) {
        $('#'+pName).remove();
      }
    });
  } else {
    var feedbackHeaderMessage="We take our customer’s feedback very seriously in making constant improvements to our service. Please take a moment to tell us how you feel about this service. Thank you!!";
    
    if(vidteq.aD.q == 'wayfinder' || vidteq.aD.q == 'wayfinder-lite') {
      feedbackHeaderMessage="Please provide your Feedback.";
    }

    this.gui.sped.createOldPopup(1.7,undefined,undefined,{
      headerHtml:feedbackHeaderMessage,
      innerDivHtml:content
    });
    //ioAreaObj.popup=(new PopUpWindow(1.7,undefined));
    //ioAreaObj.popup.showContents({
    //  headerHtml:feedbackHeaderMessage,
    //  innerDivHtml:content
    //});
    $('#messageDiv')[0].style.display='none';
    $('#innerDiv')[0].style.padding="10px";
    $('#feedbackExploreCity').html('to explore '+vidteq.cfg.city.charAt(0).toUpperCase()+vidteq.cfg.city.slice(1)+' city');
    var that = this;
    $("#"+feedbackForm.submitId).click(function () {
      that.sendFeedback(feedbackForm.noOfQuestions,1);
    });
  }
}

vidteq._credentials.prototype.isItALead = function(feedback) {
  for (var i in feedback) {
    if (feedback[i].vidCol != 'q_mobile') { continue; }
    if (feedback[i].ans != '') { return true; }
    return false;
  }
  return false;
}

vidteq._credentials.prototype.sendFeedback = function(noOfQuestions,validate) {
// feedback.js also got copied here ....Reason... For Contact detail form I want to use the sendFeedback routine. 
  validate=validate || 0;
  //Follow a simple convention for feedback forms .
  //All Question texts have id as q(number)-text and input fields have corresponding as q(number)-ans.
  //Special case of radio buttons as q(number)-ans and q(number)-ans-a.
  //Also give name=select for identification of select tags. As we use id to access and not NAMES
  //Validation takes array of ids of input types to be validated, append id of tr if it is under a condition
  if(typeof(vidteq.aD)!='undefined' && validate && !this.gui.expressInterest) {
    if(vidteq.aD.q=='locatestores' && !this.validateFeedbackQuestions(['q1-ans','q2-ans:condition0','q3-ans','q4-ans:condition1','q6-ans:condition2'])) {
      alert('Please fill in your details'); 
      return 0;
    }
  }
  if (validate && !this.checkFeedbackForm() && !this.gui.expressInterest) {
    if(!this.gui.sideBarUI) {        
      alert('Please fill in your details'); 
    }    
    return 0;
  }

  if ($('#messageDiv').length) {
    $('#messageDiv')[0].innerHTML="<a style='font-size:18px;color:#21598C' ></a>";
  }
  var account= (typeof vidteq.vidteq.account!='undefined'?vidteq.vidteq.account:'vidteq');
  var urlId = 'vidteq';
  var curDate = new Date();
  var paramsToSend = { action:'feedback',city:vidteq.cfg.city,account:account, 'date':curDate.toLocaleString() };
  var cookieTime=3;           
  if(typeof(vidteq.aD)!='undefined') {
    paramsToSend.q = vidteq.aD.q;
    paramsToSend.urlId = vidteq.aD.urlId;
    if (this.gui.embed && this.gui.embed.blocate && this.gui.embed.place && 
        this.gui.embed.place.address && this.gui.embed.place.address.name) {
      paramsToSend.projName = encodeURIComponent(this.gui.embed.place.address.name);
    }
    if (vidteq.aD.urlId=="Sobha_City" ||
         vidteq.aD.urlId=="Sobha_Habitech" ||
         vidteq.aD.urlId=="Sobha_Forest_View" ||
         vidteq.aD.urlId=="Sobha_ASPIRE" ) {
      if (this.gui.io.startAddress) {
        paramsToSend.clientLocation = this.gui.io.startAddress;
      } else {
        paramsToSend.clientLocation = 'Not determinable';
      }
    }
    urlId = vidteq.aD.urlId;
    if(typeof(vidteq.aD.config.intrFeedCookieTime)!='undefined')
      cookieTime=vidteq.aD.config.intrFeedCookieTime;    
  }           
  //vidteq.utils.writeCookie(account+"_feedbackgiven",true,90); //Hijack to 90 DayS
  vidteq.utils.writeCookie(urlId+"_feedbackgiven",true,90); //Hijack to 90 DayS
  if(typeof(vidteq.aD)!='undefined' && 
     vidteq.aD.feedbackemail && vidteq.aD.feedbackemail !='') {
    //Mails should not go to customer if tried in Raste     
    if(document.location.hostname.match(/vidteq/i)) paramsToSend.customersEmail=vidteq.aD.feedbackemail;
  }
  if(this.gui.expressInterest) { 
    if(typeof(this.gui.sideBarUIFeedback) != 'undefined') {
      var feedback = this.gui.sideBarUIFeedback;
    }
  } else {
    var feedback = this.getFeedbackFormData(noOfQuestions);
  }
  if (this.isItALead(feedback)) {
    // leads have to go to leadsEmail if present
    if(typeof(vidteq.aD)!='undefined' && 
      vidteq.aD.config.leadsEmail && vidteq.aD.config.leadsEmail !='') {
      if(document.location.hostname.match(/vidteq/i)) paramsToSend.customersEmail=vidteq.aD.config.leadsEmail;
    }
  }
  paramsToSend.feedback=JSON.stringify(feedback);
  if(vidteq.vidteq && vidteq.vidteq.browser) {
    paramsToSend.browser='';
    for(var i in vidteq.vidteq.browser) if(i!='version') paramsToSend.browser+=i;
    paramsToSend.browser+=" "+vidteq.vidteq.browser.version;
  }
  if (typeof(vidteq.aD)!='undefined') {
    if (vidteq.aD.urlId=="Arthabfs") {
      paramsToSend.feedbackPostUrl = 'http://www.arthatesting.com/customerbank/VideoLeads.aspx?Name=q_name&MobileNo=q_mobile&EmailId=q_email&City=q_customer_city&Project=12';
    }
    if (vidteq.aD.urlId=="Artha_Grihasta") {
      paramsToSend.feedbackPostUrl = 'http://www.arthatesting.com/customerbank/VideoLeads.aspx?Name=q_name&MobileNo=q_mobile&EmailId=q_email&City=q_customer_city&Project=73';
    }
    if (vidteq.aD.urlId=="Artha_Riviera") {
      paramsToSend.feedbackPostUrl = 'http://www.arthatesting.com/customerbank/VideoLeads.aspx?Name=q_name&MobileNo=q_mobile&EmailId=q_email&City=q_customer_city&Project=83';
    }
    if (vidteq.aD.urlId=="mountain_view") {
      paramsToSend.feedbackPostUrl = 'http://www.arthatesting.com/customerbank/VideoLeads.aspx?Name=q_name&MobileNo=q_mobile&EmailId=q_email&City=q_customer_city&Project=14';
    }
  }
  if ($('#messageDiv').length) {
    $('#messageDiv')[0].innerHTML="<a style='font-size:18px;color:#21598C' >Thanks for feedback. <br/> <br/> Want a Vidteq Application for your business? Checkout the Products and Services to learn more.</a>";
  }
  if($('#feedbackQuestions').length) {
    $('#feedbackQuestions')[0].style.visibility="hidden";
  }
  if(this.gui) { // TBD
    if (this.gui.topBarUI || this.gui.sideBarUI ||
       (this.gui.embed && (this.gui.embed.locateStores || this.gui.embed.wayfinder))) {
      var temp = new this.gui.sped.showSendingPromptTopBarUI(3);
    } else if(this.gui.handheld) {
      //$('#credForm').hide(500);
    } else {
      if(this.gui.embed) this.gui.sped.showSendingPrompt();
    }
  }
  this.gui.expressInterest = false;
  $.post(
    vidteq.cfg.magicHappensUrl,
    paramsToSend,
    function (data) { 
  });
  return 1;
}


vidteq._credentials.prototype.validateFeedbackQuestions = function(qArr) {
  var valid=true;
  for(i in qArr) {
    var condition=null;
    var backgroundDiv = null;
    var id = qArr[i];
    if(qArr[i].match(/:/)) {
      var a=qArr[i].split(/:/);
      id=a[0];
      condition=a[1];
      backgroundDiv = a[2];
    }
    if (!backgroundDiv) { backgroundDiv = id+'-td'; }
    $('#'+backgroundDiv).css('background-color',vidteq.vidteq.bgColor);    
    if (!$('#'+id).length || !$('#'+id).is(':visible')) continue;
    if ($('#'+condition).length && !$('#'+condition).is(':visible')) continue;
    if($('#'+id)[0].type== 'radio') {
      if($('#'+id)[0].checked || $('#'+id+'-a')[0].checked) { continue; }
      //if($('#'+id)[0].checked == false && $('#'+id+'-a')[0].checked ==false) {
      $('#'+backgroundDiv).css('background-color','red');
      valid=false;
      continue;
      //}
    } 
    if($('#'+id)[0].type == 'text') {
      if($('#'+id).val() == '') {
        if(!this.gui.expressInterest && this.gui.sideBarUI) {
          $('.infoContent').find('label[id^=error-q]').each(function () {
            $(this).text("This field is required"); 
          });
        } else {
          $('#'+backgroundDiv).css('background-color','red');
        }        
        valid=false;
        continue;
      }  //else {
      if (!$('#'+id).attr('vidCheck')) { continue; }
      //if ($('#'+id).attr('vidCheck')) {
      var func = $('#'+id).attr('vidCheck');
      if (func == 'checkEmailId') {       
        if(!this.gui.expressInterest  && this.gui.sideBarUI) {
          var checkEmailMsg = vidteq.utils.checkEmailId($('#'+id).val(),true);          
          if(checkEmailMsg != '') {
            $('#error-q2-ans').text(checkEmailMsg);     
          } else {
            $('#error-q2-ans').text('');
            continue;
          }      
        } else {
          if (vidteq.utils.checkEmailId($('#'+id).val())) { continue; }
          //if (!vidteq.utils.checkEmailId($('#'+id).val())) { 
          $('#'+backgroundDiv).css('background-color','red');
        }
        valid=false;
        continue;
        //}
      } 
      if (func == 'checkPhoneNumber') {
        if(!this.gui.expressInterest && this.gui.sideBarUI) {
          var checkPhoneMsg = vidteq.utils.checkPhoneNumber($('#'+id).val(),'sideBarUI',true);
          if(checkPhoneMsg != '') {
            $('#error-q3-ans').text(checkPhoneMsg);     
          } else {
            $('#error-q3-ans').text('');
            continue;
          }      
        } else {
          if (vidteq.utils.checkPhoneNumber($('#'+id).val())) { continue; } 
          $('#'+backgroundDiv).css('background-color','red');
        }
        valid=false;
        continue;
      } 
      alert("Validation missing for "+id+" "+func);
      valid=false;
      continue;
      //}
      //}
    } 
    if($('#'+id)[0].name == 'select') {
      if($('#'+id)[0].selectedIndex!=0) { continue; }
      $('#'+backgroundDiv).css('background-color','red');
      valid = false;
      continue;
    }
  }
  return valid;
}

vidteq._credentials.prototype.checkFeedbackForm = function() {
  var must = [];
  $('[id^=q][id$=\-text]').each(function () {
    var t = $(this);
    if (t.attr('vidMust')) { 
      var i = t.attr('id');
      i = i.replace(/text/,'ans');
      if (t.attr('vidMust') != '1') { i += ':'+t.attr('vidMust'); }
      must.push(i); 
    }
  });
  if (must.length && !this.validateFeedbackQuestions(must)) { return false; }
  return true;
}

vidteq._credentials.prototype.getFeedbackFormData = function(noOfQuestions) {
  // noOfQuestions no lnger needed
  var feedback=[];
  $('[id^=q][id$=-ans]').each(function () {
    var i =  $(this).attr('id');
    i = i.replace(/^q/,'');
    i = parseInt(i.replace(/-ans$/,''));
    var ans=$('#q'+i+'-ans').val() || 'No Answer';
    if($('#q'+i+'-ans')[0].type == 'radio') {
      if($('#q'+i+'-ans')[0].checked) { ans='yes' }
      else if($('#q'+i+'-ans-a')[0].checked) { ans='No' }
      else { ans='No Answer'; }
    }
    if($('#q'+i+'-ans')[0].name == 'select') {
      ans=$('#q'+i+'-ans')[0].options[($('#q'+i+'-ans')[0].selectedIndex)].value;
    }   
    var txt=$('#q'+i+'-text').html();   
    txt=txt.replace(/\n/g,"");
    txt=txt.replace(/\t/g,"");
    txt=vidteq.utils.trim(txt);
    var item = {'text':txt,'ans':ans};
    if ($('#q'+i+'-text').attr('vidCol')) { 
      item.vidCol=$('#q'+i+'-text').attr('vidCol');
    }
    feedback.push(item);
  });
  return feedback;
}

//vidteq._credentials.prototype.getFeedbackFormData = function(noOfQuestions) {
//  var feedback=[];
//  for(var i=0;i<noOfQuestions;i++) {
//    var ans=$('#q'+(i+1)+'-ans').val() || 'No Answer';
//    if($('#q'+(i+1)+'-ans')[0].type == 'radio') {
//      if($('#q'+(i+1)+'-ans')[0].checked) { ans='yes' }
//      else if($('#q'+(i+1)+'-ans-a')[0].checked) { ans='No' }
//      else { ans='No Answer'; }
//    }
//    if($('#q'+(i+1)+'-ans')[0].name == 'select') {
//      ans=$('#q'+(i+1)+'-ans')[0].options[($('#q'+(i+1)+'-ans')[0].selectedIndex)].value;
//    }   
//    var txt=$('#q'+(i+1)+'-text').html();   
//    txt=txt.replace(/\n/g,"");
//    txt=txt.replace(/\t/g,"");
//    txt=vidteq.utils.trim(txt);
//    var item = {'text':txt,'ans':ans};
//    if ($('#q'+(i+1)+'-text').attr('vidCol')) { 
//      item.vidCol=$('#q'+(i+1)+'-text').attr('vidCol');
//    }
//    feedback.push(item);
//  }
//  return feedback;
//}

vidteq._credentials.prototype.installFeedbackCallBacks = function() {
  //Forced feedback after 10 Minutes. Once he gives feedback, cookie is written and force won't happen for that account for 3 days.
  if(typeof(vidteq.aD) =='undefined' || typeof(vidteq.aD.config.intrFeedTime) == 'undefined') return;
  if(!vidteq.aD.feedbackemail || vidteq.aD.feedbackemail=='') return;
  if(parseInt(vidteq.aD.config.intrFeedTime) == 0 ) return;
  if(!vidteq.utils.readCookie(vidteq.vidteq.account)) {
    var that = this;
    this.timedFeedback=setTimeout(function () { 
      that.handleFeedbackCallBack(); 
    },parseInt(vidteq.aD.config.intrFeedTime));
  }
}

vidteq._credentials.prototype.handleFeedbackCallBack = function() {
  if(vidteq.utils.readCookie(vidteq.aD.account+"_feedbackgiven")) return;
  if (vidteq.aD.feedbackpopped) return;
  //if(vidteq.utils.readCookie(vidteq.aD.account+"_feedbackpopped")) return;
  else {
    //vidteq.utils.writeCookie(vidteq.aD.account+"_feedbackpopped",true,1);
    vidteq.aD.feedbackpopped = 1;
    if ($('#'+this.id).length && $('#'+this.id).is(':visible')) {
      $('#'+this.id).click(); 
    }
  }
}

vidteq._credentials.prototype.popUserInfoQuery = function() {
  if (typeof(vidteq.aD) =='undefined' || typeof(vidteq.aD.config.intrCredCookieTime) == 'undefined') return;
  //if (this.gui.handheld) {
    //if (vidteq.aD.config.intrCredHandheld) { } else { return; }
  //}
  if (!parseInt(vidteq.aD.config.intrCredCookieTime)) return;
  //if (vidteq.utils.readCookie(vidteq.aD.account+'_contactinfo')) { return; }
  if (vidteq.utils.readCookie(vidteq.aD.urlId+'_contactinfo')) { return; }
  var userInfoQuery = {noOfQuestions:3,force:0,url:'feedback/userinfo.html'};
  if(this.gui.embed && this.gui.embed.locateStores) {
    userInfoQuery = {
      noOfQuestions:4,force:0,submitId:'detailsSubmit',
      url:'feedback/userinfo_storelocator.html'
    };
  }
  if(this.gui.topBarUI || this.gui.sideBarUI || this.gui.handheld || (this.gui.embed && this.gui.embed.wayfinder)) {
    var formUrl = 'feedback/userinfo_topBarUI.html';
    if(this.gui.sideBarUI) {
      formUrl = 'feedback/userinfo_sideBarUI.html';
    }
    if (this.gui.handheld) { formUrl = 'feedback/userinfo_handheld.html'; }
    userInfoQuery = {
      noOfQuestions:3,
      force:0,
      url:formUrl,
      submitId:'detailsSubmit' 
    };
  }
  if (vidteq.aD.urlId == 'adarsh_palm_retreat' ||
      vidteq.aD.urlId == 'Arthabfs' ||
      vidteq.aD.urlId == 'Artha_Grihasta' ||
      vidteq.aD.urlId == 'Artha_Riviera' ||
      vidteq.aD.urlId == 'mountain_view' ) {
    userInfoQuery = {noOfQuestions:5,force:0,url:vidteq.cfg.customHtmlUrl+'credentials_'+vidteq.aD.urlId+'.html',submitId:'detailsSubmit'};
  } 
  if (vidteq.aD.config.customCredentialForm) {
    userInfoQuery = {noOfQuestions:5,force:0,url:vidteq.cfg.customHtmlUrl+'credentials_'+vidteq.aD.urlId+'.html',submitId:'detailsSubmit'};
  }
  if(parseInt(vidteq.aD.config.intrCredForce)) { userInfoQuery.force=1; }
  var that = this;
  var url = userInfoQuery.url;
  var data = {};  // following is temp fixe till we cleanup
  if (url.match(/^feedback/)) {
    data.form = url.replace(/feedback\//,'');
    url = vidteq.cfg.feedbackFormUrl;
    this.credAjax=$.ajax({
      url:url,
      dataType:vidteq.vidteq.dataType,
      data:data,
      success: function (content) { 
        that.handleUserInfoQuery(content,userInfoQuery);
      },
      error: function (xObj) { 
        that.handleUserInfoQuery(xObj.responseText,userInfoQuery);
      }
    });
  } else {
    // TBD will not work in widget mode
    $.get(userInfoQuery.url,function (content) { that.handleUserInfoQuery(content,userInfoQuery); });
  }
  //vidteq.utils.writeCookie(vidteq.aD.account+'_contactinfo',true,parseInt(vidteq.aD.config.intrCredCookieTime));    
  vidteq.utils.writeCookie(vidteq.aD.urlId+'_contactinfo',true,parseInt(vidteq.aD.config.intrCredCookieTime));    
}

vidteq._credentials.prototype.handleUserInfoQuery = function(content,userInfoQuery) {
  if (this.gui.topBarUI || this.gui.sideBarUI ||
     (this.gui.embed && this.gui.embed.wayfinder) ||
     (this.gui.embed && this.gui.embed.locateStores)) {
    var s = vidteq.utils.getPopupParams(1.7);
    var pName = 'divInnerUserInfo';
    if ($("#"+pName).length) { $("#"+pName).remove(); }
    vidteq.utils.drapeSheer(pName);
    //may have some side effects original z-index:80000
    var con = $("<div id = '"+pName+"' style='z-index:9985;position:absolute;left:"+s.left+"px;top:"+s.top+"px;padding:10px;background-color:transparent;'></div>").appendTo('body');
    con.html(content);
    $('.infoContent').css({'background-color':vidteq.vidteq.bgColor});  // TBD check it
    con.css('height',con.height()); // just formalize
    con.css('width',con.width());  // just formalize
    var boxImage = { url:vidteq.imgPath.refBox3, cornerW:10, cornerH:10, boxW:510, boxH:378, offsetW:0, offsetH:0 };
    vidteq.utils.boxify(boxImage,pName,{lt:1,rt:1,lb:1,rb:1});
    s.rWidth = parseInt($("#"+pName).outerWidth());
    s.rHeight = parseInt($("#"+pName).outerHeight());
    $("#"+pName).animate({left:parseInt(s.left+(s.width-s.rWidth)/2)+'px',top:parseInt(s.top+(s.height-s.rHeight)/2)+"px"},1000);
    var that = this;
    if (!userInfoQuery.force) { vidteq.utils.attachCloseDiv(pName); }
    $('#'+userInfoQuery.submitId).click(function () {
      if (userInfoQuery.validate && !userInfoQuery.validate()) { return 0; }
      //if (!userInfoQuery.validate()) { return 0; }
      // noOfQuestions may not be needed anymore
      if (that.sendFeedback(userInfoQuery.noOfQuestions,1)) {
        vidteq.utils.undrapeCurtain(pName);
        $('#'+pName).remove();
      }
    });
  } else if(this.gui.handheld) {
    $('#credForm').html(content); 
    $('#credForm').show();
    var that = this;
    if(userInfoQuery.force) { 
      $('#closeFeedback').hide();
    }
    // TBD we may need intrusive mandatory credentials
    $('#closeFeedback').click(function(){
      $('#credForm').hide(500);
    });
    $('#detailsSubmit').click(function () {
      //if(!vidteq.utils.checkEmailId($('#q2-ans').val())) { return 0; }
      //if (!vidteq.utils.checkPhoneNumber($('#q3-ans').val())) { return 0; }
      if (that.sendFeedback(userInfoQuery.noOfQuestions,1)) {
        $('#credForm').hide(500);
      }
    });
  } else {
    this.gui.sped.createOldPopup(2.2,undefined,userInfoQuery.force,{
      headerHtml:"Please fill in your details ..",
      innerDivHtml:content
    });
    //ioAreaObj.popup=(new PopUpWindow(1.7,undefined));
    //ioAreaObj.popup.showContents({
    //  headerHtml:feedbackHeaderMessage,
    //  innerDivHtml:content
    //});
    //ioAreaObj.popup=(new PopUpWindow(2.2,undefined,force));
    //ioAreaObj.popup=(new PopUpWindow(2.2,undefined,userInfoQuery.force));
    //ioAreaObj.popup.showContents({
    //  headerHtml:"Please fill in your details ..",
    //  innerDivHtml:content
    //});
    var that = this;
    $('#detailsSubmit').click(function () {
      if(!vidteq.utils.checkEmailId($('#q2-ans').val())) { return 0; }
      if (!vidteq.utils.checkPhoneNumber($('#q3-ans').val())) { return 0; }
      that.sendFeedback(userInfoQuery.noOfQuestions);
    });
  }
}
