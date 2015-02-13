/**
 * Created by D on 1/5/2015.
 */
/**
 * Created by D on 12/22/2014.
 */
//*file: create a slideshow of images using jQuery
//*
//*(1). have list of images in an array
//*(2). loop through images and at end of image array, play from beginning again
//*(3). eventListener on all award images during non-slideshow page
//*(4). eventListener on centered image when in slideshow mode(click = next image)
//*(5). eventListener on area outside centered image which clears slideshow mode


{
    //*(1). array of award images (src)
    var awardsArray = [];
    var $slideImages = $('#image_container_div').children();
    //push every img's src into the array
    for (var i=0; i < $slideImages.length; i++) {
        //if the field is neither undefined nor null, push it into the array
        if($slideImages.eq(i).attr('src')) {
            awardsArray.push($slideImages.eq(i).attr('src'));
        }
    }

//*(2). loops through images, centering image clicked by user, and darkening screen
//**(a). create image in center of screen and darken rest of screen
    (function createLightBox() {
        //create image (that will be centered) then set its src and add it to the body
        var $lightBoxImg = $("<img src='' id='lightBoxImg'>");

        //style image so that it is centered
        $lightBoxImg.css({

            "max-width": "85%",
            "max-height": "90%",
            position: "fixed",
            top: "50%",
            left: "50%",
            "transform": "translate(-50%, -50%)",
            "z-index": "1001",
            outline: "2px solid #c8961B"
        }).hide();

        //create + style dark transparent overlay
        var $lightBoxOverlay = $("<div id='lightBoxOverlay'></div>");
        $lightBoxOverlay.css({
            width: "100%",
            width: "100vw",
            height: "100%",
            height: "100vh",
            position: "fixed",
            top: "50%",
            left: "50%",
            "transform": "translate(-50%, -50%)",
            "z-index": "1000",
            background: "#000",
            filter: "alpha(opacity=75)",
            "-moz-opacity": "0.75",
            "-khtml-opacity": "0.75",
            opacity: "0.75"
        }).hide();

        //add jQuery elements to body
        $("body").append($lightBoxImg, $lightBoxOverlay);

    })();

    (function addLightBoxListeners(lightBox, backgroundDiv) {

        lightBox = lightBox || $('#lightBoxImg');
        backgroundDiv = backgroundDiv || $("#lightBoxOverlay");
        var intervalStopper = "first time";


        //function for going to the next image in the slideshow
        function goToNextImg() {
            //if a lightbox image is already viewable and being clicked, show next image / clear prev slideshow schedule
            if (intervalStopper !== "first time") {
                clearInterval(intervalStopper);
                nextImage();
            }

            function nextImage() {
                //find out current index of lightbox img
                var currentIndex = awardsArray.indexOf(lightBox.attr("src"));
                //set index to next image src
                currentIndex += 1;
                //check to see if current index is one greater than the last image index.  if it is the last image, set it to 0
                if (currentIndex === awardsArray.length) {
                    currentIndex = 0;
                }
                //change $lightBoxImg to new image
                lightBox.attr("src", awardsArray[currentIndex]);
            }

            //change the displayed image every xxxx milliseconds
            intervalStopper = setInterval(nextImage, 2700);
        }

        //(3)-(5): EVENT LISTENERS
        //*(3). event listeners for awards images

        //a. set the lightBoxImg src to the clicked images src
        //b. show darkened semi-transparent div + lightBoxImg
        function awardsImageHandler() {
            var clickedSrc = $(this).attr("src");
            lightBox.attr('src', clickedSrc).show();
            backgroundDiv.show();
            goToNextImg();
            //remove handlers on awardsImages


        }

        //add all the event listeners
        $("img.photo_album_img").on("click", awardsImageHandler);

        //*(4). listener on centered image
        lightBox.on("click", goToNextImg);

        //*(5). once-clickable listener on dark background
        backgroundDiv.on("click", function () {
            //clear all newly created slide show listeners, newly created overlay div, and lightBoxImg
            //$lightBoxImg hide
            lightBox.hide();
            //hides overlay
            backgroundDiv.hide();
            //reset base conditions (must clear interval or it will continually cycle)
            clearInterval(intervalStopper);
            intervalStopper = "first time";
        })
    })();
}