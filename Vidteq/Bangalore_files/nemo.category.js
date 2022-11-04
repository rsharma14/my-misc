/**
 * @summary     Category
 * @description It provides functionality/methods to "CategoryFactory" object.
                It depends on:-
                - nemo.category-factory.js
 * @version     2.0.0
 * @file        nemo.category.js
 * @author      Bhaskar Mangal ( bhaskar@vidteq.com )
 * @contact     www.vidteq.com
 *
 * @copyright Copyright 2013-2015 www.vidteq.com, all rights reserved.
 */
(function( global,document, root ) {
  root = global[root] = ( global[root]? global[root] : {} );
  
  function Category(options,as,widget) {
    if( $.ui ) {
      $.widget( "custom.catComplete", $.ui.autocomplete, {
        _renderMenu: function( ul, items ) {
          var that = this
          ,currentCategory = "";
          
          $.each( items, function( index, item ) {
            if ( item.category != currentCategory ) {
              ul.append( "<li class='ui-autocomplete-category'>" + item.category + "</li>" );
              currentCategory = item.category;
            }
            that._renderItemData( ul, item );
          });
        }
      });
    }
  
    return this.init(options,as,widget);
  };
  /**
   * 1. Only one instance of category should be created and rest shares the references
   *    that ensures that category object can be updated across modules/files/UI-events easily.
   * 2. If anyone/file/module desires to create properties for category instance, it must provide
   *    the intention to do so by providing default value here:-
   *    - number as 0
   *    - string as null
   *    - object as undefined
   *    - array as []
   *    Note:
   *    - Under exceptional condition only other data-types apart from objects can be initialized as undefined.
   *  3. Any more configuration objects can be passed through options at the time of initialization
   *  4. Use camel casing naming convention
   *  5. Group the properties under comment tags and mention the purpose/intention
   *  6. Use descriptive name as much as possible
   *  7. Mention the usage/purpose of each property as comment 
   */
  //--- prototype --- //
  Category.prototype = {
    init: function(options,as,widget) {
      //required by priority widget
      var ptype = options.ptype
      //required by priority widget
      ,index = options.index
      //categories instance of vidteq.CategoryFactory referred as factory
      ,categories = options.categoryFactory
      ,geolocations = options.locationFactory
      //reference to the creator, so that can call functions of the creator
      ,uiwidget = options.uiwidget
      ,imgPath = uiwidget._serverHostUrl? uiwidget._serverHostUrl + "images" : "images"
      ,evaluator = options.evaluator
      //,nemoTemplate = options.nemoTemplate
      ,graphOptions = ( widget || {} ).graph
      ,_googleAnalytics = function(cat) {
        //CASE: Only when making the server call - google analytics stamping on category click
        if( typeof pageTracker !== 'undefined' ) {
          try {
            var pageStamp = 'locate_'+vidteq.aD.account+'_'+cat;
            //console.log("ga: ");console.log(pageStamp);
            pageTracker._trackPageview("/"+pageStamp);
          }catch(err){};
        }else {
          if( typeof vidteq._top !== 'undefined' ) {
            var what = vidteq._top.get('vidteq');              
            if( typeof what !== 'undefined' ) {                
              if( typeof what[as] !== 'undefined' && typeof what[as].meter !== 'undefined' ) {
                var meterIframe = vidteq._top.getElementById( what[as].meter )
                ,config = what.config
                ,hostUrl = config.hostUrl
                ,urlid = config.urlid
                ,city = config.city
                ,meterSrc =  hostUrl+'meter?city='+city+'&urlid='+urlid+'&manner='+as
                ;
                meterIframe.setAttribute('src',meterSrc);
              }                
            }
          }
        }//end of else
      }
      ;
      
      //categories.uiOptions = uiwidget.nemoOptions.uiOptions;
      //Ideally it's reference of nemo widget or can be anyone who's the owner of category instance
      categories.uiwidget = uiwidget;
      //Interaction with map is done through evaluator
      categories.evaluator = evaluator;
      //categories.nemoTemplate = nemoTemplate;
      categories.geolocations = geolocations;
      //custom priority defines aggregated priorities based on user profile 
      categories.ptype = ( typeof(type)!=="undefined"? ptype : "custom" );
      //custom priority has only one band hence index as 1
      categories.groupId = ( typeof(index)!=="undefined"? index+1 : 1 );
      categories.widget = {
        statsTable: {
          statsDomAppendTo: "div#nemo-layout-center-south"
          ,tableid: "pstats"
          ,statsAddClass: "nemo-statstable-container"
          ,imgPath: uiwidget._serverHostUrl? uiwidget._serverHostUrl + "images/raty" : "images/raty"
          ,id: "pr-pstats-container"
          ,_dom:function() {
            var statsDomContainer = $('<div id="pr-'+this.tableid+'-container" class="pr-statstable-container hidegroup '+this.statsAddClass+'">'+
              '</div>').appendTo(this.statsDomAppendTo);
            var stable = '<table cellpadding="0" cellspacing="0" border="0" class="display" id="'+this.tableid+'">'+
              '<thead>'+
                '<tr>'+
                  //'<th width="5%">Importance</th>'+
                  '<th>Amenities</th>'+
                  '<th>Time to Walk (min)</th>'+
                  '<th>Total</th>'+
                  '<th>What it includes?</th>'+
                  '<th>Goodness</th>'+
                  /*'<th width="10%">Min. Distance (Km)</th>'+
                  '<th width="10%">Max. Distance (Km)</th>'+
                  '<th width="10%">Avg. Distance (Km)</th>'+*/
                  //'<th width="10%">Proximity Score (pS)</th>'+
                  //'<th width="10%">normal-pS</th>'+
                  //'<th width="10%">Nearness Score (nS)</th>'+
                  //'<th width="10%">normal-nS</th>'+
                  //'<th width="10%">Availability Score (aS)</th>'+
                  //'<th width="10%">normal-aS</th>'+
                  //'<th width="10%">Effectiveness Score (eS)</th>'+
                  //'<th width="10%">normal-eS</th>'+
                  //'<th width="10%">Usability Score (uS)</th>'+
                  //'<th width="10%">normal-uS</th>'+
                '</tr>'+
              '</thead>'+
              '<tbody>'+
              '</tbody>'+
              '<!--tfoot>'+
                '<tr>'+
                  //'<th>Importance</th>'+
                  '<th>Amenities</th>'+
                  '<th>Time to Walk (min)</th>'+
                  '<th>Total</th>'+
                  '<th>What it includes?</th>'+
                  '<th>Amenities Score</th>'+
                  /*'<th>Min. Distance</th>'+
                  '<th>Max. Distance</th>'+
                  '<th>Avg. Distance</th>'+*/
                  //'<th>Proximity Score (pS)</th>'+
                  //'<th>normal-pS</th>'+
                  //'<th>Nearness Score (nS)</th>'+
                  //'<th>normal-nS</th>'+
                  //'<th>Availability Score (aS)</th>'+
                  //'<th>normal-aS</th>'+
                  //'<th>Effectiveness Score (eS)</th>'+
                  //'<th>normal-eS</th>'+
                  //'<th>Usability Score (uS)</th>'+
                  //'<th>normal-uS</th>'+
                '</tr>'+
              '</tfoot-->'+
            '</table>';
            return $(stable).appendTo(statsDomContainer);
          }
          ,_sTable: function(stats) {
            this.dom = this._dom();
            this.sTable = $('#'+this.tableid).dataTable({
               "bDestroy": true
              ,"bProcessing": true
              ,"bPaginate": false
              ,"bFilter": false
              ,"bInfo": false
              ,"bSortClasses": false
              ,"bSort": false
              //,"aaSorting": []
              ,"aaData": stats
              ,"asStripeClasses": (function stripeclass() {
                  var rowClasses = [];
                  //console.log("asStripeClasses: stats");console.log(stats);
                  for(var i=0;i<stats.length;i++) {
                    if(i%2===0) {
                      rowClasses.push(stats[i].catName+' stats-even');
                    }else {
                      rowClasses.push(stats[i].catName+' stats-odd');
                    }
                  }
                  return rowClasses;
                })()
              ,"aoColumns": [
                 /*{ "mData": "priority"
                   ,"sClass": "stats-priority"
                 }*/
                { "mData": "display"
                   ,"sClass": "stats-display"
                 }
                 ,{ "mData": "timeRange"
                   ,"sClass": "stats-timeRange"
                 }
                ,{ "mData": "total"
                   ,"sClass": "stats-total"
                 }
                ,{ "mData": "subCatName"
                   ,"sClass": "stats-subCatName"
                 }
                 ,{ "mData": "catScore"
                   ,"sClass": "stats-catScore"
                 }
                /*,{ "mData": "mindist"
                   ,"sClass": "stats-mindist"
                 }
                ,{ "mData": "maxdist"
                   ,"sClass": "stats-maxdist"
                 }
                ,{ "mData": "avgdist"
                   ,"sClass": "stats-avgdist"
                 }*/
                /*,{ "mData": "pS"
                   ,"sClass": "stats-pS"
                 }
                ,{ "mData": "normalpS"
                   ,"sClass": "stats-normalpS"
                 }
                ,{ "mData": "nS"
                   ,"sClass": "stats-nS"
                 }
                ,{ "mData": "normalnS"
                   ,"sClass": "stats-normalnS"
                 }
                ,{ "mData": "aS"
                   ,"sClass": "stats-aS"
                 }
                ,{ "mData": "normalaS"
                   ,"sClass": "stats-normalaS"
                 }
                ,{ "mData": "eS"
                   ,"sClass": "stats-eS"
                 }
                ,{ "mData": "normaleS"
                   ,"sClass": "stats-normaleS"
                 }
                ,{ "mData": "uS"
                   ,"sClass": "stats-uS"
                 }
                ,{ "mData": "normaluS"
                   ,"sClass": "stats-normaluS"
                 }*/
              ]
              ,"aoColumnDefs": [
                { "aTargets": [ 3 ]
                  ,"mData": "catScore"
                  ,"mRender": function ( data, type, full ) {
                      //console.log("mRender");console.log(data);
                      var subCatName = data.substr(1,data.length-2);
                      return subCatName;
                    }
                }
                ,{ "aTargets": [ 4 ]
                  ,"mData": "catScore"
                  ,"mRender": function ( data, type, full ) {
                      //console.log("mRender");console.log(data);
                      var statsCatRating = '<div data-score="'+data+'" class="stats-catScore-rating"><div>';
                      return statsCatRating;
                    }
                }
                /*,{ "aTargets": [ 5 ]
                  ,"mData": "mindist"
                  ,"mRender": function ( data, type, full ) {
                      return parseFloat(parseInt(data)/1000).toFixed(1);
                    }
                }
                ,{ "aTargets": [ 6 ]
                  ,"mData": "maxdist"
                  ,"mRender": function ( data, type, full ) {
                      return parseFloat(parseInt(data)/1000).toFixed(1);
                    }
                }
                ,{ "aTargets": [ 7 ]
                  ,"mData": "avgdist"
                  ,"mRender": function ( data, type, full ) {
                      return parseFloat(parseInt(data)/1000).toFixed(1);
                    }
                }*/
              ]
            });
            
            
            return this;
          }
          ,setStar:function() {
            var that = this;
            //console.log("cat score rating: ");console.log(this.tableid);console.log( $("#"+this.tableid+" .stats-catScore-rating"));
            $("#"+this.tableid+" .stats-catScore-rating").each(function( index ) {
              $(this).attr('id','stats-catScore-rating-'+index);
              //scale down the score on the scale of 0 to 5 from scale of 0 to 100
              var catScore = parseFloat( (parseInt( $(this).attr('data-score') )/20 ).toFixed(1) ) ;
              that.updateStar(catScore,index);
            });
          }
          ,updateStar:function(catScore,index) {
            $('#stats-catScore-rating-'+index).raty({
              readOnly: true
              ,hints: ['Below Average', 'Average', 'Good', 'Excellent', 'Superior']
              ,noRatedMsg: "No Star"
              ,score: catScore
              ,path: this.imgPath
            });
          }
          ,updateStatsTab:function(options) {
            //console.log("this.statsTable.updateStatsTab: ");console.log(this);
            /*this.options
              = options
              = (typeof(options)!=="undefined" && typeof(options)==="object")? options : {};*/
              
            var catId = options.catId
            ,categories = this.categories;
            
            //update table
            if( typeof(this.sTable)!=="undefined" && typeof(categories.stats)!=="undefined"  && typeof(catId)!=="undefined" ) {
              for(var i=0;i<categories.stats.length;i++) {
                var stats = categories.stats[i];
                if( stats.catName===catId && categories.isCategory(stats.catName) ) {
                    //var catScore = stats.catScore;//parseFloat( (parseInt( $('#stats-catScore-rating-'+i).attr('data-score') )/20 ).toFixed(1) );
                    this.sTable.fnUpdate(stats.priority,i,0);
                    
                    //var oSettings = this.sTable.mTable.fnSettings();
                    this.sTable.fnSettings().aoColumns[2].mRender()

                    this.updateStar(catScore,i);
                    this.sTable.fnUpdate(stats.catScore,i,2);
                    //this.sTable.fnUpdate(stats.normaluS,i,0);
                    //this.sTable.fnUpdate(stats.uS,i,0);
                }
              }
            }else if( typeof(this.sTable)!=="undefined" && typeof(categories.stats)!=="undefined" ) {
                for( var cat in categories ) {
                  if( categories.hasOwnProperty(cat) && typeof(categories[cat]) === "object" && categories.isCategory(cat) ) {                  
                      for(var i=0;i<categories.stats.length;i++) {
                        if(categories.stats[i].catName===cat) {
                          var catScore = parseFloat( (parseInt( $('#stats-catScore-rating-'+i).attr('data-score') )/20 ).toFixed(1) );
                          this.sTable.fnUpdate(categories.stats[i],i);
                          this.updateStar(catScore,i);
                        }
                      }
                  }
                }
              //this.sTable.fnSort( [ [0,'desc'], [2,'asc'], [5,'desc'], [3,'asc'] ] );
              //console.log("this.statsTable: this.statsTable.sTable");console.log(this.sTable);
            }
          }//end of updateStatsTab
          ,create:function( stats ) {
            var statsTable = this._sTable( stats );
            var sTable = statsTable.sTable;
            this.setStar();
            $("#"+this.id).removeClass("hidegroup");
          }
          ,init:function(options) {
            options = options || {};
            $.extend( this, options );
            return this;
          }
        }
        ,graph: {
          _dom:function(options) {
            var gOptions = options.graph
            ,domId = gOptions.domId
            ,graphId = gOptions.graphId
            ,appendTo = gOptions.appendTo;
            //class="raphael" id="g.raphael.dmitry.baranovskiy.com"
            var dom = '<div id="'+domId+'" class="raphael nemo-graph canselect'+graphId+'"></div>';
            
            $(dom).appendTo(appendTo);
            //TBD:for manner evaluate
            /*var el = document.getElementById(appendTo);
            $(el).prepend(dom);*/
            
            return this;
          }
          ,_crunch:function(options) {
            var allStats = options.allStats
            ,stats = allStats.stats
            ,totalOfAllCategories = allStats.totalOfAllCategories
            ,gOptions = options.graph
            ,dPoint = gOptions.dPoint
            ,data = []
            ,legend = [];
            //["%%.%% - Schools", "%%.%% - Colleges","%%.%% - Hospitals","%%.%% - Transport Facilities","%%.%% - Banks"]
            
            for(var i=0;i<stats.length;i++) {
              if( stats[i].hasOwnProperty([dPoint]) ) {
                data.push( parseFloat(stats[i][dPoint]) );
                legend.push( ( stats[i].display || stats[i].category )+ " - %%%" );
              }else {
                data.push(0);
              }
            }
                    
            return {
              data: data
              ,legend: legend
            };
          }
          ,_pie:function(options) {
            var dataAndLegend = this._crunch(options);
            if(!dataAndLegend) { return false; }
            
            var data = dataAndLegend.data
            ,legend = dataAndLegend.legend
            ,allStats = options.allStats
            //,totalOfAllCategories = allStats.totalOfAllCategories
            ,gOptions = options.graph
            ,prefix = gOptions.prefix
            ,graphId = gOptions.graphId
            ,domId = gOptions.domId
            ,stats = gOptions.stats
            ,link = gOptions.link
            ,wait = gOptions.wait
            ,title = gOptions.title
            ,dPoint = gOptions.dPoint
            ,legendpos = gOptions.legendpos
            ,x = gOptions.x
            ,y = gOptions.y
            ,cSize = gOptions.cSize
            ,font = gOptions.font
            ,cX = gOptions.cX
            ,cY = gOptions.cY
            ;
            
            function renderPieGraph() {
              var el = $("#"+domId);
              if( el.length < 1  && !el.is(":visible") ) {
                return false;
              }
              if( cX && cY ) {
                var r = Raphael(domId,cX,cY);
              }else {
                var r = Raphael(domId);
              }
              
              var pie = r.piechart(
                //x,y,circle-size
                x, y, cSize
                ,data
                ,{
                  legend : legend
                  ,legendpos : legendpos
                  ,href : link
                 }
              );
              if( font ) {
                pie.attr("font",font);  
              }

              if( title ) {
                var tX = title.x || 120
                ,tY = title.y || 52
                ,tText = title.text
                ,tStroke = title.stroke || "#000000"
                ,tFont = title.font || "15px sans-serif"
                ,textAnchor = title.textAnchor || "middle"
                ;
                //x,y
                r.text(tX, tY, tText).attr({
                  font : tFont
                  ,stroke: tStroke
                  ,"text-anchor": textAnchor
                });
              }
              
              pie.hover(function() {
                this.sector.stop();
                this.sector.scale(1.1, 1.1, this.cx, this.cy);
            
                if (this.label) {
                  this.label[0].stop();
                  this.label[0].attr({
                    r : 6.5
                  });
                  this.label[1].attr({
                    "font-weight" : 800
                  });
                }
              }, function() {
                this.sector.animate({
                  transform : 's1 1 ' + this.cx + ' ' + this.cy
                }, 500, "bounce");
            
                if (this.label) {
                  this.label[0].animate({
                    r : 5
                  }, 500, "bounce");
                  this.label[1].attr({
                    "font-weight" : 400
                  });
                }
              });
            }
            var drawTimeOut = setTimeout(function() {
              renderPieGraph();
            },wait);
            
            return this;
          }
          ,init:function(options) {
            var allStats = options.allStats
            
            ,stats = allStats.stats
            
            ,gOptions
              = options.graph
              = options.graph || {}
              
            ,type
              = gOptions.type
              = gOptions.type || "pie"
              
            ,graphId
              = gOptions.graphId
              = gOptions.graphId || graphOptions.graphId
              
            ,appendTo
              = gOptions.appendTo
              = gOptions.appendTo || ( graphOptions.appendTo || widgetOptions.appendTo ) || "body"
            
            ,link
              = gOptions.link 
              = gOptions.link || graphOptions.link || ["http://www.vidteq.com"]
            
            ,legendpos
              = gOptions.legendpos
              = gOptions.legendpos || "east"
            
            ,x
              = gOptions.x
              = typeof( gOptions.x )!=="undefined"? gOptions.x : 80
              
            ,y
              = gOptions.y
              = typeof( gOptions.y )!=="undefined"? gOptions.y : 70
              
            ,cSize
              = gOptions.cSize
              = typeof( gOptions.cSize )!=="undefined"? gOptions.cSize : 63
              
            ,cX = gOptions.cX 
              
            ,cY = gOptions.cY
              
            ,dPoint 
              = gOptions.dPoint
              = gOptions.dPoint || "total"
              
            ,font
              = gOptions.font 
              = gOptions.font || "10px Arial, sans-serif"
              
            ,title = gOptions.title
            
            ,wait
              = gOptions.wait
              = typeof( gOptions.wait )!=="undefined"? gOptions.wait : 1
              
            ,firstTime
              = gOptions.firstTime
              = typeof( gOptions.firstTime )!=="undefined"? gOptions.firstTime : true
              
            ,prefix
              = gOptions.prefix 
              = gOptions.prefix || graphOptions.prefix || "nemo-graph"
              
            ,domId
              = gOptions.domId 
              = gOptions.domId || ( prefix + "-" + graphId)
            ;
            
            if( title ) {
               gOptions.title = {
                text: title.text + (title.attr1? allStats[ title.attr1 ] : '')
                ,x: title.x
                ,y: title.y
                ,font: title.font
                ,stroke: title.stroke
                ,textAnchor: title.textAnchor
              }
            }
            
            if( firstTime ) {
              if(self.navigator.userAgent.match(/MSIE\s[7,8]/)) {
                wait = 1000;
              }
            }
            
            if( type==="pie" ) {
              this._dom(options);
              this._pie(options);
            }
            
            return this;
          }
        }
        ,radiusWgt: undefined
        ,threeDWgt: undefined
      };
      
      //-- function definitions
      var fn = {
        parent:function(subCat) {
          for(var cat in this.validCategories) {
            for(var c in this.validCategories[cat]) {
              if(c===subCat) {
                return cat;
              }
            }
          }
        }
        ,isCategory:function(cat) {
          if( this.hasOwnProperty(cat) && typeof(this[cat]) === "object" && this[cat]!==null
              && typeof(this[cat].isCategory)!== "undefined" && this[cat].isCategory ) {
            return true;
          }else {
            return false
          }
        }
        ,isSubCategory:function(cat,subCat) {
          if( cat.hasOwnProperty(subCat) && typeof(cat[subCat]) === "object" && cat[subCat]!==null
              && typeof(cat.isCategory)!== "undefined" && cat.isCategory 
              && typeof(cat[subCat].isSubCategory)!=="undefined" && cat[subCat].isSubCategory ) {
            return true;
          }else {
            return false
          }
        }
        ,getTimeRange:function(convert) {
          var  divisor = 1
          ,unit = convert.unit
          ;
          
          switch(unit) {
            case "km":
              divisor = 1;
              break;
            case "mt":
              divisor = 1000;
              break;
            default:
              divisor = 1;
              break;
          }
          
          var how = convert.how
          ,minDist = convert.minDist
          ,maxDist = convert.maxDist
          ,timeToReach = ''
          ,minD = parseFloat((parseInt(minDist)/divisor))
          ,maxD = parseFloat((parseInt(maxDist)/divisor))
          ,speed = this.speed[how]
          ;
          
          if(minDist!==maxDist) {
            timeToReach = (function(minD,maxD,speed) {
              var minT = parseFloat(minD*speed).toFixed(0)
              ,maxT = parseFloat(maxD*speed).toFixed(0)
              ;
              
              var T = ( minT <2 ? "< 2" : minT ) + " - " + maxT + " min";
              return T;
            }(minD,maxD,speed));
          }else {
            timeToReach = (function(minD,speed) {
              var minT = parseFloat(minD*speed).toFixed(0)
              ;
              var T = ( minT <2 ? "< 2" : minT ) + " min";
              return T;              
            }(minD,speed));
          }
          
          return timeToReach;
        }
        ,list:function() {
          var list = [];
          for( var cat in this ) {
            if( this.hasOwnProperty(cat) && typeof(this[cat]) === "object" && 
            categories.isCategory(cat) ) {
              //valid category
              list.push(cat);
            }
          }
          return list;
        }
        ,listName:function() {
          var listName = [];
          for( var cat in this ) {
            if(this.hasOwnProperty(cat) && typeof(this[cat]) === "object") { 
              listName.push(this[cat].display);
            }
          }
          return listName;
        }
        ,on:function(options) {
          options = options || {};
          var cat = options.parent
          ,toggle = options.toggle
          ,dataValue = options.dataValue;
          
          /*if( typeof toggle !== "undefined" && !toggle ) {
            categories.off({toggle:toggle});
          }*/

          if( cat && this[cat] && this[cat].isCategory ) {
            if(!categories.clicked) {
              //to check if categories are ever clicked in its lifetime. If its first time set to true.
              this.clicked = true;
            }
            //mark this category as selected, shown in panel and shown on map
            this[cat].selected = true;
            this[cat].isShownInPanel = true;
            this[cat].isShownOnMap = true;
            //this tells us which category is currently active or opened
            this.current = cat;
            
            if(typeof(this[cat].data)!=="undefined") {
              //TBD: option to redraw categories on map when all of them were turned-on again
              //var radiusWgt = this.widget.radiusWgt;
              if( this.evaluator ) {
                this.evaluator.showCategory(this[cat]);
              }
              //case-1: has 3D Neighbourhood and IS active
              //case-2: has 3D Neighbourhood and IS active and IS Ready
              //case-3: has 3D Neighbourhood and IS active and NOT Ready
              //case-4: has 3D Neighbourhood and NOT active
              
              var onAfterInit3js = false
              ,threeDWgt = this.widget.threeDWgt;
              
              if( threeDWgt && threeDWgt.selected ) {
                var el_threeDWgt = $("#"+threeDWgt.selected);
                if( el_threeDWgt.length && el_threeDWgt.attr('aria-pressed') === 'true' ) {
                  //case-1:
                  if( threeDWgt.config.ready ) {
                    //case-2:
                    threeDWgt.config.setPoi.call( uiwidget[ this.manner ].venue3DExplore.venue360,{
                      //threeConfig:threeDWgt.config
                      category:this[ cat ]
                      ,distanceCutOff:uiwidget[ this.manner ].explorationArea.distance
                    });
                  }else {
                    //case-3:
                    onAfterInit3js = true;
                  }
                }else if( el_threeDWgt.length && el_threeDWgt.attr('aria-pressed') !== 'true' ) {
                  //case-4:
                  onAfterInit3js = true;
                }
              }else if( threeDWgt && !threeDWgt.selected ) {
                //case-4:
                onAfterInit3js = true;
              }
              
              if( onAfterInit3js && !( threeDWgt.config.callback || {} ).onAfterInit3js ) {
                //create a closure
                
                threeDWgt.config.callback.onAfterInit3js = function( threeConfig ) {
                  threeDWgt.config.setPoi.call( uiwidget[ categories.manner ].venue3DExplore.venue360,{
                    //threeConfig:threeDWgt.config
                    category:categories[ cat ]
                    ,distanceCutOff:uiwidget[ categories.manner ].explorationArea.distance
                  });
                }
              }
              
            }else {
              var as = this.manner;
              this.getData({
                cat: cat
                ,dataValue: dataValue
                ,as: as
              });
              //stamp google analytics
              //console.log("googleAnalytics: ");console.log(cat);
              _googleAnalytics(cat);
            }
          }
          return this;
        }
        ,off:function(options) {
          options = options || {};
          var cat = options.parent || this.current
          ,toggle = options.toggle
          ;
          if( cat && this[cat] && this[cat].isCategory ) {
                this[cat].selected = false;
                  this[cat].isShownInPanel = false;
                  this[cat].isShownOnMap = false;
            if( this.evaluator ) {
              this.evaluator.hideCategory(this[cat]);
            }
            if( this.widget.threeDWgt && this.widget.threeDWgt.config.ready ) {
              this.widget.threeDWgt.config.hidePoi.call( uiwidget[ this.manner ].venue3DExplore.venue360, {
                cat:cat
              });
            }
            
            /*if( typeof toggle !== "undefined" && !toggle ) {
              var as = this.manner
              ,categoryWgt = uiwidget[ as ].categoryWgt;
              if( categoryWgt ) {
                categoryWgt.catClick(cat,categoryWgt,false);
              }
            }*/
          }
          return this;
        }
        ,disable:function(cat) {
          $(categories.categoryListGalleryContainer+" #lgc-gallery").tabs( "option", "disabled", [ categories[cat].index ] );
          $(categories.categoryListGalleryContainer+" #list-gallery-tab-"+cat+" a").unbind('click');
          $(categories.categoryListGalleryContainer+' #list-gallery-tab-'+cat).removeClass("nemo-tab-on").addClass("nemo-tab-disable");
          categories[cat].selected = false;
          categories[cat].isShownInPanel = false;
          categories[cat].isShownOnMap = false;
        }
        ,hide:function() {}
        ,hover:function() {}
        ,reset:function() {}
        ,click:function() {}
        ,getPriority:function(cat) {
          if ( this.hasOwnProperty(cat) && this.isCategory(cat)) {
             if(typeof(this[cat].priority) !== "undefined") { return this[cat].priority; }
          } 
        }
        //TBD: to be deprecated and currently not in use
        ,setPriorityBand:function(as) {
          var toolBarIds = uiwidget[ as ].toolBarWgt? uiwidget[ as ].toolBarWgt.ids: {};
          uiwidget.pr.init({
            categories: categories
            ,appendEvalDom: false
            ,imgPath: uiwidget._serverHostUrl? uiwidget._serverHostUrl + "images/raty" : "images/raty"
            ,domIds: {
              pr: toolBarIds.toolbar? toolBarIds.toolbar+"-menu" : 'body'
              ,stats: toolBarIds.eval? toolBarIds.eval : 'body'
              //,statsDomAppendTo: "div.ui-layout-south"
              ,statsDomAppendTo: "div#nemo-layout-center-south"
              ,statsAddClass: "nemo-statstable-container"
            }
          });
        }
        ,update:function(cat,priority) {
          if( this.hasOwnProperty(cat) && typeof(this[cat]) === "object"
              && this.isCategory(cat) ) {
              
            if(typeof(this[cat].priority)!=="undefined") {
              var oldP = this[cat].priority;
              this[cat].priority = this.priority[cat] = priority;
              if(typeof(this.pSum)!=="undefined") {
                this.pSum += (priority - oldP);
                $("#prioritylist-summary-"+this.ptype+'-'+(this.groupId-1)+' .psum').text(this.pSum);
              }        
            }
            
          }
        }
        ,updateScore:function(oldP,priority,i) {
          //TBD: change categories to 'this' after analyzing difference between this and categories object instance
          if( typeof(this.stats)!=="undefined" && this.stats.length > 0 ) {
            var stats = categories.stats[i]
            ,uS = parseFloat( ( stats.aS*(priority/categories.totalNoOfCategories) ).toFixed(1) );
            
            //var old_wCatScore = stats.wCatScore
            //,new_wCatScore = stats.wCatScore = parseFloat( ( (priority/oldP)*stats.wCatScore).toFixed(2) );
            
            //scores updated
            stats.uS = uS;
            
            /*categories.pScore = categories.pScore - old_wCatScore + new_wCatScore;
            categories.max_pScore = categories.max_pScore + 5*(priority - oldP) ;
            categories.propScore = Math.round( (categories.pScore/categories.max_pScore)*100 );//percentage
            */        
          }
          return this;
        }
        ,updateStats:function(options) {
          var categories = options.categories
          ,catId = options.catId;
          if(typeof(categories.stats)!=="undefined") {
            if(typeof(catId)!=="undefined") {
              for(var i=0;i<categories.stats.length;i++) {
                if( categories.stats[i].catName===catId && categories.isCategory(categories.stats[i].catName) ) {
                  var p_old = categories.stats[i].priority
                  ,p_new = categories[catId].priority;
                  categories.updateScore(p_old,p_new,i);
                  categories.stats[i].priority = categories[catId].priority;
                }
              }
            }else {
              for( var cat in categories ) {
                if( categories.hasOwnProperty(cat) && typeof(categories[cat]) === "object" && categories.isCategory(cat) ) {                  
                    for(var i=0;i<categories.stats.length;i++) {
                      if(categories.stats[i].catName===cat) {
                        var p_old = categories.stats[i].priority
                        ,p_new = categories[cat].priority;
                        categories.updateScore(p_old,p_new,i);
                        categories.stats[i].priority = categories[cat].priority;
                      }
                    }
                }
              }
            }//end of else if
            
            var catScores = categories.score.normalizeScore( categories.stats, categories );
            //this.scores = (typeof(catScores)!=="undefined" && typeof(catScores.scores)!=="undefined")?catScores.scores:"scores not normalized";
            categories.pScore = (typeof(catScores)!=="undefined" && typeof(catScores.pScore)!=="undefined")?catScores.pScore:"pScore not defined";
            categories.max_pScore = (typeof(catScores)!=="undefined" && typeof(catScores.max_pScore)!=="undefined")?catScores.max_pScore:"max_pScore not defined";
            categories.propScore = (typeof(catScores)!=="undefined" && typeof(catScores.propScore)!=="undefined")?catScores.propScore:"propScore not defined";
            
          }
          return categories;
        }
        ,getCatObj:function() {
          return categories.catObj;
        }
        ,id:function() {
          return categories.allCatId;
        }
        ,getTotalOfAllCategories:function(s,dPoint) {
          var total = 0;
          dpoint = dpoint || "total";
          
          for(var i in s) {
            total += s[i][ dpoint ];
          }
          
          return total;
        }
        ,_createStats:function( gCat ) {
          //create Stats
          var dt = []
          ,cats = this
          ,all = this.getCatObj()
          ,score = uiwidget.score
          ,totalOfAllCategories = 0
          ,totalNoOfCategories = cats.totalNoOfCategories;
          
          for( var catIndex in cats.catOrder ) {
            var cat = cats.catOrder[ catIndex ];
            (function(cat) {
              if( cats.hasOwnProperty(cat) && typeof(cats[cat]) === "object" 
                  && cats.isCategory(cat) ) {
                //console.log("going to aggregate: ");console.log(cat);
                
                if( gCat ) {
                  if ( gCat[cat].stats.length < 0 ) {
                    return false;
                  }
                }else {
                  if ( cats[cat].stats.length < 0 ) {
                    return false;
                  }
                }
                    
                //aggregate scores
                var catScore = score.scoreme({
                  aggregate: ( cats[cat].stats.length > 0 ? cats[cat] : gCat[cat] )
                  ,totalNoOfCategories: totalNoOfCategories
                  ,categories: categories
                });
                
                totalOfAllCategories += ( cats[cat].total || gCat[cat].total );
                var mindist = typeof(cats[cat].mindist)!=="undefined"? cats[cat].mindist : gCat[cat].mindist
                ,maxdist = typeof(cats[cat].maxdist)!=="undefined"? cats[cat].maxdist : gCat[cat].maxdist
                ,priority = typeof(cats[cat].priority)!=="undefined"? cats[cat].priority : gCat[cat].priority
                ,display = cats[cat].display
                ,timeRange = cats.getTimeRange({
                  how: (function(categories) {
                    if(maxdist >= categories.speed.isCarWhen) {
                      return "car";
                    }else {
                      return "walk";
                    }
                  }(categories))
                  ,minDist: mindist
                  ,maxDist: maxdist
                  ,unit: "mt"
                })
                ,total = typeof(cats[cat].total)!=="undefined"? cats[cat].total : gCat[cat].total
                ,totalAvgDist = typeof(cats[cat].totalAvgDist)!=="undefined"? cats[cat].totalAvgDist : gCat[cat].totalAvgDist
                ,avgdist = Math.round( (totalAvgDist/total) )
                ;
                
                dt.push({
                    priority: priority
                    ,catName: cat
                    ,display: display
                    ,mindist: mindist 
                    ,maxdist: maxdist
                    ,timeRange: timeRange
                    ,total: total
                    ,avgdist: avgdist
                    ,subCatId: all[cat][0]
                    ,subCatName: all[cat][1]
                    ,catGroupLength: all[cat][2]
                    ,catScore: catScore.catScore
                    ,TS: catScore.TS
                    ,TSmax: catScore.TSmax
                    //,details: cats[cat].stats / gCat[cat].stats
                    ,nS: ( typeof(catScore.nearness)!=="undefined" 
                           && catScore.hasOwnProperty("nearness") )?catScore.nearness:0
                    ,pS: ( typeof(catScore.proximity)!=="undefined" 
                           && catScore.hasOwnProperty("proximity") )?catScore.proximity:0
                    ,aS: ( typeof(catScore.availability)!=="undefined" 
                           && catScore.hasOwnProperty("availability") )?catScore.availability:0
                    ,eS: ( typeof(catScore.effectiveness)!=="undefined" 
                           && catScore.hasOwnProperty("effectiveness") )?catScore.effectiveness:0
                    ,uS: ( typeof(catScore.usability)!=="undefined" 
                           && catScore.hasOwnProperty("usability") )?catScore.usability:0
                    ,nS_str: ( typeof(catScore.nearness_str)!=="undefined" 
                           && catScore.hasOwnProperty("nearness_str") )?catScore.nearness_str+',':0
                    ,pS_str: ( typeof(catScore.proximity_str)!=="undefined" 
                           && catScore.hasOwnProperty("proximity_str") )?catScore.proximity_str+',':0
                    ,aS_str: ( typeof(catScore.availability_str)!=="undefined" 
                           && catScore.hasOwnProperty("availability_str") )?catScore.availability_str+',':0
                    ,eS_str: ( typeof(catScore.effectiveness_str)!=="undefined" 
                           && catScore.hasOwnProperty("effectiveness_str") )?catScore.effectiveness_str+',':0
                    ,uS_str: ( typeof(catScore.usability_str)!=="undefined" 
                           && catScore.hasOwnProperty("usability_str") )?catScore.usability_str+',':0
                  }
                );
              }
            }(cat))
          }
          
          return {
            stats: dt
            ,totalNoOfCategories: totalNoOfCategories
            ,totalOfAllCategories: totalOfAllCategories
          };
        }
        ,_getScores:function( stats ) {
          function validScore( s,t ) {
            if( typeof(s)!=="undefined" && typeof(s[t])!=="undefined") {
              return s[t];
            }else {
              return t+" not defined";
            }
          }
          
          var score = uiwidget.score
          ,catScores = 0//score.normalizeScore( stats, categories ); //normalize stats and create scores
          //un-comment this.scores for testing only
          ,scores = 0//validScore(catScores,"scores")
          ,pScore = 0//validScore(catScores,"pScore")
          ,max_pScore = 0//validScore(catScores,"max_pScore")
          ,propScore = 0//validScore(catScores,"propScore")
          ;
          
          return {
            stats: stats
            ,catScores: catScores
            ,scores: scores
            ,pScore: pScore
            ,max_pScore: max_pScore
            ,propScore: propScore
          };
        }
        ,_initCatstats:function( cat, data, catGroupLength ) {
          cat.total = typeof(cat.total)==="undefined"?parseInt(data.total):cat.total+parseInt(data.total);
          cat.mindist = typeof(cat.mindist)==="undefined"?parseInt(data.mindist):(function() { 
            if (parseInt(cat.mindist) < parseInt(data.mindist))
              return parseInt(cat.mindist);
            else {
              return parseInt(data.mindist);
            }
          })();
          cat.maxdist = typeof(cat.maxdist)==="undefined"?parseInt(data.maxdist):(function() {
            if (parseInt(cat.maxdist) > parseInt(data.maxdist))
              return parseInt(cat.maxdist);
            else {
              return parseInt(data.maxdist);
            }
              
          })();
          cat.catGroupLength = catGroupLength;
          cat.totalAvgDist = typeof(cat.totalAvgDist)==="undefined"?( parseInt(data.avgdist)*parseInt(data.total) ):( parseInt(cat.totalAvgDist)+parseInt(data.avgdist)*parseInt(data.total) );
          cat.statsLen = typeof(cat.statsLen)==="undefined"?1:cat.statsLen+1;

          return cat;
        }
        ,_purgeStats:function() {
          for(var c in categories.validCategories) {
            (function(c) {
                categories[c].stats = [];
                categories[c].isAvailable = false;
                delete categories[c].total;
                delete categories[c].mindist;
                delete categories[c].maxdist;
                delete categories[c].catGroupLength;
                delete categories[c].totalAvgDist;
                delete categories[c].statsLen;
            }(c));
          }
          return true;
        }
        ,_groupCategories:function( data, mergeWithCategoriesObj ) {
          var all = this.getCatObj();
          if( mergeWithCategoriesObj ) {
            var groupedCategories = {};  
          }
          
          for(var i=0;i<data.length;i++) {
            (function(i,categories) {
              var pattern = ","+data[i].categoryno+",";
              //TBD: replace validCategories with catOrder
              for(var c in categories.validCategories) {
                (function(c,i) {
                  
                  if( mergeWithCategoriesObj && !groupedCategories[ c ] ) {
                    groupedCategories[ c ] = {};
                    groupedCategories[ c ].stats = [];
                    groupedCategories[ c ].isAvailable = false;
                    groupedCategories[ c ].index = 0;
                  }
                  
                  if(all[c][0].match(pattern)!==null) {
                    if( mergeWithCategoriesObj ) {
                      groupedCategories[c].isAvailable = true;
                      //Override the default CMA name for subcategory with nemo category factory settings
                      data[i].category =  (categories.categoryCodeMap[data[i].categoryno] || {}).name;
                      groupedCategories[c].stats.push(data[i]);
                      groupedCategories[ c ].index = categories[c].index;
                      categories._initCatstats( groupedCategories[c], data[i], all[c][2] );
                    }else {
                      categories[c].isAvailable = true;
                      //Override the default CMA name for subcategory with nemo category factory settings
                      data[i].category =  (categories.categoryCodeMap[data[i].categoryno] || {}).name;
                      categories[c].stats.push(data[i]);
                      categories._initCatstats( categories[c], data[i], all[c][2] );
                    }
                  }
                }(c,i));
              }
            }(i,this));
          }
          
          if( mergeWithCategoriesObj ) {
            return groupedCategories;  
          }else {
            return this;
          }
        }
        ,getProjectStats:function( options ) {
          var poi = options.poi
          ,index = options.index
          ,as = options.manner
          ,distance = options.distance || 5000//5 KM
          ,latlonObj = uiwidget.utils.geomToLatLonObj(poi.geom)
          ,centerLat = latlonObj.lat
          ,centerLon = latlonObj.lon
          ,limit = poi.limit || 30
          ,account = (uiwidget.vv || root).aD.account
          ,key = (uiwidget.vv || root.vidteq).key
          ,city = options.city || (uiwidget.cfg || root.cfg).city
          ,graphOptions = options.graph || {}
          ,callback = options.callback || {}
          ,complete = callback.complete
          ;
          
          index = typeof(index)!=="undefined"? index : "cached";
          
          if( !uiwidget.evaluate[city] ) {
            uiwidget.evaluate[city] = {};
          }
          
          if( !uiwidget.evaluate[city][ index ] ) {
            var url = uiwidget.cfg.nemoApi;
            //var restApiBaseUrl = 'api/nemo/v1';
            url = url+'/cities/'+city+'/categories/'+encodeURIComponent(categories.id())+'/locations/'+poi.geom.replace(/[^\s\d.]/g,'')+'/stats/'+ JSON.stringify( { distance: distance} ) +'/';
          
            $.ajax({
                url: url
                ,type: 'get'
                ,data: {
                  urlid: account
                  ,key: key
                  //,action: "getAreaStats"
                  //,distance: distance
                  //,locations: centerLon+','+centerLat
                  //,city: city
                  //,categories: categories.id() 
                }
                ,crossDomain: true
                //IE 7,8,9 did not like json dataType here and errors out. Value of uiwidget.vv.dataType is 'json'
                ,dataType: 'jsonp'//(uiwidget.vv||uiwidget.vidteq).dataType
                ,cache: false
                ,success:function(res) {
                    _callback(res,index,city,as);
                }
                ,error:function(res) {
                  //console.log("error: ");console.log(res);
                }
            });
          }else if( uiwidget.evaluate[city][ index ] && uiwidget.evaluate[city][ index ].allStats ) {
            var allStats = uiwidget.evaluate[city][ index ].allStats;
            var stats = allStats.stats;
            
            //categories.renderGraph({
            categories.widget.graph.init({
              allStats: allStats
              ,graph: graphOptions
            });
            
            if( complete && typeof(complete)==='function' ) {
              complete( allStats, categories );
            }
          }
          
          function _callback(res,index,city,as) {
            var rawdata = res.srf[0].results;
            if( rawdata.length > 0 ) {
              //sets metrics on category object instance
              var score = uiwidget.score;        
              var data = score.scoreme({
                metrics: rawdata
                ,categories: categories
              });
              var metrics = data;
              
              //purge previous stats
              //categories._purgeStats();
              
              //group Categories
              var groupedCategories = categories._groupCategories( data, true );
              var statsData = categories._createStats( groupedCategories )
              ,stats = statsData.stats
              ,totalOfAllCategories = statsData.totalOfAllCategories
              ;
              
              //normalize stats and create scores
              var allStats = categories._getScores(stats);
              allStats.categories = groupedCategories;
              allStats.metrics = metrics;
              allStats.totalOfAllCategories = totalOfAllCategories;
              allStats.distance = (distance/1000);
              allStats.unit = "Km";
              
              //for debug ONLY
              //var csvStats = categories.stats2csv( stats, true, true );
              //console.log("categories.stats2csv:debug: ");
              //console.log("For: "+index+" stats: ");console.log( csvStats );
              
              //categories.renderGraph({
              categories.widget.graph.init({
                allStats: allStats
                ,graph: graphOptions
              });
              
              if( !uiwidget.evaluate[city][ index ] ) {
                uiwidget.evaluate[city][ index ] = {};
              }
              
              uiwidget.evaluate[city][ index ].allStats = allStats;
              
              if( complete && typeof(complete)==='function' ) {
                complete( allStats, categories );
              }
              
              return allStats;
            }else {
              //console.log("No stats data");
              return false;
            }
          }
          
          return this;
        }
        ,setExplorationAreaStats:function(rawdata,as) {
        
          //check to see if the metrics and stats are purged or not
          if( typeof(this.metrics)!=="undefined" && typeof(this.stats)!=="undefined" &&
              this.metrics.length > 0 && this.stats.length > 0 ) {
            return ;
          }
          
          //var data = $.csv.toObjects(rawdata);
          //sets metrics on category object instance
          var score = uiwidget.score;        
          var data = score.scoreme({
            metrics: rawdata
            ,categories: this
          });        
          this.metrics = data;
          //group Categories
          this._groupCategories( data, false );
          //sets stats on category object instance
          var statsData = this._createStats();
          this.stats = statsData.stats;
          this.totalOfAllCategories = statsData.totalOfAllCategories;
          
          //normalize stats and create scores
          var statsScores = this._getScores( this.stats );
          
          this.scores = statsScores.scores;
          this.pScore = statsScores.pScore;
          this.max_pScore = statsScores.max_pScore;
          this.propScore = statsScores.propScore;
          
          var categoryWgt = uiwidget[ as ].categoryWgt
          ,categoryAutoTrigger = this.uiOptions.categoryAutoTrigger
          ,categoryAllTrigger = this.uiOptions.categoryAllTrigger;
          
          uiwidget.triggerShowEvaluate();
          
          if( categoryWgt.disableCatButtonIfNotAvailable ) {
            categoryWgt.events();
            if( categoryAutoTrigger ) {
              if( categoryAllTrigger ) {
                this.triggerAllCat();
              }else {
                this.triggerRandomCat();  
              }
            }
          }
          //create stats table
          this.widget.statsTable.init().create( this.stats );
          
          return this;
        }
        ,randomCatIndex:function() {
           var i = Math.floor(Math.random() * this.totalNoOfCategories);
           return i;
        }
        ,triggerRandomCat:function() {
            var as = this.manner
            ,categoryWgt = uiwidget[ as ].categoryWgt
            ,lgc = uiwidget[ as ].lgcWgt
            ,cat = this.current;
            
            if(typeof(cat)==="undefined" || !this.clicked) {
              var randomCatIndex = this.randomCatIndex();
              cat = categories.catIndex[ randomCatIndex ];
            }
            //if all categories are turned OFF by user, turn ON the random category
            if(!this.closed) {
              categoryWgt.catClick(cat,categoryWgt,true);
            }
            //if panel is closed by user earlier, open the panel
            if( lgc && lgc.categoryListGalleryRequired && uiwidget.nemoLayout.west.state.isClosed ) {
              uiwidget.nemoLayout.open('west');
            }
            return cat;
        }
        ,triggerAllCat:function() {
          var as = this.manner
          ,categoryWgt = uiwidget[ as ].categoryWgt
          ,lgc = uiwidget[ as ].lgcWgt
          ,catOrder = this.catOrder
          ;
          
          for( var i=0;i<catOrder.length;i++ ) {
            (function(i,categoryWgt) {
              var cat = catOrder[i];
                categoryWgt.catClick(cat,categoryWgt,true);
              //if panel is closed by user earlier, open the panel
              if( lgc && lgc.categoryListGalleryRequired && uiwidget.nemoLayout.west.state.isClosed ) {
                uiwidget.nemoLayout.open('west');
              }
            })(i,categoryWgt);
          }
        }
        ,setCatState:function(state) {
          if(state) {
            this.closed = false;  
          }else {
            this.closed = true;
          }
          return this;
        }
        ,stats2csv:function( stats, wrapValuesInQuotes, includeLabelsInFirstRow ) {
          var cvsStats = this._json2csv( JSON.stringify(stats), wrapValuesInQuotes, includeLabelsInFirstRow );
          return cvsStats;
        }
        //Reference: http://jsfiddle.net/sturtevant/vUnF9/
        ,_json2csv:function(objArray, wrapValuesInQuotes, includeLabelsInFirstRow ) {
            var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;

            var str = '';
            var line = '';

            if ( includeLabelsInFirstRow ) {
                var head = array[0];
                if ( wrapValuesInQuotes ) {
                    for (var index in array[0]) {
                        var value = index + "";
                        line += '"' + value.replace(/"/g, '""') + '",';
                    }
                } else {
                    for (var index in array[0]) {
                        line += index + ',';
                    }
                }

                line = line.slice(0, -1);
                str += line + '\r\n';
            }

            for (var i = 0; i < array.length; i++) {
                var line = '';

                if ( wrapValuesInQuotes ) {
                    for (var index in array[i]) {
                        var value = array[i][index] + "";
                        line += '"' + value.replace(/"/g, '""') + '",';
                    }
                } else {
                    for (var index in array[i]) {
                        line += array[i][index] + ',';
                    }
                }

                line = line.slice(0, -1);
                str += line + '\r\n';
            }
            return str;
        }
        ,addWidget:function(id,wgt) {
          if(categories.widget && !categories.widget[id] ) {
            categories.widget[id] = wgt;
          }
        }
        ,createGraphs:function(wait,firstTime) {
          this.widget.graph.init({
            allStats: {
              stats: this.stats
              ,totalOfAllCategories: this.totalOfAllCategories
            }
            ,graph: {
              graphId: "stats"
              //,link: ["http://www.vidteq.com"]
              ,stats: this.stats
              ,dPoint: "total"
              ,type: "pie"
              ,title: {
                text: "Amenities Distribution (Total "+this.totalOfAllCategories+")"
                ,x: 245
                ,y: 10
                ,stroke: "#18B36F"
                ,font: "12px sans-serif"
              }
              ,wait: wait
              ,firstTime: firstTime
              ,font: "13px sans-serif"
              //,appendTo: "div#nemo-layout-center-south" //does not work in IE7,8 without delay in redering
              //,appendTo: "div#nemo-layout-south" //does not work in IE7,8 without delay in redering
              //,appendTo: "body"//works like charm in IE7,8
            }
          });
          this.graphCreated = true;
        }
        ,checkLimit:function(cat) {
          if ( (categories[cat].noOfRecords < categories[cat].maxLimit) 
               && !categories[cat].noMoreData ) {
            //noMoreData is false and limit is not reached
            return true;
          }else {
            return false;
          }
        }
        ,getData:function( options ) {
          var cat = options.cat
          ,dataValue = options.dataValue
          ,as = options.as || this.manner
          ,distance = options.distance
          ,limit = options.limit
          ,redraw = typeof(options.redraw)!=="undefined"? options.redraw : false
          ,offset = typeof(options.offset)!=="undefined"? options.offset : 0;
          
          $(".nemo-layout-west .loader").show();
          var width = $(document).width() + "px";
          var height = $(document).height() + "px";
          
          //TBD: loader for clicked category instead of drapesheer
          //uiwidget.utils.drapeSheer( "routeRequest", width, height );
          
          //1. Check limit only if categories was called earlier
         /* var overlimit = false;
          if(!categories[cat].noMoreData) {
            overlimit = this.checkLimit(cat);  
          }
          
          if(!overlimit) {
            return false;
          }*/
         
          
          var explorationArea = uiwidget[ as ].explorationArea;
          //set the explorationArea.distance to new distance if provided
          explorationArea.distance = (typeof distance !=='undefined'? distance : explorationArea.distance);
          var distanceOption = explorationArea.distanceOption;
                  
          var point = new OpenLayers.Geometry.fromWKT(explorationArea.geom)
          //ajax call options
          ,centerLon = point.x
          ,centerLat = point.y
          ,account = root.aD.account
          ,key = (uiwidget.vv || root.vidteq).key
          ,city = options.city || (uiwidget.cfg || root.cfg).city
          ,ajaxTimeout = this.ajaxTimeout
          ,l = distanceOption? distanceOption.length : 0
          ,areaOptions = distanceOption? distanceOption[ l-1 ] : {}
          ,distance = (typeof distance !=='undefined'? distance : ( typeof areaOptions.x !== 'undefined'? areaOptions.x : explorationArea.distance ) )
          //,limit = typeof limit !== 'undefined'? limit : areaOptions.limit//explorationArea.limit
          ,limit = (typeof limit !== 'undefined'? limit : ( typeof areaOptions.limit !== 'undefined'? areaOptions.limit : explorationArea.limit ) )
          ;
          
          var url = (uiwidget.cfg || root.cfg).nemoApi;
          //var restApiBaseUrl = 'api/nemo/v1';
          url = url+'/cities/'+city+'/categories/'+encodeURIComponent(categories.catItemId[cat])+'/locations/'+explorationArea.geom.replace(/[^\s\d.]/g,'')+'/pois/'+ JSON.stringify( { distance: distance} ) +'/';
          
          var that = this;
          var data2send = {
            urlid: account
            ,key: key
            //,city: city
            //,categories: categories[cat].display
            //,pois: '{"distance":'+distance+'}'
            //,locations: '{"lon":'+centerLon+',"lat":'+centerLat+'}'
            ,limit:limit
            ,sortby: 'priority'
            //,page: (this[cat].pageNo + 1)
            ,offset:offset
          };
          //TBD: if want to let provide options directly when creating categories object
          if( this.uiOptions && this.uiOptions.sortBy ) {
            data2send.sortby = this.uiOptions.sortBy;
          }
          //TBD: the query should return non-fetched data i.e. pagination is required
          $.ajax({
              url: url
              ,type: 'get'
              ,data: data2send
              ,crossDomain: true
              //IE 7,8,9 did not like json dataType here and errors out. Value of uiwidget.vv.dataType is 'json'
              ,dataType: 'jsonp'//(uiwidget.vv || uiwidget.vidteq).dataType
              ,cache: false
              ,success:function(res) {
                  _callback({
                    data: res
                    ,dataValue: dataValue
                    ,manner: as
                    ,limit: limit
                    ,distance: distance
                    ,offset: offset
                  });
              }
              ,error:function(res) {
                //console.log("error: ");console.log(res);
                $(".nemo-layout-west .loader").fadeOut(2000);
                //uiwidget.utils.undrapeCurtain("routeRequest");
              }
          });
          function _sanitizeResponse(res) {
            if(res.error) {
              $(".nemo-layout-west .loader").fadeOut(2000);
              //uiwidget.utils.undrapeCurtain("routeRequest");
              return true;
            }else {
              return false;
            }
          }
          function _callback( options ) {
            var res = options.data
            ,dataValue = options.dataValue
            ,as = options.manner
            ,limit =  options.limit
            ,distance = options.distance
            ,offset = options.offset
            ;
            
            if( _sanitizeResponse(res) ) {
              return false;
            }
            if( typeof(that[cat].data)==="undefined") {
              categories[cat].dataStartIndex = 1;
              that[cat].data = [];
            }
            var data = res.srf[0].results;
            if(data.length>0) {
              //1. Increment the noOfRecords
              //2. increment the pageNo
              //3. Add new data to categories[cat].data
              that[cat].noOfRecords += data.length;
              categories[cat].dataEndIndex = (that[cat].noOfRecords);
              ++that[cat].pageNo; 
              //that[cat].data
              
              $(data).each(function(index) {
                var idx = (categories[cat].dataStartIndex + index - 1);
                this.address = {
                  name: this.name
                  ,index: idx
                };
                //start/stop poup icon use index attribute for DOM ids in format #mapDirFrom_0,#mapDirFrom_1,.. and #mapDirTo_0, mapDirTo_1,..
                this.index = idx;
                this.itemId = categories[cat].itemId;
                this.color = categories[cat].color; //TBD: default color code #2398C9
                //TBD: should not store the complete URL for poi image
                this.img = (function(D) {
                  var cfg = (uiwidget.cfg || root.cfg);
                   return D.image? cfg.cloneImageUrl+D.image : imgPath+"/nemo/no-image.png"; //TBD: introduce the theme
                })(this);
                this.preselected = (function(D,index) {
                  if( dataValue && dataValue==(index + 1)) {
                    return true;
                  }else {
                    return false;
                  }
                })(this,index);
              });
              
              //TBD:
              //$.merge( that[cat].data, data );
              that[cat].data =  data;
              
              if(that.evaluator) {
                that.evaluator.showCategoryOnMapInOneCircle({
                 LonLat: point
                 ,categoryObj: that[cat]
                 ,data: data
                 ,callback: that.getPopUpDescription
                 ,manner: as
                 ,redraw: redraw
                 //,distanceCutOff: distance
                });
              }
              var as = that.manner
              ,lgc = uiwidget[ as ].lgcWgt;
              if( lgc && lgc.categoryListRequired ) {
                lgc.setListContentTemplate(that[cat],data,dataValue,cat);
              }
            }else {
              //CASE I: For first time call
              // setter
              categories.disable(cat);
              //a. no data found
              //categories[cat].called is false.
              //Set categories[cat].noData to true and categories[cat].noMoreData to true
              if(!categories[cat].called) {
                categories[cat].noData = true;
                categories[cat].noMoreData = true;
              }
              
              //CASE II. For second or more calls
              //categories[cat].called is true, categories[cat].noMoreData is false and categories[cat].noData is false
              //Set categories[cat].noMoreData to true;
              if(!categories[cat].noMoreData) {
                categories[cat].noMoreData = true;
              }
            }
            //that._setData(data);
            //set the flag only ONCE that will determine if getData is called or not
            //irrespective of the condition whether data is found or not
            if(!categories[cat].called) {
              categories[cat].called = true;  
            }
            if( categories.widget.threeDWgt ) {
              var threeConfig = categories.widget.threeDWgt.config;
              var distanceCutOff = uiwidget[ categories.manner ].explorationArea.distance;
              if( !threeConfig.ready ) {
                var wait = 200;
                var count = 0;
                var poiTimeout;
                var set3DPoi = function(cat) {
                  var imgPath = uiwidget._serverHostUrl? uiwidget._serverHostUrl + "images" : "images";
                  categories.widget.threeDWgt.config.setPoi.call( uiwidget[ categories.manner ].venue3DExplore.venue360, {
                    //threeConfig:threeConfig
                    category:categories[cat]
                    ,distanceCutOff:distanceCutOff
                  });
                };
                var setPoiTimeOut = function() {
                  //TBD: threeConfig.venue360 is NULL, why??
                  //clearTimeout(poiTimeout);
                  if( uiwidget[ categories.manner ].venue3DExplore && uiwidget[ categories.manner ].venue3DExplore.venue360 && uiwidget[ categories.manner ].venue3DExplore.venue360.scene ) {
                    set3DPoi( cat );
                  }else {
                    ++count;
                    //console.log("setPoiTimeOut: count");console.log(count);
                    if( count < 20 ) {
                      poiTimeout = setTimeout(function() {
                        setPoiTimeOut();
                      },wait);
                    }
                  }
                };
                poiTimeout = setTimeout(function() {
                  setPoiTimeOut();
                },wait);
              }else {
                //categories.set3DPoi( cat );
                categories.widget.threeDWgt.config.setPoi.call( uiwidget[ categories.manner ].venue3DExplore.venue360, {
                  //threeConfig:threeConfig
                  category:categories[cat]
                  ,distanceCutOff:distanceCutOff
                });
              }
            }
            $(".nemo-layout-west .loader").fadeOut(2000);
            //uiwidget.utils.undrapeCurtain("routeRequest");
          }
          return this;
        }
        ,slider:function() {
          var as  = this.manner
          ,sliderWgt = new uiwidget[ as ].ButtonWgt({
             domId:"nemo-sliderWgt"
            ,hasConfig:true
            ,appendTo:"vidteq-wrapper"
            ,buttons:[{display:"1"},{display:"2"},{display:"3"},{display:"4"},{display:"5"}]
            ,buttonsImage:false
            ,hiddenOnCreate:false
            ,data:[]
            //,wgtClass:'nemo-toolbar'
            ,o:uiwidget
            //TBD: option to redraw categories on map when all of them were turned-on again
            ,callback:{
              onload:function( sliderWgt ) {
                console.log("onload: sliderWgt");
              }
              ,onclick:function( fIndex, dValue, sliderWgt ) {
                console.log("onclick: sliderWgt");
                console.log(fIndex);
              }
            }
          });
          uiwidget[ as ].categories.addWidget('sliderWgt',sliderWgt);
        }
        ,getGeom:function(name,cat) {
          var geom;
          if( this[cat] && this[cat].autoCompleteObj && this[cat].autoCompleteObj.data.length > 0 ) {
            $(this[cat].autoCompleteObj.data).each(function(index) {
              if( this.name === name ) {
                geom = this.geom;
                return false;
              }
            });
          }
          return geom;
        }
        ,getEntity:function(name,cat) {
          var entity;
          if( this[cat] && this[cat].autoCompleteObj && this[cat].autoCompleteObj.data.length > 0 ) {
            $(this[cat].autoCompleteObj.data).each(function(index) {
              if( this.name === name ) {
                entity = this.entity
                return false;
              }
            });
          }else {
            entity = {
              address: {
                name: name
              }
              ,reqSeed: name
              ,linkStr: name
            };
          }
          return entity;
        }
        //currently being used
        ,getPopUpDescription:function(data,type) {        
          var id = data["id"];
          var category = data["category"];
          var addr1 = data["addr1"];
          var addr2 = data["addr2"];
          var areaName = data["areaName"];//addr3
          var location = data["location"];//addr4
          var phone = data["phone"];
          var pin = data["pin"];
          var email = data["email"];
          var website = data["website"];
          var distance = data["distance"];
          var geom = data["geom"];
          var image = data["image"];
          var name = data["name"];
          var priority = data["priority"];
          var lonlatstr = geom.replace("POINT(",'').replace(")",'').split(/ /);
          //var areaCenter = new OpenLayers.Geometry.fromWKT(geom);
          //encodeURIComponent(geom.replace(/[^\s\d.]/g,''));
          var lonlatId=lonlatstr[0].replace(/\./g,'')+lonlatstr[1].replace(/\./g,'');
          
          var max=20;
          var width =300;
          var height = 200;

          var currentTime = new Date()
          var month = currentTime.getMonth() + 1
          var day = currentTime.getDate()
          var year = currentTime.getFullYear()
          var lastUpdated = day + "/" + month + "/" + year;
          

        //set img path url
        //TBD: change to uiwidget.cfg.cloneImageUrl
        var imageSrc = typeof(uiwidget.cfg)!=="undefined" && typeof(image)!=="undefined"? uiwidget.cfg.cloneImageUrl+image : undefined;
        var noImageSrc = uiwidget._serverHostUrl? uiwidget._serverHostUrl+"images" : "images";

        var config = root.aD.config;
        var themeColor = config.topStripColor || "#4495C6";
          
          if(typeof(type)!=undefined && type==="detailed") {   
           //get the scores.metrics,stats
           var eval
           ,heading
           ,dtlPopup, evalPopup;
           
           if(this.evalWgtRequired && typeof(pr.widget.evalWgt)!=="undefined") { 
             eval = pr.widget.evalWgt.eval();
           }
           heading= name;
           var htmlContent={};
           var addressIsPresent = false;
           var contactIsPresent = false;
           htmlContent.content=''+
           '<div id="catmain" oncontextmenu="return false;" style="postion:absoulte;padding:0px; width:300px;height:75%;min-height:200px">'+
            '<div  id="nameCat" style="padding:0px;background-color:'+themeColor+';text-align:center;width:100%;height:20px">'+
              '<a  onfocus="this.blur();" class="nemo-popup-button" style="color:black;"><b>'+category+'</b></a>'+
            '</div>'+
           "<div id='name' style='position:absolute;margin-top:2px;width:210px;height:150px;' >"+
            "<div class='cat_button' style='text-align:left;width:100%;height:100%;postion:absolute;color:black;overflow:hidden;'>"+
            "<div style='text-align:left;width:99%;height:25%;postion:absolute;color:black;'><b>"+name+"</b></div>";
          //address
          htmlContent.content += "<div style='display:none;' class='popup-address'><span>Address: </span>"
            if(typeof(addr1)!='undefined'){ htmlContent.content+= " "+addr1;addressIsPresent=true;}
            if(typeof(addr2)!='undefined'){ htmlContent.content+= " "+addr2;addressIsPresent=true;}  
            if(typeof(areaName)!='undefined'){ htmlContent.content+= " "+areaName;addressIsPresent=true;}
            if(typeof(location)!='undefined'){ htmlContent.content+= " "+location;addressIsPresent=true;}
            if(typeof(pin)!='undefined'){ htmlContent.content+= " - "+pin;}
          htmlContent.content+="</div>";
          //contact
          htmlContent.content += "<div style='display:none;' class='popup-contact'><span>Contacts: </span>";
            if(typeof(phone)!='undefined'){ htmlContent.content+= "<br />Phone: "+phone;contactIsPresent=true;}
            if(typeof(email)!='undefined'){ htmlContent.content+= "<br />E-mail: "+email;contactIsPresent=true;}
            if(typeof(website)!='undefined'){ htmlContent.content+= '<br />Web: <a style="color:#DF0D0D;" target="_blank" href="http://'+website.toLowerCase()+'">'+website.toLowerCase().replace(/www./,'')+'</a>';contactIsPresent=true;}
          htmlContent.content+="</div>"+
          
          "</div>";
          
          //bottom
          htmlContent.content+="<div id='bottomAd' class='cat_button'  style ='display:none;position:absolute; bottom:-25px ;width:"+width+"px;height:20px'>"+
            "Directions : </b><a id=catmainTo style='color:blue;cursor:pointer' onclick=\"javascript:vidteq.mboxObj.toFunction()\">To </a> | <a id=catmainFrom style='color:blue;cursor:pointer' onclick=\"javascript:vidteq.mboxObj.fromFunction()\"> From</a>"+
          "</div>";
                
          htmlContent.content+="</div>";
          
          if(typeof(imageSrc)!=="undefined") {
            htmlContent.content+="<div id='yo' height=80 width=80 style='border-color:#777777;border:0px;position:relative;float:right;margin-right:0px;margin-top:2px;overflow:hidden;padding:0px;background-color:#b0c4de'><a class='cat_button' style='color:black;cursor:pointer'  onclick=\"javascript:vidteq.mboxObj.getBackThumbNail()\"><img id='popimage' class='imagepop' style='border:0px; padding:0px; solid white; alt='Image' height=80 width=80 src='"+imageSrc+"'</a></div>";  
          }else {
            htmlContent.content+="<div height=80 width=80 style='display:none;border-color:#777777;border:0px;position:relative;float:right;margin-right:0px;margin-top:2px;overflow:hidden;padding:0px;background-color:#b0c4de'><a class='cat_button' style='color:black;cursor:pointer'><img id='popimage' class='imagepop' style='border:0px; padding:0px; solid white; alt='Image' height=80 width=80 src='"+noImageSrc+"/nemo/no-image.png'</a></div>"; //TBD: to introduce the theme
          }
          
          htmlContent.content+= "</div>";
          
           evalPopup = '<div id="'+lonlatId+'-eval" class="evalPopup">'+
              '<div id="'+lonlatId+'-dtltabs" class="lonlatId-dtltabs">'+
                '<ul>'+
                  '<li><a href="#'+lonlatId+'-dtltabs-1">Info</a></li>'+
                  '<li><a href="#'+lonlatId+'-dtltabs-3">Evaluate</a></li>'+
                '</ul>'+
                '<div id="'+lonlatId+'-dtltabs-1" class="lonlatId-dtltabs-numb">'+
                  '<div><img src="'+imageSrc+'" alt="No images available for it"/></div>'+
                  '<p>'+
                    '<blockquote><span class="propdtls projectName">'+name+'</span> is in <span class="propdtls builderName">'+areaName+'</span> (<span class="propdtls locationName">'+location+')</span>.<br />'+
                    'It\'s <span class="propdtls completionStatus">'+distance+'</span> far from the center of the area.';
                    if(typeof(phone)!=="undefined") {
        evalPopup += 'Contact <span class="propdtls amenities">'+phone+'</span>.</blockquote>';
                    }
        evalPopup += '</p><br />'+
                '</div>'+
              '</div>'+
              '<div class="gap">'+
                '<div class="bott_div">'+
                  '<span class="lastUpdated">Last updated :'+lastUpdated+'</span>'+
                '</div>'+
              '</div>';
            //return [dtlPopup,evalPopup];
            var  evalPopup_undefined;
            if(typeof(imageSrc)==="undefined") {
             dtlPopup = undefined;
            }
            //if( !categories.nemoTemplate.explore ) {
            //  categories.nemoTemplate.explore = {};
            //}
            //if( !categories.nemoTemplate.explore.categoryPopup) {
            //  categories.nemoTemplate.explore.categoryPopup = root.nemoTemplate.lib.compile( root.view._explore.categoryPopup());
            //}
            //var categoryPopupTemplate = categories.nemoTemplate.explore.categoryPopup;
            //var dom = categoryPopupTemplate(data, root.aD.config);
            var poiPopupTmpl = categories.poiPopupTmpl;
            if( $.isEmptyObject( $.template( poiPopupTmpl ) ) ) {
                $.template( poiPopupTmpl, $("#"+root.template[ poiPopupTmpl ]) );
            }
            
            var dom = $.tmpl( poiPopupTmpl, {data:data, color:  data.color || "#333"}, root.template.helper )[0].outerHTML;
            
            return {
              dtlPopup: dom//htmlContent.content//contentDom
              ,addressIsPresent: addressIsPresent
              ,contactIsPresent: contactIsPresent
              ,evalPopup: evalPopup_undefined
              ,heading: heading
              ,evalObj: eval
              ,lonlatId: lonlatId
            };
          }else if(typeof(type)!=undefined && type==="tooltip") {
            var tooltip = projectName;//TBD convert to div
            return tooltip;
          }else {
            return projectName;
          }
        }
        //TBD: to be deprecated and currently not in use
        ,getPopUpDescription2:function(data,type) {
          var areaName = data["areaName"];
          var category = data["category"];
          var distance = data["distance"];
          var phone = data["phone"];
          var geom = data["geom"];
          var image = data["image"];
          var id = data["id"];
          var location = data["location"];
          var name = data["name"];      
          var pin = data["pin"];
          var priority = data["priority"];
          var lonlatstr = geom.replace("POINT(",'').replace(")",'').split(/ /);
          //var areaCenter = new OpenLayers.Geometry.fromWKT(geom);
          //encodeURIComponent(geom.replace(/[^\s\d.]/g,''));
          var lonlatId=lonlatstr[0].replace(/\./g,'')+lonlatstr[1].replace(/\./g,'');
          
            var currentTime = new Date()
            var month = currentTime.getMonth() + 1
            var day = currentTime.getDate()
            var year = currentTime.getFullYear()
            var lastUpdated = day + "/" + month + "/" + year;
          

        //set img path url
        //TBD: change to uiwidget.cfg.cloneImageUrl
        var imageSrc = typeof(uiwidget.cfg)!=="undefined" && typeof(image)!=="undefined"? uiwidget.cfg.cloneImageUrl+image : undefined;
          
          if(typeof(type)!=undefined && type==="detailed") {   
           //get the scores.metrics,stats
           var eval
           ,heading
           ,dtlPopup, evalPopup;
           
           if(this.evalWgtRequired && typeof(pr.widget.evalWgt)!=="undefined") { 
             eval = pr.widget.evalWgt.eval();
           }
           heading= name;
           dtlPopup = '<div id="'+lonlatId+'-'+name+'" class="drop-shadow">';
                       if(typeof(imageSrc)!=="undefined") {
             dtlPopup += '<div><img src="'+imageSrc+'"/></div>';
                        }
                        '<div class="gap"><span class="header">'+name+', </span>';
                        if(typeof(areaName)!=="undefined") {
            dtlPopup +=  '</br> on '+areaName;
                          if(typeof(location)!=="undefined") {
             dtlPopup +=  ' ('+location+')';  
                          }
                        }
            dtlPopup += '</div></div>';
           evalPopup = '<div id="'+lonlatId+'-eval" class="evalPopup">'+
              '<div id="'+lonlatId+'-dtltabs" class="lonlatId-dtltabs">'+
                '<ul>'+
                  '<li><a href="#'+lonlatId+'-dtltabs-1">Info</a></li>'+
                  '<li><a href="#'+lonlatId+'-dtltabs-3">Evaluate</a></li>'+
                '</ul>'+
                '<div id="'+lonlatId+'-dtltabs-1" class="lonlatId-dtltabs-numb">'+
                  '<div><img src="'+imageSrc+'" alt="No images available for it"/></div>'+
                  '<p>'+
                    '<blockquote><span class="propdtls projectName">'+name+'</span> is in <span class="propdtls builderName">'+areaName+'</span> (<span class="propdtls locationName">'+location+')</span>.<br />'+
                    'It\'s <span class="propdtls completionStatus">'+distance+'</span> far from the center of the area.';
                    if(typeof(phone)!=="undefined") {
        evalPopup += 'Contact <span class="propdtls amenities">'+phone+'</span>.</blockquote>';
                    }
        evalPopup += '</p><br />'+
                '</div>'+
              '</div>'+
              '<div class="gap">'+
                '<div class="bott_div">'+
                  '<span class="lastUpdated">Last updated :'+lastUpdated+'</span>'+
                '</div>'+
              '</div>';
            //return [dtlPopup,evalPopup];
            var  evalPopup_undefined;
            if(typeof(imageSrc)==="undefined") {
             dtlPopup = undefined;
            }
            return {
              dtlPopup: dtlPopup
              ,evalPopup: evalPopup_undefined
              ,heading: heading
              ,evalObj: eval
              ,lonlatId: lonlatId
            };
          }else if(typeof(type)!=undefined && type==="tooltip") {
            var tooltip = projectName;//TBD convert to div
            return tooltip;
          }else {
            return projectName;
          }
        }
      };
      for( var f in fn ) {
        categories[f] = fn[f];
      }
      return categories;
    }
  };
  //--- prototype ends --- //
  
  root.Category = Category;
}(this, document, 'vidteq'));
