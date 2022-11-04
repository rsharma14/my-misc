/**
 * @summary     CategoryWgt
 * @description It provides Category Buttons UI and event Handling for categories object defined by "CategoryFactory".
 *              - It depends on:
 *              - nemo.category-factory.js
 *              - nemo.category.js
 * @version     2.0.0
 * @file        nemo.category-wgt.js
 * @author      Bhaskar Mangal ( bhaskar@vidteq.com )
 * @contact     www.vidteq.com
 *
 * @copyright Copyright 2013-2015 www.vidteq.com, all rights reserved.
 */
(function( global,document, root ) {
  root = global[root] = ( global[root]? global[root] : {} );

  function CategoryWgt( options ) {
    options = options || {};
    this.domId = "nemo-category-container";
    this.evaluationRequired = false;
    this.wayfinderSearchRequired = false;
    this.introRequired = false;
    this.legendRequired = false;
    this.toolBarRequired = false;
    this.legendAppendTo = 'body';
    this.categoryWgtRequired = true;
    //this.evalWgtRequired = false;
    this.categoryAutoTrigger = false;
    this.categoryAllTrigger = false;
    this.threeDRequired = false;
    this.threeDAutoTrigger = false;
    this.disableCatButtonIfNotAvailable = false;
    this.hasSlider = false;
    this.hasTooltip = false;
    this.theme = "nemo";
    this.prefix = "nemo";
    this.multiselect = true;
    this.style = "minibar";
    this.catButtonImg = false;
    this.before = null;
    this.appendTo = null;
    
    this.clickedCategory = undefined;
    $.extend( this, options );
    
    return this;
  };
  CategoryWgt.prototype._setImgSrcPath = function( theme ) {
    theme = theme || this.theme;
    this.imgSrcPath = (function() {
      var imgSrcPath = root._serverHostUrl? root._serverHostUrl + "images" : "images"
      if( typeof theme !== 'undefined' && theme!=="nemo" ) {
        imgSrcPath += '/themes/'+theme+'/nemo';
      }else if( typeof theme !== 'undefined' && theme==="nemo" ) {
        imgSrcPath += '/nemo';
      }
      return imgSrcPath;
    })();
  };
  CategoryWgt.prototype.getImgSrcPath = function( theme ) {
    var imgSrcPath = this.imgSrcPath;
    if( theme ) {
      this._setImgSrcPath( theme );
    }
    return imgSrcPath;
  };
  CategoryWgt.prototype.init = function( options ) {
    options = options || {};
    $.extend( this, options );
    if( this.categoryWgtOptions ) {
      $.extend( this, this.categoryWgtOptions );
    }
    //set the image path
    this._setImgSrcPath();
    this._dom();
    
    if( !this.disableCatButtonIfNotAvailable ) {
      this.events();
    }
    return this;
  };
  CategoryWgt.prototype.replaceAll = function(needle, replaceWith, haystack) {
    return haystack.replace(new RegExp(needle, 'g'), replaceWith);
  };
  CategoryWgt.prototype._dom = function() {
    var domId = this.domId
    ,uiwidget = this.uiwidget
    ,theme = this.theme
    ,imgSrcPath =  this.imgSrcPath
    ,categories = this.categories
    ,before = this.before
    ,appendTo = this.appendTo
    ,style = this.style
    ,prefix = this.prefix
    ,catButtonImg = this.catButtonImg
    ,hasTooltip = this.hasTooltip
    ,nemoCategoryClass = ''
    ;

    //apart from minibar other style are broken and css styles are not ported to nemo.ui-style.css
    switch(style) {
      case "sidebar":
        nemoCategoryClass = domId+" nemo-sidebar "+theme;
        break;
      case "minibar":
        nemoCategoryClass = domId+" nemo-minibar "+theme;
        break;
      case "spritebutton":
        nemoCategoryClass = "nemo-spriteicon nemo-spriteicon-no-ie csstransforms3d exploreSlider "+theme;
        catButtonImg = true;
        break;
      default:
        nemoCategoryClass = domId+" nemo-minibar "+theme;
        break;
    }
    
    var categoryWgt = this;
    categoryWgt.domIds = {
      categoryWgtId: domId
      ,id: "nemo-category"
    };
    var _rStr = this.getRStr();
    var dom = '';
    dom +='<div id="'+categoryWgt.domIds.categoryWgtId+'" class="'+nemoCategoryClass+' noselect" style="display:none;">';
      dom +=( style==="spritebutton")?"<span><div class='nemo-explore-title'>Explore</div></span>":"";
      dom +=  '<div id="nemo-category" class="nemo-category nemo-ui-buttonset" >';
      dom +=    '<ul class="nemo-category-list">';
                 for(var i in categories.catOrder) {
                  var cat = categories.catOrder[i];
                  var bgStyle = ( style==="spritebutton"?
                                  ' style="background-image:url('+imgSrcPath+'/categories/sprite-button.png?r='+_rStr+');"' :
                                  ' style="background-image:url('+imgSrcPath+'/categories/'+i+'-button.png?r='+_rStr+'); background-repeat:no-repeat; background-color: transparent;z-index: 9999;border:none;"'
                                );
                  bgStyle = catButtonImg? bgStyle : '';
                  dom += '<li id="'+categories[cat].domId+'" title="'+categories[cat].display+'" data-value="'+categories[cat].itemId+'" class="vertical nemo-ui-buttonset-off nemo-ui-button nemo-ui-buttonset-item ' +
                            ( catButtonImg? 'has-image':'no-image' ) +
                            '" aria-disabled="false" aria-pressed="false" style="z-index:9999;">'+
                            '<a role="button" aria-disabled="false" aria-pressed="false" class="nemo-ui-button-label nemo-ui-widget category-'+i+' '+( catButtonImg? 'has-image':'no-image' )+'" '+bgStyle+'>'+
                              '<span class="nemo-ui-button-text noselect">'+categories[cat].display+'</span>'+
                            '</a>';
                            if( hasTooltip ) {
                                dom+='<div class="nemo-category-tooltip"><b class="first"></b><div class="nemo-ui-button-text">'+categories[cat].display+'</div></div>';
                            }
                  dom += '</li>';
                 }
          dom +='</ul>'+
              '</div>'+
          '</div>';
    if( appendTo ) {
      $(dom).appendTo( "#"+appendTo );
    }else if( before ) {
      $(dom).insertBefore(before);
    }else {
      if( $('#vidteq-wrapper').length > 0 ) {
        $(dom).appendTo("#vidteq-wrapper"); 
      }else {
        $(dom).appendTo("body");  
      }
    }
    
    typeof(catButtonImg)!=="undefined" && catButtonImg?
      $(".nemo-ui-buttonset label span.ui-button-text").css({"visibility": "hidden"}):'';

    this.dom = dom;
    return this;
  };
  CategoryWgt.prototype.sliderInit = function() {
    var categoryWgt = this;

    this.slyThumbSliderInit(0);
    
    this.toolTipInit();
    
    $('.nemo-ui-button-label').each(function(e) {
      $(this).closest('li').each(function() {         
        if($(this).hasClass('nemo-ui-buttonset-on')) {
          var myIdx = $(this).index();
          if (categoryWgt.sly) { 
            categoryWgt.sly.activate(myIdx); 
            $('ul').find('li.nemo-ui-buttonset-on').each(function(){ 
              $(this).find('.nemo-category-tooltip').show();
            });
          }
        }
      });
    });
    
  };
  CategoryWgt.prototype.toolTipInit = function() {
    $('.nemo-ui-button-label').mousemove(function(e) {
      $(this).closest('li').find('.nemo-category-tooltip').show();
    });
    $('.nemo-ui-button-label').mouseout(function(e) {
      $('.nemo-category-tooltip').hide();
    });
  };
  CategoryWgt.prototype.slyThumbSliderInit = function(idx) {
    var el_categoryWgt = $("#"+this.domIds.categoryWgtId);
    el_categoryWgt.addClass('js csstransforms preserve3d');
    var $frame = el_categoryWgt.find('.nemo-ui-buttonset');
    if(typeof(Sly) != 'undefined') {
      this.sly = new Sly($frame, {
        //horizontal: 1,
        vertical:1,
        itemNav: 'centered',//'centered',//'basic',//'forceCentered',
        activateMiddle: 1,
        smart: 1,
        activateOn: 'mouseenter',
        mouseDragging: 1,
        touchDragging: 1,
        releaseSwing: 1,
        startAt: idx,
        scrollBar: el_categoryWgt.find('.scrollbar'),
        scrollBy: 1,
        pagesBar: el_categoryWgt.find('.pages'),
        activatePageOn: 'click',
        speed: 2200,
        moveBy: 600,
        elasticBounds: 1,
        dragHandle: 1,
        dynamicHandle: 1,
        clickBar: 1,
        minHandleSize: 50
      }).init();
    }
  };
  CategoryWgt.prototype.updateCat = function(elm) {
    $(elm).parent().buttonset("refresh");
  };
  CategoryWgt.prototype.catClick = function( cat, cfg, firstClickOnGallery, dataValue ) {
    var categories = this.categories
    ,prefix = categories.prefix;
     
    if( typeof(firstClickOnGallery)!=="undefined" && firstClickOnGallery ) {
      var el = document.getElementById(prefix+"-"+cat);
      if( typeof(dataValue)!=="undefined" ) {
        $(el).trigger('click',[firstClickOnGallery,dataValue]);
      }else {
        $(el).trigger('click',[firstClickOnGallery]);
      }
      return true;  
    }
  };
  CategoryWgt.prototype.triggerCategoryClick = function( cat ) {
    var categories = this.categories
    ,prefix = categories.prefix;
    
    var el = document.getElementById(prefix+"-"+cat);
    $(el).trigger('click');
  };
  CategoryWgt.prototype.on = function( el, cat, firstClickOnGallery, dataValue ) {
    var categories = this.categories
    ,catOrder = categories.catOrder
    ,multiselect = this.multiselect
    ,uiwidget = this.uiwidget
    ,as = this.manner;
    
    if( !multiselect ) {
      for( var i=0;i<catOrder.length;i++ ) {
        (function(i,categoryWgt) {
          var c = catOrder[i];
          if( categories[ c ].selected ) {
            categoryWgt.triggerCategoryClick( c );
          }
        })(i,this);
      }
    }
    el.attr('aria-pressed',"true");
    el.removeClass('nemo-ui-buttonset-off').addClass('nemo-ui-buttonset-on');
    el.find('a').removeClass('nemo-ui-button-off').addClass('nemo-ui-button-on');
    el.find('a').attr('aria-pressed',"true");
    //$(".loader").show();
    //uiwidget.utils.drapeSheer("routeRequest");
    categories.on({
       parent: cat
       ,dataValue: dataValue
    });
    if( this.legendRequired ) {
      uiwidget[ as ].legendWgt.on({
         parent: cat
      });
    }
    if( this.categoryListGalleryRequired ) {
      uiwidget[ as ].lgcWgt.on({
         parent: cat
      });
    }
  };
  CategoryWgt.prototype.off = function( el, cat ) {
    var categories = this.categories
    ,uiwidget = this.uiwidget
    ,as = this.manner;
    
    el.attr('aria-pressed',"false");
    el.removeClass('nemo-ui-buttonset-on').addClass('nemo-ui-buttonset-off');
    el.find('a').removeClass('nemo-ui-button-on').addClass('nemo-ui-button-off');
    el.find('a').attr('aria-pressed',"false");
    
    categories.off({
       parent: cat
    });
    if( this.legendRequired && uiwidget[ as ].legendWgt ) {
      uiwidget[ as ].legendWgt.off({
         parent: cat
         ,complete: true
      });
    }
    if( this.categoryListGalleryRequired && uiwidget[ as ].lgcWgt ) {
      uiwidget[ as ].lgcWgt.off({
         parent: cat
         ,complete: true
      });
    }
  };
  CategoryWgt.prototype.events = function() {
    var categoryWgt = this
    ,_events = {
      click:function( el ) {
        $(el).click(function( e, firstClickOnGallery, dataValue ) {
            e.preventDefault();
            //var cat = $(this).get(0).id.split(/-/)[1];
            var cat = $(this).attr('data-value');
            //var isDisabled = $(this).attr('aria-disabled');
            var isOn = $(this).attr('aria-pressed');
            var isLoading = $(this).attr('data-loading');
            
            if( isOn === "false" ) {
              categoryWgt.on( $(this), cat, firstClickOnGallery, dataValue );
            }else {
              categoryWgt.off( $(this), cat );
            }
        });
      }
    };
    
    var domIds = this.domIds
    var el = $("#"+domIds.id).find(".nemo-ui-button");
    $.each( el, function(i) {
      _events['click']( this );
    });
    
    //TBD: nemo-ui-menu
    //$("#"+this.domIds.categoryWgtId+' .nemo-ui-menu').mouseleave
    /*$("#"+domIds.categoryWgtId+' .nemo-ui-menu').click(function(e) {
      if( $(this).is(':visible') ) {
        var el = $("#"+domIds.id);
        var isVisible = el.is(':visible');
        if( isVisible ) {
          el.fadeOut('slow');
        }else {
          el.fadeIn('slow');
        }
      }
    });*/
  };
  CategoryWgt.prototype.autoClick = function(clickedCategoryObj) {
    var categoryList = clickedCategoryObj.categoryList
    ,catItemId = clickedCategoryObj.catItemId
    ,dataValue = clickedCategoryObj.dataValue
    ,firstClickOnGallery = true
    ,categories = this.categories;
    
    var cat = '';
    //c = categories.catCodes[categoryList];
    //c = categories.catItemId[catItemId];
    var toSearchCatCodes = categoryList.split(/\s*,\s*/);
    for( var ids in categories.catCodes ) {
      var found = -1;
      for( var i=0;i<toSearchCatCodes.length;i++ ) {
        found = ids.search( toSearchCatCodes[i] );
        if(found!==-1) {
          break;
        }
      }
      if(found!==-1) {
        cat = categories.catCodes[ids];
        break;
      }
    }
    //get category name from the category ID
    //TDB: bug: autoclick not working properly: category needs to be clicked twice
     this.catClick(cat,this,firstClickOnGallery,dataValue);
  };
  CategoryWgt.prototype.destroy = function() {
    //TBD:
  };
  CategoryWgt.prototype.hide = function() {
    $("#"+this.domId).hide();
  };
  CategoryWgt.prototype.show = function() {
    $("#"+this.domId).show();
  };
  CategoryWgt.prototype.invoke = function() {
    this.show();
    
    if( this.clickedCategory ) {
      //auto-click
      this.autoClick(this.clickedCategory);
    }else if( this.categoryAutoTrigger && !this.disableCatButtonIfNotAvailable ) {
      if( this.categoryAllTrigger ) {
        this.categories.triggerAllCat(); 
      }else {
        this.categories.triggerRandomCat();
      }
    }
    if( this.hasSlider ) {
      this.sliderInit();
    }
  };
  CategoryWgt.prototype.getRStr = function() {
    return root._rStr || Math.floor(Math.random() * 999);
  };
  CategoryWgt.prototype.getDomId = function() {
    //return this.domIds.categoryWgtId;
    return this.domIds.id;
  };
  root.CategoryWgt = CategoryWgt;
}(this, document, 'vidteq'));
