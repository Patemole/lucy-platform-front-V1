jQuery.noConflict();
(function ($, Drupal) {
	
$(function() {


var ai_alert = $.cookie('ai_alert');

if(ai_alert != 'hide') {
 $('.alert-popup .alert').addClass('active');
} else {
 $('.alert-popup .alert-tab').addClass('active');
}

function hidealert() {
 $('.alert-popup .alert').removeClass('active');
 setTimeout(function() {
  $('.alert-popup .alert-tab').addClass('active');
 },500);
 $.cookie('ai_alert', 'hide');
 console.log($.cookie('ai_alert'));
}

$('body').on('click','.alert-popup .alert .alert-close .close',function(){
  hidealert();
  return false;
});

$('body').on('click','.alert-popup .alert-tab',function(){
  console.log('alert tab clicked');
  $(this).removeClass('active');
  setTimeout(function() {
    $('.alert-popup .alert').addClass('active');
  },250);  
  return false;
});

  $('body').on('click','.bios-more-trigger a',function(e){
    var target = $(this).parent().parent().find('.bios.more');
    var btn = $(this).parent();
    var btntext = $(this).find('span');
    if ((target).is(':visible')) {
      $(target).slideUp();
      $(btn).removeClass('active');
      $(btntext).text('Load More');
    } else {
      $(target).slideDown();
      $(btn).addClass('active');
      $(btntext).text('Show Less');
    }
    e.preventDefault();
  });

$('body').on('click','.system-messages .close-status',function(e){
  $(this).parent().hide(250);
  e.preventDefault();
});

// console.log('boo');
//  $('.nav-for-areas-slider').slick({
//   slidesToShow: 10,
//   slidesToScroll: 1,
//   arrows: false,
//   fade: false,
//   asNavFor: '.areas-slider'
// });

$('a').filter(function() {
  return this.hostname && this.hostname !== location.hostname;
}).attr({'target':'_blank','rel':'external'});


$('body').on('click','a[href*="#"]:not([href="#"])', function() {
  var myofffset = 30;
  if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
    var target = $(this.hash);
    target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
    if (target.length) {
    $('html, body').animate({
      scrollTop: target.offset().top - myofffset
    }, 1000);
    return false;
    }
  }
 });

// ------------------------------------------ Fixed Header
var scrolloffset = 24;
var scrolled = false;
// var perscroll = 100 * $(window).scrollTop() / ($(document).height() - $(window).height());
// $("body").get(0).style.setProperty("--percbarwidth", perscroll + '%');
if($(window).scrollTop() > scrolloffset){
  scrolled = true;
  $('body').addClass('header-fixed');
  console.log(scrolled);
} else if($(window).scrollTop() == 0) {
  scrolled = false;
  $('body').removeClass('header-fixed');
  console.log(scrolled);
}

$(window).scroll(function() {
    // var perscroll = 100 * $(window).scrollTop() / ($(document).height() - $(window).height());
    // $("body").get(0).style.setProperty("--percbarwidth", perscroll + '%');  
    if($(window).scrollTop() > scrolloffset){
      scrolled = true;
      $('body').addClass('header-fixed');
    } else if($(window).scrollTop() == 0) {
      scrolled = false;
      $('body').removeClass('header-fixed');
    }
    // if($(window).scrollTop() > 200){
    //   $('.back-to-top').addClass('active');
    // } else {
    //   $('.back-to-top').removeClass('active');
    // }
});

$('body').on('click','.menu-trigger',function(e){
  $(this).toggleClass('active');
  $('.main-nav').toggleClass('active');
  $('body').toggleClass('fixy mobile-active');
  e.preventDefault();
});

inlineSVG.init({
  svgSelector: 'img.svg', // the class attached to all images that should be inlined
  initClass: 'js-inlinesvg', // class added to <html>
}, function () {
  console.log('All SVGs inlined');
});

if($('.page-header .line').length) {
  $('.page-header .line').addClass('active');
}

$('.areas-slider').slick({
  appendArrows: false,
  slidesToShow: 1,
  slidesToScroll: 1,
  // asNavFor: '.matobj-media-main',
  fade: true,
  dots: false,
  centerMode: false,
  focusOnSelect: true
});


$('.areas-main-slider').slick({
  appendArrows: false,
  slidesToShow: 1,
  slidesToScroll: 1,
  // asNavFor: '.matobj-media-main',
  fade: true,
  dots: false,
  centerMode: false,
  focusOnSelect: false,
  draggable: false
});

$('body').on('click','.place-card-more-trigger',function(e){
  console.log('clicked');
  var targ = $(this).parent().parent().find('.card .inner .text .intro');
  $(targ).slideToggle(250,'linear');
  $(this).toggleClass('active');
  e.preventDefault();
});


// $('.nav-for-areas-slider').slick({
//   infinite: false,
//   appendArrows: false,
//   // asNavFor: '.matobj-media-main',
//   fade: false,
//   dots: false,
//   centerMode: false,
//   variableWidth: true
// });

$('body').on('click','.slide-prev', function(){
  $('.areas-slider').slick('slickPrev');
});

$('body').on('click','.slide-next', function(){
  $('.areas-slider').slick('slickNext');
});

$('.slide-alt-prev').on('click', function(){
  $('.areas-slider').slick('slickPrev');
});

$('.slide-alt-next').on('click', function(){
  $('.areas-slider').slick('slickNext');
});


$('body').on('click','.slide-nav-prev', function(){
  $('.nav-for-areas-slider').slick('slickPrev');
});

$('body').on('click','.slide-nav-next', function(){
  $('.nav-for-areas-slider').slick('slickNext');
});

if ($('#home-hero-video').length) {
  console.log('video is here');
  homeheroplayer = new Plyr('#home-hero-video', {
      autoplay: true,
      muted: true,
      captions: { active: false },
      loop: { active: true },
    });  
  console.log(homeheroplayer.playing);
  if ($('.plyr--video').hasClass('plyr--playing')) {
    $('button.hero-pause').show();
    $('button.hero-play').hide();
    console.log('playing');
  } else {
    $('button.hero-pause').hide();
    $('button.hero-play').show();
    console.log('not playing');
  }
  $('body').on('click','button.hero-pause',function(){
    homeheroplayer.play();
    $('button.hero-pause').hide();
    $('button.hero-play').show();
  });
  $('body').on('click','button.hero-play',function(){
    homeheroplayer.pause();
    $('button.hero-pause').show();
    $('button.hero-play').hide();
  });
}

$('.paragraph.news-events .view-news').on('inview', function(event, isInView) {
  console.log('inview: ' + isInView);
  if (isInView) {
    $('body').removeClass('scroll-light');
    $('body').addClass('scroll-dark');
  } else {
    $('body').removeClass('scroll-dark');
    $('body').addClass('scroll-light');
  }
});

$('body:not(.front-page) .paragraph.home-chunk.image-cluster').on('inview', function(event, isInView) {
  console.log('inview: ' + isInView)
  if (isInView) {
    $('body').removeClass('scroll-light');
    $('body').addClass('scroll-dark');
  } else {
    $('body').removeClass('scroll-dark');
    $('body').addClass('scroll-light');
  }
});


$('.page-node-type-area .page-header').on('inview', function(event, isInView) {
  console.log('inview: ' + isInView)
  if (isInView) {
    $('body').removeClass('scroll-light');
    $('body').addClass('scroll-dark');
  } else {
    $('body').removeClass('scroll-dark');
    $('body').addClass('scroll-light');
  }
});

// $('div.areas-slider-wrap').bind('inview', function (event, visible, topOrBottomOrBoth) {
//   console.log(topOrBottomOrBoth);
//   if (visible == true) {
//     console.log('visible');// element is now visible in the viewport
//     if (topOrBottomOrBoth == 'top') {
//       // top part of element is visible
//     } else if (topOrBottomOrBoth == 'bottom') {
//         // $('body').removeClass('dark');
//         $('body').addClass('light');
//     } else {
//       // whole part of element is visible
//     }
//   } else {
//     $('body').removeClass('light');
//     // $('body').addClass('dark');
//   }
// });


$('body').on('click','.insight-card',function(e){
  var modalcontent = $(this).find('.inner').html();
  $('body .insight-modal .modal-inner').html(modalcontent);
  $('body .insight-modal').addClass('active');
  $('.modal-content button.modal-close').focus();
  $('body').addClass('fixy');
  e.preventDefault();
});

$('body').on('click','.modal-close',function(e){
  $('body .insight-modal').removeClass('active');
  // $('body .insight-modal .modal-inner').html('');
  $('body').removeClass('fixy');
  e.preventDefault();
});

$('.nav-for-areas-slider div:nth-child(1) .slick-nav').addClass('active');

$('body').on('click','.nav-for-areas-slider .slick-nav', function(e) {
    $('.nav-for-areas-slider .slick-nav.active').removeClass('active');
    $(this).addClass('active');
    var slidx = $(this).attr('data-slick-index');
    $('.areas-slider').slick('slickGoTo', slidx);
    e.preventDefault();
});

$('.areas-slider').on('beforeChange', function(event, slick, currentSlide, nextSlide){
  $('.nav-for-areas-slider .slick-nav.active').removeClass('active');
  $('.nav-for-areas-slider .slick-nav').each(function(){
    if($(this).attr('data-slick-index') == nextSlide) {
      $(this).addClass('active');
    }
  });
});

$('.nav-for-areas-main-slider div:nth-child(1) .slick-nav').addClass('active');

$('.areas-main-slider-para .slick-nav').on('click', function(e) {
  console.log('boo');
    $('.areas-main-slider-para .slick-nav.active').removeClass('active');
    $(this).addClass('active');
    var slidx = $(this).attr('data-slick-index');
    $('.areas-main-slider').slick('slickGoTo', slidx);
    e.preventDefault();
});

$('.areas-main-slider').on('beforeChange', function(event, slick, currentSlide, nextSlide){
  $('.areas-main-slider-para .slick-nav.active').removeClass('active');
  $('.areas-main-slider-para .slick-nav').each(function(){
    if($(this).attr('data-slick-index') == nextSlide) {
      $(this).addClass('active');
    }
  });
});


$('.slider-main-arrows .slide-prev').on('click', function(){
  $('.areas-main-slider').slick('slickPrev');
});

$('.slider-main-arrows .slide-next').on('click', function(){
  $('.areas-main-slider').slick('slickNext');
});

// Stay above this line sparky
});

})(jQuery, Drupal);