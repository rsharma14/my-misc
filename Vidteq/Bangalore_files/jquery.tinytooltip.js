/*
	Kailash Nadh (http://kailashnadh.name)
	tinytooltip | March 2012
	A tiny tooltip plugin for jQuery
	Refactored on 15 September 2013
	License	:	MIT License
*/
(function($) {
	$.fn.tinytooltip = function(args) {
    //console.log("tiny tool tip entered");
		// default options
		var options = {
			message:''
			,hover:true
			,classes:''
			,container:'body'
		};
		if(args) {
			$.extend(options, args);
		}
    //console.log('arg',args);console.log("tiny tool tip entered  2");console.log(this.length);
    return this.each(function(){
			var me = $(this);
			me.bind( (options.hover ? 'mouseover ' : '') + 'showtooltip', function() {
        if( me.data('tinyactive') ) {
					clearTimeout(me.timer);
					return;
				}
				me.data('tinyactive', 1);
				render(me);
			});
			me.bind( (options.hover ? 'mouseout ' : '') + 'hidetooltip', function() {
        clearTimeout(me.timer);
				me.timer = setTimeout(function() {
					me.data('tinyactive', '');
					destroy(me);
				}, 100);
			});
		});

		function render(me) {
      //console.log("render called");
			// parent's position
			var pos = me.offset();	
			// tooltip html
			var tip = $('<div class="tinytooltip'+ (options.classes ? ' ' + options.classes : '') +'">');
      tip.append('<div class="arrow">');
      tip.append(
        $('<div class="message">').append( typeof options.message == "function" ? options.message.call(me, tip) : options.message )
      );
			tip.css('opacity', 0).hide();
      var el_container = $( options.container );
			el_container.append(tip);
			// position the tooltip beside the parent
      // TBD this is highly tuned for venue360 beware !!
      // check if coords is present then apply
      if( me.context.coords ) {
        var coordArray = (me.context.coords).split(",");
        var myPos = me.parent().parent().offset();
        var myLeft = myPos.left + parseInt(coordArray[0])+15;
        var myTop = myPos.top + parseInt(coordArray[1])+15;
      }else {
        //console.log("I am inside");console.log(pos);
        var myLeft = 30+parseInt(pos.left) + (me.outerWidth()/2) - (tip.outerWidth()/2);
        var myTop = 30+parseInt(pos.top) + me.outerHeight();
      }
      //console.log("insde and ");console.log(myLeft);console.log(myTop);
			tip.css('left', myLeft);
			tip.css('top', myTop);
      el_container.offsetWidth
			//tip.css('left', myPos.left + parseInt(coordArray[0])+15);
			//tip.css('top', myPos.top + parseInt(coordArray[1])+15);
      //tip.css('left', pos.left + (me.outerWidth()/2) - (tip.outerWidth()/2));
			//tip.css('top', pos.top + me.outerHeight());
			me.data('tinytooltip', tip);
			tip.show().animate({opacity: 1}, 200);
		}

		function destroy(me) {
			var tip = me.data('tinytooltip');
			if(tip) {
				tip.animate({opacity: 0}, 200, function() {
					$(this).remove();
				});
			}
		}
	};
	return this;
})(jQuery);