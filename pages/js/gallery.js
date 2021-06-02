$(window).load(function() {
    //caching some elements
    var $thumbnails_wrapper 	= $('#thumbnails_wrapper'),
        $thumbs					= $thumbnails_wrapper.find('.tshf_container').find('.content'),
        $top_menu				= $('#top_menu'),
        $header					= $('#header'),
        $bubble                 = $('#bubble'),
        $loader					= $('#loader'),
        $preview				= $('#preview'),
        $thumb_images			= $thumbnails_wrapper.find('img'),
        total_thumbs			= $thumb_images.length,
        $next_img				= $('#next_image'),
        $prev_img				= $('#prev_image'),
        $back					= $('#back'),
        $description			= $('#description'),
        //current album and current photo
        //(indexes of the tshf_container and content elements)					
        currentAlbum			= -1,
        currentPhoto			= -1;
    
    //show the loading image until we 
    //preload all the thumb images
    $loader.show();
    //show the main menu and thumbs menu
    openPhotoAlbums();
    
    function openPhotoAlbums(){
        //preload all the thumb images
        var cnt_loaded = 0;
        $thumb_images.each(function(){
            var $thumb 		= $(this);
            var image_src 	= $thumb.attr('src');
            $('<img/>').load(function(){
                ++cnt_loaded;
                if(cnt_loaded == total_thumbs){
                    $loader.hide();
                    createThumbnailScroller();
                    //show the main menu and thumbs menu
                    $header.stop()
                           .animate({'top':'30px'},700,'easeOutBack');
                    $thumbnails_wrapper.stop()
                                       .animate({'top':'110px'},700,'easeOutBack');
                }
            }).attr('src',image_src);
        });
    }
    
    //thumb click event
    $thumbs.bind('click',function(e){
        //show loading image
        $loader.show();
        var $thumb	= $(this),
            //source of the corresponding large image
            img_src = $thumb.find('img.thumb')
                            .attr('src')
                            .replace('/thumbs','');
        
        //track the current album / photo
        currentPhoto= $thumb.index(),
        currentAlbum= $thumb.closest('.tshf_container')
                            .index();
        //displays the current album and current photo
        updateInfo(currentAlbum,currentPhoto);
        //preload the large image
        $('<img/>').load(function(){
            var $this = $(this);
            //record the size that the large image 
            //should have when it is shown
            saveFinalPositions($this);
            //margin_circle is the diameter for the 
            //bubble image
            var w_w				= $(window).width(),
                w_h				= $(window).height(),
                margin_circle	= w_w + w_w/3;
            if(w_h>w_w)
                margin_circle	= w_h + w_h/3;
            
            //the image will be positioned on the center,
            //with width and height of 0px
            $this.css({
                'width'		: '0px',
                'height'	: '0px',
                'marginTop'	: w_h/2 +'px',
                'marginLeft': w_w/2 +'px'
            });
            $preview.append($this);
            
            //hide the header
            $header.stop().animate({'top':'-90px'},400, function(){
                $loader.hide();
                //show the top menu with the back button,
                //and current album/picture info
                $top_menu.stop()
                         .animate({'top':'0px'},400,'easeOutBack');
                //animate the bubble image
                $bubble.stop().animate({
                    'width'		:	margin_circle + 'px',
                    'height'	:	margin_circle + 'px',
                    'marginTop'	:	-margin_circle/2+'px',
                    'marginLeft':	-margin_circle/2+'px'
                },700,function(){
                    //solve resize problem
                    $('BODY').css('background','#FFD800');
                });
                //after 200ms animate the large image
                //and show the navigation buttons
                setTimeout(function(){
                    var final_w	= $this.data('width'),
                        final_h	= $this.data('height');
                    $this.stop().animate({
                            'width'		: final_w + 'px',
                            'height'	: final_h + 'px',
                            'marginTop'	: w_h/2 - final_h/2 + 'px',
                            'marginLeft': w_w/2 - final_w/2 + 'px'
                    },700,showNav);
                    //show the description
                    $description.html($thumb.find('img.thumb').attr('alt'));
                },200);
                
            });
            //hide the thumbs
            $thumbnails_wrapper.stop()
                               .animate({
                                   'top' : w_h+'px'
                               },400,function(){
                                    //solve resize problem
                                    $(this).hide();
                               });
            
        }).attr('src',img_src);
    });
    
    //next button click event
    $next_img.bind('click',function(){
        //increment the currentPhoto
        ++currentPhoto;
        //current album:
        var $album		= $thumbnails_wrapper.find('.tshf_container')
                                             .eq(currentAlbum),
            //the next element / thumb to show
            $next		= $album.find('.content').eq(currentPhoto),
            $current 	= $preview.find('img');
        if($next.length == 0 || $current.is(':animated')){
            --currentPhoto;
            return false;
        }
        else{
            $loader.show();
            updateInfo(currentAlbum,currentPhoto);
            //preload the large image
            var img_src = $next.find('img.thumb')
                               .attr('src')
                               .replace('/thumbs',''),
                w_w		= $(window).width(),
                w_h		= $(window).height();				   
        
            $('<img/>').load(function(){
                var $this = $(this);
                //record the size that the large image 
                //should have when it is shown
                saveFinalPositions($this);
                $loader.hide();
                $current.stop()
                        .animate({'marginLeft':'-'+($current.width()+20)+'px'},500,function(){
                            //the current image gets removed
                            $(this).remove();	
                        });
                //the new image will be positioned on the center,
                //with width and height of 0px
                $this.css({
                    'width'		: '0px',
                    'height'	: '0px',
                    'marginTop'	: w_h/2 +'px',
                    'marginLeft': w_w/2 +'px'
                });
                $preview.prepend($this);
                var final_w	= $this.data('width'),
                    final_h	= $this.data('height');
                $this.stop().animate({
                        'width'		: final_w + 'px',
                        'height'	: final_h + 'px',
                        'marginTop'	: w_h/2 - final_h/2 + 'px',
                        'marginLeft': w_w/2 - final_w/2 + 'px'
                },700);
                //show the description
                $description.html($next.find('img.thumb').attr('alt'));
            }).attr('src',img_src);	
        }
    });
    
    //previous button click event
    $prev_img.bind('click',function(){
        --currentPhoto;
        //current album:
        var $album		= $thumbnails_wrapper.find('.tshf_container')
                                             .eq(currentAlbum),
            $prev		= $album.find('.content').eq(currentPhoto),
            $current 	= $preview.find('img');
        if($prev.length == 0 || $current.is(':animated') || currentPhoto < 0){
            ++currentPhoto;
            return false;
        }
        else{
            $loader.show();
            updateInfo(currentAlbum,currentPhoto);
            //preload the large image
            var img_src = $prev.find('img.thumb')
                               .attr('src')
                               .replace('/thumbs',''),
                w_w				= $(window).width(),
                w_h				= $(window).height();				   
        
            $('<img/>').load(function(){
                var $this = $(this);
                //record the size that the large image 
                //should have when it is shown
                saveFinalPositions($this);
                
                $loader.hide();
                $current.stop()
                        .animate({'marginLeft':(w_w+20)+'px'},500,function(){
                            //the current image gets removed
                            $(this).remove();
                        });
                //the new image will be positioned on the center,
                //with width and height of 0px
                $this.css({
                    'width'		: '0px',
                    'height'	: '0px',
                    'marginTop'	: w_h/2 +'px',
                    'marginLeft': w_w/2 +'px'
                });
                $preview.append($this);
                var final_w	= $this.data('width'),
                    final_h	= $this.data('height');
                $this.stop().animate({
                        'width'		: final_w + 'px',
                        'height'	: final_h + 'px',
                        'marginTop'	: w_h/2 - final_h/2 + 'px',
                        'marginLeft': w_w/2 - final_w/2 + 'px'
                },700);
                //show the description
                $description.html($prev.find('img.thumb').attr('alt'));							
            }).attr('src',img_src);	
        }
    });
    
    //on window resize we recalculate the sizes of the current image
    $(window).resize(function(){
        var $current = $preview.find('img'),
            w_w		 = $(window).width(),
            w_h		 = $(window).height();		
        if($current.length > 0){
            saveFinalPositions($current);
            var final_w	= $current.data('width'),
                final_h	= $current.data('height');
            $current.css({
                'width'		: final_w + 'px',
                'height'	: final_h + 'px',
                'marginTop'	: w_h/2 - final_h/2 + 'px',
                'marginLeft': w_w/2 - final_w/2 + 'px'
            });
        }
    });
    
    //back button click event
    $back.bind('click',closePreview)
    
    //shows the navigation buttons
    function showNav(){
        $next_img.stop().animate({
            'right'	: '10px'
        },300);
        $prev_img.stop().animate({
            'left'	: '10px'
        },300);
    }
    
    //hides the navigation buttons
    function hideNav(){
        $next_img.stop().animate({
            'right'	: '-50px'
        },300);
        $prev_img.stop().animate({
            'left'	: '-50px'
        },300);
    }
    
    //updates the current album and current photo info
    function updateInfo(album,photo){
        $top_menu.find('.album_info')
                 .html('Album ' + (album+1))
                 .end()
                 .find('.image_info')
                 .html(' / Shot ' + (photo+1))
    }
    
    //calculates the final width and height 
    //of an image about to expand
    //based on the window size
    function saveFinalPositions($image){
        var theImage 	= new Image();
        theImage.src 	= $image.attr("src");
        var imgwidth 	= theImage.width;
        var imgheight 	= theImage.height;
        
        //140 is 2*60 of next/previous buttons plus 20 of extra margin
        var containerwidth 	= $(window).width() - 140;
        //150 is 30 of header + 30 of footer + extra 90 
        var containerheight = $(window).height() - 150;
        
        if(imgwidth	> containerwidth){
            var newwidth = containerwidth;
            var ratio = imgwidth / containerwidth;
            var newheight = imgheight / ratio;
            if(newheight > containerheight){
                var newnewheight = containerheight;
                var newratio = newheight/containerheight;
                var newnewwidth =newwidth/newratio;
                theImage.width = newnewwidth;
                theImage.height= newnewheight;	
            }
            else{
                theImage.width = newwidth;
                theImage.height= newheight;	
            }
        }
        else if(imgheight > containerheight){
            var newheight = containerheight;
            var ratio = imgheight / containerheight;
            var newwidth = imgwidth / ratio;
            if(newwidth > containerwidth){
                var newnewwidth = containerwidth;
                var newratio = newwidth/containerwidth;
                var newnewheight =newheight/newratio;
                theImage.height = newnewheight;
                theImage.width= newnewwidth;	
            }
            else{
                theImage.width = newwidth;
                theImage.height= newheight;	
            }
        }
        $image.data({'width':theImage.width,'height':theImage.height});		
    }
    
    //triggered when user clicks the back button.
    //hides the current image and the bubble image,
    //and shows the main menu and the thumbs 
    function closePreview(){
        var $current = $preview.find('img'),
            w_w		 = $(window).width(),
            w_h		 = $(window).height(),
            margin_circle	= w_w + w_w/3;
            
        if(w_h>w_w)
            margin_circle	= w_h + w_h/3;
        
        if($current.is(':animated'))
            return false;
        //hide the navigation
        hideNav();
        //hide the topmenu
        $top_menu.stop()
                 .animate({'top':'-30px'},400,'easeOutBack');
        //hide the image
        $current.stop().animate({
            'width'		: '0px',
            'height'	: '0px',
            'marginTop'	: w_h/2 +'px',
            'marginLeft': w_w/2 +'px'
        },700,function(){
            $(this).remove();
        });
        //animate the bubble image
        //first set the positions correctly - 
        //it could have changed on a window resize
        setTimeout(function(){
            $bubble.css({
                'width'		 :	margin_circle + 'px',
                'height'	 :	margin_circle + 'px',
                'margin-top' :	-margin_circle/2+'px',
                'margin-left':	-margin_circle/2+'px'
            });
            $('BODY').css('background','url("bg.jpg") repeat scroll left top #222222');
            $bubble.animate({
                'width'		:	'0px',
                'height'	:	'0px',
                'marginTop'	:	'0px',
                'marginLeft':	'0px'
            },500);
        },200);
        setTimeout(function(){
            $header.stop()
                   .animate({'top':'30px'},700,'easeOutBack');
            $thumbnails_wrapper.stop()
                               .show()	
                               .animate({'top':'110px'},700,'easeOutBack');
        },600);
    }
    
    //builds the scrollers for the thumbs
    //done by Manos 
    //(http://manos.malihu.gr/jquery-thumbnail-scroller)
    function createThumbnailScroller(){
        /*
        ThumbnailScroller function parameters:
        1) id of the container (div id)
        2) thumbnail scroller type. Values: "horizontal", "vertical"
        3) first and last thumbnail margin (for better cursor interaction)
        4) scroll easing amount (0 for no easing)
        5) scroll easing type
        6) thumbnails default opacity
        7) thumbnails mouseover fade speed (in milliseconds)
        */
        ThumbnailScroller("tshf_container1","horizontal",10,800,"easeOutCirc",0.5,300);
        //ThumbnailScroller("tshf_container2","horizontal",10,800,"easeOutCirc",0.5,300);
        //ThumbnailScroller("tshf_container3","horizontal",10,800,"easeOutCirc",0.5,300);
    }
        
});