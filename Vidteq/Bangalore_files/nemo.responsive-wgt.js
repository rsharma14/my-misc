/**
 * @summary     ResponsiveWgt
 * @description It provides jquery based Buttons.
 *              - Styled using nemo.ui-styles.css (responsive)
 * @version     1.0.0
 * @file        nemo.responsive-wgt.js
 * @author      Bhaskar Mangal ( bhaskar@vidteq.com )
 * @contact     www.vidteq.com
 *
 * @copyright Copyright 2015 www.vidteq.com, all rights reserved.
 */
(function( global,document, root ) {
  root = global[root] = ( global[root]? global[root] : {} );
  
  function ResponsiveWgt( options ) {
    options = options || {};
    var _opt = {
      prefix:'nemo-'
      ,domIds:{
        topbar:"nemo-rwgt-tb"
        ,dropdown:"nemo-rwgt-dd"
      }
      ,wgtClass:''
      ,buttons:[{
        display:"Menu"
        ,tile:"Menu"
        ,backgroundImg:false
      }]
      ,btnIndex:[]
      ,btnID:{}
    };
    $.extend( _opt, options );
    $.extend( this, _opt );
    this._init();
    return this;
  };
  ResponsiveWgt.prototype._init = function() {
    var _dom = this._dom();
    $('body').append(_dom.topbar);
    $('body').append(_dom.dropdown);
    
    this.topbar = new root.ButtonWgt({
       domId: this.domIds.topbar
      ,buttons:[{"display":"Menu"}]
      ,buttonsImage:false
      ,hiddenOnCreate:false
      ,toggle:false
      ,appendTo:"vidteq-wrapper"
      ,wgtClass:'nemo-ui-responsive nemo-ui-responsive-topbar right'
      ,themeclass:' '
      ,o:this
      ,callback:{
        onWindowResize:function( buttonWgt, config ) {
          /*console.log("responsive topbar:onWindowResize: resized");
          var isVisible = buttonWgt.el.is(':visible');
          if( isVisible ) {
            console.log("responsive topbar: onWindowResize: Visible");
          }else {
            console.log("responsive topbar: onWindowResize: Hidden");
          }*/
        }
        ,onclick:function( buttonWgt, fIndex, dValue, config ) {
          //console.log("responsive topbar: clicked");
          //config.o.dropdown.unselectAll();
          config.o.dropdown._toggle();
        }
      }
    });
    this.dropdown = new root.ButtonWgt({
       domId: this.domIds.dropdown //"rwgt-dd"
      //,buttons:[{"display":"Distance"},{"display":"Amenities"}]
      ,buttonsImage:false
      ,hiddenOnCreate:false
      ,toggle:false
      ,atLeastOneIsOn:false
      ,appendTo:"vidteq-wrapper"
      //,wgtClass:'nemo-ui-responsive nemo-ui-responsive-dropdown right nemo-ui-dropdown vertical'
      ,wgtClass:'nemo-ui-responsive nemo-ui-responsive-dropdown right nemo-ui-dropdown'
      ,themeclass:' '
      ,o:this
      ,callback:{
        onclick:function( buttonWgt, fIndex, dValue, config, el ) {
          //console.log("responsive dropdown: clicked");
          var itemId = $(el).attr('data-itemid');
          var el_item = $("#"+itemId);
          if( el_item.is(":visible") ) {
            el_item.hide();
          }else {
            el_item.show();
          }
        }
      }
    });
  };
  ResponsiveWgt.prototype._dom = function() {
    var domIds = this.domIds
    ,buttons = this.buttons
    ,wgtClass = this.wgtClass
    ,i,length
    ,_dom = {
      topbar:null
      ,dropdown:null
    };
    //topbar
    _dom.topbar = '<div id="'+domIds.topbar+'" class="nemo-ui-responsive nemo-ui-responsive-topbar '+wgtClass+'">'+
                    '<div class="nemo-ui-topbar"></div>'+
                  '</div>';
    return _dom;
  };
  ResponsiveWgt.prototype.addDropDownItem = function( i ) {
    var id = this.domIds.dropdown+'-'+i
    ,_dom = '<div id="'+id+'" data-index="'+i+'" class="nemo-ui-responsive nemo-ui-responsive-dropdown right vertical nemo-ui-dropdown nemo-ui-dropdown-'+i+'"></div>';
    return _dom;
  };
  
  ResponsiveWgt.prototype.addToMenu = function( options ) {
    this.dropdown.addButton([options]);
  };
  root.ResponsiveWgt = ResponsiveWgt;
}(this, document, 'vidteq'));