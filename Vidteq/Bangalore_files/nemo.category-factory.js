/**
 * @summary     CategoryFactory
 * @description Category Object definition for nemo. Ideally, it should not contain and method definitions.
                In later versions this can be either created dynamically or can be created specific to different clients.
                The object of this class gets its functionality/methods by nemo.category.js.
 * @version     2.0.0
 * @file        nemo.category-factory.js
 * @author      Bhaskar Mangal ( bhaskar@vidteq.com )
 * @contact     www.vidteq.com
 *
 * @copyright Copyright 2015 www.vidteq.com, all rights reserved.
 */
(function( global,document, root ) {
  root = global[root] = ( global[root]? global[root] : {} );
  
  function CategoryFactory( options ) {
    options = options || {};
    //---- Nemo Evaluation speicif framework category ---//
        
    //It should be in sync with nemoCmaMap in classes/Category.class.php
    //TBD: till we have this in CMA, we live with it.
    var nemoCmaMap = {
      "Schools" : "school"
      ,"Education" : "education"
      ,"Workplace" : "workplace"
      ,"Hospitals" : "health"
      ,"Bus Stops" : "busstop"
      ,"Railway Stations" : "railwaystation"
      ,"Airports" : "airport"
      ,"Colleges" : "higheredu"
      ,"Banks" : "finance"
      ,"Entertainment" : "entertainment"
      ,"Public Services" : "publicservice"
      ,"Govt. Services" : "publicservice"
      ,"Restaurants" : "hotelrest"
      ,"Market" : "market"
      ,"Supermarkets" : "market"
      ,"Shopping Malls": "shopping"
      ,"Malls": "shopping"
      ,"Transport Facilities" : "commute"
      ,"Transport" : "commute"
      ,"Places of Worship": "worshipplace"
      ,"Pubs": "pub"
      ,"Sightseeing": "sightseeing"
    }
    ,nemoAllowedCategoryList = [
       { name:"Schools", categoryList:"207,223,224,225,201,208", sortby:"priority"}
      ,{ name:"Education", categoryList:"207,223,224,225,201,208,202,205,206", sortby:"priority"}
      ,{ name:"Workplace", categoryList:"1001,1002,1003,1004,1005,1006", sortby:"priority"}
      ,{ name:"Hospital", categoryList:"801,802,832", sortby:"priority"}
      ,{ name:"Transport Facilities", categoryList:"1101,1102,1116,1114,1109", sortby:"distance"}
      ,{ name:"Bus Stops", categoryList:"1101", sortby:"distance"}
      ,{ name:"Railway Stations", categoryList:"1102", sortby:"distance"}
      ,{ name:"Airports", categoryList:"1108", sortby:"distance"}
      ,{ name:"Colleges", categoryList:"202,205,206", sortby:"priority"}
      ,{ name:"Banks", categoryList:"601,602", sortby:"distance"}
      ,{ name:"Shopping Malls", categoryList:"444,1202,1203,1204,1205,1206,1207,1210,1216,1239", sortby:"distance"}
      ,{ name:"Public Services", categoryList:"501,502,503,519", sortby:"priority"}
      ,{ name:"Restaurants", categoryList:"101,102,103,114,199", sortby:"priority"}
      ,{ name:"Market", categoryList:"1201,1202,1203,1200", sortby:"priority"}
      ,{ name:"Places of Worship", categoryList:"301,302,303,304,305", sortby:"distance"}
    ]
    ,defaultScale = {
      nScale: {
        start:0
        ,end:5000
      }
      ,pScale: {
        start:0
        ,end:1000
      }
      ,eScale: {
         start:0
        ,end:6
      }
    }
    ,categoryMap = {
      "school" : {
        id: "school"
        //,color: "#FF9933"
        ,color: "#d3c303"
        ,x:32
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
       }
      ,"education" : {
        id: "education"
        ,color: "#2aab72"
        ,x:32
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
       }
      ,"higheredu" : {
        id: "higheredu"
        //,color: "#0000CC"
        ,color: "#c8640e"
        ,x:32
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"finance" : {
        id: "finance"
        //,color: "#990000"
        ,color: "#0ec861"
        ,x:32
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"commute" : {
        id: "commute"
        //,color: "#CC00FF"
        ,color: "#0e7ac8"
        ,x:32
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"busstop" : {
        id: "busstop"
        ,color: "#03bdd3"
        ,x:32
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"railwaystation" : {
        id: "railwaystation"
        ,color: "#a9822a"
        ,x:32
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"airport" : {
        id: "airport"
        ,color: "#64b708"
        ,x:32
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"health" : {
        id: "health"
        //,color: "#FF4200"
        ,color: "#c80e12"
        ,x:32
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"entertainment" : {
        id: "entertainment"
        //,color: "#089F00"
        ,color: "#950ec8"
        ,x:32
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"workplace" : {
        id: "workplace"
        ,color: "#ff0000"
        ,x:32
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"publicservice" : {
        id: "publicservice"
        ,color: "#cc9900"
        ,x:32
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"market" : {
        id: "market"
        ,color: "#3300ff"
        ,x:32
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"hotelrest" : {
        id: "hotelrest"
        ,color: "#2aab45"
        ,x:32
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"pub" : {
        id: "pub"
        ,color: "#ab632a"
        ,x:32
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"sightseeing" : {
        id: "sightseeing"
        ,color: "#ab632a"
        ,x:32
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"worshipplace" : {
        id: "worshipplace"
        ,color: "#ab632a"
        ,x:32
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"shopping" : {
        id: "shopping"
        ,color: "#950ec8"
        ,x:32
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
    }
    ,nemoAllowedDistanceLimit = typeof(options.allowedDistanceLimit)!=="undefined"? options.allowedDistanceLimit : 3000
    ,nemoAllowedItemLimit = typeof(options.allowedItemLimit)!=="undefined"? options.allowedItemLimit : 30
    ,overrideWithCma = typeof(options.overrideWithCma)!=="undefined"? options.overrideWithCma : true 
    ,categoryConfig = overrideWithCma && options.categoryConfig?
      options.categoryConfig : {
        allowedCategoryList: nemoAllowedCategoryList
        ,allowedDistanceLimit: nemoAllowedDistanceLimit
        ,allowedItemLimit: nemoAllowedItemLimit
      }
    ,as = options.manner = options.manner? options.manner : "explore"
    ,prefix = options.prefix = options.prefix? options.prefix : "nemo"
    ,theme = options.theme = options.theme? options.theme : "none"
    ,poiPopupTmpl = options.poiPopupTmpl = options.poiPopupTmpl? options.poiPopupTmpl : "poiPopup2D"
    ,color = options.color = options.color? options.color : undefined
    ,uiOptions = options.uiOptions = options.uiOptions? options.uiOptions : undefined
    ,_serverHostUrl = options._serverHostUrl? options._serverHostUrl : undefined
    ;
    
    var categoryCodeMap = {
      //school
      "207" : {
        id: "intschl"
        ,name: "International Schools"
        ,priority: 1
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"201" : {
        id: "govschl"
        ,name: "Government Schools"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"208" : {
        id: "kidschl"
        ,name: "Play Schools"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"223" : {
        id: "icseiscschl"
        ,name: "ICSE/IS"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"224" : {
        id: "cbseschl"
        ,name: "CBSE"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"225" : {
        id: "igcsegceibschl"
        ,name: "IGCSE/GCE/IB"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      //higheredu
      ,"202" : {
        id: "college"
        ,name: "Colleges"
        ,priority: 1
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"205" : {
        id: "traininginst"
        ,name: "Training Institutes"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"206" : {
        id: "othreduinst"
        ,name: "Other Institutes"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      //finance
      ,"601" : {
        id: "banks"
        ,name: "Banks"
        ,priority: 2
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"602" : {
        id: "atms"
        ,name: "ATMs"
        ,priority: 1
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"603" : {
        id: "insurco"
        ,name: "Insurance Co."
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"607" : {
        id: "otherfin"
        ,name: "Other Financial Co."
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      //commute
      ,"1101" : {
        id: "busstop"
        ,name: "Bus Stop"
        ,priority: 1
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"1116" : {
        id: "metro"
        ,name: "Metro"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"1102" : {
        id: "railway"
        ,name: "Railway Station"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"1114" : {
        id: "busdepo"
        ,name: "Bus Depo"
        ,priority: 3
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"1108" : {
        id: "airport"
        ,name: "Airport"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"1109" : {
        id: "taxicab"
        ,name: "Taxi/Cab"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      //health
      ,"801" : {
        id: "hosptial"
        ,name: "Hosptials"
        ,priority: 1
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"802" : {
        id: "nurshome"
        ,name: "Nursing Homes"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"832" : {
        id: "medstore"
        ,name: "Medical Stores"
        ,priority: 3
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"843" : {
        id: "gym"
        ,name: "Gym"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"839" : {
        id: "yogacent"
        ,name: "Yoga Centers"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      //entertainment
      ,"701" : {
        id: "theatre"
        ,name: "Theatres"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"702" : {
        id: "multiplex"
        ,name: "Multiplex"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"705" : {
        id: "clubs"
        ,name: "Clubs"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"706" : {
        id: "resorts"
        ,name: "Resorts"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"707" : {
        id: "parks"
        ,name: "Parks"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"709" : {
        id: "gamezone"
        ,name: "Game Zones"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"710" : {
        id: "zoo"
        ,name: "Zoo"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"711" : {
        id: "beach"
        ,name: "Beach"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"712" : {
        id: "themepark"
        ,name: "Theme Parks"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      //workplace
      ,"1001" : {
        id: "itco"
        ,name: "IT Co"
        ,priority: 3
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"1002" : {
        id: "bpoco"
        ,name: "BPO Co"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"1003" : {
        id: "notitco"
        ,name: "Non-IT Co"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"1004" : {
        id: "prodindus"
        ,name: "Production Industries"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"1005" : {
        id: "govindus"
        ,name: "Government Industries"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"1006" : {
        id: "otherindus"
        ,name: "Other Industries"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      //publicservice
      ,"501" : {
        id: "policestat"
        ,name: "Police Stations"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"502" : {
        id: "postoff"
        ,name: "Post Offices"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"503" : {
        id: "bangone"
        ,name: "Bangalore-One"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"519" : {
        id: "eseva"
        ,name: "e-Seva"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      //shopping
      ,"1201" : {
        id: "complex"
        ,name: "Complex"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"1202" : {
        id: "bigbaz"
        ,name: "Big Bazzar"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"1203" : {
        id: "relfresh"
        ,name: "Reliance Fresh"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"1200" : {
        id: "shopbrands"
        ,name: "Shop Brands"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      //hotelrest
      ,"101" : {
        id: "hotel"
        ,name: "Hotels"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"102" : {
        id: "restaurant"
        ,name: "Restaurants"
        ,priority: 2
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"103" : {
        id: "pizza"
        ,name: "Pizza"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"114" : {
        id: "pubbar"
        ,name: "Pub-Bar"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"199" : {
        id: "eatout"
        ,name: "Eat-Outs"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      //worshipplace
      ,"301" : {
        id: "temple"
        ,name: "Temple"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"302" : {
        id: "masjid"
        ,name: "Masjid/Dargah"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"303" : {
        id: "church"
        ,name: "Church"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"304" : {
        id: "ashram"
        ,name: "Ashram"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"305" : {
        id: "othrreligiousplace"
        ,name: "Other Religious Places"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      //shoppingmall
      ,"444" : {
        id: "shoppingmall"
        ,name: "Shopping Malls"
        ,priority: 1
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"1202" : {
        id: "bigbazaar"
        ,name: "Big Bazaar"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"1203" : {
        id: "reliancefresh"
        ,name: "Reliance Fresh"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"1204" : {
        id: "foodworld"
        ,name: "Food world"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"1205" : {
        id: "heritagefresh"
        ,name: "Heritage Fresh"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"1206" : {
        id: "moresupermarket"
        ,name: "More Super Market"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"1207" : {
        id: "nilgiris"
        ,name: "Nilgiris"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"1210" : {
        id: "Smart"
        ,name: "Smart"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"1216" : {
        id: "metro"
        ,name: "Metro Mall"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
      ,"1239" : {
        id: "safal"
        ,name: "Safal"
        ,priority: 4
        ,scales: {
          nScale: {
            start:0
            ,end:5000
          }
          ,pScale: {
            start:0
            ,end:1000
          }
          ,eScale: {
             start:0
            ,end:6
          }
        }
      }
    };
     
    var categories = {
      version:"2.0.0"
      ,account:null
      ,callbacks:{
        //foreach category
        onHover:null
        ,onClick:null
        ,afterGetData:null
      }
      ,createdOn:null
      ,timeStamp:null
      ,build:null
      //,catDistanceCutOff:0
      ,ajaxWait: 2000//2 sec
      //,ajaxTimeout: 90000//1 min 30 sec
      ,ajaxTimeout: 30000//30 sec
      ,overrideWithCma: overrideWithCma
       //Information related to type of categories
      ,totalNoOfCategories:0
      ,catIndex:undefined
      ,catOrder:[]
      ,catCodes:undefined
      ,catItemId:undefined
      ,allCatId:null
      ,poiPopupTmpl: poiPopupTmpl
      ,catObj:undefined
      //--- UI specific options
      //evalWgtRequired or not
      ,evalWgtRequired:false
      //To check if category was ever clicked
      ,clicked:false
      //To check if category is closed
      ,closed:false
      /*
       * Whenever category is switched ON or category tabs in list are switched ON
       * this property should be set to that category. Any decisions to be made if
       * required can be taken w.r.t. currently opened category using this property.
       */
      ,current:null
      /*
       * When categories.clicked is false i.e. if opened without any categories ON
       * this property will be used to make any category specific decisions if required.
       */
      ,defaultCategory:"school"
      ,wayfinderSearchRequired:false
      ,graphCreated:false
      //To check if category route was played
      ,routeDisplayed:false
      //--x--x--x-- UI specific options --x--x--x--//
      
      //--- widgets
      ,widget:undefined
      //--- Specific to scoring and stats
      ,groupId:1
      ,manner:as
      //raw data returned by stats query
      ,metrics:[]
      //grouped stats based on UI based categories
      ,stats:[]
      //scores object
      ,scores:undefined
      //priority object
      ,priority: undefined
      ,max_pScore:0
      ,pScore:0
      ,pSum:0
      ,propScore:0
      //speed object
      ,speed: {
        walk: 10
        ,car: 3 
        ,desc: "Time in minutes to travel 1Km"
        ,isCarWhen: 5000 
      }
      //custom priority defines aggregated priorities based on user profile
      ,ptype:"custom"
      //--x--x--x-- Specific to scoring and stats --x--x--x--//
      
      ,prefix:"nemo"
      ,gisCategories: undefined
      //Interaction with map is done through evaluator
      ,evaluator:undefined
      ,geolocations:undefined
      //Ideally it's reference of nemo widget or can be anyone who's the owner of category instance
      ,uiwidget: undefined
      //,nemoTemplate:undefined
      ,uiOptions:undefined
      ,validCategories: undefined
      ,pset: {
        "zero":0
        ,"one":1
        ,"two":2
        ,"three":3
        ,"four":4
      }
      ,whatPriorityMeans: {
        "0" : {
          whatYouSay: "I am not even considering it"
          ,whatIMean: "It's not applicable"
        }
        ,"1": {
          whatYouSay: "It's uttermost important"
          ,whatIMean: "It's of high importance"
        }
        ,"2": {
          whatYouSay: "It's crucial to have it and I want it"
          ,whatIMean: "It must be met"
        }
        ,"3": {
          whatYouSay: "It's good to have something extra"
          ,whatIMean: "It can be met"
        }
        ,"4" : {
          whatYouSay: "I am least bothered about it"
          ,whatIMean: "It's of low or negligible importance at this time"
        }
      }
      ,criteria: {
        random:{
           ptype:"random"
          ,punit:''
          ,pdisplay:"Random"
          ,start:0
          ,end:10
          ,dom:null
          ,domId:null
          ,bands:[]
          ,selectedBand:0
          ,criteriaWgt:false
          ,priorityWgt:false
          ,priorityBand:(function() {
            var band_1 = {
               school:4
              ,workplace:4
              ,health:4
              ,commute:4
              ,busstop:4
              ,railwaystation:4
              ,airport:4
              ,higheredu:4
              ,finance:4
              ,shopping:4
              ,entertainment:4
              ,publicservice:4
              ,hotelrest:4
              ,market:4
              ,worshipplace:4
            };
          return [ band_1 ];
          })()
        }
        ,age:{
           ptype:"age"
          ,punit:"yrs"
          ,pdisplay:"Age Group"
          ,start:20
          ,end:80
          ,dom:null
          ,domId:null
          ,bands:[]
          ,selectedBand:0
          ,criteriaWgt:false
          ,priorityWgt:false
          ,priorityBand:(function() {
            var band_1 = {
               school:3
              ,education:3
              ,workplace:1
              ,health:3
              ,commute:1
              ,busstop:1
              ,railwaystation:4
              ,airport:4
              ,higheredu:4
              ,finance:3
              ,shopping:2
              ,entertainment:3
              ,publicservice:3
              ,hotelrest:3
              ,market:1
              ,worshipplace:4
            }
            ,band_2 = {
               school:1
              ,education:1
              ,workplace:2
              ,health:2
              ,commute:1
              ,busstop:1
              ,railwaystation:4
              ,airport:4
              ,higheredu:3
              ,finance:3
              ,shopping:1
              ,entertainment:3
              ,publicservice:3
              ,hotelrest:3
              ,market:1
              ,worshipplace:4
            }
            ,band_3 = {
               school:4
              ,education:4
              ,workplace:2
              ,health:1
              ,commute:1
              ,busstop:1
              ,railwaystation:4
              ,airport:4
              ,higheredu:3
              ,finance:2
              ,shopping:1
              ,entertainment:4
              ,publicservice:3
              ,hotelrest:3
              ,market:1
              ,worshipplace:4
            }
            ,band_4 = {
               school:4
              ,education:4
              ,workplace:3
              ,health:1
              ,commute:1
              ,busstop:1
              ,railwaystation:4
              ,airport:4
              ,higheredu:2
              ,finance:1
              ,shopping:1
              ,entertainment:2
              ,publicservice:3
              ,hotelrest:2
              ,market:1
              ,worshipplace:4
            };
            return [ band_1, band_2, band_3, band_4 ];
          })()
        }
        ,income:{
           ptype:"income"
          ,punit:"lac/pa"
          ,pdisplay:"Income Group"
          ,start:200000
          ,end:500000
          ,dom:null
          ,domId:null
          ,bands:[]
          ,selectedBand:0
          ,criteriaWgt:false
          ,priorityWgt:false
          ,priorityBand:(function() {
            var band_1 = {
               school:3
              ,education:3
              ,workplace:2
              ,health:4
              ,commute:2
              ,busstop:2
              ,railwaystation:4
              ,airport:4
              ,higheredu:4
              ,finance:3
              ,shopping:3
              ,entertainment:4
              ,publicservice:3
              ,hotelrest:4
              ,market:1
              ,worshipplace:4
            }
            ,band_2 = {
               school:3
              ,education:3
              ,workplace:2
              ,health:3
              ,commute:1
              ,busstop:1
              ,railwaystation:4
              ,airport:4
              ,higheredu:4
              ,finance:3
              ,shopping:3
              ,entertainment:4
              ,publicservice:3
              ,hotelrest:3
              ,market:1
              ,worshipplace:4
            }
            ,band_3 = {
               school:3
              ,education:3
              ,workplace:2
              ,health:3
              ,commute:1
              ,busstop:1
              ,railwaystation:4
              ,airport:4
              ,higheredu:4
              ,finance:3
              ,shopping:3
              ,entertainment:4
              ,publicservice:3
              ,hotelrest:3
              ,market:1
              ,worshipplace:4
            }
            ,band_4 = {
               school:3
              ,education:3
              ,workplace:2
              ,health:3
              ,commute:1
              ,busstop:1
              ,railwaystation:4
              ,airport:4
              ,higheredu:4
              ,finance:3
              ,shopping:3
              ,entertainment:4
              ,publicservice:3
              ,hotelrest:3
              ,market:1
              ,worshipplace:4
            };
            
            return [ band_1, band_2, band_3, band_4];
          })()
        }
        ,locatedat:{
           ptype:"locatedat"
          ,punit:""
          ,pdisplay:"Located At"
          ,start:0
          ,end:15
          ,dom:null
          ,domId:null
          ,bands:[]
          ,selectedBand:0
          ,criteriaWgt:false
          ,priorityWgt:false
          ,priorityBand:(function() {
            var band_nri = {
               school:2
              ,education:2
              ,workplace:1
              ,health:2
              ,commute:1
              ,busstop:1
              ,railwaystation:4
              ,airport:4
              ,higheredu:3
              ,finance:3
              ,shopping:2
              ,entertainment:3
              ,publicservice:3
              ,hotelrest:2
              ,market:1
              ,worshipplace:4
            }
            ,band_out = {
               school:2
              ,education:2
              ,workplace:1
              ,health:2
              ,commute:1
              ,busstop:1
              ,railwaystation:4
              ,airport:4
              ,higheredu:3
              ,finance:3
              ,shopping:2
              ,entertainment:3
              ,publicservice:3
              ,hotelrest:2
              ,market:1
              ,worshipplace:4
            }
            ,band_local = {
               school:4
              ,education:4
              ,workplace:1
              ,health:2
              ,commute:1
              ,busstop:1
              ,railwaystation:4
              ,airport:4
              ,higheredu:4
              ,finance:3
              ,shopping:3
              ,entertainment:3
              ,publicservice:3
              ,hotelrest:3
              ,market:1
              ,worshipplace:4
            };
            
            return [ band_nri, band_out, band_local ];
          })()
        }
        ,purpose:{
           ptype:"purpose"
          ,punit:''
          ,pdisplay:"Purpose"
          ,start:0
          ,end:10
          ,dom:null
          ,domId:null
          ,bands:[]
          ,selectedBand:0
          ,criteriaWgt:false
          ,priorityWgt:false
          ,priorityBand:(function() {
            var band_self = {
               school:4
              ,education:4
              ,workplace:1
              ,health:2
              ,commute:1
              ,busstop:1
              ,railwaystation:4
              ,airport:4
              ,higheredu:4
              ,finance:3
              ,shopping:3
              ,entertainment:3
              ,publicservice:3
              ,hotelrest:3
              ,market:1
              ,worshipplace:4
            }
            ,band_invest = {
               school:2
              ,education:2
              ,workplace:1
              ,health:2
              ,commute:1
              ,busstop:1
              ,railwaystation:4
              ,airport:4
              ,higheredu:3
              ,finance:3
              ,shopping:2
              ,entertainment:3
              ,publicservice:3
              ,hotelrest:2
              ,market:1
              ,worshipplace:4
            };
            
            return [ band_self, band_invest ];
          })()
        }
        ,experience:{
           ptype:"experience"
          ,punit:''
          ,pdisplay:"Experience Level"
          ,start:0
          ,end:10
          ,dom:null
          ,domId:null
          ,bands:[]
          ,selectedBand:0
          ,criteriaWgt:false
          ,priorityWgt:false
          ,priorityBand:(function() {
            var band_novice ={
               school:4
              ,education:4
              ,workplace:1
              ,health:2
              ,commute:1
              ,busstop:1
              ,railwaystation:4
              ,airport:4
              ,higheredu:4
              ,finance:3
              ,shopping:3
              ,entertainment:3
              ,publicservice:3
              ,hotelrest:3
              ,market:1
              ,worshipplace:4
            }
            ,band_exp = {
               school:2
              ,education:2
              ,workplace:1
              ,health:2
              ,commute:1
              ,busstop:1
              ,railwaystation:4
              ,airport:4
              ,higheredu:3
              ,finance:3
              ,shopping:2
              ,entertainment:3
              ,publicservice:3
              ,hotelrest:2
              ,market:1
              ,worshipplace:4
            };
            
            return [ band_novice, band_exp ];
          })()
        }
        ,custom:{
           ptype:"custom"
          ,punit:''
          ,pdisplay:"Set your Priorities"
          ,start:20
          ,end:80
          ,dom:null
          ,domId:null
          ,bands:[]
          ,selectedBand:0
          ,criteriaWgt:false
          ,priorityWgt:false
          ,priorityForGroup:[]
          ,priorityBand:(function() {
            var band_1 = {
               school:1
              ,education:1
              ,workplace:1
              ,health:1
              ,commute:1
              ,busstop:1
              ,railwaystation:1
              ,airport:1
              ,higheredu:1
              ,finance:1
              ,shopping:1
              ,entertainment:1
              ,publicservice:1
              ,hotelrest:1
              ,market:1
              ,worshipplace:1
            };
            
            return [ band_1 ];
          })()
        }
      }
      //-- function lists
      ,_createStats:null
      ,_getScores:null
      ,_initCatstats:null
      ,_purgeStats:null
      ,_groupCategories:null
      ,_json2csv:null
      ,_autoSuggest:null
      ,parent:null
      ,isCategory:null
      ,isSubCategory:null
      ,getTimeRange:null
      ,list:null
      ,listName:null
      ,on:null
      ,off:null
      ,disable:null
      ,hide:null
      ,hover:null
      ,reset:null
      ,click:null
      ,setListContentTemplate:null
      ,setListContent:null
      ,getPriority:null
      ,setPriorityBand:null
      ,update:null
      ,updateScore:null
      ,updateStats:null
      ,getCatObj:null
      ,id:null
      ,getTotalOfAllCategories:null
      ,getProjectStats:null
      ,setExplorationAreaStats:null
      ,randomCatIndex:null
      ,triggerRandomCat:null
      ,triggerAllCat:null
      ,setCatState:null
      ,stats2csv:null
      ,addWidget:null
      ,createGraphs:null
      ,checkLimit:null
      ,getData:null
      ,threeD:null
      ,getGeom:null
      ,getEntity:null
      ,getPopUpDescription:null
      ,getPopUpDescription2:null
    };
    
    $.extend( categories, options );
    //if(overrideWithCma && categoryConfig) {
      var configureCatFactory = (function(categories,categoryCodeMap) {
        var catFactory = categoryConfig.allowedCategoryList || {}
        ,gisCategories = {}
        ,valid = {}
        ,allCatId = ""
        ,catIndex = {}
        ,catOrder = []
        ,catCodes = {}
        ,catItemId = {}
        ,catObj = {}
        //lgc
        ,criteria = categories.criteria
        ;
        
        var __createBands = function(options) {
          var bands = []
          ,l = options.priorityBand.length
          ,start = options.start
          ,end = options.end
          ,priorityBandArray = options.priorityBand
          ,step = (end-start)/l
          ,ptype = options.ptype
          ,punit = options.punit
          ,domId = options.domId
          ,dom = options.dom
          ,selectedBand = options.selectedBand;
          
          for(var i=0;i<l;i++) {
            var band = {
              X:start+i*step
              ,Y:start+(i+1)*step
              ,priorityBand:priorityBandArray[i]
              ,groupId:i+1
              ,groupRange:step
              ,noOfGroups:l
              ,index:i
              ,ptype:ptype
              ,punit:punit
              ,domId:domId
              ,dom:dom
              ,selected:(function(selectedBand) {
                if( typeof(selectedBand)!=="undefined" && selectedBand===i ) {
                  return true;
                }else {
                  return false;
                }
              })(selectedBand,i)
            }
            if(ptype==="custom") { band.priorityForGroup = options.priorityForGroup[i]; }
            bands.push(band);
          }
          return bands;
        };
        
        var __priorityRoundOff = function(x) {
          var y = Math.round(x);
          /*
          if ( y > 1 && y % 2===0 && y <=7) { y = y + 1; }
          if ( y > 1 && y <= 3 ) { y = y > 2?3:1; }
          if ( y > 3 && y <= 5 ) { y = y > 4?5:3; }
          if ( y > 5 && y <= 7 ) { y = y > 6?7:5; }
          */
          return y;
        };
        
        var __setPriority = function(options) {
          var band = options.band
          ,priorityBand = band.priorityBand
          ,ptype = band.ptype
          ,i = band.index
          ,pSum=0;
          categories.priority = {};
          for( var cat in categories ) {
            if( categories.hasOwnProperty(cat) && typeof(categories[cat]) === "object" && categories[cat]!==null
            && categories[cat].isCategory ) {
               //create priorities object
               categories.priority[cat] = priorityBand[cat];
              //create dom              
              pSum += categories[cat].priority = priorityBand[cat];
            }
          }
          categories.pSum = pSum;
          return categories;
        };
      
        var _initPriority = function( pBandsRequired ) {
          if( pBandsRequired ) {
            var all = [];
            for( var cOpt in criteria ) {
              if(criteria.hasOwnProperty(cOpt) && cOpt!=="custom" ) {
                criteria[cOpt].bands =   __createBands( criteria[cOpt] );
                all.push( criteria[cOpt].bands );
              }
            }
          }
          
          var customBand = criteria.custom.priorityBand["0"]
          ,pBand = {}
          ,pForGroup = {};
          
          for( var cat in customBand ) {
            if( customBand.hasOwnProperty(cat) && typeof(customBand[cat]) === "number" ) {
              
              if( !pBandsRequired ) {
                pBand[cat] = customBand[cat];
                pForGroup[cat]  = customBand[cat];
              }else {
                var pCatSum = 0
                ,l = all.length
                ,i = 0;
                for(;i<l;i++ ) {
                  var len = all[i].length
                  ,j = 0;
                  for(;j<len;j++) {
                    var band = all[i][j];
                    if (!band.selected) { continue; }
                    if( band.priorityBand.hasOwnProperty(cat) ) {
                      pCatSum += band.priorityBand[cat];
                    }
                  }
                }
                pBand[cat] = __priorityRoundOff(pCatSum/l);
                pForGroup[cat] = pCatSum; 
              }
            }
          }
          
          criteria.custom.priorityBand = [ pBand ];
          criteria.custom.priorityForGroup = [ pForGroup ];
          var bands = criteria.custom.bands = __createBands( criteria.custom );
          
          for( var i=0;i<bands.length;i++ ) {
            __setPriority({
              band: bands[i]
            });
          }
        };
        
        for(var i=0,totalNoOfCategories=(catFactory.length || 0);i<totalNoOfCategories;i++) {
          var cat = nemoCmaMap[catFactory[i].name] || catFactory[i].categoryList;
          //commentout the if-condition in Development to check for mis-match between CMA and Nemo categories
          if( typeof(cat)==="undefined" ) { continue; }
          
          (function(cat,i) {
            var categoryGroupTemplate = {
              display:'catName'
              ,color:'catColor'
              ,isCategory:true
              ,videoPlayed:false
              ,selected:false
              ,isShownInPanel:false
              ,isShownOnMap:false
              ,priority:1
              ,limit:30
              ,maxLimit:30
              ,catGroupLength:0
              ,isAvailable:true
              ,dataStartIndex:0
              ,noOfRecords:0
              ,noData:false//TBD: initialize with null
              ,noMoreData:false//TBD: initialize with null
              ,dataEndIndex:0
              ,domId:undefined
              ,itemId:"catKey"
              ,icon: undefined
              ,index: undefined
              ,called:false
              ,subCatId:"subCatId"
              ,subCatName:"subCatName"
              ,stats:[]
              ,threeDPoi:null
              ,x:32
              ,y:40
            };
            //re-set default category
            if( i===0 ) {
              categories.defaultCategory = cat;
            }
            valid[cat] = {};
            categories[cat] = categoryGroupTemplate;//clone-it?
            categories[cat].color = categories.color? categories.color : ( categoryMap[cat] || categoryCodeMap[cat] || {} ).color || '#c80e12';
            //categories[cat].x = ( categoryMap[cat] || categoryCodeMap[cat] || {} ).x || 32;
            categories[cat].scales = ( categoryMap[cat] || categoryCodeMap[cat] || {} ).scales || defaultScale;
            categories[cat].display = catFactory[i].name;
            categories[cat].noOfRecords = 0;
            categories[cat].limit = 30;
            categories[cat].maxLimit = 30
            categories[cat].noMoreData = false;
            categories[cat].noData = false;
            categories[cat].called = false;
            categories[cat].pageNo = 0;
            categories[cat].dataStartIndex = 0;
            categories[cat].dataEndIndex = 0;
            categories[cat].itemId = cat;
            
            var catIdArray = catFactory[i].categoryList.split(/\s*,\s*/);
            var catGroupLength = catIdArray.length;//0;
            var subCatId = "";
            var subCatName = "";
            
            for(var j=0;j<catIdArray.length;j++) {
              (function(cat,j) {
                var subCategoryTemplate = {
                   domId:"subCat"
                  ,name:"subCatName"
                  ,catId:"catCode"
                  ,itemId:"subCatKey"
                  ,catCenter:0
                  ,lon:0
                  ,lat:0
                  ,distance:2500
                  ,limit:5
                  ,data:[]
                  ,isSubCategory:true
                  ,selected:false
                  ,isShownInPanel:false
                  ,isShownOnMap:false
                };
                var catId = catIdArray[j];
                //comment if-condition in Development to check for mis-match between CMA and Nemo categories
                if(categoryCodeMap[catId]) {
                  var subCat = categoryCodeMap[catId].id;
                  valid[cat][subCat] = subCat;
                  categories[cat][subCat] = subCategoryTemplate;//clone-it?
                  categories[cat][subCat].domId = "subcatItem"+"-"+subCat+"-"+j;
                  categories[cat][subCat].name = categoryCodeMap[catId].name;
                  categories[cat][subCat].scales = categoryCodeMap[catId].scales;
                  categories[cat][subCat].priority = categoryCodeMap[catId].priority || 1;
                  categories[cat][subCat].catId = catId;
                  categories[cat][subCat].itemId = subCat;
                  
                  if(subCatId==="") {
                    subCatId = ','+categories[cat][subCat].catId+',';
                    subCatName = ','+categories[cat][subCat].name+',';
                  }else {
                    subCatId = subCatId + categories[cat][subCat].catId+',';
                    subCatName = subCatName +' '+categories[cat][subCat].name+',';
                  }
                  
                  categories[cat].subCatId = subCatId.substr(1, subCatId.length-2);
                  categories[cat].subCatName = subCatName.substr(1, subCatName.length-2);
                  categories[cat].catGroupLength = catGroupLength;
                  catItemId[cat] = subCatId.substr(1, subCatId.length-2);
                  catObj[cat] = [subCatId,subCatName,catGroupLength];
                  
                  
                  if(allCatId==="") { allCatId = subCatId.substr(1, subCatId.length-2); }
                    else { allCatId = allCatId+','+subCatId.substr(1, subCatId.length-2); }
                }
              })(cat,j);
            }//end of for-loop
            
            gisCategories[catFactory[i].name] = catFactory[i].categoryList;
            
                
            categories[cat].domId = prefix+'-'+cat;
            var x = categories[cat].x
            ,color = categories[cat].color
            ,colorname =  color.substr(1, color.length);
            
            //categories[cat].icon = cat+"-iconx"+x+"-"+colorname+".png";
            categories[cat].icon = i+"-icon.png";
            categories[cat].catButtonImg = i+"-button.png";
            //create embed for each category
            //categories[cat].embed = categories.createEmbed();    
            
            catIndex[i] = cat;
            catOrder.push( cat );
            catCodes[subCatId] = cat;
            categories[cat].index = i;
          })(cat,i);
            
        }//end of for-loop
        
        categories.gisCategories = gisCategories;
        
        //number
        categories.totalNoOfCategories =  catFactory.length;
        //object
        categories.catIndex = catIndex;
        categories.catOrder = catOrder;
        categories.catCodes = catCodes;
        categories.catItemId = catItemId;
        //TBD: catObj subCatName has extra comma to be truncated
        categories.catObj = catObj;
        //String
        categories.allCatId = allCatId;
        categories.prefix = prefix;
        categories.validCategories = valid;
        
        //categoryCodeMap for reference
        categories.categoryCodeMap = categoryCodeMap;
        //categories.uiOptions.wayfinderSearchRequired
        
        _initPriority( false );
        
      })(categories,categoryCodeMap);
    //}
     
    return categories;
  };
  
  root.CategoryFactory = CategoryFactory;
}(this, document, 'vidteq'));